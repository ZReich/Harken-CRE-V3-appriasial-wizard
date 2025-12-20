import { Box, IconButton } from '@mui/material';
import { Icons } from '@/components/icons';
import React, { useEffect, useState } from 'react';
import { RequestType, useMutate } from '@/hook/useMutate';
import { toast } from 'react-toastify';
import { useSearchParams } from 'react-router-dom';
import loadingImage from '../images/loading.png';

interface FormDataObject {
  file: string;
  id: number;
  type: string;
}

const UploadImageExhibits = ({ refetch,setLoaderClassName,loaderClassName }: any) => {
  const [searchParams] = useSearchParams();
  const [imageUrl, setImageUrl] = useState('');
  const [uploadDisabled, setUploadDisabled] = useState(false);
  const id = searchParams.get('id');

  const { mutateAsync } = useMutate<any, FormDataObject>({
    queryKey: 'appraisals/post-exhibits',
    endPoint: `appraisals/post-exhibits/${id}`,
    requestType: RequestType.POST,
  });

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setLoaderClassName(true);
    setLoading(true);
    const file = event.target.files?.[0];
    if (file) {
      const formDataObject: any = new FormData();
      formDataObject.append('file', file);
      formDataObject.append('type', 'users');
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setUploadDisabled(true);
      try {
        const response = await mutateAsync(formDataObject);
        refetch();
        handleClearImage();
        setLoading(false);
        toast(response);
        // setLoaderClassName(false);
      } catch (error: any) {
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          setImageUrl('');
          setLoading(false);
          setUploadDisabled(false);
          toast.error(error.response.data.message);
        } else {
          toast.error('An unexpected error occurred.');
        }
        console.log(error);
      }
    }
  };

  const handleClearImage = () => {
    setImageUrl('');
    setUploadDisabled(false);
  };

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <>
        <div className={`img-update-loader ${loaderClassName ? "upload-exhibits-image" : ""}`}>
          <img src={loadingImage} />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="xl:px-[60px] px-[15px] my-4">
        <Box
          className="w-full h-[156px] rounded-[11px]"
          sx={{ backgroundColor: 'rgba(13, 161, 199, 0.08)' }}
        >
          <div className="flex justify-center items-center relative">
            {imageUrl && (
              <>
                <img
                  src={imageUrl}
                  alt="Uploaded"
                  className="w-64 h-full object-cover rounded-[11px]"
                  style={{
                    width: 'auto',
                    maxWidth: '175px',
                    minWidth: '175px',
                    height: 'auto',
                    maxHeight: '155px',
                    objectFit: 'contain',
                    objectPosition: 'center center',
                  }}
                />
                <IconButton
                  className="absolute top-2 right-2"
                  onClick={handleClearImage}
                  aria-label="Clear Image"
                  color="primary"
                >
                  Clear
                </IconButton>
              </>
            )}
            {!imageUrl && (
              <label htmlFor="fileInput">
                {/* <div className="absolute cursor-pointer w-full h-[126px] flex flex-col justify-center items-center top-0 left-0 gap-2.5"> */}
                <div className="absolute cursor-pointer flex flex-col justify-center items-center top-10 gap-2.5">
                  <Icons.CloudDownloadIcon className="text-dodgerblue cursor-pointer" />
                  <p className="text-[#0DA1C7] m-0">
                    Upload New Exhibit (.pdf,.jpg,.png)
                  </p>
                </div>
              </label>
            )}
            {!imageUrl && !uploadDisabled && (
              <input
                style={{ visibility: 'hidden' }}
                id="fileInput"
                type="file"
                name="profile_image_url"
                accept="image/*,application/pdf"
                onChange={handleChange}
              />
            )}
          </div>
        </Box>
      </div>
    </>
  );
};

export default UploadImageExhibits;
