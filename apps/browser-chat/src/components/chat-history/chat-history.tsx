import { useEffect, useReducer, useState } from "react";
import { toast } from "react-toastify";
import * as MikuCore from "@mikugg/core";
import botFactory from "../../libs/botFactory";
import { useBot } from "../../libs/botLoader";
import { CheckIcon, PencilIcon } from "@primer/octicons-react";
import "./chat-history.css";
import trim from "lodash.trim";
import platformAPI from "../../libs/platformAPI";
import { getAphroditeConfig } from "../../App";

export const HistoryManagementButtons = ({
  onLoad,
}: {
  onLoad: () => void;
}) => {
  const history = botFactory.getInstance()?.getMemory();
  const { botConfig, botHash, loading } = useBot();

  const handleSave = () => {
    const json = JSON.stringify({
      botHash,
      memory: history?.getMemory() || [],
    });
    const blob = new Blob([json], { type: "application/json" });
    const a = document.createElement("a");
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = `${
      botConfig?.bot_name || "unknown"
    }_history_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        if (!botConfig || !botHash || loading) {
          toast.warn("Please, load a bot before uploading a history");
          return;
        }
        let json = reader.result as string;

        // fix for old format, remove in the future
        json = json.replace(/"type":"dialog"/g, `"type":1`);
        json = json.replace(/"type":"action"/g, `"type":1`);
        json = json.replace(/"type":"context"/g, '"type":0');

        const newData = JSON.parse(json) as {
          memory: MikuCore.Memory.MemoryLine[];
          botHash: string;
        };

        if (!newData.botHash || newData.botHash !== botHash) {
          toast.error("Incompatible bot hash");
          return;
        }

        history?.clearMemories();
        newData.memory.forEach((line) => {
          history?.pushMemory(line);
        });
        toast.success("Memory loaded!");
        onLoad();
      } catch (e) {
        toast.error("Error reading json file");
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
  );
};

const HistoryMemoryLine = ({
  botSubject,
  text,
  subject,
  editing,
  editingText,
  setEditingText,
  onEditedSelected,
  onEditedSubmit,
  onCancelEdit,
}: {
  botSubject: string;
  text: string;
  subject: string;
  editing: boolean;
  editingText: string;
  setEditingText: (text: string) => void;
  onEditedSelected: () => void;
  onEditedSubmit: () => void;
  onCancelEdit: () => void;
}): JSX.Element => {
  const subjectDisplay = (
    <p
      className={`${
        subject === botSubject ? "text-yellow-300" : "text-green-600"
      }`}
    >
      {subject}:
    </p>
  );

  return (
    <div className="w-full">
      {editing ? (
        <div className="flex gap-2 items-center w-full">
          <button
            className="text-gray-400 hover:text-gray-100"
            onClick={onEditedSubmit}
          >
            <CheckIcon size={16} />
          </button>
          {subjectDisplay}
          <input
            className="w-full bg-transparent text-white border-2 border-transparent border-b-gray-500 focus:border-b-solid focus:border-x-trasparent focus:border-b-2 focus:border-b-blue-700 outline-0 transition-all"
            value={editingText}
            onChange={(e) => setEditingText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                onCancelEdit();
              } else if (e.key === "Enter") {
                onEditedSubmit();
              }
            }}
          />
        </div>
      ) : (
        <div className="memory-line-display flex gap-2 items-center">
          <button
            className="memory-edit-button text-gray-400 hover:text-gray-100"
            onClick={onEditedSelected}
          >
            <PencilIcon size={16} />
          </button>
          {subjectDisplay}
          <p
            className={`${
              subject === botSubject ? "text-white" : "text-gray-400"
            } text-left`}
          >
            {text}
          </p>
        </div>
      )}
    </div>
  );
};

const HistoryMemoryLines = ({
  botSubject,
  memoryLines,
  editedIndex,
  setEditedIndex,
  editedText,
  setEditedText,
  onEditedSubmit,
}: {
  botSubject: string;
  memoryLines: MikuCore.Memory.MemoryLine[];
  editedIndex: number;
  setEditedIndex: (index: number) => void;
  editedText: string;
  setEditedText: (text: string) => void;
  onEditedSubmit: () => void;
}) => {
  return (
    <div className="flex flex-col justify-start items-start w-full h-fit">
      {memoryLines.map((line, i) => {
        return (
          <HistoryMemoryLine
            key={`chat_${botSubject}_${line.text}_${line.subject}_${i}`}
            botSubject={botSubject}
            text={line.text}
            subject={line.subject}
            editing={editedIndex === i}
            editingText={editedText}
            setEditingText={setEditedText}
            onEditedSelected={() => {
              setEditedIndex(i);
              setEditedText(line.text);
            }}
            onCancelEdit={() => setEditedIndex(-1)}
            onEditedSubmit={onEditedSubmit}
          />
        );
      })}
    </div>
  );
};

let historyNumber = 0;
// this another case of (i think) me not knowing how useEffect works like in useResponses.tsx i am using a number to update it
export const updateHistoryNumber = () => {
  historyNumber += 1;
};

export const HistoryConsole = () => {
  const { botConfig } = useBot();
  const history = botFactory.getInstance()?.getMemory();
  const [_, forceUpdate] = useReducer((x) => x + 1, 0);

  const [editedIndex, setEditedIndex] = useState<number>(-1);
  const [editedText, setEditedText] = useState<string>("");

  useEffect(() => {
    botFactory.getInstance()?.subscribeDialog(() => {
      forceUpdate();
    });
  }, [botConfig, historyNumber]);

  const updateMemoryLine = () => {
    const memory = botFactory.getInstance()?.getMemory();
    const lines = memory?.getMemory() || [];
    if (editedText === lines[editedIndex].text) {
      setEditedIndex(-1);
      return;
    }
    const aphrodite = getAphroditeConfig();
    if (!trim(editedText)) {
      if (aphrodite.enabled && lines[editedIndex].id) {
        platformAPI.deleteChatMessage(aphrodite.chatId, lines[editedIndex].id || '')
      }
      lines.splice(editedIndex, 1);
    } else {
      lines[editedIndex] = {
        ...lines[editedIndex],
        text: editedText,
      };
      if (aphrodite.enabled && lines[editedIndex].id) {
        platformAPI.editChatMessage(aphrodite.chatId, lines[editedIndex].id || '', editedText)
      }
    }
    memory?.clearMemories();
    lines.forEach((line) => {
      memory?.pushMemory(line);
    });
    setEditedIndex(-1);
    forceUpdate();
  };

  return (
    <div className="flex flex-col-reverse scrollbar h-full p-2.5 gap-3 overflow-y-scroll w-full font-mono text-sm text-white bg-[#323232] rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-{#323232} border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500">
      {/* HISTORY CURRENT CHAT */}
      <HistoryMemoryLines
        editedIndex={editedIndex}
        setEditedIndex={(i: number) => setEditedIndex(i)}
        editedText={editedText}
        setEditedText={(t: string) => setEditedText(t)}
        botSubject={
          (botConfig?.short_term_memory?.props as { botSubject: string })
            ?.botSubject || ""
        }
        memoryLines={history?.getMemory() || []}
        onEditedSubmit={updateMemoryLine}
      />
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
    </div>
  );
};

export const ChatHistory = () => {
  return (
    <div className="scrollbar flex justify-center h-5/6 w-full overflow-auto">
      <div className="p-2">
        <HistoryConsole />
      </div>
    </div>
  );
};
