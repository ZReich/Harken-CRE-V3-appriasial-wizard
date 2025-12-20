import { Tooltip, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import StyledField from '@/components/styles/StyleFieldEditComp';
import { useEffect, useState } from 'react';
import { FieldArray, useFormikContext, Field } from 'formik';
import { IncomeApprochType } from '@/components/interface/Income-approch-type';
import { Icons } from '@/components/icons';
import {
  handleInputChange,
  sanitizeInputDollarSignComps2,
} from '@/utils/sanitize';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { IncomeApproachEnum } from '../Enum/AppraisalEnum';
import Depreciation from './Depreciation';
export const CostImprovement = ({
  updateData,
  totalSqft,
  totalAdjustedCost,
  setTotalAdjustedCost,
}: any) => {
  const { values, setFieldValue, handleChange } =
    useFormikContext<IncomeApprochType>();
  const [, setTotalSf] = useState(0);
  const [totalDepreciation, setTotalDepreciation] = useState<any>();
  const [totalAdjustedppsf, setTotalAdjustedppsf] = useState<any>();

  useEffect(() => {
    if (values?.improvements) {
      const sf_adjusted_psf = values?.improvements?.map((ele: any) => {
        return {
          sf_area: ele?.sf_area,
          adjusted_psf:
            ele?.adjusted_psf === '' || ele?.adjusted_psf === null
              ? 0
              : parseFloat(String(ele?.adjusted_psf)?.replace(/,/g, '')),
        };
      });
      const total = sf_adjusted_psf?.reduce((sum: any, item: any) => {
        return sum + item.sf_area * item.adjusted_psf;
      }, 0);
      setFieldValue('overall_replacement_cost', total);
      const sf_adjusted_psf_depreciation = values?.improvements?.map(
        (ele: any) => {
          return {
            sf_area: ele?.sf_area,
            adjusted_psf:
              ele?.adjusted_psf === ''
                ? 0
                : parseFloat(String(ele?.adjusted_psf)?.replace(/,/g, '')),
            depreciation:
              ele?.depreciation === ''
                ? 0
                : parseFloat(String(ele?.depreciation)?.replace(/,/g, '')),
          };
        }
      );
      const totalDepreciationValue = sf_adjusted_psf_depreciation?.reduce(
        (sum: any, item: any) => {
          const value =
            item.sf_area * item.adjusted_psf * (item.depreciation / 100);
          return sum + value;
        },
        0
      );
      const total_depreciation = (totalDepreciationValue / total) * 100;
      setTotalDepreciation(total_depreciation);
      setFieldValue('improvements_total_depreciation', total_depreciation);
      const total_adjusted_ppsf = totalAdjustedCost / totalSqft;
      setTotalAdjustedppsf(total_adjusted_ppsf);
      setFieldValue('improvements_total_adjusted_ppsf', total_adjusted_ppsf);
      const adjustedCost = values?.improvements?.map((ele) => {
        return {
          adjusted_cost: ele?.adjusted_cost,
        };
      });
      const totalAdjustedCost1 = adjustedCost?.reduce((sum, item) => {
        return sum + (item.adjusted_cost || 0);
      }, 0);
      setTotalAdjustedCost(totalAdjustedCost1);
    }
  }, [values?.improvements, totalAdjustedppsf]);

  useEffect(() => {
    if (values.improvements?.length) {
      const totalSquareFootage = values.improvements.reduce(
        (total, ele: any) => {
          return total + (parseFloat(ele.sf_area) || 0);
        },
        0
      );

      setTotalSf(totalSquareFootage);
      const totalUnit = values.improvements.reduce((acc, elem) => {
        return acc + (parseFloat(elem.unit) || 0);
      }, 0);
      setFieldValue(IncomeApproachEnum.TOTAL_UNIT, totalUnit);

      let totalAdjustedCostValue = 0;
      let totalAdjustedPPSFValue = 0;

      values.improvements.forEach((item) => {
        const { depreciation, adjusted_psf, sf_area } = item;
        if (adjusted_psf && depreciation && sf_area) {
          const value =
            Number(item.adjusted_psf) *
            Number(sf_area) *
            (1 - depreciation / 100);
          totalAdjustedCostValue += value;
          totalAdjustedPPSFValue += Number(adjusted_psf);
        }
      });
      setFieldValue('improvements_total_adjusted_cost', totalAdjustedCostValue);
      setFieldValue('improvements_total_adjusted_ppsf', totalAdjustedPPSFValue);
    }
  }, [values.improvements]);
  return (
    <>
      <Typography
        variant="h6"
        component="h5"
        className="text-base font-bold"
      ></Typography>
      <div
        style={{
          width: '100%',
          border: '1px solid #eee',
          backgroundColor: '#f5f5f5',
          marginTop: '10px',
        }}
      >
        <Grid container spacing={2} columns={13} className="px-2 w-full">
          <Grid container spacing={2} className="mt-[20px] w-full items-end">
            <Grid item xs={4} className="pl-6 mt-2">
              <div className="mb-4 w-full pl-6">
                <label className="block text-sm font-semibold text-black mb-1">
                  YEAR BUILT
                </label>
                <StyledField
                  label
                  name="properties.year_built"
                  style={{
                    background: '#f5f5f5',
                    borderBottom: '1px solid #ccc',
                    width: '100%',
                  }}
                  value={values.year_built}
                  type="text"
                  disabled={true}
                />
              </div>
            </Grid>
            <Grid item xs={4} className="pl-6 mt-2">
              <div className="mb-4 w-full">
                <label className="block text-sm font-semibold text-black mb-1">
                  YEAR REMODELED
                </label>
                <StyledField
                  label
                  name="properties.year_remodeled"
                  style={{
                    background: '#f5f5f5',
                    borderBottom: '1px solid #ccc',
                    width: '100%',
                  }}
                  value={values.year_remodeled}
                  type="text"
                  disabled={true}
                />
              </div>
            </Grid>
            <Grid item xs={4} className="pl-6 mt-2">
              <div className="mb-4 w-full">
                <label
                  htmlFor="monthly_capitalization_rate"
                  className="block text-sm font-semibold text-black mb-1"
                >
                  EFFECTIVE AGE (YEARS)
                </label>
                <Field
                  name="effective_age"
                  type="text"
                  // placeholder="0.00"
                  // onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  //   const input = e.target.value;
                  //   setFieldValue(`effective_age`, input === '' ? '' : input);
                  // }}
                  // value={values.effective_age ? values?.effective_age : '0.00'}
                  onKeyDown={(e: React.KeyboardEvent) => {
                    const event = e as React.KeyboardEvent<HTMLInputElement>;
                    const isBack = e.code === 'Backspace';
                    if (isBack) {
                      const inputElement = event.currentTarget;
                      const { selectionStart, selectionEnd } = inputElement;
                      const input = values?.effective_age
                        .toString()
                        .replace(/[^\d]/g, '');

                      if (
                        selectionStart === 0 &&
                        selectionEnd === inputElement.value.length
                      ) {
                        handleInputChange(handleChange, 'effective_age', '');
                        event.preventDefault();
                      } else if (input.length > 0) {
                        const newValue = input.slice(0, -1);
                        const shiftedValue = newValue
                          ? parseInt(newValue, 10) / 100
                          : 0; // Handle empty input by setting it to 0
                        handleInputChange(
                          handleChange,
                          'effective_age',
                          `${shiftedValue.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`
                        );
                        event.preventDefault();
                      } else {
                        handleInputChange(
                          handleChange,
                          'effective_age',
                          '0.00'
                        ); // Set it to 0.00 if the input is empty
                      }
                    }
                  }}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const input = sanitizeInputDollarSignComps2(e.target.value);
                    handleInputChange(handleChange, 'effective_age', input);
                  }}
                  value={values.effective_age ? values?.effective_age : '0.00'}
                  className="py-1 px-3 border-x-0 border-t-0 border-b border-gray-300 focus:border-indigo-500 focus:outline-none w-full"
                />
              </div>
            </Grid>
          </Grid>
        </Grid>
      </div>

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
          className="mt-[10px] px-6 w-full"
        >
          <FieldArray
            name="improvements"
            render={(arrayHelpers) => {
              const totalValues = {
                adjustedCosts: 0,
                sf_area: 0,
              };

              values?.improvements?.forEach((item) => {
                if (item?.adjusted_cost && item?.sf_area) {
                  totalValues.adjustedCosts =
                    +totalValues.adjustedCosts + +item?.adjusted_cost;
                  totalValues.sf_area = +totalValues.sf_area + +item?.sf_area;
                }
              });
              return (
                <>
                  <Grid
                    container
                    spacing={1}
                    className="w-full font-bold text-black items-end"
                  >
                    <Grid item xs={3} className="pl-[24px] break-all">
                      TYPE
                    </Grid>
                    <Grid item xs={2} className="pl-[24px] break-all">
                      SF.AREA
                    </Grid>
                    <Grid item xs={2} className="pl-[24px] break-all">
                      ADJUSTED PPSF
                    </Grid>
                    <Grid item xs={2} className="pl-[24px] break-all">
                      <div className="flex items-center">
                        <span>DEPRECIATION</span>
                        <Tooltip
                          title={<Depreciation />}
                          className="cursor-pointer"
                          placement="right"
                        >
                          <ErrorOutlineIcon className="text-sm ml-2" />
                        </Tooltip>
                      </div>
                    </Grid>
                    <Grid item xs={2} className="pl-[24px] break-all">
                      ADJUSTED COST
                    </Grid>
                    <Grid item xs={1} className="pl-[24px] break-all"></Grid>
                  </Grid>
                  {values?.improvements?.length > 0 &&
                    values.improvements.map((zone: any, i) => {
                      const adjustedPPSF =
                        parseFloat(
                          String(zone?.adjusted_psf)?.replace(/,/g, '')
                        ) || 0;
                      const sfArea = parseFloat(zone.sf_area) || 0;
                      const depreciationPercentage =
                        parseFloat(zone.depreciation) || 0;
                      const adjustedCost =
                        sfArea *
                        adjustedPPSF *
                        (1 - depreciationPercentage / 100);
                      if (values.improvements[i].adjusted_cost) {
                        if (
                          adjustedCost !== values.improvements[i].adjusted_cost
                        ) {
                          setFieldValue(
                            `improvements.${i}.adjusted_cost`,
                            adjustedCost
                          );
                        }
                      } else if (
                        !values.improvements[i].adjusted_cost &&
                        adjustedCost
                      ) {
                        setFieldValue(
                          `improvements.${i}.adjusted_cost`,
                          adjustedCost
                        );
                      }

                      // values.improvements[i].adjusted_cost = adjustedCost;
                      return (
                        <Grid
                          container
                          spacing={1}
                          key={i}
                          className="w-full mt-1 items-end"
                        >
                          <Grid item xs={3} className="pl-[24px] break-all">
                            <StyledField
                              name={`improvements.${i}.type`}
                              style={{
                                background: '#f5f5f5',
                                borderBottomWidth: '1px',
                              }}
                              type="text"
                              onChange={(e) => {
                                const input = e.target.value;
                                setFieldValue(`improvements.${i}.type`, input);
                              }}
                              value={values?.improvements[i]?.type}
                              disabled={zone?.zoning_id}
                            />
                          </Grid>
                          <Grid item xs={2} className="pl-[24px] break-all">
                            <StyledField
                              name={`improvements.${i}.sf_area,`}
                              style={{
                                background: '#f5f5f5',
                                borderBottomWidth: '1px',
                              }}
                              type="text"
                              onChange={(e: any) => {
                                const input = e.target.value;
                                const input1 = input.replace(/[^0-9.]/g, '');
                                const numericValue = parseFloat(input1);
                                if (!isNaN(numericValue)) {
                                  const formattedInput =
                                    numericValue.toLocaleString('en-US', {
                                      maximumFractionDigits: 2,
                                    });
                                  setFieldValue(
                                    `improvements.${i}.sf_area`,
                                    numericValue
                                  );
                                  e.target.value = formattedInput;
                                } else {
                                  setFieldValue(
                                    `improvements.${i}.sf_area`,
                                    ''
                                  );
                                  e.target.value = '';
                                }
                              }}
                              value={
                                values?.improvements[i]?.sf_area
                                  ? Number(
                                      values?.improvements[i]?.sf_area
                                    ).toLocaleString('en-US', {
                                      maximumFractionDigits: 2,
                                    })
                                  : null
                              }
                              disabled={zone?.zoning_id}
                            />
                          </Grid>
                          <Grid item xs={2} className="pl-[24px] break-all">
                            <div className="mb-0 w-full">
                              <Field
                                name={`improvements.${i}.adjusted_psf`}
                                type="text"
                                className="py-1 px-3 border-x-0 border-t-0 border-b border-gray-300 focus:outline-none w-full"
                                onKeyDown={(e: React.KeyboardEvent) => {
                                  const event =
                                    e as React.KeyboardEvent<HTMLInputElement>;
                                  const isBack = e.code === 'Backspace';
                                  if (isBack) {
                                    const inputElement = event.currentTarget;
                                    const { selectionStart, selectionEnd } =
                                      inputElement;
                                    const input = values?.improvements[
                                      i
                                    ]?.adjusted_psf
                                      .toString()
                                      .replace(/[^\d]/g, '');

                                    if (
                                      selectionStart === 0 &&
                                      selectionEnd === inputElement.value.length
                                    ) {
                                      handleInputChange(
                                        handleChange,
                                        `improvements.${i}.adjusted_psf`,
                                        ''
                                      );
                                      event.preventDefault();
                                    } else if (input.length > 0) {
                                      const newValue = input.slice(0, -1);
                                      const shiftedValue = newValue
                                        ? parseInt(newValue, 10) / 100
                                        : 0; // Handle empty input by setting it to 0
                                      handleInputChange(
                                        handleChange,
                                        `improvements.${i}.adjusted_psf`,
                                        `${shiftedValue.toLocaleString(
                                          undefined,
                                          {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          }
                                        )}`
                                      );
                                      event.preventDefault();
                                    } else {
                                      handleInputChange(
                                        handleChange,
                                        `improvements.${i}.adjusted_psf`,
                                        '0.00'
                                      ); // Set it to 0.00 if the input is empty
                                    }
                                  }
                                }}
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                  const input = sanitizeInputDollarSignComps2(
                                    e.target.value
                                  );
                                  handleInputChange(
                                    handleChange,
                                    `improvements.${i}.adjusted_psf`,
                                    input
                                  );
                                }}
                                value={values?.improvements[i]?.adjusted_psf}
                              />
                            </div>
                          </Grid>
                          <Grid item xs={2} className="pl-[24px] break-all">
                            <div className="mb-0 w-full">
                              <div className="relative">
                                {/* <Field
                                  name={`improvements.${i}.depreciation`}
                                  type="text"
                                  className="py-2 px-3 border-x-0 border-t-0 border-b border-gray-300 focus:outline-none w-full pr-8"
                                  onKeyDown={(e: React.KeyboardEvent) => {
                                    const event =
                                      e as React.KeyboardEvent<HTMLInputElement>;
                                    const isBack = e.code === 'Backspace';
                                    if (isBack) {
                                      const inputElement = event.currentTarget;
                                      const { selectionStart, selectionEnd } =
                                        inputElement;
                                      const input =
                                        values?.improvements[
                                          i
                                        ].depreciation
                                          .toString()
                                          .replace(/[^\d]/g, '');

                                      if (
                                        selectionStart === 0 &&
                                        selectionEnd ===
                                        inputElement.value.length
                                      ) {
                                        handleInputChange(
                                          handleChange,
                                          `improvements.${i}.depreciation`,
                                          ''
                                        );
                                        event.preventDefault();
                                      } else if (input.length > 0) {
                                        const newValue = input.slice(0, -1);
                                        const shiftedValue = newValue
                                          ? parseInt(newValue, 10) / 100
                                          : 0;
                                        handleInputChange(
                                          handleChange, `improvements.${i}.depreciation`,
                                          `${shiftedValue.toLocaleString(
                                            undefined,
                                            // {
                                            //   minimumFractionDigits: 2,
                                            //   maximumFractionDigits: 2,
                                            // }
                                          )}`
                                        );
                                        event.preventDefault();
                                      }

                                      else {
                                        const input =
                                          values?.improvements[
                                            i
                                          ].depreciation.toString().replace(/[^\d]/g, '')

                                        const inpArr = Array.from(input);
                                        inpArr.pop();
                                        handleInputChange(
                                          handleChange,
                                          `improvements.${i}.depreciation`,
                                          inpArr.join('')
                                        );
                                      }
                                    }
                                  }}
                                  onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                  ) => {
                                    const input = e.target.value;
                                    handleInputChange(
                                      handleChange,
                                      `improvements.${i}.depreciation`,
                                      input.replace(/%/g, '')
                                    );
                                  }}
                                  value={sanitizeInputPercentage(
                                    values?.improvements[i]?.depreciation
                                  )
                                  }
                                /> */}
                                <Field
                                  name={`improvements.${i}.depreciation`}
                                  type="text"
                                  className="py-1 px-3 border-x-0 border-t-0 border-b border-gray-300 focus:outline-none w-full pr-8"
                                  onKeyDown={(e: React.KeyboardEvent) => {
                                    const event =
                                      e as React.KeyboardEvent<HTMLInputElement>;
                                    const isBack = e.code === 'Backspace';

                                    if (isBack) {
                                      const inputElement = event.currentTarget;
                                      const { selectionStart, selectionEnd } =
                                        inputElement;
                                      let rawValue =
                                        values?.improvements[i]?.depreciation ||
                                        '';

                                      // Remove all non-numeric characters to work with raw number input
                                      rawValue = rawValue
                                        .toString()
                                        .replace(/[^\d.]/g, '');

                                      if (
                                        selectionStart === 0 &&
                                        selectionEnd ===
                                          inputElement.value.length
                                      ) {
                                        // If entire value is selected and backspace is pressed, clear the field
                                        handleInputChange(
                                          handleChange,
                                          `improvements.${i}.depreciation`,
                                          ''
                                        );
                                        event.preventDefault();
                                      } else if (rawValue.length > 0) {
                                        // If backspace is pressed and there's input, remove the last character
                                        const newValue = rawValue.slice(0, -1);
                                        handleInputChange(
                                          handleChange,
                                          `improvements.${i}.depreciation`,
                                          newValue
                                        );
                                        event.preventDefault();
                                      }
                                    }
                                  }}
                                  onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                  ) => {
                                    let input = e.target.value.replace(
                                      /[%]/g,
                                      ''
                                    ); // Remove % for easier typing

                                    // Remove leading zeros except for '0.'
                                    if (
                                      input.startsWith('0') &&
                                      input.length > 1 &&
                                      !input.startsWith('0.')
                                    ) {
                                      input = input.replace(/^0+/, ''); // Remove leading zeros
                                    }

                                    // Only allow numeric input with up to two decimal places
                                    if (/^\d*\.?\d{0,2}$/.test(input)) {
                                      handleInputChange(
                                        handleChange,
                                        `improvements.${i}.depreciation`,
                                        input
                                      );
                                    }
                                  }}
                                  value={
                                    values?.improvements[i]?.depreciation
                                      ? `${values.improvements[i].depreciation}%` // Format the input as percentage
                                      : ''
                                  }
                                />
                              </div>
                            </div>
                          </Grid>
                          <Grid item xs={2} className="pl-[24px] break-all">
                            <StyledField
                              name={`improvements.${i}.adjusted_cost`}
                              style={{
                                background: '#f5f5f5',
                                borderBottomWidth: '1px',
                              }}
                              type="text"
                              value={`$${adjustedCost?.toLocaleString(
                                undefined,
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )}`}
                              disabled={updateData}
                            />
                          </Grid>
                          {!zone?.zoning_id && (
                            <Grid item xs={1} className="pl-[24px] break-all">
                              <div onClick={() => arrayHelpers.remove(i)}>
                                <Icons.RemoveCircleOutlineIcon className="text-red-500 cursor-pointer" />
                              </div>
                            </Grid>
                          )}
                        </Grid>
                      );
                    })}
                  <Grid
                    container
                    spacing={3}
                    columns={12}
                    className="w-full mt-1"
                  >
                    <Grid item xs={3} className="pt-[10px] pl-[24px] break-all">
                      <div className="font-semibold text-sm flex justify-center items-center"></div>
                    </Grid>

                    <Grid item xs={2} className="pt-[10px] pl-[24px] break-all">
                      <div className="font-semibold text-sm ml-[20px]">
                        {totalSqft ? totalSqft?.toLocaleString() : ''}
                      </div>
                    </Grid>
                    {/* totalValue */}
                    <Grid item xs={2} className="pt-[10px] pl-[24px] break-all">
                      <div className="font-semibold text-sm ml-[20px]">
                        $
                        {totalAdjustedppsf
                          ? totalAdjustedppsf?.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : '0.00'}
                      </div>
                    </Grid>

                    <Grid item xs={2} className="pt-[10px] pl-[24px] break-all">
                      <div className="font-semibold text-sm ml-[20px]">
                        {totalDepreciation
                          ? totalDepreciation?.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }) + '%'
                          : '0.00%'}
                      </div>
                    </Grid>

                    <Grid item xs={2} className="pt-[10px] pl-[24px] break-all">
                      <div className="font-semibold text-sm ml-[20px]">
                        $
                        {totalAdjustedCost
                          ? totalAdjustedCost?.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : '0.00'}
                      </div>
                    </Grid>
                  </Grid>
                  <Grid item xs={2}>
                    <div
                      className="cursor-pointer"
                      onClick={() =>
                        arrayHelpers.push({
                          type: '',
                          monthly_income: '',
                          improvements_total_adjusted_ppsf: '',
                          depreciation: 0,
                          adjusted_cost: 0,
                          isEditable: true,
                          sf_area: 0,
                          adjusted_psf: 0,
                          structure_cost: '',
                          depreciation_amount: '',
                          zoning_id: '',
                        })
                      }
                    >
                      <div className="information-content">
                        <div className="flex text-[#0da1c7]">
                          <span>
                            <Icons.AddCircleOutlineIcon className="cursor-pointer" />
                          </span>
                          <span className="mt-[3px] pl-2 whitespace-nowrap">
                            New Improvement
                          </span>
                        </div>
                      </div>
                    </div>
                  </Grid>
                </>
              );
            }}
          />
        </Grid>
      </div>
    </>
  );
};
