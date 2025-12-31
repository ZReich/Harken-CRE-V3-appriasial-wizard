import { FormHelperText, Grid, TextField } from '@mui/material';
import CommonSellerBuyier from '@/components/elements/button/seller-buyier-button';
import { useContext, useState } from 'react';
import { useMutate, RequestType } from '@/hook/useMutate';
import { TemplateContext } from '../main-screen-template';

const CreateSubSection = ({
  handleModalClose,
  parentIndex,
  template_id,
  section_id,
  sectionIdParams,
  addItemInfo,
  setAddItemInfo,
}: any) => {
  const [section, setSection] = useState('');
  const [error, setError] = useState(''); // <-- error state

  const { setTemplateData } = useContext<any>(TemplateContext);

  const mutation = useMutate<any, any>({
    queryKey: 'sub-section',
    endPoint: 'template/save-section-item',
    requestType: RequestType.POST,
  });

  const handleSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    if (!section.trim()) {
      setError('This field is required');
      return;
    }
    setError('');
    const data = {
      section_id: section_id === undefined ? sectionIdParams : section_id,
      type: 'subsection',
      content: section,
      order: 1,
      template_id: template_id,
    };

    try {
      handleModalClose();
      const response = await mutation.mutateAsync(data);

      setTemplateData((old: { sections: any }) => {
        const sections = old.sections;

        const item = {
          type: 'subsection',
          content: '',
          sub_section_id: response?.data?.data?.sub_section_id,
          order: 1,
          subsections: {
            title: section,
            items: [{ type: null, content: section, order: 1 }],
          },
        };

        if (addItemInfo.itemIndex === 0) {
          sections[parentIndex].items.push(item);
        } else {
          sections[parentIndex].items.splice(
            addItemInfo.itemIndex + 1,
            0,
            item
          );
        }
        setAddItemInfo(null);

        return { ...old, sections };
      });
    } catch (error) {
      console.log('error', error);
    }
  };

  return (
    <div className="pb-3 w-96">
      <div>
        <form className="px-7">
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Sub-section"
                required
                variant="outlined"
                margin="normal"
                value={section}
                onChange={(e) => {
                  setSection(e.target.value);
                  if (e.target.value.trim()) setError('');
                }}
                error={!!error}
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
              {error && (
                <FormHelperText style={{ color: 'red', marginLeft: 0, marginTop: 0 }}>
                  {error}
                </FormHelperText>
              )}
            </Grid>
          </Grid>

          <Grid container className="mt-[25px] mb-[15px]">
            <Grid item xs={12}>
              <CommonSellerBuyier
                type="submit"
                variant="contained"
                color="primary"
                style={{ fontSize: '14px' }}
                onClick={handleSubmit}
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

export default CreateSubSection;
