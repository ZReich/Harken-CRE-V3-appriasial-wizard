import { Box } from '@mui/material';
import { toast } from 'react-toastify';
import { RequestType, useMutate } from '@/hook/useMutate';
import { UpdateProfileUserType } from '@/components/interface/update-profile-user-type';
import logo from '../../../images/logo.png';
import { useFormikContext } from 'formik';

interface FormDataObject {
  file: string;
  id: number;
  type: string;
}
const AccountLogo = ({
  setImageSrc,
  imageSrc,
  accountData,
  setImageUrl,
  imageUrl,
}: any) => {
  const { setFieldValue, values } = useFormikContext<any>();
  const { mutateAsync } = useMutate<UpdateProfileUserType, FormDataObject>({
    queryKey: 'upload-files/upload',
    endPoint: 'upload-files/upload',
    requestType: RequestType.POST,
  });
  const s3Url = import.meta.env.VITE_S3_URL;

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const formDataObject: any = new FormData();
      formDataObject.append('file', file);
      formDataObject.append('type', 'accounts');
      formDataObject.append('id', accountData?.id);
      try {
        const response = await mutateAsync(formDataObject);
        toast(response?.data?.message);
        setImageSrc(response?.data.data.url);
        const url = response?.data.data.url;
        const trimmedUrl = url.replace(s3Url, '');
        setImageUrl(trimmedUrl);
        setFieldValue('logo_url', trimmedUrl);
      } catch (error) {
        console.log(error);
      }
    }
  };
  // };
  return (
    <>
      <Box
        className="w-[250px] h-[141px] rounded-[11px]"
        sx={{ backgroundColor: 'rgba(13, 161, 199, 0.08)' }}
      >
        <div className="flex h-full w-full justify-center items-center relative">
          <label className="update-logo" htmlFor="fileInput">
            <div className=" absolute cursor-pointer w-full h-full flex flex-col justify-center items-center top-0 left-0">
              {!imageSrc && (
                <img
                  src={logo}
                  className="h-[46px] w-[46px]"
                  alt="update_image"
                />
              )}
              {!imageSrc && (
                <p className="text-[#84929A] text-sm	 m-0">Upload LOGO </p>
              )}
            </div>
          </label>
          <label htmlFor="fileInput" className="absolute left-0 top-0">
            {imageUrl ? (
              <img
                // src={imageSrc}
                src={import.meta.env.VITE_S3_URL + imageUrl}
                alt="Uploaded"
                className="w-64 h-[9rem] cursor-pointer rounded-[10px]"
              />
            ) : (
              <img
                src={import.meta.env.VITE_S3_URL + values?.logo_url}
                alt="Uploaded1"
                className="w-64 h-[9rem] cursor-pointer rounded-[10px]"
              />
            )}
          </label>

          <input
            className="opacity-0"
            id="fileInput"
            type="file"
            name="logo_url"
            accept="image/*"
            onChange={handleChange}
          />
        </div>
      </Box>
    </>
  );
};

export default AccountLogo;
