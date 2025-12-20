import { Box, ButtonBase, Grid, Stack } from '@mui/material';
import CommonButton from '@/components/elements/button/Button';
import image1 from '../../../images/list.jpg';
import { useEffect, useState } from 'react';
import Pagination from '@mui/material/Pagination';
import { useMutate, RequestType } from '@/hook/useMutate';
import { FilterComp } from '@/components/interface/header-filter';
import { ListingEnum, PaginationEnum } from '@/pages/comps/enum/CompsEnum';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';
import AiImage from '../../../images/AI SVG.svg';
import { toast } from 'react-toastify';

import loadingImage from '../../../images/loading.png';
import { useFormikContext } from 'formik';
import { options } from '@/pages/comps/comp-form/fakeJson';
import axios from 'axios';
import { formatDateToMMDDYYYY } from '@/utils/date-format';

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
  // Add new props for map data
  mapData?: any[]; // Data from map component's cluster-details API
  paginationMeta?: any; // Pagination metadata from map component
  hoveredPropertyId?: number | null;
  setHoveredPropertyId?: (id: number | null) => void;
}

// }
type SubOption = {
  code: string;
  name: string;
};
// Remove unused rowsPerPage variable that might cause conflicts
// const rowsPerPage: number = 4;

const EvaluationLeaseFilteredMapSideListing: React.FC<CompsListingMapProps> = ({
  typeFilter: _typeFilter, // Prefixed with underscore to indicate intentionally unused
  searchValuesByfilter: _searchValuesByfilter,
  sidebarFilters: _sidebarFilters,
  typeProperty: _typeProperty,
  passSetCheckType,
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
  hoveredPropertyId,
  setHoveredPropertyId,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const compsLength = location.state?.compsLength;
  // const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<any[]>([]);
  const { values, setValues } = useFormikContext();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const leaseId = searchParams.get('approachId');
  const [qualitativeApproachItems] = useState<SubOption[]>([]);
  const comparisonBasis = location.state?.comparisonBasis;

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
      comp.lease_rate === 0 || comp.total_beds === 0
        ? 0
        : comp.lease_rate_unit === 'monthly'
          ? (comp.lease_rate / comp.total_beds) * 12
          : comp.lease_rate / comp.total_beds;

    const bedUnitPerSqFt =
      comp.total_units === 0 || comp.lease_rate === 0
        ? 0
        : comp.lease_rate_unit === 'monthly'
          ? (comp.lease_rate / comp.total_units) * 12
          : comp.lease_rate / comp.total_units;

    const finalBed = (total / 100) * bedPerSqFit + bedPerSqFit;

    const finalUnits = (total / 100) * bedUnitPerSqFt + bedUnitPerSqFt;

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
  // Loading state is handled by the parent loading prop, not the mutation
  const approachType = localStorage.getItem('approachType');
  // const [loading,setLoading]=useState<boolean>(false);
  const parameterType =
    approachType === 'salesCheckbox' ? ListingEnum.SALE : ListingEnum.LEASE;

  const selectedCompsMutation = useMutate<any, any>({
    queryKey: 'selected-comps',
    endPoint: '/evaluations/get-selected-comps/',
    requestType: RequestType.POST,
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
    // Only fetch once when leaseId changes, not on every render
    if (leaseId) {
      fetchComposData(values, setValues);
    }
  }, [leaseId]); // Remove values and setValues from dependencies to prevent loops
  const compsPropertyType = localStorage.getItem('property_type');

  const compStatus = localStorage.getItem('compStatus') || '';
  useEffect(() => {
    return; // Exit early, never call the API
  }, [
    page,
    parameterType,
    _searchValuesByfilter,
    _sidebarFilters,
    _typeProperty,
    _sortingSettings,
    compsPropertyType,
    compStatus,
    mapData,
  ]);

  // The mapData prop provides data from the map component's API calls based on viewport
  useEffect(() => {
    // Only reset to first page when new map data comes in and current page exceeds available pages
    if (mapData && mapData.length > 0 && paginationMeta?.totalPages) {
      const apiTotalPages = paginationMeta.totalPages;

      // Only reset page if current page exceeds available pages from API
      if (page > apiTotalPages) {
        const timer = setTimeout(() => {
          setPage(1);
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [mapData, paginationMeta]); // Depend on both mapData and paginationMeta

  // const location = useLocation();
  // const queryParams = new URLSearchParams(location.search);

  // const propertyId = queryParams.get('id'); // instead of using just `id`
  // const approachId = queryParams.get('approachId');
  const viewListingItem = (id: number) => {
    const check = checkType === 'salesCheckbox' ? 'sales' : 'lease';

    const searchParams = new URLSearchParams(location.search);
    const propertyIdFromUrl = searchParams.get('id');
    const approachIdFromUrl = searchParams.get('approachId');

    navigate(`/evaluation/lease-comps-view/${id}/${check}`, {
      state: {
        propertyId: propertyIdFromUrl,
        approachId: approachIdFromUrl,
        selectedToggleButton: selectedToggleButton || null,
        comparisonBasisView: finalComparisonBasisView,
      },
    });
  };

  // Loading state is handled by the parent loading prop, not the mutation
  if (loading) {
    return (
      <div className="img-update-loader">
        <img src={loadingImage} />
      </div>
    );
  }

  // Always use mapData from map component - no fallback to API data
  // The map component handles ALL data fetching via map-cluster and map-cluster-details APIs
  const allMapData = mapData || [];

  // Use API pagination - display all data from current page
  const data = allMapData; // Display all data from the current API page
  const totalPages = paginationMeta?.totalPages || 1; // Use API's total pages

  // Debug pagination logic
  console.log('🏗️ Lease Listing Pagination Debug:', {
    source: 'map-cluster-details API pagination',
    totalMapData: allMapData.length,
    currentPage: page,
    totalPages: totalPages,
    displayedDataLength: data.length,
    apiMeta: {
      totalRecord: paginationMeta?.totalRecord,
      apiTotalPages: paginationMeta?.totalPages,
      apiLimit: paginationMeta?.limit,
      apiPage: paginationMeta?.page,
    },
  });

  // Pagination handlers (defined after totalPages calculation)
  const handlePreviousPage = () => {
    const newPage = Math.max(page - 1, 1);
    if (newPage !== page) {
      setPage(newPage);
    }
  };

  const handleNextPage = () => {
    const newPage = Math.min(page + 1, totalPages);
    if (newPage !== page) {
      setPage(newPage);
    }
  };

  const handleChangePage = (
    _event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    // Prevent unnecessary re-renders if page is the same
    if (newPage !== page && newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleSubmit = async () => {
    if (selectedIds.length === 0) {
      toast('Please select comps.');
      return;
    }

    try {
      const params = { compIds: selectedIds };
      const response = await selectedCompsMutation.mutateAsync(params);

      if (response?.data) {
        // Remove console.log from API response handling
        // console.log('response data', response?.data.data);

        const comps = response?.data?.data || [];
        const updatedComps = comps.map(({ id, ...restComp }: any) => {
          return {
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
            adjusted_psf: restComp.price_square_foot,
          };
        });

        // Remove console.log from component logic
        // console.log(updatedComps, 'updatedComps');

        // dataHandle(updatedComps);
        navigate(`/evaluation/lease-approach?id=${id}&leaseId=${leaseId}`, {
          state: { updatedComps },
        });
        // Remove console.log from component logic
        // console.log('updatedcomps', updatedComps);
        // navigate(`/sales-approach?id=${id}&salesId=${salesId}`);
      } else {
        // Keep error logging for debugging purposes
        console.error('Unexpected response:', response);
      }
    } catch (error) {
      // Keep error logging for debugging purposes
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
        `evaluations/get-lease-approach?evaluationId=${id}&evaluationScenarioId=${leaseId}`,
        {}
      );

      const compsArr = response?.data?.data?.data?.comps;
      localStorage.setItem('compsLengthLease', compsArr.length);

      //   const appraisalSalesApproachResponseId = response?.data?.data?.data?.id;
      //   const salesNoteForComp = response?.data?.data?.data?.note;

      //   setSalesNote(salesNoteForComp);
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

      const calculatedComps = [];
      for (let i = 0; i < compsArr.length; i++) {
        const c = compsArr[i];
        const weight = c?.weight;
        const total = c?.total_adjustment;

        // Calculate comp data
        const calculatedCompData = calculateCompData({
          total: total,
          weight: weight,
          comp: c?.comp_details,
        });

        // Format expenses
        const formattedExpenses = formattedOperatingExpenses.map((oe: any) => {
          const newValue = c.comps_adjustments.find(
            (adj: { adj_key: any }) => adj.adj_key === oe.adj_key
          );

          const isCustom = !options.some(
            (option: { value: any }) => option.value === newValue.adj_value
          );
          return {
            ...oe,
            adj_key: newValue.adj_key,
            adj_value: newValue.adj_value || 0,
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
        const avgpsf =
          (total / 100) * c?.comp_details?.price_square_foot +
          c?.comp_details?.price_square_foot;
        const finalavgpsf = (avgpsf * weight) / 100;

        calculatedComps.push({
          ...c.comp_details,
          ...calculatedCompData,
          expenses: formattedExpenses,
          quantitativeAdjustments: formattedQualitativeApproach,
          id: c.id,
          comp_id: c.comp_id,
          averaged_adjusted_psf: finalavgpsf,
          blended_adjusted_psf: c.blended_adjusted_psf,
          weight: c.weight,
          total: c.total_adjustment,
          adjustment_note: c?.adjustment_note,
        });
      }

      setValues({
        ...values,
        tableData: calculatedComps,
        operatingExpenses: formattedOperatingExpenses,
        salesCompQualitativeAdjustment: formattedQualitativeExpenses,
      });

      //   setAppraisalId(appraisalSalesApproachResponseId);
    } catch (error) {
      // Keep error logging for debugging purposes
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

  if (loading) {
    return (
      <div className="img-update-loader">
        <img src={loadingImage} />
      </div>
    );
  }
  const backToApproach = () => {
    navigate(`/evaluation/lease-approach?id=${id}&leaseId=${leaseId}`);
  };

  // Remove console.log from render cycle to prevent performance issues
  // console.log('as', checkType);
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
                  {/* Leases Checkbox */}
                  <Box className="round">
                    <Box
                      className={`pl-2 flex items-center ${approachType === 'salesCheck' ? 'cursor-not-allowed' : ''}`}
                    >
                      <input
                        type="checkbox"
                        // checked={checkType === 'leasesCheckbox'}
                        checked
                        onChange={handleCheckboxChange}
                        id="leasesCheckbox"
                        className="cursor-not-allowed disabled:opacity-50"
                      />
                      <label htmlFor="leasesCheckbox"></label>
                      <span
                        className={`select-text-content ${
                          approachType === 'salesCheck' ? 'opacity-50' : ''
                        }`}
                      >
                        {ListingEnum.LEASES}
                      </span>
                    </Box>
                  </Box>

                  {/* Sales Checkbox */}
                  {/* <Box className="round">
                    <Box
                      className={`pl-2 flex items-center ${ approachType === 'leaseCheck' ? 'cursor-not-allowed' : '' }`} >
                      <input
                        type="checkbox"
                        checked={checkType === 'salesCheckbox'}
                        onChange={handleCheckboxChange}
                        id="salesCheckbox"
                        className="cursor-not-allowed disabled:opacity-50"
                      />
                      <label htmlFor="salesCheckbox"></label>
                      <span
                        className={`select-text-content ${
                          approachType === 'leaseCheck' ? 'opacity-50' : ''
                        }`}
                      >
                        {ListingEnum.SALES}
                      </span>
                    </Box>
                  </Box> */}
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
                  <div className="text-center py-8 text-gray-500">
                    No Record Found
                  </div>
                ) : (
                  <>
                    {data.length &&
                      data.map((ele: any, index: number) => (
                        <Box
                          key={index}
                          className="flex relative bg-[white] rounded-lg w-full mb-4 p-2 border border-solid border-[#f3f3f3] gap-2"
                          style={{
                            boxShadow: '4px 7px 5px 7px #00000008',
                            backgroundColor:
                              hoveredPropertyId === ele.id
                                ? '#f0f8ff'
                                : 'white',
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
                                    ele.land_dimension === 'ACRE' // If the land dimension is in "ACRE"
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
                                <a href={`/comps-view/${ele.id}`}>
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
                                </a>
                              </Box>

                              {/* <Box className="ml-1">
                                <a
                                  href={`/update-comps/${ele.id}`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    if (e.button === 0) {
                                      updateListingItem(ele.id);
                                    }
                                  }}
                                >
                                  <CommonButton
                                    variant="contained"
                                    color="primary"
                                    className="text-xs"
                                    style={{
                                      borderRadius: '0px 0px 10px',
                                      // fontSize: '12px',
                                      padding: '2.5px 20px',
                                      textTransform: 'capitalize',
                                    }}
                                  >
                                    {ListingEnum.EDIT}
                                  </CommonButton>
                                </a>
                              </Box> */}
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
                  disabled={allMapData?.length === 0 || page === 1}
                >
                  {PaginationEnum.PREVIOUS}
                </button>
                <Pagination
                  count={totalPages}
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
export default EvaluationLeaseFilteredMapSideListing;
