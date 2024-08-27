import './EmotionRenderer.scss';

export default function EmotionRenderer({
  assetUrl,
  className = '',
  upDownAnimation = false,
  assetLinkLoader,
}: {
  assetUrl: string;
  className?: string;
  upDownAnimation?: boolean;
  assetLinkLoader: (asset: string, lowres?: boolean) => string;
}): JSX.Element {
  if (assetUrl.endsWith('.webm')) {
    return (
      <video
        className={`${className} ${upDownAnimation ? 'fade-in up-and-down' : ''}`}
        src={assetLinkLoader(assetUrl)}
        loop
        autoPlay
        muted
      />
    );
  } else {
    return (
      <img
        className={`${className} ${upDownAnimation ? 'fade-in up-and-down' : ''}`}
        src={assetLinkLoader(assetUrl)}
        alt="character"
        onError={({ currentTarget }) => {
          currentTarget.onerror = null;
          currentTarget.src = '';
        }}
      />
    );
  }
}
