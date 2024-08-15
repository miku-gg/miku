import { Modal, Tooltip } from '@mikugg/ui-kit';
import { TokenLimits } from '../data/tokenLimits';
import { LLAMA_TOKENIZER } from '../libs/utils';
import { useState } from 'react';

import './TokenDisplayer.scss';

interface BaseProps {
  limits: TokenLimits;
  size?: 'small' | 'medium' | 'large';
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

export const TokenDisplayer = ({ tokens, text, limits, size = 'small' }: TokenDisplayerProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const calculatedTokens = tokens ?? LLAMA_TOKENIZER.encodeString(text).length;

  const colorClassName = ((_tokens: number) => {
    if (_tokens <= limits.green) {
      return 'green';
    } else if (_tokens <= limits.red) {
      return 'yellow';
    } else {
      return 'red';
    }
  })(calculatedTokens);

  return (
    <>
      <Tooltip id={`token-displayer-tooltip-${calculatedTokens}-${colorClassName}`} content={`Tokens`} />
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
          This amount is the <b>AI memory</b> that the text will consume. The more text there is, the less conversation
          the AI will remember when the novel is being played.
        </pre>
        <pre>
          <ul>
            <li className="TokenDisplayer__Modal__item">
              <span className="TokenDisplayer__Modal__green-text">Green</span>: If the number of tokens is good.
            </li>
            <li className="TokenDisplayer__Modal__item">
              <span className="TokenDisplayer__Modal__yellow-text">Yellow</span>: If the number of tokens is a bit high.
            </li>
            <li className="TokenDisplayer__Modal__item">
              <span className="TokenDisplayer__Modal__red-text">Red</span>: If the number of tokens is too high.
            </li>
          </ul>
        </pre>
        <pre>
          A standard novel narration has 4096 tokens of memory. This should fit all the text considered by the AI for a
          given scene.
          <br />
          You have `scene prompt + character prompt + second character prompt (if exists) + top 3 lorebook entries (if
          exist) + conversation history`.
          <br />
          The more memory is used, the less conversation history will be taken into consideration by the AI.
        </pre>
      </Modal>
    </>
  );
};
