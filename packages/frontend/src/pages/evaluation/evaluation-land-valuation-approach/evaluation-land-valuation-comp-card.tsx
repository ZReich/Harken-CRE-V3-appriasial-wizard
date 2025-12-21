import SelectTextField from '@/components/styles/select-input';
import defaultPropertImage from '../../../images/default-placeholder.png';
import { usa_state } from '@/pages/comps/comp-form/fakeJson';
import {
  conditionOptions,
  topographyOptions,
  landTypeOptions,
} from '@/pages/comps/create-comp/SelectOption';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Icons } from '@/components/icons';
import DeleteApproachConfirmationModal from '@/pages/comps/Listing/delete-approach-confirmation';
import { TextField } from '@mui/material';
import { useFormikContext } from 'formik';
import EvaluationLandValuationCompAdjustmentNoteModal from './evaluation-land-valuation-comps-adjustment-notes-modal';
import {
  capitalizeWords,
  formatPrice,
  sanitizeInputDollarSignComps,
} from '@/utils/sanitize';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AnalysisTypes,
  LandDimension,
} from '@/pages/appraisal/overview/OverviewEnum';

// Calculate comp data for land valuation
const calculateLandCompData = ({ total, weight, comp, appraisalData }: any) => {
  let price_per_unit: number;

  if (comp?.price_square_foot) {
    price_per_unit = comp.price_square_foot;
    if (
      appraisalData?.analysis_type === AnalysisTypes.SF &&
      comp.land_dimension === LandDimension.ACRE
    ) {
      price_per_unit = comp.sale_price / (comp.land_size * 43560);
    } else if (
      appraisalData?.analysis_type === AnalysisTypes.ACRE &&
      comp.land_dimension === LandDimension.SF
    ) {
      price_per_unit = comp.sale_price / parseFloat((comp.land_size / 43560).toFixed(3));
    }
  } else {
    if (
      appraisalData?.analysis_type === AnalysisTypes.SF &&
      comp.land_dimension === LandDimension.ACRE
    ) {
      price_per_unit = comp.sale_price / (comp.land_size * 43560);
    } else if (
      appraisalData?.analysis_type === AnalysisTypes.ACRE &&
      comp.land_dimension === LandDimension.SF
    ) {
      price_per_unit = comp.sale_price / parseFloat((comp.land_size / 43560).toFixed(3));
    } else {
      price_per_unit = parseFloat((comp.sale_price / comp.land_size).toFixed(2));
    }
  }

  const adjustedPricePerUnit =
    appraisalData?.comp_adjustment_mode === 'Dollar'
      ? total + price_per_unit
      : (total / 100) * price_per_unit + price_per_unit;

  const averagedAdjustedPrice = (adjustedPricePerUnit * weight) / 100;
  const blendedPrice = (price_per_unit * weight) / 100;

  return {
    adjusted_psf: adjustedPricePerUnit,
    averaged_adjusted_psf: averagedAdjustedPrice,
    blended_adjusted_psf: blendedPrice,
    weight,
    total,
  };
};

// Calculate expenses total
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
    total += exp.adj_value !== '-' ? parseFloat(exp.adj_value) : 0;
  });

  return { total, expenses };
};

interface EvaluationLandValuationCompCardProps {
  item: any;
  appraisalData: any;
  handleChange: (index: number, field: string, value: any) => void;
  values: any;
  totalCards: number;
  index: number;
  handleNavigateToComp: (id: any) => void;
  handleDelete: (id: number) => void;
  passcomparabilityData: (data: any) => void;
  setClassName: (value: boolean) => void;
  handleSaveAdjustmentNote: () => void;
  landDimensions: string;
  analysisType: string;
}

function EvaluationLandValuationCompCard({
  index,
  item,
  values,
  totalCards,
  appraisalData,
  handleDelete,
  handleNavigateToComp,
  setClassName,
  handleSaveAdjustmentNote,
  passcomparabilityData,
  landDimensions,
  analysisType,
}: EvaluationLandValuationCompCardProps) {
  type QuantitativeOption = {
    code: string;
    name: string;
  };

  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const landId = searchParams.get('landId');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [indexNumber, setIndexNumber] = useState<any>();
  const [open, setOpen] = useState(false);
  const [quantitativeOptions, setQuantitativeOptions] = useState<QuantitativeOption[]>([]);
  const [overallComparabilityOptions, setOverallComparabilityOptions] = useState([]);
  const [selectedComparabilityOption, setSelectedComparabilityOption] = useState('similar');
  const [tableItem, setTableItem] = useState<any>('');
  const { setValues } = useFormikContext<any>();
  const stateMap = usa_state[0];
  const fullStateName = stateMap[item?.state];

  useEffect(() => {
    if (!open) {
      setTableItem('');
      setIndexNumber('');
      setClassName(false);
    }
  }, [open]);

  // Fetch options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [quantitativeRes, comparabilityRes] = await Promise.all([
          axios.get('/global-codes/get-global-codes?category=LandQuantitativeAdjustments'),
          axios.get('/global-codes/get-global-codes?category=OverallComparability'),
        ]);
        setQuantitativeOptions(quantitativeRes.data?.data || []);
        setOverallComparabilityOptions(
          (comparabilityRes.data?.data || []).map((opt: any) => ({
            value: opt.code,
            label: opt.name,
          }))
        );
      } catch (error) {
        console.error('Error fetching options:', error);
      }
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    if (item?.overall_comparability) {
      setSelectedComparabilityOption(item.overall_comparability);
    }
  }, [item?.overall_comparability]);

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

  // Calculate total adjustment from expenses
  let total = 0;
  item.expenses?.forEach((exp: any) => {
    const expNum = exp.comparison_basis ? +exp.comparison_basis.split('%')[0] : 0;
    total += expNum;
  });

  const getLabelFromValue = (value: any) => {
    if (!value || value === '--Select a Subtype--') return '';
    const allOptions = [...conditionOptions, ...topographyOptions, ...landTypeOptions];
    const option = allOptions.find((opt) => opt.value === value);
    return option ? option.label : capitalizeWords(value);
  };

  // Format the comparison value display
  const formatComparisonValue = (key: string) => {
    switch (key) {
      case 'land_size':
        return item?.land_size
          ? `${item.land_size.toLocaleString()} ${item.land_dimension || 'SF'}`
          : '-';
      case 'topography':
        return getLabelFromValue(item?.topography) || '-';
      case 'land_type':
        return getLabelFromValue(item?.land_type) || '-';
      case 'location':
        return item?.city ? `${item.city}, ${item.state?.toUpperCase()}` : '-';
      case 'utilities':
        return item?.utilities_select || '-';
      case 'zoning':
        return item?.zoning_type || '-';
      case 'frontage':
        return item?.frontage || '-';
      default:
        return '-';
    }
  };

  // Handle weight change
  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace('%', '');
    const numValue = parseFloat(value) || 0;
    
    setValues((old: any) => {
      const updatedTableData = old.tableData.map((comp: any, idx: number) => {
        if (idx === index) {
          const calculatedData = calculateLandCompData({
            total: comp.total || 0,
            weight: numValue,
            comp,
            appraisalData,
          });
          return { ...comp, ...calculatedData, weight: numValue };
        }
        return comp;
      });
      return { ...old, tableData: updatedTableData };
    });
  };

  // Handle adjustment value change
  const handleAdjustmentChange = (expenseIndex: number, value: string) => {
    const numValue = parseFloat(value.replace(/[$,%]/g, '')) || 0;
    
    setValues((old: any) => {
      const updatedTableData = old.tableData.map((comp: any, idx: number) => {
        if (idx === index) {
          const updatedExpenses = comp.expenses.map((exp: any, expIdx: number) =>
            expIdx === expenseIndex ? { ...exp, adj_value: numValue } : exp
          );
          
          // Calculate new total
          const newTotal = updatedExpenses.reduce(
            (acc: number, exp: any) => acc + (parseFloat(exp.adj_value) || 0),
            0
          );
          
          const calculatedData = calculateLandCompData({
            total: newTotal,
            weight: comp.weight || 0,
            comp,
            appraisalData,
          });
          
          return { ...comp, ...calculatedData, expenses: updatedExpenses, total: newTotal };
        }
        return comp;
      });
      return { ...old, tableData: updatedTableData };
    });
  };

  // Handle overall comparability change
  const handleComparabilityChange = (value: string) => {
    setSelectedComparabilityOption(value);
    passcomparabilityData({ index, value });
    
    setValues((old: any) => {
      const updatedTableData = old.tableData.map((comp: any, idx: number) =>
        idx === index ? { ...comp, overall_comparability: value } : comp
      );
      return { ...old, tableData: updatedTableData };
    });
  };

  return (
    <>
      {/* Delete Confirmation Modal */}
      <DeleteApproachConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onDelete={() => {
          handleDelete(item.id);
          closeDeleteModal();
        }}
        title="Remove Land Comp"
        message="Are you sure you want to remove this land comp from the analysis?"
      />

      {/* Adjustment Notes Modal */}
      {open && (
        <EvaluationLandValuationCompAdjustmentNoteModal
          open={open}
          onClose={() => setOpen(false)}
          item={tableItem}
          index={indexNumber}
          onSave={handleSaveAdjustmentNote}
        />
      )}

      {/* Comp Card */}
      <div className="flex flex-col w-[15.5%] min-w-[200px]">
        <div className="flex items-center justify-between py-5">
          <h3 className="text-base capitalize font-semibold text-ellipsis overflow-hidden">
            Land Sale {index + 1}
          </h3>
          <Icons.DeleteOutlineIcon
            className="text-red-500 cursor-pointer hover:text-red-700"
            style={{ width: '18px' }}
            onClick={openDeleteModal}
          />
        </div>

        <div className="bg-white flex-1 border border-gray-200 rounded-md shadow-sm">
          {/* Comp Image */}
          <div className="max-w-full h-[160px] relative">
            <img
              className="w-full h-[160px] object-cover rounded-t-md"
              src={
                item?.primary_photo
                  ? import.meta.env.VITE_S3_URL + item.primary_photo
                  : defaultPropertImage
              }
              onError={({ currentTarget }) => {
                currentTarget.onerror = null;
                currentTarget.src = defaultPropertImage;
              }}
              alt="comp img"
            />
            {item?.sale_status && (
              <span
                className={`absolute top-2 right-2 text-xs px-2 py-1 rounded ${
                  item.sale_status === 'Closed'
                    ? 'bg-green-500 text-white'
                    : item.sale_status === 'Pending'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-500 text-white'
                }`}
              >
                {item.sale_status}
              </span>
            )}
          </div>

          {/* Comp Basic Info */}
          <div className="p-2">
            <p className="text-sm font-bold text-[#0DA1C7] flex h-[20px]">
              {item?.sale_price
                ? formatPrice(item.sale_price)
                : '-'}
            </p>
            <div className="min-h-[40px] mt-2">
              <h2 className="text-gray-500 text-xs font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                {item?.street_address || 'No address available'}
              </h2>
              <h2 className="text-gray-500 text-xs font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                {item?.city ? item.city + ', ' : ''}
                {item?.state ? item.state.toUpperCase() + ', ' : ''}
                {item?.zipcode || ''}
              </h2>
            </div>
            <p className="text-gray-500 text-xs font-medium pb-1 overflow-hidden whitespace-nowrap text-ellipsis">
              {item?.date_sold
                ? new Date(item.date_sold).toLocaleDateString('en-US', {
                    month: '2-digit',
                    year: 'numeric',
                  })
                : '-'}
            </p>
            <p className="text-xs font-bold flex h-[20px] text-gray-500">
              {getLabelFromValue(item?.land_type)}
            </p>
          </div>

          {/* Comparative Attributes Values */}
          <div className="p-1 space-y-2 flex flex-col gap-[2px] border-solid border-b border-l-0 border-r-0 border-t border-[#d5d5d5]">
            {values.appraisalSpecificAdjustment?.map((attr: any, idx: number) => (
              <p
                key={idx}
                className="text-xs font-bold h-[20px] text-gray-500 text-ellipsis overflow-hidden whitespace-nowrap"
              >
                {formatComparisonValue(attr.comparison_key)}
              </p>
            ))}
          </div>

          {/* Adjustment Values */}
          <div className="p-1 border-solid border-b border-l-0 border-r-0 border-t-0 border-[#d5d5d5]">
            {item.expenses?.map((exp: any, expIdx: number) => (
              <div key={expIdx} className="h-[20px] flex items-center">
                <TextField
                  size="small"
                  variant="standard"
                  value={exp.adj_value || ''}
                  onChange={(e) => handleAdjustmentChange(expIdx, e.target.value)}
                  InputProps={{
                    style: { fontSize: '12px' },
                    disableUnderline: false,
                  }}
                  sx={{
                    '& .MuiInput-underline:before': { borderBottom: '1px solid #d5d5d5' },
                    '& .MuiInput-underline:after': { borderBottom: '2px solid #0DA1C7' },
                    width: '100%',
                  }}
                />
              </div>
            ))}
          </div>

          {/* Qualitative Adjustments */}
          {item.quantitativeAdjustments?.map((qAdj: any, qIdx: number) => (
            <div key={qIdx} className="px-2 h-[20px] flex items-center">
              <SelectTextField
                name={`tableData.${index}.quantitativeAdjustments.${qIdx}.adj_value`}
                value={qAdj.adj_value || 'similar'}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = e.target.value;
                  setValues((old: any) => {
                    const updatedTableData = old.tableData.map((comp: any, idx: number) => {
                      if (idx === index) {
                        const updatedQuantitativeAdjustments = comp.quantitativeAdjustments.map(
                          (adj: any, adjIdx: number) =>
                            adjIdx === qIdx ? { ...adj, adj_value: value } : adj
                        );
                        return { ...comp, quantitativeAdjustments: updatedQuantitativeAdjustments };
                      }
                      return comp;
                    });
                    return { ...old, tableData: updatedTableData };
                  });
                }}
                options={[
                  { value: 'superior', label: 'Superior' },
                  { value: 'similar', label: 'Similar' },
                  { value: 'inferior', label: 'Inferior' },
                ]}
                style={{ fontSize: '12px' }}
              />
            </div>
          ))}

          {/* Notes */}
          <p
            className="text-xs mt-[3px] h-10 flex items-center text-ellipsis overflow-hidden whitespace-nowrap font-medium border-below text-[#0DA1C7] p-2 border-solid border-b border-l-0 border-r-0 border-t border-[#d5d5d5] cursor-pointer hover:bg-slate-50"
            onClick={() => handleOpen(item, index)}
          >
            {item?.adjustment_note ? 'View/Edit Notes' : 'Click to Enter Notes'}
          </p>

          {/* Summary Values */}
          <div className="px-2 space-y-2 flex flex-col gap-[2px] pb-2">
            {/* Overall Comparability */}
            <div className="h-[37px] mt-3.5 flex items-end">
              <SelectTextField
                name={`tableData.${index}.overall_comparability`}
                value={selectedComparabilityOption}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleComparabilityChange(e.target.value)
                }
                options={
                  overallComparabilityOptions.length > 0
                    ? overallComparabilityOptions
                    : [
                        { value: 'superior', label: 'Superior' },
                        { value: 'similar', label: 'Similar' },
                        { value: 'inferior', label: 'Inferior' },
                      ]
                }
                style={{ fontSize: '12px', width: '100%' }}
              />
            </div>

            {/* Overall Adjustment */}
            <p className="text-xs h-[18px] !m-0 font-medium text-gray-600">
              {item?.total !== undefined
                ? `${item.total >= 0 ? '+' : ''}${item.total.toFixed(2)}%`
                : '0.00%'}
            </p>

            {/* Adjusted Price Per Unit */}
            <p className="text-xs h-[18px] !m-0 font-bold text-gray-700">
              {item?.adjusted_psf
                ? formatPrice(item.adjusted_psf) + (analysisType === '$/Acre' ? '/AC' : '/SF')
                : '-'}
            </p>

            {/* Weighting */}
            <div className="h-[18px] flex items-center">
              <TextField
                size="small"
                variant="standard"
                value={item?.weight ? `${item.weight}%` : '0%'}
                onChange={handleWeightChange}
                InputProps={{
                  style: { fontSize: '12px', fontWeight: 600 },
                  disableUnderline: false,
                }}
                sx={{
                  '& .MuiInput-underline:before': { borderBottom: '1px solid #d5d5d5' },
                  '& .MuiInput-underline:after': { borderBottom: '2px solid #0DA1C7' },
                  width: '60px',
                }}
              />
            </div>

            {/* Blended Value Per Unit */}
            <p className="text-xs h-[18px] !m-0 font-medium text-gray-600">
              {item?.averaged_adjusted_psf
                ? formatPrice(item.averaged_adjusted_psf) + (analysisType === '$/Acre' ? '/AC' : '/SF')
                : '-'}
            </p>

            {/* View Comp Link */}
            <Link
              to={`/evaluation/land-comp-details?id=${id}&landId=${landId}&compId=${item.comp_id || item.id}`}
              className="text-xs text-[#0DA1C7] hover:underline cursor-pointer"
            >
              View Full Details
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default EvaluationLandValuationCompCard;

