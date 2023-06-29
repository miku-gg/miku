import React, { useEffect, useRef, useState } from 'react';
import { Input, Icons, Carousel, Button, Tooltip } from '@mikugg/ui-kit';
import './BackgroundSelector.scss';
import { v4 as uuidv4 } from 'uuid';

interface BackgroundSelectorProps {
  images: {
    id: string;
    source: string;
    description: string;
  }[];
  onChange: (images: { id: string, source: string; description: string }[]) => void;
}

const BackgroundSelector = ({
  images,
  onChange,
}: BackgroundSelectorProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  useEffect(() => {
    setSelectedIndex((_index) =>
      _index >= images.length ? Math.max(images.length - 1, 0) : _index
    );
  }, [images.length]);

  const backgroundImagesInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="BackgroundSelector">
      {
        images.length > 0 && (
          <>
            <div className="BackgroundSelector__imageList">
              <Carousel
                isImageCarousel
                size="small"
                items={images.map((image) => ({
                  background: image.source
                }))}
                selectedIndex={selectedIndex}
                onClick={(index) => setSelectedIndex(index)}
              />
            </div>
            <div className="BackgroundSelector__selectedImageContainer">
              <div
                className="BackgroundSelector__selectedImage"
                style={{backgroundImage: `url(${images[selectedIndex].source})`}}
              />
              <Input
                value={images[selectedIndex].description}
                onChange={(event) => {
                  const newImages = [...images];
                  newImages[selectedIndex].description = event.target.value;
                  onChange(newImages);
                }}
              />
              <div className="BackgroundSelector__removeImage">
                <button
                  data-tooltip-id={`remove-image-tooltip`}
                  data-tooltip-html="Delete Image"
                  data-tooltip-varaint="dark"
                  onClick={() => {
                    const newImages = [...images];
                    newImages.splice(selectedIndex, 1);
                    onChange(newImages);
                    setSelectedIndex((_index) =>
                      _index >= newImages.length ? Math.max(newImages.length - 1, 0) : _index
                    );
                  }}
                >
                  <Icons.DashIcon />
                </button>
                <Tooltip
                  id="remove-image-tooltip"
                  place="left"
                />
              </div>
            </div>
        </>
        )
      }
      <div className="BackgroundSelector__upload">
        <input
          id="background-selector-upload"
          hidden
          ref={backgroundImagesInputRef}
          multiple
          type="file"
          accept="image/png, image/jpeg"
          onChange={(event) => {
            const newImages = [...images];
            const files = event.target.files || []
            for (const file of files) {
              const reader = new FileReader();
              reader.onload = (e) => {
                if (e.target?.result) {
                  newImages.push({
                    id: uuidv4(),
                    source: e.target.result.toString(),
                    description: file.name.split('.')[0],
                  });
                  onChange(newImages);
                  setSelectedIndex((_index) =>
                    _index >= newImages.length ? Math.max(newImages.length - 1, 0) : _index
                  );
                }
              };
              reader.readAsDataURL(file);
            }
          }}
        />
        <Button theme="gradient" onClick={() => backgroundImagesInputRef.current?.click()}>
          Upload More
        </Button>
      </div>
    </div>
  );
};

export default BackgroundSelector;
