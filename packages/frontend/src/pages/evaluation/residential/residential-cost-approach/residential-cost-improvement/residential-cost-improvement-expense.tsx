import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import StyledField from '@/components/styles/StyleFieldEditComp';
import React, { useEffect, useState } from 'react';

import { handleInputChange } from '@/utils/sanitize';
import { FieldArray, useFormikContext } from 'formik';
import { IncomeApprochType } from '@/components/interface/Income-approch-type';
import { Icons } from '@/components/icons';
import TextAreaField from '@/components/styles/textarea';
import { sanitizeInput } from '@/utils/appraisalSanitize';
import { IncomeApproachEnum } from '@/pages/appraisal/Enum/AppraisalEnum';

export const ResidentialCostImprovementExpense = ({
  operatingIncFn,
  passSf,
  getEffectiveIncome,
  passBed,
  passUnit,
}: any) => {
  const { handleChange, setFieldValue, values } =
    useFormikContext<IncomeApprochType>();
  const [totalAnnualAmount, setTotalAnnualAmount] = useState(0);
  const [totalEgi, setTotalEgi] = useState(0);
  const [totalSf, setTotalSf] = useState(0);
  const [netOperInc, setNetOperInc] = useState(0);
  const [totalOeUnit, setTotalUnit] = useState(0);
  const [totalOeBed, setTotalBed] = useState(0);

  const formatCurrency = (value: number) => {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleAnnualAmountChange = (i: number, event: string) => {
    const sanitizedEvent: any = sanitizeInput(event);

    const newOperatingExpenses = values.operatingExpenses.map((elem, index) => {
      if (index === i) {
        return { ...elem, annual_amount: sanitizedEvent.toString() };
      }
      return elem;
    });

    const totalAnnualExpenses = newOperatingExpenses.reduce((acc, elem) => {
      const amount = parseFloat(elem.annual_amount.replace(/,/g, '')) || 0;
      return acc + amount;
    }, 0);

    setTotalAnnualAmount(totalAnnualExpenses);
    setFieldValue(
      IncomeApproachEnum.TOTAL_OE_ANNUAL_AMOUNT,
      totalAnnualExpenses
    );

    const events = parseFloat(sanitizedEvent.replace(/,/g, ''));
    let divide: any = events / getEffectiveIncome;
    divide = (divide * 100).toFixed(2);
    setFieldValue(`operatingExpenses.${i}.percentage_of_gross`, divide);

    const divide_sf = events / passSf;
    const roundedPercentage_sf = divide_sf.toFixed(2);
    setFieldValue(
      `operatingExpenses.${i}.total_per_sq_ft`,
      roundedPercentage_sf
    );

    if (values.comparison_basis === 'Bed') {
      const divideBed = events / passBed;
      const beds = divideBed.toFixed(2);
      setFieldValue(`operatingExpenses.${i}.total_per_bed`, beds);
    } else if (values.comparison_basis === 'Unit') {
      const divideUnit = events / passUnit;
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
    if (values.operatingExpenses?.length) {
      const totalPercentageOfGross = values.operatingExpenses.reduce(
        (acc, elem) => {
          return acc + (parseFloat(elem.percentage_of_gross) || 0);
        },
        0
      );
      setTotalEgi(totalPercentageOfGross);
      setFieldValue(IncomeApproachEnum.TOTAL_OE_GROSS, totalPercentageOfGross);

      const totalPercentageOfSf = values.operatingExpenses.reduce(
        (acc, elem) => {
          return acc + (parseFloat(elem.total_per_sq_ft) || 0);
        },
        0
      );
      setTotalSf(totalPercentageOfSf);
      setFieldValue(IncomeApproachEnum.TOTAL_OE_PER_SQ_FT, totalPercentageOfSf);

      const totalUnit: any = values.operatingExpenses.reduce((acc, elem) => {
        return acc + (parseFloat(elem.total_per_unit) || 0);
      }, 0);
      setTotalUnit(totalUnit);
      setFieldValue(IncomeApproachEnum.TOTAL_OE_PER_UNIT, totalUnit);

      const totalBed: any = values.operatingExpenses.reduce((acc, elem) => {
        return acc + (parseFloat(elem.total_per_bed) || 0);
      }, 0);
      setTotalBed(totalBed);
      setFieldValue(IncomeApproachEnum.TOTAL_OE_PER_BED, totalUnit);
    }
  }, [values.operatingExpenses]);

  useEffect(() => {
    if (getEffectiveIncome) {
      values.operatingExpenses.forEach((expense: any, index: number) => {
        if (expense.annual_amount == '') {
          return;
        } else {
          handleAnnualAmountChange(index, expense.annual_amount);
        }
      });
    }
  }, [getEffectiveIncome, passSf]);

  useEffect(() => {
    const netIncome = getEffectiveIncome - totalAnnualAmount;
    operatingIncFn(netIncome);
    setNetOperInc(netIncome);

    setFieldValue(IncomeApproachEnum.TOTAL_NET_INCOME, netIncome);
    setFieldValue(`total_oe_per_square_feet`, totalSf);
    setFieldValue(`total_oe_gross`, totalEgi);
    setFieldValue(`total_oe_annual_amount`, totalAnnualAmount);
  }, [
    totalSf,
    totalEgi,
    totalAnnualAmount,
    getEffectiveIncome,
    operatingIncFn,
  ]);

  return (
    <>
      <div className="py-2"></div>
      <Typography variant="h6" component="h6" className="text-base font-bold">
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
                            className="pl-[24px]"
                          >
                            <StyledField
                              label={
                                <span className="font-semibold">
                                  OPERATING EXPENSES
                                </span>
                              }
                              name={`operatingExpenses.${i}.names`}
                              style={{
                                background: '#f5f5f5',
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
                          <Grid item xs={2} className="pl-[24px]">
                            <StyledField
                              label={
                                <span className="font-semibold">
                                  Annual Amount
                                </span>
                              }
                              name={`operatingExpenses.${i}.annual_amount`}
                              style={{
                                background: '#f5f5f5',
                                borderBottomWidth: '1px',
                              }}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ) => handleAnnualAmountChange(i, e.target.value)}
                              value={values.operatingExpenses[i].annual_amount}
                              type="text"
                            />
                          </Grid>

                          <Grid item xs={2} className="pl-[24px]">
                            <StyledField
                              label={
                                <span className="font-semibold">% of EGI</span>
                              }
                              name={`operatingExpenses.${i}.percentage_of_gross`}
                              style={{
                                background: '#f5f5f5',
                                borderBottomWidth: '1px',
                              }}
                              value={
                                !isFinite(
                                  values.operatingExpenses[i]
                                    .percentage_of_gross
                                ) ||
                                isNaN(
                                  values.operatingExpenses[i]
                                    .percentage_of_gross
                                )
                                  ? '0.00 %'
                                  : `${values.operatingExpenses[i].percentage_of_gross === '' ? values.operatingExpenses[i].percentage_of_gross : values.operatingExpenses[i].percentage_of_gross + '%'}`
                              }
                              type="text"
                              disabled={true}
                            />
                          </Grid>

                          {values.comparison_basis ==
                            IncomeApproachEnum.UNIT && (
                            <Grid item xs={1} className="pl-[24px]">
                              <StyledField
                                label={
                                  <span className="font-semibold">$/UNIT</span>
                                }
                                name={`operatingExpenses.${i}.total_per_unit`}
                                style={{
                                  background: '#f5f5f5',
                                  borderBottomWidth: '1px',
                                }}
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                  const input: any =
                                    parseFloat(e.target.value) || 0;
                                  handleInputChange(
                                    handleChange,
                                    `operatingExpenses.${i}.total_per_unit`,
                                    input.toString()
                                  );
                                }}
                                value={
                                  values.operatingExpenses[i].total_per_unit
                                }
                                type="text"
                              />
                            </Grid>
                          )}
                          {values.comparison_basis ===
                            IncomeApproachEnum.BED && (
                            <Grid item xs={1} className="pl-[24px]">
                              <StyledField
                                label={
                                  <span className="font-semibold">$/BED</span>
                                }
                                name={`operatingExpenses.${i}.total_per_bed`}
                                style={{
                                  background: '#f5f5f5',
                                  borderBottomWidth: '1px',
                                }}
                                value={
                                  isNaN(
                                    values.operatingExpenses[i].total_per_bed
                                  )
                                    ? ''
                                    : values.operatingExpenses[i].total_per_bed
                                }
                                type="text"
                              />
                            </Grid>
                          )}

                          <Grid
                            item
                            xs={
                              values.comparison_basis === IncomeApproachEnum.SF
                                ? 1
                                : 1
                            }
                            className="pl-[24px]"
                          >
                            <StyledField
                              label={
                                <span className="font-semibold">$/SF</span>
                              }
                              name={`operatingExpenses.${i}.total_per_sq_ft`}
                              style={{
                                background: '#f5f5f5',
                                borderBottomWidth: '1px',
                              }}
                              value={
                                isNaN(
                                  values.operatingExpenses[i].total_per_sq_ft
                                )
                                  ? ''
                                  : values.operatingExpenses[i].total_per_sq_ft
                              }
                              type="text"
                              disabled={true}
                            />
                          </Grid>

                          <Grid item xs={2} className="pl-[24px]">
                            <StyledField
                              label={
                                <span className="font-semibold">COMMENTS</span>
                              }
                              name={`operatingExpenses.${i}.comments`}
                              style={{
                                background: '#f5f5f5',
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
                            />
                          </Grid>
                          <Grid item xs={1}>
                            <div
                              onClick={() => {
                                const removedAmount =
                                  parseFloat(
                                    values.operatingExpenses[
                                      i
                                    ].annual_amount.replace(/,/g, '')
                                  ) || 0;
                                const removedEgi =
                                  parseFloat(
                                    values.operatingExpenses[
                                      i
                                    ].percentage_of_gross.replace(/,/g, '')
                                  ) || 0;
                                const removedSf =
                                  parseFloat(
                                    values.operatingExpenses[
                                      i
                                    ].total_per_sq_ft.replace(/,/g, '')
                                  ) || 0;
                                arrayHelpers.remove(i);
                                setTotalAnnualAmount(
                                  (prevTotal) => prevTotal - removedAmount
                                );
                                setTotalEgi(
                                  (prevTotal) => prevTotal - removedEgi
                                );
                                setTotalSf(
                                  (prevTotal) => prevTotal - removedSf
                                );

                                const netIncome =
                                  getEffectiveIncome - totalAnnualAmount;
                                setNetOperInc(netIncome);

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
                                } else if (values.comparison_basis === 'Unit') {
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
                            >
                              <Icons.RemoveCircleOutlineIcon className="text-red-500 cursor-pointer" />
                            </div>
                          </Grid>
                        </>
                      );
                    })
                  : null}

                <Grid item xs={12}>
                  <div
                    className="cursor-pointer"
                    onClick={() =>
                      arrayHelpers.insert(values.operatingExpenses.length, {
                        name: '',
                        annual_amount: '',
                        percentage_of_gross: '',
                        total_per_sq_ft: '',
                        comments: '',
                      })
                    }
                  >
                    <div className="flex text-[#0da1c7]">
                      <span>
                        <Icons.AddCircleOutlineIcon className="cursor-pointer" />
                      </span>
                      <span className="mt-[3px] pl-2">
                        New Opearating Expense
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
            <div className="font-semibold text-sm">TOTAL EXPENSE</div>
          </Grid>
          <Grid item xs={2}></Grid>
          <Grid item xs={2} className="pl-[24px]">
            <div className="font-semibold text-sm">
              ${formatCurrency(totalAnnualAmount)}
            </div>
          </Grid>

          <Grid item xs={2} className="pl-[24px]">
            <div className="font-semibold text-sm">
              {totalEgi == Infinity ? '0.00' : formatCurrency(totalEgi)}%
            </div>
          </Grid>

          {values.comparison_basis == 'Unit' && (
            <Grid item xs={1} className="pl-[24px]">
              <div className="font-semibold text-sm">
                {formatCurrency(totalOeUnit)} UNIT
              </div>
              <div className="text-xs">Total</div>
            </Grid>
          )}

          {values.comparison_basis === 'Bed' && (
            <Grid item xs={1} className="pl-[24px]">
              <div className="font-semibold text-sm">
                {formatCurrency(totalOeBed)} UNIT
              </div>
              <div className="text-xs">Total</div>
            </Grid>
          )}

          <Grid item xs={2} className="pl-[24px]">
            <div className="font-semibold text-sm">
              ${formatCurrency(totalSf)}
            </div>
          </Grid>
          <Grid item xs={2}></Grid>
        </Grid>

        <Grid container spacing={2} columns={13} className="px-2 w-full">
          <Grid item xs={2} className="pt-[7px] pl-[24px]">
            <div className="mt-3 font-semibold text-sm">
              NET OPERATING INCOME
            </div>
          </Grid>
          <Grid item xs={2}></Grid>
          <Grid item xs={2} className="pt-[16px] pl-[24px]">
            <div className="font-semibold text-sm">
              ${formatCurrency(netOperInc)}
            </div>
          </Grid>
          <Grid item xs={6}></Grid>
        </Grid>

        <Grid
          container
          spacing={2}
          columns={13}
          className="mt-[10px] px-2 w-full"
        >
          <Grid item xs={2} className="pt-[7px] pl-[24px]">
            <div className="mt-3 font-semibold text-sm">EXPENSE NOTES</div>
          </Grid>
          <Grid item xs={4}>
            <TextAreaField label="" name="expense_notes" />
          </Grid>
          <Grid item xs={6}></Grid>
        </Grid>
      </div>
    </>
  );
};
