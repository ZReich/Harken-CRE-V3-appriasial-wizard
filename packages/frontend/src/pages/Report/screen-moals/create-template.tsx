import { Typography, Grid, TextField } from '@mui/material';
import CommonSellerBuyier from '@/components/elements/button/seller-buyier-button';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useMutate, RequestType } from '@/hook/useMutate';
import { toast } from 'react-toastify';

const CreateTemplate = () => {
  const navigate = useNavigate();

  const [templateName, setTemplateName] = useState('');
  const [description, setDescription] = useState('');

  const mutation = useMutate<any, any>({
    queryKey: 'template/create',
    endPoint: 'template/create',
    requestType: RequestType.POST,
  });

  const handleSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    const data = {
      appraisal_id: null,
      parent_id: null,
      name: templateName,
      description: description,
    };

    try {
      const response = await mutation.mutateAsync(data);
      const id = response?.data?.data?.name;
      const title = response?.data?.data?.name;
      const id2 = response?.data?.data?.id;
      toast('Template saved successfully');
      if (id) {
        navigate(`/template/${id2}`, {
          state: { title },
        });
      }
    } catch (error) {
      console.log('error', error);
    }
  };

  return (
    <div className="pb-3 w-96">
      <div>
        <Typography
          variant="h4"
          component="h4"
          className="text-lg py-6 pl-3 font-bold template text-customBlue"
        >
          CREATE NEW TEMPLATE
        </Typography>
        <form onSubmit={handleSubmit} className="px-7">
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Template Name"
                required
                variant="outlined"
                margin="normal"
                onChange={(e) => setTemplateName(e.target.value)}
                value={templateName}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 0,
                    borderTop: 'none',
                    borderRight: 'none',
                    borderLeft: 'none',
                    '&:hover fieldset': {
                      borderColor: 'none',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                      borderBottomWidth: '2px',
                    },
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderTop: 'none',
                    borderRight: 'none',
                    borderLeft: 'none',
                  },
                }}
              />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                required
                variant="outlined"
                margin="normal"
                onChange={(e) => setDescription(e.target.value)}
                value={description}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 0,
                    borderTop: 'none',
                    borderRight: 'none',
                    borderLeft: 'none',
                    '&:hover fieldset': {
                      borderColor: 'none',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                      borderBottomWidth: '2px',
                    },
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderTop: 'none',
                    borderRight: 'none',
                    borderLeft: 'none',
                  },
                }}
              />
            </Grid>
          </Grid>

          <Grid container className="mt-[25px] mb-[15px]">
            <Grid item xs={12}>
              <CommonSellerBuyier
                type="submit"
                variant="contained"
                color="primary"
                style={{ fontSize: '14px' }}
              >
                SAVE
              </CommonSellerBuyier>
            </Grid>
          </Grid>
        </form>
      </div>
    </div>
  );
};

export default CreateTemplate;
