import React, { useEffect, useRef, useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { DefaultImage, UploadIcon } from '../assets/svg';
import 'react-lazy-load-image-component/src/effects/blur.css';
import './DragAndDropImages.scss';
import Loader from './Loader';
interface DragAndDropImagesProps {
  className?: string;
  placeHolder: string;
  dragAreaLabel?: string;
  onFileValidate?: (file: File) => boolean | Promise<boolean>;
  errorMessage?: string;
  handleChange?: ((file: File) => void) | ((file: File) => Promise<void>);
  previewImage?: string;
  size?: 'sm' | 'md' | 'lg';
  accept?: string;
  placeHolderImage?: React.ReactNode;
  loading?: boolean;
}

const DragAndDropImages = ({
  className = '',
  placeHolder,
  dragAreaLabel,
  onFileValidate = () => true,
  errorMessage,
  handleChange,
  previewImage = '',
  size = 'md',
  accept = 'image/*',
  loading: loadingProp,
  placeHolderImage = <DefaultImage />,
}: DragAndDropImagesProps) => {
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [_loading, setLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null); // Create a ref for the file input

  const loading = loadingProp ?? _loading;

  const handleClick = () => {
    fileInputRef.current?.click(); // Trigger click event of file input when dropzone is clicked
  };

  const handleDropZoneChange = async (file: File, event?: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    if (await onFileValidate(file)) {
      handleChange && (await handleChange(file));
      setLoading(false);
    } else if (errorMessage) {
      alert(errorMessage);
      if (event?.target) event.target.value = '';
    }
    setLoading(false);
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
        accept={accept}
        onChange={(event) => {
          const file = event.target.files?.[0];
          file && handleDropZoneChange(file, event);
        }}
      />
      <div
        className={`dragAndDropImages__dropzone ${size}Size ${dragOver ? 'dragOver' : ''}`}
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
            {previewImage.indexOf('video/') !== -1 ||
            previewImage.endsWith('.webm') ||
            previewImage.endsWith('.mp4') ? (
              <video src={previewImage} autoPlay={true} loop={true} muted={true} />
            ) : (
              <LazyLoadImage effect="blur" src={previewImage} />
            )}
          </div>
        )}
        {loading ? (
          <div className="dragAndDropImages__loader">
            <Loader />
          </div>
        ) : null}
      </div>
      {dragAreaLabel && <label>{dragAreaLabel}</label>}
    </div>
  );
};

export default DragAndDropImages;
