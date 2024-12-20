import ChatBot, { Button, Params } from 'react-chatbotify';
import { ChatCompletion, ChatCompletionMessageParam } from 'openai/src/resources/index.js';
import axios from 'axios';

import './NovelAssistant.scss';
import { FunctionAction, FunctionRegistry } from './prompt/FunctionDefinitions';
import { NovelManager } from './prompt/NovelSpec';
import { NovelV3 } from '@mikugg/bot-utils';
import { useAppDispatch, useAppSelector } from '../../state/store';
import { loadCompleteState } from '../../state/slices/novelFormSlice';
import { useEffect } from 'react';
import { APIPromise } from 'openai/src/core.js';
const SERVICES_ENDPOINT = import.meta.env.VITE_SERVICES_ENDPOINT || 'http://localhost:8484';

function getFunctionActionColor(action: FunctionAction): string {
  switch (action) {
    case 'created':
      return 'green';
    case 'updated':
      return 'blue';
    case 'removed':
      return 'red';
    case 'connected':
      return 'yellow';
    case 'deleted':
      return 'red';
  }
}

function AssistantActivityLog(props: {
  verb: FunctionAction;
  subject: string;
  onNavigate?: () => void;
  onClick: () => void;
}): React.ReactNode {
  return (
    <div className="AssistantActivityLog" onClick={props.onClick}>
      Miku{' '}
      <span className="AssistantActivityLog__verb" style={{ color: getFunctionActionColor(props.verb) }}>
        {props.verb}
      </span>{' '}
      <span className="AssistantActivityLog__subject">{props.subject}</span>
      {/* <button className="AssistantActivityLog__button" onClick={props.onNavigate}>
        <FaEye size={12} />
      </button> */}
    </div>
  );
}
const novelManager = new NovelManager();
const functionRegistry = new FunctionRegistry(novelManager);
const functions = functionRegistry.getFunctionDefinitions();

// Load existing history if it exists
const conversationHistory: ChatCompletionMessageParam[] = [];

// Load

const callChatCompletion = async (
  messages: ChatCompletionMessageParam[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tools: any[],
  parallel_tool_calls: boolean,
  tool_choice: 'none' | 'auto',
): Promise<ChatCompletion> => {
  const response = await axios.post(
    SERVICES_ENDPOINT + '/openai/chat/completions',
    {
      messages,
      tools,
      parallel_tool_calls,
      tool_choice,
    },
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  if (response.status !== 200) {
    throw new Error('Failed to get completion from proxy');
  }

  return response.data;
};

const call_openai = async (params: Params, replaceState: (state: NovelV3.NovelState) => void) => {
  try {
    conversationHistory.push({ role: 'user', content: params.userInput });
    console.log(conversationHistory);

    // let amountOfCalls = 0;
    const askResponse = (): Promise<ChatCompletion> =>
      callChatCompletion(
        conversationHistory,
        functions.map((fn) => ({ type: 'function', function: fn })),
        true,
        'auto',
      );

    let response;
    for (response = await askResponse(); response?.choices[0].message?.tool_calls; response = await askResponse()) {
      const message = response.choices[0].message;
      conversationHistory.push(message);
      if (message?.tool_calls) {
        for (const toolCall of message.tool_calls) {
          const fnName = toolCall.function.name;
          const fnArgs = JSON.parse(toolCall.function.arguments || '{}');

          const functionResponse = await functionRegistry.executeFunction(fnName, fnArgs);
          // Add this line to save the novel state after each function execution
          replaceState(novelManager.getNovelState());

          conversationHistory.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: functionResponse,
          });
          const displayData = functionRegistry.getFunctionDisplayData(fnName);
          if (!functionResponse.toLowerCase().startsWith('error:') && displayData?.isSetter) {
            const toastData: { id: string | null } = { id: null };
            toastData.id = await params.showToast(
              <AssistantActivityLog
                onClick={() => toastData.id && params.dismissToast(toastData.id)}
                verb={displayData.action}
                subject={displayData.subject}
                onNavigate={() => {}}
              />,
              5000,
            );
          }
        }
      }
      if (message.content) {
        await params.injectMessage(String(message?.content) || '');
      }
    }
    conversationHistory.push(response.choices[0].message);
    console.log(conversationHistory);
    if (response.choices[0].message.content) {
      await params.injectMessage(String(response.choices[0].message?.content) || '');
    }
  } catch (error) {
    await params.injectMessage('Error: ' + error);
  }
};

export default function NovelAssistant() {
  const dispatch = useAppDispatch();
  const state = useAppSelector((state) => state.novel);
  useEffect(() => {
    novelManager.replaceState(state);
  }, [state.title]);
  return (
    <ChatBot
      flow={{
        start: {
          message: 'What do you want to create?',
          path: 'loop',
        },
        loop: {
          message: async (params) => {
            await call_openai(params, (newState) => dispatch(loadCompleteState(newState)));
          },
          path: () => {
            return 'loop';
          },
        },
      }}
      styles={{
        bodyStyle: {
          backgroundColor: '#1b2142',
        },
        headerStyle: {
          borderColor: 'transparent',
        },
        footerStyle: {
          backgroundColor: '#1b2142',
        },
        chatInputAreaStyle: {
          backgroundColor: '#25284b',
          color: 'white',
        },
        chatInputContainerStyle: {
          backgroundColor: '#1b2142',
        },
        toastPromptContainerStyle: {
          backgroundColor: 'transparent',
          color: 'white',
          bottom: '73px',
          opacity: 0.8,
          textAlign: 'center',
        },
      }}
      settings={{
        footer: {
          buttons: [],
          text: 'This AI assistant uses GPT-4o to help you create your novel.',
        },
        header: {
          title: 'MikuGG Assistant',
          avatar: 'https://assets.miku.gg/miku_profile_pic.png',
          showAvatar: true,
          buttons: [Button.CLOSE_CHAT_BUTTON],
        },
        general: {
          primaryColor: '#ff4e67',
          secondaryColor: '#9747ff',
          fontFamily: 'Poppins, Roboto, sans-serif',
          embedded: false,
          showFooter: false,
        },
        audio: {
          disabled: true,
        },
        chatHistory: {
          disabled: true,
        },
        tooltip: {
          text: 'I can assist!',
        },
        botBubble: {
          avatar: 'https://assets.miku.gg/miku_profile_pic.png',
          showAvatar: true,
          simStream: true,
          animate: true,
        },
        chatButton: {
          icon: 'https://assets.miku.gg/miku_profile_pic.png',
        },
        toast: {
          dismissOnClick: true,
          maxCount: 6,
        },
      }}
    />
  );
}
