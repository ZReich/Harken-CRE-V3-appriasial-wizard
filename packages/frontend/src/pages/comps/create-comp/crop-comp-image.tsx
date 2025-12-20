import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface Props {
  getText: (event: any) => void;
  check?: (event: any) => void;
  formDataObjectGet: (event: any) => void;
  type: any;
  field?: any;
  src?: any;
  setSrc?: any;
  allignment?: string;
}

const CropCompImage: React.FC<Props> = ({
  getText,
  formDataObjectGet,
  type,
  field,
  check,
  allignment,
}: any) => {

  const formDataObject: any = new FormData();
  const [src, setSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 30,
    aspect:   16/9,
  });
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    setCrop((prevCrop) => ({
      ...prevCrop,
      aspect:  16/9,
    }));
  }, [allignment]);

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

  const onImageLoaded = (image: HTMLImageElement) => {

    imageRef.current = image;
  };

  const onCropChange = (crop: Crop) => {
    console.log("adasda",crop)
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
    crop: Crop,
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
        window.URL.revokeObjectURL(croppedImageUrl || '');
        const fileUrl = window.URL.createObjectURL(blob);
        resolve({ blob, fileUrl });
      }, 'image/jpeg');
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
              position: 'absolute',
              top: '0',
              left: '0',
              width: '100%',
              height: '95px',
              opacity: '0',
              scale: '2',
            }}
            className="cursor-pointer opacity-1"
          />
        </p>
        {src && (
          <div>
            <ReactCrop
              src={src}
              crop={crop}
              onImageLoaded={onImageLoaded}
              onComplete={onCropComplete}
              onChange={onCropChange}
              className="crop-image-functionality"
            />
          </div>
        )}
      </div>
    </>
  );
};

export default CropCompImage;
