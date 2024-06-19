import { Modal, Tooltip } from "@mikugg/ui-kit";
import { TokenLimits } from "../data/tokenLimits";
import { LLAMA_TOKENIZER } from "../libs/utils";
import { useState } from "react";

import "./TokenDisplayer.scss";

interface BaseProps {
  limits: TokenLimits;
  size?: "small" | "medium" | "large";
}

interface WithToken extends BaseProps {
  tokens: number;
  text?: never;
}

interface WithText extends BaseProps {
  tokens?: never;
  text: string;
}

type TokenDisplayerProps = WithToken | WithText;

export const TokenDisplayer = ({
  tokens,
  text,
  limits,
  size = "small"
}: TokenDisplayerProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const calculatedTokens = tokens ?? LLAMA_TOKENIZER.encodeString(text).length;

  const colorClassName = ((_tokens: number) => {
    if (_tokens <= limits.green) {
      return "green";
    } else if (_tokens <= limits.red) {
      return "yellow";
    } else {
      return "red";
    }
  })(calculatedTokens);

  return (
    <>
      <Tooltip
        id={`token-displayer-tooltip-${calculatedTokens}-${colorClassName}`}
        content={`Tokens`}
      />
      <span
        data-tooltip-id={`token-displayer-tooltip-${calculatedTokens}-${colorClassName}`}
        className={`TokenDisplayer ${colorClassName} ${size}`}
        onClick={() => setIsModalOpen(true)}
      >
        {calculatedTokens}
      </span>
      <Modal
        title="Tokenization Info"
        opened={isModalOpen}
        onCloseModal={() => setIsModalOpen(false)}
        className="TokenDisplayer__Modal"
      >
        <pre>
          The text is tokenized using the LLAMA tokenizer. You see the following
          colors:
        </pre>
        <pre>
          <ul>
            <li className="TokenDisplayer__Modal__item">
              <span className="TokenDisplayer__Modal__green-text">Green</span>:
              If the number of tokens is good for the field.
            </li>
            <li className="TokenDisplayer__Modal__item">
              <span className="TokenDisplayer__Modal__yellow-text">Yellow</span>
              : If the number of tokens is a bit high.
            </li>
            <li className="TokenDisplayer__Modal__item">
              <span className="TokenDisplayer__Modal__red-text">Red</span>: If
              the number of tokens is too high.
            </li>
          </ul>
        </pre>
        <pre>
          This can help you to know if the text is too long for the field.
        </pre>
      </Modal>
    </>
  );
};
