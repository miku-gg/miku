import { Button, Dropdown, Input } from '@mikugg/ui-kit';
import { useAppSelector } from '../../state/store';
import { NovelV3 } from '@mikugg/bot-utils';
import { v4 as randomUUID } from 'uuid';
import SceneSelector from '../scene/SceneSelector';
import ItemSelector from '../items/ItemSelector';
import { NovelVariableOperationForm } from '../scene/NovelVariableOperationForm';
import './OptionsEditor.scss';

interface OptionsEditorProps {
  part: NovelV3.CutScenePart;
  textIndex: number;
  onUpdate: (part: NovelV3.CutScenePart) => void;
}

export const OptionsEditor = ({ part, textIndex, onUpdate }: OptionsEditorProps) => {
  const scenes = useAppSelector((state) => state.novel.scenes);
  const items = useAppSelector((state) => state.novel.inventory);

  const currentText = part.text[textIndex];
  if (!currentText || currentText.type !== 'options') return null;

  // Only render if there's a text part with type 'options'
  const hasOptionsText = part.text.some((text) => text.type === 'options');
  if (!hasOptionsText) return null;

  const actionTypes = [
    { name: 'Navigate to Scene', value: 'NAVIGATE_TO_SCENE' },
    { name: 'Give Item', value: 'GIVE_ITEM' },
    { name: 'Set Variable', value: 'SET_NOVEL_VARIABLE' },
  ];

  const createOption = () => {
    const newOption: NovelV3.CutSceneOption = {
      id: randomUUID(),
      text: '',
      prompt: '',
      action: {
        type: 'NAVIGATE_TO_SCENE',
        params: { sceneId: scenes[0]?.id || '' },
      },
    };

    const updatedText = [...part.text];
    const existingOptions = currentText.options || [];
    updatedText[textIndex] = {
      ...currentText,
      options: [...existingOptions, newOption],
    };

    onUpdate({ ...part, text: updatedText });
  };

  const updateOption = (optionId: string, updates: Partial<NovelV3.CutSceneOption>) => {
    const updatedOptions = (currentText.options || []).map((option) =>
      option.id === optionId ? { ...option, ...updates } : option,
    );

    const updatedText = [...part.text];
    updatedText[textIndex] = {
      ...currentText,
      options: updatedOptions,
    };

    onUpdate({ ...part, text: updatedText });
  };

  const deleteOption = (optionId: string) => {
    const updatedOptions = (currentText.options || []).filter((option) => option.id !== optionId);

    const updatedText = [...part.text];
    updatedText[textIndex] = {
      ...currentText,
      options: updatedOptions,
    };

    onUpdate({ ...part, text: updatedText });
  };

  const updateAction = (optionId: string, action: NovelV3.CutSceneAction) => {
    updateOption(optionId, { action });
  };

  return (
    <div className="OptionsEditor">
      <div className="OptionsEditor__header">
        <Button theme="secondary" onClick={createOption}>
          +
        </Button>
      </div>

      <div className="OptionsEditor__options">
        {(currentText.options || []).map((option) => (
          <div key={option.id} className="OptionsEditor__option">
            <div className="OptionsEditor__option-controls">
              <Input
                value={option.text}
                onChange={(e) => updateOption(option.id, { text: e.target.value })}
                placeHolder="Option text..."
              />

              <Dropdown
                items={actionTypes}
                selectedIndex={actionTypes.findIndex((item) => item.value === option.action?.type)}
                onChange={(selectedIndex) => {
                  const actionType = actionTypes[selectedIndex].value;
                  if (actionType === 'NAVIGATE_TO_SCENE') {
                    updateAction(option.id, {
                      type: 'NAVIGATE_TO_SCENE',
                      params: { sceneId: '' },
                    });
                  } else if (actionType === 'GIVE_ITEM') {
                    updateAction(option.id, {
                      type: 'GIVE_ITEM',
                      params: { itemId: '' },
                    });
                  } else if (actionType === 'SET_NOVEL_VARIABLE') {
                    updateAction(option.id, {
                      type: 'SET_NOVEL_VARIABLE',
                      params: { variables: [] },
                    });
                  }
                }}
                className="OptionsEditor__action-dropdown"
              />

              <Button theme="primary" onClick={() => deleteOption(option.id)}>
                Delete
              </Button>
            </div>

            <Input
              value={option.prompt}
              onChange={(e) => updateOption(option.id, { prompt: e.target.value })}
              placeHolder="*{{user}} took the shiny golden key*"
            />

            <div className="OptionsEditor__option-selectors">
              {option.action?.type === 'NAVIGATE_TO_SCENE' && (
                <SceneSelector
                  multiSelect={false}
                  nonDeletable
                  value={(() => {
                    const sceneId = option.action.params?.sceneId;
                    if (!sceneId) return null;
                    // Check if the scene still exists in the scenes
                    const sceneExists = scenes?.find((scene) => scene.id === sceneId);
                    return sceneExists ? sceneId : null;
                  })()}
                  onChange={(sceneId) => {
                    updateAction(option.id, {
                      type: 'NAVIGATE_TO_SCENE',
                      params: { sceneId: sceneId || '' },
                    });
                  }}
                />
              )}

              {option.action?.type === 'GIVE_ITEM' && (
                <ItemSelector
                  multiSelect={false}
                  nonDeletable
                  value={(() => {
                    const itemId = option.action.params?.itemId;
                    if (!itemId) return null;
                    // Check if the item still exists in the inventory
                    const itemExists = items?.find((item) => item.id === itemId);
                    return itemExists ? itemId : null;
                  })()}
                  onChange={(itemId) => {
                    updateAction(option.id, {
                      type: 'GIVE_ITEM',
                      params: { itemId: itemId || '' },
                    });
                  }}
                />
              )}

              {option.action?.type === 'SET_NOVEL_VARIABLE' && (
                <NovelVariableOperationForm
                  variables={option.action.params.variables}
                  onChange={(variables) => {
                    updateAction(option.id, {
                      type: 'SET_NOVEL_VARIABLE',
                      params: { variables },
                    });
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
