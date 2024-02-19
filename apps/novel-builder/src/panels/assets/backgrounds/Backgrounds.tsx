import "./Backgrounds.scss";
import { MdSearch } from "react-icons/md";
import { FaUpload } from "react-icons/fa6";
import { v4 as randomUUID } from "uuid";
import config from "../../../config";

import { Blocks } from "@mikugg/ui-kit";
import { useAppDispatch, useAppSelector } from "../../../state/store";
import { selectBackgrounds } from "../../../state/selectors";
import { addBackground } from "../../../state/slices/novelFormSlice";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { openModal } from "../../../state/slices/inputSlice";
import { FaPencil } from "react-icons/fa6";

export default function Backgrounds({
  selected,
  onSelect,
}: {
  selected?: string;
  onSelect?: (id: string) => void;
}) {
  const backgrounds = useAppSelector(selectBackgrounds);
  const dispatch = useAppDispatch();
  const [backgroundUploading, setBackgroundUploading] =
    useState<boolean>(false);
  const uploadBackground = useRef<HTMLInputElement>(null);

  const handleUploadBackground = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBackgroundUploading(true);
    const { success, assetId } = await config.uploadAsset(file);
    if (!success || !assetId) {
      setBackgroundUploading(false);
      toast.error("Failed to upload background");
      return;
    }
    setBackgroundUploading(false);
    const id = randomUUID();

    dispatch(
      addBackground({
        id,
        attributes: [],
        description: "",
        name: `background-${backgrounds.length + 1}`,
        source: {
          jpg: assetId,
        },
      })
    );
    dispatch(openModal({ modalType: "background", editId: id }));
  };

  return (
    <div className="Backgrounds group">
      <div className="title-small">Backgrounds</div>
      <Blocks
        tooltipId="backgrounds"
        items={[
          ...backgrounds.map((background) => ({
            id: `backgrounds-${background.id}`,
            tooltip: background.name,
            highlighted: selected === background.id,
            editIcon: <FaPencil />,
            onEditClick: () => {
              dispatch(
                openModal({
                  modalType: "background",
                  editId: background.id,
                })
              );
            },
            content: {
              image: config.genAssetLink(background.source.jpg, true),
            },
            onClick: () => {
              onSelect?.(background.id);
            },
          })),
          {
            id: "upload",
            highlighted: false,
            content: {
              icon: <FaUpload />,
              text: "Upload",
            },
            onClick: () => uploadBackground?.current?.click(),
            loading: backgroundUploading,
            disabled: backgroundUploading,
          },
          {
            id: "search",
            highlighted: false,
            content: {
              icon: <MdSearch />,
              text: "Search",
            },
            onClick: () =>
              dispatch(openModal({ modalType: "backgroundSearch" })),
          },
        ]}
      />
      <input
        type="file"
        onChange={handleUploadBackground}
        ref={uploadBackground}
        hidden
      />
    </div>
  );
}
