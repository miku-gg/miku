import { DragAndDropImages, Input } from '@mikugg/ui-kit';
import { toast } from 'react-toastify';
import config from '../../config';
import { checkFileType } from '../../libs/utils';
import { updateDetails } from '../../state/slices/novelFormSlice';
import { useAppDispatch, useAppSelector } from '../../state/store';

import './DetailsPanel.scss';
import { LorebookList } from './LorebookList';
export default function DetailsPanel() {
  const dispatch = useAppDispatch();

  const { title, description, author, logoPic } = useAppSelector((state) => state.novel);

  const handleLogoPicChange = async (file: File) => {
    if (file) {
      try {
        const asset = await config.uploadAsset(file);
        dispatch(
          updateDetails({
            name: 'logoPic',
            value: asset.assetId,
          }),
        );
      } catch (e) {
        toast.error('Error uploading the image');
        console.error(e);
      }
    }
  };

  return (
    <div className="DetailsPanel">
      <h1>Details</h1>
      <div className="DetailsPanel__form">
        <div className="DetailsPanel__texts">
          <div className="DetailsPanel__formGroup">
            <Input
              placeHolder="The title of your Novel"
              id="title"
              name="title"
              label="Novel Title"
              description="The title of your Novel"
              value={title}
              onChange={(e) => {
                dispatch(
                  updateDetails({
                    name: 'title',
                    value: e.target.value,
                  }),
                );
              }}
            />
          </div>
          <div className="DetailsPanel__formGroup">
            <Input
              placeHolder="The description of your Novel"
              id="description"
              name="description"
              label="Novel Description"
              description="The description of your Novel"
              value={description}
              onChange={(e) => {
                dispatch(
                  updateDetails({
                    name: 'description',
                    value: e.target.value,
                  }),
                );
              }}
            />
          </div>
          <div className="DetailsPanel__formGroup">
            <Input
              placeHolder="The author of the Novel"
              id="author"
              name="author"
              label="Author"
              description="The author of the Novel"
              value={author}
              onChange={(e) => {
                dispatch(
                  updateDetails({
                    name: 'author',
                    value: e.target.value,
                  }),
                );
              }}
            />
          </div>
          <div className="DetailsPanel__formGroup"></div>
        </div>
        <div className="DetailsPanel__formGroup">
          <label>Upload novel icon (256x256)</label>
          <DragAndDropImages
            size="lg"
            className="DetailsPanel__logoPic"
            handleChange={handleLogoPicChange}
            previewImage={logoPic && config.genAssetLink(logoPic)}
            placeHolder="(256x256)"
            onFileValidate={async (file) => {
              if (file.size > 2 * 1024 * 1024) {
                toast.error('File size should be less than 1MB');
                return false;
              }
              if (!checkFileType(file, ['image/png', 'image/jpeg'])) {
                toast.error('Invalid file type. Please upload a valid image file');
                return false;
              }
              return true;
            }}
          />
        </div>
      </div>
      <LorebookList tooltipText="Prompt collections dynamically used by the AI." />
    </div>
  );
}
