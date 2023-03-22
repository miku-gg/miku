import fs from 'fs';
import { Express, Request, Response } from "express";
import { BotConfig, validateBotConfig } from "../../../../packages/bot-validator/dist";
import * as Miku from "@mikugg/extensions";
import config from '../config';
import AdmZip from "adm-zip";
const Hash = require('ipfs-only-hash');


// Registers a bot configuration
export default async function buildBot(req: Request, res: Response) {
  try {
    const botConfig: BotConfig = {
      "bot_name": req.body.bot_name,
      "version": req.body.version,
      "description": req.body.description,
      "author": req.body.author,
      "configVersion": 1,
      "subject": req.body.subject,
      "profile_pic": '',
      "background_pic": '',
      "short_term_memory": {
          "service": Miku.Services.ServicesNames.GPTShortTermMemory,
          "props": {
              "prompt_context": req.body.context,
              "prompt_initiator": req.body.initiator,
              "language": 'en',
              "subjects": [req.body.subject],
              "botSubject": req.body.bot_name
        }
      },
      "prompt_completer": {
          "service": req.body.model === 'pygmalion-6b' ? Miku.Services.ServicesNames.Pygmalion : Miku.Services.ServicesNames.OpenAI,
          "props": {
            "model": req.body.model
          }
      },
      "outputListeners": [
          {
              "service": req.body.tts,
              "props": {
                  "voiceId": req.body.voiceId
              }
          },
          {
              "service": Miku.Services.ServicesNames.OpenAIEmotionInterpreter,
              "props": {
                  "images": {}
              }
          }
      ]  
    };
    const files = Array(req.files) || [];
    const zip = new AdmZip();

    // @ts-ignore
    await Promise.all(files[0].map(async (_file) => {
      // @ts-ignore
      const file = _file as Express.Multer.File;
      const f = fs.readFileSync(file.path, 'base64');
      const hash = await Hash.of(f) as string;
      fs.renameSync(file.path, `_temp/${hash}`);
      if (file.fieldname === 'profile_pic') {
        botConfig.profile_pic = hash;
      } else if (file.fieldname === 'background_pic') {
        botConfig.background_pic = hash;
      } else {
        // @ts-ignore
        botConfig.outputListeners[1].props.images[file.fieldname] = hash;
      }
      zip.addFile('images/' + hash, Buffer.from(f, 'base64'), file.fieldname);
    }));
    validateBotConfig(botConfig);
    // res.send(JSON.stringify(req.body));
    const _botConfigString = JSON.stringify(botConfig);
    let botHash = await Hash.of(_botConfigString) as string;
    zip.addFile(`${botHash}`, Buffer.from(_botConfigString, 'utf8'), 'Bot Config');
    const zipFileContents = zip.toBuffer();
    res.writeHead(200, {
      'Content-Disposition': `attachment; filename="${req.body.bot_name}_${botHash}.miku"`,
      'Content-Type': 'application/zip',
      'Location': '/'
    })
    return res.end(zipFileContents);
  } catch (err) {
    res.status(400).send(err);
    return;
  }
  
}
