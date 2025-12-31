import {
  conditionOptions,
  // frontageOptions,
  hospitalityOptions,
  industrialOptions,
  multifamilyOptions,
  officeOptions,
  residentialOptions,
  retailOptions,
  specialOptions,
  topographyOptions,
} from '@/pages/comps/create-comp/SelectOption';
import { useFormikContext } from 'formik';
import defaultPropertImage from '../../../../images/default-placeholder.png';

import { Icons } from '@/components/icons';
import SelectTextField from '@/components/styles/select-input';
import { options, usa_state } from '@/pages/comps/comp-form/fakeJson';
import { APPROACHESENUMS } from '@/pages/comps/enum/ApproachEnums';
import DeleteApproachConfirmationModal from '@/pages/comps/Listing/delete-approach-confirmation';
import { TextField } from '@mui/material';
import { useState } from 'react';
import {
  capitalizeWords,
  sanitizeInputDollarSignComps,
} from '@/utils/sanitize';
import { Link, useSearchParams } from 'react-router-dom';
// import { LandDimension } from '@/pages/appraisal/overview/OverviewEnum';
// function to calculate comps data
export const calculateCompData = ({
  total,
  weight,
  comp,
  appraisalData,
}: any) => {
  const price_square_foot = comp.price_square_foot;
  let landSize = comp.land_size;
  if (appraisalData.land_dimension == 'SF' && comp.land_dimension === 'ACRE') {
    landSize = comp.land_size * 43560;
  } else if (
    appraisalData.land_dimension == 'ACRE' &&
    comp.land_dimension === 'SF'
  ) {
    landSize = parseFloat((comp.land_size / 43560).toFixed(3));
  }
  let updatedAdjustedPsf;
  if (appraisalData?.comp_adjustment_mode === 'Dollar') {
    if (
      appraisalData.land_dimension == 'SF' &&
      comp.land_dimension === 'ACRE'
    ) {
      const landPrice = comp.land_size
        ? comp.sale_price / (comp.land_size * 43560)
        : 0;
      updatedAdjustedPsf = total + landPrice;
    } else if (
      appraisalData.land_dimension == 'ACRE' &&
      comp.land_dimension === 'SF'
    ) {
      const landPrice = comp.land_size
        ? comp.sale_price / parseFloat((comp.land_size / 43560).toFixed(3))
        : 0;
      updatedAdjustedPsf = total + landPrice;
    } else {
      const landPrice = comp.land_size ? comp.sale_price / comp.land_size : 0;
      updatedAdjustedPsf = total + landPrice;
    }
  } else {
    if (
      appraisalData.land_dimension == 'SF' &&
      comp.land_dimension === 'ACRE'
    ) {
      const landPrice = comp.land_size
        ? comp.sale_price / (comp.land_size * 43560)
        : 0;
      updatedAdjustedPsf = (total / 100) * landPrice + landPrice;
    } else if (
      appraisalData.land_dimension == 'ACRE' &&
      comp.land_dimension === 'SF'
    ) {
      const landPrice = comp.land_size
        ? comp.sale_price / parseFloat((comp.land_size / 43560).toFixed(3))
        : 0;
      updatedAdjustedPsf = (total / 100) * landPrice + landPrice;
    } else {
      const landPricePerUnit = comp.land_size ? comp.sale_price / landSize : 0;
      updatedAdjustedPsf = (total / 100) * landPricePerUnit + landPricePerUnit;
    }
  }

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

function ResidentialCostCompCard({
  index,
  item,
  values,
  totalCards,
  handleDelete,
  // dimension,
  appraisalData,
  handleChange,
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const stateMap = usa_state[0]; // Extract the first object from the array
  // State to manage modal visibility
  const fullStateName = stateMap[item?.state];
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const costId = searchParams.get('costId');
  // Function to open the modal
  const openDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };
  const totalBasementFinished = item?.res_zonings?.reduce(
    (sum: any, item: any) => {
      return sum + (item.basement_finished_sq_ft || 0);
    },
    0
  );

  const totalBasementUnfinished = item?.res_zonings?.reduce(
    (sum: any, item: any) => {
      return sum + (item.basement_unfinished_sq_ft || 0);
    },
    0
  );

  const totalBasement = totalBasementFinished + totalBasementUnfinished;
  const totalGrossLivingSqFt = item?.res_zonings?.reduce(
    (sum: any, item: any) => {
      return sum + (item.gross_living_sq_ft || 0);
    },
    0
  );
  const totalGrossLivingSqFt1 =
    (totalGrossLivingSqFt || 0).toLocaleString() + ' ' + 'SF';
  const conditionFormat = (value: any) => {
    const option = conditionOptions.find(
      (option: any) => option.value === value
    );

    if (option) {
      return option.label;
    }

    // If not found, return capitalized value
    return String(value)
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };
  // Function to close the modal
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };
  const [error, setError] = useState('');

  const { setValues } = useFormikContext<any>();
  const AdditionalAmenities = item?.res_comp_amenities
    ?.map((ele: any) => ele.additional_amenities)
    .join(' ,');

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

  // const capitalizeWords = (str: string | null | undefined): string => {
  //   return (str || '')
  //     .split(/\s+/)
  //     .map(
  //       (word: string) =>
  //         word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  //     )
  //     .join(' ');
  // };

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
              to={`/residential/evaluation/update-cost-comps/${item.comp_id}/${id}/cost/${costId}`}
              className="flex"
            >
              <Icons.VisibleIcon
                // onClick={() => handleNavigateToComp(item.comp_id)}
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
              ? `${new Intl.DateTimeFormat('en-US', {
                  month: '2-digit',
                  day: '2-digit',
                  year: 'numeric', // Ensure the full year is shown
                }).format(
                  new Date(
                    new Date(item.date_sold).toLocaleString('en-US', {
                      timeZone: 'UTC',
                    })
                  )
                )}${item.sale_status === 'Pending' ? ' (P)' : ''}`
              : ''}
          </p>
        </div>

        <div className="p-1 pb-1.5 flex flex-col gap-[2px] space-y-2 border-solid border-b border-l-0 border-r-0 border-t border-[#d5d5d5]">
          {values.appraisalSpecificAdjustment?.length > 0
            ? values.appraisalSpecificAdjustment.map(
                (adjustments: any, index: number) => {
                  const isStreetAddress =
                    adjustments.comparison_key === 'street_address';
                  const grossLivingSqFt =
                    adjustments.comparison_key === 'gross_living_area';
                  const isLandSizeSF =
                    adjustments.comparison_key === 'land_size_sf';
                  const isLandSizeAcre =
                    adjustments.comparison_key === 'land_size_acre';
                  const isCityState =
                    adjustments.comparison_key === 'city_state';
                  const isDateSold = adjustments.comparison_key === 'date_sold';
                  const isYearBuiltRemodeled =
                    adjustments.comparison_key === 'year_built_remodeled';
                  const isResZoning =
                    adjustments.comparison_key === 'zoning_type';
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
                  const netOperatingIncome =
                    adjustments.comparison_key === 'net_operating_income';
                  const frontage = adjustments.comparison_key === 'frontage';
                  const parking = adjustments.comparison_key === 'parking';
                  const utilities = adjustments.comparison_key === 'services';
                  const isUnitSizeSF =
                    adjustments.comparison_key === 'unit_size_sq_ft';
                  const isPricePerAcre =
                    adjustments.comparison_key === 'price_per_acre'; // New condition for price per acre
                  const isPricePerSqFt =
                    adjustments.comparison_key === 'price_per_sf_land'; // New condition for price per square foot
                  const heatingCooling =
                    adjustments.comparison_key === 'heating_and_cooling';
                  const otherAmenities =
                    adjustments.comparison_key === 'other_amenities';
                  const basement = adjustments.comparison_key === 'basement_sf';
                  const isGarage = adjustments.comparison_key === 'garage';
                  const isFencing = adjustments.comparison_key === 'fencing';
                  const isCondition =
                    adjustments.comparison_key === 'condition';
                  const isBedrooms = adjustments.comparison_key === 'bedrooms';
                  const isBathrooms =
                    adjustments.comparison_key === 'bathrooms';
                  const isFireplace =
                    adjustments.comparison_key === 'fireplace';
                  const isBuildingSizeLandSize =
                    adjustments.comparison_key === 'building_size_land_size';
                  const landPricePerAcre =
                    item.land_dimension === 'ACRE'
                      ? item.land_size
                        ? item.sale_price / item.land_size
                        : 0
                      : item.land_dimension === 'SF'
                        ? item.land_size
                          ? item.sale_price /
                            parseFloat((item.land_size / 43560).toFixed(3))
                          : 0
                        : 0;
                  const landPricePerSF =
                    item.land_dimension === 'ACRE'
                      ? item.land_size
                        ? item.sale_price / (item.land_size * 43560)
                        : 0
                      : item.land_dimension === 'SF'
                        ? item.land_size
                          ? item.sale_price / item.land_size
                          : 0
                        : 0;
                  let landSize = 'N/A';
                  if (item.land_size) {
                    if (
                      appraisalData.land_dimension == 'SF' &&
                      item.land_dimension == 'ACRE'
                    ) {
                      landSize = formatNumber(item.land_size * 43560) + ' SF';
                    } else if (
                      appraisalData.land_dimension == 'ACRE' &&
                      item.land_dimension == 'SF'
                    ) {
                      landSize =
                        formatNumber((item.land_size / 43560).toFixed(3)) +
                        ' AC';
                    } else {
                      if (item.land_dimension == 'SF') {
                        landSize = formatNumber(item.land_size) + ' SF';
                      } else if (item.land_dimension == 'ACRE') {
                        landSize =
                          formatNumber(item.land_size.toFixed(3)) + ' AC';
                      }
                    }
                  }
                  return (
                    <p
                      key={index}
                      className="text-xs font-bold h-[18px] !m-0 flex items-center text-gray-500 text-xs font-medium"
                    >
                      <span className="overflow-hidden whitespace-nowrap text-ellipsis block">
                        {isBuildingSizeLandSize
                          ? `${formatNumber(item.building_size)} SF / ${landSize}`
                          : isCondition
                            ? conditionFormat(item.condition)
                            : isGarage
                              ? item.garage
                              : isBedrooms
                                ? capitalizeWords(item.bedrooms)
                                : isBathrooms
                                  ? capitalizeWords(item.bathrooms)
                                  : isFireplace
                                    ? capitalizeWords(item.fireplace)
                                    : grossLivingSqFt
                                      ? totalGrossLivingSqFt1 ?? null
                                      : isFencing
                                        ? item.fencing ?? null
                                        : otherAmenities
                                          ? [
                                              AdditionalAmenities,
                                              item?.other_amenities,
                                            ]
                                              .filter(Boolean) // Removes undefined/null/empty values
                                              .join(', ')
                                          : heatingCooling
                                            ? item.heating_cooling
                                            : isResZoning
                                              ? item.zoning_type
                                              : isStreetAddress
                                                ? item.street_address
                                                : frontage
                                                  ? capitalizeWords(
                                                      item.frontage
                                                    )
                                                  : basement
                                                    ? formatNumber(
                                                        totalBasement || 0
                                                      )
                                                    : parking
                                                      ? capitalizeWords(
                                                          item.parking
                                                        )
                                                      : utilities
                                                        ? capitalizeWords(
                                                            item.utilities
                                                          )
                                                        : netOperatingIncome &&
                                                            item?.net_operating_income
                                                          ? item.net_operating_income
                                                          : isLandSizeSF
                                                            ? item.land_size !==
                                                                null &&
                                                              item.land_size !==
                                                                undefined
                                                              ? `${
                                                                  item.land_dimension ===
                                                                  'ACRE'
                                                                    ? formatNumber(
                                                                        Math.round(
                                                                          item.land_size *
                                                                            43560
                                                                        ) // Convert to SF and round to integer
                                                                      )
                                                                    : formatNumber(
                                                                        Math.round(
                                                                          item.land_size
                                                                        )
                                                                      ) // Round to integer
                                                                }`
                                                              : 'N/A'
                                                            : isLandSizeAcre
                                                              ? item.land_size !==
                                                                  null &&
                                                                item.land_size !==
                                                                  undefined
                                                                ? `${
                                                                    item.land_dimension ===
                                                                    'SF'
                                                                      ? formatNumber(
                                                                          (
                                                                            item.land_size /
                                                                            43560
                                                                          ).toFixed(
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
                                                                  ? item.sale_status ===
                                                                    'Pending'
                                                                    ? 'Pending'
                                                                    : new Intl.DateTimeFormat(
                                                                        'en-US',
                                                                        {
                                                                          month:
                                                                            '2-digit',
                                                                          day: '2-digit',
                                                                          year: 'numeric',
                                                                        }
                                                                      ).format(
                                                                        new Date(
                                                                          new Date(
                                                                            item.date_sold
                                                                          ).toLocaleString(
                                                                            'en-US',
                                                                            {
                                                                              timeZone:
                                                                                'UTC',
                                                                            }
                                                                          )
                                                                        )
                                                                      )
                                                                  : isYearBuiltRemodeled
                                                                    ? `${item.year_built || APPROACHESENUMS.NA} / ${item.year_remodeled || APPROACHESENUMS.NA}`
                                                                    : isBuildingSize
                                                                      ? item.building_size !=
                                                                          null &&
                                                                        item.building_size !==
                                                                          0
                                                                        ? formatNumber(
                                                                            item.building_size
                                                                          ) // Format building size
                                                                        : 'N/A'
                                                                      : isSalePrice
                                                                        ? item.sale_price !=
                                                                            null &&
                                                                          item.sale_price !==
                                                                            0
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
                                                                          ? formatPrice(
                                                                              landPricePerSF ||
                                                                                0
                                                                            )
                                                                          : // ? item.sale_price > 0 &&
                                                                            //   item.land_size > 0
                                                                            //   ? formatPrice(item.sale_price / item.land_size)
                                                                            //   : '0'
                                                                            isQualityCondition
                                                                            ? getLabelFromValue(
                                                                                item.condition
                                                                              ) ||
                                                                              ''
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
                                                                                      ? item.cap_rate !=
                                                                                          null &&
                                                                                        item.cap_rate !==
                                                                                          ''
                                                                                        ? `${item.cap_rate}%`
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
                                                                                                          ? landPricePerAcre
                                                                                                            ? formatPrice(
                                                                                                                landPricePerAcre ||
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
        <div className="px-1 mt-1 border-solid border-b border-l-0 border-r-0 border-t-0  border-[#d5d5d5] min-h-[26px]">
          <div className="w-full pb-0.5">
            {item.expenses?.map((expense: any, expenseIndex: any) => (
              <div key={expense.id} className="subjectPropertyCard ">
                {appraisalData?.comp_adjustment_mode === 'Dollar' ? (
                  <div className="flex items-center h-[19px]">
                    <TextField
                      type="text"
                      className="w-1/2 [&_.MuiInputBase-formControl]:rounded-none"
                      value={
                        expense.adj_value
                          ? sanitizeInputDollarSignComps(
                              parseFloat(expense.adj_value).toFixed(2)
                            )
                          : '$0.00'
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
                        } else if (e.key === 'Backspace') {
                          nStr = nStr.slice(0, -1);
                        } else if (
                          e.key === 'ArrowLeft' ||
                          e.key === 'ArrowRight' ||
                          e.key === 'Backspace'
                        ) {
                          return;
                        } else if (e.key === '-') {
                          // Allow negative sign at the start
                          // if (nStr.length === 0) {
                          nStr = ('-' + nStr)
                            .replace(/-+/g, '-')
                            .replace(/(?!^)-/g, '');
                          // }
                          // return;
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
                        },
                      }}
                    />
                  </div>
                ) : expense.customType === true ? (
                  <div className="flex items-center h-[19px]">
                    <TextField
                      type="text"
                      className="w-1/2 [&_.MuiInputBase-formControl]:rounded-none"
                      value={expense.adj_value ? `${expense.adj_value}%` : ''}
                      onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                        e.target.select();
                      }}
                      onKeyDown={(e) => {
                        let nStr = expense.adj_value
                          ? `${expense.adj_value}`
                          : '';

                        // Allow backspace
                        if (e.key === 'Backspace') {
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
                  <div className="flex items-center h-[20px]">
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
                          handleChange();
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
                            ? ' text-green-500 font-semibold'
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
                ? `${formatPrice(values.tableData[index].total)}`
                : `${Number(values.tableData[index].total).toFixed(2)}%`
              : appraisalData?.comp_adjustment_mode === 'Dollar'
                ? '$0.00'
                : '0%'}
          </p>
          <p className="text-gray-500 h-[18px] !m-0 text-xs font-medium text-ellipsis overflow-hidden whitespace-nowrap">
            {values.tableData[index].adjusted_psf
              ? `$${Number(values.tableData[index].adjusted_psf).toLocaleString(
                  undefined,
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}`
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
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                e.target.select();
              }}
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
export default ResidentialCostCompCard;
