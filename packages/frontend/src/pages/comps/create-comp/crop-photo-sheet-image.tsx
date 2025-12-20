// export default CropImagePhotoSheet;
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface Props {
  getText: (event: any) => void;
  check?: (event: any) => void;
  formDataObjectGet: (event: any) => void;
  type: any;
  field?: any;
  allignment?: string;
  srcArray: any;
  setSrcArray: any;
  src: any;
  setSrc: any;
  cropModalOpen: any;
  cropImageSrc: any;
  cropImageUrl: any;
}

const CropImagePhotoSheet: React.FC<Props> = ({
  getText,
  formDataObjectGet,
  type,
  field,
  check,
  srcArray,
  setSrcArray,
  cropModalOpen,
  cropImageSrc,
  cropImageUrl,
}) => {
  const formDataObject: any = new FormData();
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 100,
    aspect: undefined, // Removed aspect to allow free-hand crop
  });
  const [, setCroppedImages] = useState<string[]>([]);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);
  const [blobUrl, setBlobUrl] = useState<any>();

  const onSelectFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileArray = Array.from(e.target.files);
      const blobArray = fileArray.map(
        (file) => new Blob([file], { type: file.type })
      );
      const blobUrls = blobArray.map((blob) => URL.createObjectURL(blob));

      if (fileArray.length > 0) {
        fileArray.forEach((item) => {
          formDataObject.append('files', item);
        });
        formDataObject.append('type', type);
      }

      formDataObjectGet(formDataObject);
      setSrcArray(blobUrls);
      check && check(blobArray);
      getText(true);
    }
  };

  const onImageLoaded = (image: HTMLImageElement, index: number) => {
    imageRefs.current[index] = image;
    setCrop({
      unit: 'px', // Use 'px' for precise cropping
      x: 0,
      y: 0,
      width: image.naturalWidth,
      height: image.naturalHeight,
    });
  };

  const onCropChange = (newCrop: Crop) => {
    setCrop(newCrop);
  };

  const onCropComplete = (crop: Crop, index: number) => {
    makeClientCrop(crop, index);
  };

  const makeClientCrop = async (crop: Crop, index: number) => {
    if (imageRefs.current[index] && crop.width && crop.height) {
      const { blob, fileUrl }: any = await getCroppedImg(
        imageRefs.current[index]!,
        crop
      );

      if (srcArray?.length === 1) {
        formDataObject.append('files', blob);
      }
      formDataObject.append('type', type);
      if (cropImageUrl) {
        formDataObject.append('file', blob);
        formDataObject.append('urlToDelete', cropImageUrl);
      }

      if (field) {
        formDataObject.append('field', field);
      }

      formDataObjectGet(formDataObject);
      setCroppedImages((prev) => [...prev, fileUrl]);
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

      canvas.width = crop.width || 0;
      canvas.height = crop.height || 0;
      const ctx = canvas.getContext('2d');

      if (!ctx) return resolve(undefined);

      ctx.drawImage(
        image,
        crop.x! * scaleX,
        crop.y! * scaleY,
        crop.width! * scaleX,
        crop.height! * scaleY,
        0,
        0,
        crop.width!,
        crop.height!
      );

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        const fileUrl = window.URL.createObjectURL(blob);
        resolve({ blob, fileUrl });
      }, 'image/jpeg');
    });
  };

  useEffect(() => {
    async function convertImageToBlobUrl(url: any) {
      try {
        const response = await fetch(url, {
          cache: 'no-cache',
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch image: ${response.status} - ${response.statusText}`
          );
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        setBlobUrl(blobUrl);
      } catch (error: any) {
        console.error('Error converting image to Blob URL:', error.message);
      }
    }

    if (cropImageSrc) {
      convertImageToBlobUrl(cropImageSrc);
    }

    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        setBlobUrl(null);
      }
    };
  }, [cropImageSrc]);

  return (
    <div>
      <input
        type="file"
        accept=".jpeg,.jpg,.png"
        onChange={onSelectFile}
        multiple
        style={{
          position: 'absolute',
              top: '0',
              left: '0',
              height: '95px',
              width: '100%',
              opacity: '0',
              scale: '2',
        }}
        className="cursor-pointer"
      />
      {srcArray?.length === 1 && (
        <ReactCrop
          src={srcArray[0]}
          crop={crop}
          onImageLoaded={(image) => onImageLoaded(image, 0)}
          onComplete={(c) => onCropComplete(c, 0)}
          onChange={onCropChange}
          className="crop-image-functionality"
        />
      )}
      {cropModalOpen && (
        <ReactCrop
          src={blobUrl}
          crop={crop}
          onImageLoaded={(image) => onImageLoaded(image, 0)}
          onComplete={(c) => onCropComplete(c, 0)}
          onChange={onCropChange}
          className="crop-image-functionality"
        />
      )}
    </div>
  );
};

export default CropImagePhotoSheet;
