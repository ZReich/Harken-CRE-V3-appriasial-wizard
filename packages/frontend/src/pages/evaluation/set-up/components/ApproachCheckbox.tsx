import { Checkbox, FormControlLabel, Grid } from '@mui/material';

interface ApproachOption {
  key: string;
  label: string;
  hide?: boolean;
}

interface ApproachCheckboxProps {
  option: ApproachOption;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ApproachCheckbox = ({ option, checked, onChange }: ApproachCheckboxProps) => {
  if (option.hide) return null;
  
  return (
    <Grid item>
      <FormControlLabel
        control={
          <Checkbox
            checked={checked}
            onChange={onChange}
          />
        }
        label={option.label}
      />
    </Grid>
  );
};

export default ApproachCheckbox;