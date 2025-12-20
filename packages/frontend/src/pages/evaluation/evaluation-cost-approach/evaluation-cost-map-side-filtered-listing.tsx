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
import { useGet } from '@/hook/useGet';
import { EvaluationCostApproachFormValues } from './evaluation-cost-approach-subject-property-form';
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
  mapData?: any[]; // Add mapData prop for cluster-details API data
  paginationMeta?: any; // Add pagination metadata prop
  hoveredPropertyId?: number | null;
  setHoveredPropertyId?: (id: number | null) => void;
}

const EvaluationCostFilteredMapSideListing: React.FC<CompsListingMapProps> = ({
  typeFilter: _typeFilter, // Prefixed with underscore to indicate intentionally unused
  searchValuesByfilter: _searchValuesByfilter,
  sidebarFilters: _sidebarFilters,
  typeProperty: _typeProperty,
  passSetCheckType,
  // passDataCheckType,
  sortingSettings: _sortingSettings,
  checkType,
  setCheckType,
  loading,
  selectedToggleButton,
  page,
  setPage,
  mapData = [], // Default to empty array if not provided
  paginationMeta = {}, // Default to empty object if not provided
  setHoveredPropertyId,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const compsLength = location.state?.compsLength;
  // const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<any[]>([]);
  const { values, setValues } =
    useFormikContext<EvaluationCostApproachFormValues>();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const costId = searchParams.get('approachId');
  const [landDimesion, setLandDimension] = useState('');
  const [landDimensions, setLandDimensions] = useState<any>(null);
  const [appraisalId, setAppraisalId] = useState('');
  const [, setCoverImageUrl] = useState<string | null>(null);
  const [costName, setCostName] = useState('');

  console.log(landDimesion, costName, appraisalId, landDimensions);
  const calculateCompData = ({ total, weight, comp, appraisalData }: any) => {
    const price_square_foot = comp.price_square_foot;
    const landWithAcre = parseFloat((comp.land_size / 43560).toFixed(3)); // Round to 3 decimal places
    const landPricePerUnit = comp.sale_price / landWithAcre;

    const updatedAdjustedPsf =
      appraisalData?.land_dimension === 'ACRE'
        ? (total / 100) * landPricePerUnit + landPricePerUnit
        : ((total / 100) * comp.sale_price) / comp.land_size +
          comp.sale_price / comp.land_size;
    // (total / 100) * price_square_foot + price_square_foot;
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
  const fetchComposData = async (values: any, setValues: any) => {
    try {
      // Make the API call using axios
      const response = await axios.get(
        `evaluations/get-cost-approach?evaluationId=${id}&evaluationScenarioId=${costId}`,
        {}
      );

      const compsArr = response?.data?.data?.data?.comps;
      localStorage.setItem('compsLengthCost', compsArr.length);

      const appraisalSalesApproachResponseId = response?.data?.data?.data?.id;
      //   const salesNoteForComp = response?.data?.data?.data?.notes;

      //   setSalesNote(salesNoteForComp);
      // if (response?.data?.data?.data == null) {
      //   setValues({
      //     ...values,
      //     tableData: [],
      //     operatingExpenses: values.operatingExpenses,
      //   });
      // }
      const defaultOperatingExpenses = [
        { adj_key: 'time', adj_value: 'Time', comparison_basis: 0 },
        { adj_key: 'location', adj_value: 'Location', comparison_basis: 0 },
        { adj_key: 'zonning', adj_value: 'Zonning', comparison_basis: 0 },
        { adj_key: 'services', adj_value: 'Services', comparison_basis: 0 },
        { adj_key: 'demolition', adj_value: 'Demolition', comparison_basis: 0 },
        {
          adj_key: 'economies_of_scale',
          adj_value: 'Economies of Scale',
          comparison_basis: 0,
        },
      ];
      const formattedOperatingExpenses =
        response?.data?.data?.data.cost_subject_property_adjustments?.length > 0
          ? response?.data?.data?.data.cost_subject_property_adjustments.map(
              ({ adj_key, adj_value, ...restAdj }: any) => {
                return {
                  ...restAdj,
                  comparison_basis: adj_value ? adj_value + '%' : 0,
                  adj_key: adj_key,
                  adj_value: adj_value,
                };
              }
            )
          : defaultOperatingExpenses;
      const formattedComparativeAdjustment =
        response?.data?.data?.data.comparison_attributes.map(
          ({ comparison_key, comparison_value, ...restAdj }: any) => ({
            ...restAdj,
            comparison_basis: comparison_key
              ? comparison_value
              : comparison_value,
            comparison_key,
            comparison_value,
          })
        );
      const calculatedComps = []; // Array to store calculated comp data

      for (let i = 0; i < compsArr.length; i++) {
        const c = compsArr[i];
        const weight = c?.weight;
        const total = c?.total_adjustment;
        const appData = appraisalData;

        // Calculate comp data
        const calculatedCompData = calculateCompData({
          total: total,
          weight: weight,
          comp: c?.comp_details,
          appraisalData: appData,
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
        const avgpsf =
          (total / 100) * c?.comp_details?.price_square_foot +
          c?.comp_details?.price_square_foot;
        const finalavgpsf = (avgpsf * weight) / 100;
        // (total / 100) * price_square_foot + price_square_foot;
        // Combine calculated data and formatted expenses
        calculatedComps.push({
          ...c.comp_details,
          ...calculatedCompData,
          expenses: formattedExpenses,
          id: c.id,
          comp_id: c.comp_id,
          averaged_adjusted_psf: finalavgpsf,
          blended_adjusted_psf: c.blended_adjusted_psf,
          weight: c.weight,
          total: c.total_adjustment,
          adjustment_note: c?.adjustment_note,
          adjusted_psf: c?.adjusted_psf,
        });
      }

      // Set combined values in state once
      setValues({
        ...values,
        tableData: calculatedComps,
        operatingExpenses: formattedOperatingExpenses,
        appraisalSpecificAdjustment: formattedComparativeAdjustment,
      });

      setAppraisalId(appraisalSalesApproachResponseId);
    } catch (error) {
      // Handle the error
    }
  };
  const { data: areaInfoData } = useGet<any>({
    queryKey: `areaInfo`,
    endPoint: `evaluations/get/${id}`,
    config: {
      enabled: Boolean(costId),
      refetchOnWindowFocus: false,
      onSuccess(data: any) {
        setLandDimension(data?.data?.data?.land_dimension); // Set the land dimension
        const landDimension = data?.data?.data?.land_dimension;

        const mapData = data?.data?.data?.scenarios;

        mapData &&
          mapData.map((item: any) => {
            if (item.id == costId) {
              setCostName(item.name);
            }
          });

        const appraisalApproach = data?.data?.data?.scenarios?.find(
          (approach: any) =>
            costId ? approach.id == parseFloat(costId) : false
        );

        // Find the 'cover' image in the appraisal_files array
        const coverImage = data?.data?.data?.evaluation_files?.find(
          (file: any) => file.title === 'cover'
        );

        // Construct the URL and set the global state
        if (coverImage) {
          const imageUrl = coverImage.dir;
          setCoverImageUrl(imageUrl);
        }
        setLandDimensions(landDimension);

        const appraisalSalesApproachId = appraisalApproach
          ? appraisalApproach.evaluation_cost_approach.id
          : null;

        if (appraisalSalesApproachId) {
          fetchComposData(values, setValues);
        } else {
          console.error('appraisalSalesApproachId is undefined');
        }
      },
    },
  });
  const appraisalData = areaInfoData?.data.data || {};
  const approachType = localStorage.getItem('approachType');

  // Note: parameterType kept for potential future use but currently unused since we use cluster-details API

  // Note: Keeping the old mutation for reference but it's no longer used since we get data from cluster-details API via mapData prop
  // const mutation = useMutate<typeResponse, any>({
  //   queryKey: `list/${parameterType}`,
  //   endPoint: 'comps/list',
  //   requestType: RequestType.POST,
  // });

  const selectedCompsMutation = useMutate<any, any>({
    queryKey: 'selected-comps',
    endPoint: '/evaluations/get-selected-comps/',
    requestType: RequestType.POST,
  });

  // DISABLED: cluster-details API call for cost approach since we now get data from map component
  // This prevents duplicate API calls and improves performance
  const [isLoadingClusterDetails] = useState(false);

  // DISABLED: Cost-specific cluster-details API call function
  // Now using mapData from parent component via map component's API calls
  /*
  const callClusterDetailsAPI = useCallback(async () => {
    console.log('🏗️ Cost: cluster-details API call disabled - using mapData from map component');
    return;
  }, []);
  */
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
  }, [costId]);

  // Call cluster-details API when filters change
  // DISABLED: Map component now handles all cluster-details API calls
  // The mapData prop provides data from the map component's API calls
  /*
  useEffect(() => {
    console.log('🏗️ Cost: Dependencies changed, calling cluster-details API');
    callClusterDetailsAPI();
  }, [
    page,
    _typeProperty,
    _searchValuesByfilter,
    _sidebarFilters,
    checkType,
    _sortingSettings,
    callClusterDetailsAPI,
  ]);
  */

  // Note: These localStorage values are kept for potential filtering but currently unused since we use cluster-details API

  // Note: Removed the old API call useEffect since we now get data from cluster-details API via mapData prop
  /*
  useEffect(() => {
    const fetchData = async () => {
      // ... old comps/list API call logic ...
    };
    fetchData();
  }, [page, parameterType, typeFilter, searchValuesByfilter, sidebarFilters, typeProperty, sortingSettings, compsPropertyType, compStatus]);
  */

  const handleChangePage = (
    _event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const viewListingItem = (id: number) => {
    const check = 'cost';

    const searchParams = new URLSearchParams(location.search);
    const propertyIdFromUrl = searchParams.get('id');
    const approachIdFromUrl = searchParams.get('approachId');

    navigate(`/evaluation/cost-comps-view/${id}/${check}`, {
      state: {
        propertyId: propertyIdFromUrl,
        approachId: approachIdFromUrl,
        selectedToggleButton: selectedToggleButton || null,
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

  // Use mapData from cluster-details API (via map component) or fallback to empty array
  // Prioritize mapData from parent component over independent API calls
  const data = mapData?.length > 0 ? mapData : [];
  const isUsingMapData = mapData && mapData.length > 0;
  const isLoading = loading || isLoadingClusterDetails;

  // Calculate pagination from API metadata if available, otherwise use data length
  const totalPages = paginationMeta?.totalPages || Math.ceil(data.length / 10);

  console.log(
    '🏗️ Cost Approach - Using map data:',
    isUsingMapData,
    'Data length:',
    data.length,
    'Pagination meta:',
    paginationMeta
  );

  // Legacy API calls for backward compatibility - comment these out since we use cluster-details API
  /*
  if (mutation.isLoading) {
    return <>{ListingEnum.LOADING}....</>;
  }

  if (mutation.isError) {
    return <>{ListingEnum.ERROR}....</>;
  }

  rowsPerPage = mutation.data?.data.data.totalRecord || 4;
  const data = mutation.data?.data.data.comps || [];
  */

  console.log(data, 'dataaaafff - Cost Approach - from mapData');

  // Legacy: Keep passGoogleData call for backward compatibility
  // Data is already provided via mapData prop from parent component
  console.log(
    '📍 Cost Approach passGoogleData called with',
    data.length,
    'items from mapData'
  );

  const handleSubmit = async () => {
    localStorage.setItem('activeType', 'building_with_land');

    if (selectedIds.length === 0) {
      toast('Please select comps.');
      return;
    }

    try {
      const params = { compIds: selectedIds };
      const response = await selectedCompsMutation.mutateAsync(params);

      if (response?.data) {
        console.log('response data', response?.data.data);

        const comps = response?.data?.data || [];
        const updatedComps = (comps || []).map(({ id, ...restComp }: any) => {
          return {
            ...restComp,
            comp_id: id,
            expenses: (values?.operatingExpenses || []).map((exp: any) => ({
              ...exp,
              adj_value: 0,
              comparison_basis: 0,
            })),
            comparativeAdjustmentsList: (
              values?.appraisalSpecificAdjustment || []
            ).map((exp: any) => ({
              ...exp,
              comparison_value: 0,
              comparison_basis: 0,
            })),
            adjusted_psf: restComp.price_square_foot,
          };
        });
        console.log(values, 'updatedComps-----');

        // dataHandle(updatedComps);
        navigate(`/evaluation/cost-approach?id=${id}&costId=${costId}`, {
          state: { updatedComps },
        });
        console.log(updatedComps, 'updatedComps');

        // navigate(`/sales-approach?id=${id}&salesId=${salesId}`);
      } else {
        console.error('Unexpected response:', response);
      }
    } catch (error) {
      console.error('Filter submission error:', error);
    }
  };

  console.log('adas', values);

  // const handleCheckboxToggle = (id: any) => {
  //   setSelectedIds(
  //     (prevSelectedIds) =>
  //       prevSelectedIds.includes(id)
  //         ? prevSelectedIds.filter((itemId) => itemId !== id) // Remove if already selected
  //         : [...prevSelectedIds, id] // Add to selection
  //   );
  // };

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

  if (isLoading) {
    return (
      <div className="img-update-loader">
        <img src={loadingImage} />
      </div>
    );
  }

  const backToApproach = () => {
    localStorage.setItem('activeType', 'building_with_land');
    navigate(`/evaluation/cost-approach?id=${id}&costId=${costId}`);
    localStorage.setItem('activeType', 'building_with_land');
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
                  <Box className="round">
                    <Box
                      className={`pl-2 flex items-center ${approachType === 'salesCheck' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
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
                  </Box>

                  <Box className="round">
                    <Box
                      className={`pl-2 flex items-center ${approachType === 'leaseCheckBox' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
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
                                    pathname: `/evaluation/cost-comps-view/${ele.id}`,
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
export default EvaluationCostFilteredMapSideListing;
