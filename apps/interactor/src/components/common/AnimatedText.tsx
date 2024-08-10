import './AnimatedText.scss';

export default function AnimatedText({
  text,
  className = '',
  minLength = 7,
}: {
  text: string;
  className?: string;
  minLength?: number;
}) {
  const speed = 5;
  const position = Math.max(text.length + 10, 20);
  const animationDuration = Math.max(text.length / speed, 3);

  return (
    <div className={minLength < text.length ? 'AnimatedText__container' : ''}>
      <div
        className={`${minLength < text.length ? 'AnimatedText' : ''} ${className}`}
        style={
          {
            '--initial-text-position': `100%`,
            '--ending-text-position': `${-position}ch`,
            '--animation-duration': `${animationDuration}s`,
          } as React.CSSProperties
        }
      >
        {text}
      </div>
    </div>
  );
}
