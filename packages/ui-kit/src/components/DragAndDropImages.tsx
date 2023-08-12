import React, { useEffect, useRef, useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { DefaultImage, UploadIcon } from '../assets/svg';
import 'react-lazy-load-image-component/src/effects/blur.css';
import './DragAndDropImages.scss';
interface DragAndDropImagesProps {
  className?: string;
  placeHolder: string;
  dragAreaLabel?: string;
  onFileValidate?: (file: File) => boolean | Promise<boolean>;
  errorMessage: string;
  handleChange?: (file: File) => void;
  previewImage?: string;
  size?: 'sm' | 'md' | 'lg';
  placeHolderImage?: React.ReactNode;
}

const DragAndDropImages = ({
  className = '',
  placeHolder,
  dragAreaLabel,
  onFileValidate = () => true,
  errorMessage = 'Please upload an correct file format.',
  handleChange,
  previewImage = '',
  size = 'md',
  placeHolderImage = <DefaultImage />,
}: DragAndDropImagesProps) => {
  const [dragOver, setDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null); // Create a ref for the file input

  const handleClick = () => {
    fileInputRef.current?.click(); // Trigger click event of file input when dropzone is clicked
  };

  const handleDropZoneChange = async (file: File) => {
    if (await onFileValidate(file)) {
      handleChange(file);
    } else {
      alert(errorMessage);
    }
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);

    const file = event.dataTransfer.files[0];

    file && handleDropZoneChange(file);
  };

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = () => {
    setDragOver(false);
  };

  return (
    <div className={`dragAndDropImages ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }} // Hide the file input
        onChange={(event) => {
          const file = event.target.files?.[0];
          file && handleDropZoneChange(file);
        }}
      />
      <div
        className={`dragAndDropImages__dropzone ${size}Size ${
          dragOver ? 'dragOver' : ''
        }`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={handleClick}
      >
        {!previewImage ? (
          <div className="dragAndDropImages__defaultImage">
            {placeHolderImage}
            <p className="maxSizeText">{placeHolder}</p>
            <UploadIcon />
          </div>
        ) : (
          <div className="dragAndDropImages__preview">
            {previewImage.indexOf('video/webm') !== -1 ? (
              <video
                src={previewImage}
                autoPlay={true}
                loop={true}
                muted={true}
              />
            ) : (
              <LazyLoadImage effect="blur" src={previewImage} />
            )}
          </div>
        )}
      </div>
      {dragAreaLabel && <label>{dragAreaLabel}</label>}
    </div>
  );
};

export default DragAndDropImages;
