import TextEditor from '@/components/styles/text-editor';
import { handleCommonChange } from '@/utils/appraisalSanitize';
import Grid from '@mui/material/Grid';
import { useFormikContext } from 'formik';
import { useEffect, useState } from 'react';
export const ResidentialCostImprovementNetIncome = ({
  passOperInc,
  passSf,
  passUnit,
  passBed,
  totalSqft,
  totalAdjustedCost,
  comparisonBasis,
  unit,
  bed,
  onTotalCostValuation,
  setTotalCostValuations,
}: any) => {
  const { handleChange, values, setFieldValue } = useFormikContext<any>();
  const [indicatedCapRate, setIndicatedCapRate] = useState(0);
  const [indicatedMarketRate, setIndicatedMarketRate] = useState(0);
  const [indicatedHighRate, setIndicateHighRate] = useState(0);
  const [totalCostValuation, setTotalCostValuation] = useState<any>();
  const [indicatedSfCapRate, setIndicatedSfCapRate] = useState(0);
  const [dollarPerUnit, setDollarPerUnit] = useState<any>(0);
  const [dollarPerBed, setDollarPerBed] = useState<any>(0);
  console.log(indicatedSfCapRate);
  useEffect(() => {
    if (values.monthly_capitalization_rate === '') {
      setIndicatedCapRate(0);
    }
    if (values.annual_capitalization_rate === '') {
      setIndicatedMarketRate(0);
    }

    if (values.sq_ft_capitalization_rate === '') {
      setIndicateHighRate(0);
    }

    if (values.monthly_capitalization_rate != 0 && passOperInc) {
      const event = {
        target: {
          name: 'monthly_capitalization_rate',
          value: String(values.monthly_capitalization_rate),
        },
      };

      handleCommonChange(
        event,
        'monthly_capitalization_rate',
        handleChange,
        passOperInc,
        setIndicatedCapRate
      );
    }

    if (values.annual_capitalization_rate != 0 && passOperInc) {
      const event = {
        target: {
          name: 'annual_capitalization_rate',
          value: String(values.annual_capitalization_rate),
        },
      };

      handleCommonChange(
        event,
        'annual_capitalization_rate',
        handleChange,
        passOperInc,
        setIndicatedMarketRate
      );
    }

    if (values.sq_ft_capitalization_rate != 0 && passOperInc) {
      const event = {
        target: {
          name: 'sq_ft_capitalization_rate',
          value: String(values.sq_ft_capitalization_rate),
        },
      };

      handleCommonChange(
        event,
        'sq_ft_capitalization_rate',
        handleChange,
        passOperInc,
        setIndicateHighRate
      );
    }
  }, [
    passOperInc,
    values.monthly_capitalization_rate,
    values.annual_capitalization_rate,
    values.sq_ft_capitalization_rate,
  ]);

  useEffect(() => {
    if (passSf) {
      const sfcap = indicatedCapRate / passSf;
      setIndicatedSfCapRate(sfcap);
      if (indicatedCapRate && passSf) {
        const unitCap = indicatedCapRate / passUnit;
        setFieldValue('indicated_psf_monthly', unitCap);
      }

      if (indicatedMarketRate && passSf) {
        const unitMarket = indicatedMarketRate / passUnit;
        setFieldValue('indicated_psf_annual', unitMarket);
      }

      if (indicatedHighRate && passSf) {
        const unitHigh = indicatedHighRate / passUnit;
        setFieldValue('indicated_psf_unit', unitHigh);
      }

      //

      if (indicatedCapRate && passBed) {
        const unitCap = indicatedCapRate / passBed;
        setFieldValue('adjusted_cost', unitCap);
      }

      if (indicatedMarketRate && passBed) {
        const unitMarket = indicatedMarketRate / passBed;
        setFieldValue('indicated_psf_annual', unitMarket);
      }

      if (indicatedHighRate && passBed) {
        const unitHigh = indicatedHighRate / passBed;
        setFieldValue('indicated_psf_unit', unitHigh);
      }

      if (passOperInc) {
        setFieldValue('indicated_range_monthly', indicatedCapRate);
        setFieldValue('indicated_range_annual', indicatedMarketRate);
        setFieldValue('indicated_range_sq_feet', indicatedHighRate);
      }
    }
  }, [passSf, indicatedCapRate, indicatedMarketRate, indicatedHighRate]);
  useEffect(() => {
    if (values) {
      const totalCostValuations = totalAdjustedCost + (values?.land_value || 0);
      setTotalCostValuation(totalCostValuations);
      setFieldValue('total_cost_valuation', totalCostValuations);

      setTotalCostValuations(totalCostValuations);

      // Pass the totalCostValuations to parent component
      if (onTotalCostValuation && typeof onTotalCostValuation === 'function') {
        onTotalCostValuation(totalCostValuations);
      }
    }
    if (totalCostValuation) {
      const totalUnits = unit.reduce(
        (sum: any, obj: any) => sum + (obj.unit || 0),
        0
      );
      const dollarUnit = totalUnits ? totalCostValuation / totalUnits : 0;
      setDollarPerUnit(dollarUnit);
      setFieldValue('indicated_value_punit', dollarUnit);
      const totalBeds = bed.reduce(
        (sum: any, obj: any) => sum + (obj.bed || 0),
        0
      );
      const dollarBed = totalBeds ? totalCostValuation / totalBeds : 0;
      setDollarPerBed(dollarBed);
      setFieldValue('indicated_value_pbed', dollarBed);
    }
  }, [totalAdjustedCost, unit, totalCostValuation, bed]);
  return (
    <>
      <div className="py-1"></div>
      <div style={{ width: '100%' }}>
        <Grid
          container
          spacing={2}
          columns={13}
          className="mt-[20px] px-2 w-full"
        >
          <Grid item xl={2} xs={3}>
            <div className="text-sm">TOTAL ADJUSTED COST</div>
          </Grid>
          <Grid item xs={2}>
            <div className="text-sm">
              $
              {totalAdjustedCost
                ? totalAdjustedCost?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : '0.00'}
            </div>
          </Grid>
          <Grid item xs={4}></Grid>
        </Grid>
        <Grid
          container
          spacing={2}
          columns={13}
          className="mt-[4px] px-2 w-full"
        >
          <Grid item xl={2} xs={3}>
            <div className="text-sm">Total Land Value</div>
          </Grid>
          <Grid item xl={2} xs={3}>
            <div className="text-sm">
              $
              {values?.land_value
                ? values?.land_value.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : '0.00'}
            </div>
          </Grid>
          <Grid item xs={4}></Grid>
        </Grid>
        <Grid
          container
          spacing={2}
          columns={13}
          className="mt-[4px] px-2 w-full"
        >
          <Grid item xl={2} xs={3}>
            <div className="font-bold">Total Cost Valuation</div>
          </Grid>
          <Grid item xl={2} xs={3}>
            <div className=" font-bold text-sm text-[#0DA1C7] ">
              $
              {totalCostValuation
                ? totalCostValuation?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : '0.00'}
            </div>
          </Grid>
          <Grid item xs={4}></Grid>
        </Grid>
        <Grid
          container
          spacing={2}
          columns={13}
          className="mt-[4px] px-2 w-full"
        >
          <Grid item xl={2} xs={3}>
            <div className="text-sm">Total Cost PSF</div>
          </Grid>
          <Grid item xl={2} xs={3}>
            <div className="text-sm">
              $
              {(totalCostValuation / totalSqft)?.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) || '0.00'}
            </div>
          </Grid>
          <Grid item xs={4}></Grid>
        </Grid>
        {comparisonBasis === 'Unit' ? (
          <Grid
            container
            spacing={2}
            columns={13}
            className="mt-[4px] px-2 w-full"
          >
            <Grid item xs={2}>
              <div className="text-sm">$/UNIT</div>
            </Grid>
            <Grid item xs={2}>
              <div className="text-sm">
                $
                {Number.isNaN(dollarPerUnit) ||
                dollarPerUnit === 'undefined' ||
                dollarPerUnit === -Infinity ||
                dollarPerUnit === Infinity
                  ? '0.00'
                  : dollarPerUnit?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }) || '0.00'}
              </div>
            </Grid>
            <Grid item xs={4}></Grid>
          </Grid>
        ) : null}
        {comparisonBasis === 'Bed' ? (
          <Grid
            container
            spacing={2}
            columns={13}
            className="mt-[4px] px-2 w-full"
          >
            <Grid item xs={2}>
              <div className="text-sm">$/BED</div>
            </Grid>
            <Grid item xs={2}>
              <div className="text-sm">
                $
                {Number.isNaN(dollarPerBed) ||
                dollarPerBed === 'undefined' ||
                dollarPerBed === -Infinity ||
                dollarPerBed === Infinity
                  ? '0.00'
                  : dollarPerBed?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
              </div>
            </Grid>
            <Grid item xs={4}></Grid>
          </Grid>
        ) : null}
      </div>
      <>
        <div
          style={{
            width: '100%',
            marginTop: '10px',
            paddingBottom: '20px',
          }}
        >
          <Grid
            container
            spacing={2}
            columns={13}
            className="px-2 w-full block m-auto"
          >
            <Grid item xs={2} className="pt-[16px] pl-0">
              <div className="font-semibold text-sm">NOTES</div>
            </Grid>
            <Grid item xs={14} className="pt-[16px] pl-0">
              {/* <TextAreaField
                label=""
                style={{
                  width: '330%',
                }}
                name="comments"
                value={values.comments}
                onChange={(e: any) => {
                  setFieldValue('comments', e.target.value);
                }}
              /> */}
              <TextEditor
                editorContent={values.comments} // Set initial content from Formik
                editorData={(content) => setFieldValue('comments', content)} // Update Formik field
              />
            </Grid>
          </Grid>
        </div>
      </>
    </>
  );
};
