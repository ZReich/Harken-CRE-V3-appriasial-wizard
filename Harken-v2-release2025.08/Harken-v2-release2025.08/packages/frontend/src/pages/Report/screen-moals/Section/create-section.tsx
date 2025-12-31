import { Grid, TextField } from '@mui/material';
import CommonSellerBuyier from '@/components/elements/button/seller-buyier-button';
import { useContext, useState } from 'react';
import { useMutate, RequestType } from '@/hook/useMutate';
import { TemplateContext } from '../../main-screen-template';
import { useParams } from 'react-router-dom';

const CreateSection = ({ setSectionModel }: any) => {
  const { template_id } = useParams<{ template_id: string }>();
  const [section, setSection] = useState('');
  const [orders, setOrder] = useState(1);
  const { setTemplateData } = useContext<any>(TemplateContext);

  const mutation = useMutate<any, any>({
    queryKey: 'create-section',
    endPoint: 'template/save-section',
    requestType: RequestType.POST,
  });

  const handleSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    const data = {
      template_id: template_id,
      parent_id: null,
      title: section,
      order: 1,
    };

    try {
      const response = await mutation.mutateAsync(data);
      setOrder(orders + 1);
      const template_id = response?.data?.data?.template_id;
      const id = response?.data?.data?.id;
      setSectionModel(false);
      setTemplateData((old: any) => {
        const sections = old.sections;
        sections.push({
          title: response?.data?.data?.title,
          template_id,
          id,
          order: 1,
          items: [{ type: null, name: '', submitId: '', order: 1 }],
        });
        return { ...old, sections };
      });
    } catch (error) {
      console.log('error', error);
    }
  };

  return (
    <div className="pb-3 w-96">
      <form onSubmit={handleSubmit} className="px-7">
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Section Name"
              required
              variant="outlined"
              margin="normal"
              onChange={(e) => setSection(e.target.value)}
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
  );
};

export default CreateSection;
