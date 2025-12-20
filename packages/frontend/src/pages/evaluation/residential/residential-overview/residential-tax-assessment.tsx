import { HarkenHr } from '@/components/harken-hr';
import StyledField from '@/components/styles/StyleFieldEditComp';
import { TaxAssessmentEnum } from '@/pages/appraisal/overview/OverviewEnum';
import {
  handleInputChange,
  sanitizeInputDollarSignComps,
} from '@/utils/sanitize';
import { Grid, Typography } from '@mui/material';
import { useFormikContext } from 'formik';
import { useEffect } from 'react';
export const ResidentialTaxAssessment = () => {
  const { values, handleChange, setFieldValue } = useFormikContext<any>();
  const amount1 = values.land_assessment;
  const amount2 = values.structure_assessment;
  const number1 = parseFloat(amount1?.replace(/[$,]/g, ''));
  const number2 = parseFloat(amount2?.replace(/[$,]/g, ''));
  const sum = number1 + number2;
  const ResidentialBuildingSize = values.zonings.map(
    (ele: {
      gross_living_sq_ft: string;
      basement_finished_sq_ft: string;
      basement_unfinished_sq_ft: string;
    }) => {
      return {
        gross_living_sq_ft: parseFloat(
          ele.gross_living_sq_ft.replace(/,/g, '')
        ),
        basement_finished_sq_ft: parseFloat(
          ele.basement_finished_sq_ft.replace(/,/g, '')
        ),
        basement_unfinished_sq_ft: parseFloat(
          ele.basement_unfinished_sq_ft.replace(/,/g, '')
        ),
      };
    }
  );
  const totalSize = ResidentialBuildingSize.reduce(
    (accumulator: any, currentValue: any) => {
      accumulator.gross_living_sq_ft += currentValue.gross_living_sq_ft;
      accumulator.basement_finished_sq_ft +=
        currentValue.basement_finished_sq_ft;
      accumulator.basement_unfinished_sq_ft +=
        currentValue.basement_unfinished_sq_ft;
      return accumulator;
    },
    {
      gross_living_sq_ft: 0,
      basement_finished_sq_ft: 0,
      basement_unfinished_sq_ft: 0,
    }
  );
  const building_size =
    totalSize.gross_living_sq_ft +
    totalSize.basement_finished_sq_ft +
    totalSize.basement_unfinished_sq_ft;

  const priceSquareFoot = sum / building_size;
  useEffect(() => {
    const structure_assessment = parseFloat(
      values.structure_assessment.replace(/[$,]/g, '')
    );
    const land_assessment = parseFloat(
      values.land_assessment.replace(/[$,]/g, '')
    );
    const sum = structure_assessment + land_assessment;

    const formattedSum = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(sum);

    setFieldValue('total_land_improvement', isNaN(sum) ? 0 : formattedSum);
  }, [values.structure_assessment, values.land_assessment]);

  const formattedPriceSquareFoot = priceSquareFoot.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  useEffect(() => {
    if (values.land_assessment || values.structure_assessment) {
      setFieldValue('price_square_foot', formattedPriceSquareFoot)
    }
  }, [values.land_assessment, values.structure_assessment])

  return (
    <>
      <div>
        <Typography
          variant="h1"
          component="h2"
          className="text-lg font-bold mt-5"
        >
          {TaxAssessmentEnum.TAX_ASSESSMENT}
        </Typography>
        <Grid container spacing={3} className="mt-0 items-end">
          <Grid item xs={6} xl={3} className='pt-2'>
            <StyledField
              label={TaxAssessmentEnum.LAND_ASSESSMENT}
              name={TaxAssessmentEnum.LAND_ASSESSMENT_NAME}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const input = sanitizeInputDollarSignComps(e.target.value);
                handleInputChange(
                  handleChange,
                  TaxAssessmentEnum.LAND_ASSESSMENT_NAME,
                  input
                );
              }}
              value={values.land_assessment}
            />
          </Grid>
          <Grid item xs={6} xl={3} className='pt-2'>
            <StyledField
              label={TaxAssessmentEnum.IMPORVEMENT_ASSESSED_VALUE}
              name={TaxAssessmentEnum.STRUCTURE_ASSESSMENT}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const input = sanitizeInputDollarSignComps(e.target.value);
                handleInputChange(
                  handleChange,
                  TaxAssessmentEnum.STRUCTURE_ASSESSMENT,
                  input
                );
              }}
            />
          </Grid>
          <Grid item xs={6} xl={3} className='pt-2'>
            <StyledField
              label={TaxAssessmentEnum.LAND_PLUS_IMROVEMENTS}
              name={TaxAssessmentEnum.TOTAL_LAND_IMPROVEMENT}
              value={'$' + values.total_land_improvement}
              disabled={true}
            />
          </Grid>
          <Grid item xs={6} xl={3} className='pt-2'>
            <StyledField
              label={TaxAssessmentEnum.$_SF}
              name={TaxAssessmentEnum.PRICE_SQUARE_FOOT}
              value={
                `$${isNaN(Number(String(values.price_square_foot).replace(/,/g, '')))
                  ? 0
                  : values.price_square_foot}`
              }
              disabled={true}
            />
          </Grid>
        </Grid>
        <Grid container spacing={3} className="mt-2 items-end">
          <Grid item xs={6} xl={3} className='pt-2'>
            <StyledField
              label={TaxAssessmentEnum.SIDS}
              name={TaxAssessmentEnum.SIDS_NAME}
            />
          </Grid>
          <Grid item xs={6} xl={3} className='pt-2'>
            <StyledField
              label={TaxAssessmentEnum.TAXES_IN_ARREARS}
              name={TaxAssessmentEnum.TAXES_IN_ARREARS_NAME}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const input = sanitizeInputDollarSignComps(e.target.value);
                handleInputChange(
                  handleChange,
                  TaxAssessmentEnum.TAXES_IN_ARREARS_NAME,
                  input
                );
              }}
              value={values.taxes_in_arrears}
            />
          </Grid>
          <Grid item xs={6} xl={3} className='pt-2'>
            <StyledField
              label={TaxAssessmentEnum.TAX_LIABILITY}
              name={TaxAssessmentEnum.TAX_LIABILITY_NAME}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const input = sanitizeInputDollarSignComps(e.target.value);
                handleInputChange(
                  handleChange,
                  TaxAssessmentEnum.TAX_LIABILITY_NAME,
                  input
                );
              }}
              value={values.tax_liability}
            />
          </Grid>
          <Grid item xs={6} xl={3} className='pt-2'>
            <StyledField
              label={TaxAssessmentEnum.ASSESSED_MARKET_VALUE_YEAR}
              name={TaxAssessmentEnum.ASSESSED_MARKET_YEAR}
            />
          </Grid>
        </Grid>
        <Grid container spacing={3} className="mt-2 items-end">
          <Grid item xs={6} xl={3} className='pt-2'>
            <StyledField
              label={TaxAssessmentEnum.TAX_LIABILITY_YEAR}
              name={TaxAssessmentEnum.TAX_LIABILITY_YEAR_NAME}
            />
          </Grid>
        </Grid>
        <HarkenHr />
      </div>
    </>
  );
};
