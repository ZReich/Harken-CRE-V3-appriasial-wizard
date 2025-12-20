import React, { useState } from 'react';
import ImageUploading, { ImageListType } from 'react-images-uploading';
import imageCompression from 'browser-image-compression';
import { RequestType, useMutate } from '@/hook/useMutate';
import loadingImage from '../../images/loading.png';
import AddImage from '../../images/Group 1580.png';

interface UploadProps {
  getImageUrl: any;
  paths: any;
}

interface FormDataObject {
  file: string;
  id: number;
  type: string;
}

export const Upload: React.FC<UploadProps> = ({ getImageUrl, paths }) => {
  const [images, setImages] = useState<ImageListType>([]);
  // const [imageUploaded, setImageUploaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const { mutateAsync } = useMutate<any, FormDataObject>({
    queryKey: 'upload-files/upload',
    endPoint: 'upload-files/upload',
    requestType: RequestType.POST,
  });

  const compressImage = async (file: File) => {
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 800,
      useWebWorker: true,
    };
    if (file) {
      const formDataObject: any = new FormData();
      formDataObject.append('file', file);
      formDataObject.append('type', 'users');
      try {
        setLoading(true);
        const response = await mutateAsync(formDataObject);
        getImageUrl(response?.data?.data?.url);
        if (response?.data?.data?.url) {
          setLoading(false);
        }
        const compressedFile = await imageCompression(file, options);
        const compressedBase64 =
          await imageCompression.getDataUrlFromFile(compressedFile);
        return { compressedBase64, fileName: file.name };
      } catch (error) {
        console.error('Error compressing the image:', error);
        return null;
      }
    }
  };

  const onChange = async (imageList: ImageListType) => {
    const compressedImages = await Promise.all(
      imageList.map(async (image) => {
        if (image.file) {
          const compressedData = await compressImage(image.file);
          if (compressedData) {
            return { ...image, data_url: compressedData.compressedBase64 };
          }
        }
        return image;
      })
    );
    setImages(compressedImages);
    // setImageUploaded(compressedImages.length > 0);
  };

  if (loading) {
    return (
      <>
        <div className="img-update-loader" id="img-template-loader">
          <img src={loadingImage} />
        </div>
      </>
    );
  }

  return (
    <div className="Upload">
      <ImageUploading
        value={images}
        onChange={onChange}
        maxNumber={9}
        dataURLKey="data_url"
      >
        {({ imageList, onImageUpload, dragProps }) => (
          <div className="upload__image-wrapper">
            <div
              style={{
                position: 'relative',
                width: '200px',
                height: '150px',
                cursor: 'pointer',
                marginBottom: '15px',
              }}
              onClick={onImageUpload}
            >
              {/* Uploaded Image */}
              {imageList.length > 0 ? (
                <div
                  className="image-container"
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                  }}
                >
                  <img
                    src={imageList[0]['data_url']}
                    alt="Preview"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '4px',
                    }}
                  />
                </div>
              ) : !paths ? (
                <img
                  src={AddImage}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '4px',
                    opacity: imageList.length > 0 ? 0 : 1,
                  }}
                  {...dragProps}
                  alt="Add"
                />
              ) : (
                ''
              )}
              {imageList.length === 0 && paths && (
                <img
                  src={paths}
                  alt="Uploaded"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '4px',
                  }}
                />
              )}
            </div>
            {/* Update Image Button */}
            {/* {imageUploaded && (
              <button
                onClick={onImageUpload}
                className="mt-3 px-5 py-2.5 text-white rounded cursor-pointer bg-customBlue border-0"
              >
                Update Image
              </button>
            )} */}
          </div>
        )}
      </ImageUploading>
    </div>
  );
};
