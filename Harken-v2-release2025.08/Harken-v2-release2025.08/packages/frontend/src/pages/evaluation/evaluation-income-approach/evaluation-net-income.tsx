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
type EvaluationNetIncomeProps = {
  analysis_type?: any;
  arrayData?: any;
  indicatedSfCapRate?: any;
  setIndicatedSfCapRate?: (value: any) => any;
  setUnitMarketRate: React.Dispatch<React.SetStateAction<number>>;

  indicatedSfMarketRate?: any;
  setIndicatedSfMarketRate?: (value: any) => any;
  indicatedSfHighRate?: any;
  setIndicatedSfHighRate?: (value: any) => any;
  indicatedCapRate?: any;
  unitMarketRate?: any;

  setIndicatedCapRate?: (value: any) => any;
  indicatedMarketRate?: any;
  setIndicatedMarketRate?: (value: any) => any;
  indicatedHighRate?: any;
  setIndicateHighRate?: (value: any) => any;
  incomeTotal?: any;
  totalExpenses?: any;
  totalAnnualIncomess?: any;
};

export const EvaluationNetIncome = ({
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
  // incomeTotal,
  totalExpenses,
  totalAnnualIncomess,
}: EvaluationNetIncomeProps) => {
  const { handleChange, values, setFieldValue } = useFormikContext<any>();
  useEffect(() => {
    if (setIndicatedCapRate) setIndicatedCapRate(0);
    if (setIndicatedMarketRate) setIndicatedMarketRate(0);
    if (setIndicateHighRate) setIndicateHighRate(0);
    if (setIndicatedSfCapRate) setIndicatedSfCapRate(0);
    if (setIndicatedSfMarketRate) setIndicatedSfMarketRate(0);
    if (setIndicatedSfHighRate) setIndicatedSfHighRate(0);
  }, []);

  const [, setBedCapRate] = useState(0);
  const [unitMarketRate, setUnitMarketRate] = useState<number>(0); // State to store the calculated value
  console.log(unitMarketRate);

  const [, setBedMarketRate] = useState(0);
  const [, setBedHighRate] = useState(0);
  const total =
    (totalAnnualIncomess || 0) -
    (Number(values.vacant_amount) || 0) +
    values.other_total_annual_income -
    totalExpenses;
  // incomeTotal = 2632536;
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
      setFieldValue('indicated_psf_monthly', 0);
      setBedCapRate(0);
    }
    if (
      values.annual_capitalization_rate === '' ||
      values.annual_capitalization_rate === '0'
    ) {
      setFieldValue('indicated_psf_annual', 0);
      setBedMarketRate(0);
    }

    if (
      values.high_capitalization_rate === '' ||
      values.high_capitalization_rate === '0'
    ) {
      setFieldValue('indicated_psf_unit', 0);
      setBedHighRate(0);
    }

    if (values.monthly_capitalization_rate != 0 && total) {
      const event = {
        target: {
          name: 'monthly_capitalization_rate',
          value: String(values.monthly_capitalization_rate),
        },
      };

      if (setIndicatedCapRate) {
        handleCommonChange(
          event,
          'monthly_capitalization_rate',
          handleChange,
          total,
          setIndicatedCapRate
        );
      }
    }

    if (values.annual_capitalization_rate != 0 && total) {
      const event = {
        target: {
          name: 'annual_capitalization_rate',
          value: String(values.annual_capitalization_rate),
        },
      };
      if (setIndicatedMarketRate) {
        handleCommonChange(
          event,
          'annual_capitalization_rate',
          handleChange,
          total,
          setIndicatedMarketRate
        );
      }
    }

    if (values.high_capitalization_rate != 0 && total) {
      const event = {
        target: {
          name: 'high_capitalization_rate',
          value: String(values.high_capitalization_rate),
        },
      };

      if (setIndicateHighRate) {
        handleCommonChange(
          event,
          'high_capitalization_rate',
          handleChange,
          total,
          setIndicateHighRate
        );
      }
    }

    setFieldValue(`sq_ft_capitalization_rate`, values.high_capitalization_rate);
  }, [
    values.total_net_income,
    values.monthly_capitalization_rate,
    values.annual_capitalization_rate,
    values.high_capitalization_rate,
    total,
  ]);
  useEffect(() => {
    // Update the state whenever indicatedMarketRate or values.total_unit changes
    if (indicatedMarketRate && values.total_unit) {
      const calculatedValue = indicatedMarketRate / values.total_unit;
      setUnitMarketRate(calculatedValue);
    } else {
      setUnitMarketRate(0); // Reset to 0 if values are invalid
    }
  }, [indicatedMarketRate, values.total_unit]);
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
          setFieldValue(`indicated_psf_monthly`, 0);
        } else {
          setFieldValue('indicated_psf_monthly', unitCap);
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
          setFieldValue('indicated_psf_annual', 0);
        } else {
          setFieldValue('indicated_psf_annual', unitMarket);
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
          setFieldValue('indicated_psf_unit', 0);
        } else {
          setFieldValue('indicated_psf_unit', unitHigh);
        }
      }

      if (indicatedCapRate && values.total_bed) {
        const unitCap = indicatedCapRate / values.total_bed;
        console.log(unitCap, 'unitCapunitCap');
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
        setFieldValue('indicated_psf_monthly', unitCap);
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

        setFieldValue('indicated_psf_annual', unitMarket);
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

        setFieldValue('indicated_psf_unit', unitHigh);
      }

      if (values.total_net_income) {
        setFieldValue('indicated_range_monthly', indicatedCapRate);
        setFieldValue('indicated_range_annual', indicatedMarketRate);
        setFieldValue('indicated_range_sq_feet', indicatedHighRate);
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
      'indicatedAnnualRangeforWeightage',
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
        className="text-xs font-bold montserrat-font-family mt-0.5 px-2"
      >
        NET INCOME
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
          className="mt-[10px] px-2 mx-0 w-full"
        >
          <Grid item xs={2} className="pt-[5px] pl-0">
            <div className="font-bold text-[11px]">CAP RATES</div>
          </Grid>
          <Grid item xs={2} className="pt-[5px] pl-[24px]">
            <div className="mb-2">
              <label
                htmlFor="monthly_capitalization_rate"
                className="block text-[10px] font-medium text-slate-400 mb-1"
              >
                Low CAP Rate
              </label>
              <Field
                name="monthly_capitalization_rate"
                type="text"
                onKeyDown={(e: any) =>
                  handleCommonKeyDown(
                    e,
                    'monthly_capitalization_rate',
                    handleChange,
                    values
                  )
                }
                onChange={(e: any) =>
                  handleCommonChange(
                    e,
                    'monthly_capitalization_rate',
                    handleChange,
                    values.total_net_income,
                    setIndicatedCapRate ?? (() => {})
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
                Market CAP Rate
              </label>
              <Field
                name="annual_capitalization_rate"
                type="text"
                onKeyDown={(e: any) =>
                  handleCommonKeyDown(
                    e,
                    'annual_capitalization_rate',
                    handleChange,
                    values
                  )
                }
                onChange={(e: any) =>
                  handleCommonChange(
                    e,
                    'annual_capitalization_rate',
                    handleChange,
                    values.total_net_income,
                    setIndicatedMarketRate ?? (() => {})
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
                High CAP Rate
              </label>
              <Field
                name="high_capitalization_rate"
                type="text"
                onKeyDown={(e: any) =>
                  handleCommonKeyDown(
                    e,
                    'high_capitalization_rate',
                    handleChange,
                    values
                  )
                }
                onChange={(e: any) =>
                  handleCommonChange(
                    e,
                    'high_capitalization_rate',
                    handleChange,
                    values.total_net_income,
                    setIndicateHighRate ?? (() => {})
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

        <Grid container spacing={2} columns={13} className="px-2 mx-0 w-full">
          <Grid item xs={2} className="pt-[5px] pl-0">
            <div className="mt-2 font-bold text-[11px]">CAP RATE NOTES</div>
          </Grid>
          <Grid item xs={14} className="pt-[16px] pl-0">
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
          className="mt-[20px] px-2 mx-0 w-full"
        >
          <Grid item xs={2} className="pl-0">
            <div className="text-xs font-bold">INDICATED VALUE RANGE</div>
          </Grid>
          <Grid item xs={2} className="pl-[24px]">
            <div className="text-sm text-slate-400">
              ${' '}
              {Number(
                isFinite(indicatedCapRate) ? indicatedCapRate : 0
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
                isFinite(indicatedMarketRate) ? indicatedMarketRate : 0
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
                isFinite(indicatedHighRate) ? indicatedHighRate : 0
              ).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </Grid>
          <Grid item xs={4} className="pl-[24px]"></Grid>
        </Grid>

        {values.comparison_basis === IncomeApproachEnum.UNIT &&
          localStorage.getItem('activeType') === 'building_with_land' && (
            <Grid
              container
              spacing={2}
              columns={13}
              className="mt-[4px] px-2 mx-0 w-full"
            >
              <Grid item xs={2} className="pl-0">
                <div className="text-xs font-bold">INDICATED VALUE $/UNIT</div>
              </Grid>

              <Grid item xs={2} className="pl-[24px]">
                <div className="text-xs">
                  ${' '}
                  {(indicatedCapRate / values.total_unit)?.toLocaleString(
                    undefined,
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </div>
              </Grid>
              <Grid item xs={2} className="pl-[24px]">
                <div className="text-xs">
                  ${' '}
                  {(indicatedMarketRate / values.total_unit)?.toLocaleString(
                    undefined,
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </div>
              </Grid>
              <Grid item xs={2} className="pl-[24px]">
                <div className="text-sm text-slate-400">
                  ${' '}
                  {(indicatedHighRate / values.total_unit)?.toLocaleString(
                    undefined,
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </div>
              </Grid>
              <Grid item xs={4} className="pl-[24px]"></Grid>
            </Grid>
        )}

        {values.comparison_basis === IncomeApproachEnum.BED &&
          localStorage.getItem('activeType') === 'building_with_land' && (
            <Grid
              container
              spacing={2}
              columns={13}
              className="mt-[4px] px-2 mx-0 w-full"
            >
              <Grid item xs={2} className="pl-0">
                <div className="text-xs font-bold">INDICATED VALUE $/BED</div>
              </Grid>
              <Grid item xs={2} className="pl-[24px]">
                <div className="text-sm text-slate-400">
                  ${' '}
                  {(indicatedCapRate / values.total_bed)?.toLocaleString(
                    undefined,
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </div>
              </Grid>
              <Grid item xs={2} className="pl-[24px]">
                <div className="text-xs">
                  ${' '}
                  {(indicatedMarketRate / values.total_bed)?.toLocaleString(
                    undefined,
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </div>
              </Grid>
              <Grid item xs={2} className="pl-[24px]">
                <div className="text-sm text-slate-400">
                  ${' '}
                  {(indicatedHighRate / values.total_bed)?.toLocaleString(
                    undefined,
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </div>
              </Grid>
              <Grid item xs={4} className="pl-[24px]"></Grid>
            </Grid>
          )}
        
        <Grid
          container
          spacing={2}
          columns={13}
          className="mt-[4px] px-2 mx-0 w-full"
        >
          <Grid item xs={2} className="pl-0">
            <div className="text-xs font-bold">
              INDICATED VALUE {analysis_type === '$/Acre' ? '$/AC' : '$/SF'}
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
      </div>
    </>
  );
};
