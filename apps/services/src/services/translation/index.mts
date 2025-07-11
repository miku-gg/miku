import { Request, Response } from 'express';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import modelServerSettingsStore from '../text/lib/modelServerSettingsStore.mjs';

// Define minimal types needed for translation
interface NovelState {
  title?: string;
  description?: string;
  language?: string;
  characters?: any[];
  backgrounds?: any[];
  songs?: any[];
  scenes?: any[];
  starts?: any[];
  objectives?: any[];
  inventory?: any[];
  maps?: any[];
  lorebooks?: any[];
  cutscenes?: any[];
}

// Define the list of languages to translate to
const languageCodeToName = new Map([
  ['es', 'Spanish'],
  ['es_ar', 'Spanish (Argentina)'],
  ['pt', 'Portuguese'],
  ['pt_br', 'Portuguese (Brazil)'],
  ['fr', 'French'],
  ['de', 'German'],
  ['ru', 'Russian'],
  ['jp', 'Japanese'],
  ['pl', 'Polish'],
]);

const languageCodeToExtraPrompt = new Map([
  ['es', 'Use typical Spanish expressions and vocabulary.'],
  ['es_ar', 'Use typical Argentinean Spanish expressions and vocabulary.'],
  ['pt', 'Use typical Portuguese expressions and vocabulary.'],
  ['pt_br', 'Use typical Brazilian Portuguese expressions and vocabulary.'],
  ['fr', 'Use typical French expressions and vocabulary.'],
  ['de', 'Use typical German expressions and vocabulary.'],
  ['ru', 'Use typical Russian expressions and vocabulary.'],
  ['jp', 'Use typical Japanese expressions and vocabulary.'],
  ['pl', 'Use typical Polish expressions and vocabulary.'],
]);

const translationHandler = async (req: Request, res: Response) => {
  const { jsonName, language } = req.body;

  if (!jsonName || !language) {
    return res.status(400).json({ error: 'jsonName and language are required' });
  }

  if (!languageCodeToName.has(language)) {
    return res.status(400).json({ error: 'Unsupported language' });
  }

  const translatorAssistant = modelServerSettingsStore.getTranslatorAssistant();

  const downloadEndpoint = process.env.NOVEL_DOWNLOAD_ENDPOINT;
  const apiEndpoint = translatorAssistant.endpoint.url;
  const apiKey = translatorAssistant.endpoint.api_key;
  const model = translatorAssistant.endpoint.model;
  const hasReasoning = translatorAssistant.has_reasoning;

  if (!downloadEndpoint || !apiEndpoint || !apiKey) {
    return res.status(500).json({ error: 'Missing required environment variables' });
  }

  // Set up Server-Sent Events
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': req.headers.origin || '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*',
    'Access-Control-Allow-Credentials': 'true',
  });

  let prevProgress = 0;

  const sendProgress = (percentage: number) => {
    if (percentage > prevProgress) {
      res.write(`data: ${JSON.stringify({ type: 'progress', percentage })}\n\n`);
      prevProgress = percentage;
    }
  };

  const sendComplete = (filename: string) => {
    res.write(`data: ${JSON.stringify({ type: 'complete', filename })}\n\n`);
    res.end();
  };

  const sendError = (error: string) => {
    res.write(`data: ${JSON.stringify({ type: 'error', error })}\n\n`);
    res.end();
  };

  try {
    // Download the JSON file
    sendProgress(0);
    const downloadUrl = `${downloadEndpoint}/${jsonName}`;
    const response = await axios.get(downloadUrl);
    const novelData = response.data;

    // Extract texts for translation
    const textsToTranslate = extractTexts(novelData);
    const totalTexts = textsToTranslate.length;
    let translatedCount = 0;

    sendProgress(5);

    // Process translations in batches
    const batchSize = 50;
    const translatedTexts: { path: string; translatedText: string }[] = [];

    for (let i = 0; i < textsToTranslate.length; i += batchSize) {
      const batch = textsToTranslate.slice(i, i + batchSize);
      const batchTranslations = await Promise.all(
        batch.map(async ({ path, text }) => {
          const translatedText = await translateText(text, language, apiEndpoint, apiKey, model, hasReasoning);
          translatedCount++;
          const progress = 5 + (translatedCount / totalTexts) * 90; // Reserve 5% for download and 5% for file saving
          sendProgress(Math.round(progress));
          return { path, translatedText };
        }),
      );
      translatedTexts.push(...batchTranslations);

      // Add a 10-second delay between batches
      if (i + batchSize < textsToTranslate.length) {
        await new Promise((resolve) => setTimeout(resolve, 10000));
      }
    }

    // Apply translations back to the novel data
    const translatedNovelData = applyTranslations(novelData, translatedTexts);
    translatedNovelData.language = language;

    sendProgress(95);

    // Generate random number and create filename
    const randomNumber = Math.floor(Math.random() * 100000);
    const baseFilename = jsonName.replace('.json', '');
    const outputFilename = `${baseFilename}_${randomNumber}_${language}.json`;

    // Ensure the temp directory exists
    const tempDir = path.join(process.cwd(), 'temp');
    await fs.mkdir(tempDir, { recursive: true });

    // Save the translated file
    const outputPath = path.join(tempDir, outputFilename);
    await fs.writeFile(outputPath, JSON.stringify({ novel: translatedNovelData, version: 'v3' }, null, 2));

    sendProgress(100);
    sendComplete(outputFilename);
  } catch (error) {
    console.error('Translation error:', error);
    sendError(error instanceof Error ? error.message : 'Unknown error occurred');
  }
};

const extractTexts = (novel: NovelState) => {
  const texts: { path: string; text: string }[] = [];

  // Helper function to push text to the array
  const pushText = (path: string, text: string | undefined) => {
    if (text) {
      texts.push({ path, text });
    }
  };

  // Collect texts from novel
  pushText('title', novel.title);
  pushText('description', novel.description);
  // Collect texts from characters
  novel.characters?.forEach((character: any, charIndex: number) => {
    pushText(`characters[${charIndex}].name`, character.name);
    pushText(`characters[${charIndex}].short_description`, character.short_description);
    const card = character.card;
    if (card?.data) {
      pushText(`characters[${charIndex}].card.data.description`, card.data.description);
      pushText(`characters[${charIndex}].card.data.personality`, card.data.personality);
      pushText(`characters[${charIndex}].card.data.scenario`, card.data.scenario);
      pushText(`characters[${charIndex}].card.data.first_mes`, card.data.first_mes);
      pushText(`characters[${charIndex}].card.data.mes_example`, card.data.mes_example);
      pushText(`characters[${charIndex}].card.data.creator_notes`, card.data.creator_notes);
      pushText(`characters[${charIndex}].card.data.system_prompt`, card.data.system_prompt);
      pushText(`characters[${charIndex}].card.data.post_history_instructions`, card.data.post_history_instructions);
      card.data.tags?.forEach((tag: any, tagIndex: number) => {
        pushText(`characters[${charIndex}].card.data.tags[${tagIndex}]`, tag);
      });
      card.data.alternate_greetings?.forEach((greeting: any, greetIndex: number) => {
        pushText(`characters[${charIndex}].card.data.alternate_greetings[${greetIndex}]`, greeting);
      });
      card.data.extensions.mikugg_v2.outfits?.forEach((outfit: any, outfitIndex: number) => {
        pushText(
          `characters[${charIndex}].card.data.extensions.mikugg_v2.outfits[${outfitIndex}].description`,
          outfit.description,
        );
      });
    }
  });
  // Collect texts from backgrounds
  novel.backgrounds?.forEach((background: any, bgIndex: number) => {
    pushText(`backgrounds[${bgIndex}].description`, background.description);
  });
  // Collect texts from songs
  novel.songs?.forEach((song: any, songIndex: number) => {
    pushText(`songs[${songIndex}].name`, song.name);
    pushText(`songs[${songIndex}].description`, song.description);
  });
  // Collect texts from scenes
  novel.scenes?.forEach((scene: any, sceneIndex: number) => {
    pushText(`scenes[${sceneIndex}].name`, scene.name);
    pushText(`scenes[${sceneIndex}].description`, scene.description);
    pushText(`scenes[${sceneIndex}].prompt`, scene.prompt);
    pushText(`scenes[${sceneIndex}].actionText`, scene.actionText);
    pushText(`scenes[${sceneIndex}].hint`, scene.hint);
  });
  // Collect texts from starts
  novel.starts?.forEach((start: any, startIndex: number) => {
    pushText(`starts[${startIndex}].title`, start.title);
    pushText(`starts[${startIndex}].description`, start.description);
    start.characters?.forEach((character: any, charIndex: number) => {
      pushText(`starts[${startIndex}].characters[${charIndex}].text`, character.text);
    });
  });
  // Collect texts from objectives
  novel.objectives?.forEach((objective: any, objIndex: number) => {
    pushText(`objectives[${objIndex}].name`, objective.name);
    pushText(`objectives[${objIndex}].description`, objective.description);
    pushText(`objectives[${objIndex}].hint`, objective.hint);
  });
  // Collect texts from inventory
  novel.inventory?.forEach((item: any, itemIndex: number) => {
    pushText(`inventory[${itemIndex}].name`, item.name);
    pushText(`inventory[${itemIndex}].description`, item.description);
    item.actions?.forEach((action: any, actionIndex: number) => {
      pushText(`inventory[${itemIndex}].actions[${actionIndex}].name`, action.name);
      pushText(`inventory[${itemIndex}].actions[${actionIndex}].prompt`, action.prompt);
    });
  });
  novel.maps?.forEach((map: any, mapIndex: number) => {
    pushText(`maps[${mapIndex}].name`, map.name);
    pushText(`maps[${mapIndex}].description`, map.description);
    map.places?.forEach((place: any, placeIndex: number) => {
      pushText(`maps[${mapIndex}].places[${placeIndex}].name`, place.name);
      pushText(`maps[${mapIndex}].places[${placeIndex}].description`, place.description);
    });
  });
  novel.lorebooks?.forEach((lorebook: any, lorebookIndex: number) => {
    pushText(`lorebooks[${lorebookIndex}].name`, lorebook.name);
    if (lorebook.description) pushText(`lorebooks[${lorebookIndex}].description`, lorebook.description);
    lorebook.entries?.forEach((entry: any, entryIndex: number) => {
      pushText(`lorebooks[${lorebookIndex}].entries[${entryIndex}].content`, entry.content);
      entry.keys.forEach((key: any, keyIndex: number) => {
        pushText(`lorebooks[${lorebookIndex}].entries[${entryIndex}].keys[${keyIndex}]`, key);
      });
    });
  });

  novel.cutscenes?.forEach((cutscene: any, cutsceneIndex: number) => {
    cutscene.parts?.forEach((part: any, partIndex: number) => {
      part.text.forEach((text: any, textIndex: number) => {
        pushText(`cutscenes[${cutsceneIndex}].parts[${partIndex}].text[${textIndex}].content`, text.content);
      });
    });
  });

  return texts;
};

const applyTranslations = (novel: NovelState, translations: { path: string; translatedText: string }[]) => {
  const translatedNovel = JSON.parse(JSON.stringify(novel)); // Deep copy
  translations.forEach(({ path, translatedText }) => {
    const pathParts = path.split(/[\.\[\]]/).filter((part) => part !== '');
    let obj: any = translatedNovel;
    for (let i = 0; i < pathParts.length - 1; i++) {
      obj = obj[pathParts[i]];
    }
    obj[pathParts[pathParts.length - 1]] = translatedText;
  });
  return translatedNovel;
};

const translateExampleShots = (languageKey: string, hasReasoning: boolean) => {
  return [
    { role: 'user', content: 'Roxy is a magic tutor' },
    {
      role: 'assistant',
      content:
        `${hasReasoning ? '<think></think>\n' : ''}TRANSLATION:\n` +
        (() => {
          switch (languageKey) {
            case 'es':
              return 'Roxy es un tutor de magia';
            case 'es_ar':
              return 'Roxy es una tutora de magia';
            case 'pt':
              return 'Roxy é um tutor de magia';
            case 'pt_br':
              return 'Roxy é uma tutora de magia';
            case 'fr':
              return 'Roxy est un tutor de magie';
            case 'de':
              return 'Roxy ist ein Zauberschüler';
            case 'ru':
              return 'Roxy - маг-учитель';
            case 'jp':
              return 'Roxyは魔法の先生です';
            case 'pl':
              return 'Roxy jest nauczycielem magii';
            default:
              return '';
          }
        })(),
    },
    {
      role: 'user',
      content: `Roxy = [Calm, Collected, Headstrong, Wise, Gentle, Intelligent, Rational, Clumsy, Slightly Reserved., Sleepy]`,
    },
    {
      role: 'assistant',
      content:
        'TRANSLATION:\n' +
        (() => {
          switch (languageKey) {
            case 'es':
              return `Roxy = [Calmada, Colectada, Cabeza dura, Inteligente, Amable, Intelectual, Racional, Clave, Dormilona]`;
            case 'es_ar':
              return `Roxy = [Calma, Colectada, Cabeza dura, Inteligente, Amable, Intelectual, Racional, Clave, Dormilona]`;
            case 'pt':
              return `Roxy = [Calma, Coletada, Cabeça dura, Inteligente, Amável, Intelectual, Racional, Clave, Dormilona]`;
            case 'pt_br':
              return `Roxy = [Calma, Coletada, Cabeça dura, Inteligente, Amável, Intelectual, Racional, Clave, Dormilona]`;
            case 'fr':
              return `Roxy = [Calme, Collectée, Tête dure, Intelligente, Amable, Intelligente, Rationnelle, Maladroit, Légèrement réservée, Endormie]`;
            case 'de':
              return `Roxy = [Gemütlich, Sammler, Hartnäckig, Klug, Zart, Intelligenter, Rational, Klumpig, Leicht reserviert, Schlafend]`;
            case 'ru':
              return `Roxy = [Спокойная, Собранная, Настойчивая, Мудрая, Доброжелательная, Умная, Рациональная, Неловкая, Слегка замкнутая, Спящая]`;
            case 'jp':
              return `Roxy = [冷静, 集まり, 頭が固い, 賢い, 優しい, 知性, 合理的, 不器用, 少し控えめ, 眠っている]`;
            case 'pl':
              return `Roxy = [Spokojna, Zbierana, Trudna, Mądra, Dobra, Inteligentna, Racionalna, Niezdolna, Trochę rezerwowana, Spoczywająca]`;
            default:
              return '';
          }
        })(),
    },
  ];
};

const translateText = async (
  text: string,
  languageKey: string,
  apiEndpoint: string,
  apiKey: string,
  model: string,
  hasReasoning: boolean,
  tries = 0,
): Promise<string> => {
  try {
    const targetLanguage = languageCodeToName.get(languageKey);
    const extraPrompt = languageCodeToExtraPrompt.get(languageKey);

    const messages = [
      {
        role: 'system',
        content: `Translate the following text to ${targetLanguage}. This text for a visual novel narration. ${extraPrompt}, but do NOT translate content inside curly braces {} or angle brackets <>. Respond only with the translated text.`,
      },
      ...translateExampleShots(languageKey, hasReasoning),
      {
        role: 'user',
        content: text,
      },
      {
        role: 'assistant',
        content: `${hasReasoning ? '<think></think>\n' : ''}TRANSLATION:\n`,
      },
    ];

    const response = await axios.post(
      `${apiEndpoint}/chat/completions`,
      {
        model,
        messages: messages,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
      },
    );

    if (response.status !== 200) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const translatedText = response.data.choices[0].message.content
      .replace('TRANSLATION:\n', '')
      .replace('<think></think>\n', '')
      .trim();
    return translatedText;
  } catch (e) {
    if (tries < 3) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * (tries + 1))); // Progressive delay
      return translateText(text, languageKey, apiEndpoint, apiKey, model, hasReasoning, tries + 1);
    }
    throw e;
  }
};

export default translationHandler;
