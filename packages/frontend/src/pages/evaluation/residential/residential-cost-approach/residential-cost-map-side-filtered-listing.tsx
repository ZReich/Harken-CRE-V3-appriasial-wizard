import { Box, ButtonBase, Grid, Stack } from '@mui/material';
import CommonButton from '@/components/elements/button/Button';
import image1 from '../../../../images/list.jpg';
import { useEffect, useState } from 'react';
import Pagination from '@mui/material/Pagination';
import { useMutate, RequestType } from '@/hook/useMutate';
import { IComp, FilterComp } from '@/components/interface/header-filter';
import { ListingEnum, PaginationEnum } from '@/pages/comps/enum/CompsEnum';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';
import AiImage from '../../../../images/AI SVG.svg';
import { ClearIcon } from '@mui/x-date-pickers';
import axios from 'axios';
import { APIClient } from '@/api/api-client';
import { toast } from 'react-toastify';
import loadingImage from '../../../../images/loading.png';
import CompDeleteModal from '@/components/modal/Comp-delete-modal';
import DeleteConfirmationModal from '@/pages/residential/Listing/delete-confirmation';
import { useFormikContext } from 'formik';
import { EvaluationCostApproachFormValues } from './residential-cost-approach-subject-property-form';
import { useGet } from '@/hook/useGet';
import { options } from '@/pages/comps/comp-form/fakeJson';
import { formatDateToMMDDYYYY } from '@/utils/date-format';
// import DeleteConfirmationModal from './delete-confirmation';
// import image4 from '../../../images/image4.png';
// import image5 from '../../../images/Group.png';
interface CompsListingMapProps {
  typeFilter?: string;
  typeProperty?: any;
  searchValuesByfilter?: string;
  sidebarFilters?: FilterComp | null;
  passGoogleData?: any;
  passSetCheckType?: any;
  passDataCheckType?: any;
  sortingSettings?: any;
  checkType?: any;
  setCheckType?: any;
  setLoading?: any;
  loading?: any;
  selectedToggleButton?: any;
  page?: any;
  setPage?: any;
  onApiDataUpdate?: any;
  uploadCompsStatus?: any;
  onPropertyFocus?: (propertyId: number | null) => void; // New prop for property focusing
  onPropertyHover?: (propertyId: number | null) => void; // New prop for property hover
  data?: IComp[] | null; // Override data prop for cluster filtering (allow null)
  isClusterFiltered?: boolean; // Indicates if data is cluster filtered
  clearClusterFilter?: () => void; // Function to clear cluster filter
  mapBounds?: {
    // Current map bounds from GoogleMapLocationComps
    north: number;
    south: number;
    east: number;
    west: number;
  };
  mapZoom?: number; // Current map zoom level
  hasMapDataUpdate?: boolean; // Indicates if data came from map
  onClustersApiUpdate?: (clusters: any[]) => void; // Callback to update clusters on the map
}

interface typeResponse {
  data: {
    data: {
      properties: IComp[];
      page: number;
      perPage: number;
      totalRecord: number;
    };
  };
}
interface paramsType {
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  zoom: number;
  page: number;
  limit: number;
  filters: {
    building_sf_max?: number | null;
    building_sf_min?: number | null;
    cap_rate_max?: number | null;
    cap_rate_min?: number | null;
    city?: any[];
    compStatus?: string;
    comp_type?: string;
    comparison_basis?: string;
    end_date?: string | null;
    land_dimension?: string;
    land_sf_max?: number | null;
    land_sf_min?: number | null;
    lease_type?: string | null;
    orderBy?: string;
    orderByColumn?: string;
    price_sf_max?: number | null;
    price_sf_min?: number | null;
    propertyType?: any[] | null;
    search?: string;
    square_footage_max?: number | null;
    square_footage_min?: number | null;
    start_date?: string | null;
    state?: string | null;
    street_address?: string | null;
    type?: string;
  };
}

const ResidentialCostMapSideFilteredListing: React.FC<CompsListingMapProps> = ({
  typeFilter: _typeFilter,
  searchValuesByfilter: _searchValuesByfilter,
  sidebarFilters: _sidebarFilters,
  typeProperty: _typeProperty,
  passGoogleData,
  // passDataCheckType,
  sortingSettings: _sortingSettings,
  checkType,
  loading,
  page,
  setPage,
  uploadCompsStatus,
  onApiDataUpdate,
  onPropertyFocus,
  onPropertyHover,
  data: externalData, // Renamed to avoid confusion with internal data
  isClusterFiltered = false,
  mapBounds, // Current map bounds
  mapZoom, // Current map zoom
  hasMapDataUpdate = false, // Indicates if data came from map
  onClustersApiUpdate,
}) => {
  const navigate = useNavigate();
  // const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number>();

  const [deleteBoolean, setDeleteBoolean] = useState('');
  const [allOriginalData, setAllOriginalData] = useState<any[]>([]);
  const [paginatedOriginalData, setPaginatedOriginalData] = useState<any[]>([]);
  const [landDimesion, setLandDimension] = useState('');
  const [costName, setCostName] = useState('');
  const [, setCoverImageUrl] = useState<string | null>(null);
  const [landDimesions, setLandDimensions] = useState<any>(null);
  console.log('🏠 SideListingMap - onApiDataUpdate prop:', onApiDataUpdate);
  const [appraisalId, setAppraisalId] = useState('');
  console.log(landDimesions, appraisalId, setDeleteId);
  const { values, setValues } =
    useFormikContext<EvaluationCostApproachFormValues>();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const costId = searchParams.get('approachId');
  console.log(landDimesion, costName);
  // Debug when externalData changes
  useEffect(() => {
    console.log('🏠📡 SideListingMap - externalData changed:', {
      externalData,
      allOriginalData,
      length: externalData?.length,
      isNull: externalData === null,
      isArray: Array.isArray(externalData),
      firstItem: externalData?.[0],
    });
  }, [externalData]);

  // const [loading,setLoading]=useState<boolean>(false);
  const parameterType =
    checkType === 'salesCheckbox' ? ListingEnum.SALE : ListingEnum.LEASE;
  const mutation = useMutate<typeResponse, paramsType>({
    queryKey: `cluster-details/${parameterType}`,
    endPoint: 'resComps/map-cluster-details',
    requestType: RequestType.POST,
  });

  useEffect(() => {
    if (checkType === 'salesCheckbox') {
      localStorage.removeItem('compStatus');
    }
  }, [checkType]);
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

  useEffect(() => {
    // Skip API call if we have cluster-filtered data (from clicking on clusters)
    if (isClusterFiltered && externalData && externalData.length > 0) {
      console.log(
        '📡 Skipping internal API call - using cluster-filtered data (length:',
        externalData?.length,
        ')'
      );
      return;
    }

    // Skip API call if we have fresh map data and we're on page 1
    if (hasMapDataUpdate && externalData && page === 1) {
      console.log(
        '📡 Skipping internal API call - using fresh map data for page 1'
      );
      return;
    }

    console.log(
      '📡 Making cluster-details API call - using backend pagination mode'
    );

    const fetchData = async () => {
      // Use map bounds if available, otherwise use world bounds
      const bounds = mapBounds || {
        north: 85, // Default world bounds
        south: -85,
        east: 180,
        west: -180,
      };

      const zoom = mapZoom || 5; // Better default zoom for US

      // Get filter parameters from localStorage and props
      const buildingMin = localStorage.getItem('building_sf_min')
            ? parseFloat(localStorage.getItem('building_sf_min')!.replace(/,/g, ''))
            :  null;
      const buildingMax = localStorage.getItem('building_sf_max')
            ? parseFloat(localStorage.getItem('building_sf_max')!.replace(/,/g, ''))
            :  null;
      const landMin = localStorage.getItem('land_sf_min')
            ? parseFloat(localStorage.getItem('land_sf_min')!.replace(/,/g, ''))
            :  null;
      const landMax = localStorage.getItem('land_sf_max')
            ? parseFloat(localStorage.getItem('land_sf_max')!.replace(/,/g, ''))
            :  null;

      const startDate = localStorage.getItem('start_date');
      const endDate = localStorage.getItem('end_date');
      const state = localStorage.getItem('state');
      const streetAddress = localStorage.getItem('street_address');
      const selectedCities = localStorage.getItem('selectedCities');

      // Process city data
      let cityArray = [];
      if (selectedCities) {
        try {
          cityArray = JSON.parse(selectedCities);
        } catch (e) {
          console.warn('Failed to parse selectedCities:', e);
        }
      }

      // Process property type data

      // Get comp type from localStorage
      const compType = localStorage.getItem('compStatus');

      // Prepare params for cluster-details API with pagination and all filters
      const params: paramsType = {
        bounds,
        zoom,
        page: page, // Current page from state
        limit: 10, // Items per page
        filters: {
          building_sf_max: buildingMax,
          building_sf_min: buildingMin,
          city: cityArray,
          end_date: endDate || null,
          land_sf_max: landMax,
          land_sf_min: landMin,
          orderBy: _sortingSettings?.orderSorting || 'DESC',
          orderByColumn: _sortingSettings?.sortingType || 'date_sold',
          propertyType: compType ? compType.split(',').filter(Boolean) : null,
          search: _searchValuesByfilter || '',
          start_date: startDate || null,
          state: state || null,
          street_address: streetAddress || null,
        },
      };

      console.log('📡 API params:', params);

      try {
        await mutation.mutateAsync(params);
      } catch (error) {
        console.error('Error while mutating data:', error);
      }
    };

    fetchData();
  }, [
    // Add page dependency for backend pagination
    parameterType,
    deleteBoolean,
    uploadCompsStatus,
    isClusterFiltered,
    page, // Page changes should trigger new API calls
    mapBounds, // Map bounds changes should trigger new API calls
    mapZoom, // Map zoom changes should trigger new API calls
    hasMapDataUpdate, // Track when map provides new data
    // Filter dependencies to trigger API calls when filters change
    _sortingSettings, // Sort changes should trigger new API calls
    _searchValuesByfilter, // Search changes should trigger new API calls
    _typeFilter, // Status filter changes should trigger new API calls
    _typeProperty, // Property type changes should trigger new API calls
    _sidebarFilters, // Sidebar filter changes should trigger new API calls
  ]);

  // Call map-clusters API whenever filters/bounds/zoom change and update map clusters
  useEffect(() => {
    const bounds = mapBounds || {
      north: 85,
      south: -85,
      east: 180,
      west: -180,
    };
    const zoom = mapZoom || 5;

    const buildingMin = localStorage.getItem('building_sf_min')
            ? parseFloat(localStorage.getItem('building_sf_min')!.replace(/,/g, ''))
            :  null;
    const buildingMax = localStorage.getItem('building_sf_max')
            ? parseFloat(localStorage.getItem('building_sf_max')!.replace(/,/g, ''))
            :  null;
    const landMin = localStorage.getItem('land_sf_min')
            ? parseFloat(localStorage.getItem('land_sf_min')!.replace(/,/g, ''))
            :  null;
    const landMax = localStorage.getItem('land_sf_max')
            ? parseFloat(localStorage.getItem('land_sf_max')!.replace(/,/g, ''))
            :  null;

    const startDate = localStorage.getItem('start_date');
    const endDate = localStorage.getItem('end_date');
    const state = localStorage.getItem('state');
    const streetAddress = localStorage.getItem('street_address');
    // const propertyType = localStorage.getItem('property_type');
    const selectedCities = localStorage.getItem('selectedCities');

    let cityArray: any[] = [];
    if (selectedCities) {
      try {
        cityArray = JSON.parse(selectedCities);
      } catch (e) {
        console.warn('Failed to parse selectedCities:', e);
      }
    }

    // let propertyTypeArray: any[] | null = null;
    // if (propertyType) {
    //   propertyTypeArray = propertyType.split(',').filter(Boolean);
    // }

    const compType = localStorage.getItem('activeType') || 'building_with_land';

    const clustersParams = {
      bounds,
      zoom,
      filters: {
        building_sf_max: buildingMax,
        building_sf_min: buildingMin,
        city: cityArray,
        end_date: endDate || null,
        land_sf_max: landMax,
        land_sf_min: landMin,
        orderBy: _sortingSettings?.orderSorting || 'DESC',
        orderByColumn: _sortingSettings?.sortingType || 'date_sold',
        search: _searchValuesByfilter || '',
        start_date: startDate || null,
        state: state || null,
        street_address: streetAddress || null,
        propertyType: compType ? compType.split(',').filter(Boolean) : null,
      },
    };

    APIClient.getInstance()
      .post<any, typeof clustersParams>('resComps/map-clusters', clustersParams)
      .then((res: any) => {
        const clusters = res?.data?.data?.clusters || [];
        // Always call onClustersApiUpdate, even if clusters array is empty
        // This ensures the map clears previous clusters when no results are found
        if (onClustersApiUpdate) {
          onClustersApiUpdate(clusters);
          console.log('🗺️ Updated map clusters:', clusters.length, 'clusters');
        }
      })
      .catch((err: any) => {
        console.error('Error fetching map clusters:', err);
        // On error, also clear clusters
        if (onClustersApiUpdate) {
          onClustersApiUpdate([]);
        }
      });
  }, [
    parameterType,
    mapBounds,
    mapZoom,
    _sortingSettings,
    _searchValuesByfilter,
    _typeFilter,
    _typeProperty,
    _sidebarFilters,
  ]);

  // Debug external data changes
  useEffect(() => {
    // Debug logging removed
  }, [externalData]);

  // Debug paginatedOriginalData changes
  useEffect(() => {
    // Debug logging removed
  }, [paginatedOriginalData]);

  // Update data state when API data changes
  useEffect(() => {
    // Use cluster-filtered data if available (from map cluster clicks)
    if (isClusterFiltered && externalData && externalData.length > 0) {
      console.log(
        '📊 Using cluster-filtered data - showing all',
        externalData?.length,
        'items from cluster'
      );
      setAllOriginalData(externalData || []);
      setPaginatedOriginalData(externalData || []); // Show all external data
    }
    // Use external data from map for page 1, then API data for other pages
    else if (hasMapDataUpdate && externalData && page === 1) {
      console.log(
        '📊 Using map data for page 1 - showing',
        externalData.length,
        'items from map'
      );
      setAllOriginalData(externalData);
      setPaginatedOriginalData(externalData);
    }
    // Use backend API data for all other cases
    else {
      const backendData = mutation.data?.data.data.properties || [];
      console.log(
        '📊 Using backend cluster-details data - showing',
        backendData.length,
        'items for page',
        page
      );
      setAllOriginalData(backendData);
      setPaginatedOriginalData(backendData); // Backend already provides paginated data
    }
  }, [mutation.data, externalData, isClusterFiltered, page, hasMapDataUpdate]);
  useEffect(() => {
    fetchComposData(values, setValues);
  }, [costId]);
  const selectedCompsMutation = useMutate<any, any>({
    queryKey: 'selected-comps',
    endPoint: '/res-evaluations/get-selected-comps/',
    requestType: RequestType.POST,
  });
  const handleSubmit = async () => {
    // localStorage.setItem('activeType', 'building_with_land');

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
        console.log(updatedComps, 'updatedComps');

        // dataHandle(updatedComps);
        navigate(
          `/residential/evaluation/cost-approach?id=${id}&costId=${costId}`,
          {
            state: { updatedComps },
          }
        );
        console.log(updatedComps, 'updatedComps');

        // navigate(`/sales-approach?id=${id}&salesId=${salesId}`);
      } else {
        console.error('Unexpected response:', response);
      }
    } catch (error) {
      console.error('Filter submission error:', error);
    }
  };
  const { data: areaInfoData } = useGet<any>({
    queryKey: `areaInfo`,
    endPoint: `res-evaluations/get/${id}`,
    config: {
      enabled: Boolean(costId),
      refetchOnWindowFocus: false,
      onSuccess(data: any) {
        setLandDimension(data?.data?.data?.land_dimension); // Set the land dimension
        const landDimension = data?.data?.data?.land_dimension;

        const mapData = data?.data?.data?.evaluation_approaches;

        mapData &&
          mapData.map((item: any) => {
            if (item.id == costId) {
              setCostName(item.name);
            }
          });

        const appraisalApproach =
          data?.data?.data?.res_evaluation_scenarios?.find((approach: any) =>
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
          ? appraisalApproach.res_evaluation_cost_approach.id
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
  const fetchComposData = async (values: any, setValues: any) => {
    try {
      // Make the API call using axios
      const response = await axios.get(
        `res-evaluations/get-cost-approach?evaluationId=${id}&evaluationScenarioId=${costId}`,
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
      console.log('check the values');
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
  // Add a useEffect to log when data variable changes
  useEffect(() => {
    // const finalData =
    //   externalData !== undefined && externalData !== null
    //     ? externalData
    //     : paginatedOriginalData;
    // Debug logging removed
  }, [externalData, paginatedOriginalData]);

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

    navigate(`/residential/cost-comps-view/${id}/${check}`, {
      state: {
        propertyId: propertyIdFromUrl,
        approachId: approachIdFromUrl,
        //  selectedToggleButton: selectedToggleButton || null,
      },
    });
  };

  const updateListingItem = (id: number) => {
    navigate(`/update-comps/${id}`);
  };

  const handlePreviousPage = () => {
    setPage((prevPage: any) => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setPage((prevPage: any) => Math.max(prevPage + 1, 1));
  };

  if (mutation.isLoading) {
    return <>{ListingEnum.LOADING}....</>;
  }

  if (mutation.isError) {
    return <>{ListingEnum.ERROR}....</>;
  }

  // Use external data for cluster filtering only
  const hasExternalData =
    isClusterFiltered && Array.isArray(externalData) && externalData.length > 0;

  // Show pagination except for cluster-filtered data
  const shouldShowPagination = !isClusterFiltered;

  // Use backend totalRecord for pagination (whether from map API or listing API)
  const totalItems = hasExternalData
    ? externalData.length // For cluster filtered, use external data length
    : mutation.data?.data.data.totalRecord || 0; // For normal listing, use backend total
  const data = hasExternalData ? externalData : paginatedOriginalData;

  console.log('🏠🎯 SideListingMap - Final data for rendering:', {
    data,
    dataLength: data?.length,
    dataSource: hasExternalData
      ? 'external (cluster-filtered)'
      : hasMapDataUpdate && page === 1
        ? 'map API (page 1)'
        : 'backend listing API',
    externalDataValue: externalData,
    externalDataLength: externalData?.length,
    paginatedDataLength: paginatedOriginalData?.length,
    currentPage: page,
    totalItems: totalItems,
    backendTotalRecord: mutation.data?.data.data.totalRecord,
    isClusterFiltered,
    hasExternalData,
    shouldShowPagination,
    hasMapDataUpdate,
    mapBounds,
    mapZoom,
  });

  // Only call passGoogleData if we're using backend data and not cluster filtered
  // When using cluster-filtered data, the map already has the data
  if (!isClusterFiltered) {
    // For backend pagination, pass the current page data to map for clustering
    passGoogleData(paginatedOriginalData);
  }

  const handleCheckboxToggle = (id: any) => {
    setSelectedIds(
      (prevSelectedIds) =>
        prevSelectedIds.includes(id)
          ? prevSelectedIds.filter((itemId) => itemId !== id) // Remove if already selected
          : [...prevSelectedIds, id] // Add to selection
    );
  };

  if (loading) {
    return (
      <div className="img-update-loader">
        <img src={loadingImage} />
      </div>
    );
  }

  const closeCompsModal1 = () => {
    setModalOpen(false);
  };
  const setArrayAfterDelete = (event: any) => {
    setDeleteBoolean(event);
  };
  const backToApproach = () => {
    localStorage.setItem('activeType', 'Residential');
    navigate(`/residential/evaluation/cost-approach?id=${id}&costId=${costId}`);
    // localStorage.setItem('activeType', 'building_with_land');
  };
  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container>
          <Grid item xs={12} className="bg-silverGray rounded-lg pb-6">
            <Box>
              <Box className="flex justify-between mr-7 py-3.5">
                <Box className="pl-5 text-customBlack text-sm">
                  {data && data.length === 0 ? (
                    ''
                  ) : (
                    <div className="select-text text-lightBlack flex items-center gap-2">
                      <span className="flex flex-wrap 2xl:flex-nowrap items-center gap-2">
                        <span
                          className="totalEntry truncate"
                          style={{ fontSize: '13px', paddingTop: '13px' }}
                        >
                          Showing{' '}
                          {!isClusterFiltered && !hasExternalData
                            ? (page - 1) * 10 + 1
                            : 1}{' '}
                          to{' '}
                          {!isClusterFiltered && !hasExternalData
                            ? Math.min(page * 10, totalItems)
                            : data.length}{' '}
                          of {totalItems} entries
                        </span>
                      </span>
                    </div>
                  )}
                </Box>
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
                          className="flex relative bg-[white] rounded-lg w-full mb-4 p-2 border border-solid border-[#f3f3f3] gap-2 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-blue-200"
                          style={{
                            boxShadow: '4px 7px 5px 7px #00000008',
                          }}
                          onMouseEnter={() => {
                            // Focus this property on the map when hovering
                            if (onPropertyFocus) {
                              onPropertyFocus(ele.id);
                            }
                            // Also call hover callback
                            if (onPropertyHover) {
                              onPropertyHover(ele.id);
                            }
                          }}
                          onMouseLeave={() => {
                            // Remove focus when not hovering
                            if (onPropertyFocus) {
                              onPropertyFocus(null);
                            }
                            // Also call hover callback
                            if (onPropertyHover) {
                              onPropertyHover(null);
                            }
                          }}
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

                            <Box className="flex gap-1 flex-wrap">
                              <p className="text-sm">Land Size :</p>
                              <p className="text-[13px]">
                                {ele.land_dimension === 'ACRE'
                                  ? ele?.land_size === null ||
                                    ele?.land_size === '' ||
                                    ele?.land_size === 0
                                    ? 'N/A'
                                    : (
                                        ele?.land_size * 43560
                                      )?.toLocaleString() +
                                      ' ' +
                                      'SF'
                                  : ele?.land_size === null ||
                                      ele?.land_size === '' ||
                                      ele?.land_size === 0
                                    ? 'N/A'
                                    : ele?.land_size?.toLocaleString() +
                                      ' ' +
                                      'SF'}
                              </p>
                            </Box>
                            {
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
                            }
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
                                <a
                                  href={`/residential/cost-comps-view/${ele.id}`}
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
                                </a>
                              </Box>

                              <Box className="ml-1">
                                <a
                                  href={`/update-comps/${ele.id}`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    if (e.button === 0) {
                                      updateListingItem(ele.id);
                                    }
                                  }}
                                ></a>
                              </Box>
                            </div>
                          </Box>
                        </Box>
                      ))}
                  </>
                )}
              </Box>
              {/* Show pagination when using backend API (not external data from map) or when using cluster-details API */}
              {shouldShowPagination && (
                <Stack direction="row" justifyContent="center" mt={2}>
                  <button
                    className={`bg-inherit text-customDeeperSkyBlue cursor-pointer border-none py-1 px-3 ${page === 1 ? 'text-gray-400 cursor-not-allowed' : ''}`}
                    onClick={handlePreviousPage}
                    disabled={data?.length === 0 || page === 1}
                  >
                    {PaginationEnum.PREVIOUS}
                  </button>
                  <Pagination
                    count={totalItems === 0 ? 0 : Math.ceil(totalItems / 10)}
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
                    className={`bg-inherit text-customDeeperSkyBlue cursor-pointer border-none py-1 px-3 ${page >= Math.ceil(totalItems / 10) ? 'text-gray-400 cursor-not-allowed' : ''}`}
                    disabled={page >= Math.ceil(totalItems / 10)}
                    onClick={handleNextPage}
                  >
                    {PaginationEnum.NEXT}
                  </button>
                </Stack>
              )}
            </Box>
          </Grid>
        </Grid>
        {modalOpen ? (
          <CompDeleteModal>
            <div
              className="text-right text-gray-500 pr-3 cursor-pointer mt-[10px]"
              onClick={closeCompsModal1}
            >
              <ClearIcon className="text-3xl" />
            </div>
            <DeleteConfirmationModal
              close={closeCompsModal1}
              deleteId={deleteId}
              setArrayAfterDelete={setArrayAfterDelete}
            />
          </CompDeleteModal>
        ) : null}
      </Box>
    </>
  );
};
export default ResidentialCostMapSideFilteredListing;
