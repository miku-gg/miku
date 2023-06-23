import React, { useEffect, useRef } from 'react';

import { ArrowIcon } from '../assets/svg';

import './Carousel.scss';

interface CarouselProps {
  items: {
    background?: string;
    contentImage?: string;
    title?: string;
  }[];
  className?: string;
  isImageCarousel?: boolean;
  onClick: (index: number, arrowClick?: boolean) => void;
  selectedIndex: number;
  size?: 'small' | 'medium' | 'large';
}

const Carousel: React.FC<CarouselProps> = ({
  items,
  size,
  className = '',
  isImageCarousel,
  onClick,
  selectedIndex,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevSelectedIndexRef = useRef<number>(selectedIndex);

  const lastIndex: number = items.length - 1;
  const FIRST_INDEX: number = 0;

  useEffect(() => {
    if (
      prevSelectedIndexRef.current !== selectedIndex &&
      containerRef.current
    ) {
      const itemElements =
        containerRef.current.querySelectorAll('.Carousel__item');
      const selectedItemElement = itemElements[selectedIndex] as HTMLElement;

      selectedItemElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });

      prevSelectedIndexRef.current = selectedIndex;
    }
  }, [selectedIndex]);

  const modifierSizeClass = size ? `Carousel--${size}` : '';

  return (
    <div className={`Carousel ${modifierSizeClass} ${className}`}>
      <button
        className="Carousel__leftScrollButton"
        onClick={() =>
          onClick(selectedIndex === FIRST_INDEX ? lastIndex : selectedIndex - 1, true)
        }
      >
        <ArrowIcon />
      </button>
      <div
        className={`Carousel__itemContainer ${
          isImageCarousel ? 'imageContainer' : ''
        }`}
        ref={containerRef}
      >
        {items.map((item, index) => (
          <button
            className={`Carousel__item ${
              index === selectedIndex ? 'selectedItem' : ''
            }`}
            key={`Carousel-item-${item.title}-index-${index}`}
            onClick={() => onClick(index, false)}
          >
            {isImageCarousel ? (
              <div
                style={{ backgroundImage: `url(${item.background})` }}
                className={`Carousel__image ${
                  index === selectedIndex ? 'selectedImage' : ''
                }`}
              >
                {item.contentImage && (
                  <img
                    src={item.contentImage}
                    alt={item.title}
                    className="Carousel__imageContent"
                  />
                )}
              </div>
            ) : null}
            {item.title}
          </button>
        ))}
      </div>
      <button
        className="Carousel__rightScrollButton"
        onClick={() =>
          onClick(selectedIndex === lastIndex ? FIRST_INDEX : selectedIndex + 1, true)
        }
      >
        <ArrowIcon />
      </button>
    </div>
  );
};

export default Carousel;
