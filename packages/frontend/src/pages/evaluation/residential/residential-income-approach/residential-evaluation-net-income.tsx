import TextEditor from '@/components/styles/text-editor';
import { IncomeApproachEnum } from '@/pages/appraisal/Enum/AppraisalEnum';
import {
  handleCommonChange,
  handleCommonKeyDown,
} from '@/utils/appraisalSanitize';
import { sanitizeExpensePercentage } from '@/utils/sanitize';
import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Field, useFormikContext } from 'formik';
import { useEffect, useState } from 'react';
import { ResidentialIncomeApproachEnum } from './residential-incom-approach-enum';
type EvaluationNetIncomeProps = {
  analysis_type?: any;
  arrayData?: any;
  indicatedSfCapRate?: any;
  setIndicatedSfCapRate?: (value: any) => any;
  indicatedSfMarketRate?: any;
  setIndicatedSfMarketRate?: (value: any) => any;
  indicatedSfHighRate?: any;
  setIndicatedSfHighRate?: (value: any) => any;
  indicatedCapRate?: any;
  setIndicatedCapRate?: (value: any) => any;
  indicatedMarketRate?: any;
  setIndicatedMarketRate?: (value: any) => any;
  indicatedHighRate?: any;
  setIndicateHighRate?: (value: any) => any;
  incomeTotal?: any;
  totalAnnualIncomess?: any;
  totalExpenses?: any
};

export const ResidentialEvaluationNetIncome = ({
  analysis_type,
  indicatedSfCapRate,
  setIndicatedSfCapRate,
  indicatedSfMarketRate,
  setIndicatedSfMarketRate,
  indicatedSfHighRate,
  setIndicatedSfHighRate,
  indicatedCapRate,
  setIndicatedCapRate,
  indicatedMarketRate,
  setIndicatedMarketRate,
  indicatedHighRate,
  setIndicateHighRate,
  incomeTotal,
  totalAnnualIncomess,
  totalExpenses
}: EvaluationNetIncomeProps) => {
  const { handleChange, values, setFieldValue } = useFormikContext<any>();
  // Reset state values when component mounts or URL changes
  useEffect(() => {
    if (setIndicatedCapRate) setIndicatedCapRate(0);
    if (setIndicatedMarketRate) setIndicatedMarketRate(0);
    if (setIndicateHighRate) setIndicateHighRate(0);
    if (setIndicatedSfCapRate) setIndicatedSfCapRate(0);
    if (setIndicatedSfMarketRate) setIndicatedSfMarketRate(0);
    if (setIndicatedSfHighRate) setIndicatedSfHighRate(0);
  }, []);

  const [bedCapRate, setBedCapRate] = useState(0);
  const [bedMarketRate, setBedMarketRate] = useState(0);
  const [bedHighRate, setBedHighRate] = useState(0);
  console.log('sdasdhagdgadhgasfghdfasdas', incomeTotal);
  incomeTotal = 2632536;
  const total = (totalAnnualIncomess || 0) - (Number(values.vacant_amount) || 0) + values.other_total_annual_income - totalExpenses
  useEffect(() => {
    // Reset all rates when component mounts or re-renders with new values
    if (setIndicatedCapRate) setIndicatedCapRate(0);
    if (setIndicatedMarketRate) setIndicatedMarketRate(0);
    if (setIndicateHighRate) setIndicateHighRate(0);
    setBedCapRate(0);
    setBedMarketRate(0);
    setBedHighRate(0);

    if (
      values.monthly_capitalization_rate === '' ||
      values.monthly_capitalization_rate === '0'
    ) {
      setFieldValue(ResidentialIncomeApproachEnum.INDICATED_PSF_MONTHLY, 0);
      setBedCapRate(0);
    }
    if (
      values.annual_capitalization_rate === '' ||
      values.annual_capitalization_rate === '0'
    ) {
      setFieldValue(ResidentialIncomeApproachEnum.INDICATED_PSF_ANNUAL, 0);
      setBedMarketRate(0);
    }

    if (
      values.high_capitalization_rate === '' ||
      values.high_capitalization_rate === '0'
    ) {
      setFieldValue(ResidentialIncomeApproachEnum.INDICATED_PSF_UNIT, 0);
      setBedHighRate(0);
    }

    if (values.monthly_capitalization_rate != 0 && total) {
      const event = {
        target: {
          name: ResidentialIncomeApproachEnum.MONTHLY_CAPITALIZATION_RATE,
          value: String(values.monthly_capitalization_rate),
        },
      };

      if (setIndicatedCapRate) {
        handleCommonChange(
          event,
          ResidentialIncomeApproachEnum.MONTHLY_CAPITALIZATION_RATE,
          handleChange,
          total,
          setIndicatedCapRate
        );
      }
    }

    if (values.annual_capitalization_rate != 0 && total) {
      const event = {
        target: {
          name: ResidentialIncomeApproachEnum.ANNUAL_CAPITALIZATION_RATE,
          value: String(values.annual_capitalization_rate),
        },
      };
      if (setIndicatedMarketRate) {
        handleCommonChange(
          event,
          ResidentialIncomeApproachEnum.ANNUAL_CAPITALIZATION_RATE,
          handleChange,
          total,
          setIndicatedMarketRate
        );
      }
    }

    if (values.high_capitalization_rate != 0 && total) {
      const event = {
        target: {
          name: ResidentialIncomeApproachEnum.HIGH_CAPITALIZATION_RATE,
          value: String(values.high_capitalization_rate),
        },
      };

      if (setIndicateHighRate) {
        handleCommonChange(
          event,
          ResidentialIncomeApproachEnum.HIGH_CAPITALIZATION_RATE,
          handleChange,
          total,
          setIndicateHighRate
        );
      }
    }

    setFieldValue(`${ResidentialIncomeApproachEnum.SQ_FT_CAPITALIZATION_RATE}`, values.high_capitalization_rate);
  }, [
    values.total_net_income,
    values.monthly_capitalization_rate,
    values.annual_capitalization_rate,
    values.high_capitalization_rate,
    total

  ]);

  useEffect(() => {
    // Reset SF rates when total_sq_ft changes
    if (!values.total_sq_ft || values.total_sq_ft === 0) {
      if (setIndicatedSfCapRate) setIndicatedSfCapRate(0);
      if (setIndicatedSfMarketRate) setIndicatedSfMarketRate(0);
      if (setIndicatedSfHighRate) setIndicatedSfHighRate(0);
      return;
    }

    const sfcap = indicatedCapRate / values.total_sq_ft;
    const sfMarket = indicatedMarketRate / values.total_sq_ft;
    const sfHigh = indicatedHighRate / values.total_sq_ft;

    if (setIndicatedSfCapRate) setIndicatedSfCapRate(sfcap);
    if (setIndicatedSfMarketRate) setIndicatedSfMarketRate(sfMarket);
    if (setIndicatedSfHighRate) setIndicatedSfHighRate(sfHigh);
    if (values.total_sq_ft) {
      if (indicatedCapRate && values.total_sq_ft) {
        const unitCap = indicatedCapRate / values.total_unit;
        if (
          values.incomeSources.length >= 1 &&
          values.incomeSources.some(
            (source: { annual_income: number }) => source.annual_income == 0
          )
        ) {
          setFieldValue(`${ResidentialIncomeApproachEnum.INDICATED_PSF_MONTHLY}`, 0);
        } else {
          setFieldValue(`${ResidentialIncomeApproachEnum.INDICATED_PSF_MONTHLY}`, unitCap);
        }
      }

      if (indicatedMarketRate && values.total_sq_ft) {
        const unitMarket = indicatedMarketRate / values.total_unit;
        if (
          values.incomeSources.length >= 1 &&
          values.incomeSources.some(
            (source: { annual_income: number }) => source.annual_income == 0
          )
        ) {
          setFieldValue(ResidentialIncomeApproachEnum.INDICATED_PSF_ANNUAL, 0);
        } else {
          setFieldValue(ResidentialIncomeApproachEnum.INDICATED_PSF_ANNUAL, unitMarket);
        }
      }

      if (indicatedHighRate && values.total_sq_ft) {
        const unitHigh = indicatedHighRate / values.total_unit;
        if (
          values.incomeSources.length >= 1 &&
          values.incomeSources.some(
            (source: { annual_income: number }) => source.annual_income == 0
          )
        ) {
          setFieldValue(ResidentialIncomeApproachEnum.INDICATED_PSF_UNIT, 0);
        } else {
          setFieldValue(ResidentialIncomeApproachEnum.INDICATED_PSF_UNIT, unitHigh);
        }
      }

      if (indicatedCapRate && values.total_bed) {
        const unitCap = indicatedCapRate / values.total_bed;

        if (
          values.incomeSources.length >= 1 &&
          values.incomeSources.some(
            (source: { annual_income: number }) => source.annual_income == 0
          )
        ) {
          setBedCapRate(0);
        } else {
          setBedCapRate(unitCap);
        }
        setFieldValue(`${ResidentialIncomeApproachEnum.INDICATED_PSF_MONTHLY}`, unitCap);
      }

      if (indicatedMarketRate && values.total_bed) {
        const unitMarket = indicatedMarketRate / values.total_bed;
        if (
          values.incomeSources.length >= 1 &&
          values.incomeSources.some(
            (source: { annual_income: number }) => source.annual_income == 0
          )
        ) {
          setBedMarketRate(0);
        } else {
          setBedMarketRate(unitMarket);
        }

        setFieldValue(ResidentialIncomeApproachEnum.INDICATED_PSF_ANNUAL, unitMarket);
      }

      if (indicatedHighRate && values.total_bed) {
        const unitHigh = indicatedHighRate / values.total_bed;
        if (
          values.incomeSources.length >= 1 &&
          values.incomeSources.some(
            (source: { annual_income: number }) => source.annual_income == 0
          )
        ) {
          setBedHighRate(0);
        } else {
          setBedHighRate(unitHigh);
        }

        setFieldValue(ResidentialIncomeApproachEnum.INDICATED_PSF_UNIT, unitHigh);
      }

      if (values.total_net_income) {
        setFieldValue(ResidentialIncomeApproachEnum.INDICATED_PSF_MONTHLY, indicatedCapRate);
        setFieldValue(ResidentialIncomeApproachEnum.INDICATED_RANGE_ANNUAL, indicatedMarketRate);
        setFieldValue(ResidentialIncomeApproachEnum.INDICATED_RANGE_SQ_FT, indicatedHighRate);
      }
    }
  }, [
    values.total_sq_ft,
    indicatedCapRate,
    indicatedMarketRate,
    indicatedHighRate,
  ]);
  useEffect(() => {
    // Store values in localStorage when they change
    localStorage.setItem(
      'indicatedAnnualRangeforWeightage1',
      indicatedMarketRate.toString()
    );
    localStorage.setItem(
      'indicatedPsfRangeforWeightage',
      indicatedSfMarketRate.toString()
    );

    // Clean up function to clear localStorage values when component unmounts
    return () => {
      // localStorage.removeItem('indicatedAnnualRangeforWeightage');
      localStorage.removeItem('indicatedPsfRangeforWeightage');
    };
  }, [indicatedMarketRate, indicatedSfMarketRate]);



  return (
    <>
      <div className="py-3  mt-2">
        <hr />
      </div>
      <Typography
        variant="h6"
        component="p"
        className="text-xs font-bold montserrat-font-family mt-0.5"
      >
        {ResidentialIncomeApproachEnum.NET_INCOME}
      </Typography>

      <div
        style={{
          width: '100%',
          border: '1px solid #eee',
          backgroundColor: '#f5f5f5',
          marginTop: '10px',
          paddingBottom: '10px',
        }}
      >
        <Grid
          container
          spacing={2}
          columns={13}
          className="mt-[10px] px-2 w-full"
        >
          <Grid item xs={2} className="pt-[5px] pl-[24px]">
            <div className="font-bold text-[11px]">{ResidentialIncomeApproachEnum.CAP_RATES}</div>
          </Grid>
          <Grid item xs={2} className="pt-[5px] pl-[24px]">
            <div className="mb-2">
              <label
                htmlFor="monthly_capitalization_rate"
                className="block text-[10px] font-medium text-slate-400 mb-1"
              >
                {ResidentialIncomeApproachEnum.LOW_CAP_RATE}
              </label>
              <Field
                name={ResidentialIncomeApproachEnum.MONTHLY_CAPITALIZATION_RATE}
                type="text"
                onKeyDown={(e: any) =>
                  handleCommonKeyDown(
                    e,
                    ResidentialIncomeApproachEnum.MONTHLY_CAPITALIZATION_RATE,
                    handleChange,
                    values
                  )
                }
                onChange={(e: any) =>
                  handleCommonChange(
                    e,
                    ResidentialIncomeApproachEnum.MONTHLY_CAPITALIZATION_RATE,
                    handleChange,
                    values.total_net_income,
                    setIndicatedCapRate ?? (() => { })
                  )
                }
                value={sanitizeExpensePercentage(
                  values.monthly_capitalization_rate
                )}
                className="py-0.5 px-3 border-x-0 border-t-0 w-full"
              />
            </div>
          </Grid>
          <Grid item xs={2} className="pt-[5px] pl-[24px]">
            <div className="mb-2">
              <label
                htmlFor="annual_capitalization_rate"
                className="block text-[10px] font-medium text-slate-400 mb-1"
              >
                {ResidentialIncomeApproachEnum.MARKET_CAP_RATE}
              </label>
              <Field
                name={ResidentialIncomeApproachEnum.ANNUAL_CAPITALIZATION_RATE}
                type="text"
                onKeyDown={(e: any) =>
                  handleCommonKeyDown(
                    e,
                    ResidentialIncomeApproachEnum.ANNUAL_CAPITALIZATION_RATE,
                    handleChange,
                    values
                  )
                }
                onChange={(e: any) =>
                  handleCommonChange(
                    e,
                    ResidentialIncomeApproachEnum.ANNUAL_CAPITALIZATION_RATE,
                    handleChange,
                    values.total_net_income,
                    setIndicatedMarketRate ?? (() => { })
                  )
                }
                value={sanitizeExpensePercentage(
                  values.annual_capitalization_rate
                )}
                className="py-0.5 px-3 border-x-0 border-t-0 w-full"
              />
            </div>
          </Grid>

          <Grid item xs={2} className="pt-[5px] pl-[24px]">
            <div className="mb-2">
              <label
                htmlFor="email"
                className="block text-[10px] font-medium text-slate-400 mb-1"
              >
                {ResidentialIncomeApproachEnum.HIGH_CAP_RATE}
              </label>
              <Field
                name={ResidentialIncomeApproachEnum.HIGH_CAPITALIZATION_RATE}
                type="text"
                onKeyDown={(e: any) =>
                  handleCommonKeyDown(
                    e,
                    ResidentialIncomeApproachEnum.HIGH_CAPITALIZATION_RATE,
                    handleChange,
                    values
                  )
                }
                onChange={(e: any) =>
                  handleCommonChange(
                    e,
                    ResidentialIncomeApproachEnum.HIGH_CAPITALIZATION_RATE,
                    handleChange,
                    values.total_net_income,
                    setIndicateHighRate ?? (() => { })
                  )
                }
                value={sanitizeExpensePercentage(
                  values.high_capitalization_rate
                )}
                className="py-0.5 px-3 border-x-0 border-t-0 w-full"
              />
            </div>
          </Grid>

          <Grid item xs={4}></Grid>
        </Grid>

        <Grid container spacing={2} columns={13} className="px-2 w-full">
          <Grid item xs={2} className="pt-[5px] pl-[24px]">
            <div className="mt-2 font-bold text-[11px]">CAP RATE NOTES</div>
          </Grid>
          <Grid item xs={14} className="pt-[16px] pl-[24px]">
            <div className="mb-2">
              <TextEditor
                style={{
                  background: '#fff',
                  borderBottomWidth: '1px',
                  width: '100%', // Adjust width if necessary
                  height: '110px',
                }}
                editorContent={values.cap_rate_notes}
                editorData={(content) =>
                  setFieldValue('cap_rate_notes', content)
                }
              />
            </div>
          </Grid>
          {/* <Grid item xs={4}></Grid> */}
        </Grid>
      </div>

      <div style={{ width: '100%', marginTop: '10px' }}>
        <Grid
          container
          spacing={2}
          columns={13}
          className="mt-[20px] px-2 w-full"
        >
          <Grid item xs={2} className="pl-[24px]">
            <div className="text-xs font-bold">{ResidentialIncomeApproachEnum.INDICATED_VALUE_RANGE}</div>
          </Grid>
          <Grid item xs={2} className="pl-[24px]">
            <div className="text-sm text-slate-400">
              ${' '}
              {Number(
                (isFinite(indicatedCapRate) ? indicatedCapRate : 0)
              ).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </Grid>
          <Grid item xs={2} className="pl-[24px]">
            <div className="text-sm text-[#0DA1C7] font-bold">
              ${' '}
              {Number(
                (isFinite(indicatedMarketRate) ? indicatedMarketRate : 0)
              ).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </Grid>
          <Grid item xs={2} className="pl-[24px]">
            <div className="text-sm text-slate-400">
              ${' '}
              {Number(
                (isFinite(indicatedHighRate) ? indicatedHighRate : 0)
              ).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </Grid>
          <Grid item xs={4} className="pl-[24px]"></Grid>
        </Grid>

        <Grid
          container
          spacing={2}
          columns={13}
          className="mt-[4px] px-2 w-full"
        >
          <Grid item xs={2} className="pl-[24px]">
            <div className="text-xs font-bold">
              {ResidentialIncomeApproachEnum.INDICATED_VALUE} {analysis_type === ResidentialIncomeApproachEnum.DOLLAR_PER_ACRE ? ResidentialIncomeApproachEnum.DOLLAR_PER_AC : ResidentialIncomeApproachEnum.DOLLAR_PER_SF}
            </div>
          </Grid>
          <Grid item xs={2} className="pl-[24px]">
            <div className="text-sm text-slate-400">
              ${' '}
              {(isFinite(indicatedSfCapRate)
                ? indicatedSfCapRate
                : 0
              ).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </Grid>
          <Grid item xs={2} className="pl-[24px]">
            <div className="text-xs">
              ${' '}
              {(isFinite(indicatedSfMarketRate)
                ? indicatedSfMarketRate
                : 0
              ).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </Grid>
          <Grid item xs={2} className="pl-[24px]">
            <div className="text-sm text-slate-400">
              ${' '}
              {(isFinite(indicatedSfHighRate)
                ? indicatedSfHighRate
                : 0
              ).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </Grid>
          <Grid item xs={4} className="pl-[24px]"></Grid>
        </Grid>

        {values.comparison_basis === IncomeApproachEnum.UNIT ? (
          <Grid
            container
            spacing={2}
            columns={13}
            className="mt-[4px] px-2 w-full"
          >
            <Grid item xs={2} className="pl-[24px]">
              <div className="text-xs font-bold">{ResidentialIncomeApproachEnum.INDICATED_VALUE_DOLLAR_PER_UNIT}</div>
            </Grid>
            <Grid item xs={2} className="pl-[24px]">
              <div className="text-sm text-slate-400">
                ${' '}
                {values.indicated_psf_monthly.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </Grid>
            <Grid item xs={2} className="pl-[24px]">
              <div className="text-xs">
                ${' '}
                {values.indicated_psf_annual.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </Grid>
            <Grid item xs={2} className="pl-[24px]">
              <div className="text-sm text-slate-400">
                ${' '}
                {values.indicated_psf_unit.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </Grid>
            <Grid item xs={4} className="pl-[24px]"></Grid>
          </Grid>
        ) : null}

        {values.comparison_basis === IncomeApproachEnum.BED ? (
          <Grid
            container
            spacing={2}
            columns={13}
            className="mt-[4px] px-2 w-full"
          >
            <Grid item xs={2} className="pl-[24px]">
              <div className="text-xs font-bold">{ResidentialIncomeApproachEnum.INDICATED_VALUE_DOLLAR_PER_BED}</div>
            </Grid>
            <Grid item xs={2} className="pl-[24px]">
              <div className="text-sm text-slate-400">
                ${' '}
                {bedCapRate.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </Grid>
            <Grid item xs={2} className="pl-[24px]">
              <div className="text-xs">
                ${' '}
                {bedMarketRate.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </Grid>
            <Grid item xs={2} className="pl-[24px]">
              <div className="text-sm text-slate-400">
                ${' '}
                {bedHighRate.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </Grid>
            <Grid item xs={4} className="pl-[24px]"></Grid>
          </Grid>
        ) : null}
      </div>
    </>
  );
};
