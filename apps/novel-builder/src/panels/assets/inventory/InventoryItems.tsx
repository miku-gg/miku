import { Blocks } from "@mikugg/ui-kit";
import { FaPencil } from "react-icons/fa6";
import { MdSearch } from "react-icons/md";
import { useDispatch } from "react-redux";
import { v4 as randomUUID } from "uuid";
import { openModal } from "../../../state/slices/inputSlice";
import { createNewInventoryItem } from "../../../state/slices/novelFormSlice";
import { useAppSelector } from "../../../state/store";
import "./InventoryItems.scss"; // Import the SCSS file

const InventoryItems = ({
  selected,
  onSelect,
}: {
  selected?: string;
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
      id: `songs-${item.id}`,
      tooltip: item.name,
      content: {
        text: item.name,
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
    <div className="Songs group">
      <div className="title-small">Items</div>
      <div className="Songs__list">
        <Blocks
          tooltipId="songs"
          items={[
            ...createItemBlocks(),

            {
              id: "create",
              content: {
                icon: <MdSearch />,
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
