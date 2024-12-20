import { AreYouSure, Button, Input, Modal, TagAutocomplete } from '@mikugg/ui-kit';
import { useAppSelector } from '../state/store';
import { selectEditingSong } from '../state/selectors';
import { useDispatch } from 'react-redux';
import { closeModal } from '../state/slices/inputSlice';
import config from '../config';
import './SongEditModal.scss';
import { deleteSong, updateSong } from '../state/slices/novelFormSlice';
import { AssetDisplayPrefix } from '@mikugg/bot-utils';

export default function SongEditModal() {
  const song = useAppSelector(selectEditingSong);
  const dispatch = useDispatch();
  const { openModal } = AreYouSure.useAreYouSure();

  const handleDeleteSong = () => {
    openModal({
      title: 'Are you sure?',
      description: 'This action cannot be undone',
      onYes: () => {
        dispatch(closeModal({ modalType: 'song' }));
        if (song) {
          dispatch(deleteSong(song.id));
        }
      },
    });
  };

  return (
    <Modal
      opened={!!song}
      title="Edit Music"
      className="SongEditModal"
      shouldCloseOnOverlayClick
      onCloseModal={() => dispatch(closeModal({ modalType: 'song' }))}
    >
      {song ? (
        <div className="SongEditModal__content">
          <div className="SongEditModal__preview">
            <audio src={config.genAssetLink(song.source, AssetDisplayPrefix.MUSIC)} controls />
          </div>
          <div className="SongEditModal__inputs">
            <Input
              label="name"
              placeHolder="music1"
              value={song.name}
              onChange={(e) =>
                dispatch(
                  updateSong({
                    ...song,
                    name: e.target.value,
                  }),
                )
              }
            />
            <Input
              label="Description"
              placeHolder="hopeful, happy, energetic"
              value={song.description}
              onChange={(e) =>
                dispatch(
                  updateSong({
                    ...song,
                    description: e.target.value,
                  }),
                )
              }
            />
            <div className="SongEditModal__attributes">
              <div className="title-small">Tags</div>
              <TagAutocomplete
                value={song.tags.map((tag) => ({
                  label: tag,
                  value: tag,
                }))}
                allowCustomTag
                tags={[]}
                onChange={(tags) =>
                  dispatch(
                    updateSong({
                      ...song,
                      tags: tags.target.value,
                    }),
                  )
                }
              />
            </div>
          </div>
          <div className="SongEditModal__delete">
            <Button onClick={handleDeleteSong} theme="primary">
              Delete song
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
