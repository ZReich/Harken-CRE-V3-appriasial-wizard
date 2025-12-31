import { Box } from '@mui/material';
import { useState } from 'react';
import { useFormikContext } from 'formik';
import { InitialValues } from '@/pages/my-profile/profile-details/PersonalDetails';
import { RequestType, useMutate } from '@/hook/useMutate';
import { toast } from 'react-toastify';
import { UpdateProfileUserType } from './interface/update-profile-user-type';
import frame from '../images/frame.png';
import iconImg from '../../public/images/icon.png';
import { useGet } from '@/hook/useGet';
import { UserGetDataType } from './interface/user-get-data';
interface FormDataObject {
  file: string;
  id: number;
  type: string;
}
const UploadImage = (props: any) => {
  const { values, setFieldValue } = useFormikContext<InitialValues>();
  const [imageSrc, setImageSrc] = useState<string>('');
  const id = props.personalDetails.data.data.user.id;
  const { mutateAsync } = useMutate<UpdateProfileUserType, FormDataObject>({
    queryKey: 'upload-files/upload',
    endPoint: 'upload-files/upload',
    requestType: RequestType.POST,
  });
  const { data: personalDetails, refetch } = useGet<UserGetDataType>({
    queryKey: 'header',
    endPoint: 'user/get',
    config: {},
  });
  const user = personalDetails?.data?.data?.user;

  const { mutate } = useMutate<ResponseType, InitialValues>({
    queryKey: 'user/update-personal-data',
    endPoint: `user/update-personal-data/${user?.id}`,
    requestType: RequestType.PATCH,
  });
  const s3Url = import.meta.env.VITE_S3_URL;

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const formDataObject: any = new FormData();
      formDataObject.append('file', file);
      formDataObject.append('type', 'users');
      formDataObject.append('id', id);
      try {
        const response = await mutateAsync(formDataObject);
        toast(response?.data?.message);
        setImageSrc(response?.data.data.url);
        const url = response?.data.data.url;
        const trimmedUrl = url.replace(s3Url, '');
        setFieldValue('profile_image_url', trimmedUrl);
        mutate(
          {
            first_name: user?.first_name,
            last_name: user?.last_name,
            email_address: user?.email_address,
            phone_number: user?.phone_number,
            position: user?.position,
            qualification: user?.qualification,
            background: user?.background,
            affiliations: user?.affiliations,
            education: user?.education,
            responsibility: user?.responsibility,
            profile_image_url: trimmedUrl,
            signature_image_url: user?.signature_image_url,
          },
          {
            onSuccess: () => {
              refetch();
            },
          }
        );
      } catch (error) {
        console.log(error);
      }
    }
  };
  return (
    <>
      <Box
        className="w-[250px] h-[126px] rounded-[11px]"
        sx={{ backgroundColor: 'rgba(13, 161, 199, 0.08)' }}
      >
        <div className="flex justify-center items-center relative upload-feild">
          <label className="update-profile" htmlFor="fileInput">
            <div className="hover:!visible absolute cursor-pointer hover:!bg-[#ffffffa6] w-full h-[126px] flex flex-col justify-center items-center top-0 left-0 gap-2.5">
              <div
                className="h-[30px] w-[30px]"
                style={{
                  backgroundImage: `url(${iconImg})`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                }}
              ></div>
              <p className="text-[#0DA1C7] m-0">Update a Profile Image </p>
            </div>
          </label>
          <label htmlFor="fileInput">
            {values && values?.profile_image_url && (
              <img
                src={import.meta.env.VITE_S3_URL + values?.profile_image_url}
                alt=""
                className="w-64 h-32 cursor-pointer object-cover"
              />
            )}
            {!imageSrc && !values.profile_image_url && (
              <img
                src={frame}
                alt=""
                className="text-white text-7xl mt-[20px]"
              />
            )}
          </label>

          <input
            style={{ display: 'none' }}
            id="fileInput"
            type="file"
            name="profile_image_url"
            accept="image/*"
            onChange={handleChange}
          />
        </div>
      </Box>
    </>
  );
};

export default UploadImage;
