import StyledField from '@/components/styles/StyleFieldEditComp';
import SelectTextField from '@/components/styles/select-input';
import TextEditor from '@/components/styles/text-editor';
import { ZoningsEnum } from '@/pages/appraisal/overview/OverviewEnum';
import { AppraisalUserDetermination } from '@/pages/appraisal/overview/SelectOption';
import { Grid, Typography } from '@mui/material';
import { useFormikContext } from 'formik';
import { useState } from 'react';

export const ResidentialZoning = ({ passRequired }: any) => {
  const maxLengths = 2500;
  const { errors, values, setFieldValue } = useFormikContext<any>();
  const [contest] = useState('');
  const [hasAlerted] = useState(false);

  console.log(contest);

  return (
    <>
      <div>
        <Typography
          variant="h1"
          component="h2"
          className="text-lg font-bold mt-4"
        >
          {ZoningsEnum.ZONING}
        </Typography>
        <Grid container spacing={3} className="mt-1 items-end">
          <Grid item xs={12} className='pt-2'>
            <StyledField
              label={ZoningsEnum.ZONING_TYPE}
              name={ZoningsEnum.ZONING_TYPE_NAME}
              value={values.zoning_type}
              onChange={(e: any) => {
                const inputValue = e.target.value;
                setFieldValue(ZoningsEnum.ZONING_TYPE_NAME, inputValue);
              }}
            />
          </Grid>
        </Grid>
        <Grid container spacing={3} className="mt-2 items-end">
          <Grid item xs={12} className='pt-2'>
            <label className="text-customGray text-xs">
              {ZoningsEnum.ZONING_DESCRIPTION}
            </label>
            <TextEditor
              editorContent={values.zoning_description} // Set initial value from Formik
              editorData={(content) =>
                setFieldValue(ZoningsEnum.ZONING_DESCRIPTION_NAME, content)
              } 
              style={{
                pointerEvents: hasAlerted ? 'none' : 'auto',
                opacity: hasAlerted ? 0.6 : 1,
              }} // Handle readonly mode
            />

            {hasAlerted && (
              <div
                style={{
                  color: 'red',
                  fontSize: '12px',
                  marginTop: '10px',
                  marginLeft: '20px',
                }}
              >
                Only {maxLengths} characters allowed.
              </div>
            )}
          </Grid>
        </Grid>

        <Grid container spacing={3} className="mt-2 items-end">
          <Grid item xs={12} className='pt-2'>
            <SelectTextField
              label={
                <span className="relative text-customGray">
                  {ZoningsEnum.CONFIRMING_USER_DETERMINATION}
                  <span className="text-red-500 text-base">*</span>
                </span>
              }
              name={ZoningsEnum.CONFIRMING_USER_DETERMINATION_NAME}
              defaultValue="Appears to be conforming"
              onChange={(e) =>
                setFieldValue(
                  ZoningsEnum.CONFIRMING_USER_DETERMINATION_NAME,
                  e.target.value
                )
              }
              options={AppraisalUserDetermination}
              value={
                values.conforming_use_determination ||
                'Appears to be conforming'
              }
            />
            {errors && passRequired && (
              <div className="text-red-500 text-[11px]">
                {errors.conforming_use_determination as any}
              </div>
            )}
          </Grid>
        </Grid>
      </div>
    </>
  );
};
