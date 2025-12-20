import { useEffect, useState } from 'react';
import CommonButton from '@/components/elements/button/Button';
import { Box, ButtonBase, Stack } from '@mui/material';
import Pagination from '@mui/material/Pagination';
import { useMutate, RequestType } from '@/hook/useMutate';
import { IComp, FilterComp } from '@/components/interface/header-filter';
import DeleteConfirmationModal from '@/pages/comps/Listing/delete-confirmation';
import CompDeleteModal from '@/components/modal/Comp-delete-modal';
import { ClearIcon } from '@mui/x-date-pickers';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { formatDate } from '@/utils/date-format';

import loadingImage from '../../../images/loading.png';
import AiImage from '../../../images/AI SVG.svg';
import { ListingEnum, PaginationEnum } from '@/pages/comps/enum/CompsEnum';
import NoImageUpload from '../../../images/list.jpg';
import { useFormikContext } from 'formik';
import { toast } from 'react-toastify';
import axios from 'axios';
import { options } from '@/pages/comps/comp-form/fakeJson';

interface CompsListingMapProps {
  typeFilter: string;
  typeProperty: any;
  searchValuesByfilter: string;
  sidebarFilters: FilterComp | null;
  getType: any;
  isOpen: any;
  passDataCheckType: any;
  passSetCheckType: any;
  sortingSettings: any;
  checkType: any;
  setCheckType: any;
  setLoading: any;
  loading: any;
  selectedToggleButton?: any;
  page: any;
  setPage: any;
  tableData: any;
  dataHandle?: any;
}

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
}
let rowsPerPage: number = 4;
type SubOption = {
  code: string;
  name: string;
};
const EvaluationLeaseFilteredCompsList: React.FC<CompsListingMapProps> = ({
  typeFilter,
  searchValuesByfilter,
  sidebarFilters,
  typeProperty,
  getType,
  // dataHandle,
  passSetCheckType,
  sortingSettings,
  checkType,
  setCheckType,
  loading,
  selectedToggleButton,
  page,
  setPage,
}) => {
  const navigate = useNavigate();

  // const location = useLocation();
  // const [page, setPage] = useState(1);
  // const [checkType, setCheckType] = useState('salesCheckbox');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number>();
  const [deleteBoolean, setDeleteBoolean] = useState('');
  const [selectedIds, setSelectedIds] = useState<any[]>([]);
  const [appraisalId, setAppraisalId] = useState('');
  console.log(appraisalId, setDeleteId);
  //   const [landDimensions] = useState<any>(null);
  // const [setAppraisalId] = useState('');
  const [qualitativeApproachItems] = useState<SubOption[]>([]);
  const { values, setValues } = useFormikContext();
  //   const [setAppraisalId] = useState('');

  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const leaseId = searchParams.get('approachId');
  const location = useLocation();
  const compsLength = location.state?.compsLength;

  const comparisonBasis = location.state?.comparisonBasis;
  const approachType = localStorage.getItem('approachType');

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
  //   const { values } = useFormikContext();

  const parameterType =
    approachType === 'salesCheckbox' ? ListingEnum.SALE : ListingEnum.LEASE;
  const mutation = useMutate<typeResponse, paramsType>({
    queryKey: `list/${parameterType}`,
    endPoint: 'comps/list',
    requestType: RequestType.POST,
  });
  const selectedCompsMutation = useMutate<any, any>({
    queryKey: 'selected-comps',
    endPoint: '/evaluations/get-selected-comps/',
    requestType: RequestType.POST,
  });
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

      const appraisalSalesApproachResponseId = response?.data?.data?.data?.id;
      //  const salesNoteForComp = response?.data?.data?.data?.note;

      //  setSalesNote(salesNoteForComp);
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

      setAppraisalId(appraisalSalesApproachResponseId);
    } catch (error) {
      console.error('Error fetching comps data:', error);
      // Handle the error appropriately
    }
  };

  useEffect(() => {
    fetchComposData(values, setValues);
  }, [leaseId]);
  const handleSubmit = async () => {
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

        console.log(updatedComps, 'updatedComps');

        // dataHandle(updatedComps);
        navigate(`/evaluation/lease-approach?id=${id}&leaseId=${leaseId}`, {
          state: { updatedComps },
        });
        console.log('updatedcomps', updatedComps);
        // navigate(`/sales-approach?id=${id}&salesId=${salesId}`);
      } else {
        console.error('Unexpected response:', response);
      }
    } catch (error) {
      console.error('Filter submission error:', error);
    }
  };
  useEffect(() => {
    getType(parameterType);
  }, [parameterType]);
  const compsPropertyType = localStorage.getItem('property_type');
  const compsPropertyType1: string[] = compsPropertyType
    ? compsPropertyType.split(',')
    : [];
  const compStatus = localStorage.getItem('compStatus') || '';

  useEffect(() => {
    const fetchData = async () => {
      // Fetch values from localStorage
      const state = localStorage.getItem('state') || null;
      const street_address = localStorage.getItem('street_address') || null;
      const cap_rate_min = localStorage.getItem('all')
        ? Number(localStorage.getItem('all')!.replace('%', ''))
        : null;
      const cap_rate_max = localStorage.getItem('cap_rate_max')
        ? Number(localStorage.getItem('cap_rate_max')!.replace('%', ''))
        : null;
      const price_sf_min = localStorage.getItem('price_sf_min')
        ? parseFloat(localStorage.getItem('price_sf_min')!.replace(/,/g, ''))
        : null;
      const price_sf_max = localStorage.getItem('price_sf_max')
        ? parseFloat(localStorage.getItem('price_sf_max')!.replace(/,/g, ''))
        : null;
      const land_sf_min = localStorage.getItem('land_sf_min')
        ? parseFloat(localStorage.getItem('land_sf_min')!.replace(/,/g, ''))
        : null;
      const building_sf_min = localStorage.getItem('building_sf_min')
        ? parseFloat(localStorage.getItem('building_sf_min')!.replace(/,/g, ''))
        : null;
      const building_sf_max = localStorage.getItem('building_sf_max')
        ? parseFloat(localStorage.getItem('building_sf_max')!.replace(/,/g, ''))
        : null;
      const land_sf_max = localStorage.getItem('land_sf_max')
        ? parseFloat(localStorage.getItem('land_sf_max')!.replace(/,/g, ''))
        : null;

      const start_date = localStorage.getItem('start_date') || null;
      const end_date = localStorage.getItem('end_date') || null;

      const square_footage_min = localStorage.getItem('square_footage_min')
        ? parseFloat(
            localStorage.getItem('square_footage_min')!.replace(/,/g, '')
          )
        : null;
      const square_footage_max = localStorage.getItem('square_footage_max')
        ? parseFloat(
            localStorage.getItem('square_footage_max')!.replace(/,/g, '')
          )
        : null;
      const lease_type = localStorage.getItem('lease_type') || null;
      // Get selectedCities from localStorage and split it into an array
      const city = localStorage.getItem('selectedCities')
        ? JSON.parse(localStorage.getItem('selectedCities')!)
        : [];
      const compType = localStorage.getItem('activeType');
      // Prepare params
      const params: paramsType = {
        comparison_basis:
          comparisonBasis || localStorage.getItem('comparison_basis'),
        limit: 10,
        land_dimension:
          !localStorage.getItem('selectedSize') ||
          localStorage.getItem('selectedSize') === 'SF'
            ? 'SF'
            : 'ACRE',
        comp_type: compType,
        page: page,
        propertyType: compsPropertyType1.length ? compsPropertyType1 : null,
        orderByColumn: sortingSettings.sortingType || ListingEnum.DATE_SOLD,
        type: parameterType,
        search: searchValuesByfilter,
        orderBy: sortingSettings.orderSorting || 'DESC',
        compStatus: compStatus ? compStatus : '',
        ...(state ||
        street_address ||
        cap_rate_min ||
        cap_rate_max ||
        price_sf_min ||
        price_sf_max ||
        land_sf_min ||
        land_sf_max ||
        square_footage_min ||
        square_footage_max ||
        building_sf_min ||
        building_sf_max ||
        start_date ||
        city ||
        end_date ||
        lease_type
          ? {
              state,
              street_address,
              cap_rate_min,
              cap_rate_max,
              price_sf_min,
              price_sf_max,
              land_sf_min,
              land_sf_max,
              square_footage_min,
              square_footage_max,
              building_sf_max,
              building_sf_min,
              city,
              start_date,
              lease_type,
              end_date,
            }
          : sidebarFilters),
      };

      try {
        await mutation.mutateAsync(params);
      } catch (error) {
        console.error('Error while mutating data:', error);
      }
    };

    fetchData();
  }, [
    page,
    parameterType,
    typeFilter,
    searchValuesByfilter,
    sidebarFilters,
    typeProperty,
    sortingSettings,
    compsPropertyType,
    deleteBoolean,
    // compStatus,
  ]);

  const handleChangePage = (
    _event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handlePreviousPage = () => {
    setPage((prevPage: any) => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setPage((prevPage: any) => Math.max(prevPage + 1, 1));
  };

  // const updateListingItem = (id: number) => {
  //   localStorage.setItem('view', 'android');
  //   setDeleteId(id);
  //   navigate(`/update-comps/${id}`);
  // };

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
      },
    });
  };

  const closeCompsModal1 = () => {
    setModalOpen(false);
  };

  const setArrayAfterDelete = (event: any) => {
    setDeleteBoolean(event);
  };

  if (mutation.isLoading) {
    return <>{ListingEnum.LOADING}....</>;
  }

  if (mutation.isError) {
    return <>{ListingEnum.ERROR}....</>;
  }

  rowsPerPage = mutation.data?.data.data.totalRecord || 4;
  const data = mutation.data?.data.data.comps || [];

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
  const handleCheckboxChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSelectedIds([]);
    localStorage.removeItem('compStatus');
    const selectedType = e.target.id;
    localStorage.setItem('checkType', e.target.id);
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

  return (
    <Box
      style={{ backgroundColor: '#fff' }}
      className="px-3 rounded-lg h-[calc(100vh-220px)] overflow-auto"
    >
      <Box className="bg-customLightGray pt-[5px] pb-4 px-[15px] rounded">
        <Box className="flex justify-between items-center sticky z-10 top-0 py-3 bg-customLightGray">
          {/* Empty Left Section (if needed for spacing or future use) */}
          <Box />

          {/* Right Section: Buttons and Checkboxes aligned to right */}
          <Box className="flex items-center gap-6 ml-auto">
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
                  cursor: selectedIds.length === 0 ? 'not-allowed' : 'pointer', // Optional: cursor change
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

            {/* Sales and Leases Checkboxes */}
            <Box className="round flex items-center gap-4">
              {/* Lease Checkbox */}
              <Box
                className={`pl-2 flex items-center ${
                  approachType === 'salesCheck' ? 'cursor-not-allowed' : ''
                }`}
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

              {/* Sales Checkbox */}
              {/* <Box className="round">
                <Box
                  className={`pl-2 flex items-center ${
                    approachType === 'leaseCheck' ? 'cursor-not-allowed' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checkType === 'salesCheckbox'}
                    // checked={approachType === 'salesCheck'}
                    onChange={handleCheckboxChange}
                    id="salesCheckbox"
                    // disabled={approachType === 'leaseCheck'}
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
        </Box>

        {data.length === 0 ? (
          <div>{ListingEnum.N0_RECORDS_FOUND}</div>
        ) : (
          data.length &&
          data.map((item: any, index) => {
            return (
              <Box
                className="flex p-[7px] rounded-lg bg-Customwhite mb-3.5 border border-solid border-[#f3f3f3]"
                key={index}
                style={{
                  boxShadow: '4px 7px 5px 7px #00000008',
                }}
              >
                <Box>
                  <label className="comp-select mr-1.5">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => handleCheckboxToggle(item.id)}
                    />
                    <span className="checkmark"></span>
                  </label>
                </Box>

                <Box className="w-44 flex items-center">
                  <img
                    className="rounded-md object-cover object-center w-full h-full xl:min-w-[185px] min-w-[125px]"
                    src={
                      item.property_image_url
                        ? import.meta.env.VITE_S3_URL + item.property_image_url
                        : NoImageUpload
                    }
                    onError={({ currentTarget }) => {
                      currentTarget.onerror = null;
                      currentTarget.src = NoImageUpload;
                    }}
                  />
                </Box>
                <Box className="py-2 px-9 w-full">
                  <Box className="text-base break-all font-bold pt-2 text-[#0DA1C7] capitalize">
                    {item.street_address}
                  </Box>
                  <Box className="pt-1 text-[15px] leading-[22px]">
                    {item.street_address}
                  </Box>
                  <Box className="text-[15px]">
                    {item.city}, {item.state.toUpperCase()}, {item.zipcode}
                  </Box>
                </Box>
                <Box className="pb-2 pt-3 px-2 w-full text-[15px]">
                  {/* <Box className="py-2">
                    {ListingEnum.TYPE} :{' '}
                    {item.comp_type === 'building_with_land'
                      ? ListingEnum.BUILDING_WITH_LAND
                      : item.comp_type === 'land_only'
                        ? ListingEnum.LAND_ONLY
                        : ListingEnum.NA}
                  </Box> */}
                  {localStorage.getItem('activeType') === 'land_only' ? (
                    <Box className="py-2">
                      {ListingEnum.TYPE} :{' '}
                      {item.land_type
                        ? (() => {
                            switch (item.land_type) {
                              case 'ag':
                                return 'Agricultural';
                              case 'cbd':
                                return 'Central Business District (CBD)';
                              case 'industrial':
                                return 'Industrial';
                              case 'residential_2_10_units':
                                return 'Residential - 2-10 Units';
                              case 'residential_multi_family':
                                return 'Residential - Multi-Family';
                              case 'residential_single_family':
                                return 'Residential - Single Family';
                              case 'retail_office':
                                return 'Retail/Office';
                              case 'subdivisions':
                                return 'Subdivisions';
                              case 'residential_development':
                                return 'Residential - Development';
                              default:
                                return item.land_type;
                            }
                          })()
                        : ListingEnum.NA}
                    </Box>
                  ) : (
                    <Box className="py-2">
                      {ListingEnum.TYPE} :{' '}
                      {item?.type?.length > 0
                        ? item.type
                            .map((zoning: any) => {
                              switch (zoning) {
                                case 'multi_family':
                                  return 'Multi-Family';
                                case 'office':
                                  return 'Office';
                                case 'retail':
                                  return 'Retail';
                                case 'industrial':
                                  return 'Industrial';
                                case 'hospitality':
                                  return 'Hospitality';
                                case 'special':
                                  return 'Special';
                                case 'residential':
                                  return 'Residential';
                                default:
                                  return zoning.zone || ListingEnum.NA;
                              }
                            })
                            .join(', ') // Combine all results with commas
                        : ListingEnum.NA}
                    </Box>
                  )}

                  <Box className="py-2">
                    {checkType === 'salesCheckbox'
                      ? ListingEnum.SALE_DATE
                      : 'Transaction Date'}{' '}
                    :{' '}
                    {item.date_sold
                      ? `${item.sale_status === 'Pending' ? formatDate(item.date_sold) + ' (P)' : formatDate(item.date_sold)}`
                      : ListingEnum.NA}
                  </Box>
                  {item.comp_type === 'building_with_land' ? (
                    <Box className="py-2">
                      {ListingEnum.YEAR_BUILT_REMODELED} :{' '}
                      {item?.year_built ? item?.year_built : 'N/A'} /{' '}
                      {item?.year_remodeled ? item?.year_remodeled : 'N/A'}
                    </Box>
                  ) : null}
                </Box>
                <Box className="pb-2 pt-3 px-9 w-full text-[15px]">
                  {localStorage.getItem('activeType') !== 'land_only' ? (
                    <Box className="py-2">
                      {ListingEnum.BUILDING_SIZE} :{' '}
                      {item.building_size
                        ? `${item.building_size.toLocaleString()}${' '}SF`
                        : ListingEnum.NA}
                    </Box>
                  ) : null}
                  {localStorage.getItem('activeType') ===
                  'building_with_land' ? (
                    <Box className="py-2">
                      {ListingEnum.LAND_SIZE} :{' '}
                      {item.land_size
                        ? item.land_dimension === 'ACRE'
                          ? (parseFloat(item.land_size) * 43560).toLocaleString(
                              'en-US',
                              { maximumFractionDigits: 2 }
                            ) + ' SF'
                          : parseFloat(item.land_size).toLocaleString('en-US', {
                              maximumFractionDigits: 2,
                            }) + ' SF'
                        : ListingEnum.NA}
                    </Box>
                  ) : (
                    <Box className="py-2">
                      {ListingEnum.LAND_SIZE} :{' '}
                      {item.land_size
                        ? selectedToggleButton === 'SF'
                          ? item.land_dimension === 'SF'
                            ? parseFloat(item.land_size).toLocaleString(
                                'en-US',
                                {
                                  maximumFractionDigits: 2,
                                }
                              ) + ' SF'
                            : (
                                parseFloat(item.land_size) * 43560
                              ).toLocaleString('en-US', {
                                maximumFractionDigits: 2,
                              }) + ' SF'
                          : selectedToggleButton === 'AC'
                            ? item.land_dimension === 'ACRE'
                              ? parseFloat(item.land_size)
                                  .toFixed(3)
                                  .toLocaleString() + ' AC'
                              : (parseFloat(item.land_size) / 43560)
                                  .toFixed(3)
                                  .toLocaleString() + ' AC'
                            : ListingEnum.NA
                        : ListingEnum.NA}
                    </Box>
                  )}
                  {item.comp_type === 'building_with_land' ? (
                    <Box className="py-2">
                      {ListingEnum.CAP_RATE} :{' '}
                      {item.cap_rate ? `${item.cap_rate}%` : ListingEnum.NA}
                    </Box>
                  ) : null}

                  {item.comp_type === 'land_only' ? (
                    <Box className="py-2">
                      {ListingEnum.ZONING} :{' '}
                      {item.zoning_type
                        ? `${item.zoning_type}`
                        : ListingEnum.NA}
                    </Box>
                  ) : null}
                </Box>
                <Box className="py-2 px-9 w-full text-[15px]">
                  <Box className="py-2">
                    {checkType === 'leasesCheckbox' &&
                    item &&
                    item.lease_rate !== null
                      ? ListingEnum.LEASE_RATE
                      : ListingEnum.SALES_PRICE}

                    {checkType === 'leasesCheckbox'
                      ? item && item.lease_rate !== null
                        ? '$' +
                          parseFloat(item.lease_rate).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : ''
                      : item && item.sale_price !== null
                        ? parseFloat(item.sale_price).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : ''}
                  </Box>
                  {localStorage.getItem('activeType') ===
                  'building_with_land' ? (
                    <Box className="py-2">
                      {checkType === 'leasesCheckbox' &&
                      item &&
                      item?.price_square_foot !== null
                        ? '$/SF/YR : '
                        : ListingEnum.SF}
                      {item.price_square_foot
                        ? `$${item.price_square_foot.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`
                        : ListingEnum.NA}
                    </Box>
                  ) : (
                    <Box className="py-2">
                      {checkType === 'leasesCheckbox'
                        ? selectedToggleButton === 'SF'
                          ? '$/SF/YR : '
                          : selectedToggleButton === 'AC'
                            ? '$/Acre/YR : '
                            : null
                        : selectedToggleButton === 'SF'
                          ? '$/SF : '
                          : selectedToggleButton === 'AC'
                            ? '$/Acre : '
                            : null}
                      {item?.price_square_foot
                        ? selectedToggleButton === 'AC'
                          ? `$${(item.price_square_foot * 43560).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`
                          : `$${item.price_square_foot.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`
                        : ListingEnum.NA}
                    </Box>
                  )}
                </Box>
                <Box className="w-44 flex flex-col justify-between">
                  <Box className="flex justify-end">
                    <a href={`/comps-view/${item.id}`}>
                      <CommonButton
                        variant="contained"
                        className="text-xs"
                        color="primary"
                        style={{
                          borderRadius: '0 0 0 10px',
                          padding: '7px 30px',
                          textTransform: 'capitalize',
                        }}
                        onClick={(e: any) => {
                          localStorage.setItem('view', 'android');
                          e.preventDefault();
                          viewListingItem(item.id);
                        }}
                      >
                        {ListingEnum.VIEW}
                      </CommonButton>
                    </a>
                  </Box>
                  {item.ai_generated === 1 && (
                    <img
                      src={AiImage}
                      style={{
                        width: '40px',
                        height: '40px',
                        marginLeft: '139px',
                      }}
                    />
                  )}
                  {/* <Box className="flex justify-end">
                    <Icons.DeleteIcon
                      className="text-red-500 cursor-pointer"
                      onClick={() => deleteListingItem(item?.id)}
                    />
                  </Box> */}
                </Box>
              </Box>
            );
          })
        )}
      </Box>

      <Stack direction="row" justifyContent="center" mt={2} mb={1}>
        <button
          className={`bg-inherit text-customDeeperSkyBlue cursor-pointer border-none py-1 px-3 ${page === 1 ? 'text-gray-400 cursor-not-allowed' : ''}`}
          onClick={handlePreviousPage}
          disabled={data?.length === 0 || page === 1}
        >
          {PaginationEnum.PREVIOUS}
        </button>
        <Pagination
          count={data?.length === 0 ? 0 : Math.ceil(rowsPerPage / 10)}
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
          className={`bg-inherit text-customDeeperSkyBlue cursor-pointer border-none py-1 px-3 ${page >= Math.ceil(rowsPerPage / 10) ? 'text-gray-400 cursor-not-allowed' : ''}`}
          disabled={page >= Math.ceil(rowsPerPage / 10)}
          onClick={handleNextPage}
        >
          {PaginationEnum.NEXT}
        </button>
      </Stack>
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
  );
};
export default EvaluationLeaseFilteredCompsList;
