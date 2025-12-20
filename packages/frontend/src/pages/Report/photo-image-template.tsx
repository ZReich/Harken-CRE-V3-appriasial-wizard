import images from '../../images/list.jpg';

const PhotoImageTemplate = ({ getImageUrl }: any) => {
  const staticImages = [
    { src: images, caption: 'Caption 1' },
    { src: images, caption: 'Caption 2' },
    { src: images, caption: 'Caption 3' },
    { src: images, caption: 'Caption 4' },
    { src: images, caption: 'Caption 5' },
    { src: images, caption: 'Caption 6' },
  ];

  const takenBy = '....';
  const photoDate = new Date().toLocaleDateString();

  const handleImageClick = (imageSrc: string) => {
    getImageUrl(imageSrc);
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '20px',
          width: '100%',
          maxWidth: '600px',
        }}
      >
        {staticImages.map((image, index) => {
          return (
            <div key={index}>
              <img
                src={image.src}
                alt={`image-${index}`}
                style={{
                  width: '100%',
                  maxWidth: '460px',
                  // objectFit: 'cover',
                }}
                onClick={() => handleImageClick(image.src)}
              />
              <div className="text-center font-bold text-lg">
                {image.caption}
              </div>
            </div>
          );
        })}
      </div>

      <div className="font-bold py-5">
        <span>Taken By: {takenBy}</span>
        <span>{' ,' + photoDate}</span>
      </div>
    </div>
  );
};

export default PhotoImageTemplate;
