type Props = {
    imageUrl: string;
    setViewModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  };
  const ResidentialViewPhoto = ({ imageUrl, setViewModalOpen }: Props) => {
    console.log(imageUrl, 'imageUrl');
    const closeModal = () => {
      setViewModalOpen(false);
    };
    return (
      <>
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              height: '650px',
              width: '800px',
              borderRadius: '5px',
              padding: '20px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <span
              className="close"
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '8px',
                right: '15px',
                cursor: 'pointer',
                fontSize: '35px',
              }}
            >
              &times;
            </span>
            <div>
              <img
                src={import.meta.env.VITE_S3_URL + imageUrl}
                className="max-w-2xl max-h-96"
                alt="image"
              />
            </div>
          </div>
        </div>
      </>
    );
  };
  export default ResidentialViewPhoto;
  