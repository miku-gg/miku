import ItemSearch from '../components/ItemSearch';
import config from '../config';
import { AssetDisplayPrefix, NovelV3 } from '@mikugg/bot-utils';
import { closeModal } from '../state/slices/inputSlice';
import { addBackground } from '../state/slices/novelFormSlice';
import { useAppDispatch, useAppSelector } from '../state/store';

export default function BackgroundSearchModal() {
  const opened = useAppSelector((state) => state.input.modals.backgroundSearch.opened);
  const dispatch = useAppDispatch();

  return (
    <ItemSearch<NovelV3.NovelBackground>
      title="Search Backgrounds"
      opened={opened}
      pageSize={10}
      onSearch={async (query) => {
        const { result, success } = await config.search.backgrounds(query);
        if (!success) throw new Error('Error searching backgrounds');
        const mapBackground = (item: NovelV3.NovelBackground) => {
          return {
            id: item.id,
            description: item.description,
            name: item.name,
            previewAssetUrl: config.genAssetLink(item.source.jpg, AssetDisplayPrefix.BACKGROUND_IMAGE_SMALL),
            tags: item.attributes.map((attr) => (attr?.length && attr[1]) || '').filter((x) => x),
            value: item,
          };
        };
        return {
          success: true,
          result: {
            public: result.public.map(mapBackground),
            private: result.private.map(mapBackground),
          },
        };
      }}
      onSelect={(background) => {
        dispatch(closeModal({ modalType: 'backgroundSearch' }));
        dispatch(addBackground(background));
      }}
      onClose={() => dispatch(closeModal({ modalType: 'backgroundSearch' }))}
    />
  );
}
