import { Button } from '@mikugg/ui-kit';
import { BsStars } from 'react-icons/bs';
import './InferenceBanner.scss';

export default function InferenceBanner() {
  return (
    <div className="InferenceBanner">
      <div>
        <div className="InferenceBanner__title">Generate Characters with Emotion Packs</div>
        <div className="InferenceBanner__content">
          <img src="https://wizard-assets.miku.gg/some_workflow.png" />
          <div className="InferenceBanner__description">
            Try out image inference tool, it generates characters with their <b>emotion packs</b> and{' '}
            <b>background images</b> for your novel.
          </div>
        </div>
      </div>
      <div className="InferenceBanner__button">
        <a href="https://emotions.miku.gg" target="_blank">
          <Button theme="gradient">
            <BsStars />
            Generate Images
          </Button>
        </a>
      </div>
    </div>
  );
}
