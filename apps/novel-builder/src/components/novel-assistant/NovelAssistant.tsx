import ChatBot, { Button, Params, RcbToggleChatWindowEvent } from 'react-chatbotify';
import { ChatCompletion, ChatCompletionMessageParam } from 'openai/src/resources/index.js';
import { useState, useEffect } from 'react';
import DisclaimerModal from './DisclaimerModal';
import config from '../../config';

import './NovelAssistant.scss';
import { FunctionRegistry } from './prompt/FunctionDefinitions';
import { NovelManager } from './prompt/NovelSpec';
import { NovelV3 } from '@mikugg/bot-utils';
import { store, useAppDispatch } from '../../state/store';
import { loadCompleteState } from '../../state/slices/novelFormSlice';
import { callChatCompletion, FunctionAction } from '../../libs/assistantCall';
import '../../libs/sdPromptImprover';

function getFunctionActionColor(action: FunctionAction): string {
  switch (action) {
    case 'created':
      return '#4CAF50';
    case 'updated':
      return '#2196F3';
    case 'removed':
      return '#FF9800';
    case 'connected':
      return '#FFC107';
    case 'deleted':
      return '#F44336';
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

const call_openai = async (params: Params, replaceState: (state: NovelV3.NovelState) => void) => {
  try {
    conversationHistory.push({ role: 'user', content: params.userInput });
    // console.log(conversationHistory);

    // let amountOfCalls = 0;
    const askResponse = (): Promise<ChatCompletion> =>
      callChatCompletion(
        conversationHistory,
        functions.map((fn) => ({ type: 'function', function: fn })),
        true,
        'auto',
      );

    let response;
    for (
      response = await askResponse();
      response?.choices[0].message?.tool_calls?.length;
      response = await askResponse()
    ) {
      const message = response.choices[0].message;
      conversationHistory.push({
        role: message.role,
        content: message.content,
        tool_calls: message.tool_calls,
      });
      novelManager.replaceState(store.getState().novel);
      if (message?.tool_calls) {
        for (const toolCall of message.tool_calls) {
          const fnName = toolCall.function.name;
          const fnArgs = JSON.parse(toolCall.function.arguments || '{}');

          const functionResponse = await functionRegistry.executeFunction(fnName, fnArgs);
          // Add this line to save the novel state after each function execution
          replaceState(novelManager.getNovelState());

          conversationHistory.push({
            role: 'tool',
            // eslint-disable-next-line
            // @ts-ignore
            name: fnName,
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
      if (message.content?.trim()) {
        await params.injectMessage(String(message?.content) || '');
      }
    }
    if (response.choices[0].message.content?.trim()) {
      conversationHistory.push({
        role: response.choices[0].message.role,
        content: response.choices[0].message.content,
        tool_calls: response.choices[0].message.tool_calls,
      });
      await params.injectMessage(String(response.choices[0].message?.content?.trim()) || '');
    }
  } catch (error) {
    await params.injectMessage('Error: ' + error);
  }
};

export default function NovelAssistant() {
  const dispatch = useAppDispatch();
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(() => false);
  const [isPremium, setIsPremium] = useState(false);
  const [isCheckingPremium, setIsCheckingPremium] = useState(true);

  useEffect(() => {
    const checkPremiumStatus = async () => {
      try {
        const premium = await config.isPremiumUser();
        setIsPremium(premium);
      } catch (error) {
        console.error('Failed to check premium status:', error);
        setIsPremium(false);
      } finally {
        setIsCheckingPremium(false);
      }
    };

    checkPremiumStatus();
  }, []);

  useEffect(() => {
    const handleToggleChatWindow = (event: RcbToggleChatWindowEvent) => {
      const shouldOpen = event.data.newState;

      if (shouldOpen && !hasAcceptedDisclaimer) {
        setShowDisclaimer(true);
      }
    };

    // eslint-disable-next-line
    // @ts-ignore
    window.addEventListener('rcb-toggle-chat-window', handleToggleChatWindow);
    return () => {
      // eslint-disable-next-line
      // @ts-ignore
      window.removeEventListener('rcb-toggle-chat-window', handleToggleChatWindow);
    };
  }, [hasAcceptedDisclaimer]);

  const handleDisclaimerClose = () => {
    setShowDisclaimer(false);
    setHasAcceptedDisclaimer(true);
    localStorage.setItem('assistant-disclaimer-accepted', 'true');
    // Open the chat after accepting disclaimer
    const event = new CustomEvent('rcb-toggle-chat-window', {
      detail: { newState: true },
    });
    window.dispatchEvent(event);
  };

  if (isCheckingPremium || !isPremium) {
    return null;
  }
  return (
    <>
      <DisclaimerModal opened={showDisclaimer} onClose={handleDisclaimerClose} />
      <ChatBot
        flow={{
          start: {
            message: isPremium ? 'What do you want to create?' : 'The assistant is only available for premium members.',
            path: isPremium ? 'loop' : 'end',
          },
          loop: {
            message: async (params) => {
              await call_openai(params, (newState) => dispatch(loadCompleteState(newState)));
            },
            path: () => {
              return 'loop';
            },
          },
          end: {
            message: '',
            path: 'end',
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
          event: {
            rcbToggleChatWindow: true,
          },
          footer: {
            buttons: [],
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
          chatInput: {
            disabled: !isPremium,
          },
        }}
      />
    </>
  );
}
