import { Icons } from '@/components/icons';
import { IncomeApprochType } from '@/components/interface/Income-approch-type';
import StyledField from '@/components/styles/StyleFieldEditComp';
import { IncomeApproachEnum } from '@/pages/appraisal/Enum/AppraisalEnum';
import { sanitizeInput } from '@/utils/appraisalSanitize';
import {
  sanitizeAndLimitInput,
  sanitizeAndLimitInputAnnualIncome,
} from '@/utils/income-approch/calculation';
import { handleInputChange } from '@/utils/sanitize';
import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { FieldArray, useFormikContext } from 'formik';
import React, { useEffect, useState } from 'react';
import { ResidentialIncomeApproachEnum } from './residential-incom-approach-enum';

export const ResidentialEvaluationOtherIncome = ({ analysis_type }: any) => {
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
    setLastUpdatedField({ index: i, field: ResidentialIncomeApproachEnum.ANNUAL });

    const eventValue = e.target.value;
    const sanitizedValue = sanitizeInput(eventValue);
    const input = sanitizedValue.replace(/,/g, '');
    const numericValue =
      input === '' ? '' : !isNaN(Number(input)) ? Number(input) : 0;
    const monthlyIncome =
      numericValue !== '' ? (Number(numericValue) / 12).toFixed(2) : '';
    setFieldValue(
      `${ResidentialIncomeApproachEnum.OTHER_INCOME_SOURCES}.${i}.${ResidentialIncomeApproachEnum.ANNUAL_INCOME}`,
      numericValue.toString()
    );
    setFieldValue(`${ResidentialIncomeApproachEnum.OTHER_INCOME_SOURCES}.${i}.${ResidentialIncomeApproachEnum.MONTHLY_INCOME}`, monthlyIncome);
    calculateEffectiveIncome(
      calculateTotalAnnualIncome(values.otherIncomeSources)
    );
    const sanitizedValue1 = sanitizeAndLimitInputAnnualIncome(sanitizedValue);

    handleInputChange(
      handleChange,
      `${ResidentialIncomeApproachEnum.OTHER_INCOME_SOURCES}.${i}.${ResidentialIncomeApproachEnum.ANNUAL_INCOME}`,
      sanitizedValue1
      // numericValue.toString()
    );
  };

  const handleMonthlyIncomeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    i: number
  ) => {
    setLastUpdatedField({ index: i, field: ResidentialIncomeApproachEnum.MONTHLY });
    const event = sanitizeInput(e.target.value);
    const input: any = event.replace(/,/g, '') || 0;
    const annualIncome = (12 * input).toFixed(2);
    setFieldValue(`${ResidentialIncomeApproachEnum.OTHER_INCOME_SOURCES}.${i}.${ResidentialIncomeApproachEnum.ANNUAL_INCOME}`, annualIncome);
    setFieldValue(`${ResidentialIncomeApproachEnum.BOOLEAN}`, true);

    const sanitizedValue = sanitizeAndLimitInput(event);

    handleInputChange(
      handleChange,
      `${ResidentialIncomeApproachEnum.OTHER_INCOME_SOURCES}.${i}.${ResidentialIncomeApproachEnum.MONTHLY_INCOME}`,
      sanitizedValue.toString()
    );
  };

  const handleSquareIncomeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    i: number
  ) => {
    setLastUpdatedField({ index: i, field: ResidentialIncomeApproachEnum.SQUARE_FEET });
    const event = e.target.value;
    const input: any = event.replace(/,/g, '') || 0;
    const annualIncome = (1 * input).toFixed(2);
    setFieldValue(`${ResidentialIncomeApproachEnum.OTHER_INCOME_SOURCES}.${i}.${ResidentialIncomeApproachEnum.SQUARE_FEET}`, annualIncome);
    setFieldValue(`${ResidentialIncomeApproachEnum.BOOLEAN}`, true);

    const sanitizedValue = sanitizeAndLimitInput(event);

    handleInputChange(
      handleChange,
      `${ResidentialIncomeApproachEnum.OTHER_INCOME_SOURCES}.${i}.${ResidentialIncomeApproachEnum.SQUARE_FEET}`,
      sanitizedValue.toString()
    );
  };

  useEffect(() => {
    if (values.otherIncomeSources?.length) {
      const totalMonthlyIncome = values.otherIncomeSources.reduce(
        (total, ele: any) => {
          return total + (parseFloat(ele.monthly_income) || 0);
        },
        0
      );
      setFieldValue(`${ResidentialIncomeApproachEnum.OTHER_TOTAL_MONTHLY_INCOME}`, totalMonthlyIncome);

      const totalAnnualIncome = values.otherIncomeSources.reduce(
        (total, ele: any) => {
          return total + (parseFloat(ele.annual_income) || 0);
        },
        0
      );
      setFieldValue(`${ResidentialIncomeApproachEnum.OTHER_TOTAL_ANNUAL_INCOME}`, totalAnnualIncome);

      const totalSFIncome = values.otherIncomeSources.reduce(
        (total, ele: any) => {
          return total + (parseFloat(ele.square_feet) || 0);
        },
        0
      );
      setFieldValue(`${ResidentialIncomeApproachEnum.OTHER_TOTAL_SQ_FT}`, totalSFIncome);
    } else {
      setFieldValue(`${ResidentialIncomeApproachEnum.OTHER_TOTAL_SQ_FT}`, 0);
      setFieldValue(`${ResidentialIncomeApproachEnum.OTHER_TOTAL_ANNUAL_INCOME}`, 0);
      setFieldValue(`${ResidentialIncomeApproachEnum.OTHER_TOTAL_MONTHLY_INCOME}`, 0);
    }
  }, [values.otherIncomeSources, values?.vacancy]);

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
        {ResidentialIncomeApproachEnum.OTHER_INCOME}
      </Typography>

      <div
        style={{
          width: '100%',
          border: '1px solid #eee',
          backgroundColor: '#f5f5f5',
          marginTop: '10px',
          paddingBottom: '20px',
        }}
      >
        <Grid
          container
          spacing={2}
          columns={13}
          className="mt-[10px] px-2 w-full"
        >
          <FieldArray
            name={ResidentialIncomeApproachEnum.OTHER_INCOME_SOURCES}
            render={(arrayHelpers) => (
              <>
                {values.otherIncomeSources &&
                  values.otherIncomeSources.length > 0
                  ? values.otherIncomeSources.map((zone: any, i: number) => {
                    return (
                      <>
                        <Grid
                          item
                          xs={2}
                          xl={2}
                          key={zone.zone}
                          className="pl-[24px] pt-[5px]"
                        >
                          <StyledField
                            label={
                              <span className="font-bold text-black text-[11px]">
                                TYPE{' '}
                              </span>
                            }
                            name={`${ResidentialIncomeApproachEnum.OTHER_INCOME_SOURCES}.${i}.${ResidentialIncomeApproachEnum.TYPE}`}
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
                                `${ResidentialIncomeApproachEnum.OTHER_INCOME_SOURCES}.${i}.${ResidentialIncomeApproachEnum.TYPE}`,
                                input
                              );
                            }}
                            value={values.otherIncomeSources[i].type}
                            type="text"
                          />
                        </Grid>
                        <Grid
                          item
                          xs={2}
                          xl={2}
                          className="pl-[24px] pt-[5px]"
                        >
                          <StyledField
                            label={
                              <span className="font-bold text-black text-[11px]">
                                {ResidentialIncomeApproachEnum.MONTHLY_INCOME_HEADER}
                              </span>
                            }
                            name={`${ResidentialIncomeApproachEnum.OTHER_INCOME_SOURCES}.${i}.${ResidentialIncomeApproachEnum.MONTHLY_INCOME}`}
                            style={{
                              background:
                                lastUpdatedField.index === null ||
                                  (lastUpdatedField.index === i &&
                                    lastUpdatedField.field === ResidentialIncomeApproachEnum.MONTHLY)
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
                        <Grid
                          item
                          xs={2}
                          xl={2}
                          className="pt-[5px] pl-[24px]"
                        >
                          <StyledField
                            label={
                              <span className="font-bold text-black text-[11px]">
                                {ResidentialIncomeApproachEnum.ANNUAL_INCOME_HEADER}
                              </span>
                            }
                            name={`${ResidentialIncomeApproachEnum.OTHER_INCOME_SOURCES}.${i}.${ResidentialIncomeApproachEnum.ANNUAL_INCOME}`}
                            style={{
                              background:
                                lastUpdatedField.index === null ||
                                  (lastUpdatedField.index === i &&
                                    lastUpdatedField.field === ResidentialIncomeApproachEnum.ANNUAL)
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
                        <Grid
                          item
                          xs={2}
                          xl={2}
                          className="pt-[5px] pl-[24px]"
                        >
                          <StyledField
                            label={
                              analysis_type === '$/Acre' ? (
                                <span className="font-bold text-black text-[11px]">
                                  {ResidentialIncomeApproachEnum.AC}
                                </span>
                              ) : (
                                <span className="font-bold text-black text-[11px]">
                                  {ResidentialIncomeApproachEnum.SF}
                                </span>
                              )
                            }
                            name={`${ResidentialIncomeApproachEnum.OTHER_INCOME_SOURCES}.${i}.${ResidentialIncomeApproachEnum.SQUARE_FEET}`}
                            style={{
                              background: values.otherIncomeSources[i]
                                .square_feet
                                ? '#f5f5f5'
                                : '#ffffff',
                              borderBottomWidth: '1px',
                            }}
                            onChange={(e) => handleSquareIncomeChange(e, i)}
                            // value={values.otherIncomeSources[i].square_feet}
                            value={formatNumberSF(
                              values.otherIncomeSources[i].square_feet
                            )}
                            type="text"
                          />
                        </Grid>

                        <Grid
                          item
                          xs={2}
                          xl={2}
                          className="pt-[5px] pl-[24px]"
                        >
                          <StyledField
                            label={
                              <span className="font-bold text-black text-[11px]">
                                {ResidentialIncomeApproachEnum.COMMENTS}
                              </span>
                            }
                            name={`${ResidentialIncomeApproachEnum.OTHER_INCOME_SOURCES}.${i}.${ResidentialIncomeApproachEnum.COMMENTS.toLowerCase()}`}
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
                                `${ResidentialIncomeApproachEnum.OTHER_INCOME_SOURCES}.${i}.${ResidentialIncomeApproachEnum.COMMENTS.toLowerCase()}`,
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
                {values.otherIncomeSources.length < 7 && (
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
                            {ResidentialIncomeApproachEnum.OTHER_INCOME_SOURCE}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Grid>
                )}

              </>
            )}
          />
        </Grid>

        <Grid
          container
          spacing={2}
          columns={13}
          className="mt-[10px] px-2 w-full"
        >
          <Grid item xs={2} xl={2} className="pt-[5px] pl-[24px]">
            <div className="font-bold text-[11px]">{ResidentialIncomeApproachEnum.TOTALS_AND_AVERAGES}</div>
          </Grid>
          <Grid item xs={2} xl={2} className="pt-[5px] pl-[24px]">
            <div className="font-bold text-[11px]">
              ${values.other_total_monthly_income === 0 ? '0.00' : values?.other_total_monthly_income?.toLocaleString() as any}
            </div>
            <div className="text-xs text-greyApproch">{ResidentialIncomeApproachEnum.TOTAL}</div>
          </Grid>
          <Grid item xs={2} xl={2} className="pt-[5px] pl-[24px]">
            <div className="font-bold text-[11px]">
              ${formatCurrency(values.other_total_annual_income as any)}
            </div>
            <div className="text-xs text-greyApproch">{ResidentialIncomeApproachEnum.TOTAL}</div>
          </Grid>
          <Grid item xs={2} xl={2}></Grid>

          <Grid
            item
            xs={values.comparison_basis === 'SF' ? 1 : 1}
            className="pt-[5px] pl-[24px]"
          >
            <div className="font-bold text-[11px]">
              {values.other_total_sq_ft
                ? values.other_total_sq_ft.toLocaleString() + ' '
                : '0' + ' '}
              {analysis_type === ResidentialIncomeApproachEnum.DOLLAR_PER_ACRE ? ResidentialIncomeApproachEnum.AC : ResidentialIncomeApproachEnum.SF}
            </div>

            <div className="text-xs text-greyApproch">{ResidentialIncomeApproachEnum.TOTAL}</div>
          </Grid>

          <Grid item xs={2}></Grid>
        </Grid>
      </div>
    </>
  );
};
