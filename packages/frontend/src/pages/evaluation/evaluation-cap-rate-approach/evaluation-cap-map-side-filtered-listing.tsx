import { Box, ButtonBase, Grid, Stack } from '@mui/material';
import CommonButton from '@/components/elements/button/Button';
import image1 from '../../../images/list.jpg';
import { useEffect, useState } from 'react';
import Pagination from '@mui/material/Pagination';
import { useMutate, RequestType } from '@/hook/useMutate';
import { FilterComp } from '@/components/interface/header-filter';
import { ListingEnum, PaginationEnum } from '@/pages/comps/enum/CompsEnum';
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';
import AiImage from '../../../images/AI SVG.svg';
import { toast } from 'react-toastify';

import loadingImage from '../../../images/loading.png';
import { useFormikContext } from 'formik';
import { options } from '@/pages/comps/comp-form/fakeJson';
import axios from 'axios';

interface CompsListingMapProps {
  typeFilter: string;
  typeProperty: any;
  searchValuesByfilter: string;
  sidebarFilters: FilterComp | null;
  passGoogleData: any;
  passSetCheckType: any;
  passDataCheckType: any;
  sortingSettings: any;
  checkType: any;
  setCheckType: any;
  setLoading: any;
  loading: any;
  selectedToggleButton?: any;
  page: any;
  setPage: any;
  comparisonBasisView?: any;
  mapData?: any[]; // Add mapData prop for cluster-details API data
  paginationMeta?: {
    // Add pagination metadata
    totalRecord?: number;
    totalPages?: number;
    limit?: number;
    page?: number;
  };
  hoveredPropertyId?: number | null;
  setHoveredPropertyId?: (id: number | null) => void;
}

// Note: These interfaces were used for the old comps/list API
// Keeping them commented for reference but no longer needed since we use cluster-details API
/*
interface typeResponse {
  data: {
    data: {
      comps: IComp[];
      page: number;
      perPage: number;
      totalRecord: number;
    };
  };
}
interface paramsType extends Partial<FilterComp> {
  type: any; // Already present
  limit: any; // Already present
  page: any; // Already present
  compStatus?: any; // Optional
  propertyType?: any; // Optional
  search?: any; // Optional
  orderByColumn?: any; // Optional
  orderBy?: any; // Optional
  state?: any; // Optional
  street_address?: any; // Optional
  cap_rate_min?: any; // Optional
  cap_rate_max?: any; // Optional
  price_sf_min?: any; // Optional
  price_sf_max?: any; // Optional
  land_sf_min?: any; // Optional
  land_sf_max?: any; // Optional
  square_footage_min?: any; // Optional
  square_footage_max?: any; // Optional
  building_sf_min?: any; // Optional
  building_sf_max?: any; // Optional
  start_date?: any; // Optional
  end_date?: any; // Optional
  city?: any; // Optional
  land_dimension: any;
  comparison_basis: any;
  // Additional parameters from comps/list API (commented for reference with cluster-details API)
  // comp_type?: string; // "building_with_land"
  // lease_type?: string | null; // null
}
*/
type SubOption = {
  code: string;
  name: string;
};

const EvaluationCapMapSideFilteredListing: React.FC<CompsListingMapProps> = ({
  typeFilter: _typeFilter, // Prefixed with underscore to indicate intentionally unused
  searchValuesByfilter: _searchValuesByfilter,
  sidebarFilters: _sidebarFilters,
  typeProperty: _typeProperty,
  passGoogleData,
  passSetCheckType,
  // passDataCheckType,
  sortingSettings: _sortingSettings,
  checkType,
  setCheckType,
  loading,
  selectedToggleButton,
  page,
  setPage,
  comparisonBasisView,
  mapData = [], // Default to empty array if not provided
  paginationMeta = {}, // Default to empty object if not provided
  setHoveredPropertyId,
}) => {
  const navigate = useNavigate();
  // const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<any[]>([]);
  const { values, setValues } = useFormikContext();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const salesId = searchParams.get('approachId');
  // const idFromUrl = searchParams.get('id');
  // const approachIdFromUrl = searchParams.get('approachId');
  const [qualitativeApproachItems] = useState<SubOption[]>([]);
  const [landDimensions] = useState<any>(null);
  const location = useLocation();

  // Add state for API data management
  const [apiData, setApiData] = useState<any[]>([]);
  const [apiPaginationMeta, setApiPaginationMeta] = useState<any>({});
  const [isLoadingApi, setIsLoadingApi] = useState(false);

  const compsLength = location.state?.compsLength;

  const comparisonBasis = location.state?.comparisonBasis;
  console.log(
    comparisonBasis,
    setApiData,
    setApiPaginationMeta,
    setIsLoadingApi
  );
  // Enhanced fallback for comparisonBasisView
  const finalComparisonBasisView =
    comparisonBasisView ||
    comparisonBasis ||
    location.state?.comparisonBasis ||
    localStorage.getItem('comparisonBasisView') ||
    'SF'; // Default fallback

  // Store in localStorage for persistence
  if (finalComparisonBasisView && finalComparisonBasisView !== 'SF') {
    localStorage.setItem('comparisonBasisView', finalComparisonBasisView);
  }
  const calculateCompData = ({ total, weight, comp }: any) => {
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
    const finalAdjustePricePerAcre =
      (comp.sale_price / comp?.land_size) * 43560;
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
        landDimensions === 'ACRE'
          ? finalAdjustePricePerAcre
          : comp?.comparison_basis === 'Bed'
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

  // const [loading,setLoading]=useState<boolean>(false);
  // Keep mutation for selectedComps functionality only
  const selectedCompsMutation = useMutate<any, any>({
    queryKey: 'selected-comps',
    endPoint: '/evaluations/get-selected-comps/',
    requestType: RequestType.POST,
  });

  // Debug to verify the prop chain is working
  console.log('🔍 COMPARISON BASIS DEBUG:', {
    comparisonBasisView_prop: comparisonBasisView,
    comparisonBasis_locationState: comparisonBasis,
    locationState_comparisonBasis: location.state?.comparisonBasis,
    localStorage_comparisonBasisView: localStorage.getItem(
      'comparisonBasisView'
    ),
    finalComparisonBasisView: finalComparisonBasisView,
    full_locationState: location.state,
    final_value:
      comparisonBasisView || comparisonBasis || location.state?.comparisonBasis,
  });
  const handleCheckboxChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    localStorage.setItem('checkType', e.target.id);
    localStorage.removeItem('approachType');

    setSelectedIds([]);
    localStorage.removeItem('compStatus');
    const selectedType = e.target.id;
    setCheckType(selectedType); // Update state for selected checkbox
    passSetCheckType(selectedType); // Call the function passed in props

    // Clear values from localStorage if the checkbox is toggled
    const keysToRemove = [
      'all',
      'cap_rate_max',
      'state',
      'street_address',
      'property_type',
      'price_sf_min',
      'price_sf_max',
      'building_sf_min',
      'building_sf_max',
      'square_footage_min',
      'square_footage_max',
      'start_date',
      'end_date',
      'lease_type',
      'selectedCities',
      'land_sf_max',
      'land_sf_min',
      'street_address_comps',
    ];

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key); // Remove all the specified keys
    });

    // Optionally, set empty or default values for compStatus and property_type
    localStorage.setItem('property_type', '');

    // Reset params and checkStatus if they are set in localStorage
    localStorage.removeItem('params');
    localStorage.removeItem('checkStatus');

    setPage(1); // Reset the page to the first page
  };
  useEffect(() => {
    if (checkType === 'salesCheckbox') {
      localStorage.removeItem('compStatus');
    }
  }, [checkType]);
  useEffect(() => {
    fetchComposData(values, setValues);
  }, [salesId]);

  // Additional effect to ensure comparison basis is available
  useEffect(() => {
    if (!finalComparisonBasisView || finalComparisonBasisView === 'SF') {
      // Try to get from API if not available
      const fetchComparisonBasis = async () => {
        try {
          const response = await axios.get(`evaluations/get/${id}`, {});
          const evaluationData = response?.data?.data?.data;
          if (evaluationData?.comparison_basis) {
            localStorage.setItem(
              'comparisonBasisView',
              evaluationData.comparison_basis
            );
          }
        } catch (error) {
          console.log('Could not fetch comparison basis from evaluation data');
        }
      };
      fetchComparisonBasis();
    }
  }, [id, finalComparisonBasisView]);

  useEffect(() => {
    // Only trigger re-renders when essential props change
    console.log(
      '📍 Map data updated in listing component:',
      mapData?.length || 0,
      'properties'
    );
    console.log('📄 Pagination metadata:', paginationMeta);
  }, [mapData, paginationMeta]);

  const handleChangePage = (
    _event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const viewListingItem = (id: number) => {
    const check = checkType === 'salesCheckbox' ? 'sales' : 'lease';

    const searchParams = new URLSearchParams(location.search);
    const propertyIdFromUrl = searchParams.get('id');
    const approachIdFromUrl = searchParams.get('approachId');

    navigate(`/evaluation/cap-comps-view/${id}/${check}`, {
      state: {
        propertyId: propertyIdFromUrl,
        approachId: approachIdFromUrl,
        selectedToggleButton: selectedToggleButton || null,
        comparisonBasisView: finalComparisonBasisView,
      },
    });
  };
  // const updateListingItem = (id: number) => {
  //   navigate(`/update-comps/${id}`);
  // };

  const handlePreviousPage = () => {
    setPage((prevPage: any) => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setPage((prevPage: any) => Math.max(prevPage + 1, 1));
  };

  const data = mapData && mapData.length > 0 ? mapData : apiData || [];

  const activePaginationMeta =
    mapData && mapData.length > 0 ? paginationMeta : apiPaginationMeta;
  const totalRecords = activePaginationMeta?.totalRecord || 0;
  const itemsPerPage = activePaginationMeta?.limit || 10;
  const totalPages =
    activePaginationMeta?.totalPages || Math.ceil(totalRecords / itemsPerPage);

  // Show loading state when API is loading
  const isCurrentlyLoading = isLoadingApi || loading;

  // Debug data source and pagination calculations
  console.log('📄 Data Source Debug:', {
    dataSource: apiData.length > 0 ? 'API' : 'Map',
    apiDataLength: apiData.length,
    mapDataLength: mapData?.length || 0,
    finalDataLength: data.length,
    totalRecords,
    itemsPerPage,
    totalPages,
    currentPage: page,
    activePaginationMeta,
    isLoadingApi,
    loading,
  });

  // Pass the map data to Google Map component
  passGoogleData(data);
  function formatDateToMMDDYYYY(dateString: any) {
    if (!dateString) return '';

    // Ensure the input is in the correct format
    const [year, month, day] = dateString.split('-');
    if (!year || !month || !day) return 'Invalid date format';

    return `${month}/${day}/${year}`;
  }

  const handleSubmit = async () => {
    if (selectedIds.length === 0) {
      toast('Please select comps.');
      return;
    }

    try {
      const params = { compIds: selectedIds };
      const response = await selectedCompsMutation.mutateAsync(params);

      if (response?.data) {
        const comps = response?.data?.data || [];

        const updatedComps = comps.map(({ id, ...restComp }: any) => ({
          ...restComp,
          comp_id: id,
          expenses: (values as any).operatingExpenses.map((exp: any) => ({
            ...exp,
            adj_value: 0,
            comparison_basis: 0,
          })),
          quantitativeAdjustments: (
            values as any
          ).salesCompQualitativeAdjustment.map((exp: any) => ({
            ...exp,
            adj_value: 'similar',
            comparison_basis: 0,
          })),
          comparativeAdjustmentsList: (
            values as any
          ).appraisalSpecificAdjustment.map((exp: any) => ({
            ...exp,
            comparison_value: 0,
            comparison_basis: 0,
          })),
          adjusted_psf: restComp.price_square_foot,
        }));

        // dataHandle(updatedComps);
        navigate(`/evaluation/sales-approach?id=${id}&salesId=${salesId}`, {
          state: { updatedComps },
        });

        // navigate(`/sales-approach?id=${id}&salesId=${salesId}`);
      } else {
        console.error('Unexpected response:', response);
      }
    } catch (error) {
      console.error('Filter submission error:', error);
    }
  };
  const formattedDropdownOptions = qualitativeApproachItems.map((option) => ({
    value: option.code,
    label: option.name,
  }));
  const fetchComposData = async (values: any, setValues: any) => {
    try {
      // Make the API call using axios
      const response = await axios.get(
        `evaluations/get-cap-approach?evaluationId=${id}&evaluationScenarioId=${salesId}`,
        {}
      );

      const compsArr = response?.data?.data?.data?.comps;

      // Check if API response has comparison basis info and store it
      const apiComparisonBasis = response?.data?.data?.data?.comparison_basis;
      if (apiComparisonBasis && !localStorage.getItem('comparisonBasisView')) {
        localStorage.setItem('comparisonBasisView', apiComparisonBasis);
      }

      if (!compsArr) {
        setValues({
          ...values,
          tableData: [],
          operatingExpenses: values.operatingExpenses,
        });
        return; // Exit if no data
      }
      const formattedOperatingExpenses =
        response?.data?.data?.data.subject_property_adjustments.map(
          ({ adj_key, adj_value, ...restAdj }: any) => ({
            ...restAdj,
            comparison_basis: adj_value ? adj_value + '%' : 0,
            adj_key,
            adj_value,
          })
        );

      const formattedQualitativeExpenses =
        response?.data?.data?.data.subject_qualitative_adjustments.map(
          ({ adj_key, adj_value, ...restAdj }: any) => ({
            ...restAdj,
            comparison_basis: adj_value ? adj_value : 'Similar',
            adj_key,
            adj_value,
          })
        );

      const formattedComparativeAdjustment =
        response?.data?.data?.data.sales_comparison_attributes.map(
          ({ comparison_key, comparison_value, ...restAdj }: any) => ({
            ...restAdj,
            comparison_basis: comparison_key
              ? comparison_value
              : comparison_value,
            comparison_key,
            comparison_value,
          })
        );

      const calculatedComps = [];
      for (let i = 0; i < compsArr.length; i++) {
        const c = compsArr[i];
        const weight = c?.weight;
        const total = c?.total_adjustment;

        const calculatedCompData = calculateCompData({
          total: total,
          weight: weight,
          comp: c?.comp_details,
        });

        const formattedExpenses = formattedOperatingExpenses.map((oe: any) => {
          const newValue = c.comps_adjustments.find(
            (adj: { adj_key: any }) => adj.adj_key === oe.adj_key
          );

          const isCustom = !options.some(
            (option: { value: any }) => option.value === newValue?.adj_value // Safely access adj_value
          );

          return {
            ...oe,
            adj_key: newValue?.adj_key || '', // Provide a fallback if newValue or adj_key is undefined
            adj_value:
              typeof newValue?.adj_value === 'string' &&
              !isNaN(Number(newValue.adj_value)) // Check if adj_value is a string and can be converted to a number
                ? parseFloat(newValue.adj_value) // Convert to a number
                : newValue?.adj_value || 0, // Use the value as-is or provide a fallback to 0
            customType: isCustom,
          };
        });

        const formattedQualitativeApproach = formattedQualitativeExpenses.map(
          (oe: any) => {
            const newValue = c.comps_qualitative_adjustments.find(
              (adj: { adj_key: any }) => adj.adj_key === oe.adj_key
            );
            const isCustom = !formattedDropdownOptions.some(
              (option: { value: any }) => option.value === newValue.adj_value
            );
            return {
              ...oe,
              adj_key: newValue.adj_key,
              adj_value:
                typeof newValue?.adj_value === 'string' // Check if adj_value is a string
                  ? newValue.adj_value.replace(/_/g, ' ') // Replace underscores with spaces
                  : String(newValue?.adj_value || 'Similar'),
              customType: isCustom,
            };
          }
        );

        calculatedComps.push({
          ...c.comp_details,
          ...calculatedCompData,
          expenses: formattedExpenses,
          quantitativeAdjustments: formattedQualitativeApproach,
          // appraisalSpecificAdjustment: formattedComparativeApproach,
          id: c.id,
          comp_id: c.comp_id,
          overall_comparability: c.overall_comparability,
          // averaged_adjusted_psf: avgpsf,
          blended_adjusted_psf: c.blended_adjusted_psf,
          weight: c.weight,
          total: c.total_adjustment,
          adjustment_note: c?.adjustment_note,
        });
      }
      //chekc this tomorrow
      const sortedComps = calculatedComps.sort((a: any, b: any) => {
        // Sort by status (pending first, then closed)
        if (a.sale_status === 'Pending' && b.sale_status !== 'Pending') {
          return -1;
        }
        if (a.sale_status !== 'Pending' && b.sale_status === 'Pending') {
          return 1;
        }

        // Step 2: Within Pending, sort by date_sold
        if (a.sale_status === 'Pending' && b.sale_status === 'Pending') {
          return a.business_name.localeCompare(b.business_name);
        }
        if (a.sale_status === 'Closed' && b.sale_status !== 'Closed') {
          return -1;
        }
        if (a.sale_status !== 'Closed' && b.sale_status === 'Closed') {
          return 1;
        }
        if (a.sale_status === 'Closed' && b.sale_status === 'Closed') {
          return (
            (new Date(b.date_sold as any) as any) -
            (new Date(a.date_sold as any) as any)
          );
        }

        // Step 5: For any other sale_status, keep original order
        return 0;
      });
      setValues({
        ...values,
        tableData: sortedComps,
        operatingExpenses: formattedOperatingExpenses,
        salesCompQualitativeAdjustment: formattedQualitativeExpenses,
        appraisalSpecificAdjustment: formattedComparativeAdjustment,
      });

      // setAppraisalId(appraisalSalesApproachResponseId);
    } catch (error) {
      console.error('Error fetching comps data:', error);
      // Handle the error appropriately
    }
  };

  const handleCheckboxToggle = (id: string) => {
    const maxSelectable = 4 - compsLength;
    setSelectedIds((prevSelectedIds) => {
      const alreadySelected = prevSelectedIds.includes(id);
      let updatedSelection;

      if (alreadySelected) {
        // Remove the ID if it's already selected
        updatedSelection = prevSelectedIds.filter((itemId) => itemId !== id);
      } else {
        // Check limit before adding
        if (prevSelectedIds.length >= maxSelectable) {
          toast.error(
            `${compsLength} comp${compsLength === 1 ? '' : 's'} ${
              compsLength === 1 ? 'is' : 'are'
            } already linked. You can only link up to ${maxSelectable} more.`
          );
          return prevSelectedIds; // Don't add new ID
        }
        updatedSelection = [...prevSelectedIds, id];
      }

      return updatedSelection;
    });
  };

  if (isCurrentlyLoading) {
    return (
      <div className="img-update-loader">
        <img src={loadingImage} />
      </div>
    );
  }
  const backToApproach = () => {
    navigate(`/evaluation/cap-approach?id=${id}&capId=${salesId}`);
  };

  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container>
          <Grid item xs={12} className="bg-silverGray rounded-lg pb-6">
            <Box>
              <Box className="flex justify-between items-center mr-7 py-3.5">
                {/* Left Section: Buttons */}
                <Box className="pl-5 text-customBlack text-sm flex items-center gap-3">
                  <ButtonBase
                    onClick={handleSubmit}
                    disabled={selectedIds.length === 0}
                    style={{
                      backgroundColor: 'rgb(13, 161, 199)',
                      paddingTop: '6px',
                      paddingBottom: '4px',
                      paddingLeft: '20px',
                      paddingRight: '20px',
                      opacity: selectedIds.length === 0 ? 0.5 : 1, // Optional: visually indicate it's disabled
                      cursor:
                        selectedIds.length === 0 ? 'not-allowed' : 'pointer', // Optional: cursor change
                    }}
                    className="text-white text-base rounded transition-all"
                  >
                    Link Comps
                  </ButtonBase>
                  <ButtonBase
                    onClick={backToApproach}
                    style={{
                      backgroundColor: 'rgb(13, 161, 199)',
                      paddingTop: '6px',
                      paddingBottom: '4px',
                      paddingLeft: '20px',
                      paddingRight: '20px',
                    }}
                    className="text-white text-base rounded transition-all"
                  >
                    Cancel
                  </ButtonBase>
                </Box>

                {/* Right Section: Lease and Sale Checkboxes */}
                <Box className="flex gap-4 items-center">
                  {/* <Box className="round">
                    <Box className={`pl-2 flex items-center `}>
                      <input
                        type="checkbox"
                        checked={
                          checkType === 'leasesCheckbox'
                          // approachType === 'leaseCheck'
                        }
                        onChange={handleCheckboxChange}
                        id="leasesCheckbox"
                        // disabled={approachType === 'salesCheck'}
                      />
                      <label htmlFor="leasesCheckbox"></label>
                      <span className="select-text-content">
                        {ListingEnum.LEASES}
                      </span>
                    </Box>
                  </Box> */}

                  <Box className="round">
                    <Box className={`pl-2 flex items-center `}>
                      <input
                        type="checkbox"
                        checked={checkType === 'salesCheckbox'}
                        // checked={approachType === 'salesCheck'}
                        onChange={handleCheckboxChange}
                        id="salesCheckbox"
                        // disabled={approachType === 'leaseCheck'}
                      />
                      <label htmlFor="salesCheckbox"></label>
                      <span className="select-text-content">
                        {ListingEnum.SALES}
                      </span>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Box
                sx={{
                  height: '58vh',
                  fontFamily: 'montserrat-normal',
                  '&::-webkit-scrollbar': {
                    width: '10px',
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: '#0DA1C7',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(90, 90, 90, 1)',
                    borderRadius: '6px',
                  },
                }}
                className="overflow-scroll xl:h-[calc(100vh-278px)] p-3.5 pt-0"
              >
                {data.length === 0 ? (
                  <div>{ListingEnum.N0_RECORDS_FOUND}</div>
                ) : (
                  <>
                    {data.length &&
                      data.map((ele: any, index: number) => (
                        <Box
                          key={index}
                          className="flex relative bg-[white] rounded-lg w-full mb-4 p-2 border border-solid border-[#f3f3f3] gap-2"
                          style={{
                            boxShadow: '4px 7px 5px 7px #00000008',
                          }}
                          onMouseEnter={() => setHoveredPropertyId?.(ele.id)}
                          onMouseLeave={() => setHoveredPropertyId?.(null)}
                        >
                          <Box className="w-5">
                            <label className="comp-select">
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(ele.id)}
                                onChange={() => handleCheckboxToggle(ele.id)}
                              />
                              <span className="checkmark"></span>
                            </label>
                          </Box>
                          <Box className="flex-1">
                            <img
                              style={{
                                width: '100%',
                                maxWidth: '170px',
                                objectFit: 'cover',
                                height: 'auto',
                                minHeight: '115px',
                                objectPosition: 'center center',
                              }}
                              src={
                                ele.property_image_url
                                  ? import.meta.env.VITE_S3_URL +
                                    ele.property_image_url
                                  : image1
                              }
                              className="rounded-img-list-comps"
                            />
                          </Box>
                          <Box className="flex-1 py-3">
                            <Box className="flex mb-1.5">
                              <Box className="text-[#0DA1C7] text-base font-semibold capitalize leading-6">
                                {ele.street_address}
                              </Box>
                            </Box>
                            <Box className="text-sm flex text-left">
                              <Tooltip title={`${ele.street_address}`}>
                                <Box className="text-sm text-ellipsis overflow-hidden">
                                  {ele.street_address}
                                </Box>
                              </Tooltip>
                            </Box>

                            <Tooltip
                              title={`${ele.city}, ${ele.state.toUpperCase()}, ${ele.zipcode}`}
                            >
                              <Box className="text-sm py-0.5 text-ellipsis overflow-hidden">
                                {`${ele.city}, ${ele.state.toUpperCase()}, ${ele.zipcode}`}
                              </Box>
                            </Tooltip>
                            {localStorage.getItem('activeType') ===
                            'building_with_land' ? (
                              <Box className="flex gap-1 text-sm flex-wrap">
                                <p className="text-nowrap">Year Built :</p>
                                <p>
                                  {ele?.year_built === null ||
                                  ele?.year_built === ''
                                    ? 'N/A'
                                    : ele?.year_built}
                                </p>
                              </Box>
                            ) : null}
                          </Box>
                          <Box className="text-sm flex-1 py-3 min-w-52">
                            {localStorage.getItem('activeType') !==
                            'land_only' ? (
                              <Box className="flex gap-1 flex-wrap">
                                <p>Building Size :</p>
                                <p>
                                  {ele?.building_size === null ||
                                  ele?.building_size === ''
                                    ? 'N/A'
                                    : ele?.building_size.toLocaleString() +
                                      ' ' +
                                      'SF'}
                                </p>
                              </Box>
                            ) : null}

                            {/* <Box className="flex gap-1 flex-wrap">
                              <p className="text-sm">Land Size :</p>
                              <p className="text-[13px]">
                                {ele.land_dimension === 'ACRE'
                                  ? ele?.land_size === null ||
                                    ele?.land_size === ''
                                    ? 'N/A'
                                    : (
                                        ele?.land_size * 43560
                                      )?.toLocaleString() +
                                      ' ' +
                                      'SF'
                                  : ele?.land_size === null ||
                                      ele?.land_size === ''
                                    ? 'N/A'
                                    : ele?.land_size?.toLocaleString() +
                                      ' ' +
                                      'SF'}
                              </p>
                            </Box> */}

                            {localStorage.getItem('activeType') ===
                            'building_with_land' ? (
                              <Box className="flex gap-1 flex-wrap">
                                <p className="text-sm">Land Size :</p>
                                <p className="text-[13px]">
                                  {ele.land_dimension === 'ACRE'
                                    ? ele?.land_size === null ||
                                      ele?.land_size === ''
                                      ? 'N/A'
                                      : (
                                          ele?.land_size * 43560
                                        )?.toLocaleString() +
                                        ' ' +
                                        'SF'
                                    : ele?.land_size === null ||
                                        ele?.land_size === ''
                                      ? 'N/A'
                                      : ele?.land_size?.toLocaleString() +
                                        ' ' +
                                        'SF'}
                                </p>
                              </Box>
                            ) : (
                              // }
                              <Box className="flex gap-1 flex-wrap">
                                <p className="text-sm">Land Size :</p>
                                <p className="text-[13px]">
                                  {
                                    selectedToggleButton === 'SF' // Check if the selected toggle is "SF"
                                      ? ele.land_dimension === 'ACRE' // If the land dimension is in "ACRE"
                                        ? ele?.land_size === null ||
                                          ele?.land_size === '' // Check for null or empty value
                                          ? 'N/A'
                                          : (
                                              ele?.land_size * 43560
                                            )?.toLocaleString() + ' SF' // Convert to SF
                                        : ele?.land_size === null ||
                                            ele?.land_size === '' // If already in SF, just check for null or empty value
                                          ? 'N/A'
                                          : ele?.land_size?.toLocaleString() +
                                            ' SF' // Display as is in SF
                                      : selectedToggleButton === 'AC' // Check if the selected toggle is "ACRE"
                                        ? ele.land_dimension === 'SF' // If the land dimension is in "SF"
                                          ? ele?.land_size === null ||
                                            ele?.land_size === '' // Check for null or empty value
                                            ? 'N/A'
                                            : (ele?.land_size / 43560)
                                                ?.toFixed(3)
                                                .toLocaleString() + ' AC' // Convert to ACRE
                                          : ele?.land_size === null ||
                                              ele?.land_size === '' // If already in ACRE, just check for null or empty value
                                            ? 'N/A'
                                            : ele?.land_size
                                                .toFixed(3)
                                                .toLocaleString() + ' AC' // Display as is in ACRE
                                        : 'N/A' // Default fallback if no toggle is selected
                                  }
                                </p>
                              </Box>
                            )}
                            {checkType === 'salesCheckbox' ? (
                              <Box className="flex gap-1 flex-wrap">
                                <p className="text-sm">
                                  {ele?.sale_status === 'Pending'
                                    ? 'Sale Status :'
                                    : 'Date of Sale :'}
                                </p>
                                <p className="text-[13px]">
                                  {ele?.sale_status === 'Pending'
                                    ? ele?.sale_status
                                    : formatDateToMMDDYYYY(ele?.date_sold)}
                                </p>
                              </Box>
                            ) : (
                              <Box className="flex gap-1 flex-wrap">
                                <p>Lease Status :</p>
                                <p>
                                  {ele?.lease_status === 'select' ||
                                  ele?.lease_status === ''
                                    ? 'N/A'
                                    : ele?.lease_status === 'new_lease'
                                      ? 'New Lease'
                                      : ele?.lease_status}
                                </p>
                              </Box>
                            )}
                            <div
                              className={`flex justify-end items-center mt-2.5 ${
                                localStorage.getItem('activeType') ===
                                'land_only'
                                  ? 'mt-7'
                                  : ''
                              }`}
                            >
                              {ele.ai_generated === 1 && (
                                <img
                                  src={AiImage}
                                  style={{
                                    width: '30px',
                                    height: '30px',
                                    marginRight: '5px',
                                    // marginLeft: '139px',
                                  }}
                                />
                              )}
                              <Box>
                                <Link
                                  to={{
                                    pathname: `/evaluation/cap-comps-view/${ele.id}`,
                                  }}
                                  state={{
                                    id: 880,
                                    approachId: 331,
                                  }}
                                >
                                  <CommonButton
                                    variant="contained"
                                    className="text-xs"
                                    color="primary"
                                    style={{
                                      borderRadius: '0 0 0 10px',
                                      padding: '2.5px 20px',
                                      textTransform: 'capitalize',
                                    }}
                                    onClick={(e: any) => {
                                      e.preventDefault();
                                      viewListingItem(ele.id);
                                    }}
                                  >
                                    {ListingEnum.VIEW}
                                  </CommonButton>
                                </Link>
                              </Box>
                            </div>
                          </Box>
                        </Box>
                      ))}
                  </>
                )}
              </Box>
              <Stack direction="row" justifyContent="center" mt={2}>
                <button
                  className={`bg-inherit text-customDeeperSkyBlue cursor-pointer border-none py-1 px-3 ${page === 1 ? 'text-gray-400 cursor-not-allowed' : ''}`}
                  onClick={handlePreviousPage}
                  disabled={data?.length === 0 || page === 1}
                >
                  {PaginationEnum.PREVIOUS}
                </button>
                <Pagination
                  count={data?.length === 0 ? 0 : totalPages}
                  page={page}
                  onChange={handleChangePage}
                  className="paginationCard"
                  sx={{
                    '& .MuiPaginationItem-page.Mui-selected': {
                      backgroundColor: '#687F8B',
                      color: 'white',
                    },
                  }}
                />
                <button
                  className={`bg-inherit text-customDeeperSkyBlue cursor-pointer border-none py-1 px-3 ${page >= totalPages ? 'text-gray-400 cursor-not-allowed' : ''}`}
                  disabled={page >= totalPages}
                  onClick={handleNextPage}
                >
                  {PaginationEnum.NEXT}
                </button>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};
export default EvaluationCapMapSideFilteredListing;
