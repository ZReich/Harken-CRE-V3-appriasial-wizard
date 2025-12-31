import { Box, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import StyledField from '@/components/styles/StyleFieldEditComp';
import React, { useEffect, useState } from 'react';
import { handleInputChange } from '@/utils/sanitize';
import { FieldArray, useFormikContext, Field } from 'formik';
import { IncomeApprochType } from '@/components/interface/Income-approch-type';
import { Icons } from '@/components/icons';
import { sanitizeInputPercentage } from '@/utils/sanitize';
import { sanitizeInput, sanitizeInputRent } from '@/utils/appraisalSanitize';
import { IncomeApproachEnum } from '../Enum/AppraisalEnum';
import { handleVacancyKeyDown } from '@/utils/income-approch/sanitize-keypress';
import { handleVacancyChange } from '@/utils/income-approch/handle-change';
import Tooltip from '@mui/material/Tooltip';
import { landTypeOptionsComps } from '@/pages/comps/Listing/Comps-table-header';
import {
  sanitizeAndLimitInput,
  sanitizeAndLimitInputAnnualIncome,
} from '@/utils/income-approch/calculation';
import { sanitizeSf } from '@/utils/appraisalSanitize';
import { retailOptions } from '@/pages/comps/create-comp/SelectOption';
import TextEditor from '@/components/styles/text-editor';
import { OtherIncome } from './other-income';

export const Income = ({
  analysis_type,
  ID,
  totalAnnualIncomess,
  setTotalAnnualIncomess,
  navigationLoader,
  zonings,
  compType,
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

  const [manualRentFields, setManualRentFields] = useState<Set<number>>(
    new Set()
  );

  const [displaySqFt, setDisplaySqFt] = useState(0);
  console.log('check the value', values, displaySqFt);

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

  const calculateEffectiveIncome = (value: any, otherIncomeValue: any = 0) => {
    const totalIncome = value + otherIncomeValue;
    const effc: any = (totalIncome * (100 - values.vacancy)) / 100;
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

    // Mark as manually entered only if there's a meaningful value
    const isManual = rawValue !== '' && rawValue !== '0' && rawValue !== '0.00';
    setFieldValue(`incomeSources.${i}.is_rent_manual`, isManual);
    if (isManual) {
      setManualRentFields((prev) => new Set(prev).add(i));
    } else {
      setManualRentFields((prev) => {
        const newSet = new Set(prev);
        newSet.delete(i);
        return newSet;
      });
    }

    let sfSource: number;

    if (values.comparison_basis === 'Unit') {
      const unitValue = values.incomeSources[i].unit;
      sfSource =
        parseFloat(
          typeof unitValue === 'string'
            ? unitValue.replace(/,/g, '')
            : String(unitValue)
        ) || 0;
    } else if (values.comparison_basis === 'Bed') {
      const bedValue = values.incomeSources[i].rent_bed;
      sfSource =
        parseFloat(
          typeof bedValue === 'string'
            ? bedValue.replace(/,/g, '')
            : String(bedValue)
        ) || 0;
    } else {
      const sfSourceValue = values.incomeSources[i].sf_source;
      sfSource =
        parseFloat(
          typeof sfSourceValue === 'string'
            ? sfSourceValue.replace(/,/g, '')
            : String(sfSourceValue)
        ) || 0;
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

    setTotalAnnualIncome(calculateTotalAnnualIncome(values.incomeSources));
    calculateEffectiveIncome(calculateTotalAnnualIncome(values.incomeSources));
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

    setTotalAnnualIncome(calculateTotalAnnualIncome(values.incomeSources));
    setTotalMonthlyIncome(calculateTotalMonthlyIncome(values.incomeSources));
    calculateEffectiveIncome(calculateTotalAnnualIncome(values.incomeSources));
    const sfSourceValue = values.incomeSources[i].sf_source;
    const sfSource =
      parseFloat(
        typeof sfSourceValue === 'string'
          ? sfSourceValue.replace(/,/g, '')
          : String(sfSourceValue)
      ) || 0;
    const bedValue = values.incomeSources[i].rent_bed;
    const bedSource =
      parseFloat(
        typeof bedValue === 'string'
          ? bedValue.replace(/,/g, '')
          : String(bedValue)
      ) || 0;
    const unitValue = values.incomeSources[i].unit;
    const unitSource =
      parseFloat(
        typeof unitValue === 'string'
          ? unitValue.replace(/,/g, '')
          : String(unitValue)
      ) || 0;

    let rentSqFt;

    if (values.comparison_basis === 'Bed') {
      rentSqFt = input / bedSource;
    } else if (values.comparison_basis === 'Unit') {
      rentSqFt = input / unitSource;
    } else {
      rentSqFt = input / sfSource;
    }

    // Auto-calculate rent rate when income changes
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
    // Auto-calculate rent rate when income changes
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

  // Main calculation effect - runs when income sources change
  useEffect(() => {
    if (values.comparison_basis === 'Unit') {
      setTitle('UNITS');
    } else if (values.comparison_basis === 'Bed') {
      setTitle('BEDS');
    } else {
      setTitle('SQ.FT.');
    }

    if (!bool && values.incomeSources?.length) {
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
      setTotalAnnualIncomess(totalAnnualIncome); // Update parent state

      let divide: any = 0;
      if (values.comparison_basis === 'Bed' && values.total_bed > 0) {
        divide = totalAnnualIncome / values.total_bed;
      } else if (values.comparison_basis === 'Unit' && values.total_unit > 0) {
        divide = totalAnnualIncome / values.total_unit;
      } else if (values.total_sq_ft > 0) {
        divide = totalAnnualIncome / values.total_sq_ft;
      }
      setFieldValue(`total_rent_sq_ft`, divide);

      // Calculate vacancy amount and adjusted gross
      const vaccancy_change: any = values.vacancy || 0;
      const vacantAmount = (vaccancy_change * totalAnnualIncome) / 100;
      setFieldValue(`vacant_amount`, vacantAmount);

      const effectiveIncome =
        (totalAnnualIncome * (100 - vaccancy_change)) / 100;
      setFieldValue(`adjusted_gross_amount`, effectiveIncome);
    }
  }, [
    values.incomeSources,
    values.comparison_basis,
    values.total_bed,
    values.total_unit,
    values.total_sq_ft,
    values.vacancy,
    ID,
    bool,
    setTotalAnnualIncomess,
  ]);

  // function formatInputValue(value: any): string {
  //   if (value === '--Select a Subtype--') {
  //     return '';
  //   }

  //   return value
  //     .split('_')
  //     .map(
  //       (word: string) =>
  //         word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  //     )
  //     .join(' ');
  // }

  function formatNumber(value: number | string): string {
    // Handle empty, null, undefined, or '0' values
    if (!value || value === '' || value === '0' || value === 0) {
      return '';
    }

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

  // Handle vacancy and total square footage updates
  useEffect(() => {
    if (values.vacancy === '') {
      setFieldValue('vacancy', 0);
    }

    // Only update total_sq_ft when not in navigation loading state
    if (!navigationLoader) {
      setFieldValue(`total_sq_ft`, values.total_sq_ft || totalSF);
    }
    setFieldValue(`boolean`, true);

    // Recalculate vacancy-related fields only if we have total annual income
    if (values.total_annual_income) {
      const vaccancy_change: any = values.vacancy || 0;
      const vacantAmount = (vaccancy_change * values.total_annual_income) / 100;
      setFieldValue(`vacant_amount`, vacantAmount);

      const effectiveInc: any =
        (values.total_annual_income * (100 - vaccancy_change)) / 100;
      setFieldValue(`adjusted_gross_amount`, effectiveInc);
    }
  }, [
    totalSF,
    values.vacancy,
    values.total_annual_income,
    values.total_sq_ft,
    navigationLoader,
  ]);

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
    const newIndex = values.incomeSources.length;
    arrayHelpers.push({
      type: '',
      monthly_income: '',
      annual_income: '',
      rent_sq_ft: '',
      sf_source: '',
      comments: '',
      link_overview: 0,
      id: null,
      is_rent_manual: false,
    });
    setNewItems((prev) => [...prev, newIndex]);
  };

  const getLabelFromValue = (value: any) => {
    if (!value || value === '--Select a Subtype--') {
      return '';
    }

    const allOptions = [...retailOptions, ...landTypeOptionsComps];

    // Check if value matches any of the options (case insensitive)
    const option = allOptions.find(
      (option) => option.value.toLowerCase() === value.toLowerCase()
    );
    if (option) {
      return option.label; // Return matched label if found
    }

    // If no match, capitalize first letter of each word
    return value
      .split(' ')
      .map(
        (word: string) =>
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join(' ');
  };
  useEffect(() => {
    const total = values.incomeSources?.reduce(
      (sum: number, source: { annual_income: string | number }) =>
        sum + (parseFloat(source.annual_income as string) || 0),
      0
    );
    setTotalAnnualIncomess(total);

    // Update display value only when we have valid data
    if (values.total_sq_ft > 0) {
      setDisplaySqFt(values.total_sq_ft);
    }
  }, [values.incomeSources, values.total_sq_ft]);
  return (
    <>
      <Typography
        variant="h6"
        component="p"
        className="text-xs font-bold montserrat-font-family mt-0.5 px-2"
      >
        INCOME
      </Typography>

      <div
        className="rounded"
        style={{
          width: '100%',
          backgroundColor: '#f5f5f5',
          marginTop: '10px',
          paddingBottom: '20px',
        }}
      >
        <Grid
          container
          spacing={2}
          columns={13}
          className="mt-[10px] px-2 mx-0 w-full"
        >
          <FieldArray
            name="incomeSources"
            render={(arrayHelpers) => {
              return (
                <>
                  {(() => {
                    // If no income sources, don't show anything
                    if (
                      !values.incomeSources ||
                      values.incomeSources.length === 0
                    ) {
                      return false;
                    }

                    // For land_only type, check if zonings array is empty but allow newly added items or saved data
                    if (
                      compType === 'land_only' &&
                      (!zonings || zonings.length === 0)
                    ) {
                      // Show rows if we have newly added items OR if we have saved income sources with extra_id OR land-only data
                      const hasSavedData = values.incomeSources.some(
                        (source: any) => source.extra_id !== null
                      );
                      const hasLandOnlyData = values.incomeSources.some(
                        (source: any) => source.comments === 'Land Only'
                      );
                      return (
                        newItems.length > 0 || hasSavedData || hasLandOnlyData
                      );
                    }

                    // Check if we have any sources with actual data (not empty default row)
                    const hasValidSources = values.incomeSources.some(
                      (source: any) =>
                        source.type !== '' ||
                        source.monthly_income !== '' ||
                        source.annual_income !== '' ||
                        source.id !== null ||
                        source.extra_id !== null ||
                        source.comments !== ''
                    );

                    // Check if we have newly added items
                    const hasNewItems = newItems.length > 0;

                    return hasValidSources || hasNewItems;
                  })()
                    ? values.incomeSources.map((zone: any, i: number) => {
                        return (
                          <>
                            <Grid
                              item
                              xs={2}
                              xl={2}
                              key={zone.zone}
                              className="pl-0 pt-[5px]"
                            >
                              <StyledField
                                label={
                                  <span className="font-bold text-black text-[11px]">
                                    TYPE{' '}
                                  </span>
                                }
                                name={`incomeSources.${i}.type`}
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
                                    `incomeSources.${i}.type`,
                                    input
                                  );
                                }}
                                value={getLabelFromValue(
                                  values.incomeSources[i].type
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
                                onChange={(e) =>
                                  handleMonthlyIncomeChange(e, i)
                                }
                                value={formatNumber(
                                  values.incomeSources[i].monthly_income
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
                                  values.incomeSources[i].annual_income
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
                                          IncomeApproachEnum.UNIT
                                            ? 'RENT/UNIT/YR'
                                            : values.comparison_basis ===
                                                IncomeApproachEnum.BED
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
                                          : values.incomeSources[i]
                                                .rent_sq_ft == 0
                                            ? '0.00'
                                            : formatNumberWithCommas(
                                                values.incomeSources[i]
                                                  .rent_sq_ft
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
                                          // Reset manual flag when field is cleared
                                          setFieldValue(
                                            `incomeSources.${i}.is_rent_manual`,
                                            false
                                          );
                                          setManualRentFields((prev) => {
                                            const newSet = new Set(prev);
                                            newSet.delete(i);
                                            return newSet;
                                          });
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
                                      onChange={(e) =>
                                        handleRentSqFtChange(e, i)
                                      }
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

                            {values.comparison_basis ==
                              IncomeApproachEnum.UNIT && (
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
                                      parseFloat(
                                        typeof values.incomeSources[i]
                                          .annual_income === 'string'
                                          ? values.incomeSources[
                                              i
                                            ].annual_income.replace(/,/g, '')
                                          : String(
                                              values.incomeSources[i]
                                                .annual_income
                                            )
                                      ) || 0;
                                    const input =
                                      parseFloat(
                                        e.target.value.replace(/,/g, '')
                                      ) || 0;
                                    const isManual =
                                      manualRentFields.has(i) ||
                                      values.incomeSources[i].is_rent_manual;
                                    if (!isManual) {
                                      const divide = AnnualIncome / input;
                                      setFieldValue(
                                        `incomeSources.${i}.rent_sq_ft`,
                                        divide.toFixed(2)
                                      );
                                    }

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
                                  disabled={
                                    !!(values.incomeSources[i] as any)
                                      .link_overview ||
                                    (
                                      !!values.incomeSources &&
                                      (values.incomeSources[i] as any)
                                    ).id
                                  }
                                />
                              </Grid>
                            )}
                            {values.comparison_basis ===
                              IncomeApproachEnum.BED && (
                              <Grid
                                item
                                xs={1}
                                xl={1}
                                className="pt-[5px] pl-[24px]"
                              >
                                <StyledField
                                  label={
                                    <span className="font-bold text-black text-[11px]">
                                      # OF BEDS
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
                                    const input =
                                      parseFloat(
                                        e.target.value.replace(/,/g, '')
                                      ) || 0;
                                    const annualIncome =
                                      parseFloat(
                                        typeof values.incomeSources[i]
                                          .annual_income === 'string'
                                          ? values.incomeSources[
                                              i
                                            ].annual_income.replace(/,/g, '')
                                          : String(
                                              values.incomeSources[i]
                                                .annual_income
                                            )
                                      ) || 0;
                                    const isManual =
                                      manualRentFields.has(i) ||
                                      values.incomeSources[i].is_rent_manual;
                                    if (!isManual) {
                                      setFieldValue(
                                        `incomeSources.${i}.rent_sq_ft`,
                                        (annualIncome / input).toFixed(2)
                                      );
                                    }

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
                                  disabled={
                                    !!(values.incomeSources[i] as any)
                                      .link_overview ||
                                    (
                                      !!values.incomeSources &&
                                      (values.incomeSources[i] as any)
                                    ).id
                                  }
                                />
                              </Grid>
                            )}

                            <Grid
                              item
                              xs={2}
                              xl={
                                values.comparison_basis ===
                                  IncomeApproachEnum.BED ||
                                values.comparison_basis ===
                                  IncomeApproachEnum.UNIT
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
                                    parseInt(
                                      e.target.value.replace(/,/g, '')
                                    ) || 0;
                                  const annualIncome =
                                    parseFloat(
                                      values.incomeSources[i].annual_income
                                    ) || 0;
                                  const isManual =
                                    manualRentFields.has(i) ||
                                    values.incomeSources[i].is_rent_manual;
                                  if (
                                    values.comparison_basis === 'SF' &&
                                    !isManual
                                  ) {
                                    setFieldValue(
                                      `incomeSources.${i}.rent_sq_ft`,
                                      annualIncome / input
                                    );
                                  }
                                }}
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                  let eventValue;
                                  let numericValue;

                                  if (analysis_type === '$/Acre') {
                                    // For acres, format like currency (123 -> 0.123)
                                    const sanitizedInput =
                                      e.target.value.replace(/\D/g, '');
                                    if (sanitizedInput === '') {
                                      eventValue = '';
                                      numericValue = 0;
                                    } else {
                                      numericValue =
                                        parseInt(sanitizedInput) / 1000;
                                      eventValue = numericValue.toFixed(3);
                                    }
                                  } else {
                                    // For SF, use existing logic
                                    eventValue = sanitizeSf(e.target.value);
                                    numericValue =
                                      parseInt(
                                        e.target.value.replace(/,/g, '')
                                      ) || 0;
                                  }

                                  const annualIncome =
                                    parseFloat(
                                      values.incomeSources[i].annual_income
                                    ) || 0;
                                  const isManual =
                                    manualRentFields.has(i) ||
                                    values.incomeSources[i].is_rent_manual;
                                  if (
                                    values.comparison_basis === 'SF' &&
                                    !isManual
                                  ) {
                                    setFieldValue(
                                      `incomeSources.${i}.rent_sq_ft`,
                                      annualIncome / numericValue
                                    );
                                  }

                                  handleInputChange(
                                    handleChange,
                                    `incomeSources.${i}.sf_source`,
                                    eventValue
                                  );
                                }}
                                value={
                                  values.incomeSources[i].sf_source !== null &&
                                  values.incomeSources[i].sf_source !==
                                    undefined
                                    ? values.incomeSources[
                                        i
                                      ].sf_source.toLocaleString(undefined, {
                                        minimumFractionDigits:
                                          analysis_type === '$/Acre' ? 3 : 0,
                                        maximumFractionDigits:
                                          analysis_type === '$/Acre' ? 3 : 0,
                                      })
                                    : values.incomeSources[i].sf_source === 0
                                      ? analysis_type === '$/Acre'
                                        ? '0.000'
                                        : '0'
                                      : analysis_type === '$/Acre'
                                        ? '0.000'
                                        : ''
                                }
                                type="text"
                                disabled={
                                  !!(values.incomeSources[i] as any)
                                    .link_overview ||
                                  (
                                    !!values.incomeSources &&
                                    (values.incomeSources[i] as any)
                                  ).id
                                }
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
                            (values.incomeSources[i].link_overview !=
                              undefined &&
                              !values.incomeSources[i].link_overview) ? (
                              <Grid item xs={1} xl={1}>
                                <div className="pt-4 flex items-center min-h-[47px]">
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

                  <Grid item xs={2}>
                    <div>
                      <div className="information-content">
                        <Tooltip
                          title="Add a new Source for 'CAM','Laundary',etc.Square footage will not be added to the total"
                          placement="bottom-start"
                        >
                          <div
                            className="flex text-[#0da1c7] mt-3 w-[161px] cursor-pointer -ml-4"
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
                </>
              );
            }}
          />
        </Grid>

        <Grid
          container
          spacing={2}
          columns={13}
          className="mt-1 px-2 mx-0 w-full"
        >
          <Grid item xs={2} xl={2} className="pt-[5px] pl-0">
            <div className="font-bold text-[11px]">TOTALS & AVERAGES</div>
          </Grid>
          <Grid item xs={2} xl={2} className="pt-[5px] pl-[24px]">
            <div className="font-bold text-[11px]">
              ${formatCurrency(Number(values.total_monthly_income) || 0)}
            </div>
            <div className="text-xs text-greyApproch">Total</div>
          </Grid>
          <Grid item xs={2} xl={2} className="pt-[5px] pl-[24px]">
            <div className="font-bold text-[11px]">
              ${formatCurrency(Number(values.total_annual_income) || 0)}
            </div>
            <div className="text-xs text-greyApproch">Total Annual Income</div>
          </Grid>

          <Grid item xs={2} xl={2} className="pt-[5px] pl-[24px]">
            {values.comparison_basis === 'SF' && (
              <div className="font-bold text-[11px]">
                $
                {isNaN(Number(values.total_rent_sq_ft))
                  ? '0.00'
                  : formatCurrency(Number(values.total_rent_sq_ft))}
                {analysis_type === '$/Acre' ? '/AC/YR' : '/SF/YR'}
              </div>
            )}

            {values.comparison_basis === 'Unit' && (
              <div className="font-bold text-[11px]">
                $
                {isNaN(Number(values.total_rent_sq_ft))
                  ? '0.00'
                  : formatCurrency(Number(values.total_rent_sq_ft))}
                /UNIT/YR
              </div>
            )}
            {values.comparison_basis === 'Bed' && (
              <div className="font-bold text-[11px]">
                $
                {isNaN(Number(values.total_rent_sq_ft))
                  ? '0.00'
                  : formatCurrency(Number(values.total_rent_sq_ft))}
                /BED/YR
              </div>
            )}
            <div className="text-xs text-greyApproch">Average</div>
          </Grid>

          {values.comparison_basis == 'Unit' && (
            <Grid item xs={2} xl={1} className="pt-[5px] pl-[24px]">
              <div className="font-bold text-[11px]">
                {values.total_unit || 0} UNIT
              </div>
              <div className="text-xs text-greyApproch">Total</div>
            </Grid>
          )}

          {values.comparison_basis === 'Bed' && (
            <Grid item xs={1} xl={1} className="pt-[5px] pl-[24px]">
              <div className="font-bold text-[11px]">
                {values.total_bed || 0} BED
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

        <Grid
          container
          spacing={2}
          columns={13}
          className="mt-[5px] px-2 mx-0 w-full"
        >
          <Grid item xs={2} className="pt-1 pb-[0px] pl-0 pr-[0px]">
            <div className="font-bold text-[11px]">INCOME NOTES</div>
          </Grid>
          <Grid item xs={14} className="pt-2.5 pb-[0px] pl-0 pr-[0px]">
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
          {/* <Grid item xs={5}></Grid> */}
        </Grid>
      </div>

      <div
        style={{
          marginTop: '10px',
          paddingBottom: '13px',
        }}
      >
        <Box className="bg-[#f5f5f5] py-2 px-2 mb-3 rounded">
          <Grid
            container
            spacing={2}
            columns={13}
            className="mx-0 w-full mt-0 items-center"
          >
            <Grid item xs={2} className="pl-0 flex items-center">
              <div className="font-bold text-xs">VACANCY</div>
            </Grid>

            <Grid item xs={2} className="pl-[24px] items-center">
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

            <Grid item xs={2} className="pl-[24px] items-center">
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
          </Grid>
        </Box>

        {/* OTHER INCOME BOX */}
        <Box className="p-0 mb-3 rounded">
          <OtherIncome
            analysis_type={analysis_type}
            onOtherIncomeChange={(otherIncomeTotal: any) =>
              calculateEffectiveIncome(totalAnnualIncomess, otherIncomeTotal)
            }
          />
        </Box>

        {/* EFFECTIVE INCOME BOX */}
        <Box className="bg-[#f5f5f5] px-2 py-3 rounded">
          <Grid container spacing={2} columns={13} className="px-0 m-0 w-full">
            <Grid item xs={2} className="pl-0 flex items-center">
              <div className="font-bold text-xs">EFFECTIVE INCOME</div>
            </Grid>

            <Grid item xs={2} className="pl-[24px]">
              <div className="font-bold text-[11px]">
                ${' '}
                {(
                  (totalAnnualIncomess || 0) +
                  (values.other_total_annual_income || 0) -
                  (Number(values.vacant_amount) || 0)
                )?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }) || '0.00'}
              </div>
            </Grid>
          </Grid>
        </Box>
      </div>
    </>
  );
};
