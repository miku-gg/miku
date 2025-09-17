import { Button, Dropdown, Input } from '@mikugg/ui-kit';
import { useAppDispatch, useAppSelector } from '../../state/store';
import { NovelV3 } from '@mikugg/bot-utils';
import { useState } from 'react';
import { v4 as randomUUID } from 'uuid';
import SceneSelector from '../scene/SceneSelector';
import ItemSelector from '../items/ItemSelector';
import './OptionsEditor.scss';

interface OptionsEditorProps {
  part: NovelV3.CutScenePart;
  cutsceneId: string;
  onUpdate: (part: NovelV3.CutScenePart) => void;
}

export const OptionsEditor = ({ part, cutsceneId, onUpdate }: OptionsEditorProps) => {
  const dispatch = useAppDispatch();
  const scenes = useAppSelector((state) => state.novel.scenes);
  const items = useAppSelector((state) => state.novel.inventory);

  const [editingOption, setEditingOption] = useState<NovelV3.CutSceneOption | null>(null);

  // Only render if there's a text part with type 'options'
  const hasOptionsText = part.text.some(text => text.type === 'options');
  if (!hasOptionsText) return null;

  const actionTypes = [
    { name: 'Navigate to Scene', value: 'NAVIGATE_TO_SCENE' },
    { name: 'Give Item', value: 'GIVE_ITEM' },
  ];

  const createOption = () => {
    const newOption: NovelV3.CutSceneOption = {
      id: randomUUID(),
      text: '',
      action: {
        type: 'NAVIGATE_TO_SCENE',
        params: { sceneId: scenes[0]?.id || '' }
      }
    };

    const updatedPart = {
      ...part,
      options: [...(part.options || []), newOption]
    };

    onUpdate(updatedPart);
  };

  const updateOption = (optionId: string, updates: Partial<NovelV3.CutSceneOption>) => {
    const updatedOptions = part.options?.map(option => 
      option.id === optionId ? { ...option, ...updates } : option
    ) || [];

    const updatedPart = {
      ...part,
      options: updatedOptions
    };

    onUpdate(updatedPart);
  };

  const deleteOption = (optionId: string) => {
    const updatedOptions = part.options?.filter(option => option.id !== optionId) || [];
    
    const updatedPart = {
      ...part,
      options: updatedOptions
    };

    onUpdate(updatedPart);
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
        {part.options?.map((option) => (
          <div key={option.id} className="OptionsEditor__option">
            <Input
              value={option.text}
              onChange={(e) => updateOption(option.id, { text: e.target.value })}
              placeHolder="Option text..."
            />          

            {option.action?.type === 'NAVIGATE_TO_SCENE' && (
              <SceneSelector
                multiSelect={false}
                nonDeletable
                value={option.action.params.sceneId || null}
                onChange={(sceneId) => {
                  updateAction(option.id, {
                    type: 'NAVIGATE_TO_SCENE',
                    params: { sceneId: sceneId || '' }
                  });
                }}
              />
            )}
            
            {option.action?.type === 'GIVE_ITEM' && (
              <ItemSelector
                multiSelect={false}
                nonDeletable
                value={option.action.params?.itemId || null}
                onChange={(itemId) => {
                  updateAction(option.id, {
                    type: 'GIVE_ITEM',
                    params: { itemId: itemId || '' }
                  });
                }}
              />
            )}
            
            <Dropdown
              items={actionTypes}
              selectedIndex={actionTypes.findIndex(item => item.value === option.action?.type)}
              onChange={(selectedIndex) => {
                const actionType = actionTypes[selectedIndex].value;
                if (actionType === 'NAVIGATE_TO_SCENE') {
                  updateAction(option.id, {
                    type: 'NAVIGATE_TO_SCENE',
                    params: { sceneId: '' }
                  });
                } else if (actionType === 'GIVE_ITEM') {
                  updateAction(option.id, {
                    type: 'GIVE_ITEM',
                    params: { itemId: ''}
                  });
                }
              }}
              className="OptionsEditor__action-dropdown"
            />
            
            <Button theme="primary" onClick={() => deleteOption(option.id)}>
              Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
