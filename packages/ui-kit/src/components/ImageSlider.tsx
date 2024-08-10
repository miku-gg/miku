import React from 'react';

import { ArrowIcon } from '../assets/svg';

import './ImageSlider.scss';

interface ImageSliderProps {
  images: {
    source: string;
    label: string;
    fileTypes?: string | undefined;
  }[];
  backgroundImageSource: string;
  selectedIndex: number;
  fullWidth?: boolean;
  onChange: (index: number) => void;
}

const ImageSlider = ({ images, backgroundImageSource, selectedIndex, fullWidth, onChange }: ImageSliderProps) => {
  const selectedImage = images[selectedIndex] || {
    source: '',
    label: '',
  };

  return (
    <div className="ImageSlider" style={fullWidth ? { backgroundImage: `url(${backgroundImageSource})` } : undefined}>
      <div className="ImageSlider__container">
        <button className="ImageSlider__prevButton" onClick={() => onChange(-1)}>
          <ArrowIcon />
        </button>

        <div
          className="ImageSlider__backgroundImage"
          style={!fullWidth ? { backgroundImage: `url(${backgroundImageSource})` } : undefined}
        >
          {selectedImage.source.indexOf('video/webm') !== -1 ? (
            <video
              className="ImageSlider__selectedImage"
              src={selectedImage.source}
              autoPlay={true}
              loop={true}
              muted={true}
            />
          ) : (
            <img className="ImageSlider__selectedImage" src={selectedImage.source} alt={`img:${selectedImage.label}`} />
          )}
        </div>

        <button className="ImageSlider__nextButton" onClick={() => onChange(1)}>
          <ArrowIcon />
        </button>
      </div>
    </div>
  );
};
export default ImageSlider;
