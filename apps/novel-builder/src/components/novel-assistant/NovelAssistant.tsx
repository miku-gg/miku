import ChatBot, { Params } from 'react-chatbotify';
import { FaEye } from 'react-icons/fa';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/src/resources/index.js';

import './NovelAssistant.scss';
import systemPrompt from './prompt/systemPrompt';
import { FunctionRegistry } from './prompt/FunctionDefinitions';
import { NovelManager } from './prompt/NovelSpec';
import { NovelV3 } from '@mikugg/bot-utils';
import { useAppDispatch, useAppSelector } from '../../state/store';
import { loadCompleteState } from '../../state/slices/novelFormSlice';
import { useEffect } from 'react';

function AssistantActivityLog(props: { verb: string; subject: string; onNavigate: () => void }): React.ReactNode {
  return (
    <div className="AssistantActivityLog">
      Miku <span className="AssistantActivityLog__verb">{props.verb}</span>{' '}
      <span className="AssistantActivityLog__subject">{props.subject}</span>
      <button className="AssistantActivityLog__button" onClick={props.onNavigate}>
        <FaEye size={12} />
      </button>
    </div>
  );
}

// Configure OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});
const model = 'gpt-4o-mini';
const novelManager = new NovelManager();
const functionRegistry = new FunctionRegistry(novelManager);
const functions = functionRegistry.getFunctionDefinitions();

// Load existing history if it exists
const conversationHistory: ChatCompletionMessageParam[] = [
  {
    role: 'system',
    content: systemPrompt,
  },
];

// Load

const call_openai = async (params: Params, replaceState: (state: NovelV3.NovelState) => void) => {
  try {
    conversationHistory.push({ role: 'user', content: params.userInput });

    const firstResponse = await openai.chat.completions.create({
      model: model,
      messages: conversationHistory,
      tools: functions.map((fn) => ({ type: 'function', function: fn })),
      tool_choice: 'auto',
    });

    const firstMessage = firstResponse.choices[0].message;
    conversationHistory.push(firstMessage);

    if (firstMessage?.tool_calls) {
      for (const toolCall of firstMessage.tool_calls) {
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
      }

      const secondResponse = await openai.chat.completions.create({
        model: model,
        messages: conversationHistory,
      });

      const secondMessage = secondResponse.choices[0].message;
      conversationHistory.push(secondMessage);
      console.log(secondMessage?.content);
      await params.injectMessage(secondMessage?.content || '');
    } else {
      await params.injectMessage(firstMessage?.content || '');
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
      }}
      settings={{
        footer: {
          buttons: [],
          text: 'This AI assistant uses GPT-4o to help you create your novel.',
        },
        header: {
          title: 'Miku Assistant',
          avatar: 'https://assets.miku.gg/miku_profile_pic.png',
          showAvatar: true,
        },
        general: {
          primaryColor: '#ff4e67',
          secondaryColor: '#9747ff',
          fontFamily: 'Poppins, Roboto, sans-serif',
          embedded: false,
          showFooter: false,
        },
        audio: {
          disabled: false,
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
        },
        chatButton: {
          icon: 'https://assets.miku.gg/miku_profile_pic.png',
        },
      }}
    />
  );
}
