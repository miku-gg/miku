import { BotDisplay } from "./bot-display/BotDisplay";
import { ChatInputBox } from "./chat-input-box/ChatInputBox";

export const InteractiveChat = (): JSX.Element => {

  return (
    <div className="w-5/12 h-full max-lg:w-full flex flex-col gap-4">
      <BotDisplay />
      <ChatInputBox />
    </div>
  );
}