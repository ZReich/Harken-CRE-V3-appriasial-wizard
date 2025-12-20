import { ResponseType } from '@/components/interface/response-type';
import { RequestType } from '@/hook';
import { useGet } from '@/hook/useGet';
import { useMutate } from '@/hook/useMutate';
import { usa_state } from '@/pages/comps/comp-form/fakeJson';
import { formatDate, formatDateFormat } from '@/utils/date-format';
import { List, ListItem } from '@mui/material';
import { styled } from '@mui/system';
import { Form, Formik, FormikProps, useFormikContext } from 'formik';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { EvaluationAmenities } from './evaluation-amenities';
import { EvaluationAnalysis } from './evaluation-analysis';
import { EvaluationMapBoundaries } from './evaluation-map-boundaries';
import { EvaluationPropertyDetails } from './evaluation-property-details';
import { EvlaluationSpecification } from './evaluation-specification';
import { EvaluationTaxAssessment } from './evaluation-tax-assessment';
import { EvaluationZoning } from './evaluation-zoning';
import loadingImage from '../../../images/loading.png';
import {
  AllSubPropertyJson,
  conditionOptions,
  frontageOptions,
  lotshapeOptions,
  topographyOptions,
  utilitiesOptions,
} from '@/pages/comps/create-comp/SelectOption';
import {
  ElectricalOptions,
  HeatingCoolingOptions,
} from '@/pages/residential/create-comp/SelectOption';

import {
  AppraisalADAOptions,
  AppraisalBasementTypeOptions,
  AppraisalConstructionTypeOptions,
  AppraisalExteriorTypeOptions,
  AppraisalFoundationTypeOptions,
  AppraisalMostLikelyOwnerUserOptions,
  AppraisalParkingTypeOptions,
  AppraisalPlumbingTypeOptions,
  AppraisalPropertyClassOptions,
  AppraisalPropertyRightsOption,
  AppraisalRoofTypeOptions,
  AppraisalWindowsTypeOptions,
} from '@/pages/appraisal/overview/SelectOption';

import { AmenitiesEnum } from '@/pages/appraisal/overview/OverviewEnum';
// import {
//   AppraisalOverviewLandOnlySchema,
//   AppraisalOverviewSchema,
// } from '@/utils/appraisalOverviewSchema';
import { landTypeOptions } from '@/pages/comps/create-comp/SelectOption';
import {
  AppraisalOverviewLandOnlySchema,
  AppraisalOverviewSchema,
} from '@/utils/appraisalOverviewSchema';
import { UsaStateCodes } from '@/utils/usaState';
import { useDirty } from './dirty-state-context';
// import useGlobalCodeOptions from '../globalCodes/global-codes-option';
const EvaluationSidebarContainer = styled('div')({ display: 'flex' });

const EvaluationOverviewForm: React.FC<any> = () => {
  // const {
  //   AllSubPropertyJson,

  //   AppraisalPropertyRightsOption,
  //   AppraisalPropertyClassOptions,
  //   AppraisalfoundationTypeOptions,
  //   AppraisalParkingTypeOptions,
  //   AppraisalADAOptions,
  //   AppraisalBasementTypeOptions,
  //   AppraisalConstructionTypeOptions,
  //   AppraisalExteriorTypeOptions,
  //   AppraisalRoofTypeOptions,
  //   AppraisalPlumbingTypeOptions,
  //   AppraisalWindowsTypeOptions,
  //   AppraisalMostLikelyOwnerUserOptions,
  // } = useGlobalCodeOptions();
  // const { AllSubPropertyJson } = useGlobalCodeOptions();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showIncludedUtilities, setShowIncludedUtilities] = useState(false);
  const [hasMultiFamilyApproach, setHasMultiFamilyApproach] = useState<
    number | null
  >(null);

  // Set hasMultiFamilyApproach when data changes

  const [validationSchema, setValidationSchema] = useState(false);
  const [loading, setLoading] = useState(false);
  const FormObserver = () => {
    const { dirty } = useFormikContext(); // get formik values
    const { setIsDirty } = useDirty(); // get your context function

    useEffect(() => {
      setIsDirty(dirty);
    }, [dirty, setIsDirty]);

    return null; // No UI
  };
  const formikRef = useRef<FormikProps<any>>(null);
  console.log(showConfirmModal);
  useEffect(() => {
    const handleClick = () => {
      const routeType = localStorage.getItem('routeType');
      if (routeType === 'comps' && formikRef.current) {
        formikRef.current.submitForm(); // safely submit Formik form
      }
    };

    // Add listener to your clickable sections container
    const listContainer = document.querySelector(
      '.your-sections-wrapper-class'
    );

    if (listContainer) {
      listContainer.addEventListener('click', handleClick);
    }

    return () => {
      if (listContainer) {
        listContainer.removeEventListener('click', handleClick);
      }
    };
  }, []);
  useEffect(() => {
    const routeType = localStorage.getItem('routeType');
    if (routeType === 'comps') {
      setShowConfirmModal(true); // Automatically trigger modal
    }
  }, []); // Runs once on mount

  // const handleCancel = () => {
  //   setShowConfirmModal(false);
  //   // Optional: perform other cleanup or navigation
  // };
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [, setCompType] = useState('');

  // const sections = [
  //   'PROPERTY DETAILS',
  //   'SPECIFICATIONS',
  //   'ANALYSIS',
  //   'AMENITIES',
  //   'ZONING',
  //   'TAX ASSESSMENT',
  //   'MAP BOUNDARIES',
  // ];

  const getCompType = (event: string) => {
    setCompType(event);
  };
  const { mutate } = useMutate<ResponseType, any>({
    queryKey: 'evaluations/update-overview',
    endPoint: `evaluations/update-overview/${id}`,
    requestType: RequestType.PATCH,
  });

  const [activeItem, setActiveItem] = useState<number | null>(null);

  const [passRequired] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section');
      const scrollPosition = window.scrollY;
      let activeIndex = null;

      sections.forEach((section, index) => {
        const sectionTop = section.offsetTop - 225;
        const sectionBottom = sectionTop + section.clientHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          activeIndex = index;
        }
      });

      setActiveItem(activeIndex);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setActiveItem]);

  const scrollToSection = (index: number) => {
    const section = document.querySelectorAll('section')[index] as HTMLElement;
    if (section) {
      window.scrollTo({
        top: section.offsetTop - 225,
        behavior: 'smooth',
      });
    }
  };

  const {
    data,
    isLoading,
    refetch, // <--- Add this
  } = useGet<any>({
    queryKey: 'evaluations/get',
    endPoint: `evaluations/get/${id}`,
    config: {},
  });
  useEffect(() => {
    if (data?.data?.data?.scenarios) {
      const multiFamilyScenario = data.data.data.scenarios.find(
        (s: any) => s.has_multi_family_approach === 1
      );
      setHasMultiFamilyApproach(multiFamilyScenario ? 1 : null);
    }
  }, [data]);
  useEffect(() => {
    if (data?.data?.data?.scenarios) {
      const shouldShow = data.data.data.scenarios.some(
        (ele: any) => ele.has_multi_family_approach === 1
      );
      setShowIncludedUtilities(shouldShow);
    }
  }, [data?.data?.data?.scenarios]);
  const { mutateAsync } = useMutate<ResponseType, any>({
    queryKey: 'evaluations/update-position',
    endPoint: `evaluations/update-position/${id}`,
    requestType: RequestType.PATCH,
  });

  useEffect(() => {
    const updatePositionWithCurrentUrl = async () => {
      const ApiUrl = window.location.href.replace(window.location.origin, '');
      await mutateAsync({
        position: ApiUrl,
      });
    };
    updatePositionWithCurrentUrl();
  }, [id, mutateAsync]);

  const updateData = data?.data?.data;

  // const mapData = data?.data?.data?.evaluation_approaches;

  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(updateData?.land_size);

  // mapData &&
  //   mapData.map((item: any) => {
  //     console.log(item.evaluation_income_approach, 'total square ft');
  //   });

  const TypeMyOwnSubZone = (value: any) => {
    const foundOption = AllSubPropertyJson.find(
      (option) => option.value === value
    );
    return foundOption ? foundOption.value : 'Type My Own';
  };

  const zoningsUpdate = updateData?.zonings?.map((ele: any) => {
    return {
      id: ele?.id || null,
      zone: ele.zone,
      sub_zone: TypeMyOwnSubZone(ele.sub_zone),
      sq_ft: ele.sq_ft.toLocaleString(),
      unit: ele.unit === 0 || ele.unit == null ? '' : ele.unit.toLocaleString(),
      bed: ele.bed === 0 || ele.bed == null ? '' : ele.bed.toLocaleString(),
      weight_sf: ele.weight_sf,
      sub_zone_custom:
        TypeMyOwnSubZone(ele.sub_zone) === 'Type My Own' ? ele.sub_zone : '',
    };
  });

  const getValueOrTypeMyOwnInitial = (value: any) => {
    if (value === null || value === undefined) {
      return 'fee_simple';
    }
    const foundOption = AppraisalPropertyRightsOption.find(
      (option) => option.value === value
    );
    return foundOption ? foundOption.value : AmenitiesEnum.TYPE_MY_OWN;
  };

  const getValueOrTypeMyOwn = (options: { value: any }[]) => (value: any) => {
    if (value === null || value == '') {
      return '';
    }
    const foundOption = options.find((option) => option.value === value);
    return foundOption ? foundOption.value : AmenitiesEnum.TYPE_MY_OWN;
  };
  const getValueOrTypeMyOwnLikelyUser = getValueOrTypeMyOwn(
    AppraisalMostLikelyOwnerUserOptions
  );
  const TypeMyOwnTopography = getValueOrTypeMyOwn(topographyOptions);
  const getValueOrTypeMyOwnLotShape = getValueOrTypeMyOwn(lotshapeOptions);
  const TypeMyOwnFrontage = getValueOrTypeMyOwn(frontageOptions);
  const TypeMyOwnUtility = getValueOrTypeMyOwn(utilitiesOptions);
  const TypeMyOwnCondition = getValueOrTypeMyOwn(conditionOptions);
  const TypeMyOwnProperty = getValueOrTypeMyOwn(AppraisalPropertyClassOptions);
  const TypeMyOwnFoundation = getValueOrTypeMyOwn(
    AppraisalFoundationTypeOptions
  );

  const TypeMyOwnCompliance = getValueOrTypeMyOwn(AppraisalADAOptions);
  const TypeMyOwnStructure = getValueOrTypeMyOwn(
    AppraisalConstructionTypeOptions
  );
  const TypeMyOwnExterior = getValueOrTypeMyOwn(AppraisalExteriorTypeOptions);
  const TypeMyOwnRoof = getValueOrTypeMyOwn(AppraisalRoofTypeOptions);
  const TypeMyOwnElectrical = getValueOrTypeMyOwn(ElectricalOptions);
  const TypeMyOwnPlumbing = getValueOrTypeMyOwn(AppraisalPlumbingTypeOptions);
  const TypeMyOwnHeating = getValueOrTypeMyOwn(HeatingCoolingOptions);
  const TypeMyOwnWindows = getValueOrTypeMyOwn(AppraisalWindowsTypeOptions);
  const TypeMyOwnBasement = getValueOrTypeMyOwn(AppraisalBasementTypeOptions);
  const TypeMyOwnParking = getValueOrTypeMyOwn(AppraisalParkingTypeOptions);
  const TypeMyOwnLand = getValueOrTypeMyOwn(landTypeOptions);
  const active_comp_type = localStorage.getItem('activeType');
  const [zoomLevel, setZoomLevel] = useState<number>(
    Number(localStorage.getItem('mapZoom')) || 10
  );

  console.log(setZoomLevel);
  useEffect(() => {
    if (
      data?.data?.data?.building_size !== undefined &&
      data?.data?.data?.building_size !== null
    ) {
      localStorage.setItem('buildingSize', data.data.data.building_size);
    }
  }, [data]);

  const handleSubmit = (values: any) => {
    localStorage.setItem('comparison_basis', values.comparison_basis);
    setLoading(true);
    console.log('Submitted values:', values);

    const stateCode = Object.keys(UsaStateCodes).find(
      (key) => UsaStateCodes[key] === values.state
    );
    console.log('State Code:', stateCode);

    const sqFtArray =
      values.zonings &&
      values.zonings.map((item: any) =>
        item.sq_ft === 0 ? 0 : parseInt(item.sq_ft.replace(/,/g, ''), 10)
      );
    console.log('Parsed sqFtArray:', sqFtArray);

    const filteredSqFtArray = sqFtArray.filter((sqFt: number) => !isNaN(sqFt));
    console.log('Filtered sqFtArray:', filteredSqFtArray);

    const calculateBuildingSize = filteredSqFtArray.reduce(
      (total: number, current: number) => total + current,
      0
    );
    console.log('Calculated Building Size:', calculateBuildingSize);

    const closeDate = formatDateFormat(values.close_date);
    const dateOfAnalysis = formatDateFormat(values.date_of_analysis);
    const effectiveDate = formatDateFormat(values.effective_date);
    const reportDate = formatDateFormat(values.report_date);
    const lastTransferDate = formatDateFormat(values.last_transferred_date);

    console.log('Formatted Dates:', {
      closeDate,
      dateOfAnalysis,
      effectiveDate,
      reportDate,
      lastTransferDate,
    });

    let priceSquareFoot;
    const landAssesment = parseFloat(values.land_assessment?.replace('$', ''));
    console.log('Land Assessment:', landAssesment);

    if (values.comp_type === 'land_only') {
      const landSize: any = values.land_size
        ? parseFloat(values.land_size.replace(/,/g, ''))
        : '';
      priceSquareFoot = landAssesment / landSize || null;
      console.log('Land Only Price per SqFt:', priceSquareFoot);
    } else {
      priceSquareFoot = landAssesment / calculateBuildingSize;
      console.log('Building Price per SqFt:', priceSquareFoot);
    }

    const zonings = values.zonings?.map((ele: any) => {
      return {
        id: ele.id || null,
        zone: ele.zone,
        sub_zone: ele.sub_zone,
        sq_ft: ele.sq_ft === 0 ? 0 : parseFloat(ele.sq_ft.replace(/,/g, '')),
        unit: ele.unit === 0 ? 0 : parseFloat(ele.unit.replace(/,/g, '')),
        bed: ele.bed === 0 ? 0 : parseFloat(ele.bed.replace(/,/g, '')),
        sub_zone_custom: ele.sub_zone_custom ? ele.sub_zone_custom : '',
        weight_sf: ele.weight_sf,
      };
    });
    console.log('Formatted Zonings:', zonings);

    mutate(
      {
        // 📝 Input payload
        business_name: values.business_name,
        last_transfer_date_known: values.last_transfer_date_known,
        property_rights: values.property_rights,
        street_address: values.street_address,
        street_suite: values.street_suite,
        city: values.city,
        county: values.county,
        zipcode: values.zipcode.toString(),
        state: stateCode ? stateCode.toLocaleLowerCase() : '',
        type: values.type,
        condition: values.condition,
        property_class: values.property_class,
        year_built: values.year_built,
        year_remodeled: values.year_remodeled,
        // price_square_foot: priceSquareFoot ? priceSquareFoot : 0,
        price_square_foot:
          parseFloat(values.price_square_foot.replace(/,/g, '')) || 0,
        building_size:
          values?.comp_type === 'building_with_land'
            ? calculateBuildingSize
            : null,
        land_size:
          values.land_size === null
            ? null
            : parseFloat(values.land_size.replace(/,/g, '')),
        land_dimension: values.land_dimension,
        summary: values.summary,
        parcel_id_apn: values.parcel_id_apn,
        frontage: values.frontage,
        utilities_select: values.utilities_select,
        zoning_type: values.zoning_type,
        map_pin_lat: values.geometry.lat.toString(),
        map_pin_lng: values.geometry.lng.toString(),
        map_pin_zoom: zoomLevel,
        latitude: values.geometry.lat.toString(),
        longitude: values.geometry.lng.toString(),
        comp_type: active_comp_type,
        land_type: values.land_type,
        topography: values.topography,
        lot_shape: values.lot_shape,
        comparison_basis: values.comparison_basis,
        no_stories: values.no_stories,
        parking: values.parking,
        exterior: values.exterior,
        roof: values.roof,
        electrical: values.electrical,
        plumbing: values.plumbing,
        heating_cooling: values.heating_cooling,
        windows: values.windows,
        zoning_description: values.zoning_description,
        basement: values.basement,
        most_likely_owner_user: values.most_likely_owner_user,
        front_feet: parseFloat(
          (values.front_feet as string)?.replace(/,/g, '')
        ),
        lot_depth: parseFloat((values.lot_depth as string)?.replace(/,/g, '')),
        height: parseFloat((values.height as string)?.replace(/,/g, '')),
        foundation: values.foundation,
        ada_compliance: values.ada_compliance,
        main_structure_base: values.main_structure_base,
        high_and_best_user: values.high_and_best_user,
        under_contract_price:
          values.type === 'sale'
            ? parseFloat(
                (values.under_contract_price as string)?.replace(/[$,]/g, '')
              )
            : null,
        ...(values.type === 'sale'
          ? {
              close_date:
                !values.close_date || values.close_date === 'NaN/NaN/NaN'
                  ? null
                  : closeDate || localStorage.getItem('close_date') || null,
            }
          : {
              close_date: null,
            }),
        last_transferred_date:
          !values.last_transferred_date ||
          values.last_transferred_date === 'NaN/NaN/NaN'
            ? null
            : lastTransferDate ||
              localStorage.getItem('last_transferred_date') ||
              null,
        owner_of_record: values.owner_of_record,
        property_geocode: values.property_geocode,
        property_legal: values.property_legal,
        file_number: values.file_number ? values.file_number.toString() : null,
        intended_use: values.intended_use,
        intended_user: values.intended_user,
        date_of_analysis:
          values.date_of_analysis === '' || values.date_of_analysis === null
            ? formatDate(new Date())
            : dateOfAnalysis === 'NaN/NaN/NaN'
              ? null
              : dateOfAnalysis,
        effective_date:
          values.effective_date === '' || values.effective_date === null
            ? formatDate(new Date())
            : effectiveDate === 'NaN/NaN/NaN'
              ? null
              : effectiveDate,
        inspector_name: values.inspector_name,
        report_date:
          values.report_date === '' || values.report_date === null
            ? formatDate(new Date())
            : reportDate === 'NaN/NaN/NaN'
              ? null
              : reportDate,
        conforming_use_determination: values.conforming_use_determination,
        land_assessment: parseFloat(
          (values.land_assessment as string)?.replace(/[$,]/g, '')
        ),
        structure_assessment: parseFloat(
          (values.structure_assessment as string)?.replace(/[$,]/g, '')
        ),
        total_land_improvement: values?.total_land_improvement
          ? parseFloat(values?.total_land_improvement?.replace(/,/g, ''))
          : null,
        sids: values.sids,
        tax_liability: parseFloat(
          (values.tax_liability as string)?.replace(/[$,]/g, '')
        ),
        taxes_in_arrears: parseFloat(
          (values.taxes_in_arrears as string)?.replace(/[$,]/g, '')
        ),
        assessed_market_year: values.assessed_market_year.toString(),
        tax_liability_year: values.tax_liability_year.toString(),
        property_rights_custom: values.property_rights_custom
          ? values.property_rights_custom
          : null,
        most_likely_owner_user_custom: values.most_likely_owner_user_custom,
        topography_custom: values.topography_custom,
        lot_shape_custom: values.lot_shape_custom,
        frontage_custom: values.frontage_custom,
        utilities_select_custom: values.utilities_select_custom,
        condition_custom: values.condition_custom,
        basement_custom: values.basement_custom,
        property_class_custom: values.property_class_custom,
        foundation_custom: values.foundation_custom,
        parking_custom: values.parking_custom,
        ada_compliance_custom: values.ada_compliance_custom,
        main_structure_base_custom: values.main_structure_base_custom,
        exterior_custom: values.exterior_custom,
        roof_custom: values.roof_custom,
        electrical_custom: values.electrical_custom,
        plumbing_custom: values.plumbing_custom,
        land_type_custom: values.land_type_custom,
        heating_cooling_custom: values.heating_cooling_custom,
        windows_custom: values.windows_custom,
        traffic_street_address: values.traffic_street_address,
        traffic_count: values.traffic_count,
        traffic_input:
          values.traffic_count === 'inputvalue'
            ? values.traffic_input.replace(/,/g, '')
            : null,
        analysis_type: active_comp_type ? values?.analysis_type : null,
        price:
          values.type === 'non_sale'
            ? parseFloat((values.price as string)?.replace(/[$,]/g, ''))
            : null, // price,
        other_include_utilities: values.other_include_utilities,
        evaluation_included_utilities:
          values.evaluation_included_utilities === ''
            ? []
            : values.evaluation_included_utilities,
        zonings:
          values.comp_type === 'land_only'
            ? []
            : zonings[0].zone
              ? zonings
              : [],
      },
      {
        onSuccess: async (res) => {
          console.log('Mutation successful:', res.data);
          localStorage.setItem('neww', 'njii');
          setLoading(false);
          const evaluationBuildingSize = data?.data?.data?.building_size;
          console.log('Initial fetched building size:', evaluationBuildingSize);

          toast(res.data.message);

          try {
            const refreshed = await refetch();
            console.log('Refetched data:', refreshed?.data?.data?.data);

            const refreshedBuildingSize =
              refreshed?.data?.data?.data?.building_size;

            if (refreshedBuildingSize !== undefined) {
              localStorage.setItem('buildingSize', refreshedBuildingSize);
            } else {
              console.warn('Building size not available in refetched data');
            }

            navigate(`/evaluation/images?id=${id}`);
          } catch (error) {
            console.error(
              'Error during refetch or setting building size:',
              error
            );
          }
        },
      }
    );
  };
  // const handleConfirm = () => {
  //   setShowConfirmModal(false);
  //   handleSubmit(); // Trigger submit
  // };
  if (isLoading) {
    return <>Loading </>;
  }

  let stateName;
  const abbreviation = updateData?.state?.toLowerCase(); // Ensure it's lowercase
  const stateCode = usa_state.find((state) => state[abbreviation]);
  if (stateCode) {
    stateName = stateCode[abbreviation];
  } else {
    stateName = '--Select State--';
  }

  const initialValues = {
    position: updateData?.position || 'overview',
    business_name: updateData?.business_name,
    last_transfer_date_known: updateData?.last_transfer_date_known,
    property_rights: getValueOrTypeMyOwnInitial(updateData?.property_rights),
    street_address: updateData?.street_address,
    street_suite: updateData?.street_suite,
    city: updateData?.city,
    county: updateData?.county || '',
    state: stateName || updateData?.state,
    zipcode: updateData?.zipcode,
    type: updateData && updateData?.type === null ? 'sale' : updateData?.type,
    condition: TypeMyOwnCondition(updateData?.condition),
    property_class: TypeMyOwnProperty(updateData?.property_class),
    year_built: updateData?.year_built,
    year_remodeled: updateData?.year_remodeled,
    price_square_foot: updateData?.price_square_foot || 0,
    building_size: updateData?.building_size,
    // land_size: updateData?.land_size?.toLocaleString() || null,
    land_size:
      updateData?.land_size && updateData?.land_dimension === 'ACRE'
        ? formatted
        : updateData?.land_dimension === 'SF' && updateData?.land_size
          ? updateData?.land_size?.toLocaleString()
          : null,
    land_dimension:
      updateData && updateData?.land_dimension === null
        ? 'SF'
        : updateData?.land_dimension,
    summary: updateData?.summary || '',
    parcel_id_apn: updateData?.parcel_id_apn || null,
    frontage: TypeMyOwnFrontage(updateData?.frontage),
    utilities_select: TypeMyOwnUtility(updateData?.utilities_select),
    zoning_type: updateData?.zoning_type,
    price: updateData?.price
      ? '$' +
        parseFloat(updateData.price).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : '',
    last_transferred_date: updateData?.last_transferred_date || null,
    map_pin_lat: updateData?.map_pin_lat,
    map_pin_lng: updateData?.map_pin_lng,
    map_pin_zoom: updateData?.map_pin_zoom,
    latitude: updateData?.latitude,
    longitude: updateData?.longitude,
    comp_type: updateData?.comp_type ? updateData?.comp_type : active_comp_type,
    land_type: TypeMyOwnLand(updateData?.land_type),

    topography: TypeMyOwnTopography(updateData?.topography),
    topography_custom: topographyOptions.some(
      (option) => option.value === updateData?.topography
    )
      ? null
      : updateData?.topography || null,

    lot_shape: getValueOrTypeMyOwnLotShape(updateData?.lot_shape),
    comparison_basis: updateData?.comparison_basis,
    no_stories: updateData?.no_stories,
    other_include_utilities: updateData?.other_include_utilities,
    parking: TypeMyOwnParking(updateData?.parking),
    evaluation_included_utilities:
      updateData?.evaluation_included_utilities || [],
    exterior: TypeMyOwnExterior(updateData?.exterior),
    roof: TypeMyOwnRoof(updateData?.roof),
    electrical: TypeMyOwnElectrical(updateData?.electrical),
    plumbing: TypeMyOwnPlumbing(updateData?.plumbing),
    heating_cooling: TypeMyOwnHeating(updateData?.heating_cooling),
    windows: TypeMyOwnWindows(updateData?.windows),
    zoning_description: updateData?.zoning_description || null,
    basement: TypeMyOwnBasement(updateData?.basement),
    most_likely_owner_user: updateData?.most_likely_owner_user
      ? getValueOrTypeMyOwnLikelyUser(updateData?.most_likely_owner_user)
      : null,
    front_feet: updateData?.front_feet
      ? updateData?.front_feet?.toLocaleString()
      : null,
    lot_depth: updateData?.lot_depth
      ? updateData?.lot_depth?.toLocaleString()
      : null,
    height: updateData?.height
      ? parseFloat(updateData.height).toLocaleString()
      : null,
    foundation: updateData?.foundation
      ? TypeMyOwnFoundation(updateData?.foundation)
      : null,
    ada_compliance: updateData?.ada_compliance
      ? TypeMyOwnCompliance(updateData?.ada_compliance)
      : null,
    main_structure_base: updateData?.main_structure_base
      ? TypeMyOwnStructure(updateData?.main_structure_base)
      : null,
    high_and_best_user: updateData?.high_and_best_user || null,

    under_contract_price: updateData?.under_contract_price
      ? '$' +
        parseFloat(updateData.under_contract_price).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : '',

    close_date: updateData?.close_date || null,
    owner_of_record: updateData?.owner_of_record || null,
    property_geocode: updateData?.property_geocode || null,
    property_legal: updateData?.property_legal || null,
    file_number: updateData?.file_number || null,
    intended_use: updateData?.intended_use || null,
    intended_user: updateData?.intended_user || null,
    date_of_analysis: updateData?.date_of_analysis || null,
    effective_date: updateData?.effective_date || null,
    inspector_name: updateData?.inspector_name || null,
    report_date: updateData?.report_date || null,
    // conforming_use_determination: 'Appears to be conforming',
    conforming_use_determination:
      updateData?.conforming_use_determination || 'Appears to be conforming',
    land_assessment: updateData?.land_assessment
      ? '$' +
        parseFloat(updateData.land_assessment).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : '$0.00',
    structure_assessment: updateData?.structure_assessment
      ? '$' +
        parseFloat(updateData.structure_assessment).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : '$0.00',
    total_land_improvement: updateData?.total_land_improvement || null,
    sids: updateData?.sids ? updateData?.sids : null,
    taxes_in_arrears: updateData?.taxes_in_arrears
      ? '$' +
        parseFloat(updateData.taxes_in_arrears).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : '$0.00',
    tax_liability: updateData?.tax_liability
      ? '$' +
        parseFloat(updateData.tax_liability).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : '$0.00',
    assessed_market_year:
      updateData?.assessed_market_year || new Date().getFullYear().toString(),
    tax_liability_year:
      updateData?.tax_liability_year || new Date().getFullYear(),
    property_rights_custom: AppraisalPropertyRightsOption.some(
      (option) => option.value === updateData?.property_rights
    )
      ? ''
      : updateData?.property_rights || '',
    most_likely_owner_user_custom: AppraisalMostLikelyOwnerUserOptions.some(
      (option) => option.value === updateData?.most_likely_owner_user
    )
      ? null
      : updateData?.most_likely_owner_user || null,
    lot_shape_custom: lotshapeOptions.some(
      (option) => option.value === updateData?.lot_shape
    )
      ? null
      : updateData?.lot_shape || null,
    frontage_custom: frontageOptions.some(
      (option) => option.value === updateData?.frontage
    )
      ? null
      : updateData?.frontage || null,
    utilities_select_custom: utilitiesOptions.some(
      (option) => option.value === updateData?.utilities_select
    )
      ? null
      : updateData?.utilities_select || null,
    condition_custom: conditionOptions.some(
      (option) => option.value === updateData?.condition
    )
      ? null
      : updateData?.condition || null,
    property_class_custom: AppraisalPropertyClassOptions.some(
      (option) => option.value === updateData?.property_class
    )
      ? null
      : updateData?.property_class || null,
    foundation_custom: AppraisalFoundationTypeOptions.some(
      (option) => option.value === updateData?.foundation
    )
      ? ''
      : updateData?.foundation || '',
    parking_custom: AppraisalParkingTypeOptions.some(
      (option) => option.value === updateData?.parking
    )
      ? null
      : updateData?.parking || null,
    basement_custom: AppraisalBasementTypeOptions.some(
      (option) => option.value === updateData?.basement
    )
      ? null
      : updateData?.basement || null,
    ada_compliance_custom: AppraisalADAOptions.some(
      (option) => option.value === updateData?.ada_compliance
    )
      ? null
      : updateData?.ada_compliance || null,
    main_structure_base_custom: AppraisalConstructionTypeOptions.some(
      (option) => option.value === updateData?.main_structure_base
    )
      ? null
      : updateData?.main_structure_base || null,
    exterior_custom: AppraisalExteriorTypeOptions.some(
      (option) => option.value === updateData?.exterior
    )
      ? null
      : updateData?.exterior || null,
    roof_custom: AppraisalRoofTypeOptions.some(
      (option) => option.value === updateData?.roof
    )
      ? null
      : updateData?.roof || null,
    electrical_custom: ElectricalOptions.some(
      (option) => option.value === updateData?.electrical
    )
      ? null
      : updateData?.electrical || null,
    plumbing_custom: AppraisalPlumbingTypeOptions.some(
      (option) => option.value === updateData?.plumbing
    )
      ? null
      : updateData?.plumbing || null,
    land_type_custom: landTypeOptions.some(
      (option: { value: any }) => option.value === updateData?.land_type
    )
      ? null
      : updateData?.land_type || null,
    heating_cooling_custom: HeatingCoolingOptions.some(
      (option) => option.value === updateData?.heating_cooling
    )
      ? null
      : updateData?.heating_cooling || null,
    windows_custom: AppraisalWindowsTypeOptions.some(
      (option) => option.value === updateData?.windows
    )
      ? null
      : updateData?.windows || null,
    traffic_street_address: updateData?.traffic_street_address || null,
    traffic_count: updateData?.traffic_count || '',
    traffic_input: updateData?.traffic_input
      ? updateData?.traffic_input?.toLocaleString()
      : null,
    geometry: {
      lat: updateData?.latitude ? parseFloat(updateData?.latitude) : '',
      lng: updateData?.longitude ? parseFloat(updateData?.longitude) : '',
    },

    zonings:
      updateData?.zonings && updateData.zonings.length > 0
        ? zoningsUpdate
        : [
            {
              id: '',
              zone: '',
              sub_zone: '',
              sq_ft: '',
              unit: '',
              bed: '',
              sub_zone_custom: '',
              weight_sf: '100',
            },
          ],
    analysis_type:
      updateData?.analysis_type !== null ? updateData?.analysis_type : '$/SF',
  };
  const allSections = [
    { name: 'PROPERTY DETAILS', component: <EvaluationPropertyDetails /> },
    {
      name: 'SPECIFICATIONS',
      component: (
        <EvlaluationSpecification
          passRequired={passRequired}
          getCompType={getCompType}
          updateData={updateData}
          hasMultiFamilyApproach={hasMultiFamilyApproach}
        />
      ),
    },
    { name: 'ANALYSIS', component: <EvaluationAnalysis /> },
    { name: 'AMENITIES', component: <EvaluationAmenities /> },
    {
      name: 'ZONING',
      component: <EvaluationZoning passRequired={passRequired} />,
    },
    { name: 'TAX ASSESSMENT', component: <EvaluationTaxAssessment /> },
    { name: 'MAP BOUNDARIES', component: <EvaluationMapBoundaries /> },
  ];

  const filteredSections = allSections.filter(
    (s) =>
      localStorage.getItem('activeType') === 'building_with_land' ||
      s.name !== 'AMENITIES'
  );
  if (loading) {
    return (
      <>
        <div className="img-update-loader">
          <img src={loadingImage} />
        </div>
      </>
    );
  }
  return (
    <EvaluationSidebarContainer>
      <Formik
        initialValues={initialValues}
        validationSchema={
          localStorage.getItem('activeType') === 'building_with_land'
            ? AppraisalOverviewSchema
            : AppraisalOverviewLandOnlySchema
        }
        onSubmit={handleSubmit}
      >
        {/* 👇 Notice we directly return Formik children */}
        <>
          <FormObserver /> {/* Track dirty state */}
          <div className="fixed lg:w-[242px] w-[180px] z-10 h-full overflow-auto lg:p-[20px] p-[8px] border-t-0 border-r border-[#eee] border-solid">
            <List>
              {filteredSections.map((item, index) => (
                <ListItem
                  key={index + 1}
                  sx={{
                    pl: { xs: '8px', xl: '20px' },
                    position: 'relative',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#2e2e2e9c',
                  }}
                  onClick={() => {
                    console.log(`Rendering component: ${item.name}`);
                    scrollToSection(index + 1);
                  }}
                >
                  {activeItem === index + 1 && (
                    <div className="h-[1px] right-2 bg-[#3391C7] absolute top-[46px] left-[12px]" />
                  )}
                  <div
                    className={`lg:py-2 lg:px-4 p-1 cursor-pointer ${
                      activeItem === index + 1 ? 'font-bold text-[#000000]' : ''
                    }`}
                    style={{ fontFamily: 'montserrat-normal' }}
                  >
                    {item.name}
                  </div>
                </ListItem>
              ))}
            </List>
          </div>
          {/* {showConfirmModal && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
              }}
            >
              <div
                style={{
                  backgroundColor: '#fff',
                  padding: '2rem',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  textAlign: 'center',
                }}
              >
                <p>Do you want to save your changes?</p>
                <div style={{ marginTop: '1rem' }}>
                  <button
                    // onClick={handleConfirm}
                    style={{ marginRight: '1rem' }}
                  >
                    Yes
                  </button>
                  <button onClick={handleCancel}>No</button>
                </div>
              </div>
            </div>
          )} */}
          <Form className="w-full lg:pl-[230px] pl-[180px]">
            {[
              <EvaluationPropertyDetails
                key="property-details"
                validationSchema={validationSchema}
              />,
              <EvlaluationSpecification
                showIncludedUtilities={showIncludedUtilities}
                key="specification"
                passRequired={passRequired}
                getCompType={getCompType}
                updateData={updateData}
                hasMultiFamilyApproach={hasMultiFamilyApproach}
              />,
              <EvaluationAnalysis key="analysis" />,
              localStorage.getItem('activeType') === 'building_with_land' ? (
                <EvaluationAmenities key="amenities" />
              ) : null,
              <EvaluationZoning passRequired={passRequired} key="zoning" />,
              <EvaluationTaxAssessment key="tax-assessment" />,
              <EvaluationMapBoundaries
                key="map-boundaries"
                setValidationSchema={setValidationSchema}
              />,
            ].map((item, i) => {
              return item ? (
                <section className="lg:pl-12 lg:pr-20 px-4" key={i}>
                  {item}
                </section>
              ) : null;
            })}
          </Form>
        </>
      </Formik>
    </EvaluationSidebarContainer>
  );
};

export default EvaluationOverviewForm;
