import { Button, Dropdown, Input } from '@mikugg/ui-kit';
import { useAppDispatch, useAppSelector } from '../../state/store';
import { createGlobal, deleteGlobal, updateGlobal } from '../../state/slices/novelFormSlice';
import './GlobalsPanel.scss';
import { v4 as uuidv4 } from 'uuid';

export default function GlobalsPanel() {
  const dispatch = useAppDispatch();
  const variables = useAppSelector((state) => state.novel.globalVariables || []);

  const typeItems = [
    { name: 'number', value: 'number' },
    { name: 'string', value: 'string' },
  ];

  return (
    <div className="GlobalsPanel">
      <h1>Global Variables</h1>
      <div className="GlobalsPanel__actions">
        <Button theme="primary" onClick={() => dispatch(createGlobal({ id: uuidv4() }))}>
          Add variable
        </Button>
      </div>
      <div className="GlobalsPanel__list">
        {variables.map((v, index) => (
          <div key={v.id} className="GlobalsPanel__row">
            <div className="GlobalsPanel__cell GlobalsPanel__cell--index">{index + 1}</div>
            <div className="GlobalsPanel__cell">
              <Input
                label="Name"
                value={v.name}
                placeHolder="Variable name"
                onChange={(e) => dispatch(updateGlobal({ id: v.id, changes: { name: e.target.value } }))}
                maxLength={64}
              />
            </div>
            <div className="GlobalsPanel__cell GlobalsPanel__cell--type">
              <Dropdown
                items={typeItems}
                selectedIndex={typeItems.findIndex((t) => t.value === v.type)}
                onChange={(i) =>
                  dispatch(updateGlobal({ id: v.id, changes: { type: typeItems[i].value as 'number' | 'string' } }))
                }
              />
            </div>
            <div className="GlobalsPanel__cell GlobalsPanel__cell--description">
              <Input
                label="Description"
                placeHolder="Variable description..."
                value={v.description}
                onChange={(e) => dispatch(updateGlobal({ id: v.id, changes: { description: e.target.value } }))}
                maxLength={256}
              />
            </div>
            <div className="GlobalsPanel__cell GlobalsPanel__cell--actions">
              <Button theme="primary" onClick={() => dispatch(deleteGlobal(v.id))}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
