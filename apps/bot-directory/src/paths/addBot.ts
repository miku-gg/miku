import fs from 'fs';
import { Express, Request, Response } from "express";
import { BotConfig, MikuCard, validateBotConfig, validateMikuCard } from "../../../../packages/bot-validator/dist";
import * as Miku from "@mikugg/extensions";
import config from '../config';
import AdmZip from "adm-zip";
import { assert } from 'console';
const Hash = require('ipfs-only-hash');

// async function getScenariosTriggerEmbeddingsHash (card: MikuCard): Promise<string> {
//   const { scenarios } = card.data.extensions.mikugg;

//   if (scenarios.length < 2) {
//     return '';
//   }
  
//   return await Hash.of(
//     scenarios
//       .map((scenario) => scenario.trigger_suggestion_similarity)
//       .sort()
//   );
// }

async function validateSources(card: MikuCard): Promise<string[]> {
  const { mikugg } = card.data.extensions;

  const validations: {name: string, source: string}[] = [
    {
      name: 'mikugg.profile_pic',
      source: mikugg.profile_pic,
    },
    ...mikugg.backgrounds.map((bg) => {
      return  {
        name: `mikugg.backgrouds.${bg.id}`,
        source: bg.source,
      };
    }),
    ...mikugg.emotion_groups.flatMap((emotion_group) => {
      return emotion_group.emotions.flatMap((emotion) => {
        return emotion.source.map(_source => {
          return {
            name: `mikugg.emotions_groups.emotions.${emotion.id}`,
            source: _source,
          }
        })
      })
    })
  ];

  return validations.filter(validation => {
    const sourcePath = `${config.IMG_PATH}/${validation.source}`;
    if (!fs.existsSync(sourcePath)) {
      return true;
    } else {
      return false;
    }
  }).map((_validation) => {
    return `Not found ${_validation.name}: ${_validation.source}`;
  });
}

async function installMikuCardFile(fileContent: string): Promise<{
  success: boolean,
  errors: string[],
}> {
  try {
    const card = JSON.parse(fileContent) as MikuCard
    const errors = validateMikuCard(card);
    if (errors.length) {
      return {
        success: false,
        errors,
      };
    }

    const sourceErrors = await validateSources(card);
    if (sourceErrors.length) {
      return {
        success: false,
        errors,
      };
    }

    const hash = await Hash.of(fileContent);
    const botPath = `${config.BOT_PATH}/${hash}`;
    if (fs.existsSync(botPath)) {
      throw 'Bot already exists';
    }
    fs.writeFileSync(botPath, fileContent);

    // TODO: generate embeddings file for context switching

    return {
      success: true,
      errors: []
    }
  } catch (e) {
    console.error(e);
    return {
      success: false,
      errors: [`${e}`]
    }
  }
}


// Registers a bot configuration
export default async function addBot(req: Request, res: Response) {
  try {
    const file = req.file;
    if (!file?.path) throw 'file not found';

    if (req.file?.filename.endsWith('.json')) {
      const fileContent = file.buffer.toString('utf8');
      await installMikuCardFile(fileContent);
    } else {
      const zip = new AdmZip(file.path);
      let cardContent: string = '';
      await Promise.all(zip.getEntries().map(async (entry) => {
        if (entry.isDirectory) return;
        if (entry.comment === 'Card') {
          cardContent = entry.getData().toString('utf8');
        } else if (entry.comment === 'Emotions Embeddings') {
          // const data = entry.getData().toString('utf8');
          // const hash = await Hash.of(data);
          // assert(entry.name === hash, `Hash mismatch for Emotions Embeddings`);
          // const botPath = `${config.EMBEDDINGS_PATH}/${hash}`;
          // if (!fs.existsSync(botPath)) {
          //   await fs.writeFileSync(botPath, data);
          // }
        } else {
          const data = entry.getData().toString('base64');
          const hash = await Hash.of(data);
          assert(entry.name === hash, `Hash mismatch for ${entry.name}`);
          const imgPath = `${config.IMG_PATH}/${hash}`;
          if (!fs.existsSync(imgPath)) {
            await fs.writeFileSync(imgPath, Buffer.from(data, 'base64'), 'binary');
          }
        }
      }))
      await installMikuCardFile(cardContent);
    }
    res.redirect('/');
    res.end();
    
  } catch (err) {
    res.status(400).send(err);
    return;
  }
  
}
