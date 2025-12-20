import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import StyledField from '@/components/styles/StyleFieldEditComp';
import React, { useEffect, useState } from 'react';
import { handleInputChange, sanitizeInputLandSizeAc } from '@/utils/sanitize';
import { FieldArray, useFormikContext } from 'formik';
import { IncomeApprochType } from '@/components/interface/Income-approch-type';
import { Icons } from '@/components/icons';
import { sanitizeInput } from '@/utils/appraisalSanitize';
import { IncomeApproachEnum } from '../Enum/AppraisalEnum';
import {
  sanitizeAndLimitInput,
  sanitizeAndLimitInputAnnualIncome,
} from '@/utils/income-approch/calculation';

export const OtherIncome = ({ analysis_type }: any) => {
  const { handleChange, values, setFieldValue } =
    useFormikContext<IncomeApprochType>();
  const [lastUpdatedField, setLastUpdatedField] = useState<{
    index: number | null;
    field: 'monthly' | 'annual' | 'square_feet' | null;
  }>({
    index: null,
    field: null,
  });

  const calculateTotalValue = (
    otherIncomeSources: any[],
    valueType: string,
    fieldEnum: IncomeApproachEnum
  ) => {
    const totalValue = otherIncomeSources.reduce(
      (acc, elem) => acc + (parseFloat(elem[valueType]) || 0),
      0
    );
    setFieldValue(fieldEnum, totalValue);
    return totalValue;
  };

  const calculateTotalAnnualIncome = (otherIncomeSources: any[]) => {
    return calculateTotalValue(
      otherIncomeSources,
      IncomeApproachEnum.ANNUAL_INCOME,
      IncomeApproachEnum.OTHER_TOTAL_ANNUAL_INCOME
    );
  };

  const calculateEffectiveIncome = (value: any) => {
    const effc: any = (value * (100 - values.vacancy)) / 100;
    setFieldValue(IncomeApproachEnum.ADJUST_GROSS_AMOUNT, effc);
  };

  const formatCurrency = (value: number) => {
    const truncatedValue = Math.floor(value * 100) / 100;
    return truncatedValue.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };
  const handleAnnualIncomeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    i: number
  ) => {
    setLastUpdatedField({ index: i, field: 'annual' });

    const eventValue = e.target.value;
    const sanitizedValue = sanitizeInput(eventValue);
    const input = sanitizedValue.replace(/,/g, '');
    const numericValue =
      input === '' ? '' : !isNaN(Number(input)) ? Number(input) : 0;
    const monthlyIncome =
      numericValue !== '' ? (Number(numericValue) / 12).toFixed(2) : '';
    setFieldValue(
      `otherIncomeSources.${i}.annual_income`,
      numericValue.toString()
    );
    setFieldValue(`otherIncomeSources.${i}.monthly_income`, monthlyIncome);
    calculateEffectiveIncome(
      calculateTotalAnnualIncome(values.otherIncomeSources)
    );
    const sanitizedValue1 = sanitizeAndLimitInputAnnualIncome(sanitizedValue);

    handleInputChange(
      handleChange,
      `otherIncomeSources.${i}.annual_income`,
      sanitizedValue1
      // numericValue.toString()
    );
  };

  // const handleAnnualIncomeChange = (
  //   e: React.ChangeEvent<HTMLInputElement>,
  //   i: number
  // ) => {
  //   setLastUpdatedField({ index: i, field: 'annual' });
  //   const event = sanitizeInput(e.target.value);
  //   const input: any = event.replace(/,/g, '') || 0;

  //   const monthlyIncome = (input / 12).toFixed(2);
  //   setFieldValue(`otherIncomeSources.${i}.monthly_income`, monthlyIncome);

  //   values.otherIncomeSources[i].annual_income = input.toString();

  //   values.otherIncomeSources[i].monthly_income = (input / 12).toString();
  //   calculateEffectiveIncome(
  //     calculateTotalAnnualIncome(values.otherIncomeSources)
  //   );

  //   const sanitizedValue = sanitizeAndLimitInputAnnualIncome(event);

  //   handleInputChange(
  //     handleChange,
  //     `otherIncomeSources.${i}.annual_income`,
  //     sanitizedValue.toString()
  //   );
  // };

  const handleMonthlyIncomeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    i: number
  ) => {
    setLastUpdatedField({ index: i, field: 'monthly' });
    const event = sanitizeInput(e.target.value);
    const input: any = event.replace(/,/g, '') || 0;
    const annualIncome = (12 * input).toFixed(2);
    setFieldValue(`otherIncomeSources.${i}.annual_income`, annualIncome);
    setFieldValue(`boolean`, true);

    const sanitizedValue = sanitizeAndLimitInput(event);

    handleInputChange(
      handleChange,
      `otherIncomeSources.${i}.monthly_income`,
      sanitizedValue.toString()
    );
  };

  const handleSquareIncomeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    i: number
  ) => {
    setLastUpdatedField({ index: i, field: 'square_feet' });
    const event = e.target.value;
    const input: any = event.replace(/,/g, '') || 0;
    const annualIncome = (1 * input).toFixed(2);
    setFieldValue(`otherIncomeSources.${i}.square_feet`, annualIncome);
    setFieldValue(`boolean`, true);

    let sanitizedValue = sanitizeAndLimitInput(event);
    if (analysis_type === '$/Acre')
      sanitizedValue = sanitizeInputLandSizeAc(event);

    handleInputChange(
      handleChange,
      `otherIncomeSources.${i}.square_feet`,
      sanitizedValue.toString()
    );
  };

  // Calculate other income totals
  useEffect(() => {
    if (values.otherIncomeSources?.length && values.otherIncomeSources.some(source => source.type || source.monthly_income || source.annual_income)) {
      const totalMonthlyIncome = values.otherIncomeSources.reduce(
        (total, ele: any) => {
          return total + (parseFloat(ele.monthly_income) || 0);
        },
        0
      );
      setFieldValue(`other_total_monthly_income`, totalMonthlyIncome);

      const totalAnnualIncome = values.otherIncomeSources.reduce(
        (total, ele: any) => {
          return total + (parseFloat(ele.annual_income) || 0);
        },
        0
      );
      setFieldValue(`other_total_annual_income`, totalAnnualIncome);

      const totalSFIncome = values.otherIncomeSources.reduce(
        (total, ele: any) => {
          const sqFeet = typeof ele.square_feet === 'string' 
            ? ele.square_feet.replace(/,/g, '') 
            : ele.square_feet?.toString() || '0';
          return total + (parseFloat(sqFeet) || 0);
        },
        0
      );
      setFieldValue(`other_total_sq_ft`, totalSFIncome);
    } else {
      // Reset to 0 if no valid other income sources
      setFieldValue(`other_total_sq_ft`, 0);
      setFieldValue(`other_total_annual_income`, 0);
      setFieldValue(`other_total_monthly_income`, 0);
    }
  }, [values.otherIncomeSources]);

  function formatNumber(value: number | string): string {
    const [integerPart, decimalPart] = value.toString().split('.');
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return decimalPart
      ? `${formattedInteger}.${decimalPart}`
      : formattedInteger + '.00';
  }

  const addIncomeSource = (arrayHelpers: any) => {
    arrayHelpers.insert(values.otherIncomeSources.length, {
      type: '',
      monthly_income: '',
      annual_income: '',
      square_feet: '',
      comments: '',
      link_overview: 0,
      id: null,
    });
  };

  const formatNumberSF = (value: string | number) => {
    if (value) {
      return Number(value).toLocaleString();
    }
    return '';
  };

  return (
    <>
      <Typography
        variant="h6"
        component="p"
        className="text-xs font-bold montserrat-font-family mt-0.5"
      >
        OTHER INCOME
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
          <FieldArray
            name="otherIncomeSources"
            render={(arrayHelpers) => (
              <>
                {values.otherIncomeSources &&
                  values.otherIncomeSources.length > 0
                  ? values.otherIncomeSources.map((zone: any, i: number) => {
                    return (
                      <>
                        <Grid
                          item
                          xs={2} xl={2}
                          key={zone.zone}
                          className="pl-[24px] pt-[5px]"
                        >
                          <StyledField
                            label={
                              <span className="font-bold text-black text-[11px]">
                                TYPE{' '}
                              </span>
                            }
                            name={`otherIncomeSources.${i}.type`}
                            style={{
                              background: '#fff',
                              borderBottomWidth: '1px',
                            }}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) => {
                              const input = e.target.value;
                              handleInputChange(
                                handleChange,
                                `otherIncomeSources.${i}.type`,
                                input
                              );
                            }}
                            value={values.otherIncomeSources[i].type}
                            type="text"
                          />
                        </Grid>
                        <Grid item xs={2} xl={2} className="pl-[24px] pt-[5px]">
                          <StyledField
                            label={
                              <span className="font-bold text-black text-[11px]">
                                MONTHLY INCOME
                              </span>
                            }
                            name={`otherIncomeSources.${i}.monthly_income`}
                            style={{
                              background:
                                lastUpdatedField.index === null ||
                                  (lastUpdatedField.index === i &&
                                    lastUpdatedField.field === 'monthly')
                                  ? '#fff'
                                  : '#f5f5f5',
                              borderBottomWidth: '1px',
                            }}
                            onChange={(e) => handleMonthlyIncomeChange(e, i)}
                            value={formatNumber(
                              values.otherIncomeSources[i].monthly_income
                                ? values.otherIncomeSources[i].monthly_income
                                : '0.00'
                            )}
                            type="text"
                          />
                        </Grid>
                        <Grid item xs={2} xl={2} className="pt-[5px] pl-[24px]">
                          <StyledField
                            label={
                              <span className="font-bold text-black text-[11px]">
                                ANNUAL INCOME
                              </span>
                            }
                            name={`otherIncomeSources.${i}.annual_income`}
                            style={{
                              background:
                                lastUpdatedField.index === null ||
                                  (lastUpdatedField.index === i &&
                                    lastUpdatedField.field === 'annual')
                                  ? '#fff'
                                  : '#f5f5f5',
                              borderBottomWidth: '1px',
                            }}
                            onChange={(e) => handleAnnualIncomeChange(e, i)}
                            value={formatNumber(
                              values.otherIncomeSources[i].annual_income
                                ? values.otherIncomeSources[i].annual_income
                                : '0.00'
                            )}
                            type="text"
                          />
                        </Grid>
                        <Grid item xs={2} xl={2}></Grid>
                        <Grid item xs={2} xl={2} className="pt-[5px] pl-[24px]">
                          <StyledField
                            label={
                              analysis_type === '$/Acre' ? (
                                <span className="font-bold text-black text-[11px]">
                                  AC
                                </span>
                              ) : (
                                <span className="font-bold text-black text-[11px]">
                                  SF
                                </span>
                              )
                            }
                            name={`otherIncomeSources.${i}.square_feet`}
                            style={{
                              background: values.otherIncomeSources[i]
                                .square_feet
                                ? '#f5f5f5'
                                : '#ffffff',
                              borderBottomWidth: '1px',
                            }}
                            onChange={(e) => handleSquareIncomeChange(e, i)}
                            // value={
                            //   analysis_type === '$/Acre' ?
                            //     sanitizeInputLandSizeAc(values.otherIncomeSources[i].square_feet)
                            //   : formatNumberSF(
                            //     values.otherIncomeSources[i].square_feet
                            //   )}
                            value={
                              analysis_type === '$/Acre'
                                ? Number(values.otherIncomeSources[i]?.square_feet || 0).toFixed(3)
                                : formatNumberSF(values.otherIncomeSources[i]?.square_feet)
                            }
                            type="text"
                          />
                        </Grid>

                        <Grid item xs={2} xl={2} className="pt-[5px] pl-[24px]">
                          <StyledField
                            label={
                              <span className="font-bold text-black text-[11px]">
                                COMMENTS
                              </span>
                            }
                            name={`otherIncomeSources.${i}.comments`}
                            style={{
                              background: '#fff',
                              borderBottomWidth: '1px',
                            }}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) => {
                              const input = e.target.value;
                              handleInputChange(
                                handleChange,
                                `otherIncomeSources.${i}.comments`,
                                input
                              );
                            }}
                            value={values.otherIncomeSources[i].comments}
                            type="text"
                          />
                        </Grid>

                        <Grid item xs={1}>
                          <div
                            className="pt-4 flex items-center min-h-[47px]"
                          // onClick={() => {
                          //   arrayHelpers.remove(i);
                          // }}
                          >
                            <Icons.RemoveCircleOutlineIcon
                              className="text-red-500 cursor-pointer"
                              onClick={() => {
                                arrayHelpers.remove(i);
                              }}
                            />
                          </div>
                        </Grid>
                      </>
                    );
                  })
                  : null}

                <Grid item xs={2}>
                  <div
                  // onClick={() => {
                  //   addIncomeSource(arrayHelpers);
                  // }}
                  >
                    <div className="information-content">
                      <div
                        className="flex text-[#0da1c7] mt-3 w-[161px] cursor-pointer"
                        onClick={() => {
                          addIncomeSource(arrayHelpers);
                        }}
                      >
                        <span>
                          <Icons.AddCircleOutlineIcon className="cursor-pointer" />
                        </span>
                        <span className="mt-[3px] pl-2 text-xs whitespace-nowrap">
                          Other Income Source
                        </span>
                      </div>
                    </div>
                  </div>
                </Grid>
              </>
            )}
          />
        </Grid>

        <Grid
          container
          spacing={2}
          columns={13}
          className="mt-1 px-2 w-full"
        >
          <Grid item xs={2} xl={2} className="pt-[5px] pl-[24px]">
            <div className="font-bold text-[11px]">TOTALS & AVERAGES</div>
          </Grid>
          <Grid item xs={2} xl={2} className="pt-[5px] pl-[24px]">
            <div className="font-bold text-[11px]">
              ${values.other_total_monthly_income === 0 ? '0.00' : values?.other_total_monthly_income?.toLocaleString() as any}
            </div>
            <div className="text-xs text-greyApproch">Total</div>
          </Grid>
          <Grid item xs={2} xl={2} className="pt-[5px] pl-[24px]">
            <div className="font-bold text-[11px]">
              ${formatCurrency(values.other_total_annual_income as any)}
            </div>
            <div className="text-xs text-greyApproch">Total</div>
          </Grid>
          <Grid item xs={2} xl={2}></Grid>

          <Grid
            item
            xs={values.comparison_basis === 'SF' ? 1 : 1}
            className="pt-[5px] pl-[24px]"
          >
            <div className="font-bold text-[11px]">
              {values.other_total_sq_ft
                ? analysis_type === '$/Acre'
                  ? Number(values.other_total_sq_ft).toLocaleString(undefined, {
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3,
                  }) + ' '
                  : Number(values.other_total_sq_ft).toLocaleString() + ' '
                : '0 '}
              {analysis_type === '$/Acre' ? 'AC' : 'SF'}
            </div>

            <div className="text-xs text-greyApproch">Total</div>
          </Grid>

          <Grid item xs={2}></Grid>
        </Grid>
      </div>
    </>
  );
};
