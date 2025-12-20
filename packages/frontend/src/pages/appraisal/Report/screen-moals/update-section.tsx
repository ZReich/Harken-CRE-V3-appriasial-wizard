import { Grid, TextField } from '@mui/material';
import CommonSellerBuyier from '@/components/elements/button/seller-buyier-button';
import { useContext, useState } from 'react';
import { useMutate, RequestType } from '@/hook/useMutate';
import { TemplateContext } from '../main-screen';
import { toast } from 'react-toastify';

const UpdateSectionReport = ({
  seteditSecModel,
  template_id,
  ids,
  seteditSubSecModel,
  editSecModel,
  secTitle,
  setUpdateSec,
  setBool,
  appraisalSecTitle,
}: any) => {
  const [section, setSection] = useState<string>(
    secTitle || appraisalSecTitle || ''
  );
  const [orders, setOrder] = useState(1);
  const { setTemplateData } = useContext<any>(TemplateContext);

  const mutation = useMutate<any, any>({
    queryKey: 'update-section',
    endPoint: `template/update-section/${ids}`,
    requestType: RequestType.PATCH,
  });

  const handleSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    const data = {
      template_id: template_id,
      id: ids,
      title: section,
      order: 1,
    };

    try {
      const response = await mutation.mutateAsync(data);
      setOrder(orders + 1);
      // const template_id = response?.data?.data?.template_id;
      const id = response?.data?.data?.id;
      toast.success(
        editSecModel
          ? 'Section updated successfully'
          : 'Sub-section updated successfully'
      );
      seteditSecModel(false);
      seteditSubSecModel(false);
      setUpdateSec(true);
      setTemplateData((old: any) => {
        const updatedSections = old.sections.map((section: any) =>
          String(section.id) === String(id)
            ? { ...section, title: response?.data?.data?.title }
            : section
        );
        return { ...old, sections: updatedSections };
      });
      setBool(true);
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
              label={editSecModel ? 'Section Name' : 'Sub-section Name'}
              required
              variant="outlined"
              margin="normal"
              value={section}
              onChange={(e) => {
                setSection(e.target.value);
              }}
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

export default UpdateSectionReport;
