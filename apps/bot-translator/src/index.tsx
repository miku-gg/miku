import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { translateCard, initOpenAI, languageCodeToName } from './translateBot';
import { Button, Input, Dropdown, DragAndDropImages } from '@mikugg/ui-kit';
import { TavernCardV2, extractCardData } from '@mikugg/bot-utils';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import './index.scss';
import { BUILDING_STEPS, downloadPng } from './encodePNG';

const BotTranslator = () => {
  const [file, setFile] = useState<File | null>(null);
  const [openAIKey, setOpenAIKey] = useState(localStorage.getItem('openAIKey') || '');
  const [language, setLanguage] = useState(0);
  const [expandedLanguage, setExpandedLanguage] = useState(false);
  const languageCode = Array.from(languageCodeToName.keys())[language];

  useEffect(() => {
    localStorage.setItem('openAIKey', openAIKey);
  }, [openAIKey]);

  const handleFileChange = (file: File) => {
    setFile(file);
  };

  const handleKeyChange = (event) => {
    setOpenAIKey(event.target.value);
  };

  const handleSubmit = async (event) => {
    let toastid = toast.loading(`Reading card...`);
    // const id = toast.loading();
    event.preventDefault();
    initOpenAI(openAIKey);
    if(!file) {
      toast.update(toastid, { render: "No file selected", type: "error", isLoading: false });
      return;
    }
    const card = await extractCardData(file);
    if (card['spec'] !== 'chara_card_v2') {
      toast.update(toastid, { render: 'png is not chara_card_v2', type: "error", isLoading: false });
      return;
    }
    
    let translatedCard: TavernCardV2 | null = null;
    toast.update(toastid, { render: `Translating to ${languageCodeToName.get(languageCode)}...`, type: "default", isLoading: true });
    for await (const progress of translateCard(card as TavernCardV2, languageCode)) {
      if(progress['completed'] && progress['total']) {
        // eslint-disable-next-line
        // @ts-ignore
        toast.update(toastid, { render: `Translation progress: ${progress.completed}/${progress.total}`, type: "default", isLoading: true });
      } else {
        translatedCard = progress as TavernCardV2;
      }
    }
    toast.update(toastid, { render: `Translation completed`, type: "success", isLoading: false, closeButton: true });

    toastid = toast.loading(`Building card...`);
    await downloadPng(
      JSON.stringify(translatedCard),
      URL.createObjectURL(file),
      `${card['data'].name}_${languageCode}`,
      (step) => {
        switch(step) {
          case BUILDING_STEPS.STEP_2_GENERATING_CHUNKS:
            toast.update(toastid, { render: `Generating chunks...`, type: "default", isLoading: true });
          break;
          case BUILDING_STEPS.STEP_3_ENCODING_CHUNKS:
            toast.update(toastid, { render: `Encoding chunks...`, type: "default", isLoading: true });
          break;
          case BUILDING_STEPS.STEP_4_BUILDING_DOWNLOAD_FILE:
            toast.update(toastid, { render: `Building download file...`, type: "default", isLoading: true });
          break;
          case BUILDING_STEPS.STEP_5_DONE:
            toast.update(toastid, { render: `Download ready`, type: "success", isLoading: false, closeButton: true });
          break;
        }
      }
    ).catch((error) => {
      toast.update(toastid, { render: `Error building card: ${error}`, type: "error", isLoading: false, closeButton: true});
    });
  };

  const languageOptions = Array.from(languageCodeToName.keys()).map((code, index) => ({
    name: languageCodeToName.get(code) || '',
    content: languageCodeToName.get(code),
    // description: languageCodeToName.get(code),
  }));

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Bot PNG File (with spec in English):
        <DragAndDropImages
          size="lg"
          className="step1Description__dragAndDropImages"
          handleChange={handleFileChange}
          previewImage={file ? URL.createObjectURL(file) : undefined}
          placeHolder="Drag and drop a bot PNG file here."
          onFileValidate={(file) =>
            file.type === "image/png"
          }
          errorMessage="Please upload a chara_spec_v2 compatible PNG card."
        />
      </label>
      <label>
        OpenAI Key:
        <Input
          value={openAIKey} 
          onChange={handleKeyChange} 
          placeHolder="OpenAI Key" 
        />
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
      <Button theme="primary" type="submit" disabled={!file || !openAIKey || !languageCode}>Translate</Button>
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
    </form>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <BotTranslator />
  </React.StrictMode>,
  document.getElementById('root')
);