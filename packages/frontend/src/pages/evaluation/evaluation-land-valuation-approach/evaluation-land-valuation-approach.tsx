import { Icons } from '@/components/icons';
import StyledField from '@/components/styles/Style-field-login';
import SelectTextField from '@/components/styles/select-input';
import { useGet } from '@/hook/useGet';
import { RequestType, useMutate } from '@/hook/useMutate';
import { usa_state } from '@/pages/comps/comp-form/fakeJson';
import {
  conditionOptions,
  topographyOptions,
  landTypeOptions,
} from '@/pages/comps/create-comp/SelectOption';
import { TextField, Typography, IconButton } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import axios from 'axios';
import { useFormikContext } from 'formik';
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import loadingImage from '../../../images/loading.png';
import EvaluationMenuOptions from '../set-up/evaluation-menu-options';
import {
  AnalysisTypes,
  LandDimension,
} from '@/pages/appraisal/overview/OverviewEnum';
import { formatPrice } from '@/utils/sanitize';

// Styles for the table
const styles = {
  tableContainer: {
    overflowX: 'auto' as const,
    margin: '20px',
    border: '1px solid #4a7c59',
    borderRadius: '4px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    minWidth: '800px',
  },
  headerRow: {
    backgroundColor: '#4a7c59',
    color: 'white',
  },
  headerCell: {
    padding: '10px 15px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    color: 'white',
    fontSize: '14px',
  },
  sectionHeader: {
    backgroundColor: '#6b8e23',
    color: 'white',
    padding: '8px 15px',
    fontWeight: 'bold',
    fontSize: '12px',
  },
  qualitativeSectionHeader: {
    backgroundColor: '#9acd32',
    color: '#333',
    padding: '8px 15px',
    fontWeight: 'bold',
    fontSize: '12px',
  },
  labelCell: {
    padding: '6px 15px',
    fontWeight: 600,
    fontSize: '12px',
    backgroundColor: '#f5f5f5',
    borderBottom: '1px solid #ddd',
    whiteSpace: 'nowrap' as const,
    width: '120px',
  },
  dataCell: {
    padding: '6px 15px',
    fontSize: '12px',
    borderBottom: '1px solid #ddd',
    textAlign: 'center' as const,
    minWidth: '120px',
  },
  inputCell: {
    padding: '4px 8px',
    fontSize: '12px',
    borderBottom: '1px solid #ddd',
    textAlign: 'center' as const,
    minWidth: '120px',
  },
  footerRow: {
    backgroundColor: '#4a7c59',
  },
  footerCell: {
    padding: '8px 15px',
    fontWeight: 'bold',
    fontSize: '12px',
    color: 'white',
    textAlign: 'center' as const,
  },
  subjectCell: {
    backgroundColor: '#e8f5e9',
  },
  saleHeader: {
    backgroundColor: '#4a7c59',
    color: 'white',
    padding: '10px 15px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    fontSize: '13px',
    minWidth: '130px',
  },
};

// Calculate price per acre/SF
const calculatePricePerUnit = (salePrice: number, landSize: number, landDimension: string, analysisType: string) => {
  if (!salePrice || !landSize) return 0;
  
  if (analysisType === '$/Acre') {
    if (landDimension === 'SF') {
      return salePrice / (landSize / 43560);
    }
    return salePrice / landSize;
  } else {
    if (landDimension === 'ACRE') {
      return salePrice / (landSize * 43560);
    }
    return salePrice / landSize;
  }
};

// Calculate adjusted price
const calculateAdjustedPrice = (pricePerUnit: number, adjustmentPercent: number) => {
  if (!pricePerUnit) return 0;
  return pricePerUnit * (1 + adjustmentPercent / 100);
};

const EvaluationLandValuationApproach: React.FC = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const landId = searchParams.get('landId');
  const navigate = useNavigate();

  const [loader, setLoader] = useState(false);
  const [appraisalData, setAppraisalData] = useState<any>({});
  const [landComps, setLandComps] = useState<any[]>([]);
  const [analysisType, setAnalysisType] = useState('$/Acre');
  const [loading, setLoading] = useState(true);

  const { values, setValues } = useFormikContext<any>();

  // State map for full state name
  const stateMap = usa_state[0];

  // Fetch evaluation data
  const { data: evaluationData, isLoading } = useGet<any>({
    queryKey: [`land-valuation-${id}-${landId}`],
    endPoint: `evaluations/get/${id}`,
    enabled: !!id,
  });

  useEffect(() => {
    if (evaluationData?.data?.data) {
      const data = evaluationData.data.data;
      setAppraisalData(data);
      setAnalysisType(data.analysis_type || '$/Acre');
    }
  }, [evaluationData]);

  // Fetch land comps
  useEffect(() => {
    const fetchLandComps = async () => {
      try {
        const response = await axios.get(
          `evaluations/get-land-comps/${id}${landId ? `?landId=${landId}` : ''}`
        );
        if (response.data?.data) {
          const comps = response.data.data.map((c: any, idx: number) => ({
            ...c.comp_details,
            id: c.id,
            comp_id: c.comp_id,
            order: idx + 1,
            adjustment: c.total_adjustment || 0,
            overall_comparability: c.overall_comparability || 'N/A',
            // Qualitative adjustments
            location_adj: c.location_adj || '-',
            irrigation_adj: c.irrigation_adj || '-',
            utilities_adj: c.utilities_adj || '-',
            topography_adj: c.topography_adj || '-',
            size_adj: c.size_adj || '-',
            zoning_adj: c.zoning_adj || '-',
            // Transaction adjustments
            prop_rights_adj: c.prop_rights_adj || 0,
            financing_adj: c.financing_adj || 0,
            cond_sale_adj: c.cond_sale_adj || 0,
            market_cond_adj: c.market_cond_adj || '-',
          }));
          setLandComps(comps);
          setValues((prev: any) => ({ ...prev, tableData: comps }));
        }
      } catch (error) {
        console.error('Error fetching land comps:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchLandComps();
    }
  }, [id, landId]);

  // Handler to update comp values
  const updateCompValue = (compIndex: number, field: string, value: any) => {
    setLandComps((prev) => {
      const updated = [...prev];
      updated[compIndex] = { ...updated[compIndex], [field]: value };
      return updated;
    });
    setValues((prev: any) => {
      const updatedTableData = [...(prev.tableData || [])];
      if (updatedTableData[compIndex]) {
        updatedTableData[compIndex] = { ...updatedTableData[compIndex], [field]: value };
      }
      return { ...prev, tableData: updatedTableData };
    });
  };

  // Calculate totals for each comp
  const getCompCalculations = (comp: any) => {
    const pricePerUnit = calculatePricePerUnit(
      comp.sale_price,
      comp.land_size,
      comp.land_dimension,
      analysisType
    );
    
    // Sum all transaction adjustments
    const totalAdjustment = 
      (parseFloat(comp.prop_rights_adj) || 0) +
      (parseFloat(comp.financing_adj) || 0) +
      (parseFloat(comp.cond_sale_adj) || 0) +
      (parseFloat(comp.adjustment) || 0);

    const adjustedPricePerUnit = calculateAdjustedPrice(pricePerUnit, totalAdjustment);

    return {
      pricePerUnit,
      totalAdjustment,
      adjustedPricePerUnit,
    };
  };

  // Handle delete comp
  const handleDeleteComp = async (compId: number) => {
    try {
      await axios.delete(`evaluations/delete-land-comp/${compId}`);
      setLandComps((prev) => prev.filter((c) => c.id !== compId));
      toast.success('Land comp removed');
    } catch (error) {
      toast.error('Failed to remove comp');
    }
  };

  // Handle add comp
  const handleAddComp = () => {
    localStorage.setItem('checkStatus', 'land');
    navigate(`/evaluation/filter-comps?id=${id}&approachId=${landId}&type=land`);
  };

  // Navigation handlers
  const handleNextClick = async () => {
    // Save and navigate to next step
    navigate(`/evaluation/land-valuation-comps-map?id=${id}&landId=${landId}`);
  };

  const handleBackClick = () => {
    navigate(`/evaluation/highest-best-use?id=${id}`);
  };

  // Format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
  };

  // Get label from value
  const getLabelFromValue = (value: any, options: any[]) => {
    if (!value) return '-';
    const option = options.find((opt) => opt.value === value);
    return option ? option.label : value;
  };

  // Loading state
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading || loading || loader) {
    return (
      <div className="img-update-loader">
        <img src={loadingImage} alt="Loading..." />
      </div>
    );
  }

  return (
    <EvaluationMenuOptions
      onNextClick={handleNextClick}
      onBackClick={handleBackClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-[50px] w-[100%] xl:pl-[40px] border-0 border-b border-[#eee] border-solid xl:pr-[70px] px-[15px]">
        <Typography variant="h1" component="h2" className="text-xl font-bold uppercase">
          Land Valuation Approach
        </Typography>
        <button
          onClick={handleAddComp}
          className="flex items-center gap-2 px-4 py-2 bg-[#0DA1C7] text-white rounded hover:bg-[#0b8fb0] transition-colors"
        >
          <AddCircleOutlineIcon fontSize="small" />
          Add Land Sale
        </button>
      </div>

      {/* Land Sales Chart Table */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          {/* Main Header */}
          <thead>
            <tr style={styles.headerRow}>
              <th style={styles.headerCell} colSpan={2 + landComps.length}>
                Land Sales Chart
              </th>
            </tr>
          </thead>

          <tbody>
            {/* Column Headers */}
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <td style={{ ...styles.labelCell, fontWeight: 'bold' }}>Element:</td>
              <td style={{ ...styles.dataCell, ...styles.subjectCell, fontWeight: 'bold' }}>Subject</td>
              {landComps.map((comp, idx) => (
                <td key={comp.id} style={styles.saleHeader}>
                  <div className="flex items-center justify-center gap-2">
                    Sale {idx + 1}
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteComp(comp.id)}
                      sx={{ color: 'white', padding: '2px' }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </div>
                </td>
              ))}
            </tr>

            {/* TRANSACTION DATA Section */}
            <tr>
              <td colSpan={2 + landComps.length} style={styles.sectionHeader}>
                TRANSACTION DATA
              </td>
            </tr>

            {/* Date of Sale */}
            <tr>
              <td style={styles.labelCell}>Date of Sale:</td>
              <td style={{ ...styles.dataCell, ...styles.subjectCell }}>Current</td>
              {landComps.map((comp) => (
                <td key={comp.id} style={styles.dataCell}>
                  {formatDate(comp.date_sold)}
                </td>
              ))}
            </tr>

            {/* Location */}
            <tr>
              <td style={styles.labelCell}>Location:</td>
              <td style={{ ...styles.dataCell, ...styles.subjectCell }}>
                {appraisalData.street_address || '-'}
              </td>
              {landComps.map((comp) => (
                <td key={comp.id} style={styles.dataCell}>
                  {comp.street_address || '-'}
                </td>
              ))}
            </tr>

            {/* City, St. */}
            <tr>
              <td style={styles.labelCell}>City, St.:</td>
              <td style={{ ...styles.dataCell, ...styles.subjectCell }}>
                {appraisalData.city}, {appraisalData.state?.toUpperCase()}
              </td>
              {landComps.map((comp) => (
                <td key={comp.id} style={styles.dataCell}>
                  {comp.city}, {comp.state?.toUpperCase()}
                </td>
              ))}
            </tr>

            {/* H & B Use */}
            <tr>
              <td style={styles.labelCell}>H & B Use:</td>
              <td style={{ ...styles.dataCell, ...styles.subjectCell }}>
                {appraisalData.high_and_best_user || 'Development Land'}
              </td>
              {landComps.map((comp) => (
                <td key={comp.id} style={styles.dataCell}>
                  {comp.high_and_best_user || 'Development Land'}
                </td>
              ))}
            </tr>

            {/* Irrigation */}
            <tr>
              <td style={styles.labelCell}>Irrigation:</td>
              <td style={{ ...styles.dataCell, ...styles.subjectCell }}>
                {appraisalData.irrigation || 'Irrigated'}
              </td>
              {landComps.map((comp) => (
                <td key={comp.id} style={styles.dataCell}>
                  {comp.irrigation || 'None'}
                </td>
              ))}
            </tr>

            {/* Utilities */}
            <tr>
              <td style={styles.labelCell}>Utilities:</td>
              <td style={{ ...styles.dataCell, ...styles.subjectCell }}>
                {appraisalData.utilities_select || 'Well/Elec.'}
              </td>
              {landComps.map((comp) => (
                <td key={comp.id} style={styles.dataCell}>
                  {comp.utilities_select || '-'}
                </td>
              ))}
            </tr>

            {/* Topography */}
            <tr>
              <td style={styles.labelCell}>Topography:</td>
              <td style={{ ...styles.dataCell, ...styles.subjectCell }}>
                {getLabelFromValue(appraisalData.topography, topographyOptions)}
              </td>
              {landComps.map((comp) => (
                <td key={comp.id} style={styles.dataCell}>
                  {getLabelFromValue(comp.topography, topographyOptions)}
                </td>
              ))}
            </tr>

            {/* Zoning */}
            <tr>
              <td style={styles.labelCell}>Zoning:</td>
              <td style={{ ...styles.dataCell, ...styles.subjectCell }}>
                {appraisalData.zoning_type || 'None'}
              </td>
              {landComps.map((comp) => (
                <td key={comp.id} style={styles.dataCell}>
                  {comp.zoning_type || 'None'}
                </td>
              ))}
            </tr>

            {/* Sales Price */}
            <tr>
              <td style={styles.labelCell}>Sales Price:</td>
              <td style={{ ...styles.dataCell, ...styles.subjectCell }}>N/A</td>
              {landComps.map((comp) => (
                <td key={comp.id} style={styles.dataCell}>
                  {comp.sale_price ? formatPrice(comp.sale_price) : '-'}
                </td>
              ))}
            </tr>

            {/* Size/Acres */}
            <tr>
              <td style={styles.labelCell}>Size/Acres:</td>
              <td style={{ ...styles.dataCell, ...styles.subjectCell }}>
                {appraisalData.land_size?.toLocaleString() || '-'}
              </td>
              {landComps.map((comp) => (
                <td key={comp.id} style={styles.dataCell}>
                  {comp.land_size?.toLocaleString() || '-'}
                </td>
              ))}
            </tr>

            {/* Price/Acre */}
            <tr>
              <td style={styles.labelCell}>Price/Acre:</td>
              <td style={{ ...styles.dataCell, ...styles.subjectCell }}>N/A</td>
              {landComps.map((comp) => {
                const { pricePerUnit } = getCompCalculations(comp);
                return (
                  <td key={comp.id} style={styles.dataCell}>
                    {pricePerUnit ? formatPrice(pricePerUnit) : '-'}
                  </td>
                );
              })}
            </tr>

            {/* TRANSACTION ADJUSTMENTS Section */}
            <tr>
              <td colSpan={2 + landComps.length} style={styles.sectionHeader}>
                TRANSACTION ADJUSTMENTS
              </td>
            </tr>

            {/* Prop. Rights */}
            <tr>
              <td style={styles.labelCell}>Prop. Rights:</td>
              <td style={{ ...styles.dataCell, ...styles.subjectCell }}>Fee Simple</td>
              {landComps.map((comp) => (
                <td key={comp.id} style={styles.dataCell}>
                  {comp.property_rights || 'Fee Simple'}
                </td>
              ))}
            </tr>

            {/* Financing */}
            <tr>
              <td style={styles.labelCell}>Financing:</td>
              <td style={{ ...styles.dataCell, ...styles.subjectCell }}>Cash to Seller</td>
              {landComps.map((comp) => (
                <td key={comp.id} style={styles.dataCell}>
                  {comp.financing || 'Cash to Seller'}
                </td>
              ))}
            </tr>

            {/* Cond. Sale */}
            <tr>
              <td style={styles.labelCell}>Cond. Sale:</td>
              <td style={{ ...styles.dataCell, ...styles.subjectCell }}>Typical</td>
              {landComps.map((comp) => (
                <td key={comp.id} style={styles.dataCell}>
                  {comp.conditions_of_sale || 'Typical'}
                </td>
              ))}
            </tr>

            {/* Market Cond. */}
            <tr>
              <td style={styles.labelCell}>Market Cond.:</td>
              <td style={{ ...styles.dataCell, ...styles.subjectCell }}>Current</td>
              {landComps.map((comp, idx) => (
                <td key={comp.id} style={styles.inputCell}>
                  <SelectTextField
                    name={`landComps.${idx}.market_cond_adj`}
                    value={comp.market_cond_adj || 'Similar'}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      updateCompValue(idx, 'market_cond_adj', e.target.value)
                    }
                    options={[
                      { value: 'Superior', label: 'Superior' },
                      { value: 'Similar', label: 'Similar' },
                      { value: 'Inferior', label: 'Inferior' },
                    ]}
                    style={{ fontSize: '11px', minWidth: '80px' }}
                  />
                </td>
              ))}
            </tr>

            {/* Adjustment */}
            <tr>
              <td style={styles.labelCell}>Adjustment:</td>
              <td style={{ ...styles.dataCell, ...styles.subjectCell }}>-</td>
              {landComps.map((comp, idx) => (
                <td key={comp.id} style={styles.inputCell}>
                  <TextField
                    size="small"
                    variant="standard"
                    value={comp.adjustment || ''}
                    onChange={(e) => updateCompValue(idx, 'adjustment', e.target.value)}
                    placeholder="0%"
                    InputProps={{
                      style: { fontSize: '12px', textAlign: 'center' },
                      disableUnderline: false,
                    }}
                    sx={{ width: '60px' }}
                  />
                </td>
              ))}
            </tr>

            {/* Adj. $/Acre */}
            <tr>
              <td style={{ ...styles.labelCell, fontWeight: 'bold' }}>Adj. $/Acre:</td>
              <td style={{ ...styles.dataCell, ...styles.subjectCell, fontWeight: 'bold' }}>N/A</td>
              {landComps.map((comp) => {
                const { adjustedPricePerUnit } = getCompCalculations(comp);
                return (
                  <td key={comp.id} style={{ ...styles.dataCell, fontWeight: 'bold', textDecoration: 'underline' }}>
                    {adjustedPricePerUnit ? formatPrice(adjustedPricePerUnit) : '-'}
                  </td>
                );
              })}
            </tr>

            {/* QUALITATIVE ADJUSTMENTS Section */}
            <tr>
              <td colSpan={2 + landComps.length} style={styles.qualitativeSectionHeader}>
                QUALITATIVE ADJUSTMENTS
              </td>
            </tr>

            {/* Location (Qualitative) */}
            <tr>
              <td style={styles.labelCell}>Location:</td>
              <td style={{ ...styles.dataCell, ...styles.subjectCell }}>
                {appraisalData.location_quality || 'Good'}
              </td>
              {landComps.map((comp, idx) => (
                <td key={comp.id} style={styles.inputCell}>
                  <SelectTextField
                    name={`landComps.${idx}.location_adj`}
                    value={comp.location_adj || '-'}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      updateCompValue(idx, 'location_adj', e.target.value)
                    }
                    options={[
                      { value: '-', label: '-' },
                      { value: 'Superior', label: 'Superior' },
                      { value: 'Similar', label: 'Similar' },
                      { value: 'Inferior', label: 'Inferior' },
                    ]}
                    style={{ fontSize: '11px', minWidth: '80px' }}
                  />
                </td>
              ))}
            </tr>

            {/* Irrigation (Qualitative) */}
            <tr>
              <td style={styles.labelCell}>Irrigation:</td>
              <td style={{ ...styles.dataCell, ...styles.subjectCell }}>
                {appraisalData.irrigation || 'Irrigated'}
              </td>
              {landComps.map((comp, idx) => (
                <td key={comp.id} style={styles.inputCell}>
                  <SelectTextField
                    name={`landComps.${idx}.irrigation_adj`}
                    value={comp.irrigation_adj || '-'}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      updateCompValue(idx, 'irrigation_adj', e.target.value)
                    }
                    options={[
                      { value: '-', label: '-' },
                      { value: 'Superior', label: 'Superior' },
                      { value: 'Similar', label: 'Similar' },
                      { value: 'Inferior', label: 'Inferior' },
                    ]}
                    style={{ fontSize: '11px', minWidth: '80px' }}
                  />
                </td>
              ))}
            </tr>

            {/* Utilities (Qualitative) */}
            <tr>
              <td style={styles.labelCell}>Utilities:</td>
              <td style={{ ...styles.dataCell, ...styles.subjectCell }}>
                {appraisalData.utilities_select || 'Well/Elec.'}
              </td>
              {landComps.map((comp, idx) => (
                <td key={comp.id} style={styles.inputCell}>
                  <SelectTextField
                    name={`landComps.${idx}.utilities_adj`}
                    value={comp.utilities_adj || '-'}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      updateCompValue(idx, 'utilities_adj', e.target.value)
                    }
                    options={[
                      { value: '-', label: '-' },
                      { value: 'Superior', label: 'Superior' },
                      { value: 'Similar', label: 'Similar' },
                      { value: 'Inferior', label: 'Inferior' },
                    ]}
                    style={{ fontSize: '11px', minWidth: '80px' }}
                  />
                </td>
              ))}
            </tr>

            {/* Topography (Qualitative) */}
            <tr>
              <td style={styles.labelCell}>Topography:</td>
              <td style={{ ...styles.dataCell, ...styles.subjectCell }}>
                {getLabelFromValue(appraisalData.topography, topographyOptions)}
              </td>
              {landComps.map((comp, idx) => (
                <td key={comp.id} style={styles.inputCell}>
                  <SelectTextField
                    name={`landComps.${idx}.topography_adj`}
                    value={comp.topography_adj || '-'}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      updateCompValue(idx, 'topography_adj', e.target.value)
                    }
                    options={[
                      { value: '-', label: '-' },
                      { value: 'Superior', label: 'Superior' },
                      { value: 'Similar', label: 'Similar' },
                      { value: 'Inferior', label: 'Inferior' },
                    ]}
                    style={{ fontSize: '11px', minWidth: '80px' }}
                  />
                </td>
              ))}
            </tr>

            {/* Size/SF */}
            <tr>
              <td style={styles.labelCell}>Size/SF:</td>
              <td style={{ ...styles.dataCell, ...styles.subjectCell }}>
                {appraisalData.land_size?.toLocaleString() || '-'}
              </td>
              {landComps.map((comp, idx) => (
                <td key={comp.id} style={styles.inputCell}>
                  <SelectTextField
                    name={`landComps.${idx}.size_adj`}
                    value={comp.size_adj || '-'}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      updateCompValue(idx, 'size_adj', e.target.value)
                    }
                    options={[
                      { value: '-', label: '-' },
                      { value: 'Superior', label: 'Superior' },
                      { value: 'Similar', label: 'Similar' },
                      { value: 'Inferior', label: 'Inferior' },
                    ]}
                    style={{ fontSize: '11px', minWidth: '80px' }}
                  />
                </td>
              ))}
            </tr>

            {/* Zoning (Qualitative) */}
            <tr>
              <td style={styles.labelCell}>Zoning:</td>
              <td style={{ ...styles.dataCell, ...styles.subjectCell }}>
                {appraisalData.zoning_type || 'None'}
              </td>
              {landComps.map((comp, idx) => (
                <td key={comp.id} style={styles.inputCell}>
                  <SelectTextField
                    name={`landComps.${idx}.zoning_adj`}
                    value={comp.zoning_adj || '-'}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      updateCompValue(idx, 'zoning_adj', e.target.value)
                    }
                    options={[
                      { value: '-', label: '-' },
                      { value: 'Superior', label: 'Superior' },
                      { value: 'Similar', label: 'Similar' },
                      { value: 'Inferior', label: 'Inferior' },
                    ]}
                    style={{ fontSize: '11px', minWidth: '80px' }}
                  />
                </td>
              ))}
            </tr>

            {/* Overall Comparability - Footer */}
            <tr style={styles.footerRow}>
              <td style={styles.footerCell}>Overall Comparability:</td>
              <td style={styles.footerCell}>N/A</td>
              {landComps.map((comp, idx) => (
                <td key={comp.id} style={styles.footerCell}>
                  <SelectTextField
                    name={`landComps.${idx}.overall_comparability`}
                    value={comp.overall_comparability || 'Inferior'}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      updateCompValue(idx, 'overall_comparability', e.target.value)
                    }
                    options={[
                      { value: 'Superior', label: 'Superior' },
                      { value: 'Similar', label: 'Similar' },
                      { value: 'Inferior', label: 'Inferior' },
                    ]}
                    style={{ 
                      fontSize: '11px', 
                      minWidth: '80px',
                      color: 'white',
                      backgroundColor: 'transparent',
                    }}
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Summary */}
      {landComps.length > 0 && (
        <div className="mx-5 mb-10 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-3">Land Value Indication</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Number of Comparables</p>
              <p className="text-xl font-bold text-[#4a7c59]">{landComps.length}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Subject Land Size</p>
              <p className="text-xl font-bold text-[#4a7c59]">
                {appraisalData.land_size?.toLocaleString() || '-'} {appraisalData.land_dimension || 'Acres'}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Average Adjusted $/Acre</p>
              <p className="text-xl font-bold text-[#4a7c59]">
                {landComps.length > 0
                  ? formatPrice(
                      landComps.reduce((acc, comp) => {
                        const { adjustedPricePerUnit } = getCompCalculations(comp);
                        return acc + (adjustedPricePerUnit || 0);
                      }, 0) / landComps.length
                    )
                  : '-'}
              </p>
            </div>
          </div>
        </div>
      )}
    </EvaluationMenuOptions>
  );
};

export default EvaluationLandValuationApproach;
