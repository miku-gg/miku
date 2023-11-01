import { BotDisplay } from "./bot-display/BotDisplay";
import { ChatInputBox } from "./chat-input-box/ChatInputBox";

export const InteractiveChat = (): JSX.Element => {

  return (
    <div className="w-full h-full max-lg:w-full flex flex-col">
      <BotDisplay />
    </div>
  );
}