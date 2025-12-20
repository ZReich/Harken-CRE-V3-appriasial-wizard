import { Box,Typography,Grid } from '@mui/material';
import CommonButton from '@/components/elements/button/Button';
// import UploadSignature from '@/components/styles/UploadSignature';
import UploadSignature from '@/components/styles/upload-signature';

export const HandwrittenSignature = () => {
  return (
    <>
      <Box className="mt-5 w-[1302px]">
        <Typography
          variant="h4"
          component="h4"
          className="text-lg font-montserrat font-bold py-5"
          style={{ fontFamily: 'montserrat-normal' }}
        >
          HANDWRITTEN SIGNATURE
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <UploadSignature/>
          </Grid>
          <Grid item xs={6}>
            <div className='flex justify-end mt-[80px]'>
              <CommonButton
              color='primary'
              type='submit'
              variant='contained'
              style={{width:'291px',height:'46px',borderRadius:'7px',fontWeight:'bold',fontSize:'14px'}}
              >
                update
              </CommonButton>

            </div>
          </Grid>
        </Grid>
       
      </Box>
    </>
  );
};
