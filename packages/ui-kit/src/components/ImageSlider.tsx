import React from 'react';

import { ArrowIcon } from '../assets/svg';

import './ImageSlider.scss';

interface ImageSliderProps {
  images: {
    sources: string[];
    label: string;
    fileTypes?: string | undefined;
  }[];
  backgroundImageSource: string;
  selectedIndex: number;
  onChange: (index: number) => void;
}

const ImageSlider = ({
  images,
  backgroundImageSource,
  selectedIndex,
  onChange,
}: ImageSliderProps) => {
  const selectedImage = images[selectedIndex];

  return (
    <div className="ImageSlider">
      <div className="ImageSlider__container">
        <button
          className="ImageSlider__prevButton"
          onClick={() => onChange(-1)}
        >
          <ArrowIcon />
        </button>

        <div
          className="ImageSlider__backgroundImage"
          style={{ backgroundImage: `url(${backgroundImageSource})` }}
        >
          <img
            className="ImageSlider__selectedImage"
            src={selectedImage.sources[0]}
            alt={`img:${selectedImage.label}`}
          />
        </div>

        <button className="ImageSlider__nextButton" onClick={() => onChange(1)}>
          <ArrowIcon />
        </button>
      </div>
    </div>
  );
};
export default ImageSlider;
