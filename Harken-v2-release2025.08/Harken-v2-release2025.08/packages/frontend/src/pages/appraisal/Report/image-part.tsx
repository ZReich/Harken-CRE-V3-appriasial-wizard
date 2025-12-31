import { useState } from 'react';
import { useGet } from '@/hook/useGet';
import { useSearchParams, Link } from 'react-router-dom';

const ImageGallery = ({ getImageUrl }: any) => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const { data } = useGet<any>({
    queryKey: `appraisals/get-files/${id}?origin=APPRAISAL_IMAGES`,
    endPoint: `appraisals/get-files/${id}?origin=APPRAISAL_IMAGES`,
  });

  const view = data?.data?.data || [];
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const handleImageClick = (imageSrc: string) => {
    setActiveImage(imageSrc);
    getImageUrl(imageSrc);
  };

  return (
    <div
      style={{
        height: '500px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          overflowX: 'auto',
        }}
      >
        {view.length > 0 ? (
          view.map((image: any, index: number) => {
            const imageSrc = import.meta.env.VITE_S3_URL + image.dir;
            const isActive = imageSrc === activeImage;
            const imageWidth = image.width || 300;
            const imageHeight = image.height || 200;
            return (
              <img
                className="object-contain cursor-pointer"
                key={index}
                src={imageSrc}
                alt={`Image ${index}`}
                style={{
                  width: `${imageWidth}px`,
                  height: `${imageHeight}px`,
                  marginRight: '10px',
                  boxShadow: isActive
                    ? '0 0 15px rgba(0, 123, 255, 0.6)'
                    : '0 0 5px rgba(0, 0, 0, 0.2)',
                  border: isActive
                    ? '2px solid rgba(0, 123, 255, 0.6)'
                    : 'none',
                  transition: 'all 0.3s ease',
                }}
                onClick={() => handleImageClick(imageSrc)}
                onError={(e) => {
                  e.currentTarget.src = 'placeholder-image-url';
                }}
              />
            );
          })
        ) : (
          <div
            style={{
              textAlign: 'center',
              color: 'rgb(149 152 154)',
              fontWeight: 'bold',
            }}
          >
            You can only select images that you uploaded on the Image Page.
            <Link
              to={`/appraisal-image?id=${id}`}
              style={{
                textDecoration: 'none',
                color: 'blue',
                marginLeft: '5px',
              }}
            >
              <span
                style={{
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  color: 'rgb(13 161 199 )',
                }}
              >
                Click here
              </span>
              &nbsp;
            </Link>
            to return to the Image Page, upload images, and proceed.
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGallery;
