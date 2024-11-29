import { FaPencil, FaUpload } from 'react-icons/fa6';
import config from '../../../config';
import { openModal } from '../../../state/slices/inputSlice';
import { useAppDispatch, useAppSelector } from '../../../state/store';
import './Songs.scss';
import { Blocks } from '@mikugg/ui-kit';
import { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { v4 as randomUUID } from 'uuid';
import { addSong } from '../../../state/slices/novelFormSlice';
import { MdSearch } from 'react-icons/md';
import { AssetType } from '@mikugg/bot-utils';

export default function Songs({
  selected,
  onSelect,
  displayNoneButton,
}: {
  selected?: string | undefined;
  displayNoneButton?: boolean;
  onSelect?: (id: string | undefined) => void;
}) {
  const songs = useAppSelector((state) => state.novel.songs);
  const dispatch = useAppDispatch();
  const [songUploading, setSongUploading] = useState<boolean>(false);
  const uploadSong = useRef<HTMLInputElement>(null);

  const handleUploadSong = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSongUploading(true);
    const { success, assetId } = await config.uploadAsset(file, AssetType.MUSIC);
    if (!success || !assetId) {
      setSongUploading(false);
      toast.error('Failed to upload song');
      return;
    }
    setSongUploading(false);
    const id = randomUUID();

    dispatch(
      addSong({
        id,
        tags: [],
        description: '',
        name: `song-${songs.length + 1}`,
        source: assetId,
      }),
    );
    dispatch(openModal({ modalType: 'song', editId: id }));
  };

  const getBlockItems = () => {
    let items = [];
    if (displayNoneButton && displayNoneButton !== undefined) {
      items.push({
        id: 'none',
        highlighted: selected === undefined,
        content: {
          text: 'None',
        },
        onClick: () => onSelect?.(undefined),
      });
    }
    items = [
      ...items,
      ...songs.map((song) => ({
        id: `songs-${song.id}`,
        tooltip: song.name,
        highlighted: selected === song.id,
        content: {
          text: song.name,
        },
        onEditClick: () =>
          dispatch(
            openModal({
              modalType: 'song',
              editId: song.id,
            }),
          ),
        editIcon: <FaPencil />,
        onClick: () => onSelect?.(song.id),
      })),
      {
        id: 'upload',
        content: {
          icon: <FaUpload />,
          text: 'Upload',
        },
        onClick: () => uploadSong?.current?.click(),
        loading: songUploading,
        disabled: songUploading,
      },
      {
        id: 'search',
        content: {
          icon: <MdSearch />,
          text: 'Search',
        },
        onClick: () => dispatch(openModal({ modalType: 'songSearch' })),
      },
    ];

    return items;
  };

  return (
    <div className="Songs group">
      <div className="title-small">Music</div>
      <div className="Songs__list">
        <Blocks tooltipId="songs" items={getBlockItems()} />
        <input type="file" onChange={handleUploadSong} ref={uploadSong} accept="audio/*" hidden />
      </div>
    </div>
  );
}
