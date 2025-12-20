import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import StyledField from '@/components/styles/StyleFieldEditComp';
import React, { useEffect, useState } from 'react';
import { handleInputChange } from '@/utils/sanitize';
import { FieldArray, useFormikContext } from 'formik';
import { IncomeApprochType } from '@/components/interface/Income-approch-type';
import { Icons } from '@/components/icons';
import { sanitizeInputExpense } from '@/utils/appraisalSanitize';
import { IncomeApproachEnum } from '../Enum/AppraisalEnum';
import TextEditor from '@/components/styles/text-editor';

export const Expense = ({
  analysis_type,
  isFetching,
  effectiveIncome,
  totalAnnualIncomess,
  totalExpenses,
  setTotalExpenses

}: any) => {
  const { handleChange, setFieldValue, values } =
    useFormikContext<IncomeApprochType>();
  // formatCurrency(
  //               (totalAnnualIncomess || 0) -
  //               (Number(values.vacant_amount ?? 0).toFixed(2) as any) +
  //               values.other_total_annual_income -
  //               totalExpenses
  //             ) as any
  console.log(totalAnnualIncomess, values.vacant_amount, values.other_total_annual_income, totalExpenses, 'expensesvaluesss');
  const [totalAnnualAmount, setTotalAnnualAmount] = useState(0);
  const [totalOeUnit, setTotalUnit] = useState(0);
  const [totalOeBed, setTotalBed] = useState(0);
  const [bool, setBool] = useState(false);
  const [manualChange, setManualChange] = useState(false);
  // const [totalExpenses, setTotalExpenses] = useState<any>();
  // Auto-calculate expenses when not manually changed
  useEffect(() => {
    if (!manualChange && values?.operatingExpenses) {
      const operatingExpense = values?.operatingExpenses?.map((ele: any) => {
        return {
          annual_amount: ele?.annual_amount,
        };
      });
      const calculatedTotal = operatingExpense.reduce((total, item) => {
        return total + parseFloat(item.annual_amount || 0);
      }, 0);

      // Only update if the calculated total is different from current value
      if (calculatedTotal !== totalAnnualAmount) {
        setTotalAnnualAmount(calculatedTotal);
        setFieldValue('total_oe_annual_amount', calculatedTotal);
        
        const TOTAL_INCOME = values.other_total_annual_income + effectiveIncome;
        const NetIncome = TOTAL_INCOME - calculatedTotal;
        
        if (
          values.incomeSources.length >= 1 &&
          values.incomeSources.some((source) => source.annual_income == 0)
        ) {
          setFieldValue('total_net_income', 0);
        } else {
          setFieldValue('total_net_income', NetIncome);
        }
      }
    }
  }, [
    values?.operatingExpenses,
    effectiveIncome,
    manualChange,
    values.other_total_annual_income,
    totalAnnualAmount, // Add this to prevent unnecessary updates
  ]);

  const formatCurrency = (value: number) => {
    return value?.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  function formatNumber(value: number | string): string {
    if (value == null || value === '') {
      return '0.00';
    }
    const [integerPart, decimalPart] = value.toString().split('.');
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return decimalPart
      ? `${formattedInteger}.${decimalPart.padEnd(2, '0')}`
      : `${formattedInteger}.00`;
  }

  const handleAnnualAmountChange = (i: number, event: string) => {
    const sanitizedEvent: any = sanitizeInputExpense(event);

    const newOperatingExpenses = values.operatingExpenses.map((elem, index) => {
      if (index === i) {
        return { ...elem, annual_amount: sanitizedEvent.toString() };
      }
      return elem;
    });

    const totalAnnualExpenses = newOperatingExpenses.reduce((acc, elem) => {
      const amount =
        parseFloat((elem.annual_amount || '0').toString().replace(/,/g, '')) ||
        0;
      return acc + amount;
    }, 0);

    setTotalAnnualAmount(totalAnnualExpenses);
    setFieldValue(
      IncomeApproachEnum.TOTAL_OE_ANNUAL_AMOUNT,
      totalAnnualExpenses
    );

    const events = parseFloat(sanitizedEvent.replace(/,/g, ''));
    let divide: any =
      events /
      ((totalAnnualIncomess || 0) - (Number(values.vacant_amount) || 0));
    divide = (divide * 100).toFixed(2);
    setFieldValue(`operatingExpenses.${i}.percentage_of_gross`, divide);

    const divide_sf = events / values.total_sq_ft;
    const roundedPercentage_sf = divide_sf.toFixed(2);
    setFieldValue(
      `operatingExpenses.${i}.total_per_sq_ft`,
      roundedPercentage_sf
    );

    if (values.comparison_basis === 'Bed') {
      const divideBed = events / values.total_bed;
      const beds = divideBed.toFixed(2);
      setFieldValue(`operatingExpenses.${i}.total_per_bed`, beds);
    } else if (values.comparison_basis === 'Unit') {
      const divideUnit = events / values.total_unit;
      const beds = divideUnit.toFixed(2);
      setFieldValue(`operatingExpenses.${i}.total_per_unit`, beds);
    }

    handleInputChange(
      handleChange,
      `operatingExpenses.${i}.annual_amount`,
      sanitizedEvent.toString()
    );
  };
  useEffect(() => {
    if (isFetching) {
      setTotalAnnualAmount(0);
      setTotalUnit(0);
      setTotalBed(0);
      setBool(false);
    }
  }, [isFetching]);

  useEffect(() => {
    if (values.operatingExpenses?.length) {
      const totalPercentageOfGross = values.operatingExpenses.reduce(
        (acc, elem) => {
          return acc + (parseFloat(elem.percentage_of_gross) || 0);
        },
        0
      );

      const totalPercentageOfSf = values.operatingExpenses.reduce(
        (acc, elem) => {
          return acc + (parseFloat(elem.total_per_sq_ft) || 0);
        },
        0
      );

      if (totalAnnualAmount) {
        setFieldValue(
          IncomeApproachEnum.TOTAL_OE_GROSS,
          totalPercentageOfGross
        );
        setFieldValue(
          IncomeApproachEnum.TOTAL_OE_PER_SQ_FT,
          totalPercentageOfSf
        );
      }

      const totalUnit: any = values.operatingExpenses.reduce((acc, elem) => {
        return acc + (parseFloat(elem.total_per_unit) || 0);
      }, 0);
      setTotalUnit(totalUnit);
      setFieldValue(IncomeApproachEnum.TOTAL_OE_PER_UNIT, totalUnit);

      const totalBed: any = values.operatingExpenses.reduce((acc, elem) => {
        return acc + (parseFloat(elem.total_per_bed) || 0);
      }, 0);
      setTotalBed(totalBed);
      setFieldValue(IncomeApproachEnum.TOTAL_OE_PER_BED, totalBed);
    }
  }, [values.operatingExpenses]);

  useEffect(() => {
    if (totalAnnualAmount) {
      if (values.adjusted_gross_amount) {
        values.operatingExpenses.forEach((expense: any, index: number) => {
          if (expense.annual_amount == '') {
            return;
          } else {
            handleAnnualAmountChange(index, expense.annual_amount);
          }
        });
      }
    }

    if (values.boolean) {
      const operatingExpenses =
        values.operatingExpenses &&
        values.operatingExpenses.map((operatingExpenses: any) => {
          const annualAmount =
            typeof operatingExpenses.annual_amount === 'string'
              ? parseFloat(operatingExpenses.annual_amount.replace(/,/g, ''))
              : operatingExpenses.annual_amount;
          // const adjustedGrossAmount = values.adjusted_gross_amount;
          // const divide =
          //   adjustedGrossAmount !== 0 ? annualAmount / adjustedGrossAmount : 0;
          const divide =
            annualAmount /
            ((totalAnnualIncomess || 0) - (Number(values.vacant_amount) || 0));
          return {
            names: operatingExpenses.names,
            annual_amount: operatingExpenses.annual_amount,
            percentage_of_gross: (divide * 100).toFixed(2),
            total_per_sq_ft: operatingExpenses.total_per_sq_ft,
            comments: operatingExpenses.comments,
            total_per_unit: operatingExpenses.total_per_unit,
            total_per_bed: operatingExpenses.total_per_bed,
            extra_id: operatingExpenses.id,
          };
        });
      setFieldValue('operatingExpenses', operatingExpenses);
    }
  }, [values.adjusted_gross_amount, values.total_sq_ft, totalAnnualIncomess]);
  console.log(values.operatingExpenses, 'operatingExpenses');
  // Calculate total expenses and net income
  useEffect(() => {
    if (values?.operatingExpenses) {
      const sum = values.operatingExpenses
        .map((ele) => {
          const val = typeof ele.annual_amount === 'string'
            ? ele.annual_amount.replace(/,/g, '')
            : ele.annual_amount?.toString() || '0';

          const parsed = parseFloat(val);
          return isNaN(parsed) ? 0 : parsed;
        })
        .reduce((acc, num) => acc + num, 0);

      setTotalExpenses(sum);
      setTotalAnnualAmount(sum);
      setFieldValue('total_oe_annual_amount', sum);

      // Calculate net income
      const TOTAL_INCOME = values.other_total_annual_income + effectiveIncome;
      const NetIncome = TOTAL_INCOME - sum;
      
      if (
        values.incomeSources.length >= 1 &&
        values.incomeSources.some((source) => source.annual_income == 0)
      ) {
        setFieldValue('total_net_income', 0);
      } else {
        setFieldValue('total_net_income', NetIncome);
      }
    }
  }, [values?.operatingExpenses, effectiveIncome, values.other_total_annual_income, setTotalExpenses]);


  useEffect(() => {
    if (totalAnnualAmount) {
      setFieldValue(`total_oe_annual_amount`, totalAnnualAmount);
    }

    if (values.total_oe_annual_amount == 0) {
      setFieldValue('total_oe_gross', 0);
      setFieldValue('total_per_sq_ft', 0);
      setFieldValue('total_oe_per_square_feet', 0);
    }
    const TOTAL_INCOME =
      values.other_total_annual_income + values.adjusted_gross_amount;
    const netIncome = TOTAL_INCOME - values.total_oe_annual_amount;
    if (
      values.incomeSources.length >= 1 &&
      values.incomeSources.some((source) => source.annual_income == 0)
    ) {
      setFieldValue(IncomeApproachEnum.TOTAL_NET_INCOME, 0);
    } else {
      setFieldValue(IncomeApproachEnum.TOTAL_NET_INCOME, netIncome);
    }
  }, [
    totalAnnualAmount,
    values.adjusted_gross_amount,
    values.total_net_income,
  ]);

  useEffect(() => {
    if (bool) {
      const netIncome =
        values.adjusted_gross_amount - values.total_oe_annual_amount;
      setFieldValue('total_net_income', netIncome);
      if (values.total_oe_annual_amount == 0) {
        setFieldValue('total_net_income', values.adjusted_gross_amount);
      }
    }
  }, [values.total_oe_annual_amount]);
  const totalPercentage = values?.operatingExpenses?.reduce((sum, item) => {
    return sum + parseFloat(item.percentage_of_gross || "0");
  }, 0);
  return (
    <>
      <div className="py-2"></div>
      <Typography
        variant="h6"
        component="p"
        className="text-xs font-bold montserrat-font-family mt-0.5 mb-3"
      >
        EXPENSE
      </Typography>

      <div
        style={{
          width: '100%',
          border: '1px solid #eee',
          backgroundColor: '#f5f5f5',
          marginTop: '2px',
          paddingBottom: '5px',
        }}
      >
        <Grid
          container
          spacing={2}
          columns={13}
          className="mt-[10px] px-2 w-full"
        >
          <Grid
            item
            xs={2}
            className="pl-[24px] mb-[25px] font-bold text-[11px]"
          >
            OPERATING EXPENSES
          </Grid>
          <Grid
            item
            xs={2}
            className="pl-[24px] mb-[25px] font-bold text-[11px]"
          ></Grid>
          <Grid
            item
            xs={2}
            className="pl-[24px] mb-[25px] font-bold text-[11px]"
          >
            ANNUAL AMOUNT
          </Grid>
          <Grid
            item
            xs={2}
            className="pl-[24px] mb-[25px] font-bold text-[11px]"
          >
            % OF EGI
          </Grid>
          {values.comparison_basis == IncomeApproachEnum.UNIT && (
            <Grid
              item
              xs={1}
              className="pl-[24px] mb-[25px] font-bold text-[11px]"
            >
              $/UNIT
            </Grid>
          )}
          {values.comparison_basis === IncomeApproachEnum.BED && (
            <Grid
              item
              xs={1}
              className="pl-[24px] mb-[25px] font-bold text-[11px]"
            >
              $/BED
            </Grid>
          )}
          <Grid
            item
            xs={values.comparison_basis === IncomeApproachEnum.SF ? 2 : 1}
            className="pl-[24px] mb-[25px] font-bold text-[11px]"
          >
            {analysis_type === '$/Acre' ? '$/AC' : '$/SF'}
          </Grid>
          <Grid
            item
            xs={2}
            className="pl-[26px] mb-[25px] font-bold text-[11px]"
          >
            COMMENTS
          </Grid>

          <FieldArray
            name="operatingExpenses"
            render={(arrayHelpers) => (
              <>
                {values.operatingExpenses && values.operatingExpenses.length > 0
                  ? values.operatingExpenses.map((zone: any, i: number) => {
                    return (
                      <>
                        <Grid
                          item
                          xs={2}
                          key={zone.name}
                          className="pl-[24px] mb-2"
                        >
                          <StyledField
                            name={`operatingExpenses.${i}.names`}
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
                                `operatingExpenses.${i}.names`,
                                input
                              );
                            }}
                            value={values.operatingExpenses[i].names}
                            type="text"
                          />
                        </Grid>
                        <Grid item xs={2}></Grid>
                        <Grid item xs={2} className="pl-[24px] my-[2px]">
                          <StyledField
                            label={<span className="font-semibold"></span>}
                            name={`operatingExpenses.${i}.annual_amount`}
                            style={{
                              background: '#fff',
                              borderBottomWidth: '1px',
                            }}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) => handleAnnualAmountChange(i, e.target.value)}
                            value={formatNumber(
                              values.operatingExpenses[i].annual_amount
                            )}
                            type="text"
                            placeholder="Annual Amount"
                          />
                        </Grid>

                        <Grid item xs={2} className="pl-[24px] my-[2px]">
                          <StyledField
                            label={<span className="font-semibold"></span>}
                            name={`operatingExpenses.${i}.percentage_of_gross`}
                            style={{
                              background: '#f5f5f5',
                              borderBottomWidth: '1px',
                              borderStyle: 'dotted',
                            }}
                            value={
                              !isFinite(
                                values.operatingExpenses[i]
                                  .percentage_of_gross
                              ) ||
                                isNaN(
                                  values.operatingExpenses[i]
                                    .percentage_of_gross
                                ) ||
                                values.operatingExpenses[i]
                                  .percentage_of_gross === null
                                ? '0.00%'
                                : `${values.operatingExpenses[i].percentage_of_gross === '' ? values.operatingExpenses[i].percentage_of_gross : values.operatingExpenses[i].percentage_of_gross + '%'}`
                            }
                            type="text"
                            disabled={true}
                          />
                        </Grid>

                        {values.comparison_basis ==
                          IncomeApproachEnum.UNIT && (
                            <Grid item xs={1} className="pl-[24px] my-[2px]">
                              <StyledField
                                label={<span className="font-semibold"></span>}
                                name={`operatingExpenses.${i}.total_per_unit`}
                                style={{
                                  background: '#f5f5f5',
                                  borderBottomWidth: '1px',
                                  borderStyle: 'dotted',
                                }}
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                  setManualChange(true);
                                  const input: any =
                                    parseFloat(e.target.value) || 0;
                                  handleInputChange(
                                    handleChange,
                                    `operatingExpenses.${i}.total_per_unit`,
                                    input.toString()
                                  );
                                }}
                                value={
                                  isNaN(
                                    values.operatingExpenses[i].total_per_unit
                                  )
                                    ? ''
                                    : formatNumber(
                                      values.operatingExpenses[i]
                                        .total_per_unit
                                    )
                                }
                                type="text"
                                disabled={true}
                              />
                            </Grid>
                          )}
                        {values.comparison_basis ===
                          IncomeApproachEnum.BED && (
                            <Grid item xs={1} className="pl-[24px] my-[2px]">
                              <StyledField
                                label={<span className="font-semibold"></span>}
                                name={`operatingExpenses.${i}.total_per_bed`}
                                style={{
                                  background: '#f5f5f5',
                                  borderBottomWidth: '1px',
                                  borderStyle: 'dotted',
                                }}
                                value={
                                  isNaN(
                                    values.operatingExpenses[i].total_per_bed
                                  )
                                    ? ''
                                    : formatNumber(
                                      values.operatingExpenses[i]
                                        .total_per_bed
                                    )
                                }
                                type="text"
                              />
                            </Grid>
                          )}

                        <Grid
                          item
                          xs={
                            values.comparison_basis === IncomeApproachEnum.SF
                              ? 2
                              : 1
                          }
                          className="pl-[24px] my-[2px]"
                        >
                          <StyledField
                            name={`operatingExpenses.${i}.total_per_sq_ft`}
                            style={{
                              background: '#f5f5f5',
                              borderBottomWidth: '1px',
                              borderStyle: 'dotted',
                            }}
                            value={
                              isNaN(
                                values.operatingExpenses[i].total_per_sq_ft
                              )
                                ? ''
                                : formatNumber(
                                  values.operatingExpenses[i]
                                    .total_per_sq_ft
                                )
                            }
                            type="text"
                            disabled={true}
                          />
                        </Grid>

                        <Grid item xs={2} className="pl-[24px] my-[2px]">
                          <StyledField
                            label={<span className="font-semibold"></span>}
                            name={`operatingExpenses.${i}.comments`}
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
                                `operatingExpenses.${i}.comments`,
                                input
                              );
                            }}
                            value={values.operatingExpenses[i].comments}
                            type="text"
                            placeholder="COMMENTS"
                          />
                        </Grid>
                        <Grid item xs={1}>
                          <div className='flex items-center min-h-[32px]'>
                            <Icons.RemoveCircleOutlineIcon
                              className="text-red-500 cursor-pointer"
                              onClick={() => {
                                const removedAmount =
                                  parseFloat(
                                    values.operatingExpenses[i].annual_amount
                                      .toString()
                                      .replace(/,/g, '')
                                  ) || 0;
                                const removedEgi =
                                  parseFloat(
                                    values.operatingExpenses[
                                      i
                                    ].percentage_of_gross
                                      .toString()
                                      .replace(/,/g, '')
                                  ) || 0;
                                const removedSf =
                                  parseFloat(
                                    values.operatingExpenses[i]
                                      .total_per_sq_ft
                                  ) || 0;
                                arrayHelpers.remove(i);
                                setBool(true);

                                const remove_account =
                                  values.total_oe_annual_amount -
                                  removedAmount;
                                setFieldValue(
                                  'total_oe_annual_amount',
                                  remove_account
                                );

                                const remove_egi =
                                  values.total_oe_gross - removedEgi;
                                setFieldValue('total_oe_gross', remove_egi);

                                const remove_sf =
                                  values.total_oe_per_square_feet - removedSf;
                                setFieldValue(
                                  'total_oe_per_square_feet',
                                  remove_sf
                                );

                                if (values.comparison_basis === 'Bed') {
                                  const removedBed =
                                    parseFloat(
                                      values.operatingExpenses[
                                        i
                                      ].total_per_bed.replace(/,/g, '')
                                    ) || 0;
                                  setTotalBed(
                                    (prevTotal) => prevTotal - removedBed
                                  );
                                } else if (
                                  values.comparison_basis === 'Unit'
                                ) {
                                  const removedUnit =
                                    parseFloat(
                                      values.operatingExpenses[
                                        i
                                      ].total_per_unit.replace(/,/g, '')
                                    ) || 0;
                                  setTotalUnit(
                                    (prevTotal) => prevTotal - removedUnit
                                  );
                                }
                              }}
                            />
                          </div>
                        </Grid>
                      </>
                    );
                  })
                  : null}

                <Grid item xs={12}>
                  <div
                  // onClick={() =>
                  //   arrayHelpers.insert(values.operatingExpenses.length, {
                  //     name: '',
                  //     annual_amount: '',
                  //     percentage_of_gross: '0.00',
                  //     total_per_sq_ft: '',
                  //     comments: '',
                  //   })
                  // }
                  >
                    <div
                      className="flex text-[#0da1c7] mt-3 w-[166px]"
                      onClick={() =>
                        arrayHelpers.insert(values.operatingExpenses.length, {
                          name: '',
                          annual_amount: 0,
                          percentage_of_gross: '0.00',
                          total_per_sq_ft: '',
                          comments: '',
                        })
                      }
                    >
                      <span>
                        <Icons.AddCircleOutlineIcon className="cursor-pointer" />
                      </span>
                      <span className="mt-[3px] pl-2 text-[11px] cursor-pointer whitespace-nowrap">
                        New Operating Expense
                      </span>
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
          <Grid item xs={2} className="pl-[24px]">
            <div className="font-bold text-[11px]">TOTAL EXPENSE</div>
          </Grid>
          <Grid item xs={2}></Grid>
          <Grid item xs={2} className="pl-[24px]">
            <div className="font-bold text-[11px]">
              $ {formatCurrency(totalExpenses || ('0.00' as any))}
            </div>
          </Grid>

          <Grid item xs={2} className="pl-[24px]">
            <div className="font-bold text-[11px]">
              {/* {formatCurrency(
                values.total_oe_gross === Infinity
                  ? '0.00'
                  : ((values.total_oe_gross || '0.00') as any)
              )} */}
              {totalPercentage ? totalPercentage.toFixed(2) : '0.00'}
              %
            </div>
          </Grid>

          {values.comparison_basis == 'Unit' && (
            <Grid item xs={1} className="pl-[24px]">
              <div className="font-bold text-[11px]">
                ${' '}
                {formatCurrency(
                  totalOeUnit ? totalOeUnit : values.total_oe_per_unit || '0.00'
                )}{' '}
                /UNIT
              </div>
              <div className="text-[11px]">Total</div>
            </Grid>
          )}

          {values.comparison_basis === 'Bed' && (
            <Grid item xs={1} className="pl-[24px]">
              <div className="font-bold text-[11px]">
                ${' '}
                {formatCurrency(
                  totalOeBed ? totalOeBed : values.total_oe_per_bed || '0.00'
                )}{' '}
                /BED
              </div>
              <div className="text-[11px]">Total</div>
            </Grid>
          )}

          <Grid item xs={2} className="pl-[24px]">
            <div className="font-bold text-[11px]">
              ${' '}
              {formatCurrency(
                values.total_oe_per_square_feet || ('0.00' as any)
              )}
              {analysis_type === '$/Acre' ? '/AC' : '/SF'}
            </div>
          </Grid>
          <Grid item xs={2}></Grid>
        </Grid>

        <Grid container spacing={2} columns={13} className="px-2 w-full">
          <Grid item xs={2} className="pt-[7px] pl-[24px]">
            <div className="mt-3 font-bold text-[11px]">
              NET OPERATING INCOME
            </div>
          </Grid>
          <Grid item xs={2}></Grid>
          <Grid item xs={2} className="pt-[16px] pl-[24px]">
            {/* <div className="font-bold text-[11px]">
              $ {formatCurrency(values.total_net_income as any)}{' '}
            </div> */}
            <div className="font-bold text-[11px]">
              ${' '}
              {
                formatCurrency(
                  (totalAnnualIncomess || 0) -
                  (Number(values.vacant_amount ?? 0).toFixed(2) as any) +
                  values.other_total_annual_income -
                  totalExpenses
                ) as any
              }
            </div>
          </Grid>
          <Grid item xs={6}></Grid>
        </Grid>

        <Grid
          container
          spacing={2}
          columns={13}
          className="mt-[0px] px-2 w-full"
        >
          <Grid item xs={2} className="pt-[7px] pl-[24px]">
            <div className="mt-3 font-bold text-[11px]">EXPENSE NOTES</div>
          </Grid>
          <Grid item xs={14}>
            <TextEditor
              editorContent={values.expense_notes} // Set initial value
              editorData={(content) => setFieldValue('expense_notes', content)} // Update Formik field on change
              style={{
                background: '#fff',
                borderBottomWidth: '1px',
                width: '100%', // Adjust width if necessary
                height: '110px',
              }}
            />
          </Grid>
          {/* <Grid item xs={6}></Grid> */}
        </Grid>
      </div>
    </>
  );
};
