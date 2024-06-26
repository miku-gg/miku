import { Blocks, Tooltip } from "@mikugg/ui-kit";
import { FaHammer } from "react-icons/fa";
import { FaPencil } from "react-icons/fa6";
import { IoInformationCircleOutline } from "react-icons/io5";
import { useDispatch } from "react-redux";
import { v4 as randomUUID } from "uuid";
import config from "../../../config";
import { openModal } from "../../../state/slices/inputSlice";
import { createNewInventoryItem } from "../../../state/slices/novelFormSlice";
import { useAppSelector } from "../../../state/store";
import "./InventoryItems.scss"; // Import the SCSS file

const InventoryItems = ({
  selectedItemIds,
  onSelect,
}: {
  selectedItemIds?: string[];
  onSelect?: (id: string) => void;
}) => {
  const dispatch = useDispatch();
  const items = useAppSelector((state) => state.novel.inventory);

  const handleCreateInventoryItem = () => {
    const id = randomUUID();
    dispatch(createNewInventoryItem({ itemId: id }));
    dispatch(openModal({ modalType: "editInventoryItem", editId: id }));
  };

  const createItemBlocks = () => {
    if (!items) return [];
    return items.map((item) => ({
      id: `item-${item.id}`,
      tooltip: item.name,
      highlighted: selectedItemIds && selectedItemIds.includes(item.id),
      content: {
        text: item.name,
        image: item.icon && config.genAssetLink(item.icon),
      },
      onEditClick: () =>
        dispatch(
          openModal({
            modalType: "editInventoryItem",
            editId: item.id,
          })
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
          data-tooltip-content="[Optional] Custom novel items that can be used only in this novel."
        />
      </div>
      <div className="InventoryItems__list">
        <Blocks
          tooltipId="InventoryItems"
          items={[
            ...createItemBlocks(),

            {
              id: "create",
              content: {
                icon: <FaHammer />,
                text: "Create",
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
