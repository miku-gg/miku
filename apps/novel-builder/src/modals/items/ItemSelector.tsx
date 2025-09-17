import { Modal } from '@mikugg/ui-kit';
import classNames from 'classnames';
import config from '../../config';
import { useAppSelector } from '../../state/store';
import './ItemSelector.scss';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import { useState } from 'react';
import { FaTrashAlt } from 'react-icons/fa';
import { AssetDisplayPrefix } from '@mikugg/bot-utils';

interface ItemSelectorProps {
  opened: boolean;
  onCloseModal: () => void;
  selectedItemId?: string;
  onSelectItem: (itemId: string) => void;
  selectedItems?: string[];
}

export const ItemSelectorModal = ({
  opened,
  onCloseModal,
  onSelectItem,
  selectedItemId,
  selectedItems,
}: ItemSelectorProps) => {
  const items = useAppSelector((state) => state.novel.inventory) || [];
  const isSelected = (itemId: string) => {
    return selectedItems?.includes(itemId);
  };

  return (
    <Modal title="Select an Item" opened={opened} onCloseModal={onCloseModal} className="ItemSelectorModal">
      <div className="ItemSelectorModal__item-selection">
        <IoIosCloseCircleOutline className="ItemSelectorModal__closeModal" onClick={onCloseModal} />
        <div className="ItemSelectorModal__item-selection-list">
          {items.length === 0 ? (
            <div className="ItemSelectorModal__no-items">
              No items available. Create some items first.
            </div>
          ) : (
            items.map((item) => (
            <div
              className={classNames({
                'ItemSelectorModal__item-selection-item': true,
                'ItemSelectorModal__item-selection-item--selected': selectedItems
                  ? isSelected(item.id)
                  : item.id === selectedItemId,
              })}
              key={item.id}
              onClick={() => {
                if (!selectedItems?.includes(item.id)) {
                  onSelectItem(item.id);
                }
                onCloseModal();
              }}
            >
              <div
                className="ItemNode"
                style={{
                  backgroundImage: `url(${config.genAssetLink(
                    item.icon || '',
                    AssetDisplayPrefix.ITEM_IMAGE,
                  )})`,
                }}
              >
                <div className="ItemNode__title">{item.name}</div>
                <div className="ItemNode__description">{item.description}</div>
               </div>
             </div>
           ))
          )}
         </div>
      </div>
    </Modal>
  );
};

export default function ItemSelector({
  value: _value,
  multiSelect,
  nonDeletable,
  title,
  onChange,
}:
  | {
      multiSelect: true;
      value: string[];
      onChange: (itemIds: string[]) => void;
      title?: string;
      nonDeletable?: boolean;
    }
  | {
      multiSelect: false;
      value: string | null;
      onChange: (itemId: string | null) => void;
      title?: string;
      nonDeletable?: boolean;
    }) {
  const [opened, setOpened] = useState<boolean>(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const items = useAppSelector((state) => state.novel.inventory) || [];
  const value = multiSelect ? _value : _value ? [_value] : [];
  const selectedItems = items.filter((item) => value.includes(item.id));
  const selectedItemId = editingIndex !== null ? value[editingIndex] : undefined;

  return (
    <div className="ItemSelector">
      <div className="ItemSelector__content">
        {title && <div className="ItemSelector__title">{title}</div>}
        <div className="ItemSelector__selected-items">
          {selectedItems.map((item, index) => (
            <div
              className="ItemNode"
              tabIndex={0}
              key={`item-selector-${item.id}`}
              onClick={() => {
                setOpened(true);
                setEditingIndex(index);
              }}
              style={{
                backgroundImage: `url(${config.genAssetLink(
                  item.icon || '',
                  AssetDisplayPrefix.ITEM_IMAGE,
                )})`,
              }}
            >
              <div className="ItemNode__title">{item.name}</div>
              {!nonDeletable && (
                <FaTrashAlt
                  className="ItemNode__delete"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (multiSelect) {
                      onChange(value.filter((itemId) => itemId !== item.id));
                    } else {
                      onChange(null);
                    }
                  }}
                />
              )}
              <div className="ItemNode__description">{item.description}</div>
            </div>
          ))}
          {(multiSelect && value.length < 3) || (!multiSelect && value.length === 0) ? (
            <div
              className="ItemNode"
              tabIndex={0}
              onClick={() => {
                setOpened(true);
                setEditingIndex(value.length);
              }}
              style={{
                backgroundImage: `url(${config.genAssetLink('add_item.jpg', AssetDisplayPrefix.ITEM_IMAGE)})`,
              }}
            >
              <div className="ItemNode__title">Add Item</div>
            </div>
          ) : null}
        </div>
      </div>
      <ItemSelectorModal
        opened={opened}
        onCloseModal={() => setOpened(false)}
        selectedItems={value}
        selectedItemId={selectedItemId}
        onSelectItem={(itemId) => {
          if (multiSelect) {
            if (editingIndex !== null) {
              const newValue = [...value];
              newValue[editingIndex] = itemId;
              onChange(newValue);
            }
          } else {
            onChange(itemId);
          }
          setOpened(false);
        }}
      />
    </div>
  );
}
