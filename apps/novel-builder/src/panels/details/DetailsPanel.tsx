import { DragAndDropImages, Input, Dropdown } from '@mikugg/ui-kit';
import { toast } from 'react-toastify';
import config, { MAX_FILE_SIZE } from '../../config';
import { checkFileType } from '../../libs/utils';
import { updateDetails } from '../../state/slices/novelFormSlice';
import { useAppDispatch, useAppSelector } from '../../state/store';
import ReactCountryFlag from 'react-country-flag';

import './DetailsPanel.scss';
import { LorebookList } from './LorebookList';
import { AssetDisplayPrefix, AssetType } from '@mikugg/bot-utils';

const languageOptions = [
  { code: 'en', name: 'English', flag: 'GB' },
  { code: 'es', name: 'Español', flag: 'ES' },
  // { code: 'es_es', name: 'Español (España)', flag: 'ES' },
  { code: 'es_ar', name: 'Español (Argentina)', flag: 'AR' },
  { code: 'es_cl', name: 'Español (Chile)', flag: 'CL' },
  { code: 'fr', name: 'Français', flag: 'FR' },
  { code: 'pt_br', name: 'Português (Brasil)', flag: 'BR' },
  { code: 'pt', name: 'Português', flag: 'PT' },
  { code: 'de', name: 'Deutsch', flag: 'DE' },
  { code: 'ru', name: 'Русский', flag: 'RU' },
  { code: 'jp', name: '日本語', flag: 'JP' },
];

export default function DetailsPanel() {
  const dispatch = useAppDispatch();

  const { title, description, author, logoPic, language } = useAppSelector((state) => state.novel);

  const handleLogoPicChange = async (file: File) => {
    if (file) {
      try {
        const asset = await config.uploadAsset(file, AssetType.NOVEL_PIC);
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

  const selectedLanguageIndex = languageOptions.findIndex((lang) => lang.code === (language || 'en'));

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
          <div className="DetailsPanel__formGroup">
            <label>Language</label>
            <Dropdown
              items={languageOptions.map((lang) => ({
                content: (
                  <div className="DetailsPanel__language-option">
                    <ReactCountryFlag countryCode={lang.flag} svg />
                    <span>{lang.name}</span>
                  </div>
                ),
                name: lang.code,
                value: lang.code,
              }))}
              selectedIndex={selectedLanguageIndex}
              onChange={(index) => {
                dispatch(
                  updateDetails({
                    name: 'language',
                    value: languageOptions[index].code,
                  }),
                );
              }}
            />
          </div>
        </div>
        <div className="DetailsPanel__formGroup">
          <label>Upload novel icon (256x256)</label>
          <DragAndDropImages
            size="lg"
            className="DetailsPanel__logoPic"
            handleChange={handleLogoPicChange}
            previewImage={logoPic && config.genAssetLink(logoPic, AssetDisplayPrefix.PROFILE_PIC)}
            placeHolder="(256x256)"
            onFileValidate={async (file) => {
              if (file.size > MAX_FILE_SIZE) {
                toast.error('File size should be less than 5MB');
                return false;
              }
              if (!checkFileType(file, ['image/png', 'image/jpeg', 'image/webp'])) {
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
