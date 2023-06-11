import React, { useEffect, useRef } from 'react';

import { ArrowIcon } from '../assets/svg';

import './Carousel.scss';

interface CarouselProps {
  children: string[];
  className?: string;
  isImageCarousel?: boolean;
  onClick: (index: number) => void;
  selectedIndex: number;
}

const Carousel: React.FC<CarouselProps> = ({
  children,
  className = '',
  isImageCarousel,
  onClick,
  selectedIndex,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevSelectedIndexRef = useRef<number>(selectedIndex);

  const lastIndex: number = children.length - 1;
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

  return (
    <div className={`Carousel ${className}`}>
      <button
        className="Carousel__leftScrollButton"
        onClick={() =>
          onClick(selectedIndex === FIRST_INDEX ? lastIndex : selectedIndex - 1)
        }
      >
        <ArrowIcon />
      </button>
      <div className="Carousel__itemContainer" ref={containerRef}>
        {children.map((item, index) => (
          <button
            className={`Carousel__item ${
              index === selectedIndex ? 'selectedItem' : ''
            }`}
            key={`Carousel-item-${item}`}
            onClick={() => onClick(index)}
          >
            {isImageCarousel ? (
              <img
                alt={`Carousel image ${index + 1}`}
                src={item}
                className="Carousel__image"
              />
            ) : (
              item
            )}
          </button>
        ))}
      </div>
      <button
        className="Carousel__rightScrollButton"
        onClick={() =>
          onClick(selectedIndex === lastIndex ? FIRST_INDEX : selectedIndex + 1)
        }
      >
        <ArrowIcon />
      </button>
    </div>
  );
};

export default Carousel;
