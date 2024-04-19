import { FaPencil, FaUpload } from "react-icons/fa6";
import config from "../../../config";
import { openModal } from "../../../state/slices/inputSlice";
import { useAppDispatch, useAppSelector } from "../../../state/store";
import "./Songs.scss";
import { Blocks } from "@mikugg/ui-kit";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { v4 as randomUUID } from "uuid";
import { addSong } from "../../../state/slices/novelFormSlice";
import { MdSearch } from "react-icons/md";

export default function Songs({
  selected,
  onSelect,
}: {
  selected?: string;
  onSelect?: (id: string) => void;
}) {
  const songs = useAppSelector((state) => state.novel.songs);
  const dispatch = useAppDispatch();
  const [songUploading, setSongUploading] = useState<boolean>(false);
  const uploadSong = useRef<HTMLInputElement>(null);

  const handleUploadSong = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSongUploading(true);
    const { success, assetId } = await config.uploadAsset(file);
    if (!success || !assetId) {
      setSongUploading(false);
      toast.error("Failed to upload song");
      return;
    }
    setSongUploading(false);
    const id = randomUUID();

    dispatch(
      addSong({
        id,
        tags: [],
        description: "",
        name: `song-${songs.length + 1}`,
        source: assetId,
      })
    );
    dispatch(openModal({ modalType: "song", editId: id }));
  };

  return (
    <div className="Songs group">
      <div className="title-small">Music</div>
      <div className="Songs__list">
        <Blocks
          tooltipId="songs"
          items={[
            ...songs.map((song) => ({
              id: `songs-${song.id}`,
              tooltip: song.name,
              content: {
                text: song.name,
              },
              onEditClick: () =>
                dispatch(
                  openModal({
                    modalType: "song",
                    editId: song.id,
                  })
                ),
              editIcon: <FaPencil />,
              onClick: () => onSelect?.(song.id),
            })),
            {
              id: "upload",
              content: {
                icon: <FaUpload />,
                text: "Upload",
              },
              onClick: () => uploadSong?.current?.click(),
              loading: songUploading,
              disabled: songUploading,
            },
            {
              id: "search",
              content: {
                icon: <MdSearch />,
                text: "Search",
              },
              onClick: () => dispatch(openModal({ modalType: "songSearch" })),
            },
          ]}
        />
        <input
          type="file"
          onChange={handleUploadSong}
          ref={uploadSong}
          accept="audio/*"
          hidden
        />
      </div>
    </div>
  );
}
