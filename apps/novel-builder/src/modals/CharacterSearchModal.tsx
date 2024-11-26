import ItemSearch from '../components/ItemSearch';
import config from '../config';
import { AssetDisplayPrefix, NovelV3 } from '@mikugg/bot-utils';
import { closeModal } from '../state/slices/inputSlice';
import { addCharacter } from '../state/slices/novelFormSlice';
import { useAppDispatch, useAppSelector } from '../state/store';

export default function CharacterSearchModal() {
  const opened = useAppSelector((state) => state.input.modals.characterSearch.opened);
  const dispatch = useAppDispatch();

  return (
    <ItemSearch<NovelV3.NovelCharacter>
      title="Search Characters"
      opened={opened}
      pageSize={10}
      onSearch={async (query) => {
        const { result, success } = await config.search.characters(query);
        if (!success) throw new Error('Error searching characters');
        const mapCharacter = (item: NovelV3.NovelCharacter) => {
          return {
            id: item.id,
            description: item.short_description,
            name: item.name,
            previewAssetUrl: config.genAssetLink(item.profile_pic, AssetDisplayPrefix.PROFILE_PIC),
            tags: item.tags,
            value: item,
          };
        };
        return {
          success: true,
          result: {
            public: result.public.map(mapCharacter),
            private: result.private.map(mapCharacter),
          },
        };
      }}
      onSelect={(character) => {
        dispatch(closeModal({ modalType: 'characterSearch' }));
        dispatch(addCharacter(character));
      }}
      onClose={() => dispatch(closeModal({ modalType: 'characterSearch' }))}
    />
  );
}
