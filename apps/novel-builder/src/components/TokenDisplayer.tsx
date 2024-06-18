import { TokenLimits } from "../data/tokenLimits";
import { LLAMA_TOKENIZER } from "../libs/utils";

import "./TokenDisplayer.scss";

interface TokenDisplayerProps {
  text: string;
  limits: TokenLimits;
  getTokens?: (tokens: number) => void;
}

export const TokenDisplayer = ({
  text,
  limits,
  getTokens
}: TokenDisplayerProps) => {
  const tokens = LLAMA_TOKENIZER.encodeString(text).length;
  getTokens && getTokens(tokens);

  const colorClassName = ((tokens: number) => {
    if (tokens <= limits.green) {
      return "green";
    } else if (tokens <= limits.red) {
      return "yellow";
    } else {
      return "red";
    }
  })(tokens);

  return <span className={`TokenDisplayer ${colorClassName}`}>{tokens}</span>;
};
