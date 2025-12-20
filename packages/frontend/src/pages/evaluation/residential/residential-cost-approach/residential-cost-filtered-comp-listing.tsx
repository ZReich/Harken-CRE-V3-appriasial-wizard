import { useEffect, useState } from 'react';
import CommonButton from '@/components/elements/button/Button';
import { Box, ButtonBase, Stack } from '@mui/material';
import Pagination from '@mui/material/Pagination';
import { useMutate, RequestType } from '@/hook/useMutate';
import { FilterComp } from '@/components/interface/header-filter';
import DeleteConfirmationModal from '@/pages/comps/Listing/delete-confirmation';
import CompDeleteModal from '@/components/modal/Comp-delete-modal';
import { ClearIcon } from '@mui/x-date-pickers';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { formatDate } from '@/utils/date-format';

import loadingImage from '../../../../images/loading.png';
import AiImage from '../../../../images/AI SVG.svg';
import { ListingEnum, PaginationEnum } from '@/pages/comps/enum/CompsEnum';
import NoImageUpload from '../../../../images/list.jpg';
import { useFormikContext } from 'formik';
import { toast } from 'react-toastify';
import axios from 'axios';
import { options } from '@/pages/comps/comp-form/fakeJson';

interface CompsListingMapProps {
  typeFilter?: string;
  typeProperty?: any;
  searchValuesByfilter?: string;
  sidebarFilters?: FilterComp | null;
  getType?: any;
  isOpen?: any;
  passDataCheckType?: any;
  passSetCheckType?: any;
  sortingSettings?: any;
  checkType?: any;
  setCheckType?: any;
  setLoading?: any;
  loading?: any;
  selectedToggleButton?: any;
  page?: any;
  setPage?: any;
  tableData?: any;
  dataHandle?: any;
}

let rowsPerPage: number = 4;
type SubOption = {
  code: string;
  name: string;
};
const ResidentialCostFilteredCompsList: React.FC<CompsListingMapProps> = ({
  typeFilter,
  searchValuesByfilter,
  sidebarFilters,
  typeProperty,
  getType,
  sortingSettings,
  checkType,
  loading,
  selectedToggleButton,
  page,
  setPage,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const compsLength = location.state?.compsLength;
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number>();
  const [deleteBoolean, setDeleteBoolean] = useState('');
  const [selectedIds, setSelectedIds] = useState<any[]>([]);
  const [landDimensions] = useState<any>(null);
  // const [setAppraisalId] = useState('');
  const [qualitativeApproachItems] = useState<SubOption[]>([]);
  const { values, setValues } = useFormikContext();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const salesId = searchParams.get('approachId');

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
  //   const { values } = useFormikContext();

  const parameterType =
    checkType === 'salesCheckbox' ? ListingEnum.SALE : ListingEnum.LEASE;
  const mutation = useMutate<any, any>({
    queryKey: `list/${parameterType}`,
    endPoint: 'resComps/list',
    requestType: RequestType.POST,
  });
  const selectedCompsMutation = useMutate<any, any>({
    queryKey: 'selected-comps',
    endPoint: '/res-evaluations/get-selected-comps/',
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
        `res-evaluations/get-sales-approach?evaluationId=${id}&evaluationScenarioId=${salesId}`,
        {}
      );

      const compsArr = response?.data?.data?.data?.comps;
      localStorage.setItem('compsLenghtResidential', compsArr.length);

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

        console.log('compsarr', compsArr.length);
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

        // Step 3: Sort Closed items after Pending
        if (a.sale_status === 'Closed' && b.sale_status !== 'Closed') {
          return -1;
        }
        if (a.sale_status !== 'Closed' && b.sale_status === 'Closed') {
          return 1;
        }

        // Step 4: Within Closed, sort alphabetically by business_name
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
  console.log('adas', values);
  useEffect(() => {
    fetchComposData(values, setValues);
  }, [salesId]);
  const handleSubmit = async () => {
    if (selectedIds.length === 0) {
      toast('Please select comps.');
      return;
    }

    try {
      // First, fetch the evaluation data to get subject property amenities
      const evaluationResponse = await axios.get(`res-evaluations/get/${id}`);
      const subjectPropertyAmenities =
        evaluationResponse?.data?.data?.res_evaluation_amenities || [];

      const params = { compIds: selectedIds };
      const response = await selectedCompsMutation.mutateAsync(params);

      if (response?.data) {
        const comps = response?.data?.data || [];

        // Define all amenity options
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

        const updatedComps = comps.map(({ id, ...restComp }: any) => {
          // Create extra_amenities array with all options
          const extraAmenities = amenityOptions.map((option) => {
            // Check if this amenity exists in subject property amenities
            const subjectHasAmenity = subjectPropertyAmenities.some(
              (a: any) => {
                const normalizedOption = option
                  .toLowerCase()
                  .replace(/\s+/g, '');
                const normalizedAmenity = a.additional_amenities
                  .toLowerCase()
                  .replace(/\s+/g, '');
                return normalizedOption === normalizedAmenity;
              }
            );

            // Check if this amenity exists in comp property amenities
            const compHasAmenity = restComp.res_evalution_Amenities?.some(
              (a: any) => {
                const normalizedOption = option
                  .toLowerCase()
                  .replace(/\s+/g, '');
                const normalizedAmenity = a.additional_amenities
                  .toLowerCase()
                  .replace(/\s+/g, '');
                return normalizedOption === normalizedAmenity;
              }
            );

            return {
              adj_key: option,
              adj_value: 0.0,
              subject_property_check: subjectHasAmenity ? 1 : 0,
              comp_property_check: compHasAmenity ? 1 : 0,
              is_extra: 0,
            };
          });

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
            comparativeAdjustmentsList: (
              values as any
            ).appraisalSpecificAdjustment.map((exp: any) => ({
              ...exp,
              comparison_value: 0,
              comparison_basis: 0,
            })),
            adjusted_psf: restComp.price_square_foot,
            // new_Dataaa: 'asdasdsdsad',
            extra_amenities: extraAmenities,
          };
        });

        console.log(updatedComps, 'updatedComps');

        navigate(`/residential/sales-approach?id=${id}&salesId=${salesId}`, {
          state: { updatedComps },
        });
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
  // const compStatus = localStorage.getItem('compStatus') || '';
  // const activeType = localStorage.getItem('activeType');

  useEffect(() => {
    const fetchData = async () => {
      const params: any = {
        limit: 10,
        orderByColumn: sortingSettings.sortingType || ListingEnum.DATE_SOLD,
        page: page,
        propertyType: compsPropertyType1.length ? compsPropertyType1 : null,
        orderBy: sortingSettings.orderSorting || 'DESC',
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

  const updateListingItem = (id: number) => {
    localStorage.setItem('view', 'android');
    setDeleteId(id);
    navigate(`/residential-update-comps/${id}`);
  };

  const viewListingItem = (id: number) => {
    // let check;
    if (checkType === 'salesCheckbox') {
      // check = 'sales';
    } else {
      // check = 'lease';
    }
    navigate(`/res-comps-view/${id}`, {
      state: {
        selectedToggleButton: selectedToggleButton || null, // Optional parameter
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
  const data = mutation.data?.data.data.resComps || [];

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
    navigate(`/residential/evaluation/cost-approach?id=${id}&costId=${salesId}`);
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
          </Box>
        </Box>

        {data.length === 0 ? (
          <div>{ListingEnum.N0_RECORDS_FOUND}</div>
        ) : (
          data.length &&
          data.map((item: any, index: any) => {
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
                    <Box className="py-2">{ListingEnum.TYPE} : </Box>
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

                    <a
                      href={`/update-comps/${item.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        if (e.button === 0) {
                          updateListingItem(item.id);
                        }
                      }}
                    >
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
export default ResidentialCostFilteredCompsList;
