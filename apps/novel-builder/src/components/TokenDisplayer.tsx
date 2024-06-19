import { TokenLimits } from "../data/tokenLimits";
import { LLAMA_TOKENIZER } from "../libs/utils";

import "./TokenDisplayer.scss";

interface TokenDisplayerProps {
  text: string;
  limits: TokenLimits;
}

export const TokenDisplayer = ({ text, limits }: TokenDisplayerProps) => {
  const tokens = LLAMA_TOKENIZER.encodeString(text).length;

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
