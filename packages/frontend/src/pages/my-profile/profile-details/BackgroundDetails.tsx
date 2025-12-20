import { Box, Grid, Typography } from '@mui/material';
import { useFormikContext } from 'formik';
import TextEditor from '@/components/styles/text-editor';
import { InitialValues } from './PersonalDetails';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

export const BackgroundDetails = () => {
  const { values, setFieldValue } = useFormikContext<InitialValues>();

  return (
    <>
      <Box className="mt-5">
        <Typography
          variant="h4"
          component="h4"
          className="text-lg font-montserrat font-bold py-5"
          style={{ fontFamily: 'montserrat-normal' }}
        >
          BACKGROUND DETAILS
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <label className="text-customGray text-xs">
              Background & Experience
            </label>
            <TextEditor
              name="background"
              editorContent={values.background}
              editorData={(e: any) => setFieldValue('background', e)}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={values.include_background_in_pdf === 1}
                  onChange={(e) => setFieldValue('include_background_in_pdf', e.target.checked ? 1 : 0)}
                />
              }
              label="Include Background & Experience on printed evaluations"
              className="mt-2"
            />
          </Grid>
          <Grid item xs={12} className="mt-[50px]">
            <label className="text-customGray text-xs">
              Professional Affilliations
            </label>
            <TextEditor
              name="affiliations"
              editorContent={values.affiliations}
              editorData={(e: any) => setFieldValue('affiliations', e)}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={values.include_affiliations_in_pdf === 1}
                  onChange={(e) => setFieldValue('include_affiliations_in_pdf', e.target.checked ? 1 : 0)}
                />
              }
              label="Include Professional Affiliations on printed evaluations"
              className="mt-2"
            />
          </Grid>
          <Grid item xs={12} className="mt-[50px]">
            <label className="text-customGray text-xs">
              Education Description
            </label>
            <TextEditor
              name="education"
              editorContent={values.education}
              editorData={(e: any) => setFieldValue('education', e)}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={values.include_education_in_pdf === 1}
                  onChange={(e) => setFieldValue('include_education_in_pdf', e.target.checked ? 1 : 0)}
                />
              }
              label="Include Education Description on printed evaluations"
              className="mt-2"
            />
          </Grid>
          <Grid item xs={12} className="mt-[50px]">
            <label className="text-customGray text-xs">
              Scope of Responsibility
            </label>
            <TextEditor
              name="responsibility"
              editorContent={values.responsibility}
              editorData={(e: any) => setFieldValue('responsibility', e)}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={values.include_responsibility_in_pdf === 1}
                  onChange={(e) => setFieldValue('include_responsibility_in_pdf', e.target.checked ? 1 : 0)}
                />
              }
              label="Include Scope of Responsibility on printed evaluations"
              className="mt-2"
            />
          </Grid>
        </Grid>
      </Box>
    </>
  );
};
