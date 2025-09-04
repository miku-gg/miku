import { Input, DragAndDropImages } from '@mikugg/ui-kit';
import { toast } from 'react-toastify';
import './CustomPersonaDescriptionEdit.scss';
import { useAppDispatch, useAppSelector } from '../../state/store';
import { createCustomPersona, updateCustomPersona } from '../../state/slices/novelFormSlice';
import config, { MAX_FILE_SIZE } from '../../config';
import { AssetDisplayPrefix, AssetType } from '@mikugg/bot-utils';
import { checkFileType } from '../../libs/utils';

export default function CustomPersonaDescriptionEdit({ personaId }: { personaId?: string }) {
  const dispatch = useAppDispatch();
  const customPersona = useAppSelector((state) => state.novel.customPersona);

  const persona = customPersona;

  if (!persona) {
    return (
      <div className="CustomPersonaDescriptionEdit">
        <div className="CustomPersonaDescriptionEdit__placeholder">
          <p>No custom persona found. Create one to get started.</p>
          <button 
            onClick={() => dispatch(createCustomPersona(''))}
            className="CustomPersonaDescriptionEdit__create-button"
          >
            Create Custom Persona
          </button>
        </div>
      </div>
    );
  }

  const handleProfilePicChange = async (file: File) => {
    if (file && persona) {
      try {
        const asset = await config.uploadAsset(file, AssetType.CHARACTER_PIC);
        dispatch(
          updateCustomPersona({
            ...persona,
            profilePic: asset.assetId,
          }),
        );
      } catch (e) {
        toast.error('Error uploading the image');
        console.error(e);
      }
    }
  };

  const imageUrl = config.genAssetLink(persona.profilePic || 'empty_char.png', AssetDisplayPrefix.PROFILE_PIC);
  return (
    <div className="CustomPersonaDescriptionEdit">
      <div className="CustomPersonaDescriptionEdit__profile-picture-container">
        <DragAndDropImages
          size="lg"
          className="CustomPersonaDescriptionEdit__avatar"
          handleChange={handleProfilePicChange}
          previewImage={imageUrl}
          placeHolder="(256x256)"
          onFileValidate={(file) => {
            if (file.size > MAX_FILE_SIZE) {
              toast.error('File size should be less than 5MB');
              return false;
            }
            if (!checkFileType(file)) {
              toast.error('Invalid file type. Please upload a valid image file');
              return false;
            }
            return true;
          }}
        />
      </div>
      <div className="CustomPersonaDescriptionEdit__form-fields">
          <Input
            placeHolder="Enter persona name"
            id="name"
            name="name"
            label="Persona Name"
            description="The name of your custom persona"
            value={persona.name || ''}
            onChange={(e) => {
              dispatch(updateCustomPersona({ ...persona, name: e.target.value }));
            }}
          />

          <Input
            isTextArea
            placeHolder="Describe the persona's personality, behavior, and characteristics..."
            id="description"
            name="description"
            label="Persona Description"
            description="Describe the persona's personality, behavior, and characteristics"
            value={persona.description || ''}
            onChange={(e) => {
              dispatch(updateCustomPersona({ ...persona, description: e.target.value }));
            }}
          />
        </div>
      </div>
  );
}
