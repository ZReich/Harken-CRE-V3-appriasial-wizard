import React, { useMemo, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { useFormikContext } from 'formik';
import AmenityTableRow from './AmenityTableRow';
import {
  AmenityItem,
  calculateAmenityTotal,
} from '../../utils/calculateAmenityTotal';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { sanitizeInputDollarSignComps } from '@/utils/sanitize';

enum ButtonTypes {
  CANCEL = 'Cancel',
  SAVE = 'Save',
}

interface OtherAmenitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onModalClose: () => void;
  compIndex: number;
  amenityOptions?: string[];
  appraisalData?: any;
  selectedItem?: any;
  compDetails: any;
}

const OtherAmenitiesModal: React.FC<OtherAmenitiesModalProps> = ({
  isOpen,
  onClose,
  compIndex,
  onModalClose,
  compDetails,
}) => {
  const { values, setValues } = useFormikContext<any>();
  const [evaluationAmenities, setEvaluationAmenities] = useState<any[]>([]);
  const [searchParams] = useSearchParams();

  const id = searchParams.get('id');
  console.log('compDetails', compDetails);
  // Fetch evaluation amenities data
  useEffect(() => {
    const fetchEvaluationAmenities = async () => {
      try {
        const response = await axios.get(`res-evaluations/get/${id}`);
        const amenities =
          response?.data?.data?.data?.res_evaluation_amenities || [];
        setEvaluationAmenities(amenities);
      } catch (error) {
        console.error('Error fetching evaluation amenities:', error);
      }
    };

    if (isOpen) {
      fetchEvaluationAmenities();
    }
  }, [isOpen]);

  // Get extra_amenities from tableData for this comp
  const extraAmenities = useMemo(() => {
    return compIndex !== null && values.tableData[compIndex]
      ? values.tableData[compIndex].extra_amenities || []
      : [];
  }, [values.tableData, compIndex]);

  const expenses: any[] = useMemo(() => {
    return compIndex !== null && values.tableData[compIndex]
      ? values.tableData[compIndex].expenses || []
      : [];
  }, [values.tableData, compIndex]);
  const calculateTotal = () => {
    // Define amenity keys to include in total calculation (excluding OTHER_AMENITIES to avoid double counting)
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

    // Find all expenses that match amenity keys and have values
    const amenityExpenses =
      compIndex !== null
        ? values.tableData[compIndex]?.expenses?.filter(
            (exp: any) => amenityKeys.includes(exp.adj_key) && exp.adj_value
          ) || []
        : [];

    // Sum all amenity expense values (excluding OTHER_AMENITIES)
    const expenseTotal = amenityExpenses.reduce((total: number, exp: any) => {
      const valueStr = exp.adj_value?.toString() || '';
      // Preserve negative sign by checking if the original value was negative
      // const isNegative = valueStr.includes('-');
      const cleanValue = valueStr.replace(/[$,]/g, '');
      const numericValue = parseFloat(cleanValue) || 0;
      // return total + (isNegative ? -numericValue : numericValue);
      return total + numericValue;
    }, 0);

    // Sum all extra_amenities values
    const extraAmenitiesTotal = extraAmenities.reduce(
      (total: number, amenity: any) => {
        const valueStr = amenity.another_amenity_value?.toString() || '';
        // Preserve negative sign by checking if the original value was negative
        const isNegative = valueStr.includes('-');
        const cleanValue = valueStr.replace(/[$,]/g, '');
        const numericValue = parseFloat(cleanValue) || 0;
        return total + (isNegative ? -numericValue : numericValue);
      },
      0
    );

    const existingValue = expenseTotal + extraAmenitiesTotal;

    return calculateAmenityTotal(extraAmenities, existingValue);
  };

  const totalAdjustment = calculateTotal();

  // Update table data helper function
  const updateTableData = (updatedExtraAmenities: AmenityItem[]) => {
    const updatedTableData = [...values.tableData];
    const updatedExpenses = [...updatedTableData[compIndex].expenses];

    // Find the other_amenities expense and update its adj_value with the total
    const otherAmenitiesIndex = updatedExpenses.findIndex(
      (exp: any) => exp.adj_key === 'other_amenities'
    );

    if (otherAmenitiesIndex !== -1) {
      updatedExpenses[otherAmenitiesIndex] = {
        ...updatedExpenses[otherAmenitiesIndex],
        adj_value: totalAdjustment.toString(),
      };
    }

    updatedTableData[compIndex] = {
      ...updatedTableData[compIndex],
      extra_amenities: updatedExtraAmenities,
      expenses: updatedExpenses,
    };

    setValues({
      ...values,
      tableData: updatedTableData,
    });
  };

  // Handle amenity value changes for expenses
  const handleExpenseAdjustmentChange = (index: number, value: string) => {
    const updatedTableData = [...values.tableData];
    const updatedExpenses = [...updatedTableData[compIndex].expenses];
    updatedExpenses[index] = {
      ...updatedExpenses[index],
      adj_value: value,
      another_amenity_value: value,
    };

    // Recalculate total and update other_amenities expense
    const recalculatedTotal = calculateTotal();
    const otherAmenitiesIndex = updatedExpenses.findIndex(
      (exp: any) => exp.adj_key === 'other_amenities'
    );

    if (otherAmenitiesIndex !== -1) {
      updatedExpenses[otherAmenitiesIndex] = {
        ...updatedExpenses[otherAmenitiesIndex],
        adj_value: recalculatedTotal.toString(),
      };
    }

    updatedTableData[compIndex] = {
      ...updatedTableData[compIndex],
      expenses: updatedExpenses,
    };
    setValues({ ...values, tableData: updatedTableData });
  };

  // Handle amenity value changes for extra amenities
  const handleExtraAdjustmentChange = (index: number, value: string) => {
    const updatedExtraAmenities = [...extraAmenities];
    updatedExtraAmenities[index] = {
      ...updatedExtraAmenities[index],
      another_amenity_value: value,
    };
    updateTableData(updatedExtraAmenities);
  };

  // Handle checkbox changes
  const handleCheckboxChange = (
    index: number,
    field: string,
    checked: boolean
  ) => {
    const updatedExtraAmenities = [...extraAmenities];
    updatedExtraAmenities[index] = {
      ...updatedExtraAmenities[index],
      [field]: checked ? 1 : 0,
    };
    updateTableData(updatedExtraAmenities);
  };

  // Handle custom amenity name changes
  const handleNameChange = (index: number, name: string) => {
    const updatedExtraAmenities = [...extraAmenities];
    updatedExtraAmenities[index] = {
      ...updatedExtraAmenities[index],
      another_amenity_name: name,
    };
    updateTableData(updatedExtraAmenities);
  };

  // Add a new custom amenity
  const handleAddCustomAmenity = () => {
    const updatedTableData = [...values.tableData];
    const currentExtraAmenities =
      updatedTableData[compIndex]?.extra_amenities || [];

    const newAmenity = {
      another_amenity_name: '',
      another_amenity_value: '0',
      subject_property_check: 0,
      comp_property_check: 0,
      is_extra: 1,
      isExtra: 1,
    };

    updatedTableData[compIndex] = {
      ...updatedTableData[compIndex],
      extra_amenities: [...currentExtraAmenities, newAmenity],
    };

    setValues({
      ...values,
      tableData: updatedTableData,
    });
  };

  const handleDeleteRow = (index: number) => {
    const updatedExtraAmenities = [...extraAmenities];
    updatedExtraAmenities.splice(index, 1);
    updateTableData(updatedExtraAmenities);
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

  // Filter out default extra amenities from expenses
  const filteredExpenses = expenses?.filter((exp) =>
    amenityOptions.includes(exp.adj_name)
  );

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      className="otherAmenitiesModal"
    >
      <DialogTitle>
        Other Amenities
        <IconButton
          aria-label="close"
          onClick={onModalClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon className="closeIcon text-4xl cursor-pointer" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="border px-2 py-3 text-left">Amenity</th>
              <th className="border px-2 py-3 text-left">Subject Property</th>
              <th className="border px-2 py-3 text-left">Comp Property</th>
              <th className="border px-2 py-3 text-left">Adjustment $</th>
              <th className="border px-2 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.map((item, index: number) => {
              const expenseIndex = expenses.findIndex(
                (exp) => exp.adj_name === item.adj_name
              );
              const mappedItem = {
                ...item,
                is_extra: 0,
                isExtra: 0,
                another_amenity_name: item.adj_name,
                another_amenity_value: item.adj_value || '',
                subject_property_check: 0,
                comp_property_check: 0,
              };
              return (
                <AmenityTableRow
                  key={`expense-${index}`}
                  item={mappedItem}
                  index={expenseIndex}
                  onNameChange={handleNameChange}
                  onCheckboxChange={handleCheckboxChange}
                  onAdjustmentChange={handleExpenseAdjustmentChange}
                  onDeleteRow={handleDeleteRow}
                  evaluationAmenities={evaluationAmenities}
                  compDetails={compDetails} // Pass compDetails to AmenityTableRow
                />
              );
            })}
            {extraAmenities
              .filter((item: any) => item)
              .map((item: AmenityItem, index: number) => {
                // Ensure both isExtra and is_extra are set with safety checks
                if (item?.is_extra && !item?.isExtra) {
                  item.isExtra = item.is_extra;
                } else if (item?.isExtra && !item?.is_extra) {
                  item.is_extra = item.isExtra;
                }

                // Ensure required properties exist with defaults only if missing
                const safeItem = {
                  ...item,
                  subject_property_check: item.subject_property_check ?? 0,
                  comp_property_check: item.comp_property_check ?? 0,
                  is_extra: item.is_extra ?? 1,
                  isExtra: item.isExtra ?? 1,
                  another_amenity_name: item.another_amenity_name ?? '',
                  another_amenity_value: item.another_amenity_value ?? '',
                };

                return (
                  <AmenityTableRow
                    key={`extra-${index}`}
                    item={safeItem}
                    index={index}
                    onNameChange={handleNameChange}
                    onCheckboxChange={handleCheckboxChange}
                    onAdjustmentChange={handleExtraAdjustmentChange}
                    onDeleteRow={handleDeleteRow}
                    evaluationAmenities={evaluationAmenities}
                    compDetails={compDetails}
                  />
                );
              })}

            {/* Total row */}
            <tr>
              <td colSpan={4}>
                <div className="py-4 flex items-center text-[#0DA1C7]">
                  <div
                    className="cursor-pointer"
                    onClick={handleAddCustomAmenity}
                  >
                    <AddIcon fontSize="small" className="mr-1" />
                    <span>Add Extra Amenity</span>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td colSpan={3} className="border px-2 py-3 text-left font-bold">
                Total Adjustment:
              </td>
              <td className="border px-2 py-3 font-bold">
                {sanitizeInputDollarSignComps(totalAdjustment.toFixed(2))}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="mt-4 flex justify-between">
          <button
            className="bg-[#0DA1C7] text-white px-5 py-3 rounded border-none uppercase cursor-pointer"
            onClick={onClose}
          >
            {ButtonTypes.CANCEL}
          </button>
          <button
            className="bg-[#0DA1C7] text-white px-5 py-3 rounded border-none uppercase cursor-pointer"
            onClick={onClose}
          >
            {ButtonTypes.SAVE}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OtherAmenitiesModal;
