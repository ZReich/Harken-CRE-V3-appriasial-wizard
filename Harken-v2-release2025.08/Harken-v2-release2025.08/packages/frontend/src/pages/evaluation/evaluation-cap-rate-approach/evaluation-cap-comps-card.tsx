// import SelectTextField from '@/components/styles/select-input';
import defaultPropertImage from '../../../images/default-placeholder.png';
import { usa_state } from '@/pages/comps/comp-form/fakeJson';
import {
  conditionOptions,
  hospitalityOptions,
  industrialOptions,
  multifamilyOptions,
  officeOptions,
  residentialOptions,
  retailOptions,
  specialOptions,
  topographyOptions,
} from '@/pages/comps/create-comp/SelectOption';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Icons } from '@/components/icons';
import DeleteApproachConfirmationModal from '@/pages/comps/Listing/delete-approach-confirmation';
// import { TextField } from '@mui/material';
import { useFormikContext } from 'formik';
import EvaluationCapCompsAdjustmentNoteModal from './evaluation-cap-approach-comps-adjustment-notes-modal';
import { propertyTypeOptions } from '@/pages/my-profile/significant-transaction/select-option/Select';
import { capitalizeWords } from '@/utils/sanitize';
import { Link, useSearchParams } from 'react-router-dom';
import CompsPropertyComparitiveAttributes from '@/utils/comps-property-comparitive.attributes';
// Function for calculation of comps data

export const calculateCompData = ({ total, weight, comp }: any) => {
  const price_square_foot = comp.price_square_foot;
  const bedPerSqFit =
    comp.sale_price === 0 && comp.total_beds === 0
      ? 0
      : comp.total_beds === 0
        ? 0
        : comp.sale_price / comp.total_beds;

  const bedUnitPerSqFt =
    comp.total_units === 0 ? 0 : comp.sale_price / comp.total_units;
  const finalBed = (total / 100) * bedPerSqFit + bedPerSqFit;

  const finalUnits = (total / 100) * bedUnitPerSqFt + bedUnitPerSqFt;
  // const finalAdjustePricePerAcre = (comp.sale_price/comp?.land_size)*43560;
  // console.log(finalAdjustePricePerAcre,'finalAdjustePricePerAcre');
  const updatedAdjustedPsf =
    (total / 100) * price_square_foot + price_square_foot;

  const updatedAverageAdjustedPsf = (updatedAdjustedPsf * weight) / 100;
  const bedAveragedAdjustedPsf = (finalBed * weight) / 100;
  const unitAveragedAdjustedPsf = (finalUnits * weight) / 100;

  const updatedBlendedPsf = (price_square_foot * weight) / 100;
  const bedUpdatedBlendedPsf = (bedPerSqFit * weight) / 100;
  const unitUpdatedBlendedPsf = (bedPerSqFit * weight) / 100;

  return {
    adjusted_psf:
      comp?.comparison_basis === 'Bed'
        ? finalBed
        : comp?.comparison_basis === 'Unit'
          ? finalUnits
          : updatedAdjustedPsf,

    averaged_adjusted_psf:
      comp?.comparison_basis == 'Bed'
        ? bedAveragedAdjustedPsf
        : comp.comparison_basis === 'Unit'
          ? unitAveragedAdjustedPsf
          : updatedAverageAdjustedPsf,
    blended_adjusted_psf:
      comp?.comparison_basis == 'Bed'
        ? bedUpdatedBlendedPsf
        : comp.comparison_basis === 'Unit'
          ? unitUpdatedBlendedPsf
          : updatedBlendedPsf,
    weight,
    total,
  };
};
// function to calculate comps total dropdown adjustment values

export const getExpensesTotal = (
  expenses: any
  // expenseIndex: any,
  // newExpenseValue: any
) => {
  let total: number = 0;

  // if (expenseIndex !== 'undefined') {
  //   const exp = expenses[expenseIndex];

  //   if (exp) {
  //     exp.adj_value = newExpenseValue;
  //     expenses[expenseIndex] = exp;
  //   }
  // }

  expenses?.forEach((exp: { adj_value: any }) => {
    total += parseFloat(exp.adj_value);
  });

  return { total, expenses };
};
function EvaluationCapCompCard({
  index,
  item,
  values,
  totalCards,
  handleDelete,
  handleNavigateToComp,
  setClassName,
  handleSaveAdjustmentNote,
  comparisonBasis,
  appraisalData,
  // passcomparabilityData,
}: {
  item: any;
  handleChange: any;
  values: any;
  totalCards: number;
  index: any;
  dimension: any;
  handleNavigateToComp: any;
  handleDeleteComp: any;
  handleSaveAdjustmentNote: any;
  landDimensions: any;
  subjectcompType: any;
  dropdownField: any;
  setDropdownField: any;
  setSubOption: any;
  subOption: any;
  handleDelete: (id: number) => void;
  passcomparabilityData: any;
  indexType: any;
  setIndexType: any;
  setClassName: any;
  handleSubmit: any;
  comparisonBasis: any;
  appraisalData: any;
}) {
  type QuantitativeOption = {
    code: string;
    name: string;
  };
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // State to manage modal visibility
  const [indexNumber, setIndexNumber] = useState<any>();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [, setQuantitativeOptions] = useState<QuantitativeOption[]>([]);
  const [, setOverallComparabilityOptions] = useState([]);
  // const [selectedComparabilityOption, setSelectedComparabilityOption] =
  //   useState('similar');
  const [tableItem, setTableItem] = useState<any>('');
  const { setValues } = useFormikContext<any>();
  const stateMap = usa_state[0]; // Extract the first object from the array
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const capId = searchParams.get('capId');
  const fullStateName = stateMap[item?.state];
  useEffect(() => {
    if (!open) {
      setTableItem('');
      setIndexNumber('');
      setClassName(false);
    }
  }, [open]);
  console.log(
    values?.appraisalSpecificAdjustment,
    'appraisalSpecificAdjustmentappraisalSpecificAdjustment'
  );
  const handleOpen = (item: any, id: any) => {
    setTableItem(item);
    setIndexNumber(id);
    setClassName(true);
    setOpen(true);
  };

  const openDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };
  let total = 0;
  item.expenses?.forEach((exp: any) => {
    const expNum = exp.comparison_basis
      ? +exp.comparison_basis.split('%')[0]
      : 0;
    total += expNum;
  });
  console.log('comparisonbasis', comparisonBasis);
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
      // const expenses = [...comp.expenses];
      const weight = sanitizedValue;

      // const { total, expenses: updatedExpenses } = getExpensesTotal(expenses);

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
        // expenses: updatedExpenses,
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
      // const expenses = [...comp.expenses];
      const weight = sanitizedValue;

      const { total, expenses: updatedExpenses } = getExpensesTotal(
        // expenses,
        undefined
      );

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
    // setWeightages(inputWeightage);
    updateCardsValue(sanitizedValue, index);
  };

  const fetchGlobalCodes = async () => {
    try {
      // Make the API call using axios
      const response = await axios.get(`globalCodes`, {});

      if (response?.data?.data?.data) {
        // Filter for quantitative adjustments
        const filteredQuantitativeOptions = response.data.data.data
          .find((item: any) => item.type === 'qualitative_adjustments_dropdown')
          ?.options.filter((option: any) => option.code !== 'type_my_own');

        const filteredOVerallComparabilityOptions = response.data.data.data
          .find((item: any) => item.type === 'qualitative_adjustments_dropdown')
          ?.options.filter((option: any) => option.code !== 'type_my_own');

        // Filter for qualitative adjustments (modify as needed)

        // Update state with the filtered options
        setQuantitativeOptions(filteredQuantitativeOptions || []);
        setOverallComparabilityOptions(
          filteredOVerallComparabilityOptions || []
        );
      }
    } catch (error) {
      console.error('Error fetching comps data:', error);
    }
  };
  useEffect(() => {
    // Call the fetch function when the component mounts
    fetchGlobalCodes();
  }, []);

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

  // const capitalizeWords = (str: string | undefined | null) => {
  //   if (!str) return ''; // If the string is undefined or null, return an empty string

  //   return str
  //     .split(/\s+/) // Split the string by one or more spaces
  //     .map(
  //       (word: string) =>
  //         word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() // Capitalize first letter
  //     )
  //     .join(' '); // Join the words back with a space
  // };
  const getLabelFromValue1 = (value: any) => {
    if (!value || value === '--Select a Subtype--') {
      return '';
    }
    const allOptions = [
      ...propertyTypeOptions,
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
    // Check if value matches any of the options
    const option = allOptions.find((option) => option.value === value);
    if (option) {
      return option.label; // Return matched label if found
    }

    // If no match, return the value as is without capitalizing
    return capitalizeWords(value);
  };

  const getLabelFromValue = (value: any) => {
    // If the value is empty, null, or '--Select a Subtype--', return an empty string
    if (!value || value === '--Select a Subtype--') {
      return '';
    }

    const allOptions = [
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
  console.log('new data', values);
  const editorText = (event: any) => {
    setValues((oldValues: any) => {
      const updatedTableData = [...oldValues.tableData];
      updatedTableData[indexNumber].adjustment_note = event.slice(0, 250);
      return {
        ...oldValues,
        tableData: updatedTableData,
      };
    });
  };
  const handleSave = () => {
    setOpen(false);
    handleSaveAdjustmentNote();
  };
  return (
    <>
      <div className="flex flex-col w-[15.5%]">
        <h3 className="py-5 text-base capitalize invisible font-semibold">
          Subject Property
        </h3>
        <div key={item.id} className="bg-slate-100 flex-1">
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
                to={`/evaluation/update-cap-comps/${item.comp_id}/${id}/cap/${capId}`}
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
                onClick={openDeleteModal}
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
              {/* Street address on one line */}
              <h2 className="text-gray-500 text-xs font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                {item.street_address || 'No address available'}
              </h2>

              {/* City, state (uppercase), and zipcode on the next line */}
              <h2 className="text-gray-500 text-xs font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                {item.city ? item.city + ', ' : ''}
                {item.state ? item.state.toUpperCase() + ', ' : ''}
                {item.zipcode || ''}
              </h2>
            </div>
            <p className="text-gray-500 text-xs font-medium overflow-hidden whitespace-nowrap text-ellipsis pb-1">
              {item.sale_status === 'Pending'
                ? new Intl.DateTimeFormat('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                    year: 'numeric',
                  }).format(
                    new Date(
                      new Date(item.date_sold).toLocaleString('en-US', {
                        timeZone: 'UTC',
                      })
                    )
                  ) +
                  ' ' +
                  '(P)'
                : new Intl.DateTimeFormat('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                    year: 'numeric',
                  }).format(
                    new Date(
                      new Date(item.date_sold).toLocaleString('en-US', {
                        timeZone: 'UTC',
                      })
                    )
                  )}
            </p>
            <p className="text-gray-500 text-xs font-medium overflow-hidden whitespace-nowrap text-ellipsis pb-1">
              {getLabelFromValue1(item?.zonings?.[0]?.zone || '')} /{' '}
              {getLabelFromValue1(item?.zonings?.[0]?.sub_zone || '')}{' '}
            </p>
          </div>
          <div className="p-1 flex flex-col gap-[2px] space-y-2 border-solid border-b-0 border-l-0 border-r-0 border-t border-[#d5d5d5]">
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
          <div className="border-r-0  border-[#d5d5d5] py-1 mt-[1px]">
            <div className="p-2 flex flex-col gap-[2px] space-y-2 border-solid border-b-0 border-l-0 border-r-0 border-t border-[#d5d5d5]">
              <p className="text-gray-500 h-[18px] !m-0 text-xs font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                $
                {(comparisonBasis === 'SF'
                  ? item.sale_price / (item.building_size || 1)
                  : comparisonBasis === 'Bed'
                    ? item.sale_price / (item.total_beds || 1)
                    : item.sale_price / (item.total_units || 1)
                ).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>

              <p className="h-[18px] text-gray-500 !m-0 text-xs font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                {item?.net_operating_income
                  ? `$${Number(item?.net_operating_income).toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}`
                  : '$0.00'}
              </p>
              <p className=" text-gray-500 h-[18px] !m-0 text-xs font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                {' '}
                {Number(item.cap_rate).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                %
              </p>
            </div>
          </div>
          <div className="">
            <p
              className="text-xs h-10 flex items-center text-ellipsis overflow-hidden whitespace-nowrap font-medium border-below text-[#0DA1C7] p-1 border-solid border-b border-l-0 border-r-0 border-t border-[#d5d5d5] cursor-pointer"
              onClick={() => handleOpen(item, index)}
            >
              {item.adjustment_note !== null
                ? 'Click to edit weighting notes'
                : 'Click to add notes'}
            </p>
          </div>
          <div className="py-3 px-1 space-y-2 flex flex-col gap-2 ascsadasdas">
            <p className="text-xs text-gray-500 h-[18px] !m-0 font-medium text-ellipsis overflow-hidden whitespace-nowrap">
              <input
                type="text"
                step="0.01" // Allows decimal values with two places
                value={
                  values.tableData[index].weight
                    ? `${values.tableData[index].weight}%`.trim()
                    : ''
                }
                onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                  e.target.select();
                }}
                onChange={(e) => handleInputChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="bg-transparent outline-none h-4 p-0 border-solid border-b border-l-0 border-r-0 border-t-0 border-[#d5d5d5] focus:border-[#0da1c7] text-gray-500 text-xs font-medium"
              />

              {error && (
                <div className="text-xs text-red-500 mt-1">{error}</div>
              )}
            </p>
          </div>
        </div>
      </div>
      <EvaluationCapCompsAdjustmentNoteModal
        open={open}
        setOpen={setOpen}
        editorText={editorText}
        item={item}
        handleSave={handleSave}
        tableItem={tableItem}
        indexNumber={indexNumber}
        values={values}
      />
    </>
  );
}

export default EvaluationCapCompCard;
