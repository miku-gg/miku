import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Button, Input, Dropdown } from '@mikugg/ui-kit';
import { NovelV3 } from '@mikugg/bot-utils';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.scss';

type NovelState = NovelV3.NovelState;

// Define the list of languages to translate to
const languageCodeToName = new Map([
  ['es', 'Spanish'],
  ['es_ar', 'Spanish (Argentina)'],
  ['es_la', 'Spanish (Latin America)'],
  ['es_cl', 'Spanish (Chile)'],
  ['pt', 'Portuguese'],
  ['pt_br', 'Portuguese (Brazil)'],
  ['fr', 'French'],
  ['de', 'German'],
  ['ru', 'Russian'],
  ['jp', 'Japanese'],
]);

const languageCodeToExtraPrompt = new Map([
  ['es', 'Use typical Spanish expressions and vocabulary.'],
  ['es_ar', 'Use typical Argentinean Spanish expressions and vocabulary.'],
  ['es_la', 'Use typical Latin American Spanish expressions and vocabulary.'],
  ['es_cl', 'Use typical Chilean Spanish expressions and vocabulary.'],
  ['pt', 'Use typical Portuguese expressions and vocabulary.'],
  ['pt_br', 'Use typical Brazilian Portuguese expressions and vocabulary.'],
  ['fr', 'Use typical French expressions and vocabulary.'],
  ['de', 'Use typical German expressions and vocabulary.'],
  ['ru', 'Use typical Russian expressions and vocabulary.'],
  ['jp', 'Use typical Japanese expressions and vocabulary.'],
]);

const BotTranslator = () => {
  const [file, setFile] = useState<File | null>(null);
  const [openAIKey, setOpenAIKey] = useState(localStorage.getItem('openAIKey') || '');
  const [language, setLanguage] = useState(0);
  const [expandedLanguage, setExpandedLanguage] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const languageOptions = Array.from(languageCodeToName.keys()).map((code) => ({
    name: languageCodeToName.get(code) || '',
    content: languageCodeToName.get(code),
  }));
  const languageCode = Array.from(languageCodeToName.keys())[language];

  useEffect(() => {
    localStorage.setItem('openAIKey', openAIKey);
  }, [openAIKey]);

  const handleFileChange = (file: File) => {
    setFile(file);
  };

  const handleKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOpenAIKey(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      toast.error('No file selected', { autoClose: 5000 });
      return;
    }

    if (!openAIKey) {
      toast.error('OpenAI API key is required', { autoClose: 5000 });
      return;
    }

    // Read the JSON file
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const { novel: novelData } = JSON.parse(e.target?.result as string);
        const textsToTranslate = extractTexts(novelData);
        const totalTexts = textsToTranslate.length;
        let translatedCount = 0;

        const translatedTexts = await Promise.all(
          textsToTranslate.map(async ({ path, text }) => {
            const translatedText = await translateText(text, languageCode, openAIKey);
            translatedCount++;
            setProgress((translatedCount / totalTexts) * 100);
            return { path, translatedText };
          }),
        );

        // Apply the translations back to the novel data
        const translatedNovelData = applyTranslations(novelData, translatedTexts);
        translatedNovelData.language = languageCode;

        // Create a downloadable JSON
        const blob = new Blob([JSON.stringify({ novel: translatedNovelData, version: 'v3' }, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);

        toast.success('Translation completed', { autoClose: 5000 });
      } catch (error) {
        console.error(error);
        toast.error('Error translating file', { autoClose: 5000 });
      }
    };

    reader.readAsText(file);
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
    novel.tags?.forEach((tag, index) => {
      pushText(`tags[${index}]`, tag);
    });
    // Collect texts from characters
    novel.characters?.forEach((character, charIndex) => {
      pushText(`characters[${charIndex}].name`, character.name);
      pushText(`characters[${charIndex}].short_description`, character.short_description);
      character.tags?.forEach((tag, tagIndex) => {
        pushText(`characters[${charIndex}].tags[${tagIndex}]`, tag);
      });
      const card = character.card;
      if (card?.data) {
        pushText(`characters[${charIndex}].card.data.name`, card.data.name);
        pushText(`characters[${charIndex}].card.data.description`, card.data.description);
        pushText(`characters[${charIndex}].card.data.personality`, card.data.personality);
        pushText(`characters[${charIndex}].card.data.scenario`, card.data.scenario);
        pushText(`characters[${charIndex}].card.data.first_mes`, card.data.first_mes);
        pushText(`characters[${charIndex}].card.data.mes_example`, card.data.mes_example);
        pushText(`characters[${charIndex}].card.data.creator_notes`, card.data.creator_notes);
        pushText(`characters[${charIndex}].card.data.system_prompt`, card.data.system_prompt);
        pushText(`characters[${charIndex}].card.data.post_history_instructions`, card.data.post_history_instructions);
        card.data.tags?.forEach((tag, tagIndex) => {
          pushText(`characters[${charIndex}].card.data.tags[${tagIndex}]`, tag);
        });
        card.data.alternate_greetings?.forEach((greeting, greetIndex) => {
          pushText(`characters[${charIndex}].card.data.alternate_greetings[${greetIndex}]`, greeting);
        });
      }
    });
    // Collect texts from backgrounds
    novel.backgrounds?.forEach((background, bgIndex) => {
      pushText(`backgrounds[${bgIndex}].name`, background.name);
      pushText(`backgrounds[${bgIndex}].description`, background.description);
    });
    // Collect texts from songs
    novel.songs?.forEach((song, songIndex) => {
      pushText(`songs[${songIndex}].name`, song.name);
      pushText(`songs[${songIndex}].description`, song.description);
      song.tags?.forEach((tag, tagIndex) => {
        pushText(`songs[${songIndex}].tags[${tagIndex}]`, tag);
      });
    });
    // Collect texts from scenes
    novel.scenes?.forEach((scene, sceneIndex) => {
      pushText(`scenes[${sceneIndex}].name`, scene.name);
      pushText(`scenes[${sceneIndex}].description`, scene.description);
      pushText(`scenes[${sceneIndex}].prompt`, scene.prompt);
      pushText(`scenes[${sceneIndex}].actionText`, scene.actionText);
      pushText(`scenes[${sceneIndex}].hint`, scene.hint);
    });
    // Collect texts from starts
    novel.starts?.forEach((start, startIndex) => {
      pushText(`starts[${startIndex}].title`, start.title);
      pushText(`starts[${startIndex}].description`, start.description);
      start.characters?.forEach((character, charIndex) => {
        pushText(`starts[${startIndex}].characters[${charIndex}].text`, character.text);
      });
    });
    // Collect texts from objectives
    novel.objectives?.forEach((objective, objIndex) => {
      pushText(`objectives[${objIndex}].name`, objective.name);
      pushText(`objectives[${objIndex}].description`, objective.description);
      pushText(`objectives[${objIndex}].hint`, objective.hint);
    });
    // Collect texts from inventory
    novel.inventory?.forEach((item, itemIndex) => {
      pushText(`inventory[${itemIndex}].name`, item.name);
      pushText(`inventory[${itemIndex}].description`, item.description);
      item.actions?.forEach((action, actionIndex) => {
        pushText(`inventory[${itemIndex}].actions[${actionIndex}].name`, action.name);
        pushText(`inventory[${itemIndex}].actions[${actionIndex}].prompt`, action.prompt);
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

  const translateText = async (text: string, languageKey: string, apiKey: string): Promise<string> => {
    const targetLanguage = languageCodeToName.get(languageKey);
    const extraPrompt = languageCodeToExtraPrompt.get(languageKey);
    const prompt = `Translate the following text to ${targetLanguage}. This text for a visual novel narration. ${extraPrompt}, but do NOT translate content inside curly braces {} or angle brackets <>. Respond only with the translated text.\n\n${text}`;
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const translatedText = data.choices[0].message.content.trim();
    return translatedText;
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `translated_novel_${languageCode}.json`;
      link.click();
      // Revoke the object URL after downloading
      setTimeout(() => {
        URL.revokeObjectURL(downloadUrl);
        setDownloadUrl(null);
      }, 100);
    }
  };

  return (
    <div>
      <label>
        Novel JSON File:
        <input
          type="file"
          accept=".json"
          onChange={(e) => (e.target.files?.[0] ? handleFileChange(e.target.files?.[0]) : null)}
        />
      </label>
      <label>
        OpenAI API Key:
        <Input value={openAIKey} onChange={handleKeyChange} placeHolder="OpenAI API Key" />
      </label>
      <label>
        Language to translate to:
        <Dropdown
          items={languageOptions}
          selectedIndex={language}
          onChange={setLanguage}
          onToggle={setExpandedLanguage}
          expanded={expandedLanguage}
        />
      </label>
      <Button theme="primary" type="submit" disabled={!file || !openAIKey} onClick={handleSubmit}>
        Translate
      </Button>
      {progress > 0 && progress < 100 && (
        <div>
          <p>Translation progress: {Math.round(progress)}%</p>
        </div>
      )}
      {progress === 100 && downloadUrl && (
        <div>
          <Button onClick={handleDownload} theme="secondary">
            Download Translated Novel
          </Button>
        </div>
      )}
      <ToastContainer
        position="top-left"
        autoClose={5000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <BotTranslator />
  </React.StrictMode>,
  document.getElementById('root'),
);
