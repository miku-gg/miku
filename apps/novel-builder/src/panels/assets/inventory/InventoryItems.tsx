import { Blocks, Tooltip } from '@mikugg/ui-kit';
import { FaHammer } from 'react-icons/fa';
import { FaPencil } from 'react-icons/fa6';
import { IoInformationCircleOutline } from 'react-icons/io5';
import { useDispatch } from 'react-redux';
import { v4 as randomUUID } from 'uuid';
import config from '../../../config';
import { openModal } from '../../../state/slices/inputSlice';
import { createNewInventoryItem } from '../../../state/slices/novelFormSlice';
import { useAppSelector } from '../../../state/store';
import './InventoryItems.scss'; // Import the SCSS file
import { AssetDisplayPrefix } from '@mikugg/bot-utils';

const InventoryItems = ({
  selectedItemIds,
  onSelect,
  tooltipText,
  skipItemIds,
}: {
  selectedItemIds?: string[];
  onSelect?: (id: string) => void;
  tooltipText?: string;
  skipItemIds?: string[];
}) => {
  const dispatch = useDispatch();
  const items = useAppSelector((state) => state.novel.inventory);
  const currentItems = items?.filter((item) => !skipItemIds?.includes(item.id));

  const handleCreateInventoryItem = () => {
    const id = randomUUID();
    dispatch(createNewInventoryItem({ itemId: id }));
    dispatch(openModal({ modalType: 'editInventoryItem', editId: id }));
  };

  const createItemBlocks = () => {
    if (!currentItems) return [];

    return currentItems.map((item) => ({
      id: `item-${item.id}`,
      tooltip: item.name,
      highlighted: selectedItemIds && selectedItemIds.includes(item.id),
      content: {
        text: !item.icon && item.name,
        image: item.icon && config.genAssetLink(item.icon, AssetDisplayPrefix.ITEM_IMAGE_SMALL),
      },
      onEditClick: () =>
        dispatch(
          openModal({
            modalType: 'editInventoryItem',
            editId: item.id,
          }),
        ),
      editIcon: <FaPencil />,
      onClick: () => onSelect?.(item.id),
    }));
  };

  return (
    <div className="InventoryItems group">
      <div className="InventoryItems__header">
        <h3 className="title-small">Items</h3>
        <Tooltip id="Info-Items" place="top" />
        <IoInformationCircleOutline
          data-tooltip-id="Info-Items"
          data-tooltip-content={
            tooltipText ? tooltipText : '[Optional] Custom novel items that can be used only in this novel.'
          }
        />
      </div>
      <div className="InventoryItems__list">
        <Blocks
          tooltipId="InventoryItems"
          items={[
            ...createItemBlocks(),

            {
              id: 'create',
              content: {
                icon: <FaHammer />,
                text: 'Create',
              },
              onClick: () => handleCreateInventoryItem(),
            },
          ]}
        />
      </div>
    </div>
  );
};

export default InventoryItems;
