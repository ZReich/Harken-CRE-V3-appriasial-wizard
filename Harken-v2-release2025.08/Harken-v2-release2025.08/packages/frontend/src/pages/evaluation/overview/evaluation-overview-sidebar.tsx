import React, { useState, useEffect } from 'react';
import { List, ListItem } from '@mui/material';
import { styled } from '@mui/system';
import { Formik, Form } from 'formik';
import { EvaluationPropertyDetails } from './evaluation-property-details';
import { EvlaluationSpecification } from './evaluation-specification';
import { EvaluationAnalysis } from './evaluation-analysis';
import { EvaluationAmenities } from './evaluation-amenities';
import { EvaluationZoning } from './evaluation-zoning';
import { EvaluationTaxAssessment } from './evaluation-tax-assessment';
import { EvaluationMapBoundaries } from './evaluation-map-boundaries';
import { useGet } from '@/hook/useGet';
import { RequestType } from '@/hook';
import { useMutate } from '@/hook/useMutate';
import { toast } from 'react-toastify';
import { formatDate } from '@/utils/date-format';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ResponseType } from '@/components/interface/response-type';
import { usa_state } from '@/pages/comps/comp-form/fakeJson';

import {
  ElectricalOptions,
  HeatingCoolingOptions,
} from '@/pages/residential/create-comp/SelectOption';
import { AmenitiesEnum } from '@/pages/appraisal/overview/OverviewEnum';

import { landTypeOptions } from '@/pages/comps/create-comp/SelectOption';
import { UsaStateCodes } from '@/utils/usaState';
import {
  AppraisalPropertyRightsOption,
  AppraisalMostLikelyOwnerUserOptions,
  AppraisalPropertyClassOptions,
  AppraisalFoundationTypeOptions,
  AppraisalParkingTypeOptions,
  AppraisalADAOptions,
  AppraisalBasementTypeOptions,
  AppraisalConstructionTypeOptions,
  AppraisalExteriorTypeOptions,
  AppraisalRoofTypeOptions,
  AppraisalPlumbingTypeOptions,
  AppraisalWindowsTypeOptions,
} from '@/pages/appraisal/overview/SelectOption';
import {
  AllSubPropertyJson,
  conditionOptions,
  frontageOptions,
  lotshapeOptions,
  topographyOptions,
  utilitiesOptions,
} from '@/pages/comps/create-comp/SelectOption';
import {
  AppraisalOverviewLandOnlySchema,
  AppraisalOverviewSchema,
} from '@/utils/appraisalOverviewSchema';
// import useGlobalCodeOptions from '../globalCodes/global-codes-option';
const SidebarContainer = styled('div')({ display: 'flex' });

const OverviewSidebar: React.FC<any> = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [, setCompType] = useState('');

  const sections = [
    'PROPERTY DETAILS',
    'SPECIFICATIONS',
    'ANALYSIS',
    'AMENITIES',
    'ZONING',
    'TAX ASSESSMENT',
    'MAP BOUNDARIES',
  ];

  const getCompType = (event: string) => {
    setCompType(event);
  };
  const { mutate } = useMutate<ResponseType, any>({
    queryKey: 'evaluations/update-overview',
    endPoint: `evaluations/update-overview/${id}`,
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
  }, [id, mutate]);

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
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(updateData?.land_size);

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
  useEffect(() => {
    if (
      data?.data?.data?.building_size !== undefined &&
      data?.data?.data?.building_size !== null
    ) {
      localStorage.setItem('buildingSize', data.data.data.building_size);
    }
  }, [data]);

  const handleSubmit = (values: any) => {
    const stateCode = Object.keys(UsaStateCodes).find(
      (key) => UsaStateCodes[key] === values.state
    );
    const sqFtArray =
      values.zonings &&
      values.zonings.map((item: any) =>
        item.sq_ft === 0 ? 0 : parseInt(item.sq_ft.replace(/,/g, ''), 10)
      );

    const filteredSqFtArray = sqFtArray.filter((sqFt: number) => !isNaN(sqFt));

    const calculateBuildingSize = filteredSqFtArray.reduce(
      (total: number, current: number) => total + current,
      0
    );

    const formattedDate = formatDate(values.close_date);
    const dateOfAnalysis = formatDate(values.date_of_analysis);
    const effectiveDate = formatDate(values.effective_date);
    const reportDate = formatDate(values.report_date);
    const lastTransferDate = formatDate(values.last_transferred_date);
    let priceSquareFoot;
    const landAssesment = parseFloat(values.land_assessment?.replace('$', ''));

    if (values.comp_type === 'land_only') {
      const landSize: any = values.land_size
        ? parseFloat(values.land_size.replace(/,/g, ''))
        : '';
      priceSquareFoot = landAssesment / landSize || null;
    } else {
      priceSquareFoot = landAssesment / calculateBuildingSize;
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

    mutate(
      {
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
        price_square_foot: priceSquareFoot ? priceSquareFoot : 0,
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
        map_pin_zoom: 16,
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
        position: 'overviw',
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
        under_contract_price: parseFloat(
          (values.under_contract_price as string)?.replace(/[$,]/g, '')
        ),
        close_date:
          !values.close_date || values.close_date === 'NaN/NaN/NaN'
            ? null
            : formattedDate || localStorage.getItem('close_date') || null,

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
          ? Number(values.total_land_improvement)
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
          values.traffic_input === null
            ? null
            : parseFloat(values.traffic_input.replace(/,/g, '')),
        analysis_type: active_comp_type ? values?.analysis_type : null,
        price: parseFloat((values.price as string)?.replace(/[$,]/g, '')),

        other_include_utilities: values.other_include_utilities,
        included_utilities:
          values.included_utilities === '' ? [] : values.included_utilities,
        zonings:
          values.comp_type === 'land_only'
            ? []
            : zonings[0].zone
              ? zonings
              : [],
        // property_units: propertyUnits,
      },
      {
        onSuccess: async (res) => {
          // localStorage.setItem('hello', 'sfsdfsd');

          toast(res.data.message);

          try {
            const refreshed = await refetch(); // Await the updated GET API call
            console.log('Refetched data:', refreshed?.data?.data);
            const refreshedBuildingSize = refreshed?.data?.data?.building_size;

            if (refreshedBuildingSize !== undefined) {
              localStorage.setItem('buildingSize', refreshedBuildingSize);
            } else {
              // Optional: fallback or log
              console.warn('Building size not available in refetched data');
            }

            // ✅ Navigate only after localStorage is updated
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
    comparison_basis:
      updateData.evaluation_type == 'multi_family'
        ? 'Unit'
        : updateData?.comparison_basis,
    no_stories: updateData?.no_stories,
    other_include_utilities: updateData?.other_include_utilities,
    parking: TypeMyOwnParking(updateData?.parking),
    included_utilities: updateData?.included_utilities || [],
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
      updateData.analysis_type !== null ? updateData?.analysis_type : '$/SF',
  };

  return (
    <SidebarContainer>
      <Formik
        initialValues={initialValues}
        validationSchema={
          localStorage.getItem('activeType') === 'building_with_land'
            ? AppraisalOverviewSchema
            : AppraisalOverviewLandOnlySchema
        }
        onSubmit={handleSubmit}
      >
        {({ dirty }) => {
          {
            console.log(dirty);
          }
          // 👈 now we have access to 'dirty'
          return (
            <>
              {/* For example: you can console log it */}
              {/* console.log(dirty) */}

              <div className="fixed lg:w-[242px] w-[180px] z-10 h-full overflow-auto lg:p-[20px] p-[8px] overflow-hidden border-t-0 border-r border-[#eee] border-solid">
                <List>
                  {sections
                    .filter(
                      (item) =>
                        localStorage.getItem('activeType') ===
                          'building_with_land' || item !== 'AMENITIES'
                    )
                    .map((item, index) => (
                      <ListItem
                        key={index}
                        sx={{
                          pl: { xs: '8px', xl: '20px' },
                          position: 'relative',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#2e2e2e9c',
                        }}
                        onClick={() => scrollToSection(index)}
                      >
                        {activeItem === index && (
                          <div className="h-[1px] right-2 bg-[#3391C7] absolute top-[46px] left-[12px]" />
                        )}
                        <div
                          className={`lg:py-2 lg:px-4 p-1 cursor-pointer ${
                            activeItem === index
                              ? 'font-bold text-[#000000]'
                              : ''
                          }`}
                          style={{ fontFamily: 'montserrat-normal' }}
                        >
                          {item}
                        </div>
                      </ListItem>
                    ))}
                </List>
              </div>

              <Form className="w-full lg:pl-[230px] pl-[180px]">
                {[
                  <EvaluationPropertyDetails />,
                  <EvlaluationSpecification
                    passRequired={passRequired}
                    getCompType={getCompType}
                    updateData={updateData}
                  />,
                  <EvaluationAnalysis />,
                  localStorage.getItem('activeType') ===
                  'building_with_land' ? (
                    <EvaluationAmenities key="amenities" />
                  ) : null,
                  <EvaluationZoning passRequired={passRequired} />,
                  <EvaluationTaxAssessment key="tax-assessment" />,
                  <EvaluationMapBoundaries />,
                ].map((item, i) => {
                  return item ? (
                    <section className="lg:pl-12 lg:pr-20 px-4" key={i}>
                      {item}
                    </section>
                  ) : null;
                })}
              </Form>
            </>
          );
        }}
      </Formik>
    </SidebarContainer>
  );
};

export default OverviewSidebar;
