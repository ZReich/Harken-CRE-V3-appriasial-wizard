import { useGet } from '@/hook/useGet';
import { useSearchParams } from 'react-router-dom';
import { formatDate } from '@/utils/date-format';

const PhotoImageGallery = ({ getImageUrl }: any) => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const { data } = useGet<any>({
    queryKey: `appraisals/get-photo-pages/${id}`,
    endPoint: `appraisals/get-photo-pages/${id}`,
  });

  const view = data?.data?.data?.photos || [];

  const handleImageClick = (imageSrc: any) => {
    getImageUrl(imageSrc);
  };

  const imagesWithPlaceholders = [...view];

  if (imagesWithPlaceholders.length % 2 !== 0) {
    imagesWithPlaceholders.push(null);
  }

  return (
    <div
      style={{
        // height: 'auto',
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '30px',
          width: '100%',
          maxWidth: '950px',
        }}
      >
        {imagesWithPlaceholders.map((image: any, index: number) => {
          if (image) {
            return (
              <div key={index} className="text-center">
                <img
                  src={import.meta.env.VITE_S3_URL + image.image_url}
                  style={{
                    // width: '100%',
                    maxWidth: '100%',
                    height: '260px',
                    objectFit: 'cover',
                    cursor: 'pointer',
                  }}
                  onClick={() =>
                    handleImageClick(
                      import.meta.env.VITE_S3_URL + image.image_url
                    )
                  }
                  onError={(e) => {
                    e.currentTarget.src = 'placeholder-image-url';
                  }}
                />
                <div className="text-center font-bold text-lg capitalize">
                  {image.caption}
                </div>
              </div>
            );
          }
        })}
      </div>

      <div className="font-bold py-5">
        <span>Taken By : {data?.data?.data?.photos_taken_by}</span>
        <span>{', ' + formatDate(data?.data?.data?.photo_date)}</span>
      </div>
    </div>
  );
};

export default PhotoImageGallery;
