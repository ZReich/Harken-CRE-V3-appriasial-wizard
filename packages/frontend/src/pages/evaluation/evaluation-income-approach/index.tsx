import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import StyledField from '@/components/styles/StyleFieldEditComp';
import React, { useEffect, useState } from 'react';
import { handleInputChange } from '@/utils/sanitize';
import { FieldArray, useFormikContext, Field } from 'formik';
import { IncomeApprochType } from '@/components/interface/Income-approch-type';
import { Icons } from '@/components/icons';
import { sanitizeInputPercentage } from '@/utils/sanitize';
import { IncomeApproachEnum } from '@/pages/appraisal/Enum/AppraisalEnum';
import { sanitizeInput, sanitizeInputRent } from '@/utils/appraisalSanitize';
import { handleVacancyKeyDown } from '@/utils/income-approch/sanitize-keypress';
import { handleVacancyChange } from '@/utils/income-approch/handle-change';
import Tooltip from '@mui/material/Tooltip';
import {
  sanitizeAndLimitInput,
  sanitizeAndLimitInputAnnualIncome,
} from '@/utils/income-approch/calculation';
import { sanitizeSf } from '@/utils/appraisalSanitize';
import { retailOptions } from '@/pages/comps/create-comp/SelectOption';
import TextEditor from '@/components/styles/text-editor';

export const EvaluationIncome = ({
  analysis_type,
  ID,
  totalAnnualIncomess,
  setTotalAnnualIncomess,
}: any) => {
  const { handleChange, values, setFieldValue } =
    useFormikContext<IncomeApprochType>();
  const [, setTotalMonthlyIncome] = useState(0);
  const [totalAnnualIncome, setTotalAnnualIncome] = useState(0);
  const [totalSF, setTotalSf] = useState(0);
  const [, setVaccancy] = useState(0);
  const [bool, setBool] = useState(false);
  const [newItems, setNewItems] = useState<number[]>([]);
  // const [totalAnnualIncomess, setTotalAnnualIncomess] = useState(0);
  // const [focusedField, setFocusedField] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [lastUpdatedField, setLastUpdatedField] = useState<{
    index: number | null;
    field: 'monthly' | 'annual' | 'rent' | null;
  }>({
    index: null,
    field: null,
  });
  console.log('check the value', values);
  const calculateTotalValue = (
    incomeSources: any[],
    valueType: string,
    fieldEnum: IncomeApproachEnum
  ) => {
    const totalValue = incomeSources.reduce(
      (acc, elem) => acc + (parseFloat(elem[valueType]) || 0),
      0
    );
    setFieldValue(fieldEnum, totalValue);
    return totalValue;
  };

  const calculateTotalAnnualIncome = (incomeSources: any[]) => {
    return calculateTotalValue(
      incomeSources,
      IncomeApproachEnum.ANNUAL_INCOME,
      IncomeApproachEnum.TOTAL_ANNUAL_INCOME
    );
  };

  const calculateTotalMonthlyIncome = (incomeSources: any[]) => {
    return calculateTotalValue(
      incomeSources,
      IncomeApproachEnum.MONTHLY_INCOME,
      IncomeApproachEnum.TOTAL_MONTHLY_INCOME
    );
  };

  const calculateEffectiveIncome = (value: any) => {
    const effc: any = (value * (100 - values.vacancy)) / 100;
    setFieldValue(IncomeApproachEnum.ADJUST_GROSS_AMOUNT, effc);
  };

  const formatCurrency = (value: number) => {
    const roundedValue = Math.round(value * 100) / 100; // राउंड टू 2 डेसिमल्स
    return roundedValue.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleRentSqFtChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    i: number
  ) => {
    setLastUpdatedField({ index: i, field: 'rent' });
    const rawValue = sanitizeInputRent(e.target.value.replace(/,/g, ''));
    const input = parseFloat(rawValue) || 0;

    let sfSource: number;

    if (values.comparison_basis === 'Unit') {
      sfSource = parseFloat(values.incomeSources[i].unit) || 0;
    } else if (values.comparison_basis === 'Bed') {
      sfSource = parseFloat(values.incomeSources[i].rent_bed) || 0;
    } else {
      sfSource = parseFloat(values.incomeSources[i].sf_source) || 0;
    }

    const newAnnualIncome = input * sfSource;

    setFieldValue(
      `incomeSources.${i}.annual_income`,
      newAnnualIncome.toFixed(2)
    );
    setFieldValue(
      `incomeSources.${i}.monthly_income`,
      (newAnnualIncome / 12).toFixed(2)
    );

    values.incomeSources[i].annual_income = newAnnualIncome.toString();
    setTotalAnnualIncome(calculateTotalAnnualIncome(values.incomeSources));
    calculateEffectiveIncome(calculateTotalAnnualIncome(values.incomeSources));

    values.incomeSources[i].monthly_income = (newAnnualIncome / 12).toString();
    setTotalMonthlyIncome(calculateTotalMonthlyIncome(values.incomeSources));

    handleInputChange(handleChange, `incomeSources.${i}.rent_sq_ft`, rawValue);
  };

  const handleAnnualIncomeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    i: number
  ) => {
    setLastUpdatedField({ index: i, field: 'annual' });
    const event = sanitizeInput(e.target.value);
    const input: any = event.replace(/,/g, '') || 0;

    const monthlyIncome = (input / 12).toFixed(2);
    setFieldValue(`incomeSources.${i}.monthly_income`, monthlyIncome);

    values.incomeSources[i].annual_income = input.toString();
    setTotalAnnualIncome(calculateTotalAnnualIncome(values.incomeSources));

    values.incomeSources[i].monthly_income = (input / 12).toString();
    setTotalMonthlyIncome(calculateTotalMonthlyIncome(values.incomeSources));
    calculateEffectiveIncome(calculateTotalAnnualIncome(values.incomeSources));

    values.incomeSources[i].rent_sq_ft = (
      input / parseFloat(values.incomeSources[i].sf_source)
    ).toString();
    const sfSource = parseFloat(values.incomeSources[i].sf_source) || 0;
    const bedSource = parseFloat(values.incomeSources[i].rent_bed) || 0;
    const unitSource = parseFloat(values.incomeSources[i].unit) || 0;

    let rentSqFt;

    if (values.comparison_basis === 'Bed') {
      rentSqFt = input / bedSource;
    } else if (values.comparison_basis === 'Unit') {
      rentSqFt = input / unitSource;
    } else {
      rentSqFt = input / sfSource;
    }

    const data = Math.floor(rentSqFt * 100) / 100;
    setFieldValue(`incomeSources.${i}.rent_sq_ft`, data);

    const sanitizedValue = sanitizeAndLimitInputAnnualIncome(event);

    handleInputChange(
      handleChange,
      `incomeSources.${i}.annual_income`,
      sanitizedValue.toString()
    );
  };

  const handleMonthlyIncomeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    i: number
  ) => {
    setLastUpdatedField({ index: i, field: 'monthly' });
    const event = sanitizeInput(e.target.value);
    const input: any = event.replace(/,/g, '') || 0;
    const annualIncome = (12 * input).toFixed(2);
    setFieldValue(`incomeSources.${i}.annual_income`, annualIncome);
    setFieldValue(`boolean`, true);

    setTotalAnnualIncome((prevTotal) => {
      calculateEffectiveIncome(
        prevTotal - 12 * values.incomeSources[i].monthly_income + 12 * input
      );
      return (
        prevTotal - 12 * values.incomeSources[i].monthly_income + 12 * input
      );
    });

    const newIncomeSources = values.incomeSources.map((elem, index) => {
      if (index === i) {
        return { ...elem, monthly_income: input.toString() };
      }
      return elem;
    });

    const monthlyIncome = newIncomeSources.reduce((acc, elem) => {
      return acc + (parseFloat(elem.monthly_income) || 0);
    }, 0);

    setTotalMonthlyIncome(monthlyIncome);

    values.incomeSources[i].rent_sq_ft = (
      (12 * input) /
      parseFloat(values.incomeSources[i].sf_source)
    ).toString();

    const sfSourceValue = values.incomeSources[i].sf_source;
    const sfSource =
      parseFloat(
        typeof sfSourceValue === 'string'
          ? sfSourceValue.replace(/,/g, '')
          : String(sfSourceValue)
      ) || 0;

    const bed = parseFloat(values.incomeSources[i].rent_bed) || 0;
    const Unit = parseFloat(values.incomeSources[i].unit) || 0;
    let total;

    if (values.comparison_basis === 'Bed') {
      total = bed;
    } else if (values.comparison_basis === 'Unit') {
      total = Unit;
    } else {
      total = sfSource;
    }
    const annualSource: any = (12 * input).toFixed(2) || 0;
    const rentSqFt = annualSource / total;
    const data = Math.floor(rentSqFt * 100) / 100;
    setFieldValue(
      `incomeSources.${i}.rent_sq_ft`,
      data === Infinity ? '0.00' : data
    );

    const sanitizedValue = sanitizeAndLimitInput(event);

    handleInputChange(
      handleChange,
      `incomeSources.${i}.monthly_income`,
      sanitizedValue.toString()
    );
  };

  useEffect(() => {
    if (values.comparison_basis === 'Unit') {
      setTitle('UNITS');
    }
    if (values.comparison_basis === 'Bed') {
      setTitle('BEDS');
    } else {
      setTitle('SQ.FT.');
    }
    if (!bool) {
      if (values.incomeSources?.length) {
        const totalSquareFootage = values.incomeSources.reduce(
          (total, ele: any) => {
            return total + (parseFloat(ele.sf_source) || 0);
          },
          0
        );

        setTotalSf(totalSquareFootage);
        if (ID === undefined) {
          const totalBed: any = values.incomeSources.reduce((acc, elem) => {
            return acc + (parseFloat(elem.rent_bed) || 0);
          }, 0);
          setFieldValue(IncomeApproachEnum.TOTAL_BED, totalBed);

          const totalUnit: any = values.incomeSources.reduce((acc, elem) => {
            return acc + (parseFloat(elem.unit) || 0);
          }, 0);
          setFieldValue(IncomeApproachEnum.TOTAL_UNIT, totalUnit);
        }
      }
    }

    if (values.incomeSources?.length) {
      const totalMonthlyIncome = values.incomeSources.reduce(
        (total, ele: any) => {
          return total + (parseFloat(ele.monthly_income) || 0);
        },
        0
      );
      setFieldValue(`total_monthly_income`, totalMonthlyIncome);

      const totalAnnualIncome = values.incomeSources.reduce(
        (total, ele: any) => {
          return total + (parseFloat(ele.annual_income) || 0);
        },
        0
      );
      setFieldValue(`total_annual_income`, totalAnnualIncome);

      let divide: any;

      if (
        values.comparison_basis === 'Bed' &&
        localStorage.getItem('activeType') === 'building_with_land'
      ) {
        divide = totalAnnualIncome / values.total_bed;
      } else if (
        values.comparison_basis === 'Unit' &&
        localStorage.getItem('activeType') === 'building_with_land'
      ) {
        divide = totalAnnualIncome / values.total_unit;
      } else {
        divide = totalAnnualIncome / values.total_sq_ft;
      }
      setFieldValue(`total_rent_sq_ft`, divide);

      const vaccancy_change: any = values.vacancy;
      const total = (vaccancy_change * totalAnnualIncome) / 100;
      setFieldValue(`vacant_amount`, total);
      const effectiveIncome =
        (totalAnnualIncome * (100 - values.vacancy)) / 100;
      console.log('adjusted_gross_amount', values.vacancy);
      setFieldValue(`adjusted_gross_amount`, effectiveIncome);
    }
  }, [values.incomeSources]);

  function formatNumber(value: number | string): string {
    // Convert the value to a string and ensure it's trimmed
    const stringValue = value.toString().trim();

    // Split the integer and decimal parts
    const [integerPart, decimalPart] = stringValue.split('.');

    // Format the integer part with commas
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // If there's no decimal part, append '.00'
    if (!decimalPart) {
      return `${formattedInteger}.00`;
    }

    // If there's a decimal part, ensure it has exactly two digits
    const fixedDecimal =
      decimalPart.length === 1 ? `${decimalPart}0` : decimalPart;

    return `${formattedInteger}.${fixedDecimal}`;
  }

  useEffect(() => {
    if (values.vacancy === '') {
      setFieldValue('vacancy', 0);
    }

    setFieldValue(`total_sq_ft`, values.total_sq_ft || totalSF);
    // if (vaccancy) {
    //   setFieldValue(`total_monthly_income`, totalMonthlyIncome);
    //   setFieldValue(`total_annual_income`, totalAnnualIncome);
    // }
    setFieldValue(`boolean`, true);
    const vaccancy_change: any = values.vacancy;
    const total = (vaccancy_change * values.total_annual_income) / 100;
    setFieldValue(`vacant_amount`, total);

    const effectiveInc: any =
      (values.total_annual_income * (100 - values.vacancy)) / 100;
    setFieldValue(`adjusted_gross_amount`, effectiveInc);
  }, [totalSF, values.vacancy]);

  // const formatNumberWithCommas = (num: any) => {
  //   console.log(num,'num2345')
  //   const strNum = num.toString();
  //   return strNum.replace(/\B(?=(\d{4})+(?!\d))/g, ',');
  // };
  const formatNumberWithCommas = (num: any) => {
    if (isNaN(num) || num === '' || num === null) return '';
    const number = parseFloat(num);
    return number.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const addIncomeSource = (arrayHelpers: any) => {
    arrayHelpers.insert(values.incomeSources.length, {
      space: '',
      monthly_income: '',
      annual_income: '',
      rent_sq_ft: '',
      sf_source: '',
      comments: '',
      link_overview: 0,
      id: null,
    });
    setNewItems((prev) => [...prev, values.incomeSources.length]);
  };
  const getLabelFromValue = (value: any) => {
    if (!value || value === '--Select a Subtype--') {
      return '';
    }

    const allOptions = [...retailOptions];

    // Check if value matches any of the options
    const option = allOptions.find((option) => option.value === value);
    if (option) {
      return option.label; // Return matched label if found
    }

    // If no match, return the value as is without capitalizing
    return value;
  };
  useEffect(() => {
    const total = values.incomeSources?.reduce(
      (sum: number, source: { annual_income: string | number }) =>
        sum + (parseFloat(source.annual_income as string) || 0),
      0
    );
    setTotalAnnualIncomess(total);
  }, [values.incomeSources]);

  return (
    <>
      <Typography
        variant="h6"
        component="p"
        className="text-xs font-bold montserrat-font-family mt-0.5"
      >
        INCOME
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
            name="incomeSources"
            render={(arrayHelpers) => (
              <>
                {values.incomeSources && values.incomeSources.length > 0
                  ? values.incomeSources.map((zone: any, i: number) => {
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
                              name={`incomeSources.${i}.space`}
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
                                  `incomeSources.${i}.space`,
                                  input
                                );
                              }}
                              value={getLabelFromValue(
                                values.incomeSources[i].space
                              )}
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
                                  MONTHLY INCOME
                                </span>
                              }
                              name={`incomeSources.${i}.monthly_income`}
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
                                values.incomeSources[i].monthly_income || '0'
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
                                  ANNUAL INCOME
                                </span>
                              }
                              name={`incomeSources.${i}.annual_income`}
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
                                values.incomeSources[i].annual_income || '0'
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
                            <div className="information-content">
                              <Tooltip
                                title={
                                  !values.incomeSources[i].sf_source
                                    ? `In order to edit this field, you must first input the ${title}`
                                    : ''
                                }
                                placement="bottom-start"
                                // open={
                                //   values.comparison_basis === 'Unit'
                                //     ? !values.incomeSources[i].unit ||
                                //       focusedField === i
                                //     : values.comparison_basis === 'Bed'
                                //       ? !values.incomeSources[i].rent_bed ||
                                //         (!values.incomeSources[i].sf_source &&
                                //           focusedField === i)
                                //       : !values.incomeSources[i].sf_source &&
                                //         focusedField === i
                                // }
                              >
                                <div
                                // onMouseEnter={() => setFocusedField(i)}
                                // onMouseLeave={() => setFocusedField(null)}
                                >
                                  <StyledField
                                    label={
                                      <span className="font-bold text-black text-[11px]">
                                        {values.comparison_basis ===
                                          IncomeApproachEnum.UNIT &&
                                        localStorage.getItem('activeType') ===
                                          'building_with_land'
                                          ? 'RENT/UNIT/YR'
                                          : values.comparison_basis ===
                                                IncomeApproachEnum.BED &&
                                              localStorage.getItem(
                                                'activeType'
                                              ) === 'building_with_land'
                                            ? 'RENT/BED/YR'
                                            : analysis_type === '$/Acre'
                                              ? 'RENT/AC/YR'
                                              : 'RENT/SF/YR'}
                                      </span>
                                    }
                                    value={
                                      !isFinite(
                                        values.incomeSources[i].rent_sq_ft
                                      )
                                        ? ''
                                        : values.incomeSources[i].rent_sq_ft ===
                                            0
                                          ? '0.00'
                                          : formatNumberWithCommas(
                                              (() => {
                                                const income = Number(
                                                  values?.incomeSources[i]
                                                    ?.annual_income || 0
                                                );

                                                if (
                                                  values.comparison_basis ===
                                                    'Unit' &&
                                                  localStorage.getItem(
                                                    'activeType'
                                                  ) === 'building_with_land'
                                                ) {
                                                  const unit = Number(
                                                    values?.incomeSources[i]
                                                      ?.unit || 0
                                                  );
                                                  return unit
                                                    ? income / unit
                                                    : 0;
                                                }

                                                if (
                                                  values.comparison_basis ===
                                                    'Bed' &&
                                                  localStorage.getItem(
                                                    'activeType'
                                                  ) === 'building_with_land'
                                                ) {
                                                  const bed = Number(
                                                    values?.incomeSources[i]
                                                      ?.rent_bed || 0
                                                  );
                                                  return bed ? income / bed : 0;
                                                }

                                                const sf =
                                                  typeof values?.incomeSources[
                                                    i
                                                  ]?.sf_source === 'string'
                                                    ? Number(
                                                        values?.incomeSources[
                                                          i
                                                        ]?.sf_source.replace(
                                                          /,/g,
                                                          ''
                                                        )
                                                      )
                                                    : Number(
                                                        values?.incomeSources[i]
                                                          ?.sf_source || 0
                                                      );

                                                return sf ? income / sf : 0;
                                              })()
                                            )
                                    }
                                    name={`incomeSources.${i}.rent_sq_ft`}
                                    onFocus={(e) => {
                                      if (e.target.value === '0.00') {
                                        handleInputChange(
                                          handleChange,
                                          `incomeSources.${i}.rent_sq_ft`,
                                          ''
                                        );
                                      }
                                    }}
                                    style={{
                                      background:
                                        lastUpdatedField.index === null ||
                                        (lastUpdatedField.index === i &&
                                          lastUpdatedField.field === 'rent')
                                          ? '#fff'
                                          : '#f5f5f5',
                                      borderBottomWidth: '1px',
                                    }}
                                    onChange={(e) => handleRentSqFtChange(e, i)}
                                    type="text"
                                    className="relative bg-[#f5f5f5] focus:border-blue-500 focus:outline-none w-full border-[#0000003b] border-t-0 border-r-0 border-l-0 !py-0 !min-h-[26px] !px-0"
                                    disabled={
                                      values.comparison_basis === 'Unit'
                                        ? !values.incomeSources[i].unit
                                        : values.comparison_basis === 'Bed'
                                          ? !values.incomeSources[i].rent_bed
                                          : !values.incomeSources[i].sf_source
                                    }
                                  />
                                </div>
                              </Tooltip>
                            </div>
                          </Grid>

                          {values.comparison_basis == IncomeApproachEnum.UNIT &&
                            localStorage.getItem('activeType') ===
                              'building_with_land' && (
                              <Grid
                                item
                                xs={1}
                                xl={1}
                                className="pt-[5px] pl-[24px]"
                              >
                                <StyledField
                                  label={
                                    <span className="font-bold text-black text-[11px]">
                                      UNITS
                                    </span>
                                  }
                                  name={`incomeSources.${i}.unit`}
                                  style={{
                                    background:
                                      values.incomeSources[i].id !== null
                                        ? '#f5f5f5'
                                        : '#ffffff',
                                    borderBottomWidth: '1px',
                                  }}
                                  onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                  ) => {
                                    const AnnualIncome =
                                      values.incomeSources[i].annual_income;
                                    const input: any =
                                      parseFloat(e.target.value) || 0;
                                    const divide = AnnualIncome / input;
                                    setFieldValue(
                                      `incomeSources.${i}.rent_sq_ft`,
                                      divide.toFixed(2)
                                    );

                                    const eventValue = sanitizeSf(
                                      e.target.value
                                    );
                                    handleInputChange(
                                      handleChange,
                                      `incomeSources.${i}.unit`,
                                      eventValue
                                    );
                                  }}
                                  value={
                                    values.incomeSources[i].unit !== null &&
                                    values.incomeSources[i].unit !== undefined
                                      ? values.incomeSources[
                                          i
                                        ].unit.toLocaleString(undefined, {
                                          maximumFractionDigits: 0,
                                        })
                                      : values.incomeSources[i].unit === 0
                                        ? '0'
                                        : ''
                                  }
                                  type="text"
                                  disabled={values.incomeSources[i].id !== null}
                                />
                              </Grid>
                            )}
                          {values.comparison_basis === IncomeApproachEnum.BED &&
                            localStorage.getItem('activeType') ===
                              'building_with_land' && (
                              <Grid
                                item
                                xs={1}
                                xl={1}
                                className="pt-[5px] pl-[24px]"
                              >
                                <StyledField
                                  label={
                                    <span className="font-bold text-black text-[11px]">
                                      BEDS
                                    </span>
                                  }
                                  name={`incomeSources.${i}.rent_bed`}
                                  style={{
                                    background:
                                      values.incomeSources[i].id !== null
                                        ? '#f5f5f5'
                                        : '#ffffff',
                                    borderBottomWidth: '1px',
                                  }}
                                  onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                  ) => {
                                    const input: any =
                                      parseFloat(e.target.value) || 0;
                                    const annualIncome =
                                      parseFloat(
                                        values.incomeSources[i].annual_income
                                      ) || 0;
                                    setFieldValue(
                                      `incomeSources.${i}.rent_sq_ft`,
                                      annualIncome / input.toString()
                                    );

                                    const eventValue = sanitizeSf(
                                      e.target.value
                                    );
                                    handleInputChange(
                                      handleChange,
                                      `incomeSources.${i}.rent_bed`,
                                      eventValue
                                    );
                                  }}
                                  value={
                                    values.incomeSources[i].rent_bed !== null &&
                                    values.incomeSources[i].rent_bed !==
                                      undefined
                                      ? values.incomeSources[
                                          i
                                        ].rent_bed.toLocaleString(undefined, {
                                          maximumFractionDigits: 0,
                                        })
                                      : values.incomeSources[i].rent_bed === 0
                                        ? '0'
                                        : ''
                                  }
                                  type="text"
                                  disabled={values.incomeSources[i].id !== null}
                                />
                              </Grid>
                            )}

                          <Grid
                            item
                            xs={2}
                            xl={
                              localStorage.getItem('activeType') ===
                                'building_with_land' &&
                              (values.comparison_basis ===
                                IncomeApproachEnum.BED ||
                                values.comparison_basis ===
                                  IncomeApproachEnum.UNIT)
                                ? 1
                                : 2
                            }
                            className="pt-[5px] pl-[24px]"
                          >
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
                              name={`incomeSources.${i}.sf_source`}
                              style={{
                                background: values.incomeSources[i].sf_source
                                  ? '#f5f5f5'
                                  : '#ffffff',
                                borderBottomWidth: '1px',
                              }}
                              onBlur={(e: any) => {
                                const input: number =
                                  parseInt(e.target.value.replace(/,/g, '')) ||
                                  0;
                                const annualIncome =
                                  parseFloat(
                                    values.incomeSources[i].annual_income
                                  ) || 0;
                                if (values.comparison_basis === 'SF') {
                                  setFieldValue(
                                    `incomeSources.${i}.rent_sq_ft`,
                                    annualIncome / input
                                  );
                                }
                              }}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ) => {
                                const eventValue = sanitizeSf(e.target.value);
                                handleInputChange(
                                  handleChange,
                                  `incomeSources.${i}.sf_source`,
                                  eventValue
                                );
                              }}
                              value={
                                values.incomeSources[i].sf_source !== null &&
                                values.incomeSources[i].sf_source !== undefined
                                  ? values.incomeSources[
                                      i
                                    ].sf_source.toLocaleString(undefined, {
                                      minimumFractionDigits:
                                        analysis_type === '$/Acre' ? 3 : 0,
                                      maximumFractionDigits:
                                        analysis_type === '$/Acre' ? 3 : 0,
                                    })
                                  : values.incomeSources[i].sf_source === 0
                                    ? '0'
                                    : ''
                              }
                              type="text"
                              disabled={values.incomeSources[i].id !== null}
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
                                  COMMENTS
                                </span>
                              }
                              name={`incomeSources.${i}.comments`}
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
                                  `incomeSources.${i}.comments`,
                                  input
                                );
                              }}
                              value={values.incomeSources[i].comments}
                              type="text"
                            />
                          </Grid>

                          {newItems.includes(i) ||
                          (values.incomeSources[i].link_overview != undefined &&
                            !values.incomeSources[i].link_overview) ? (
                            <Grid item xs={1} xl={1}>
                              <div
                                className="pt-4 flex items-center min-h-[47px]"
                                // onClick={() => {
                                //   arrayHelpers.remove(i);
                                //   setNewItems((prev) =>
                                //     prev.filter((item) => item !== i)
                                //   );
                                // }}
                              >
                                <Icons.RemoveCircleOutlineIcon
                                  className="text-red-500 cursor-pointer"
                                  onClick={() => {
                                    arrayHelpers.remove(i);
                                    setNewItems((prev) =>
                                      prev.filter((item) => item !== i)
                                    );
                                  }}
                                />
                              </div>
                            </Grid>
                          ) : null}
                        </>
                      );
                    })
                  : null}

                {values.incomeSources.length < 7 && (
                  <Grid item xs={2}>
                    <div>
                      <div className="information-content">
                        <Tooltip
                          title="Add a new Source for 'CAM','Laundary',etc.Square footage will not be added to the total"
                          placement="bottom-start"
                        >
                          <div
                            className="flex text-[#0da1c7] mt-3 w-[161px] cursor-pointer"
                            onClick={() => {
                              setBool(true);
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
                        </Tooltip>
                      </div>
                    </div>
                  </Grid>
                )}
              </>
            )}
          />
        </Grid>

        <Grid container spacing={2} columns={13} className="mt-1 px-2 w-full">
          <Grid item xs={2} xl={2} className="pt-[5px] pl-[24px]">
            <div className="font-bold text-[11px]">TOTALS & AVERAGES</div>
          </Grid>
          <Grid item xs={2} xl={2} className="pt-[5px] pl-[24px]">
            <div className="font-bold text-[11px]">
              ${formatCurrency(values.total_monthly_income as any)}
            </div>
            <div className="text-xs text-greyApproch">Total</div>
          </Grid>
          <Grid item xs={2} xl={2} className="pt-[5px] pl-[24px]">
            <div className="font-bold text-[11px]">
              ${formatCurrency(totalAnnualIncomess)}
            </div>
            <div className="text-xs text-greyApproch">Total Annual Income</div>
          </Grid>

          <Grid item xs={2} xl={2} className="pt-[5px] pl-[24px]">
            {values?.comparison_basis?.trim()?.toLowerCase() === 'sf' && (
              <div className="font-bold text-[11px]">
                {isNaN(values.total_rent_sq_ft as any) ||
                values.total_rent_sq_ft === 0
                  ? '$0.00'
                  : '$' + formatCurrency(values.total_rent_sq_ft as any)}
                {analysis_type === '$/Acre' ? '/AC/YR' : '/SF/YR'}
              </div>
            )}
            {values.comparison_basis === 'Unit' &&
              localStorage.getItem('activeType') === 'building_with_land' && (
                <div className="font-bold text-[11px]">
                  $
                  {isNaN(values.total_rent_sq_ft as any)
                    ? '0.00'
                    : formatCurrency(values.total_rent_sq_ft as any)}
                  /UNIT/YR
                </div>
              )}
            {values.comparison_basis === 'Bed' &&
              localStorage.getItem('activeType') === 'building_with_land' && (
                <div className="font-bold text-[11px]">
                  $
                  {isNaN(values.total_rent_sq_ft as any)
                    ? '0.00'
                    : formatCurrency(values.total_rent_sq_ft as any)}
                  /BED/YR
                </div>
              )}

            <div className="text-xs text-greyApproch">Average</div>
          </Grid>

          {values.comparison_basis == 'Unit' &&
            localStorage.getItem('activeType') === 'building_with_land' && (
              <Grid item xs={2} xl={1} className="pt-[5px] pl-[24px]">
                <div className="font-bold text-[11px]">
                  {values.total_unit} UNIT
                </div>
                <div className="text-xs text-greyApproch">Total</div>
              </Grid>
            )}

          {values.comparison_basis === 'Bed' &&
            localStorage.getItem('activeType') === 'building_with_land' && (
              <Grid item xs={1} xl={1} className="pt-[5px] pl-[24px]">
                <div className="font-bold text-[11px]">
                  {values.total_bed} BED
                </div>
                <div className="text-xs text-greyApproch">Total</div>
              </Grid>
            )}

          <Grid
            item
            lg={1}
            xs={values.comparison_basis === 'SF' ? 1 : 1}
            className="pt-[5px] pl-[24px]"
          >
            <div className="font-bold text-[11px]">
              {Number(values.total_sq_ft)?.toLocaleString(undefined, {
                minimumFractionDigits: analysis_type === '$/Acre' ? 3 : 0,
                maximumFractionDigits: analysis_type === '$/Acre' ? 3 : 0,
              })}{' '}
              {analysis_type === '$/Acre' ? 'AC' : 'SF'}
            </div>

            <div className="text-xs text-greyApproch">Total</div>
          </Grid>

          <Grid item xs={2} className="pl-[24px]"></Grid>
        </Grid>

        <Grid container spacing={2} columns={13} className="mt-1 px-2 w-full">
          <Grid item xs={2} className="pt-2 pb-[0px] pl-[24px] pr-[0px]">
            <div className="font-bold text-[11px]">INCOME NOTES</div>
          </Grid>
          <Grid item xs={14} className="pt-[16px] pb-[0px] pl-[24px] pr-[0px]">
            {/* <TextAreaField
              label=""
              name="income_notes"
              value={values.income_notes}
              style={{
                background: '#fff',values.incomeSources[i].sf_source !== null &&
                                values.incomeSources[i].sf_source !== undefined
                                  ? values.incomeSources[
                                      i
                                    ].sf_source.toLocaleString(undefined, {
                                      maximumFractionDigits: 2,
                                    })
                                  : values.incomeSources[i].sf_source === 0
                                    ? '0'
                                    : ''
                borderBottomWidth: '1px',
              }}
            /> */}

            <TextEditor
              editorContent={values.income_notes} // Sync with Formik field
              editorData={(content) => setFieldValue('income_notes', content)} // Update Formik state
              style={{
                background: '#fff',
                borderBottomWidth: '1px',
                width: '100%', // Adjust width if necessary
                height: '110px',
              }}
            />
          </Grid>
          {/* TOTALS & AVERAGES */}
          {/* <Grid item xs={5}></Grid> */}
        </Grid>
      </div>

      <div
        style={{
          width: '100%',
          border: '1px solid #eee',
          backgroundColor: '#f5f5f5',
          marginTop: '10px',
          paddingBottom: '13px',
        }}
      >
        <Grid container spacing={2} columns={13} className="mt-1 px-2 w-full">
          <Grid item xs={2} className="pt-[10px] pl-[24px]">
            <div className="font-bold text-xs">VACANCY</div>
          </Grid>

          <Grid item xs={2} className="pt-1 pl-[24px]">
            <Field
              name="vacancy"
              type="text"
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                handleVacancyKeyDown(e, handleChange, values)
              }
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleVacancyChange(
                  e,
                  handleChange,
                  totalAnnualIncome,
                  handleInputChange,
                  setVaccancy
                )
              }
              value={
                values.vacancy ? sanitizeInputPercentage(values.vacancy) : ''
              }
              className="py-0.5 px-3 w-full"
            />
          </Grid>
          <Grid item xs={2} className="pt-2.5 pl-[24px]">
            <div className="font-bold text-[11px]">
              $ (
              {values?.vacant_amount != null
                ? values.vacant_amount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : '0.00'}
              )
            </div>
          </Grid>

          <Grid item xs={14} className=" pl-[24px]"></Grid>
          <Grid item xs={2} className=" pl-[24px]">
            <div className="mt-3 font-bold text-xs">EFFECTIVE INCOME</div>
          </Grid>
          <Grid item xs={2} className="pt-[16px] pl-[24px]"></Grid>
          <Grid item xs={2} className="pt-[17px] pl-[24px]">
            <div className="font-bold text-[11px]">
              ${' '}
              {(
                (totalAnnualIncomess || 0) - (Number(values.vacant_amount) || 0)
              )?.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) || '0.00'}
            </div>
          </Grid>
          <Grid item xs={8} className="pl-[24px]"></Grid>
        </Grid>
      </div>
    </>
  );
};
