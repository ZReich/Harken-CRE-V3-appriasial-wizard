import { Box, Grid, Typography } from '@mui/material';
import SelectTextField from '@/components/styles/select-input';
import CommonButton from '@/components/elements/button/Button';
import { EvaluationSetUpEnum } from '../evaluation-setup-enums';
import { ChangeEvent } from 'react';
import group3 from '../../../../images/Group3.png';

interface ClientSectionProps {
  clientListOptions: any[];
  clientId: string | null | number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onAddClient: () => void;
  touched: boolean | undefined;
  errors: any;
  submitCount: number;
}

const ClientSection = ({
  clientListOptions,
  clientId,
  onChange,
  onAddClient,
  touched,
  errors,
  submitCount,
}: ClientSectionProps) => (
  <div>
    <Typography className="text-lg font-bold pb-[20px]" variant="h5" component="h5">
      {EvaluationSetUpEnum.CLIENT_DETAILS}
    </Typography>
    <Box className="mt-[20px] bg-[#FBFBFB] p-6 mb-28">
      <Grid container spacing={2} className="mt-1" alignItems="center">
        <Grid item xs={6}>
          <SelectTextField
            label={
              <span className="relative">
                {EvaluationSetUpEnum.SELECT_CLIENT}
                <span className="text-red-500 text-base">*</span>
              </span>
            }
            name={EvaluationSetUpEnum.CLIENT_ID}
            options={clientListOptions}
            value={clientId}
            onChange={onChange}
          />
          {(touched || submitCount > 0) && errors && (
            <span className="text-red-500 text-[11px] absolute">
              {errors}
            </span>
          )}
        </Grid>
        <Grid item xs={5} className="mt-[3px]">
          <CommonButton
            variant="contained"
            color="primary"
            style={{
              background: '#FBFBFB',
              border: 'dashed',
              color: '#A1AFB7',
              borderRadius: '10px',
              borderWidth: '1px',
              fontSize: '12px',
              boxShadow: 'none',
              height: '55px',
            }}
            onClick={onAddClient}
          >
            <img src={group3} alt="add" className="mr-2" />
            {EvaluationSetUpEnum.ADD_NEW_CLIENT}
          </CommonButton>
        </Grid>
      </Grid>
    </Box>
  </div>
);

export default ClientSection;