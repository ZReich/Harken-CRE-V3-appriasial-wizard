import SelectTextField from '@/components/styles/select-input';
import defaultPropertImage from '../../../../images/default-placeholder.png';
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
import { APPROACHESENUMS } from '@/pages/comps/enum/ApproachEnums';
import { useFormikContext } from 'formik';
import ResidentialCompsAdjustmentNoteModal from './residential-sales-approach-comps-adjustment-note-modal';
import StyledField from '@/components/styles/StyleFieldEditComp';
import OtherAmenitiesModal from '@/components/modals/OtherAmenitiesModal';
import {
  capitalizeWords,
  formatPrice,
  sanitizeInputDollarSignComps,
} from '@/utils/sanitize';
import { Link, useSearchParams } from 'react-router-dom';
import { LandDimension } from '@/pages/appraisal/overview/OverviewEnum';
// import OtherAmenitiesModal from './other-amenities-modal';

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
  const updatedAdjustedPsf = total + comp.sale_price;

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
    if (exp.adj_value) {
      const valueStr = String(exp.adj_value);
      // Preserve negative sign by checking if the original value was negative
      // const isNegative = valueStr.includes('-');
      const cleanedValue = valueStr.replace(/[$,%]/g, '');
      const numValue = parseFloat(cleanedValue || '0');
      if (!isNaN(numValue)) {
        // total += isNegative ? -numValue : numValue;
        total += numValue;
      }
    }
  });

  return { total, expenses };
};

function ResidentialSalesCompCard({
  index,
  item,
  values,
  totalCards,
  appraisalData,
  handleDelete,
  handleNavigateToComp,
  setClassName,
  handleSaveAdjustmentNote,
  dimension,
  recalcBasementVersion,
  // handleSubmitForOtherAmenities,
}: {
  item: any;
  appraisalData: any;
  handleChange: any;
  handleSubmitForOtherAmenities: any;
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
  recalcBasementVersion: any;
}) {
  type QuantitativeOption = {
    code: string;
    name: string;
  };
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // State to manage modal visibility
  const [indexNumber, setIndexNumber] = useState<any>();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const salesId = searchParams.get('salesId');
  const totalGrossLivingSqFt = item?.res_zonings?.reduce(
    (sum: any, item: any) => {
      return sum + (item.gross_living_sq_ft || 0);
    },
    0
  );
  console.log('chec tuem ', values);
  const totalGrossLivingSqFt1 =
    totalGrossLivingSqFt?.toLocaleString() + ' ' + 'SF';
  interface ModalDataType {
    isOpen: boolean;
    compIndex: number | null;
    expenseIndex: number | null;
    compItem: any | null;
    hasChanges: boolean;
    initialValue?: string | null;
  }

  const [modalData, setModalData] = useState<ModalDataType>({
    isOpen: false,
    compIndex: null,
    expenseIndex: null,
    compItem: null,
    hasChanges: false,
    initialValue: null,
  });
  const [quantitativeOptions, setQuantitativeOptions] = useState<
    QuantitativeOption[]
  >([]);
  const [overallComparabilityOptions, setOverallComparabilityOptions] =
    useState([]);
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

  // const totalBasement = totalBasementFinished + totalBasementUnfinished;

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
  useEffect(() => {
    console.log('TableData changed:', values.tableData);
    values.tableData.forEach((comp: any, index: number) => {
      const otherAmenitiesExp = comp.expenses?.find(
        (exp: any) => exp.adj_key === 'other_amenities'
      );
      if (otherAmenitiesExp) {
        console.log(
          `Comp ${index} other_amenities:`,
          otherAmenitiesExp.adj_value
        );
      }
    });
  }, [values.tableData]);
  useEffect(() => {
    const updatedTableData = values.tableData.map((comp: any) => {
      const { total, expenses: updatedExpenses } = getExpensesTotal(
        comp.expenses,
        'undefined',
        null
      );

      const calculatedCompData = calculateCompData({
        total,
        weight: comp.weight,
        comp,
      });

      return {
        ...comp,
        ...calculatedCompData,
        expenses: updatedExpenses,
        total,
      };
    });

    const totalAverageAdjustedPsf = updatedTableData.reduce(
      (acc: any, item: any) => acc + item.averaged_adjusted_psf,
      0
    );

    setValues((prev: any) => ({
      ...prev,
      tableData: updatedTableData,
      averaged_adjusted_psf: totalAverageAdjustedPsf,
    }));
  }, [JSON.stringify(values.tableData)]); // 🔥 This detects deep changes

  const AdditionalAmenities = item?.res_comp_amenities
    ?.map((ele: any) => ele.additional_amenities)
    .join(' ,');
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
  console.log(overallComparabilityOptions);
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
  const formatNumber = (num: any) => {
    if (num === null || num === undefined) return 'NA';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Add this useEffect at the component level
  console.log('recalcBasementVersion', recalcBasementVersion);
  useEffect(() => {
    console.log('Basement recalc triggered');
  }, [recalcBasementVersion]);

  useEffect(() => {
    if (values.operatingExpenses && values.operatingExpenses.length > 0) {
      // Track which adj_keys have been modified
      const modifiedKeys = values.operatingExpenses
        .filter((exp: any) => exp.isModified)
        .map((exp: any) => exp.adj_key);

      if (modifiedKeys.length === 0) return;

      setValues((oldValues: any) => {
        const updatedTableData = [...oldValues.tableData];

        updatedTableData.forEach((comp, compIndex) => {
          comp.expenses.forEach((expense: any, expIndex: number) => {
            const expenseConfig = values.operatingExpenses.find(
              (exp: any) => exp.adj_key === expense.adj_key
            );
            if (!modifiedKeys.includes(expense.adj_key)) return;

            if (!expenseConfig) return;

            let configValue: number;
            if (['time', 'location', 'condition'].includes(expense.adj_key)) {
              // Preserve negative sign for percentage values
              const rawValue =
                typeof expenseConfig.adj_value === 'string'
                  ? expenseConfig.adj_value.replace(/%/g, '')
                  : expenseConfig.adj_value || 0;
              configValue = parseFloat(rawValue);
            } else {
              configValue = parseFloat(
                typeof expenseConfig.adj_value === 'string'
                  ? expenseConfig.adj_value.replace(/[$,]/g, '')
                  : expenseConfig.adj_value || 0
              );
            }

            let calculatedValue = 0;
            const salePrice = comp.sale_price || 0;

            if (['time', 'location', 'condition'].includes(expense.adj_key)) {
              calculatedValue = (salePrice * configValue) / 100;
            } else if (expense.adj_key === 'gross_living_area_sf') {
              const subjectSqFt =
                appraisalData?.res_zonings?.reduce(
                  (total: any, zone: any) =>
                    total + (parseFloat(zone.gross_living_sq_ft) || 0),
                  0
                ) || 0;

              const compSqFt =
                comp?.res_zonings?.reduce(
                  (sum: number, item: any) =>
                    sum + (Number(item.gross_living_sq_ft) || 0),
                  0
                ) ?? 0;

              calculatedValue = (subjectSqFt - compSqFt) * configValue;
            } else if (expense.adj_key === 'land_size') {
              const subjectLandSize =
                appraisalData && appraisalData.land_dimension === 'ACRE'
                  ? appraisalData.land_size * 43560
                  : // : appraisalData &&
                    //     appraisalData.land_dimension === 'ACRE' &&
                    //     comp?.land_dimension === 'ACRE'
                    appraisalData.land_size || 0;
              const compLandSize =
                appraisalData.land_dimension === 'ACRE' &&
                comp?.land_dimension === 'ACRE'
                  ? comp.land_size * 43560
                  : comp?.land_size || 0;
              calculatedValue = (subjectLandSize - compLandSize) * configValue;
              console.log(
                'land_sizeeee',
                subjectLandSize,
                compLandSize,
                configValue
              );
            } else if (expense.adj_key === 'year_built') {
              // Extract only numeric part using regex
              const extractNumeric = (val: any) => {
                const numeric = String(val).match(/\d+/g);
                return numeric ? parseInt(numeric.join('')) : 0;
              };

              const subjectYearBuilt = extractNumeric(
                appraisalData?.year_built
              );
              const compYearBuilt = extractNumeric(comp?.year_built);

              calculatedValue =
                (subjectYearBuilt - compYearBuilt) * configValue;
            } else if (expense.adj_key === 'basement') {
              const finishedConfig = values.operatingExpenses.find(
                (exp: any) => exp.adj_key === 'basement_finished'
              );
              const unfinishedConfig = values.operatingExpenses.find(
                (exp: any) => exp.adj_key === 'basement_unfinished'
              );

              const finishedValue = finishedConfig
                ? parseFloat(
                    typeof finishedConfig.adj_value === 'string'
                      ? finishedConfig.adj_value.replace(/[$%,]/g, '')
                      : finishedConfig.adj_value || 0
                  )
                : 0;

              const unfinishedValue = unfinishedConfig
                ? parseFloat(
                    typeof unfinishedConfig.adj_value === 'string'
                      ? unfinishedConfig.adj_value.replace(/[$%,]/g, '')
                      : unfinishedConfig.adj_value || 0
                  )
                : 0;

              const subjectFinishedSqFt =
                appraisalData?.res_zonings?.reduce(
                  (total: any, zone: any) =>
                    total + (zone.basement_finished_sq_ft || 0),
                  0
                ) || 0;

              const subjectUnfinishedSqFt =
                appraisalData?.res_zonings?.reduce(
                  (total: any, zone: any) =>
                    total + (zone.basement_unfinished_sq_ft || 0),
                  0
                ) || 0;

              const compFinishedSqFt =
                comp?.res_zonings?.reduce(
                  (total: any, zone: any) =>
                    total + (zone.basement_finished_sq_ft || 0),
                  0
                ) || 0;

              const compUnfinishedSqFt =
                comp?.res_zonings?.reduce(
                  (total: any, zone: any) =>
                    total + (zone.basement_unfinished_sq_ft || 0),
                  0
                ) || 0;

              const finishedAdjustment =
                (subjectFinishedSqFt - compFinishedSqFt) * finishedValue;
              const unfinishedAdjustment =
                (subjectUnfinishedSqFt - compUnfinishedSqFt) * unfinishedValue;

              calculatedValue = finishedAdjustment + unfinishedAdjustment;
            } else if (
              ['bedrooms', 'bathrooms', 'fireplace'].includes(expense.adj_key)
            ) {
              // Function to extract only numbers from strings
              const extractNumeric = (val: any) => {
                const numeric = parseFloat(String(val).replace(/[^0-9.]/g, ''));
                return isNaN(numeric) ? 0 : numeric;
              };
              const subjectCount = extractNumeric(
                appraisalData?.[expense.adj_key]
              );
              const compCount = extractNumeric(comp?.[expense.adj_key]);
              console.log('bedroomsmsss', subjectCount, compCount);

              calculatedValue = (subjectCount - compCount) * configValue;
            }

            updatedTableData[compIndex].expenses[expIndex].adj_value =
              `$${calculatedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            if (expense.adj_key === 'land_size') {
              let comparison = 'Equal';
              if (Number(appraisalData?.land_size) > Number(comp?.land_size)) {
                comparison = 'Superior';
              } else if (
                Number(appraisalData?.land_size) < Number(comp?.land_size)
              ) {
                comparison = 'Inferior';
              }
              updatedTableData[compIndex].expenses[
                expIndex
              ].land_size_comparison = comparison;
            }
          });
        });

        const updatedTableDataWithTotals = updatedTableData.map((comp) => {
          const total = comp.expenses.reduce(
            (acc: any, exp: any) =>
              acc +
              parseFloat(
                typeof exp.adj_value === 'string'
                  ? exp.adj_value.replace(/[$,%]/g, '')
                  : exp.adj_value || 0
              ),
            0
          );

          const calculatedCompData = calculateCompData({
            total,
            weight: comp.weight,
            comp,
          });

          return {
            ...comp,
            ...calculatedCompData,
            total,
          };
        });

        const totalAverageAdjustedPsf = updatedTableDataWithTotals.reduce(
          (acc, item) => acc + item.averaged_adjusted_psf,
          0
        );

        return {
          ...oldValues,
          tableData: updatedTableDataWithTotals,
          averaged_adjusted_psf: totalAverageAdjustedPsf,
        };
      });

      // ✅ Optional: Reset isModified after update
      setValues((prev: any) => {
        const resetModified = prev.operatingExpenses.map((exp: any) => ({
          ...exp,
          isModified: false,
        }));

        return {
          ...prev,
          operatingExpenses: resetModified,
        };
      });
    }
  }, [values.operatingExpenses, appraisalData, recalcBasementVersion]);

  const handleOpenOtherAmenitiesModal = (
    index: any,
    expenseIndex: any,
    item: any
  ) => {
    // Store original state before opening modal
    setOriginalState({
      tableData: [...values.tableData],
      averaged_adjusted_psf: values.averaged_adjusted_psf,
    });

    // Find the other_amenities expense
    const otherAmenitiesExpense = item.expenses.find(
      (exp: any) => exp.adj_key === 'other_amenities'
    );

    // Get the current value
    const currentValue = otherAmenitiesExpense?.adj_value || '$0.00';

    // Set modal data
    setModalData({
      isOpen: true,
      compIndex: index,
      expenseIndex,
      compItem: item,
      hasChanges: false,
      initialValue: currentValue, // Store the initial value
    });

    // If there are no extra amenities yet but there's a value in the expense,
    // create an initial amenity with that value
    if (
      item.extra_amenities?.length === 0 &&
      otherAmenitiesExpense?.adj_value &&
      otherAmenitiesExpense.adj_value !== '$0.00'
    ) {
      // Create an initial amenity with the existing value
      const initialAmenities = [
        {
          another_amenity_name: 'Initial Value',
          another_amenity_value: otherAmenitiesExpense.adj_value,
          is_from_expense: true, // Mark this as coming from the expense
        },
      ];

      // Update the comp with these initial amenities
      setValues((oldValues: any) => {
        const updatedTableData = [...oldValues.tableData];
        const comp = updatedTableData[index];

        // Set the initial amenities
        updatedTableData[index] = {
          ...comp,
          extra_amenities: initialAmenities,
        };

        return {
          ...oldValues,
          tableData: updatedTableData,
        };
      });
    }
  };

  const amenityOptions = [
    'Patio (Uncovered)',
    'Patio (Covered)',
    'Deck (Uncovered)',
    'Deck (Covered)',
    'Underground Sprinklers',
    'Shed',
    'Pool',
    'Hot Tub',
    'Outdoor Kitchen',
    'Landscaping',
  ];

  const handleCloseOtherAmenitiesModal = () => {
    if (modalData.compIndex !== null && modalData.expenseIndex !== null) {
      setValues((oldValues: any) => {
        const compIndex = modalData.compIndex as number;
        // const expenseIndex = modalData.expenseIndex as number;
        const comp = oldValues.tableData[compIndex];
        const expenses = [...comp.expenses];

        const extraAmenities = [...(comp.extra_amenities || [])];

        // Calculate total another_amenity_value
        let totalValue = 0;

        extraAmenities.forEach((item: any) => {
          const rawValue = item.another_amenity_value;

          const numValue = parseFloat(
            typeof rawValue === 'string'
              ? rawValue.replace(/[$,%\,]/g, '') // remove commas, dollar signs, %
              : rawValue || 0
          );

          if (!isNaN(numValue)) {
            totalValue += numValue;
          }
        });

        const formattedValue = `$${totalValue.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;

        // Update "other_amenities" in expenses
        const otherAmenitiesIndex = expenses.findIndex(
          (exp) => exp.adj_key === 'other_amenities'
        );

        if (otherAmenitiesIndex !== -1) {
          expenses[otherAmenitiesIndex] = {
            ...expenses[otherAmenitiesIndex],
            adj_value: formattedValue,
            another_amenity_value: totalValue.toFixed(2),
          };
        }

        // Calculate totals and update state
        const weight = comp.weight;

        const { total, expenses: updatedExpenses } = getExpensesTotal(
          expenses,
          otherAmenitiesIndex,
          totalValue.toFixed(2)
        );

        const calculatedCompData = calculateCompData({
          total,
          weight,
          comp,
        });

        const updatedComp = {
          ...comp,
          ...calculatedCompData,
          expenses: updatedExpenses,
          total,
          extra_amenities: extraAmenities,
        };

        const updatedTableData = [...oldValues.tableData];
        updatedTableData[compIndex] = updatedComp;

        return {
          ...oldValues,
          tableData: updatedTableData,
          averaged_adjusted_psf: updatedTableData.reduce(
            (acc, item) => acc + item.averaged_adjusted_psf,
            0
          ),
        };
      });

      // setTimeout(() => {
      //   handleSubmitForOtherAmenities();
      // }, 100);
    }

    setModalData({
      isOpen: false,
      compIndex: null,
      expenseIndex: null,
      compItem: null,
      hasChanges: false,
    });
  };
  console.log('expensesssssss', item.expenses);
  const [originalState, setOriginalState] = useState<any>(null);

  const handleCloseOtherAmenitiesModalWithoutSaving = () => {
    // Restore original state if it exists
    if (originalState) {
      setValues({
        ...values,
        tableData: originalState.tableData,
        averaged_adjusted_psf: originalState.averaged_adjusted_psf,
      });
      setOriginalState(null);
    }

    setModalData({
      isOpen: false,
      compIndex: null,
      expenseIndex: null,
      compItem: null,
      hasChanges: false,
    });
  };
  // Filter out default extra amenities from expenses
  const filteredExpenses = item.expenses?.filter(
    (exp: any) => !amenityOptions.includes(exp.adj_name)
  );
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
                to={`/residential/update-sales-comps/${item.comp_id}/${id}/sales/${salesId}`}
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
              {item.date_sold
                ? `${new Intl.DateTimeFormat('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                    year: 'numeric',
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
          <div className="p-1 flex flex-col gap-[2px] space-y-2 border-solid border-b border-l-0 border-r-0 border-t border-[#d5d5d5]">
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
                    const bedroom = adjustments.comparison_key === 'bedrooms';
                    const bathrooms =
                      adjustments.comparison_key === 'bathrooms';
                    const fencing = adjustments.comparison_key === 'fencing';
                    const zoning = adjustments.comparison_key === 'zoning_type';
                    const fireplace =
                      adjustments.comparison_key === 'fireplace';
                    const grossLivingSqFt =
                      adjustments.comparison_key === 'gross_living_area';
                    const basement =
                      adjustments.comparison_key === 'basement_sf';
                    const isYearBuiltRemodeled =
                      adjustments.comparison_key === 'year_built_remodeled';
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

                    const netOperatingIncome =
                      adjustments.comparison_key === 'net_operating_income';
                    const frontage = adjustments.comparison_key === 'frontage';
                    const parking = adjustments.comparison_key === 'parking';
                    const utilities = adjustments.comparison_key === 'services';
                    const isPricePerAcre =
                      adjustments.comparison_key === 'price_per_acre'; // New condition for price per acre
                    const isPricePerSqFt =
                      adjustments.comparison_key === 'price_per_sf_land'; // New condition for price per square foot
                    const isBuildingSizeLandSize =
                      adjustments.comparison_key === 'building_size_land_size';
                    const landSizeAcreValue =
                      dimension === 'ACRE' && item.land_dimension === 'SF'
                        ? (item.sale_price / item.land_size) * 43560
                        : dimension === 'ACRE' && item.land_dimension === 'ACRE'
                          ? item.sale_price / item.land_size
                          : dimension === 'SF' && item.land_dimension === 'ACRE'
                            ? item.sale_price / item.land_size / 43560
                            : 0;
                    const heatingCooling =
                      adjustments.comparison_key === 'heating_and_cooling';
                    const otherAmenities =
                      adjustments.comparison_key === 'other_amenities';
                    const isGarage = adjustments.comparison_key === 'garage';
                    const isCondition =
                      adjustments.comparison_key === 'condition';

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

                    const totalBasement =
                      totalBasementFinished + totalBasementUnfinished;
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
                                : otherAmenities
                                  ? [AdditionalAmenities, item?.other_amenities]
                                      .filter(Boolean) // Removes undefined/null/empty values
                                      .join(', ')
                                  : heatingCooling
                                    ? item.heating_cooling
                                    : isStreetAddress
                                      ? item.street_address
                                      : frontage
                                        ? capitalizeWords(item.frontage)
                                        : parking
                                          ? capitalizeWords(item.parking)
                                          : utilities
                                            ? capitalizeWords(item.utilities)
                                            : netOperatingIncome &&
                                                item?.net_operating_income
                                              ? item.net_operating_income
                                              : netOperatingIncome &&
                                                  item?.net_operating_income
                                                ? item.net_operating_income
                                                : isLandSizeSF
                                                  ? item.land_size !== null &&
                                                    item.land_size !== undefined
                                                    ? `${
                                                        item.land_dimension ===
                                                        LandDimension.ACRE
                                                          ? Math.round(
                                                              (item.land_size ||
                                                                0) * 43560
                                                            ).toLocaleString() // Convert to SF and round to integer
                                                          : Math.round(
                                                              item.land_size ||
                                                                0
                                                            ).toLocaleString() // Round to integer
                                                      }`
                                                    : // ? `${
                                                      //     item.land_dimension ===
                                                      //     'ACRE'
                                                      //       ? formatNumber(
                                                      //           Math.round(
                                                      //             item.land_size *
                                                      //               43560
                                                      //           ) // Convert to SF and round to integer
                                                      //         )
                                                      //       : formatNumber(
                                                      //           Math.round(
                                                      //             item.land_size
                                                      //           )
                                                      //         ) // Round to integer
                                                      //   }`
                                                      'N/A'
                                                  : isLandSizeAcre
                                                    ? item.land_size !== null &&
                                                      item.land_size !==
                                                        undefined
                                                      ? `${
                                                          item.land_dimension ===
                                                          'SF'
                                                            ? formatNumber(
                                                                (
                                                                  item.land_size /
                                                                  43560
                                                                ).toFixed(3) // Retain three decimal places
                                                              )
                                                            : item.land_size.toLocaleString(
                                                                'en-US'
                                                              ) // Integer for Acre
                                                        } AC`
                                                      : 'N/A'
                                                    : isCityState
                                                      ? `${item.city}, ${fullStateName}`
                                                      : bedroom
                                                        ? capitalizeWords(
                                                            item.bedrooms
                                                          )
                                                        : bathrooms
                                                          ? capitalizeWords(
                                                              item.bathrooms
                                                            )
                                                          : fireplace
                                                            ? capitalizeWords(
                                                                item.fireplace
                                                              )
                                                            : fencing
                                                              ? item.fencing
                                                              : isDateSold
                                                                ? item.sale_status ===
                                                                  'Pending'
                                                                  ? 'P'
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
                                                                : basement
                                                                  ? formatNumber(
                                                                      totalBasement ||
                                                                        0
                                                                    )
                                                                  : grossLivingSqFt
                                                                    ? totalGrossLivingSqFt1 ??
                                                                      null
                                                                    : zoning
                                                                      ? item.zoning_type
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
                                                                              ? item.price_square_foot !=
                                                                                null
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
          <div className="px-1 pt-[3px] pb-1.5 border-solid border-b border-l-0 border-r-0 border-t-0 border-[#d5d5d5]">
            <div className="w-full">
              {filteredExpenses?.map((expense: any, expenseIndex: any) => {
                if (
                  expense.adj_key === 'basement_finished' ||
                  expense.adj_name === 'Basement Finished' ||
                  expense.adj_key === 'basement_unfinished' ||
                  expense.adj_name === 'Basement Unfinished'
                ) {
                  return null;
                }
                const isOtherAmenities = expense.adj_key === 'other_amenities';

                return (
                  <div key={expense.id} className="subjectPropertyCard">
                    <div className="flex items-center h-[19.1px]">
                      <div className="w-1/2">
                        {isOtherAmenities ? (
                          <div
                            style={{
                              borderBottom: '1px solid #ccc',
                            }}
                            className="cursor-pointer text-blue-500 underline text-xs py-0 bg-inherit min-h-[18px]"
                            onClick={() =>
                              handleOpenOtherAmenitiesModal(
                                index,
                                expenseIndex,
                                item
                              )
                            }
                          >
                            {(() => {
                              let total = 0;

                              // Add extra_amenities values
                              if (
                                item.extra_amenities &&
                                item.extra_amenities.length > 0
                              ) {
                                item.extra_amenities.forEach((amenity: any) => {
                                  if (amenity.another_amenity_value) {
                                    const valueStr = String(
                                      amenity.another_amenity_value
                                    );
                                    if (valueStr.trim() !== '') {
                                      // Preserve negative sign by checking if the original value was negative
                                      // const isNegative = valueStr.includes('-');
                                      const cleanValue = valueStr.replace(
                                        /[$,]/g,
                                        ''
                                      );
                                      const numValue =
                                        parseFloat(cleanValue) || 0;
                                      if (!isNaN(numValue)) {
                                        // total += isNegative
                                        //   ? -numValue
                                        //   : numValue;
                                        total += numValue;
                                      }
                                    }
                                  }
                                });
                              }

                              // Add specific amenity expenses
                              const amenityKeys = [
                                'patio_uncovered',
                                'patio_covered',
                                'deck_uncovered',
                                'deck_covered',
                                'underground_sprinklers',
                                'shed',
                                'pool',
                                'hot_tub',
                                'outdoor_kitchen',
                                'landscaping',
                              ];

                              if (item.expenses) {
                                item.expenses.forEach((exp: any) => {
                                  if (
                                    amenityKeys.includes(exp.adj_key) &&
                                    exp.adj_value
                                  ) {
                                    const valueStr = exp.adj_value.toString();
                                    // Preserve negative sign by checking if the original value was negative
                                    // const isNegative = valueStr.includes('-');
                                    const cleanValue = valueStr.replace(
                                      /[$,]/g,
                                      ''
                                    );
                                    const numValue =
                                      parseFloat(cleanValue) || 0;
                                    if (!isNaN(numValue)) {
                                      // total += isNegative
                                      //   ? -numValue
                                      //   : numValue;
                                      total += numValue;
                                    }
                                  }
                                });
                              }

                              return total > 0
                                ? `$${total.toFixed(2)}`
                                : expense.original_adj_value ||
                                    expense.adj_value ||
                                    'Add adjustments';
                            })()}
                          </div>
                        ) : (
                          <StyledField
                            type="text"
                            name={`${item.id}.expenses.${expenseIndex}.adj_value`}
                            // value={expense.adj_value || '$0.00'} // Set default value to $0.00
                            value={(() => {
                              const val = expense.adj_value || '$0.00';
                              if (val === '$0.00') return val;

                              // Handle different types of values
                              const numericValue =
                                typeof val === 'string'
                                  ? parseFloat(val.replace(/[$,]/g, ''))
                                  : typeof val === 'number'
                                    ? val
                                    : 0;
                              const prefix = numericValue < 0 ? '-$' : '$';
                              return isNaN(numericValue)
                                ? val
                                : `${prefix}${(numericValue < 0 ? numericValue * -1 : numericValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                            })()}
                            onFocus={(e) => {
                              e.target.select(); // Select all text on focus
                            }}
                            onChange={(e) => {
                              // Prevent default onChange to avoid conflicts
                              e.preventDefault();
                            }}
                            onKeyDown={(e) => {
                              const target = e.target as HTMLInputElement;
                              const { selectionStart, selectionEnd } = target;
                              const currentValue = target.value || '';
                              const isFullSelection =
                                selectionStart === 0 &&
                                selectionEnd === currentValue.length;

                              // Handle negative sign
                              if (e.key === '-') {
                                e.preventDefault();
                                const numericPart = currentValue.replace(
                                  /[^0-9.-]/g,
                                  ''
                                );
                                const currentNum = parseFloat(numericPart) || 0;

                                // If field is empty or showing $0.00, start with negative
                                if (
                                  isFullSelection ||
                                  currentValue === '$0.00' ||
                                  currentValue === '' ||
                                  currentValue === '0' ||
                                  currentValue === '0.00' ||
                                  currentValue === '$0' ||
                                  parseFloat(
                                    currentValue.replace(/[$,]/g, '')
                                  ) === 0
                                ) {
                                  const formattedValue = '-$0.00';

                                  setValues(
                                    (oldValues: {
                                      tableData: { [x: string]: any };
                                    }) => {
                                      const comp = oldValues.tableData[index];
                                      const expenses = [...comp.expenses];
                                      const weight = comp.weight;
                                      const {
                                        total,
                                        expenses: updatedExpenses,
                                      } = getExpensesTotal(
                                        expenses,
                                        expenseIndex,
                                        formattedValue
                                      );

                                      // Add land_size comparison logic
                                      if (expense.adj_key === 'land_size') {
                                        const subjectLandSize = Math.abs(
                                          appraisalData?.land_size || 0
                                        );
                                        const compLandSize = Math.abs(
                                          item.land_size || 0
                                        );

                                        let comparison = 'Equal';
                                        if (subjectLandSize > compLandSize) {
                                          comparison = 'Superior';
                                        } else if (
                                          subjectLandSize < compLandSize
                                        ) {
                                          comparison = 'Inferior';
                                        }

                                        updatedExpenses[expenseIndex] = {
                                          ...updatedExpenses[expenseIndex],
                                          land_size_comparison: comparison,
                                        };
                                      }

                                      const calculatedCompData =
                                        calculateCompData({
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
                                          (acc: any, item: any) =>
                                            acc + item.averaged_adjusted_psf,
                                          0
                                        );
                                      return {
                                        ...oldValues,
                                        averaged_adjusted_psf:
                                          totalAverageAdjustedPsf,
                                      };
                                    }
                                  );
                                  return;
                                }

                                // Otherwise, toggle the sign of existing value
                                const newValue = (-currentNum).toString();
                                const formattedValue =
                                  sanitizeInputDollarSignComps(newValue);

                                setValues(
                                  (oldValues: {
                                    tableData: { [x: string]: any };
                                  }) => {
                                    const comp = oldValues.tableData[index];
                                    const expenses = [...comp.expenses];
                                    const weight = comp.weight;
                                    const { total, expenses: updatedExpenses } =
                                      getExpensesTotal(
                                        expenses,
                                        expenseIndex,
                                        formattedValue
                                      );

                                    // Add land_size comparison logic
                                    if (expense.adj_key === 'land_size') {
                                      const subjectLandSize = Math.abs(
                                        appraisalData?.land_size || 0
                                      );
                                      const compLandSize = Math.abs(
                                        item.land_size || 0
                                      );

                                      let comparison = 'Equal';
                                      if (subjectLandSize > compLandSize) {
                                        comparison = 'Superior';
                                      } else if (
                                        subjectLandSize < compLandSize
                                      ) {
                                        comparison = 'Inferior';
                                      }

                                      updatedExpenses[expenseIndex] = {
                                        ...updatedExpenses[expenseIndex],
                                        land_size_comparison: comparison,
                                      };
                                    }

                                    const calculatedCompData =
                                      calculateCompData({
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
                                        (acc: any, item: any) =>
                                          acc + item.averaged_adjusted_psf,
                                        0
                                      );
                                    return {
                                      ...oldValues,
                                      averaged_adjusted_psf:
                                        totalAverageAdjustedPsf,
                                    };
                                  }
                                );
                                return;
                              }

                              // Handle backspace
                              if (e.key === 'Backspace') {
                                e.preventDefault();
                                const numericPart = currentValue.replace(
                                  /[^0-9.-]/g,
                                  ''
                                );
                                const currentNum = parseFloat(numericPart) || 0;
                                const isNegative = currentNum < 0;
                                const absoluteValue = Math.abs(currentNum);

                                // Convert to cents, remove rightmost digit, then convert back
                                const currentCents = Math.round(
                                  absoluteValue * 100
                                );
                                const newCents = Math.floor(currentCents / 10);
                                const newValue = newCents / 100;
                                const finalValue = isNegative
                                  ? -newValue
                                  : newValue;

                                const formattedValue =
                                  sanitizeInputDollarSignComps(
                                    finalValue.toString()
                                  );

                                setValues(
                                  (oldValues: {
                                    tableData: { [x: string]: any };
                                  }) => {
                                    const comp = oldValues.tableData[index];
                                    const expenses = [...comp.expenses];
                                    const weight = comp.weight;
                                    const { total, expenses: updatedExpenses } =
                                      getExpensesTotal(
                                        expenses,
                                        expenseIndex,
                                        formattedValue
                                      );

                                    // Add land_size comparison logic
                                    if (expense.adj_key === 'land_size') {
                                      const subjectLandSize = Math.abs(
                                        appraisalData?.land_size || 0
                                      );
                                      const compLandSize = Math.abs(
                                        item.land_size || 0
                                      );

                                      let comparison = 'Equal';
                                      if (subjectLandSize > compLandSize) {
                                        comparison = 'Superior';
                                      } else if (
                                        subjectLandSize < compLandSize
                                      ) {
                                        comparison = 'Inferior';
                                      }

                                      updatedExpenses[expenseIndex] = {
                                        ...updatedExpenses[expenseIndex],
                                        land_size_comparison: comparison,
                                      };
                                    }

                                    const calculatedCompData =
                                      calculateCompData({
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
                                        (acc: any, item: any) =>
                                          acc + item.averaged_adjusted_psf,
                                        0
                                      );
                                    return {
                                      ...oldValues,
                                      averaged_adjusted_psf:
                                        totalAverageAdjustedPsf,
                                    };
                                  }
                                );
                                return;
                              }

                              // Allow navigation keys
                              if (
                                [
                                  'ArrowLeft',
                                  'ArrowRight',
                                  'Home',
                                  'End',
                                  'Tab',
                                ].includes(e.key)
                              ) {
                                return;
                              }

                              // Prevent all other keys
                              e.preventDefault();

                              // Handle number input when text is selected or field is empty
                              if (/^[0-9]$/.test(e.key)) {
                                e.preventDefault();

                                let newValue: string;
                                if (
                                  isFullSelection ||
                                  currentValue === '$0.00'
                                ) {
                                  // Start fresh with new number
                                  newValue = e.key;
                                } else {
                                  // Add to existing value
                                  const numericPart = currentValue.replace(
                                    /[^0-9.-]/g,
                                    ''
                                  );
                                  newValue = numericPart + e.key;
                                }

                                const formattedValue =
                                  sanitizeInputDollarSignComps(newValue);

                                setValues(
                                  (oldValues: {
                                    tableData: { [x: string]: any };
                                  }) => {
                                    const comp = oldValues.tableData[index];
                                    const expenses = [...comp.expenses];
                                    const weight = comp.weight;
                                    const { total, expenses: updatedExpenses } =
                                      getExpensesTotal(
                                        expenses,
                                        expenseIndex,
                                        formattedValue
                                      );

                                    // Add land_size comparison logic
                                    if (expense.adj_key === 'land_size') {
                                      const subjectLandSize = Math.abs(
                                        appraisalData?.land_size || 0
                                      );
                                      const compLandSize = Math.abs(
                                        item.land_size || 0
                                      );

                                      let comparison = 'Equal';
                                      if (subjectLandSize > compLandSize) {
                                        comparison = 'Superior';
                                      } else if (
                                        subjectLandSize < compLandSize
                                      ) {
                                        comparison = 'Inferior';
                                      }

                                      updatedExpenses[expenseIndex] = {
                                        ...updatedExpenses[expenseIndex],
                                        land_size_comparison: comparison,
                                      };
                                    }

                                    const calculatedCompData =
                                      calculateCompData({
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
                                        (acc: any, item: any) =>
                                          acc + item.averaged_adjusted_psf,
                                        0
                                      );
                                    return {
                                      ...oldValues,
                                      averaged_adjusted_psf:
                                        totalAverageAdjustedPsf,
                                    };
                                  }
                                );
                                return;
                              }

                              // Handle backspace
                              if (e.key === 'Backspace') {
                                e.preventDefault();

                                let newValue: string;
                                if (isFullSelection) {
                                  // Clear everything if all is selected
                                  newValue = '0';
                                } else {
                                  // Remove characters from the numeric part only
                                  const numericPart = currentValue.replace(
                                    /[^0-9.-]/g,
                                    ''
                                  );
                                  if (numericPart.length <= 1) {
                                    newValue = '0';
                                  } else {
                                    // Remove last character from numeric part
                                    newValue = numericPart.slice(0, -1);
                                  }
                                }

                                const formattedValue =
                                  sanitizeInputDollarSignComps(newValue);

                                setValues(
                                  (oldValues: {
                                    tableData: { [x: string]: any };
                                  }) => {
                                    const comp = oldValues.tableData[index];
                                    const expenses = [...comp.expenses];
                                    const weight = comp.weight;
                                    const { total, expenses: updatedExpenses } =
                                      getExpensesTotal(
                                        expenses,
                                        expenseIndex,
                                        formattedValue
                                      );

                                    const calculatedCompData =
                                      calculateCompData({
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
                                        (acc: any, item: any) =>
                                          acc + item.averaged_adjusted_psf,
                                        0
                                      );

                                    return {
                                      ...oldValues,
                                      averaged_adjusted_psf:
                                        totalAverageAdjustedPsf,
                                    };
                                  }
                                );
                                return;
                              }

                              // Handle negative sign
                              if (e.key === '-') {
                                e.preventDefault();
                                const numericPart = currentValue.replace(
                                  /[^0-9.]/g,
                                  ''
                                );
                                const isNegative = currentValue.includes('-');

                                let newValue: string;
                                if (isNegative) {
                                  // Remove negative sign
                                  newValue = numericPart;
                                } else {
                                  // Add negative sign
                                  newValue = '-' + numericPart;
                                }

                                const formattedValue =
                                  sanitizeInputDollarSignComps(newValue);

                                setValues(
                                  (oldValues: {
                                    tableData: { [x: string]: any };
                                  }) => {
                                    const comp = oldValues.tableData[index];
                                    const expenses = [...comp.expenses];
                                    const weight = comp.weight;
                                    const { total, expenses: updatedExpenses } =
                                      getExpensesTotal(
                                        expenses,
                                        expenseIndex,
                                        formattedValue
                                      );

                                    const calculatedCompData =
                                      calculateCompData({
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
                                        (acc: any, item: any) =>
                                          acc + item.averaged_adjusted_psf,
                                        0
                                      );

                                    return {
                                      ...oldValues,
                                      averaged_adjusted_psf:
                                        totalAverageAdjustedPsf,
                                    };
                                  }
                                );
                                return;
                              }

                              // Handle decimal point
                              if (e.key === '.') {
                                const numericPart = currentValue.replace(
                                  /[^0-9.-]/g,
                                  ''
                                );
                                if (numericPart.includes('.')) {
                                  e.preventDefault();
                                  return;
                                }
                              }

                              // Allow navigation keys
                              if (
                                [
                                  'ArrowLeft',
                                  'ArrowRight',
                                  'Tab',
                                  'Delete',
                                  'Home',
                                  'End',
                                ].includes(e.key)
                              ) {
                                return;
                              }

                              // Block all other keys
                              if (!/^[0-9.]$/.test(e.key)) {
                                e.preventDefault();
                                return;
                              }
                            }}
                            style={{
                              fontSize: '12px',
                              borderBottomWidth: '1px',
                              color: 'black',
                              width: '100%',
                              minHeight: '36px',
                              fontWeight: 400,
                              backgroundColor: 'transparent',
                            }}
                          />
                        )}
                      </div>
                      <span
                        className={`text-sm font-normal ${
                          expense.adj_key === 'land_size'
                            ? expense.land_size_comparison === 'Superior'
                              ? 'text-green-500 font-semibold'
                              : expense.land_size_comparison === 'Inferior'
                                ? 'text-red-500 font-semibold'
                                : 'text-gray-500' // For "Equal"
                            : parseFloat(
                                  typeof expense.adj_value === 'string'
                                    ? expense.adj_value.replace(/[$,%]/g, '')
                                    : expense.adj_value || '0'
                                ) > 0
                              ? 'text-red-500 font-semibold'
                              : parseFloat(
                                    typeof expense.adj_value === 'string'
                                      ? expense.adj_value.replace(/[$,%]/g, '')
                                      : expense.adj_value || '0'
                                  ) < 0
                                ? 'text-green-500 font-semibold'
                                : 'text-gray-500'
                        }`}
                      >
                        {expense.adj_key === 'land_size'
                          ? expense.land_size_comparison || 'Equal'
                          : parseFloat(
                                typeof expense.adj_value === 'string'
                                  ? expense.adj_value.replace(/[$,%]/g, '')
                                  : expense.adj_value || '0'
                              ) > 0
                            ? 'Inferior'
                            : parseFloat(
                                  typeof expense.adj_value === 'string'
                                    ? expense.adj_value.replace(/[$,%]/g, '')
                                    : expense.adj_value || '0'
                                ) < 0
                              ? 'Superior'
                              : 'Equal'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="p-1 pt-[3px]">
            <div className="w-full">
              {item.quantitativeAdjustments?.map(
                (expense: any, expenseIndex: any) => (
                  <div key={expense.id} className="h-[20px]">
                    <div className="flex items-center">
                      <div className="w-1/2 qualitative-dropdown manageDropdownField ">
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
                            // const isCustomValue = value === 'custom';

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
                                ].adj_value = value;
                                // iveAdjustments[expenseIndex].customType =
                                //   isCustomValue;
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
          <div className="mt-4 px-1 space-y-2 flex flex-col gap-1 pb-2">
            <p className="text-xs text-gray-500 h-[18px] !m-0 font-medium text-ellipsis overflow-hidden whitespace-nowrap">
              {`${formatPrice(values.tableData[index].total || 0)}`}
            </p>

            <p className="text-xs text-gray-500 h-[18px] !m-0 font-medium text-ellipsis overflow-hidden whitespace-nowrap ">
              {`${formatPrice(values.tableData[index].adjusted_psf || 0)}`}
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

            {/* <p className="text-xs text-gray-500 h-[18px] !m-0 font-medium text-ellipsis overflow-hidden whitespace-nowrap invisible ">
              {values.tableData[index].averaged_adjusted_psf
                ? `${Number(values.tableData[index].averaged_adjusted_psf)}`
                : 0}
            </p> */}
          </div>
        </div>
      </div>
      <ResidentialCompsAdjustmentNoteModal
        open={open}
        setOpen={setOpen}
        editorText={editorText}
        item={item}
        handleSave={handleSave}
        tableItem={tableItem}
        indexNumber={indexNumber}
        values={values}
      />
      {modalData.compIndex !== null && (
        <OtherAmenitiesModal
          isOpen={modalData.isOpen}
          onClose={handleCloseOtherAmenitiesModal}
          onModalClose={handleCloseOtherAmenitiesModalWithoutSaving}
          amenityOptions={amenityOptions}
          appraisalData={appraisalData}
          selectedItem={modalData.compItem}
          compIndex={modalData.compIndex}
          compDetails={item}
        />
      )}
    </>
  );
}

export default ResidentialSalesCompCard;
