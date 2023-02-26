import { useEffect, useReducer } from "react";
import { toast } from "react-toastify";
import * as MikuCore from '@mikugg/core';
import botFactory from "../../libs/botFactory";
import { useBot } from "../../libs/botLoader";

export const HistoryManagementButtons = ({ onLoad }: {onLoad: () => void}) => {
  const history = botFactory.getInstance()?.getMemory();
  const { botConfig, botHash, loading } = useBot();

  const handleSave = () => {
    const json = JSON.stringify({ botHash, memory: history?.getMemory() || [] });
    const blob = new Blob([json], { type: "application/json" });
    const a = document.createElement("a");
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = `${botConfig?.bot_name || 'unknown'}_history_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        if (!botConfig || !botHash || loading) {
          toast.warn('Please, load a bot before uploading a history');
          return;
        }
        const json = reader.result as string;
        const newData = JSON.parse(json) as {
          memory: MikuCore.Memory.MemoryLine[],
          botHash: string,
        };

        if (!newData.botHash || newData.botHash !== botHash) {
          toast.error('Incompatible bot hash');
          return;
        }

        history?.clearMemories();
        newData.memory.forEach((line) => {
          history?.pushMemory(line);
        });
        toast.success('Memory loaded!');
        onLoad();
      } catch (e) {
        toast.error('Error reading json file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <button
        className="button-transparent min-w-[10em] py-2"
        onClick={handleSave}
      >
        Save history
      </button>
      <label className="button-purple min-w-[10em] flex items-center justify-center cursor-pointer py-2">
        Load history
        <input
          id="load-history-input"
          className="hidden"
          type="file"
          accept="application/json"
          onChange={handleUpload}
        />
      </label>
    </>
  )
}

export const HistoryConsole = () => {
  const { botConfig } = useBot();
  const history = botFactory.getInstance()?.getMemory();
  const [_, forceUpdate] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    botFactory.getInstance()?.subscribeDialog(() => {
      forceUpdate();
    });
  }, [botConfig]);

  return (
    <div className="flex flex-col h-full p-2.5 overflow-auto gap-3 w-full font-mono text-sm text-white bg-[#323232] rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-{#323232} dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
      {/* HISTORY CONTEXT */}
      <div className="text-left w-full h-fi text-slate-400">
        {history
          ?.getContextPrompt()
          .split("\n")
          .map((text, i) => (
            <p key={`basePrompt_${i}`}>{text}</p>
          ))}
        {history
          ?.getInitiatorPrompt()
          .split("\n")
          .map((text, i) => (
            <p key={`basePrompt_${i}`}>{text}</p>
          ))}
      </div>
      {/* HISTORY CURRENT CHAT */}
      <div className="flex flex-col justify-start items-start w-full h-fit">
        {history?.getMemory().map(({ text, subject }, i) => (
          <div key={`chat_${i}`} className="flex gap-2">
            <p
              className={`${
                (subject === ((botConfig?.short_term_memory?.props as {botSubject: string})?.botSubject || ''))
                  ? "text-yellow-300"
                  : "text-green-600"
              }`}
            >
              {subject}:
            </p>
            <p className={`${
                (subject === ((botConfig?.short_term_memory?.props as {botSubject: string})?.botSubject || ''))
                  ? "text-white"
                  : "text-gray-400"
              } text-left`}>{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}


export const ChatHistory = () => {
  return (
    <div className="scrollbar flex justify-center h-5/6 w-full overflow-auto">
      <div className="p-2">
        <HistoryConsole />
      </div>
    </div>
  );
};
