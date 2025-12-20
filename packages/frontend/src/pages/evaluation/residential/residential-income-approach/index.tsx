import { Icons } from '@/components/icons';
import { IncomeApprochType } from '@/components/interface/Income-approch-type';
import StyledField from '@/components/styles/StyleFieldEditComp';
import TextEditor from '@/components/styles/text-editor';
import { IncomeApproachEnum } from '@/pages/appraisal/Enum/AppraisalEnum';
import { retailOptions } from '@/pages/comps/create-comp/SelectOption';
import { sanitizeInput, sanitizeInputRent, sanitizeSf } from '@/utils/appraisalSanitize';
import {
  sanitizeAndLimitInput,
  sanitizeAndLimitInputAnnualIncome,
} from '@/utils/income-approch/calculation';
import { handleVacancyChange } from '@/utils/income-approch/handle-change';
import { handleVacancyKeyDown } from '@/utils/income-approch/sanitize-keypress';
import { handleInputChange, sanitizeInputPercentage } from '@/utils/sanitize';
import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import { Field, FieldArray, useFormikContext } from 'formik';
import React, { useEffect, useState } from 'react';
import { ResidentialIncomeApproachEnum } from './residential-incom-approach-enum';

export const ResidentialEvaluationIncome = ({
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
  const [title, setTitle] = useState('');
  const [lastUpdatedField, setLastUpdatedField] = useState<{
    index: number | null;
    field: 'monthly' | 'annual' | 'rent' | null;
  }>({
    index: null,
    field: null,
  });
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
    setLastUpdatedField({ index: i, field: ResidentialIncomeApproachEnum.RENT });
    const rawValue = sanitizeInputRent(e.target.value.replace(/,/g, ''));
    const input = parseFloat(rawValue) || 0;

    let sfSource: number;

    if (values.comparison_basis === ResidentialIncomeApproachEnum.UNIT) {
      sfSource = parseFloat(values.incomeSources[i].unit) || 0;
    } else if (values.comparison_basis === ResidentialIncomeApproachEnum.BED) {
      sfSource = parseFloat(values.incomeSources[i].rent_bed) || 0;
    } else {
      sfSource = parseFloat(values.incomeSources[i].square_feet) || 0;
    }

    const newAnnualIncome = input * sfSource;

    setFieldValue(
      `${ResidentialIncomeApproachEnum.INCOME_SOURCES}.${i}.${ResidentialIncomeApproachEnum.ANNUAL_INCOME}`,
      newAnnualIncome.toFixed(2)
    );
    setFieldValue(
      `${ResidentialIncomeApproachEnum.INCOME_SOURCES}.${i}.${ResidentialIncomeApproachEnum.MONTHLY_INCOME}`,
      (newAnnualIncome / 12).toFixed(2)
    );

    values.incomeSources[i].annual_income = newAnnualIncome.toString();
    setTotalAnnualIncome(calculateTotalAnnualIncome(values.incomeSources));
    calculateEffectiveIncome(calculateTotalAnnualIncome(values.incomeSources));

    values.incomeSources[i].monthly_income = (newAnnualIncome / 12).toString();
    setTotalMonthlyIncome(calculateTotalMonthlyIncome(values.incomeSources));

    handleInputChange(handleChange, `${ResidentialIncomeApproachEnum.INCOME_SOURCES}.${i}.${ResidentialIncomeApproachEnum.RENT_SQ_FT}`, rawValue);
  };

  const handleAnnualIncomeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    i: number
  ) => {
    setLastUpdatedField({ index: i, field: ResidentialIncomeApproachEnum.ANNUAL });
    const event = sanitizeInput(e.target.value);
    const input: any = event.replace(/,/g, '') || 0;

    const monthlyIncome = (input / 12).toFixed(2);
    setFieldValue(`${ResidentialIncomeApproachEnum.INCOME_SOURCES}.${i}.${ResidentialIncomeApproachEnum.MONTHLY_INCOME}`, monthlyIncome);

    values.incomeSources[i].annual_income = input.toString();
    setTotalAnnualIncome(calculateTotalAnnualIncome(values.incomeSources));

    values.incomeSources[i].monthly_income = (input / 12).toString();
    setTotalMonthlyIncome(calculateTotalMonthlyIncome(values.incomeSources));
    calculateEffectiveIncome(calculateTotalAnnualIncome(values.incomeSources));

    values.incomeSources[i].rent_sq_ft = (
      input / parseFloat(values.incomeSources[i].square_feet)
    ).toString();
    const sfSource = parseFloat(values.incomeSources[i].square_feet) || 0;
    const bedSource = parseFloat(values.incomeSources[i].rent_bed) || 0;
    const unitSource = parseFloat(values.incomeSources[i].unit) || 0;

    let rentSqFt;

    if (values.comparison_basis === ResidentialIncomeApproachEnum.BED) {
      rentSqFt = input / bedSource;
    } else if (values.comparison_basis === ResidentialIncomeApproachEnum.UNIT) {
      rentSqFt = input / unitSource;
    } else {
      rentSqFt = input / sfSource;
    }

    const data = Math.floor(rentSqFt * 100) / 100;
    setFieldValue(`${ResidentialIncomeApproachEnum.INCOME_SOURCES}.${i}.${ResidentialIncomeApproachEnum.RENT_SQ_FT}`, data);

    const sanitizedValue = sanitizeAndLimitInputAnnualIncome(event);

    handleInputChange(
      handleChange,
      `${ResidentialIncomeApproachEnum.INCOME_SOURCES}.${i}.${ResidentialIncomeApproachEnum.ANNUAL_INCOME}`,
      sanitizedValue.toString()
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
    setFieldValue(`${ResidentialIncomeApproachEnum.INCOME_SOURCES}.${i}.${ResidentialIncomeApproachEnum.ANNUAL_INCOME}`, annualIncome);
    setFieldValue(`${ResidentialIncomeApproachEnum.BOOLEAN}`, true);

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
      parseFloat(values.incomeSources[i].square_feet)
    ).toString();

    const sfSourceValue = values.incomeSources[i].square_feet;
    const sfSource =
      parseFloat(
        typeof sfSourceValue === 'string'
          ? sfSourceValue.replace(/,/g, '')
          : String(sfSourceValue)
      ) || 0;

    const bed = parseFloat(values.incomeSources[i].rent_bed) || 0;
    const Unit = parseFloat(values.incomeSources[i].unit) || 0;
    let total;

    if (values.comparison_basis === ResidentialIncomeApproachEnum.BED) {
      total = bed;
    } else if (values.comparison_basis === ResidentialIncomeApproachEnum.UNIT) {
      total = Unit;
    } else {
      total = sfSource;
    }
    const annualSource: any = (12 * input).toFixed(2) || 0;
    const rentSqFt = annualSource / total;
    const data = Math.floor(rentSqFt * 100) / 100;
    setFieldValue(
      `${ResidentialIncomeApproachEnum.INCOME_SOURCES}.${i}.${ResidentialIncomeApproachEnum.RENT_SQ_FT}`,
      data === Infinity ? '0.00' : data
    );

    const sanitizedValue = sanitizeAndLimitInput(event);

    handleInputChange(
      handleChange,
      `${ResidentialIncomeApproachEnum.INCOME_SOURCES}.${i}.${ResidentialIncomeApproachEnum.MONTHLY_INCOME}`,
      sanitizedValue.toString()
    );
  };

  useEffect(() => {
    if (values.comparison_basis === ResidentialIncomeApproachEnum.UNIT) {
      setTitle(ResidentialIncomeApproachEnum.UNITS);
    }
    if (values.comparison_basis === ResidentialIncomeApproachEnum.BED) {
      setTitle(ResidentialIncomeApproachEnum.BEDS);
    } else {
      setTitle(ResidentialIncomeApproachEnum.SQ_FT);
    }
    if (!bool) {
      if (values.incomeSources?.length) {
        const totalSquareFootage = values.incomeSources.reduce(
          (total, ele: any) => {
            return total + (parseFloat(ele.square_feet) || 0);
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
      setFieldValue(`${ResidentialIncomeApproachEnum.TOTAL_MONTHLY_INCOME}`, totalMonthlyIncome);

      const totalAnnualIncome = values.incomeSources.reduce(
        (total, ele: any) => {
          return total + (parseFloat(ele.annual_income) || 0);
        },
        0
      );
      setFieldValue(`${ResidentialIncomeApproachEnum.TOTAL_ANNUAL_INCOME}`, totalAnnualIncome);

      let divide: any;

      if (values.comparison_basis === ResidentialIncomeApproachEnum.BED) {
        divide = totalAnnualIncome / values.total_bed;
      } else if (values.comparison_basis === ResidentialIncomeApproachEnum.UNIT) {
        divide = totalAnnualIncome / values.total_unit;
      } else {
        divide = totalAnnualIncome / values.total_sq_ft;
      }
      setFieldValue(`${ResidentialIncomeApproachEnum.TOTAL_RENT_SQ_FT}`, divide);

      const vaccancy_change: any = values.vacancy;
      const total = (vaccancy_change * totalAnnualIncome) / 100;
      setFieldValue(`${ResidentialIncomeApproachEnum.VACANT_AMOUNT}`, total);
      const effectiveIncome =
        (totalAnnualIncome * (100 - values.vacancy)) / 100;
      setFieldValue(`${ResidentialIncomeApproachEnum.ADJUSTED_GROSS_AMOUNT}`, effectiveIncome);
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
      setFieldValue(ResidentialIncomeApproachEnum.VACANCY, 0);
    }

    setFieldValue(`${ResidentialIncomeApproachEnum.TOTAL_SQ_FT}`, values.total_sq_ft || totalSF);
    setFieldValue(`${ResidentialIncomeApproachEnum.BOOLEAN}`, true);
    const vaccancy_change: any = values.vacancy;
    const total = (vaccancy_change * values.total_annual_income) / 100;
    setFieldValue(`${ResidentialIncomeApproachEnum.VACANT_AMOUNT}`, total);
    const effectiveInc: any =
      (values.total_annual_income * (100 - values.vacancy)) / 100;
    setFieldValue(`${ResidentialIncomeApproachEnum.ADJUSTED_GROSS_AMOUNT}`, effectiveInc);
  }, [totalSF, values.vacancy]);

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
      type: '',
      monthly_income: '',
      annual_income: '',
      rent_sq_ft: '',
      square_feet: '',
      comments: '',
      link_overview: 0,
      id: null,
    });
    setNewItems((prev) => [...prev, values.incomeSources.length]);
  };
  const getLabelFromValue = (value: any) => {
    if (!value || value === ResidentialIncomeApproachEnum.SELECT_A_SUBTYPE) {
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
  const average = totalAnnualIncomess / values.total_sq_ft
  return (
    <>
      <Typography
        variant="h6"
        component="p"
        className="text-xs font-bold montserrat-font-family mt-0.5"
      >
        {ResidentialIncomeApproachEnum.INCOME}
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
            name={ResidentialIncomeApproachEnum.INCOME_SOURCES}
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
                            name={`${ResidentialIncomeApproachEnum.INCOME_SOURCES}.${i}.${ResidentialIncomeApproachEnum.TYPE}`}
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
                                `${ResidentialIncomeApproachEnum.INCOME_SOURCES}.${i}.${ResidentialIncomeApproachEnum.TYPE}`,
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
                                {ResidentialIncomeApproachEnum.MONTHLY_INCOME_HEADER}
                              </span>
                            }
                            name={`${ResidentialIncomeApproachEnum.INCOME_SOURCES}.${i}.${ResidentialIncomeApproachEnum.MONTHLY_INCOME}`}
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
                                {ResidentialIncomeApproachEnum.ANNUAL_INCOME_HEADER}
                              </span>
                            }
                            name={`${ResidentialIncomeApproachEnum.INCOME_SOURCES}.${i}.${ResidentialIncomeApproachEnum.ANNUAL_INCOME}`}
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
                                !values.incomeSources[i].square_feet
                                  ? `${ResidentialIncomeApproachEnum.IN_ORDER_TO_EDIT_THIS_FIELD} ${title}`
                                  : ''
                              }
                              placement="bottom-start"
                            >
                              <div
                              >
                                <StyledField
                                  label={
                                    <span className="font-bold text-black text-[11px]">
                                      {analysis_type === ResidentialIncomeApproachEnum.DOLLAR_PER_ACRE
                                        ? ResidentialIncomeApproachEnum.RENT_AC_YR
                                        : ResidentialIncomeApproachEnum.RENT_SF_YR}
                                    </span>
                                  }
                                  value={
                                    !isFinite(
                                      values.incomeSources[i].rent_sq_ft
                                    )
                                      ? ''
                                      : values.incomeSources[i].rent_sq_ft ==
                                        0
                                        ? '0.00'
                                        : formatNumberWithCommas(
                                          values.incomeSources[i].rent_sq_ft
                                        )
                                  }
                                  name={`${ResidentialIncomeApproachEnum.INCOME_SOURCES}.${i}.${ResidentialIncomeApproachEnum.RENT_SQ_FT}`}
                                  onFocus={(e) => {
                                    if (e.target.value === '0.00') {
                                      handleInputChange(
                                        handleChange,
                                        `${ResidentialIncomeApproachEnum.INCOME_SOURCES}.${i}.${ResidentialIncomeApproachEnum.RENT_SQ_FT}`,
                                        ''
                                      );
                                    }
                                  }}
                                  style={{
                                    background:
                                      lastUpdatedField.index === null ||
                                        (lastUpdatedField.index === i &&
                                          lastUpdatedField.field === ResidentialIncomeApproachEnum.RENT)
                                        ? '#fff'
                                        : '#f5f5f5',
                                    borderBottomWidth: '1px',
                                  }}
                                  onChange={(e) => handleRentSqFtChange(e, i)}
                                  type="text"
                                  className="relative bg-[#f5f5f5] focus:border-blue-500 focus:outline-none w-full border-[#0000003b] border-t-0 border-r-0 border-l-0 !py-0 !min-h-[26px] !px-0"
                                  disabled={
                                    values.comparison_basis === ResidentialIncomeApproachEnum.UNIT
                                      ? !values.incomeSources[i].unit
                                      : values.comparison_basis === ResidentialIncomeApproachEnum.BED
                                        ? !values.incomeSources[i].rent_bed
                                        : !values.incomeSources[i].square_feet
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
                                    {ResidentialIncomeApproachEnum.UNITS}
                                  </span>
                                }
                                name={`${ResidentialIncomeApproachEnum.INCOME_SOURCES}.${i}.${ResidentialIncomeApproachEnum.UNIT.toLowerCase()}`}
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
                                    `${ResidentialIncomeApproachEnum.INCOME_SOURCES}.${i}.${ResidentialIncomeApproachEnum.RENT_SQ_FT}`,
                                    divide.toFixed(2)
                                  );

                                  const eventValue = sanitizeSf(e.target.value);
                                  handleInputChange(
                                    handleChange,
                                    `${ResidentialIncomeApproachEnum.INCOME_SOURCES}.${i}.${ResidentialIncomeApproachEnum.UNIT.toLowerCase()}`,
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
                                    {ResidentialIncomeApproachEnum.HAS_OF_BEDS}
                                  </span>
                                }
                                name={`${ResidentialIncomeApproachEnum.INCOME_SOURCES}.${i}.${ResidentialIncomeApproachEnum.RENT_BED}`}
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
                                    `${ResidentialIncomeApproachEnum.INCOME_SOURCES}.${i}.${ResidentialIncomeApproachEnum.RENT_SQ_FT}`,
                                    annualIncome / input.toString()
                                  );

                                  const eventValue = sanitizeSf(e.target.value);
                                  handleInputChange(
                                    handleChange,
                                    `${ResidentialIncomeApproachEnum.INCOME_SOURCES}.${i}.${ResidentialIncomeApproachEnum.RENT_BED}`,
                                    eventValue
                                  );
                                }}
                                value={
                                  values.incomeSources[i].rent_bed !== null &&
                                    values.incomeSources[i].rent_bed !== undefined
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
                            name={`${ResidentialIncomeApproachEnum.INCOME_SOURCES}.${i}.${ResidentialIncomeApproachEnum.SQUARE_FEET}`}
                            style={{
                              background: values.incomeSources[i].square_feet
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

                              setFieldValue(
                                `${ResidentialIncomeApproachEnum.INCOME_SOURCES}.${i}.${ResidentialIncomeApproachEnum.RENT_SQ_FT}`,
                                annualIncome / input
                              );

                            }}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) => {
                              const eventValue = sanitizeSf(e.target.value);
                              handleInputChange(
                                handleChange,
                                `${ResidentialIncomeApproachEnum.INCOME_SOURCES}.${i}.${ResidentialIncomeApproachEnum.SQUARE_FEET}`,
                                eventValue
                              );
                            }}
                            value={
                              values.incomeSources[i].square_feet !== null &&
                                values.incomeSources[i].square_feet !== undefined
                                ? values.incomeSources[
                                  i
                                ].square_feet.toLocaleString(undefined, {
                                  maximumFractionDigits: 2,
                                })
                                : values.incomeSources[i].square_feet === 0
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
                                {ResidentialIncomeApproachEnum.COMMENTS}
                              </span>
                            }
                            name={`${ResidentialIncomeApproachEnum.INCOME_SOURCES}.${i}.${ResidentialIncomeApproachEnum.COMMENTS}`}
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
                                `${ResidentialIncomeApproachEnum.INCOME_SOURCES}.${i}.${ResidentialIncomeApproachEnum.COMMENTS}`,
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

                <Grid item xs={2}>
                  <div

                  >
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
                            {ResidentialIncomeApproachEnum.OTHER_INCOME_SOURCE}
                          </span>
                        </div>
                      </Tooltip>
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
          className="mt-[10px] px-2 w-full"
        >
          <Grid item xs={2} xl={2} className="pt-[5px] pl-[24px]">
            <div className="font-bold text-[11px]">{ResidentialIncomeApproachEnum.TOTALS_AND_AVERAGES}</div>
          </Grid>
          <Grid item xs={2} xl={2} className="pt-[5px] pl-[24px]">
            <div className="font-bold text-[11px]">
              ${formatCurrency(values.total_monthly_income as any)}
            </div>
            <div className="text-xs text-greyApproch">{ResidentialIncomeApproachEnum.TOTAL}</div>
          </Grid>
          <Grid item xs={2} xl={2} className="pt-[5px] pl-[24px]">
            <div className="font-bold text-[11px]">
              ${formatCurrency(totalAnnualIncomess)}
            </div>
            <div className="text-xs text-greyApproch">{ResidentialIncomeApproachEnum.TOTAL_ANNUAL_INCOME_HEADER}</div>
          </Grid>

          <Grid item xs={2} xl={2} className="pt-[5px] pl-[24px]">

            <div className="font-bold text-[11px]">
              $
              {average ? average?.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) : '0.00'}
              /SF/YR
            </div>
            <div className="text-xs text-greyApproch">{ResidentialIncomeApproachEnum.AVERAGE}</div>
          </Grid>

          {values.comparison_basis == 'Unit' && (
            <Grid item xs={2} xl={1} className="pt-[5px] pl-[24px]">
              <div className="font-bold text-[11px]">
                {values.total_unit} {ResidentialIncomeApproachEnum.UNIT.toUpperCase()}
              </div>
              <div className="text-xs text-greyApproch">{ResidentialIncomeApproachEnum.TOTAL}</div>
            </Grid>
          )}

          {values.comparison_basis === ResidentialIncomeApproachEnum.BED && (
            <Grid item xs={1} xl={1} className="pt-[5px] pl-[24px]">
              <div className="font-bold text-[11px]">
                {values.total_bed} {ResidentialIncomeApproachEnum.BED.toUpperCase()}
              </div>
              <div className="text-xs text-greyApproch">{ResidentialIncomeApproachEnum.TOTAL}</div>
            </Grid>
          )}

          <Grid
            item
            lg={1}
            xs={values.comparison_basis === ResidentialIncomeApproachEnum.SF ? 1 : 1}
            className="pt-[5px] pl-[24px]"
          >
            <div className="font-bold text-[11px]">
              {values.total_sq_ft.toLocaleString()}{' '}
              {analysis_type === ResidentialIncomeApproachEnum.DOLLAR_PER_ACRE ? ResidentialIncomeApproachEnum.AC : ResidentialIncomeApproachEnum.SF}
            </div>

            <div className="text-xs text-greyApproch">{ResidentialIncomeApproachEnum.TOTAL}</div>
          </Grid>

          <Grid item xs={2} className="pl-[24px]"></Grid>
        </Grid>

        <Grid
          container
          spacing={2}
          columns={13}
          className="mt-0.5 px-2 w-full"
        >
          <Grid item xs={2} className="pt-1 pb-[0px] pl-[24px] pr-[0px]">
            <div className="font-bold text-[11px]">{ResidentialIncomeApproachEnum.INCOME_NOTES_HEADER}</div>
          </Grid>
          <Grid item xs={14} className="pt-[16px] pb-[0px] pl-[24px] pr-[0px]">
            <TextEditor
              editorContent={values.income_notes} // Sync with Formik field
              editorData={(content) => setFieldValue(ResidentialIncomeApproachEnum.INCOME_NOTES, content)} // Update Formik state
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
        <Grid
          container
          spacing={2}
          columns={13}
          className="mt-2 px-2 w-full"
        >
          <Grid item xs={2} className="pt-[10px] pl-[24px]">
            <div className="font-bold text-xs">{ResidentialIncomeApproachEnum.VACANCY.toUpperCase()}</div>
          </Grid>

          <Grid item xs={2} className="pt-[10px] pl-[24px]">
            <Field
              name={ResidentialIncomeApproachEnum.VACANCY}
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
          <Grid item xs={2} className="pt-[16px] pl-[24px]">
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
            <div className="mt-1 font-bold text-xs">{ResidentialIncomeApproachEnum.ADJUSTED_GROSS}</div>
          </Grid>
          <Grid item xs={2} className="pt-[16px] pl-[24px]"></Grid>
          <Grid item xs={2} className="pt-2 pl-[24px]">
            <div className="font-bold text-[11px]">
              ${' '}
              {(
                ((totalAnnualIncomess || 0) - (Number(values.vacant_amount) || 0))
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
