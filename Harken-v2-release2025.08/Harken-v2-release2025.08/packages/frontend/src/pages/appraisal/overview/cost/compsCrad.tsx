import {
  frontageOptions,
  utilitiesOptions,
} from '@/pages/comps/create-comp/SelectOption';
import { useFormikContext } from 'formik';
import defaultPropertImage from '../../../../images/default-placeholder.png';

import { useState } from 'react';
import { Icons } from '@/components/icons';
import DeleteApproachConfirmationModal from '@/pages/comps/Listing/delete-approach-confirmation';
import { TextField } from '@mui/material';
import SelectTextField from '@/components/styles/select-input';
import { options } from '@/pages/comps/comp-form/fakeJson';
import {
  capitalizeWords,
  formatPrice,
  sanitizeInputDollarSignComps,
} from '@/utils/sanitize';
import { Link, useSearchParams } from 'react-router-dom';
import { LandDimension } from '../OverviewEnum';
// function to calculate comps data
export const calculateCompData = ({
  total,
  weight,
  comp,
  appraisalData,
}: any) => {
  const price_square_foot = comp.price_square_foot;
  const landWithAcre = comp.land_dimension === 'SF' ? parseFloat((comp.land_size / 43560).toFixed(3)) : comp.land_size; // Round to 3 decimal places
  const landSF = comp.land_dimension === 'ACRE' ? parseFloat((comp.land_size * 43560).toFixed(2)) : comp.land_size; // Round to 3 decimal places
  const landPricePerUnit = comp.sale_price / landWithAcre;
  const updatedAdjustedPsf =
    appraisalData.land_dimension === 'ACRE'
      ? (total / 100) * landPricePerUnit + landPricePerUnit
      : ((total / 100) * comp.sale_price) / landSF +
        comp.sale_price / landSF;
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
    total += parseFloat(exp.adj_value);
  });

  return { total, expenses };
};

function CompsCard({
  index,
  item,
  values,
  totalCards,
  handleDelete,
  dimension,
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // State to manage modal visibility
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const costId = searchParams.get('costId');
  // Function to open the modal
  const openDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  // Function to close the modal
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };
  const [error, setError] = useState('');

  const { setValues } = useFormikContext<any>();

  const landSizeAcreValue =
    item.land_dimension === 'ACRE'
      ? item.land_size
      : (item.land_size / 43560).toFixed(3);

  const landSizeSFValue =
    item.land_dimension === 'SF'
      ? item.land_size
      : (item.land_size * 43560).toFixed(3);

  let total = 0;
  item.expenses?.forEach((exp: any) => {
    const expNum = exp.comparison_basis
      ? +exp.comparison_basis.split('%')[0]
      : 0;
    total += expNum;
  });

  const addTotalAsPercentageToPriceSquareFoot = (
    priceSquareFoot: number,
    total: any
  ) => {
    const percentageIncrease = (total / 100) * priceSquareFoot;
    return priceSquareFoot + percentageIncrease;
  };

  const adjustedPricepercentage: number =
    item.price_square_foot === 0
      ? 0
      : addTotalAsPercentageToPriceSquareFoot(item.price_square_foot, total);

  const calculateWeightage = (totalCards: number): string => {
    if (totalCards <= 0) {
      return 'NA';
    }
    return (100 / totalCards).toFixed(2);
  };

  // Handle input change
  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: any
  ) => {
    const value = event.target.value;
    // Allow negative numbers
    let sanitizedValue = value.replace(/[^0-9.-]/g, '');
    if (sanitizedValue.indexOf('-') > 0) {
      sanitizedValue = sanitizedValue.replace(/-/g, '');
    }

    const parts = sanitizedValue.split('.');

    if (parts.length > 2 || (parts.length === 2 && parts[1].length > 2)) {
      return;
    }

    const inputWeightage = +sanitizedValue;
    const maxWeightage = +calculateWeightage(totalCards);

    if (inputWeightage > maxWeightage) {
      setError('Please ensure total weightage remains 100%');
    } else {
      setError('');
    }

    setValues((oldValues: { tableData: { [x: string]: any } }) => {
      const comp = oldValues.tableData[index];
      const expenses = [...comp.expenses];
      const weight = sanitizedValue;

      const { total, expenses: updatedExpenses } = getExpensesTotal(
        expenses,
        undefined,
        undefined
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
      console.log('table', values);
      const totalAverageAdjustedPsf = oldValues.tableData.reduce(
        (acc: any, item: { averaged_adjusted_psf: any }) => {
          return acc + item.averaged_adjusted_psf;
        },
        0
      );
      return { ...oldValues, averaged_adjusted_psf: totalAverageAdjustedPsf };
    });
    // setWeightages(inputWeightage);
    updateCardsValue(sanitizedValue, index);
  };

  const updateCardsValue = (inputWeightage: string, index: undefined) => {
    let new_blended_adjusted_value = 0;
    if (adjustedPricepercentage) {
      new_blended_adjusted_value =
        (adjustedPricepercentage * parseFloat(inputWeightage)) / 100;
    }
    const new_average_adjusted_value =
      (parseFloat(item.price_square_foot) * parseFloat(inputWeightage)) / 100;
    ({
      target: {
        value: values.tableData.map((td: any, tableIndex: undefined) => {
          if (index === tableIndex) {
            td.weight = inputWeightage;
            td.blended_adjusted_value = new_blended_adjusted_value;
            td.average_adjusted_value = new_average_adjusted_value;
          }

          return td;
        }),
        name: 'tableData',
      },
    });
  };
  const getLabelFromCondition = (conditionValue: string) => {
    const foundItem = frontageOptions.find(
      (item) => item.value === conditionValue
    );

    // If a match is found, return the label; otherwise, return the capitalized conditionValue
    return foundItem ? foundItem.label : capitalizeWords(conditionValue);
  };
  const getLabelFromUtilities = (topography: string) => {
    const foundItem = utilitiesOptions.find(
      (item) => item.value === topography
    );

    // If a match is found, return the label; otherwise, return the capitalized conditionValue
    return foundItem ? foundItem.label : capitalizeWords(topography);
  };
  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: any
  ) => {
    let nStr = values.tableData[index].weight;
    const { selectionStart, selectionEnd }: any = event.target;

    if (
      event.keyCode === 8 &&
      selectionStart === 0 &&
      selectionEnd >= nStr.length
    ) {
      nStr = ''; // Clear all data
    } else if (event.keyCode === 8) {
      // Backspace: remove the last character if not everything is selected
      nStr = nStr.slice(0, -1);
    } else if (
      event.key === 'ArrowLeft' ||
      event.key === 'ArrowRight' ||
      event.key === 'Backspace'
    ) {
      // Allow arrow keys and backspace
      return;
    } else if (event.key === '-') {
      // Allow negative sign at the start
      if (nStr.length === 0) {
        nStr = '-';
      }
      return;
    }
    // Allow negative numbers
    let sanitizedValue = nStr.replace(/[^0-9.-]/g, '');
    if (sanitizedValue.indexOf('-') > 0) {
      sanitizedValue = sanitizedValue.replace(/-/g, '');
    }

    const inputWeightage = +sanitizedValue;
    const maxWeightage = +calculateWeightage(totalCards);

    if (inputWeightage > maxWeightage) {
      setError('Please ensure total weightage remains 100%');
    } else {
      setError('');
    }

    setValues((oldValues: { tableData: { [x: string]: any } }) => {
      const comp = oldValues.tableData[index];
      const expenses = [...comp.expenses];
      const weight = sanitizedValue;

      const { total, expenses: updatedExpenses } = getExpensesTotal(
        expenses,
        undefined,
        undefined
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

      const totalAverageAdjustedPsf = oldValues.tableData.reduce(
        (acc: any, item: { averaged_adjusted_psf: any }) => {
          return acc + item.averaged_adjusted_psf;
        },
        0
      );
      return { ...oldValues, averaged_adjusted_psf: totalAverageAdjustedPsf };
    });
    updateCardsValue(sanitizedValue, index);
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
              to={`/update-comps/${item.comp_id}/${id}/cost/${costId}`}
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
          <p className="text-xs text-[#687F8B] pb-1 font-medium overflow-hidden whitespace-nowrap text-ellipsis">
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
          </p>
        </div>

        <div className="p-2 flex flex-col gap-[2px] border-solid border-b border-l-0 border-r-0 border-t border-[#d5d5d5]">
          <p className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap">
            {item.sale_price
              ? `$${item.sale_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : 'N/A'}
          </p>

          <p className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap">
            {item.building_size
              ? `${item.building_size.toLocaleString()} SF`
              : 'N/A'}{' '}
            /
            {item.land_size
              ? `${dimension === 'ACRE' ?
                item.land_dimension === LandDimension.SF ? (item.land_size / 43560).toLocaleString() : item.land_size.toLocaleString()
                : item.land_dimension === LandDimension.ACRE ? (item.land_size * 43560).toLocaleString() : item.land_size.toLocaleString()} ${dimension === 'ACRE' ? 'AC' : 'SF'}`
              : 'N/A'}
          </p>

          {/* <p className="text-gray-500 font-medium">
            {item.year_built || 'NA'} {item.year_built || 'NA'}
          </p> */}
          <p className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap">
            {item.zoning_type ? capitalizeWords(item.zoning_type) : '\u00A0'}
          </p>
          <p className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap">
            {item.utilities_select
              ? getLabelFromUtilities(item.utilities_select)
              : '\u00A0'}
          </p>
          <p className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap">
            {' '}
            {item.frontage ? getLabelFromCondition(item.frontage) : '\u00A0'}
          </p>

          <p className="text-gray-500 !m-0 text-xs font-medium h-[18px] text-ellipsis overflow-hidden whitespace-nowrap">
            {dimension === 'ACRE'
              ? item.sale_price && landSizeAcreValue
                ? `$${(item.sale_price / landSizeAcreValue).toLocaleString(
                    undefined,
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}`
                : '$0.00'
              : item.sale_price && landSizeSFValue
                ? `$${(item.sale_price / landSizeSFValue).toLocaleString(
                    undefined,
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}`
                : '$0.00'}
          </p>
        </div>
        <div className="px-1 mt-2 border-solid border-b border-l-0 border-r-0 border-t-0  border-[#d5d5d5] min-h-[26px]">
          <div className="w-full pb-1">
            {item.expenses?.map((expense: any, expenseIndex: any) => (
              <div key={expense.id} className='subjectPropertyCard'>
                {appraisalData?.comp_adjustment_mode === 'Dollar' ? (
                  <div className="flex items-center h-[18px]">
                    <TextField
                      type="text"
                      className="w-1/2 [&_.MuiInputBase-formControl]:rounded-none"
                      value={
                        expense.adj_value
                          ? sanitizeInputDollarSignComps(expense.adj_value)
                          : '$0.00'
                      }
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

                        const sanitizedValue =
                          nStr +
                          (e.key === 'Backspace' || e.key === '-'
                            ? ''
                            : e.key);

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
                      onChange={(e) => {
                        const value = e.target.value;
                        let sanitizedValue = value.replace(/[^0-9.-]/g, '');

                        // Ensure only one decimal point
                        const parts = sanitizedValue.split('.');
                        if (parts.length > 2) {
                          sanitizedValue =
                            parts[0] + '.' + parts.slice(1).join('');
                        }

                        // Limit to 2 decimal places
                        if (parts.length === 2 && parts[1].length > 2) {
                          sanitizedValue =
                            parts[0] + '.' + parts[1].substring(0, 2);
                        }

                        // Handle negative sign
                        if (sanitizedValue.indexOf('-') > 0) {
                          sanitizedValue = sanitizedValue.replace(/-/g, '');
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
                      inputProps={{
                        style: {
                          padding: 0,
                          textAlign: 'left',
                          fontSize: '12px',
                          borderRadius: '0',
                          height: '20px',
                        },
                      }}
                    />
                    <span
                      className={`text-xs ${
                        parseFloat(expense.adj_value) > 0
                          ? 'text-green-600'
                          : parseFloat(expense.adj_value) < 0
                            ? 'text-red-600'
                            : 'text-gray-400'
                      }`}
                    >
                      {parseFloat(expense.adj_value) > 0
                        ? 'Superior'
                        : parseFloat(expense.adj_value) < 0
                          ? 'Inferior'
                          : ''}
                    </span>
                  </div>
                ) : expense.customType === true ? (
                  <div className="flex items-center h-[18px]">
                    <TextField
                      type="text"
                      className="w-1/2 [&_.MuiInputBase-formControl]:rounded-none"
                      value={expense.adj_value ? `${expense.adj_value}%` : ''}
                      onKeyDown={(e) => {
                        let nStr = expense.adj_value
                          ? `${expense.adj_value}`
                          : '';

                        // Allow backspace
                        if (e.keyCode === 8) {
                          nStr = nStr.slice(0, -1);
                        } else if (
                          e.key === 'ArrowLeft' ||
                          e.key === 'ArrowRight' ||
                          e.key === 'Backspace'
                        ) {
                          // Allow arrow keys and backspace
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
                          borderRadius: '0',
                          height: '20px',
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
                        parseFloat(expense.adj_value) > 0
                          ? 'text-red-600'
                          : parseFloat(expense.adj_value) < 0
                            ? 'text-green-600'
                            : 'text-gray-400'
                      }`}
                    >
                      {parseFloat(expense.adj_value) > 0
                        ? 'Superior'
                        : parseFloat(expense.adj_value) < 0
                          ? 'Inferior'
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
                    ></span>

                    <Icons.SwitchIcon
                      style={{
                        color: 'rgb(13 161 199)',

                        marginRight: '13px',
                        width: '17px',
                        height: '28px',
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
                              appraisalData,
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
                  <div className="flex items-center h-[18px]">
                    <div className="w-1/2 [&_.MuiInputBase-input]:p-0">
                      <SelectTextField
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
                      className={`text-sm font-normal text-ellipsis overflow-hidden whitespace-nowrap ${
                        parseFloat(expense.adj_value || '0') > 0
                          ? 'text-red-500 font-semibold'
                          : parseFloat(expense.adj_value || '0') < 0
                            ? 't text-green-500 font-semibold'
                            : 'text-gray-500'
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

        <div className="mt-2 px-1 flex flex-col gap-[2px] pb-2">
          <p className="text-gray-500 h-[18px] !m-0 text-xs font-medium text-ellipsis overflow-hidden whitespace-nowrap">
            {values.tableData[index].total
                ? appraisalData?.comp_adjustment_mode === 'Dollar'
                  ? `${formatPrice(values.tableData[index].total || 0)}`
                  : `${Number(values.tableData[index].total).toFixed(2)}%`
                : appraisalData?.comp_adjustment_mode === 'Dollar'
                  ? '$0.00'
                : '0.00%'
            }
          </p>
          <p className="text-gray-500 h-[18px] !m-0 text-xs font-medium text-ellipsis overflow-hidden whitespace-nowrap">
            {values.tableData[index].adjusted_psf
              ? formatPrice(values.tableData[index].adjusted_psf || 0)
              : '$0.00'}
          </p>

          <p className="text-gray-500 h-[18px] !m-0 text-xs font-medium text-ellipsis overflow-hidden whitespace-nowrap">
            <input
              type="text"
              step="0.01" // Allows decimal values with two places
              value={
                values.tableData[index].weight
                  ? `${values.tableData[index].weight}%`
                  : ''
              }
              onChange={(e) => handleInputChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="bg-transparent outline-none  h-4 p-0 border-solid border-b border-l-0 border-r-0 border-t-0 border-[#d5d5d5] focus:border-[#0da1c7] text-gray-500 text-xs font-medium"
            />

            {error && <div className="text-[11px] text-red-500">{error}</div>}
          </p>

          <p className="text-gray-500 h-[18px] !m-0 text-base font-medium text-ellipsis overflow-hidden whitespace-nowrap invisible">
            {values.tableData[index].blended_adjusted_psf
              ? `${Number(values.tableData[index].blended_adjusted_psf).toFixed(2)}`
              : 0}
          </p>
          <p className="text-gray-500 h-[18px] !m-0 text-xs font-medium text-ellipsis overflow-hidden whitespace-nowrap invisible">
            {values.tableData[index]
              ? (values.tableData[index].adjusted_psf *
                  values.tableData[index].weight) /
                100
              : 0}
          </p>
        </div>
      </div>
    </div>
  );
}
export default CompsCard;
