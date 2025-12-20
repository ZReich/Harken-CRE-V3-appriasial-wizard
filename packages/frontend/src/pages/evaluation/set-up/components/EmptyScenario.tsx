import { Box, Checkbox, FormControlLabel, Grid } from '@mui/material';
import CommonButton from '@/components/elements/button/Button';
import { EvaluationSetUpEnum } from '../evaluation-setup-enums';
import group3 from '../../../../images/Group3.png';

interface ApproachOption {
  key: string;
  label: string;
  hide?: boolean;
}

// interface ScenarioType {
//   name: string;
//   has_sales_approach: number;
//   has_cost_approach: number;
//   has_income_approach: number;
//   has_multi_family_approach: number;
//   has_cap_approach: number;
//   has_lease_approach: number;
//   [key: string]: any; // Add index signature
// }

interface EmptyScenarioProps {
  onAddScenario: (approachKey?: string, checked?: boolean) => void;
  activeType: string | null;
}

const EmptyScenario = ({ onAddScenario, activeType }: EmptyScenarioProps) => {
  const approachOptions: ApproachOption[] = [
    { key: 'has_sales_approach', label: 'Sales Approach' },
    { key: 'has_cost_approach', label: 'Cost Approach', hide: activeType === 'land_only' },
    { key: 'has_income_approach', label: 'Income Approach' },
    { key: 'has_multi_family_approach', label: 'Multi-Family Approach', hide: activeType === 'land_only' },
    { key: 'has_cap_approach', label: 'Cap Approach', hide: activeType === 'land_only' },
    { key: 'has_lease_approach', label: 'Lease Approach' },
  ];

  return (
    <Box>
      <Grid container spacing={1} className="mt-2">
        {approachOptions
          .filter(option => !option.hide)
          .map(option => (
            <Grid item key={option.key}>
              <FormControlLabel
                control={
                  <Checkbox
                    onChange={(e) => onAddScenario(option.key, e.target.checked)}
                  />
                }
                label={option.label}
              />
            </Grid>
          ))}
      </Grid>

      <Grid container className="mt-4">
        <Grid item xs={12} className="flex justify-center">
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
              width: '100%',
            }}
            onClick={() => onAddScenario()}
          >
            <img src={group3} alt="add" className="mr-2" />
            {EvaluationSetUpEnum.ADD_MORE}
          </CommonButton>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmptyScenario;