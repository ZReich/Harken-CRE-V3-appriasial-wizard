import {
  conditionOptions,
  //   frontageOptions,
  hospitalityOptions,
  industrialOptions,
  multifamilyOptions,
  officeOptions,
  propertyOptions,
  residentialOptions,
  retailOptions,
  specialOptions,
  topographyOptions,
  //   utilitiesOptions,
} from '@/pages/comps/create-comp/SelectOption';
import { useFormikContext } from 'formik';
import defaultPropertImage from '../../../images/default-placeholder.png';

import { useState, useEffect } from 'react';
import { Icons } from '@/components/icons';
import DeleteApproachConfirmationModal from '@/pages/comps/Listing/delete-approach-confirmation';
import { TextField } from '@mui/material';
import SelectTextField from '@/components/styles/select-input';
import { options, usa_state } from '@/pages/comps/comp-form/fakeJson';
// import { APPROACHESENUMS } from '@/pages/comps/enum/ApproachEnums';
import {
  capitalizeWords,
  formatPrice,
  formatValue,
  sanitizeInputDollarSignComps,
} from '@/utils/sanitize';
import { Link, useSearchParams } from 'react-router-dom';
import CompsPropertyComparitiveAttributes from '@/utils/comps-property-comparitive.attributes';
// function to calculate comps data
export const calculateCompData = ({
  total,
  weight,
  comp,
  appraisalData,
}: any) => {
  const price_square_foot = comp.price_square_foot;
  const landWithAcre = parseFloat((comp.land_size / 43560).toFixed(3)); // Round to 3 decimal places
  const landPricePerUnit = comp.sale_price / landWithAcre;
  const updatedAdjustedPsf =
    appraisalData.land_dimension === 'ACRE'
      ? (total / 100) * landPricePerUnit + landPricePerUnit
      : ((total / 100) * comp.sale_price) / comp.land_size +
        comp.sale_price / comp.land_size;
  const updatedAverageAdjustedPsf = (updatedAdjustedPsf * weight) / 100;
  const updatedBlendedPsf = (price_square_foot * weight) / 100;

  return {
    adjusted_psf: updatedAdjustedPsf,
    averaged_adjusted_psf: updatedAverageAdjustedPsf,
    blended_adjusted_psf: updatedBlendedPsf,
    weight,
    total,
  };
};
export const calculateAdjustedMonthlyValue = (
  values: any,
  index: number,
  appraisalData: any
) => {
  const avgMonthlyRent =
    values?.tableData[index]?.avg_monthly_rent ||
    values?.tableData[index]?.property_units?.[0]?.avg_monthly_rent ||
    0;
  const total = values?.tableData[index]?.total || 0;
  console.log(avgMonthlyRent, 'avgMonthlyRent');

  return appraisalData?.comp_adjustment_mode === 'Dollar'
    ? total + avgMonthlyRent
    : (avgMonthlyRent * total) / 100 + avgMonthlyRent;
};

export const getExpensesTotal = (
  expenses: any,
  expenseIndex: any,
  newExpenseValue: any
) => {
  let total: number = 0;

  if (expenseIndex !== 'undefined') {
    const exp = expenses[expenseIndex];

    if (exp) {
      exp.adj_value = newExpenseValue;
      expenses[expenseIndex] = exp;
    }
  }

  expenses?.forEach((exp: { adj_value: any }) => {
    // total += parseFloat(exp.adj_value);
    total += exp.adj_value != '-' ? parseFloat(exp.adj_value) : 0;
  });

  return { total, expenses };
};

function EvaluationMUltiFamilyCompCard({
  index,
  item,
  values,
  // totalCards,
  handleDelete,
  // dimension,
  handleNavigateToComp,
  appraisalData,
}: {
  item: any;
  handleChange: any;
  values: any;
  totalCards: number;
  index: any;
  dimension: any;
  handleNavigateToComp: any;
  handleDeleteComp: any;
  appraisalData: any;

  handleDelete: (id: number) => void;
}) {
  // Calculate adjusted monthly value

  // Calculate adjusted monthly value using the helper function
  const adjustedMonthlyValue = calculateAdjustedMonthlyValue(
    values,
    index,
    appraisalData
  );
  const compIncludedUtilities = item?.comps_included_utilities
    ?.map((ele: any) => ele.utility)
    ?.join(', ');
  // Store the value in tableData and localStorage
  useEffect(() => {
    // Store in tableData
    // setValues((oldValues: { tableData: { [x: string]: any } }) => {
    setValues((oldValues: { tableData: any }) => {
      if (oldValues.tableData[index]) {
        const updatedTableData = [...oldValues.tableData];
        updatedTableData[index] = {
          ...updatedTableData[index],
          adjusted_montly_val: adjustedMonthlyValue,
        };
        return { ...oldValues, tableData: updatedTableData };
      }
      return oldValues;
    });

    // Store in localStorage
    const existingValues = localStorage.getItem('totalValueMultiFamily');
    const valuesArray = existingValues ? JSON.parse(existingValues) : [];

    // Update the value at the current index or add it if it doesn't exist
    valuesArray[index] = adjustedMonthlyValue;

    // Save back to localStorage
    localStorage.setItem('totalValueMultiFamily', JSON.stringify(valuesArray));
  }, [
    values?.tableData[index]?.avg_monthly_rent,
    values?.tableData[index]?.total,
    index,
  ]);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const stateMap = usa_state[0]; // Extract the first object from the array
  // State to manage modal visibility
  const fullStateName = stateMap[item?.state];
  console.log('checkproperty', item);
  // Function to open the modal
  const openDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  // Function to close the modal
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };
  // const [error, setError] = useState('');

  const { setValues } = useFormikContext<any>();

  //   const landSizeAcreValue =
  //     item.land_dimension === 'ACRE'
  //       ? item.land_size
  //       : (item.land_size / 43560).toFixed(3);

  let total = 0;
  item.expenses?.forEach((exp: any) => {
    const expNum = exp.comparison_basis
      ? +exp.comparison_basis.split('%')[0]
      : 0;
    total += expNum;
  });

  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const evaluationId = searchParams.get('evaluationId');
  const getLabelFromValue = (value: any) => {
    // If the value is empty, null, or '--Select a Subtype--', return an empty string
    if (!value || value === '--Select a Subtype--') {
      return '';
    }

    const allOptions = [
      ...propertyOptions,
      ...retailOptions,
      ...officeOptions,
      ...industrialOptions,
      ...multifamilyOptions,
      ...hospitalityOptions,
      ...specialOptions,
      ...residentialOptions,
      ...conditionOptions,
      ...topographyOptions,
    ];
    console.log('checkvalues', values);
    // Check if value matches any of the options
    const option = allOptions.find((option) => option.value === value);
    if (option) {
      return option.label; // Return matched label
    }

    // If no match, capitalize the first letter of each word
    return capitalizeWords(value);
  };

  // Example usage:
  return (
    <div className="flex flex-col w-[15.5%]">
      <h3 className="py-5 text-base capitalize invisible font-semibold">
        Subject Property
      </h3>
      <div key={item.id} className="bg-[#fafafa] flex-1">
        <div className="max-w-full h-[160px]">
          <img
            className="w-full h-[160px] object-cover"
            src={
              item.property_image_url
                ? import.meta.env.VITE_S3_URL + item.property_image_url
                : defaultPropertImage
            }
            onError={({ currentTarget }) => {
              currentTarget.onerror = null;
              currentTarget.src = defaultPropertImage;
            }}
            alt="building img"
          />
        </div>
        <div className="p-2">
          <div className="flex h-[20px] gap-2 items-center">
            <Link
              to={`/evaluation/update-multi-family-comps/${item.comp_id}/${id}/multiFamily/${evaluationId}`}
              className="flex"
            >
              <Icons.VisibleIcon
                onClick={() => handleNavigateToComp(item.comp_id)}
                style={{ color: 'rgb(13 161 199)', fontSize: '17px' }}
                className="cursor-pointer"
              />
            </Link>

            <Icons.DeleteIcon
              style={{ fontSize: '15px' }}
              className="cursor-pointer text-red-500"
              onClick={openDeleteModal} // Open the confirmation modal
            />
          </div>
          {isDeleteModalOpen && (
            <DeleteApproachConfirmationModal
              close={closeDeleteModal} // Close modal function
              deleteId={index} // Pass the index or item ID
              setArrayAfterDelete={() => {
                handleDelete(index); // Execute the delete function after confirmation
                closeDeleteModal(); // Close the modal after deletion
              }}
            />
          )}
          <div className="min-h-[40px] mt-2">
            <h2 className="text-gray-500 text-xs font-bold overflow-hidden whitespace-nowrap text-ellipsis">
              {item.street_address || 'No address available'}
            </h2>
            <h2 className="text-gray-500 text-xs font-bold overflow-hidden whitespace-nowrap text-ellipsis">
              {item.city ? item.city + ', ' : ''}
              {item.state ? item.state.toUpperCase() + ', ' : ''}
              {item.zipcode || ''}
            </h2>
          </div>
          {/* <p className="text-xs text-[#687F8B] pb-1 font-medium overflow-hidden whitespace-nowrap text-ellipsis">
            {item.date_sold
              ? new Intl.DateTimeFormat('en-US', {
                  month: '2-digit',
                  day: '2-digit',
                  year: 'numeric', // Ensure the full year is shown
                }).format(
                  new Date(
                    new Date(item.date_sold).toLocaleString('en-US', {
                      timeZone: 'UTC',
                    })
                  )
                )
              : 'No date available'}
          </p> */}
        </div>
        <div className="p-2 flex flex-col gap-[2px] border-solid border-b border-l-0 border-r-0 border-t border-[#d5d5d5]">
          <p
            className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap"
            style={{ marginTop: '10px' }}
          >
            {getLabelFromValue(item.zonings?.[0]?.zone || '')} /{' '}
            {getLabelFromValue(item.zonings?.[0]?.sub_zone || '')}{' '}
          </p>
          <select
            className="text-gray-500 !m-0 text-xs font-medium h-[18px] w-full bg-transparent border border-gray-200 rounded px-1 cursor-pointer appearance-none"
            defaultValue=""
            value={values?.tableData[index]?.property_unit_id || ''}
            onChange={(e) => {
              const selectedUnitId = e.target.value;
              const selectedUnit = item.property_units?.find(
                (unit: any) => unit.id.toString() === selectedUnitId
              );

              // Find the rent display paragraph and update its content
              const rentDisplay = document.getElementById(
                `rent-display-${item.id}`
              );
              if (rentDisplay && selectedUnit) {
                const formattedRent = new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(selectedUnit.avg_monthly_rent);

                rentDisplay.textContent = `${formattedRent}`;
                // Store avg_monthly_rent as price_square_foot in values.tableData
                // setValues((oldValues: { tableData: { [x: string]: any } }) => {
                setValues((oldValues: { tableData: any }) => {
                  const updatedTableData = [...oldValues.tableData];
                  updatedTableData[index] = {
                    ...updatedTableData[index],
                    avg_monthly_rent: selectedUnit.avg_monthly_rent,
                    property_unit_id: selectedUnit.id,
                  };
                  return { ...oldValues, tableData: updatedTableData };
                });
              }
            }}
          >
            <option value="" disabled>
              Select Unit
            </option>
            {item.property_units &&
              item.property_units.map((unit: any) => (
                <option key={unit.id} value={unit.id}>
                  ({formatValue(unit.sq_ft) + ' ' + 'SF'}){' '}
                  {formatValue(unit.beds)}/{formatValue(unit.baths)}
                </option>
              ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg
              className="fill-current h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>

          <p
            className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap"
            style={{ marginTop: '10px' }}
          >
            {compIncludedUtilities}
          </p>
          {/* <p
            className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap"
            style={{ marginTop: '10px' }}
          >
            {item.parking}
          </p>

          <p className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap">
            {item.year_built ? item.year_built : APPROACHESENUMS.SPACE}
            {item.year_built && item.year_remodeled ? ' / ' : ''}
            {item.year_remodeled ? item.year_remodeled : APPROACHESENUMS.SPACE}
          </p>
          <p className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap">
            {capitalizeWords(item.condition)}
          </p> */}
          <p
            id={`rent-display-${item.id}`}
            className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap"
          >
            {values.tableData[index]?.avg_monthly_rent
              ? new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(values.tableData[index].avg_monthly_rent)
              : item.property_units && item.property_units[0]?.avg_monthly_rent
                ? new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(item.property_units[0].avg_monthly_rent)
                : ''}
          </p>
        </div>
        <div className="p-1 flex flex-col gap-[2px] border-solid border-b border-l-0 border-r-0 border-t border-[#d5d5d5]">
          {values.appraisalSpecificAdjustment?.length > 0 ? (
            <CompsPropertyComparitiveAttributes
              values={values}
              item={item}
              fullStateName={fullStateName}
              getLabelFromValue={getLabelFromValue}
              appraisalData={appraisalData}
            />
          ) : (
            Array.from(
              { length: values.appraisalSpecificAdjustment?.length },
              (_, i) => (
                <p
                  key={i}
                  className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap"
                  style={{ lineHeight: '0rem!important' }}
                >
                  No data
                </p>
              )
            )
          )}
        </div>
        <div className="px-1 mt-2 border-solid border-b border-l-0 border-r-0 border-t-0  border-[#d5d5d5] min-h-[26px]">
          <div className="w-full pb-1">
            {item.expenses?.map((expense: any, expenseIndex: any) => (
              <div key={expense.id} className="subjectPropertyCard h-[18px]">
                {appraisalData?.comp_adjustment_mode === 'Dollar' ? (
                  <div className="flex">
                    <TextField
                      type="text"
                      className="w-1/2 approchTextField [&_.MuiInputBase-formControl]:rounded-none"
                      value={
                        expense.adj_value === '-0'
                          ? sanitizeInputDollarSignComps(-0)
                          : sanitizeInputDollarSignComps(
                              parseFloat(expense.adj_value || 0).toFixed(2)
                            )
                      }
                      onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                        e.target.select();
                      }}
                      onKeyDown={(e) => {
                        // let nStr = expense.adj_value
                        //   ? `${expense.adj_value}`
                        //   : '';

                        let nStr = (e.target as HTMLInputElement).value || '';
                        nStr = nStr.replace(/[^0-9.-]/g, '');

                        // Handle when all the text is selected and backspace is pressed
                        const { selectionStart, selectionEnd }: any = e.target;

                        if (
                          e.keyCode != 9 &&
                          e.keyCode != 39 &&
                          selectionStart === 0 &&
                          selectionEnd >=
                            sanitizeInputDollarSignComps(
                              parseFloat(expense.adj_value).toFixed(2)
                            ).length
                        ) {
                          nStr = '';
                        } else if (e.keyCode === 8) {
                          nStr = nStr.slice(0, -1);
                        } else if (
                          e.key === 'ArrowLeft' ||
                          e.key === 'ArrowRight' ||
                          e.key === 'Backspace'
                        ) {
                          return;
                        } else if (e.key === '-') {
                          // Allow negative sign at the start
                          nStr = nStr.length
                            ? ('-' + nStr)
                                .replace(/-+/g, '-')
                                .replace(/(?!^)-/g, '')
                            : '-0';
                        } else if (!/^[0-9.]$/.test(e.key)) {
                          return;
                        }

                        // Handle decimal point
                        if (e.key === '.' && nStr.includes('.')) {
                          return;
                        }

                        let sanitizedValue =
                          nStr +
                          (e.key === 'Backspace' || e.key === '-' ? '' : e.key);

                        sanitizedValue =
                          sanitizeInputDollarSignComps(sanitizedValue);
                        sanitizedValue = sanitizedValue.replace(
                          /[^0-9.-]/g,
                          ''
                        );

                        setValues(
                          (oldValues: { tableData: { [x: string]: any } }) => {
                            const comp = oldValues.tableData[index];
                            const expenses = [...comp.expenses];
                            const weight = comp.weight;

                            const parsedValue = sanitizedValue
                              ? sanitizedValue
                              : 0;
                            const { total, expenses: updatedExpenses } =
                              getExpensesTotal(
                                expenses,
                                expenseIndex,
                                parsedValue
                              );

                            const calculatedCompData = calculateCompData({
                              total,
                              weight,
                              comp,
                              appraisalData,
                            });

                            const updatedCompData = {
                              ...comp,
                              ...calculatedCompData,
                            };

                            oldValues.tableData[index] = {
                              ...updatedCompData,
                              expenses: updatedExpenses,
                              total,
                            };

                            const totalAverageAdjustedPsf =
                              oldValues.tableData.reduce(
                                (acc: any, item: any) => {
                                  return acc + item.averaged_adjusted_psf;
                                },
                                0
                              );

                            return {
                              ...oldValues,
                              averaged_adjusted_psf: totalAverageAdjustedPsf,
                            };
                          }
                        );
                      }}
                      inputProps={{
                        style: {
                          padding: 0,
                          textAlign: 'left',
                          fontSize: '12px',
                          borderRadius: '0',
                          borderBottom: '1px solid #ccc',
                        },
                      }}
                    />
                    <span
                      className={`text-xs ${
                        parseFloat(expense.adj_value) > 0
                          ? 'text-red-600'
                          : parseFloat(expense.adj_value) < 0
                            ? 'text-green-600'
                            : 'text-gray-500'
                      }`}
                    >
                      {parseFloat(expense.adj_value) > 0
                        ? 'Inferior'
                        : parseFloat(expense.adj_value) < 0
                          ? 'Superior'
                          : 'Equal'}
                    </span>
                  </div>
                ) : expense.customType === true ? (
                  <div className=" flex">
                    <TextField
                      type="text"
                      className="w-1/2 approchTextField [&_.MuiInputBase-formControl]:rounded-none"
                      value={expense.adj_value ? `${expense.adj_value}%` : ''}
                      onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                        e.target.select();
                      }}
                      onKeyDown={(e) => {
                        let nStr = expense.adj_value
                          ? `${expense.adj_value}`
                          : '';

                        // Handle when all the text is selected and backspace is pressed
                        const { selectionStart, selectionEnd }: any = e.target;

                        if (
                          e.keyCode === 8 &&
                          selectionStart === 0 &&
                          selectionEnd >= nStr.length
                        ) {
                          nStr = '';
                        } else if (e.keyCode === 8) {
                          nStr = nStr.slice(0, -1);
                        } else if (
                          e.key === 'ArrowLeft' ||
                          e.key === 'ArrowRight' ||
                          e.key === 'Backspace'
                        ) {
                          return;
                        } else if (e.key === '-') {
                          // Allow negative sign at the start
                          if (nStr.length === 0) {
                            nStr = '-';
                          }
                          return;
                        } else if (nStr.includes('100')) {
                          nStr = '100';
                        } else if (parseFloat(nStr) > 100) {
                          nStr = nStr.substr(0, 2);
                        }

                        const sanitizedValue = nStr;

                        setValues(
                          (oldValues: { tableData: { [x: string]: any } }) => {
                            const comp = oldValues.tableData[index];
                            const expenses = [...comp.expenses];

                            const weight = comp.weight;

                            const parsedValue = sanitizedValue
                              ? sanitizedValue
                              : 0;
                            const { total, expenses: updatedExpenses } =
                              getExpensesTotal(
                                expenses,
                                expenseIndex,
                                parsedValue
                              );

                            const calculatedCompData = calculateCompData({
                              total,
                              weight,
                              comp,
                              appraisalData,
                            });

                            const updatedCompData = {
                              ...comp,
                              ...calculatedCompData,
                            };

                            oldValues.tableData[index] = {
                              ...updatedCompData,
                              expenses: updatedExpenses,
                              total,
                            };

                            const totalAverageAdjustedPsf =
                              oldValues.tableData.reduce(
                                (acc: any, item: any) => {
                                  return acc + item.averaged_adjusted_psf;
                                },
                                0
                              );

                            return {
                              ...oldValues,
                              averaged_adjusted_psf: totalAverageAdjustedPsf,
                            };
                          }
                        );
                      }}
                      inputProps={{
                        maxLength: 6,
                        style: {
                          padding: 0,
                          textAlign: 'left',
                          fontSize: '12px',
                          borderBottom: '1px solid #ccc',
                        },
                      }}
                      onChange={(e) => {
                        const value = e.target.value;

                        // Allow negative numbers
                        let sanitizedValue = value.replace(/[^0-9.-]/g, '');
                        if (sanitizedValue.indexOf('-') > 0) {
                          sanitizedValue = sanitizedValue.replace(/-/g, '');
                        }

                        // Limit the input value to between -100 and 100
                        if (parseFloat(sanitizedValue) < -100) {
                          sanitizedValue = '-100';
                        } else if (parseFloat(sanitizedValue) > 100) {
                          sanitizedValue = sanitizedValue.substr(0, 2);
                        }

                        const parts = sanitizedValue.split('.');

                        if (
                          parts.length > 2 ||
                          (parts.length === 2 && parts[1].length > 2)
                        ) {
                          return;
                        }

                        if (parts[0].length > 3) {
                          return;
                        }

                        setValues(
                          (oldValues: { tableData: { [x: string]: any } }) => {
                            const comp = oldValues.tableData[index];
                            const expenses = [...comp.expenses];

                            const weight = comp.weight;

                            const parsedValue = sanitizedValue
                              ? sanitizedValue
                              : 0;
                            const { total, expenses: updatedExpenses } =
                              getExpensesTotal(
                                expenses,
                                expenseIndex,
                                parsedValue
                              );

                            const calculatedCompData = calculateCompData({
                              total,
                              weight,
                              comp,
                              appraisalData,
                            });

                            const updatedCompData = {
                              ...comp,
                              ...calculatedCompData,
                            };

                            oldValues.tableData[index] = {
                              ...updatedCompData,
                              expenses: updatedExpenses,
                              total,
                            };

                            const totalAverageAdjustedPsf =
                              oldValues.tableData.reduce(
                                (acc: any, item: any) => {
                                  return acc + item.averaged_adjusted_psf;
                                },
                                0
                              );

                            return {
                              ...oldValues,
                              averaged_adjusted_psf: totalAverageAdjustedPsf,
                            };
                          }
                        );
                      }}
                    />
                    <span
                      className={`text-xs ${
                        expense.adj_value > 0
                          ? 'text-red-600'
                          : expense.adj_value < 0
                            ? 'text-green-600'
                            : 'text-gray-400'
                      }`}
                    >
                      {expense.adj_value > 0
                        ? 'Inferior'
                        : expense.adj_value < 0
                          ? 'Superior'
                          : ''}
                    </span>
                    <span
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                        color: 'gray',
                        marginLeft: '-20px',
                        fontSize: '10px',
                      }}
                    >
                      %
                    </span>

                    <Icons.SwitchIcon
                      style={{
                        color: 'rgb(13 161 199)',
                        margin: '0 6px',
                        width: '17px',
                        height: '17px',
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        setValues(
                          (oldValues: { tableData: { [x: string]: any } }) => {
                            const comp = oldValues.tableData[index];
                            const expenses = [...comp.expenses];

                            expenses[expenseIndex].customType = false;
                            const weight = comp.weight;

                            const { total, expenses: updatedExpenses } =
                              getExpensesTotal(expenses, expenseIndex, 0);

                            const calculatedCompData = calculateCompData({
                              total,
                              weight,
                              comp,
                            });

                            const updatedCompData = {
                              ...comp,
                              ...calculatedCompData,
                            };

                            oldValues.tableData[index] = {
                              ...updatedCompData,
                              expenses: [...updatedExpenses],
                              total,
                            };

                            const totalAverageAdjustedPsf =
                              oldValues.tableData.reduce(
                                (acc: any, item: any) => {
                                  return acc + item.averaged_adjusted_psf;
                                },
                                0
                              );

                            return {
                              ...oldValues,
                              averaged_adjusted_psf: totalAverageAdjustedPsf,
                            };
                          }
                        );
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center">
                    <div className="w-1/2">
                      <SelectTextField
                        className="custom-dropdown"
                        options={options.map((option) => ({
                          value: option.value,
                          label: (
                            <span style={{ fontSize: '13px' }}>
                              {option.label}
                            </span>
                          ),
                        }))}
                        value={
                          expense.adj_value !== undefined &&
                          expense.adj_value !== null
                            ? expense.adj_value
                            : 0
                        }
                        onChange={(e) => {
                          const { value } = e.target;
                          const number = parseFloat(value);
                          const isCustomValue = value === 'custom';

                          setValues(
                            (oldValues: {
                              tableData: { [x: string]: any };
                            }) => {
                              const comp = oldValues.tableData[index];
                              const expenses = [...comp.expenses];

                              expenses[expenseIndex].customType = isCustomValue;
                              expenses[expenseIndex].adj_value = isCustomValue
                                ? 0
                                : number;

                              const weight = comp.weight;

                              const { total, expenses: updatedExpenses } =
                                getExpensesTotal(
                                  expenses,
                                  expenseIndex,
                                  isCustomValue ? 0 : number
                                );

                              const calculatedCompData = calculateCompData({
                                total,
                                weight,
                                comp,
                                appraisalData,
                              });

                              const updatedCompData = {
                                ...comp,
                                ...calculatedCompData,
                              };

                              oldValues.tableData[index] = {
                                ...updatedCompData,
                                expenses: updatedExpenses,
                                total,
                              };

                              const totalAverageAdjustedPsf =
                                oldValues.tableData.reduce(
                                  (acc: any, item: any) => {
                                    return acc + item.averaged_adjusted_psf;
                                  },
                                  0
                                );

                              return {
                                ...oldValues,
                                averaged_adjusted_psf: totalAverageAdjustedPsf,
                              };
                            }
                          );
                        }}
                        name={`${item.id}.expenses.${expenseIndex}.adj_value`}
                      />
                    </div>
                    <span
                      className={`text-sm font-normal ${
                        parseFloat(expense.adj_value || '0') > 0
                          ? 'text-red-500 font-semibold'
                          : parseFloat(expense.adj_value || '0') < 0
                            ? '  text-green-500 font-semibold'
                            : 'text-gray-500 '
                      }`}
                    >
                      {parseFloat(expense.adj_value || '0') > 0
                        ? 'Inferior'
                        : parseFloat(expense.adj_value || '0') < 0
                          ? 'Superior'
                          : 'Equal'}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-2 px-1 space-y-2 flex flex-col gap-[2px] pb-2">
          <p className="text-gray-500 h-[18px] !m-0 text-xs font-medium text-ellipsis overflow-hidden whitespace-nowrap">
            {values.tableData[index].total
              ? appraisalData?.comp_adjustment_mode === 'Dollar'
                ? `${formatPrice(values.tableData[index].total || 0)}`
                : `${Number(values.tableData[index].total).toFixed(2)}%`
              : appraisalData?.comp_adjustment_mode === 'Dollar'
                ? '$0.00'
                : '0.00%'}
          </p>
          <p className="text-gray-500 h-[18px] !m-0 text-xs font-medium text-ellipsis overflow-hidden whitespace-nowrap">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(adjustedMonthlyValue)}
          </p>
        </div>
      </div>
    </div>
  );
}
export default EvaluationMUltiFamilyCompCard;
