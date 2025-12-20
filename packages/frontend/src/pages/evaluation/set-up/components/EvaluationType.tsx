import { Grid } from '@mui/material';
import SelectTextField from '@/components/styles/select-input';
import { EvaluationSetUpEnum } from '../evaluation-setup-enums';
import { ChangeEvent } from 'react';

interface EvaluationTypeProps {
  options: any[];
  value: any;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  touched: boolean | undefined;
  errors: any;
  submitCount: number;
}

const EvaluationType = ({
  options,
  value,
  onChange,
  touched,
  errors,
  submitCount,
}: EvaluationTypeProps) => (
  <Grid container spacing={2} className="mt-[20px]">
    <Grid item xs={12}>
      <SelectTextField
        label={
          <span className="relative">
            {EvaluationSetUpEnum.EVALUATION_TYPE}
            <span className="text-red-500 text-base">*</span>
          </span>
        }
        name={EvaluationSetUpEnum.EVALUATION_TYPE_NAME}
        options={options}
        value={value}
        onChange={onChange}
      />
      {(touched || submitCount > 0) && errors && (
        <span className="text-red-500 text-[11px] absolute">
          {errors}
        </span>
      )}
    </Grid>
  </Grid>
);

export default EvaluationType;