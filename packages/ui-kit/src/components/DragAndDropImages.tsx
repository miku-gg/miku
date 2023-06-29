import React, { useEffect, useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { DefaultImage, UploadIcon } from '../assets/svg';

import 'react-lazy-load-image-component/src/effects/blur.css';
import './DragAndDropImages.scss';
interface DragAndDropImagesProps {
  className?: string;
  placeHolder: string;
  dragAreaLabel?: string;
  onFileValidate?: (file: File) => boolean;
  errorMessage: string;
  handleChange?: (file: File) => void;
  previewImage?: string;
  size?: 'sm' | 'md' | 'lg';
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
}: DragAndDropImagesProps) => {
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [dragFile, setDragFile] = useState<File>();
  const [sourceFile, setSourceFile] = useState<string>(previewImage);
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    setSourceFile(previewImage);
  }, [previewImage]);

  const handleDropZoneChange = async (file: File) => {
    if (onFileValidate(file)) {
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64 = reader.result as string;

        setSourceFile(base64);
        setDragFile(file);
        handleChange(file);
      };

      reader.readAsDataURL(file);
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
      <div
        className={`dragAndDropImages__dropzone ${size}Size ${
          dragOver ? 'dragOver' : ''
        }`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        {!dragFile && !sourceFile ? (
          <div className="dragAndDropImages__defaultImage">
            <DefaultImage />
            <p className="maxSizeText">{placeHolder}</p>
            <UploadIcon />
          </div>
        ) : (
          <div className="dragAndDropImages__preview">
            {dragFile?.type === 'video/webm' ? (
              <video
                src={sourceFile}
                autoPlay={true}
                loop={true}
                muted={true}
              />
            ) : (
              <LazyLoadImage effect="blur" src={sourceFile} />
            )}
          </div>
        )}
      </div>
      {dragAreaLabel && <label>{dragAreaLabel}</label>}
    </div>
  );
};

export default DragAndDropImages;
