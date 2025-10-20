import { AreYouSure, Button, Dropdown, Input } from '@mikugg/ui-kit';
import { FaTrashAlt } from 'react-icons/fa';
import { FaPlus } from 'react-icons/fa6';
import { useAppDispatch, useAppSelector } from '../../state/store';
import { createGlobal, deleteGlobal, updateGlobal } from '../../state/slices/novelFormSlice';
import './GlobalsPanel.scss';
import { v4 as uuidv4 } from 'uuid';

export default function GlobalsPanel() {
  const dispatch = useAppDispatch();
  const variables = useAppSelector((state) => state.novel.globalVariables || []);
  const areYouSure = AreYouSure.useAreYouSure();

  const typeItems = [
    { name: 'number', value: 'number' },
    { name: 'string', value: 'string' },
  ];

  return (
    <div className="GlobalsPanel">
      <h1>Global Variables</h1>
      <div className="GlobalsPanel__actions">
        <Button theme="secondary" onClick={() => dispatch(createGlobal({ id: uuidv4() }))}>
          <FaPlus />
          Add variable
        </Button>
      </div>
      <div className="GlobalsPanel__list">
        {variables.map((v, index) => (
          <div key={v.id} className="GlobalsPanel__row">
            <div className="GlobalsPanel__cell GlobalsPanel__cell--index">{index + 1}</div>
            <div className="GlobalsPanel__cell GlobalsPanel__cell--name">
              <div className="GlobalsPanel__field">
                <label className="GlobalsPanel__label">Name</label>
                <div className="GlobalsPanel__control">
                  <Input
                    value={v.name}
                    placeHolder="Variable name"
                    onChange={(e) => dispatch(updateGlobal({ id: v.id, changes: { name: e.target.value } }))}
                    maxLength={64}
                  />
                </div>
              </div>
            </div>
            <div className="GlobalsPanel__cell GlobalsPanel__cell--type">
              <div className="GlobalsPanel__field">
                <label className="GlobalsPanel__label">Type</label>
                <div className="GlobalsPanel__control">
                  <Dropdown
                    items={typeItems}
                    selectedIndex={typeItems.findIndex((t) => t.value === v.type)}
                    onChange={(i) =>
                      dispatch(updateGlobal({ id: v.id, changes: { type: typeItems[i].value as 'number' | 'string' } }))
                    }
                  />
                </div>
              </div>
            </div>
            <div className="GlobalsPanel__cell GlobalsPanel__cell--value">
              <div className="GlobalsPanel__field">
                <label className="GlobalsPanel__label">Value</label>
                <div className="GlobalsPanel__control">
                  {v.type === 'string' ? (
                    <Input
                      isTextArea
                      placeHolder="Enter text value"
                      value={String(v.value ?? '')}
                      onChange={(e) => dispatch(updateGlobal({ id: v.id, changes: { value: e.target.value } }))}
                      maxLength={512}
                    />
                  ) : (
                    <Input
                      placeHolder="Enter numeric value"
                      value={String(v.value ?? 0)}
                      onChange={(e) => {
                        const n = Number(e.target.value);
                        dispatch(updateGlobal({ id: v.id, changes: { value: Number.isFinite(n) ? n : 0 } }));
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="GlobalsPanel__cell GlobalsPanel__cell--description">
              <div className="GlobalsPanel__field">
                <label className="GlobalsPanel__label">Description</label>
                <div className="GlobalsPanel__control">
                  <Input
                    isTextArea
                    placeHolder="Variable description..."
                    value={v.description}
                    onChange={(e) => dispatch(updateGlobal({ id: v.id, changes: { description: e.target.value } }))}
                    maxLength={1024}
                  />
                </div>
              </div>
            </div>
            <div className="GlobalsPanel__cell GlobalsPanel__cell--actions">
              <Button
                theme="secondary"
                className="danger"
                onClick={() =>
                  areYouSure.openModal({
                    title: 'Are you sure?',
                    description:
                      v.name && v.name.trim()
                        ? `Variable "${v.name.trim()}" will be deleted. This action cannot be undone.`
                        : 'This variable will be deleted. This action cannot be undone.',
                    onYes: () => {
                      dispatch(deleteGlobal(v.id));
                    },
                  })
                }
                aria-label="Delete variable"
                title="Delete"
              >
                <FaTrashAlt />
              </Button>
            </div>
          </div>
        ))}
        {variables.length > 0 && (
          <div className="GlobalsPanel__actions GlobalsPanel__actions--footer">
            <Button theme="secondary" onClick={() => dispatch(createGlobal({ id: uuidv4() }))} style={{ width: 46 }}>
              <FaPlus />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
