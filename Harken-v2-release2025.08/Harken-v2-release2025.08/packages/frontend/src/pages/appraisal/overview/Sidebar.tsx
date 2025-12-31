// Suppress MUI warnings
const originalWarn = console.warn;
console.warn = (...args) => {
  const message = args[0];
  if (
    typeof message === 'string' &&
    (message.includes('MUI') ||
      message.includes('Material-UI') ||
      message.includes('findDOMNode') ||
      message.includes('deprecated'))
  ) {
    return;
  }
  originalWarn.apply(console, args);
};

import React, { useState, useEffect } from 'react';
import { List, ListItem } from '@mui/material';
import { styled } from '@mui/system';
import { Formik, Form } from 'formik';
import { PropertyDetails } from './PropertyDetails';
import { Specification } from './Specification';
import { Analysis } from './Analysis';
import { Amenities } from './Amenities';
import { Zoning } from './Zoning';
import { TaxAssessment } from './TaxAssessment';
import { MapBoundaries } from './MapBoundaries';
import { useGet } from '@/hook/useGet';
import { RequestType } from '@/hook';
import { useMutate } from '@/hook/useMutate';
import { toast } from 'react-toastify';
import { formatDate, formatDateFormat } from '@/utils/date-format';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ResponseType } from '@/components/interface/response-type';
import { usa_state } from '@/pages/comps/comp-form/fakeJson';
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
} from './SelectOption';
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
import { AmenitiesEnum } from './OverviewEnum';

import { landTypeOptions } from '@/pages/comps/create-comp/SelectOption';
import { UsaStateCodes } from '@/utils/usaState';
import {
  AppraisalOverviewLandOnlySchema,
  AppraisalOverviewSchema,
} from '@/utils/appraisalOverviewSchema';
import loadingImage from '../../../images/loading.png';
const SidebarContainer = styled('div')({ display: 'flex' });

const OverviewSidebar: React.FC<any> = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [, setCompType] = useState('');
  const [validationSchema, setValidationSchema] = useState(false);
  const [loader, setLoader] = useState(false);

  const getCompType = (event: string) => {
    setCompType(event);
  };
  const { mutate } = useMutate<ResponseType, any>({
    queryKey: 'appraisals/update-overview',
    endPoint: `appraisals/update-overview/${id}`,
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
  const { data, isLoading } = useGet<any>({
    queryKey: 'appraisals/get',
    endPoint: `appraisals/get/${id}`,
    config: {},
  });

  const { mutateAsync } = useMutate<ResponseType, any>({
    queryKey: 'appraisals/update-position',
    endPoint: `appraisals/update-position/${id}`,
    requestType: RequestType.PATCH,
  });

  useEffect(() => {
    const updatePositionWithCurrentUrl = async () => {
      try {
        const ApiUrl = window.location.href.replace(window.location.origin, '');
        await mutateAsync({
          position: ApiUrl,
        });
      } catch (error) {
        console.error('Position update failed:', error);
        // Don't redirect on position update failure
      }
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
      unit: ele.unit == null ? '' : ele.unit.toString(),
      bed: ele.bed == null ? '' : ele.bed.toString(),
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
  const handleSubmit = (values: any) => {
    console.log('🚀 Appraisal handleSubmit called with values:', values);
    try {
      setLoader(true);

      // Handle state - check if it's already a code or needs conversion
      let stateToSend = '';
      if (values.state) {
        // Check if it's already a state code (2 characters)
        if (values.state.length === 2) {
          stateToSend = values.state.toLowerCase();
        } else {
          // It's a full state name, convert to code
          const stateCode = Object.keys(UsaStateCodes).find(
            (key) => UsaStateCodes[key] === values.state
          );
          stateToSend = stateCode
            ? stateCode.toLowerCase()
            : values.state || 'tx';
        }
      }

      console.log(
        '📞 About to call appraisal mutate with endpoint:',
        `appraisals/update-overview/${id}`
      );

      // Handle zonings data type conversion
      const zonings = values.zonings?.map((ele: any) => {
        return {
          zone: ele.zone,
          sub_zone: ele.sub_zone,
          sq_ft:
            ele.sq_ft === 0
              ? 0
              : parseFloat(String(ele.sq_ft).replace(/,/g, '')),
          unit:
            ele.unit === 0 || ele.unit === ''
              ? 0
              : parseFloat(String(ele.unit).replace(/,/g, '')),
          bed:
            ele.bed === 0 || ele.bed === ''
              ? 0
              : parseFloat(String(ele.bed).replace(/,/g, '')),
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
          zipcode: values.zipcode ? values.zipcode.toString() : '',
          state: stateToSend,
          type: values.type,
          condition: values.condition,
          property_class: values.property_class,
          year_built: values.year_built ? values.year_built.toString() : null,
          year_remodeled: values.year_remodeled,
          price_square_foot:
            parseFloat(String(values.price_square_foot).replace(/,/g, '')) || 0,
          building_size: values.building_size || 0,
          land_size:
            values.land_size === null
              ? null
              : parseFloat(String(values.land_size).replace(/,/g, '')),
          land_dimension: values.land_dimension,
          summary: values.summary,
          parcel_id_apn: values.parcel_id_apn,
          frontage: values.frontage,
          utilities_select: values.utilities_select,
          zoning_type: values.zoning_type,
          map_pin_lat: values.geometry?.lat
            ? values.geometry.lat.toString()
            : values.map_pin_lat || '',
          map_pin_lng: values.geometry?.lng
            ? values.geometry.lng.toString()
            : values.map_pin_lng || '',
          map_pin_zoom: values.map_pin_zoom || 16,
          latitude: values.geometry?.lat
            ? values.geometry.lat.toString()
            : values.latitude || '',
          longitude: values.geometry?.lng
            ? values.geometry.lng.toString()
            : values.longitude || '',
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
          front_feet:
            parseFloat(String(values.front_feet || '').replace(/,/g, '')) ||
            null,
          lot_depth:
            parseFloat(String(values.lot_depth || '').replace(/,/g, '')) ||
            null,
          height:
            parseFloat(String(values.height || '').replace(/,/g, '')) || null,
          foundation: values.foundation,
          ada_compliance: values.ada_compliance,
          main_structure_base: values.main_structure_base,
          high_and_best_user: values.high_and_best_user,
          under_contract_price:
            values.type === 'sale'
              ? parseFloat(
                  String(values.under_contract_price || '').replace(/[$,]/g, '')
                ) || null
              : null,
          close_date:
            values.type === 'sale' && values.close_date
              ? formatDateFormat(values.close_date)
              : null,
          last_transferred_date: values.last_transferred_date
            ? formatDateFormat(values.last_transferred_date)
            : null,
          owner_of_record: values.owner_of_record,
          property_geocode: values.property_geocode,
          property_legal: values.property_legal,
          file_number: values.file_number
            ? values.file_number.toString()
            : null,
          intended_use: values.intended_use,
          intended_user: values.intended_user,
          date_of_analysis: values.date_of_analysis
            ? formatDateFormat(values.date_of_analysis)
            : formatDate(new Date()),
          effective_date: values.effective_date
            ? formatDateFormat(values.effective_date)
            : formatDate(new Date()),
          inspector_name: values.inspector_name,
          report_date: values.report_date
            ? formatDateFormat(values.report_date)
            : formatDate(new Date()),
          conforming_use_determination: values.conforming_use_determination,
          land_assessment:
            parseFloat(
              String(values.land_assessment || '').replace(/[$,]/g, '')
            ) || 0,
          structure_assessment:
            parseFloat(
              String(values.structure_assessment || '').replace(/[$,]/g, '')
            ) || 0,
          total_land_improvement: values.total_land_improvement
            ? parseFloat(
                String(values.total_land_improvement).replace(/,/g, '')
              )
            : null,
          sids: values.sids,
          tax_liability:
            parseFloat(
              String(values.tax_liability || '').replace(/[$,]/g, '')
            ) || 0,
          taxes_in_arrears:
            parseFloat(
              String(values.taxes_in_arrears || '').replace(/[$,]/g, '')
            ) || 0,
          assessed_market_year: values.assessed_market_year
            ? values.assessed_market_year.toString()
            : new Date().getFullYear().toString(),
          tax_liability_year: values.tax_liability_year
            ? values.tax_liability_year.toString()
            : new Date().getFullYear().toString(),
          property_rights_custom: values.property_rights_custom || null,
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
            values.traffic_count && values.traffic_count === 'inputvalue'
              ? String(values.traffic_input || '').replace(/,/g, '') || null
              : null,
          analysis_type: active_comp_type ? values.analysis_type : null,
          price:
            values.type === 'non_sale'
              ? parseFloat(String(values.price || '').replace(/[$,]/g, '')) ||
                null
              : null,
          other_include_utilities: values.other_include_utilities,
          included_utilities:
            values.included_utilities === '' ? [] : values.included_utilities,
          zonings:
            values.comp_type === 'land_only'
              ? []
              : zonings[0].zone
                ? zonings
                : [],
        },
        {
          onSuccess: (res) => {
            setLoader(false);
            toast(res.data.message);
            navigate(`/appraisal-photo-sheet?id=${id}`);
          },
          onError: (error) => {
            setLoader(false);
            console.error('🚫 API Error:', error);
            const errorMessage =
              (error as any)?.response?.data?.message ||
              error?.message ||
              'An error occurred while processing the appraisal form.';
            toast.error(errorMessage);
          },
        }
      );
    } catch (error) {
      console.error('🚫 Error in appraisal handleSubmit:', error);
      setLoader(false);
      toast.error('An error occurred while processing the appraisal form.');
    }
  };

  if (isLoading || loader) {
    return (
      <>
        <div className="img-update-loader">
          <img src={loadingImage} />
        </div>
      </>
    );
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
      updateData.appraisal_type == 'multi_family'
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
  const allSections = [
    { name: 'PROPERTY DETAILS', component: <PropertyDetails /> },
    {
      name: 'SPECIFICATIONS',
      component: (
        <Specification
          passRequired={passRequired}
          getCompType={getCompType}
          updateData={updateData}
        />
      ),
    },
    { name: 'ANALYSIS', component: <Analysis /> },
    { name: 'AMENITIES', component: <Amenities /> },
    {
      name: 'ZONING',
      component: <Zoning passRequired={passRequired} />,
    },
    { name: 'TAX ASSESSMENT', component: <TaxAssessment /> },
    { name: 'MAP BOUNDARIES', component: <MapBoundaries /> },
  ];

  const filteredSections = allSections.filter(
    (s) =>
      localStorage.getItem('activeType') === 'building_with_land' ||
      s.name !== 'AMENITIES'
  );
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
        {() => {
          return (
            <>
              <div className="fixed lg:w-[242px] w-[180px] z-10 h-full overflow-auto lg:p-[20px] p-[8px] overflow-hidden border-t-0 border-r border-[#eee] border-solid">
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
                          activeItem === index + 1
                            ? 'font-bold text-[#000000]'
                            : ''
                        }`}
                        style={{ fontFamily: 'montserrat-normal' }}
                      >
                        {item.name}
                      </div>
                    </ListItem>
                  ))}
                </List>
              </div>

              <Form className="w-full lg:pl-[230px] pl-[180px]">
                {[
                  <PropertyDetails
                    validationSchema={validationSchema}
                    hasExistingAddress={!!updateData?.street_address}
                  />,
                  <Specification
                    passRequired={passRequired}
                    getCompType={getCompType}
                    updateData={updateData}
                  />,
                  <Analysis />,
                  localStorage.getItem('activeType') ===
                  'building_with_land' ? (
                    <Amenities key="amenities" />
                  ) : null,
                  <Zoning passRequired={passRequired} />,
                  <TaxAssessment key="tax-assessment" />,
                  <MapBoundaries setValidationSchema={setValidationSchema} />,
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
