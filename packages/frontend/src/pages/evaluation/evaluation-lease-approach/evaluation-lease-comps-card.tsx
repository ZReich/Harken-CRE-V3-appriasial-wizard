import SelectTextField from '@/components/styles/select-input';
import defaultPropertImage from '../../../images/default-placeholder.png';
import { options, usa_state } from '@/pages/comps/comp-form/fakeJson';
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
import { APPROACHESENUMS } from '@/pages/comps/enum/ApproachEnums';
import { TextField } from '@mui/material';
import { useFormikContext } from 'formik';
import EvaluationLeaseApproachAdjustmentNotesModal from './evaluation-lease-approach-subject-property-notes-modal';
import {
  capitalizeWords,
  // sanitizeInputDollarSignComps,
} from '@/utils/sanitize';
import { propertyTypeOptions } from '@/pages/my-profile/significant-transaction/select-option/Select';
// Function for calculation of comps data

export const calculateCompData = ({
  total,
  weight,
  comp,
  appraisalData,
}: any) => {
  const price_square_foot = comp.price_square_foot;
  const bedPerSqFit =
    comp.sale_price === 0 && comp.total_beds === 0
      ? 0
      : comp.total_beds === 0
        ? 0
        : comp.sale_price / comp.total_beds;

  const bedUnitPerSqFt =
    comp.total_units === 0 ? 0 : comp.sale_price / comp.total_units;
  const finalBed =
    appraisalData?.comp_adjustment_mode === 'Dollar'
      ? total + bedPerSqFit
      : (total / 100) * bedPerSqFit + bedPerSqFit;

  const finalUnits =
    appraisalData?.comp_adjustment_mode === 'Dollar'
      ? total + bedUnitPerSqFt
      : (total / 100) * bedUnitPerSqFt + bedUnitPerSqFt;

  // const finalBed = (total / 100) * bedPerSqFit + bedPerSqFit;

  // const finalUnits = (total / 100) * bedUnitPerSqFt + bedUnitPerSqFt;
  const updatedAdjustedPsf =
    appraisalData?.comp_adjustment_mode === 'Dollar'
      ? appraisalData?.comp_type === 'land_only' ||
        appraisalData?.analysis_type === '$/Acre'
        ? total + price_square_foot / 43560
        : total + price_square_foot
      : appraisalData?.comp_type === 'land_only' &&
          appraisalData?.analysis_type === '$/Acre'
        ? (total / 100) * (price_square_foot / 43560) +
          price_square_foot / 43560
        : (total / 100) * price_square_foot + price_square_foot;
  const valuePerACre =
    appraisalData?.comp_adjustment_mode === 'Dollar'
      ? appraisalData.land_dimension === 'ACRE'
        ? total + comp.land_size * 43560
        : (total / 100) * comp.land_size + comp.land_size
      : (total / 100) * comp.land_size + comp.land_size;
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
          : appraisalData.land_dimension === 'ACRE'
            ? valuePerACre
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
function EvaluationLeaseCompCard({
  index,
  item,
  values,
  totalCards,
  handleDelete,
  handleNavigateToComp,
  setClassName,
  handleSaveAdjustmentNote,
  passcomparabilityData,
  dimension,
  appraisalData,
}: {
  item: any;
  handleChange: any;
  appraisalData: any;
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
}) {
  type QuantitativeOption = {
    code: string;
    name: string;
  };
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // State to manage modal visibility
  const [indexNumber, setIndexNumber] = useState<any>();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [quantitativeOptions, setQuantitativeOptions] = useState<
    QuantitativeOption[]
  >([]);
  const [overallComparabilityOptions, setOverallComparabilityOptions] =
    useState([]);
  const [selectedComparabilityOption, setSelectedComparabilityOption] =
    useState('similar');
  console.log(overallComparabilityOptions);
  const [tableItem, setTableItem] = useState<any>('');
  const { setValues } = useFormikContext<any>();
  const stateMap = usa_state[0]; // Extract the first object from the array
  const fullStateName = stateMap[item?.state];
  useEffect(() => {
    if (!open) {
      setTableItem('');
      setIndexNumber('');
      setClassName(false);
    }
  }, [open]);

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
    // Check if value matches any of the options
    const option = allOptions.find((option) => option.value === value);
    if (option) {
      return option.label; // Return matched label
    }

    // If no match, capitalize the first letter of each word
    return capitalizeWords(value);
  };
  const getLabelTopographyValue = (value: any) => {
    // If the value is empty or '--Select a Subtype--', return an empty string
    if (!value || value === '--Select a Subtype--') {
      return '';
    }

    const allOptions = [...topographyOptions];

    // Check if the value matches any of the options
    const option = allOptions.find((option) => option.value === value);
    if (option) {
      return option.label; // Return the matched label
    }

    // If no match, return the original value without any modification
    return value;
  };
  const editorText = (event: any) => {
    setValues((oldValues: any) => {
      const updatedTableData = [...oldValues.tableData];
      updatedTableData[indexNumber].adjustment_note = event;
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
  const formatNumber = (num: any) => {
    if (num === null || num === undefined) return 'NA';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  const formatPrice = (value: any) => {
    if (value == null || value === 0) {
      return '$0.00'; // Show $0.00 for null, undefined, or 0
    }
    return `$${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`; // Format value with 2 decimals and commas
  };
  const getLabelFromValue1 = (value: any) => {
    if (!value || value === '--Select a Subtype--') {
      return '';
    }

    const allOptions = [...propertyTypeOptions];
    // Check if value matches any of the options
    const option = allOptions.find((option) => option.value === value);
    if (option) {
      return option.label; // Return matched label if found
    }

    // If no match, return the value as is without capitalizing
    return value;
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
              <Icons.VisibleIcon
                onClick={() => handleNavigateToComp(item.comp_id)}
                style={{ color: 'rgb(13 161 199)', fontSize: '17px' }}
                className="cursor-pointer"
              />

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
                ? 'Pending'
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
              {getLabelFromValue1(item?.zonings[0]?.zone)}
            </p>
          </div>
          <div className="p-1 flex flex-col gap-[2px] border-solid border-b border-l-0 border-r-0 border-t border-[#d5d5d5]">
            {values.appraisalSpecificAdjustment?.length > 0
              ? values.appraisalSpecificAdjustment.map(
                  (adjustments: any, index: number) => {
                    const isStreetAddress =
                      adjustments.comparison_key === 'street_address';
                    const isLandSizeSF =
                      adjustments.comparison_key === 'land_size_sf';
                    const isLandSizeAcre =
                      adjustments.comparison_key === 'land_size_acre';
                    const isCityState =
                      adjustments.comparison_key === 'city_state';
                    const isDateSold =
                      adjustments.comparison_key === 'date_sold';
                    const isYearBuiltRemodeled =
                      adjustments.comparison_key ===
                      'year_built_year_remodeled';
                    const isBuildingSize =
                      adjustments.comparison_key === 'building_size';
                    const isSalePrice =
                      adjustments.comparison_key === 'sale_price';
                    const isPricePerSF =
                      adjustments.comparison_key === 'price_per_sf';
                    const isQualityCondition =
                      adjustments.comparison_key === 'quality_condition';
                    const isUnit = adjustments.comparison_key === 'unit';
                    const isHighestBestUse =
                      adjustments.comparison_key === 'highest_best_use';
                    const isBusinessName =
                      adjustments.comparison_key === 'business_name';
                    const isEffectiveAge =
                      adjustments.comparison_key === 'effective_age';
                    const isCapRate = adjustments.comparison_key === 'cap_rate';
                    const isUnitMix = adjustments.comparison_key === 'unit_mix';
                    const isPricePerUnit =
                      adjustments.comparison_key === 'price_per_unit';
                    const isCityCounty =
                      adjustments.comparison_key === 'city_county';
                    const isGrantee = adjustments.comparison_key === 'grantee';
                    const isGrantor = adjustments.comparison_key === 'grantor';
                    const isTopography =
                      adjustments.comparison_key === 'topography';
                    const isZoningType =
                      adjustments.comparison_key === 'zoning_type';
                    const isUtilitiesSelect =
                      adjustments.comparison_key === 'utilities_select';
                    const isUnitSizeSF =
                      adjustments.comparison_key === 'unit_size_sq_ft';
                    const frontage = adjustments.comparison_key === 'frontage';

                    const isPricePerAcre =
                      adjustments.comparison_key === 'price_per_acre'; // New condition for price per acre
                    const isPricePerSqFt =
                      adjustments.comparison_key === 'price_per_sf_land'; // New condition for price per square foot

                    // Logic for price_per_acre should divide by land_size_acre when comparison_key is price_per_acre
                    // const landSizeAcreValue =
                    //   item.land_dimension === 'ACRE'
                    //     ? item.land_size
                    //     : item.land_size
                    //       ? (item.land_size / 43560).toFixed(3)
                    //       : 0; // Convert land size to acres and round to 2 decimal places
                    const landSizeAcreValue =
                      dimension === 'ACRE' && item.land_dimension === 'SF'
                        ? (item.sale_price / item.land_size) * 43560
                        : dimension === 'ACRE' && item.land_dimension === 'ACRE'
                          ? item.land_size
                          : dimension === 'SF' && item.land_dimension === 'ACRE'
                            ? item.sale_price / item.land_size / 43560
                            : 0;

                    return (
                      <p
                        key={index}
                        className="text-xs font-bold h-[18px] !m-0 flex items-center text-gray-500 text-xs font-medium"
                      >
                        <span className="overflow-hidden whitespace-nowrap text-ellipsis block">
                          {isStreetAddress
                            ? item.street_address
                            : frontage && item?.frontage
                              ? item.net_operating_income
                              : isLandSizeSF
                                ? item.land_size !== null &&
                                  item.land_size !== undefined
                                  ? `${
                                      item.land_dimension === 'ACRE'
                                        ? formatNumber(
                                            Math.round(item.land_size * 43560) // Convert to SF and round to integer
                                          )
                                        : formatNumber(
                                            Math.round(item.land_size)
                                          ) // Round to integer
                                    }`
                                  : 'N/A'
                                : isLandSizeAcre
                                  ? item.land_size !== null &&
                                    item.land_size !== undefined
                                    ? `${
                                        item.land_dimension === 'SF'
                                          ? formatNumber(
                                              (item.land_size / 43560).toFixed(
                                                3
                                              ) // Retain three decimal places
                                            )
                                          : item.land_size.toLocaleString(
                                              'en-US'
                                            ) // Integer for Acre
                                      } AC`
                                    : 'N/A'
                                  : isCityState
                                    ? `${item.city}, ${fullStateName}`
                                    : isDateSold
                                      ? item.sale_status === 'Pending'
                                        ? 'Pending'
                                        : new Intl.DateTimeFormat('en-US', {
                                            month: '2-digit',
                                            day: '2-digit',
                                            year: 'numeric',
                                          }).format(
                                            new Date(
                                              new Date(
                                                item.date_sold
                                              ).toLocaleString('en-US', {
                                                timeZone: 'UTC',
                                              })
                                            )
                                          )
                                      : isYearBuiltRemodeled
                                        ? `${item.year_built || APPROACHESENUMS.NA} / ${item.year_remodeled || APPROACHESENUMS.NA}`
                                        : isBuildingSize
                                          ? item.building_size != null &&
                                            item.building_size !== 0
                                            ? formatNumber(item.building_size) // Format building size
                                            : 'N/A'
                                          : isSalePrice
                                            ? item.sale_price != null &&
                                              item.sale_price !== 0
                                              ? `$${item.sale_price.toLocaleString(
                                                  undefined,
                                                  {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                  }
                                                )}` // Format with commas and two decimals
                                              : 'N/A'
                                            : // Fallback if no value
                                              isPricePerSF
                                              ? item.price_square_foot != null
                                                ? `$${item.price_square_foot.toLocaleString(
                                                    undefined,
                                                    {
                                                      minimumFractionDigits: 2,
                                                      maximumFractionDigits: 2,
                                                    }
                                                  )}` // Format with commas and two decimals
                                                : 'N/A' // Fallback if no value
                                              : isQualityCondition
                                                ? getLabelFromValue(
                                                    item.condition
                                                  ) || ''
                                                : isUnit
                                                  ? item.total_units // Show total units for 'unit'
                                                  : isHighestBestUse
                                                    ? capitalizeWords(
                                                        item.high_and_best_user
                                                      )
                                                    : isBusinessName
                                                      ? item.business_name
                                                      : isEffectiveAge
                                                        ? item.effective_age
                                                          ? item.effective_age
                                                          : APPROACHESENUMS.NA
                                                        : isCapRate
                                                          ? item.cap_rate
                                                            ? `${formatNumber(item.cap_rate)}%`
                                                            : 'N/A'
                                                          : isUnitMix
                                                            ? `${item.total_property_beds || APPROACHESENUMS.NA}  / ${item.total_property_baths || APPROACHESENUMS.NA} `
                                                            : isPricePerUnit
                                                              ? `$${
                                                                  item.total_units ===
                                                                  0
                                                                    ? '0.00'
                                                                    : formatNumber(
                                                                        (
                                                                          item.sale_price /
                                                                          item.total_units
                                                                        ).toFixed(
                                                                          2
                                                                        )
                                                                      )
                                                                }`
                                                              : isCityCounty
                                                                ? `${item.city || APPROACHESENUMS.NA}, ${item.county || APPROACHESENUMS.NA}`
                                                                : isGrantee
                                                                  ? item.grantee ||
                                                                    APPROACHESENUMS.NA
                                                                  : isGrantor
                                                                    ? item.grantor ||
                                                                      APPROACHESENUMS.NA
                                                                    : isTopography
                                                                      ? getLabelTopographyValue(
                                                                          item.topography
                                                                        ) ||
                                                                        APPROACHESENUMS.NA
                                                                      : isZoningType
                                                                        ? item.zoning_type ||
                                                                          APPROACHESENUMS.NA
                                                                        : isUtilitiesSelect
                                                                          ? item.utilities_select ||
                                                                            APPROACHESENUMS.NA
                                                                          : isUnitSizeSF
                                                                            ? formatNumber(
                                                                                Math.max(
                                                                                  ...(item.property_units?.map(
                                                                                    (
                                                                                      unit: any
                                                                                    ) =>
                                                                                      unit.sq_ft ||
                                                                                      0
                                                                                  ) || [
                                                                                    0,
                                                                                  ])
                                                                                )
                                                                              ) // Display the maximum sq_ft value
                                                                            : isPricePerAcre
                                                                              ? landSizeAcreValue
                                                                                ? formatPrice(
                                                                                    landSizeAcreValue ||
                                                                                      1 // Prevent division by 0
                                                                                  )
                                                                                : '$0.00'
                                                                              : isPricePerSqFt
                                                                                ? item.land_dimension ===
                                                                                  'SF'
                                                                                  ? item.land_size ===
                                                                                      null ||
                                                                                    item.land_size ===
                                                                                      0
                                                                                    ? formatPrice(
                                                                                        0
                                                                                      ) // If land_size is null or 0, show $0.00
                                                                                    : formatPrice(
                                                                                        item.sale_price /
                                                                                          item.land_size
                                                                                      )
                                                                                  : item.land_size ===
                                                                                        null ||
                                                                                      item.land_size ===
                                                                                        0
                                                                                    ? formatPrice(
                                                                                        0
                                                                                      ) // If land_size is null or 0, show $0.00
                                                                                    : formatPrice(
                                                                                        item.sale_price /
                                                                                          (item.land_size *
                                                                                            43560)
                                                                                      ) // For Acres
                                                                                : // Price per square foot for Acres
                                                                                  // Price per square foot for Acres

                                                                                  // Convert land size from acres to square feet for price per sq ft
                                                                                  item
                                                                                    .appraisalSpecificAdjustment?.[
                                                                                    index
                                                                                  ]
                                                                                    ?.names}
                        </span>
                      </p>
                    );
                  }
                )
              : Array.from(
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
                )}
          </div>
          <div className="p-1 border-solid border-b border-l-0 border-r-0 border-t-0 border-[#d5d5d5]">
            <div className="w-full">
              {item.expenses?.map((expense: any, expenseIndex: any) => (
                <div key={expense.id} className="subjectPropertyCard">
                  {appraisalData?.comp_adjustment_mode === 'Dollar' ? (
                    <div className="flex items-center h-[20px]"></div>
                  ) : expense.customType === true ? (
                    <div className="flex items-center h-[20px]">
                      <TextField
                        type="text"
                        className="w-1/2 min-h-[36px] pt-[6px] [&_.MuiInputBase-formControl]:rounded-none"
                        value={expense.adj_value ? `${expense.adj_value}%` : ''}
                        onKeyDown={(e) => {
                          let nStr = expense.adj_value
                            ? `${expense.adj_value}`
                            : '';

                          // Handle when all the text is selected and backspace is pressed
                          const { selectionStart, selectionEnd }: any =
                            e.target;

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
                            (oldValues: {
                              tableData: { [x: string]: any };
                            }) => {
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
                            (oldValues: {
                              tableData: { [x: string]: any };
                            }) => {
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

                          marginRight: '13px',
                          width: '17px',
                          height: '28px',
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          setValues(
                            (oldValues: {
                              tableData: { [x: string]: any };
                            }) => {
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

                                expenses[expenseIndex].customType =
                                  isCustomValue;
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
                                  averaged_adjusted_psf:
                                    totalAverageAdjustedPsf,
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
                              ? ' text-green-500 font-semibold'
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
          <div className="px-1">
            <div className="w-full">
              {item.quantitativeAdjustments?.map(
                (expense: any, expenseIndex: any) => (
                  <div key={expense.id} className="min-h-[36.7px]">
                    <div className="flex items-center">
                      <div className="w-1/2 qualitative-dropdown">
                        <SelectTextField
                          className="custom-dropdown"
                          options={quantitativeOptions.map((option: any) => ({
                            value: option.code,
                            label: (
                              <span style={{ fontSize: '13px' }}>
                                {option.name}
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
                            // const number = parseFloat(value);
                            const isCustomValue = value === 'custom';

                            setValues(
                              (oldValues: {
                                tableData: { [x: string]: any };
                              }) => {
                                const comp = oldValues.tableData[index];
                                const quantitativeAdjustments = [
                                  ...comp.quantitativeAdjustments,
                                ];

                                // Update quantitativeAdjustments specific properties
                                quantitativeAdjustments[
                                  expenseIndex
                                ].customType = isCustomValue;
                                quantitativeAdjustments[
                                  expenseIndex
                                ].adj_value = value;

                                // Calculate the updated total and related data based on quantitativeAdjustments

                                const updatedCompData = {
                                  ...comp,
                                };

                                // Update the table data with modified quantitativeAdjustments
                                oldValues.tableData[index] = {
                                  ...updatedCompData,
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
                                  averaged_adjusted_psf:
                                    totalAverageAdjustedPsf,
                                };
                              }
                            );
                          }}
                          name={`${item.id}.quantitativeAdjustments.${expenseIndex}.adj_value`}
                        />
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="">
            <p
              className="text-xs h-10 flex text-ellipsis overflow-hidden whitespace-nowrap items-center font-medium border-below text-[#0DA1C7]  border-solid border-b border-l-0 border-r-0 border-t border-[#d5d5d5] cursor-pointer"
              onClick={() => handleOpen(item, index)}
            >
              Click to add adjustment notes
            </p>
          </div>
          <div className="mt-4 px-1 space-y-2 flex flex-col gap-2 pb-2">
            <p className="text-xs text-gray-500 !m-0 font-medium text-ellipsis overflow-hidden whitespace-nowrap">
              <SelectTextField
                className="custom-dropdown"
                value={
                  values.tableData?.[index]?.overall_comparability ||
                  selectedComparabilityOption
                }
                options={[
                  ...quantitativeOptions.map((option) => ({
                    value: option.code,
                    label: (
                      <span style={{ fontSize: '13px' }}>{option.name}</span>
                    ),
                  })),
                ]}
                onChange={(e) => {
                  const selectedValue = e.target.value;
                  setSelectedComparabilityOption(selectedValue); // Update selected option locally

                  setValues((oldValues: { tableData: any[] }) => {
                    // Spread operator works for arrays
                    const updatedTableData = [...oldValues.tableData];

                    // Get the specific row
                    const comp = updatedTableData[index] || {};

                    // Update the `overall_comparability` key
                    const updatedComp = {
                      ...comp,
                      overall_comparability: selectedValue || 'similar', // Default to "similar"
                    };

                    // Replace the specific row with the updated row
                    updatedTableData[index] = updatedComp;

                    return {
                      ...oldValues,
                      tableData: updatedTableData,
                    };
                  });

                  passcomparabilityData(selectedValue);
                }}
              />
            </p>
            <p className="text-xs text-gray-500 h-[18px] !m-0 font-medium text-ellipsis overflow-hidden whitespace-nowrap">
              {values.tableData[index].total
                ? `${Number(values.tableData[index].total).toFixed(2)}%`
                : '0%'}
            </p>

            <p className="text-xs text-gray-500 h-[18px] !m-0 font-medium text-ellipsis overflow-hidden whitespace-nowrap ">
              {values.tableData[index].adjusted_psf
                ? `$${Number(
                    values.tableData[index].adjusted_psf
                  ).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                : '$0.00'}
            </p>

            <p className="text-xs text-gray-500 h-[18px] !m-0 font-medium text-ellipsis overflow-hidden whitespace-nowrap">
              <input
                type="text"
                step="0.01" // Allows decimal values with two places
                value={
                  values.tableData[index].weight
                    ? `${values.tableData[index].weight}%`.trim()
                    : ''
                }
                onChange={(e) => handleInputChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="bg-transparent outline-none h-4 p-0 border-solid border-b border-l-0 border-r-0 border-t-0 border-[#d5d5d5] focus:border-[#0da1c7] text-gray-500 text-xs font-medium"
              />

              {error && (
                <div className="text-xs text-red-500 mt-1">{error}</div>
              )}
            </p>

            <p className="text-xs text-gray-500 h-[18px] !m-0 font-medium text-ellipsis overflow-hidden whitespace-nowrap invisible">
              {values.tableData[index].blended_adjusted_psf
                ? Number(
                    values.tableData[index].blended_adjusted_psf
                  ).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : 0}
            </p>

            <p className="text-xs text-gray-500 h-[18px] !m-0 font-medium text-ellipsis overflow-hidden whitespace-nowrap invisible ">
              {values.tableData[index].averaged_adjusted_psf
                ? `${Number(values.tableData[index].averaged_adjusted_psf)}`
                : 0}
            </p>
          </div>
        </div>
      </div>
      <EvaluationLeaseApproachAdjustmentNotesModal
        open={open}
        setOpen={setOpen}
        editorText={editorText}
        item={item}
        handleSave={handleSave}
        tableItem={tableItem}
      />
    </>
  );
}

export default EvaluationLeaseCompCard;
