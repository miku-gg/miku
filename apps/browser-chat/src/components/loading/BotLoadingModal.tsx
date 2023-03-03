import queryString from 'query-string';
import { FormEvent, useEffect, useReducer, useState } from 'react';
import { Disclosure } from '@headlessui/react'
import { getBotHashFromUrl, useBot } from '../../libs/botLoader';

const MIKU_BOT = 'QmbE1Dp8ciYYB2Nkuw2YjhNCd4h1BsJ3YyYSjxjXAagdn9';
const ELAINA_BOT = 'QmXThSy6BjidXAeTr3nez9ikXsWh5xZgJZxLbbmcCimdAP';
const NALA_BOT = 'QmTgg126TbobkJgPWKRdwehF1NbHdMQqVHPofr5ZR3wb4N';
export const IS_ALPHA_LIVE = window.location.hostname === 'alpha.miku.gg';

export default function BotLoadingModal(): JSX.Element {
  const { botHash, loading, setBotHash } = useBot();
  const searchParams = queryString.parse(location.search);
  const [apiKeyForm, setApiKeyForm] = useState<{[key: string]: string}>({openai: '', elevenlabs: '', azure: '', novelai: ''});
  const [_, forceUpdate] = useReducer((x) => x + 1, 0);

  const submitAPIKey = (e: FormEvent) => {
    e.preventDefault();
    const searchParams = queryString.parse(location.search);
    const newSearchParams = {...searchParams, ...apiKeyForm};
    Object.keys(apiKeyForm).forEach((key: string) => {
      if (!apiKeyForm[key]) {
        delete newSearchParams[key];
      }
    });
    const newSearchString = queryString.stringify(newSearchParams);
    window.location.search = newSearchString;
    forceUpdate();
  }

  useEffect(() => {
    const _urlHash = getBotHashFromUrl();
    if (_urlHash && !botHash) {
      setBotHash(_urlHash);
    }
  }, [])
  
  if (IS_ALPHA_LIVE && !searchParams.openai) {
    return (
      <div className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-black bg-opacity-50 backdrop-blur-sm">
        <div className="relative w-auto my-6 mx-auto max-w-3xl">
          <div className="border-0 rounded-lg shadow-2xl relative flex flex-col w-full bg-gray-900 text-white outline-none focus:outline-none p-10">
            <div>
              Please provide your OpenAI API key
            </div>
            <div className="flex justify-center items-center mt-4">
              <form onSubmit={submitAPIKey}>
                <input
                  type="text"
                  className="w-full border-2 border-gray-300 p-2 rounded-md bg-gray-100 text-black"
                  name="openai"
                  placeholder='OpenAI API key...'
                  value={apiKeyForm.openai}
                  onChange={(e) => setApiKeyForm(current => ({...current, openai: e.target.value}))}
                />                
                <Disclosure>
                  <Disclosure.Button className="py-2 text-gray-300 italic">
                    (optional) Do you have an API key for 11Labs or Azure?
                  </Disclosure.Button>
                  <Disclosure.Panel className="text-gray-500">
                    <input
                      type="text"
                      className="w-full border-2 border-gray-300 p-2 rounded-md m-1 bg-gray-100 text-black"
                      name="azure"
                      placeholder="Azure API key..."
                      value={apiKeyForm.azure}
                      onChange={(e) => setApiKeyForm(current => ({...current, azure: e.target.value}))}
                    />
                    <input
                      type="text"
                      className="w-full border-2 border-gray-300 p-2 rounded-md m-1 bg-gray-100 text-black"
                      name="elevenlabs"
                      placeholder="11Labs API key..."
                      value={apiKeyForm.elevenlabs}
                      onChange={(e) => setApiKeyForm(current => ({...current, elevenlabs: e.target.value}))}
                    />
                    <input
                      type="text"
                      className="w-full border-2 border-gray-300 p-2 rounded-md m-1 bg-gray-100 text-black"
                      name="novelai"
                      placeholder="NovelAI API key..."
                      value={apiKeyForm.novelai}
                      onChange={(e) => setApiKeyForm(current => ({...current, novelai: e.target.value}))}
                    />
                  </Disclosure.Panel>
                </Disclosure>
                <div>
                  <input
                    type="Submit"
                    value="Submit"
                    className="w-4/12 h-full rounded-md text-white text-md bg-[#7957D2] hover:bg-violet-700 cursor-pointer m-3 p-3"
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!botHash) {
    const onBotSelect = (botHash: string) => {
      // const searchParams = queryString.parse(location.search);
      // const newSearchParams = {...searchParams, botHash};
      // const newSearchString = queryString.stringify(newSearchParams);
      // window.location.search = newSearchString;
      setBotHash(botHash);
      forceUpdate();
    }
    return (
      <div className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-black bg-opacity-50 backdrop-blur-sm">
        <div className="relative w-auto my-6 mx-auto max-w-3xl">
          <div className="border-0 rounded-lg shadow-2xl relative flex flex-col w-full bg-gray-900 outline-none focus:outline-none p-10 items-center">
            <div className="text-2xl mb-10 text-white">
              Select Bot
            </div>
            <div className="flex flex-row justify-between gap-6 max-[450px]:flex-wrap">
              <button
                className="flex flex-col w-full items-center pb-10 bg-gray-800 p-9 rounded-lg hover:bg-gray-700 hover:shadow-xl select-none transition-all"
                onClick={onBotSelect.bind(null, MIKU_BOT)}
              >
                <img className="w-24 h-24 mb-3 rounded-full shadow-lg" src="/miku.png" alt="Bonnie image"/>
                <h5 className="mb-1 text-xl font-medium text-white">Miku</h5>
                <span className="text-sm text-gray-100 bg-green-600 py-1 px-2 mt-4 rounded-lg">Davinci</span>
              </button>
              <button
                className="flex flex-col w-full items-center pb-10 bg-gray-800 p-9 rounded-lg hover:bg-gray-700 hover:shadow-xl select-none transition-all"
                onClick={onBotSelect.bind(null, NALA_BOT)}
              >
                <img className="w-24 h-24 mb-3 rounded-full shadow-lg" src="/nala.png" alt="Bonnie image"/>
                <h5 className="mb-1 text-xl font-medium text-white">Nala</h5>
                <span className="text-sm text-gray-100 bg-green-600 py-1 px-2 mt-4 rounded-lg">GPT3.5-T</span>
              </button>
              <button
                disabled={IS_ALPHA_LIVE}
                className="flex flex-col w-full items-center pb-10 bg-gray-800 p-9 rounded-lg hover:bg-gray-700 hover:shadow-xl select-none transition-all disabled:blur-sm disabled:hover:bg-gray-800 disabled:hover:shadow-none"
                onClick={onBotSelect.bind(null, ELAINA_BOT)}
              >
                <img className="w-24 h-24 mb-3 rounded-full shadow-lg" src="/elaina.png" alt="Bonnie image"/>
                <h5 className="mb-1 text-xl font-medium text-white">Elaina</h5>
                <span className="text-sm text-gray-100 bg-blue-600 py-1 px-2 mt-4 rounded-lg">Pygmalion</span>
              </button>
            </div>
            {IS_ALPHA_LIVE ? (
                <div className="mt-5 text-gray-300 italic max-w-xs">
                  Elaina is disabled for alpha.miku.gg because there&apos;s no Pygmalion cloud service.
                  Please use Miku instead or run the project locally.
                </div>
              ) : null}
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-black bg-opacity-50 backdrop-blur-sm">
        <div className="relative w-auto my-6 mx-auto max-w-3xl">
          <div className="border-0 rounded-lg shadow-2xl relative flex flex-col w-full bg-gray-100 outline-none focus:outline-none p-10">
            <div role="status">
              <svg aria-hidden="true" className="inline w-20 h-20 mr-2 animate-spin text-violet-200 fill-violet-800" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                  <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
              </svg>
              <span className="sr-only">Loading...</span>
            </div>
            <div className="text-black mt-6">
              Loading bot <span className="text-violet-800">{botHash}</span>...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <></>;
}