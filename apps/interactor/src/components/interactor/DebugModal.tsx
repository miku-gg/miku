import { Button, Modal } from '@mikugg/ui-kit';
import { useAppDispatch, useAppSelector } from '../../state/store';
import { useEffect, useState } from 'react';
import { completionHistory } from '../../libs/textCompletion';
import classNames from 'classnames';
import { setDebugModal } from '../../state/slices/settingsSlice';
import './DebugModal.scss';

export default function DebugModal() {
  const dispatch = useAppDispatch();
  const { debug: opened } = useAppSelector((state) => state.settings.modals);
  const [completionHistoryIndex, setCompletionHistoryIndex] = useState<number>(0);

  useEffect(() => {
    if (opened) {
      setCompletionHistoryIndex(completionHistory.length - 1);
    }
  }, [opened]);

  return (
    <Modal
      opened={opened}
      onCloseModal={() => dispatch(setDebugModal(false))}
      shouldCloseOnOverlayClick
      hideCloseButton={false}
      title="Debug"
      className="DebugModal__container"
    >
      <div className="DebugModal">
        {completionHistory.length === 0 ? (
          <div className="DebugModal__stats">No data</div>
        ) : (
          <>
            <div className="DebugModal__items scrollbar">
              {completionHistory.map((item, index) => (
                <Button
                  theme={index === completionHistoryIndex ? 'secondary' : 'transparent'}
                  key={index}
                  className="DebugModal__item"
                  onClick={() => setCompletionHistoryIndex(index)}
                >
                  {new Date(item.timestamp).toLocaleTimeString()}
                </Button>
              ))}
            </div>
            {completionHistory[completionHistoryIndex] ? (
              <div className="DebugModal__content">
                <div className="DebugModal__stats scrollbar">
                  {JSON.stringify(
                    {
                      model: completionHistory[completionHistoryIndex].model,
                      variables: completionHistory[completionHistoryIndex].variables,
                    },
                    null,
                    2,
                  )}
                </div>
                <div className="DebugModal__template scrollbar">
                  {completionHistory[completionHistoryIndex].template.split('\n').map((value, index) => {
                    const systemLine = ['###', 'USER:', 'ASSISTANT:', '<|'].some((v) => value.startsWith(v));
                    const genLine = value.includes('{{SEL') || value.includes('{{GEN');

                    return (
                      <div
                        key={`${index}-${value}`}
                        className={classNames({
                          DebugModal__template__line: true,
                          'DebugModal__template__line--system': systemLine,
                          'DebugModal__template__line--gen': genLine,
                        })}
                      >
                        {value}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </Modal>
  );
}
