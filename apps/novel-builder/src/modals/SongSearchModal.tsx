import ItemSearch from '../components/ItemSearch';
import config from '../config';
import { AssetDisplayPrefix, NovelV3 } from '@mikugg/bot-utils';
import { closeModal } from '../state/slices/inputSlice';
import { addSong } from '../state/slices/novelFormSlice';
import { useAppDispatch, useAppSelector } from '../state/store';

export default function SongSearchModal() {
  const opened = useAppSelector((state) => state.input.modals.songSearch.opened);
  const dispatch = useAppDispatch();

  return (
    <ItemSearch<NovelV3.NovelSong>
      title="Search Songs"
      opened={opened}
      pageSize={10}
      onSearch={async (query) => {
        const { result, success } = await config.search.songs(query);
        if (!success) throw new Error('Error searching songs');
        const mapSong = (item: NovelV3.NovelSong) => {
          return {
            id: item.id,
            description: item.description,
            name: item.name,
            previewAssetUrl: config.genAssetLink(item.source, AssetDisplayPrefix.MUSIC),
            tags: item.tags,
            value: item,
          };
        };
        return {
          success: true,
          result: {
            public: result.public.map(mapSong),
            private: result.private.map(mapSong),
          },
        };
      }}
      onSelect={(song) => {
        dispatch(closeModal({ modalType: 'songSearch' }));
        dispatch(addSong(song));
      }}
      onClose={() => dispatch(closeModal({ modalType: 'songSearch' }))}
    />
  );
}
