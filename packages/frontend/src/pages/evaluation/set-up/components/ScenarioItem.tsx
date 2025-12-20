import { Box, Grid } from '@mui/material';
import StyledField from '@/components/styles/StyleFieldEditComp';
import { Icons } from '@/components/icons';
import ApproachCheckbox from './ApproachCheckbox';
import { EvaluationSetUpEnum } from '../evaluation-setup-enums';
import CommonButton from '@/components/elements/button/Button';
import group3 from '../../../../images/Group3.png';

interface ScenarioItemProps {
  scenario: {
    name: string;
    has_sales_approach: number;
    has_cost_approach: number;
    has_income_approach: number;
    has_multi_family_approach: number;
    has_cap_approach: number;
    has_lease_approach: number;
    [key: string]: any;
  };
  index: number;
  totalScenarios: number;
  onRemove: () => void;
  onAddMore: () => void;
  setFieldValue: (field: string, value: any) => void;
  isLastItem: boolean;
  activeType: string | null;
}

const ScenarioItem = ({
  scenario,
  index,
  totalScenarios,
  onRemove,
  onAddMore,
  setFieldValue,
  isLastItem,
  activeType,
}: ScenarioItemProps) => {
  const approachOptions = [
    { key: 'has_sales_approach', label: 'Sales Approach' },
    { key: 'has_cost_approach', label: 'Cost Approach', hide: activeType === 'land_only' },
    { key: 'has_income_approach', label: 'Income Approach' },
    { key: 'has_multi_family_approach', label: 'Multi-Family Approach', hide: activeType === 'land_only' },
    { key: 'has_cap_approach', label: 'Cap Approach', hide: activeType === 'land_only' },
    { key: 'has_lease_approach', label: 'Lease Approach' },
  ];

  return (
    <Box className="mb-6 border-b pb-4">
      {/* Show scenario name field only if there's more than one scenario */}
      {totalScenarios > 1 && (
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={5}>
            <StyledField
              label="Scenario Name"
              name={`scenarios[${index}].name`}
              value={scenario.name}
              onChange={(e: any) => setFieldValue(`scenarios[${index}].name`, e.target.value)}
            />
          </Grid>
          <Grid item xs={1} className="flex justify-center">
            <Icons.DeleteIcon
              className="text-red-500 cursor-pointer"
              onClick={onRemove}
            />
          </Grid>
        </Grid>
      )}

      {/* Approach checkboxes */}
      <Grid container spacing={1} className="mt-2">
        {approachOptions
          .filter(option => !option.hide)
          .map(option => (
            <ApproachCheckbox
              key={option.key}
              option={option}
              checked={Boolean((scenario as any)[option.key])}
              onChange={(e) => setFieldValue(`scenarios[${index}].${option.key}`, e.target.checked ? 1 : 0)}
            />
          ))}
      </Grid>

      {/* Add More button - only show for the last scenario */}
      {isLastItem && (
        <Grid container className="mt-4">
          <Grid item xs={12} className="flex justify-end">
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
              onClick={onAddMore}
            >
              <img src={group3} alt="add" className="mr-2" />
              {EvaluationSetUpEnum.ADD_MORE}
            </CommonButton>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default ScenarioItem;