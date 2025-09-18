import { DragAndDropImages } from '@mikugg/ui-kit';
import { checkFileType } from '../../libs/utils';
import { AssetDisplayPrefix } from '@mikugg/bot-utils';
import config from '../../config';
import AudioPreview from '../../components/AudioPreview';

interface CharacterOutfitFullscreenEmotionsGeneratorProps {
  groupIndex: number;
  group: any; // The outfit group
  characterId: string;
  pendingInferences?: any[];
  handleFullscreenImageChange: (file: File, groupIndex: number, emotionId: string, variant: 'desktop' | 'mobile') => Promise<void>;
}

export default function CharacterOutfitFullscreenEmotionsGenerator({
  groupIndex,
  group,
  characterId,
  pendingInferences,
  handleFullscreenImageChange,
}: CharacterOutfitFullscreenEmotionsGeneratorProps) {
  // Fullscreen emotions template
  const fullscreenEmotionIds = [
    'angry',
    'sad',
    'happy',
    'disgusted',
    'scared',
    'embarrased',
    'surprised',
    'neutral',
    'confused',
  ];

  const renderFullscreenEmotionButtons = () => {
    return fullscreenEmotionIds.map((emotionId) => {
      const emotion = group.emotions.find((img: any) => img.id === emotionId);
      const isPending = pendingInferences?.some(
        (inf) =>
          inf.characterId === characterId &&
          inf.outfitId === group.id &&
          ((inf.inferenceType === 'emotion' && inf.emotionId === emotionId) ||
            (inf.inferenceType === 'character' && 'neutral' === emotionId)),
      );

      return (
        <div
          className="CharacterOutfitsEdit__emotionPreview"
          key={`fullscreen_emotion_${emotionId}_group_${group.template}_${groupIndex}`}
        >
          <div style={{ marginBottom: '10px', fontWeight: 'bold', textAlign: 'center' }}>
            {emotionId}
          </div>
          
          {/* Desktop Upload */}
          <div style={{ marginBottom: '8px' }}>
            <DragAndDropImages
              size="sm"
              dragAreaLabel={`${emotionId} (Desktop)`}
              handleChange={(file) => handleFullscreenImageChange(file, groupIndex, emotionId, 'desktop')}
              previewImage={
                emotion?.sources.desktop
                  ? config.genAssetLink(emotion?.sources.desktop, AssetDisplayPrefix.EMOTION_IMAGE)
                  : undefined
              }
              placeHolder="Desktop 16:9"
              loading={isPending}
              onFileValidate={(file) => {
                return checkFileType(file, ['image/png', 'image/gif', 'image/webp', 'video/webm']);
              }}
            />
          </div>
          
          {/* Mobile Upload */}
          <div>
            <DragAndDropImages
              size="sm"
              dragAreaLabel={`${emotionId} (Mobile)`}
              handleChange={(file) => handleFullscreenImageChange(file, groupIndex, emotionId, 'mobile')}
              previewImage={
                emotion?.sources.mobile
                  ? config.genAssetLink(emotion?.sources.mobile, AssetDisplayPrefix.EMOTION_IMAGE)
                  : undefined
              }
              placeHolder="Mobile"
              loading={isPending}
              onFileValidate={(file) => {
                return checkFileType(file, ['image/png', 'image/gif', 'image/webp', 'video/webm']);
              }}
            />
          </div>
          
          {/* Audio Preview (if exists) */}
          {emotion?.sources.sound ? (
            <div className="CharacterOutfitsEdit__audioPreview">
              <AudioPreview src={config.genAssetLink(emotion?.sources.sound, AssetDisplayPrefix.EMOTION_SOUND)} />
            </div>
          ) : null}
        </div>
      );
    });
  };

  return (
    <div className="CharacterOutfitsEdit__emotions">
      {renderFullscreenEmotionButtons()}
    </div>
  );
}
