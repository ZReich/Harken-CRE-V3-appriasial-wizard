import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import './crop-image.css';

interface Props {
  getText: (event: any) => void;
  check?: (event: any) => void;
  formDataObjectGet: (event: any) => void;
  type: any;
  field?: any;
  src?: any;
  setSrc?: any;
  allignment?: string;
  uniqueValue?: any;
}

const CropImage: React.FC<Props> = ({
  getText,
  formDataObjectGet,
  type,
  field,
  check,
  uniqueValue,
}: any) => {
  const formDataObject: any = new FormData();
  const [src, setSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 30,
    x: 35,
    y: 35,
    aspect:
      uniqueValue === 'cover'
        ? 3.142
        : uniqueValue === 'table-of-contents'
          ? 0.855
          : uniqueValue === 'executive-summary-details'
            ? 0.802
            : uniqueValue === 'property-summary-top-image'
              ? 1.363
              : uniqueValue === 'property-summary-bottom-image'
                ? 1.333
                : 1.237,
  });
  const [canvasSrc, setCanvasSrc] = useState<string | null>(null);
  const [originalImageRef, setOriginalImageRef] = useState<HTMLImageElement | null>(null);
  console.log(originalImageRef)
  const createCanvasImage = (imageSrc: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        // Set canvas to container size
        canvas.width = 600;
        canvas.height = 450;

        // Fill with transparent background
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Calculate centered position for original image
        const scale = Math.min(500 / img.width, 400 / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const x = (canvas.width - scaledWidth) / 2;
        const y = (canvas.height - scaledHeight) / 2;

        // Draw original image centered
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

        setOriginalImageRef(img);
        resolve(canvas.toDataURL());
      };
      img.src = imageSrc;
    });
  };

  useEffect(() => {
    if (src) {
      createCanvasImage(src).then(setCanvasSrc);
    }
  }, [src]);

  useEffect(() => {
    const newAspect = uniqueValue === 'cover'
      ? 3.142
      : uniqueValue === 'table-of-contents'
        ? 0.855
        : uniqueValue === 'executive-summary-details'
          ? 0.802
          : uniqueValue === 'property-summary-top-image'
            ? 1.363
            : uniqueValue === 'property-summary-bottom-image'
              ? 1.333
              : 1.237;

    // Calculate center position
    const cropWidth = 30;
    const cropHeight = cropWidth / newAspect;
    const centerX = (100 - cropWidth) / 2;

    // Adjust vertical centering for different aspect ratios
    let centerY;
    if (newAspect < 1) {
      // For vertical crops, adjust the Y position to be more centered
      centerY = (100 - cropHeight) / 2 - 5; // Slight upward adjustment
    } else {
      centerY = (100 - cropHeight) / 2;
    }

    setCrop((prevCrop) => ({
      ...prevCrop,
      aspect: newAspect,
      x: centerX,
      y: centerY
    }));
  }, [uniqueValue]);

  const onSelectFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        if (typeof reader.result === 'string') {
          setSrc(reader.result);
          check(reader.result);
        }
      });
      getText(true);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const onImageLoaded = (image: HTMLImageElement) => {
    imageRef.current = image;

    // Simple center positioning for canvas-based cropping
    const cropAspectRatio = crop.aspect || 1;
    const cropWidth = 50;
    const cropHeight = cropWidth / cropAspectRatio;
    const centerX = (100 - cropWidth) / 2;
    const centerY = (100 - cropHeight) / 2;

    setCrop(prevCrop => ({
      ...prevCrop,
      width: cropWidth,
      height: cropHeight,
      x: centerX,
      y: centerY
    }));
  };

  const onCropChange = (crop: Crop) => {
    setCrop(crop);
  };

  const onCropComplete = (crop: Crop) => {
    makeClientCrop(crop);
  };

  const makeClientCrop = async (crop: Crop) => {
    if (imageRef.current && crop.width && crop.height) {
      const { blob, fileUrl }: any = await getCroppedImg(
        imageRef.current,
        crop
      );
      formDataObject.append('file', blob);
      formDataObject.append('type', type);

      if (field) {
        formDataObject.append('field', field);
      }
      formDataObjectGet(formDataObject);
      setCroppedImageUrl(fileUrl);
    }
  };

  const getCroppedImg = (
    image: HTMLImageElement,
    crop: Crop
  ): Promise<{ blob: Blob; fileUrl: string } | undefined> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      
      // Use actual pixel dimensions from original image
      const cropWidthPx = (crop.width || 0) * scaleX;
      const cropHeightPx = (crop.height || 0) * scaleY;
      
      canvas.width = cropWidthPx;
      canvas.height = cropHeightPx;
      const ctx = canvas.getContext('2d');

      if (!ctx) return resolve(undefined);

      // Enable high-quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(
        image,
        crop.x! * scaleX,
        crop.y! * scaleY,
        cropWidthPx,
        cropHeightPx,
        0,
        0,
        cropWidthPx,
        cropHeightPx
      );

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        window.URL.revokeObjectURL(croppedImageUrl || '');
        const fileUrl = window.URL.createObjectURL(blob);
        resolve({ blob, fileUrl });
      }, 'image/jpeg', 1.0);
    });
  };

  return (
    <>
      <div>
        <p>
          <input
            type="file"
            accept=".jpeg,.jpg,.png"
            onChange={onSelectFile}
            style={{
              // padding: '280px 20px',
              position: 'absolute',
              top: '0',
              left: '0',
              height: '95px',
              width: '100%',
              opacity: '0',
              scale: '2',
            }}
            className="cursor-pointer opacity-0"
          />
        </p>
        {canvasSrc && (
          <div className="crop-container">
            <ReactCrop
              src={canvasSrc}
              crop={crop}
              onImageLoaded={onImageLoaded}
              onComplete={onCropComplete}
              onChange={onCropChange}
              className="crop-image-functionality"
              minWidth={10}
              minHeight={10}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default CropImage;
