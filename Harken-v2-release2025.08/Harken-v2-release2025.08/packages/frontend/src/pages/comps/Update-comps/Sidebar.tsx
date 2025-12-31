import React, { useState, useEffect } from 'react';
import { List, ListItem } from '@mui/material';
import { styled } from '@mui/system';
import Broker from '../create-comp/Broker';
import { Property } from '../create-comp/Property';
import { Building } from '../create-comp/Building';
import { Site } from '../create-comp/Site';
import { Transaction } from '../create-comp/Transaction';
import { SpaceDetails } from '../create-comp/SpaceDetails';
import { Formik, Form } from 'formik';
import { useMutate, RequestType } from '@/hook/useMutate';
import { toast } from 'react-toastify';
import { useLocation, useParams } from 'react-router-dom';
import {
  createCompValidation,
  createCompValidationLandOnly,
} from '@/utils/validation-Schema';
import { setPriceSquareFoot } from '@/utils/setPriceSquareFoot';
import { UpdatedRescompsGetDataType } from '@/components/interface/updated-res-data-types';
import { ResponseType } from '@/components/interface/response-type';
import { useGet } from '@/hook/useGet';
import { UsaStateCodes } from '@/utils/usaState';
import { useNavigate } from 'react-router-dom';
import loadingImage from '../../../images/loading.png';
import { HeaderEnum } from '@/components/header/ENUM/headerEnum';

const SidebarContainer = styled('div')({
  display: 'flex',
});

export enum Alignments {
  SALES = 'sales',
  LEASES = 'leases',
}

export enum BuildingLand {
  BUILDING_WITH_LAND = 'building_with_land',
  LAND_ONLY = 'land_only',
}

const Sidebar: React.FC = () => {
  const { appraisalId, type, compId } = useParams();
  const { id } = useParams<{ id: string }>();
  const [passData, setpassData] = useState<any>([]);
  const [setDataRequited, setSetDataRequited] = useState(false);
  const [loader, setLoader] = useState(false);
  const [compStatus, setCompStatus] = useState('');
  // const location = window.location.href;
  const locations = useLocation();

  // const segments = location.split('/');
  // const value = segments[segments.length - 1];
  // useEffect(() => {
  //   const handlePopState = () => {
  //     if (appraisalId && type === 'sales' && value) {
  //       navigate(`/sales-approach?id=${appraisalId}&salesId=${value}`);
  //     } else if (appraisalId && type === 'cost' && value) {
  //       navigate(`/cost-approach?id=${appraisalId}&costId=${value}`);
  //     } else if (appraisalId && type === 'lease' && value) {
  //       navigate(`/lease-approach?id=${appraisalId}&leaseId=${value}`);
  //     }
  //   };

  //   window.addEventListener('popstate', handlePopState);
  // }, []);
  const { mutate } = useMutate<ResponseType, any>({
    queryKey: 'update-comp',
    endPoint: `comps/update/${id}`,
    requestType: RequestType.PATCH,
  });

  const { data, refetch, isLoading } = useGet<UpdatedRescompsGetDataType>({
    queryKey: 'all',
    endPoint: `comps/get/${id}`,
    config: { refetchOnWindowFocus: false },
  });

  // Store compType in localStorage when data is available
  useEffect(() => {
    if (data?.data?.data?.comp_type) {
      const comp_type = data?.data?.data?.comp_type;
      localStorage.setItem('activeType', comp_type);
      localStorage.setItem('activeMain', HeaderEnum.COMPS);
      if (comp_type === HeaderEnum.BUILDING_WITH_LAND) {
        localStorage.setItem('activeButton', HeaderEnum.COMMERCIAL);
      } else {
        localStorage.setItem('activeButton', HeaderEnum.LAND);
      }
      localStorage.setItem('selectedComp', data?.data?.data?.comp_type);
    }
  }, [data]);

  const navigate = useNavigate();
  useEffect(() => {
    setpassData(data?.data?.data as any);
  }, [data?.data?.data]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        refetch();
      } catch (error) {
        console.error('Error while mutating data:', error);
      }
    };
    fetchData();
  }, [data?.data?.data, refetch]);

  const [activeItem, setActiveItem] = useState<number | null>(null);
  const [compType, setCompType] = useState('');

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

  const getCompType = (event: string) => {
    setCompType(event);
  };
  function convertCurrencyToNumber(currencyString: any) {
    const sanitizedString = currencyString.replace(/[$,]/g, '');
    const numberValue = parseFloat(sanitizedString);
    return numberValue;
  }

  const handleSubmit = (values: any) => {
    if (
      !values.condition ||
      !values.sale_price ||
      !values.date_sold ||
      !values.lease_rate
    ) {
      setLoader(false);
    } else {
      setLoader(true);
    }
    const stateCode = Object.keys(UsaStateCodes).find(
      (key) => UsaStateCodes[key] === values.state
    );

    const estBuildingValue =
      typeof values.est_building_value === 'string' && values.est_building_value
        ? convertCurrencyToNumber(values?.est_building_value)
        : null;
    const totalOperatingValue =
      typeof values.total_operating_expense === 'string' &&
      values.total_operating_expense
        ? convertCurrencyToNumber(values.total_operating_expense)
        : null;
    const totalOpeartingExpensePsf =
      typeof values.operating_expense_psf === 'string' &&
      values.operating_expense_psf
        ? convertCurrencyToNumber(values?.operating_expense_psf)
        : 0;

    const totalNetOperatingIncome =
      typeof values.net_operating_income === 'string' &&
      values.net_operating_income
        ? convertCurrencyToNumber(values?.net_operating_income)
        : 0;

    const totalConcessionValue =
      typeof values.total_concessions === 'string' && values.total_concessions
        ? convertCurrencyToNumber(values?.total_concessions)
        : null;
    const estimatedLandValue =
      typeof values.est_land_value === 'string' && values.est_land_value
        ? convertCurrencyToNumber(values?.est_land_value)
        : null;

    const sqFtArray = values.zonings.map((item: any) =>
      item.sq_ft && typeof item.sq_ft === 'string'
        ? parseInt(item.sq_ft.replace(/,/g, ''), 10)
        : 0
    );

    const filteredSqFtArray = sqFtArray.filter((sqFt: number) => !isNaN(sqFt));

    const calculateBuildingSize = filteredSqFtArray.reduce(
      (total: number, current: number) => total + current,
      0 || 0
    );
    const listPriceValue =
      typeof values.list_price === 'string' && values.list_price
        ? convertCurrencyToNumber(values?.list_price)
        : null;

    let zonings = [];
    if (values.zonings && values.zonings.length > 0) {
      zonings = values.zonings.map((ele: any) => {
        return {
          zone: ele.zone,
          sub_zone: ele.sub_zone,

          sq_ft:
            ele.sq_ft && typeof ele.sq_ft === 'string'
              ? parseFloat(ele.sq_ft.replace(/,/g, ''))
              : ele.sq_ft || 0, // Fallback to 0 if undefined or 0

          unit:
            ele.unit && typeof ele.unit === 'string'
              ? parseFloat(ele.unit.replace(/,/g, ''))
              : ele.unit || null, // Fallback to null if undefined

          bed:
            ele.bed && typeof ele.bed === 'string'
              ? parseFloat(ele.bed.replace(/,/g, ''))
              : ele.bed || null, // Fallback to null if undefined

          sub_zone_custom: ele.sub_zone_custom ? ele.sub_zone_custom : '',
        };
      });
    }
    const propertyUnits = values.property_units?.map((ele: any) => {
      const isMultiFamilyZone = zonings.some(
        (zoning: any) => zoning.zone == 'multi_family'
      );

      if (!isMultiFamilyZone && values.comparison_basis === 'Unit') {
        return {
          avg_monthly_rent: null,
          baths: null,
          beds: null,
          sq_ft: null,
          unit_count: null,
        };
      }
      const avgMonthlyRent =
        ele.avg_monthly_rent !== 0
          ? parseFloat(ele.avg_monthly_rent.replace(/[^\d.]/g, ''))
          : 0;
      const baths =
        typeof ele.baths === 'string' && ele.baths.includes(',')
          ? parseFloat(ele.baths.replace(/,/g, ''))
          : ele.baths;
      const beds =
        typeof ele.beds === 'string' && ele.beds.includes(',')
          ? parseFloat(ele.beds.replace(/,/g, ''))
          : ele.beds;
      const sqFt =
        typeof ele.sq_ft === 'string' && ele.sq_ft.includes(',')
          ? parseFloat(ele.sq_ft.replace(/,/g, ''))
          : ele.sq_ft;
      const unitCount =
        typeof ele.unit_count === 'string' && ele.unit_count.includes(',')
          ? parseFloat(ele.unit_count.replace(/,/g, ''))
          : ele.unit_count;
      return {
        avg_monthly_rent: ele.avg_monthly_rent ? avgMonthlyRent : 0.0,
        baths: ele.baths ? baths : 0,
        beds: ele.beds ? beds : 0,
        sq_ft: ele.sq_ft ? sqFt : 0,
        unit_count: ele.unit_count ? unitCount : 0,
      };
    });

    mutate(
      {
        street_address: values.street_address,
        street_suite: values.street_suite,
        city: values.city,
        county: values.county,
        state: stateCode ? stateCode.toLocaleLowerCase() : '',
        zipcode: values.zipcode,
        type: values.type === 'sales' ? 'sale' : 'lease',
        property_image_url: values.property_image_url,
        condition: values.condition,
        property_class: 'class_b',
        year_built:
          values.comp_type === 'building_with_land' ? values.year_built : null,
        year_remodeled:
          values.comp_type === 'building_with_land'
            ? values.year_remodeled
            : null,
        sale_price:
          values.type === 'sales'
            ? parseFloat((values.sale_price as string)?.replace(/[$,]/g, ''))
            : null,
        price_square_foot: setPriceSquareFoot(values, calculateBuildingSize),
        lease_rate: parseFloat(
          values.lease_rate.toString().replace('$', '').replace(/,/g, '')
        ),
        term: values.term ? +values.term : null,
        concessions: values.concessions || null,
        building_size:
          values.comp_type === 'building_with_land'
            ? calculateBuildingSize
            : null,
        land_size:
          values?.land_size === ''
            ? null
            : Number(values.land_size.replace(/,/g, '')),
        land_dimension: values.land_dimension,
        summary: values.summary,
        parcel_id_apn: values.parcel_id_apn,
        frontage: values.frontage,
        frontage_custom: values.frontage_custom,
        utilities_select: values.utilities_select,
        zoning_type: values.zoning_type,
        map_pin_lat: values.geometry.lat.toString(),
        map_pin_lng: values.geometry.lng.toString(),
        map_pin_zoom: values.map_pin_zoom,
        latitude: values.latitude
          ? values.latitude
          : values.geometry.lat.toString(),
        longitude: values.longitude
          ? values.longitude
          : values.geometry.lng.toString(),
        net_operating_income:
          values.type === 'sales'
            ? values.comp_type === 'building_with_land'
              ? totalNetOperatingIncome
              : null
            : null,
        cap_rate:
          values.type === 'sales'
            ? values.comp_type === 'land_only' ||
              values.cap_rate == 0 ||
              values.cap_rate == null
              ? null
              : Number(values.cap_rate)
            : null,
        comp_type: values.comp_type,
        lease_type: values.lease_type,
        topography: values.topography,
        topography_custom: values.topography_custom,
        lot_shape: values.lot_shape,
        lease_rate_unit: values.lease_rate_unit,
        space: values.space ? parseFloat(values.space.replace(/,/g, '')) : null,
        cam: parseFloat(
          values.cam.toString().replace('$', '').replace(/,/g, '')
        ),
        date_execution:
          values.date_execution === 'NaN/NaN/NaN' ? '' : values.date_execution,
        date_commencement:
          values.date_commencement === 'NaN/NaN/NaN'
            ? ''
            : values.date_commencement,
        date_expiration:
          values.date_expiration === 'NaN/NaN/NaN'
            ? ''
            : values.date_expiration,
        TI_allowance: parseFloat(
          values.TI_allowance.toString().replace('$', '').replace(/,/g, '')
        ),
        TI_allowance_unit: values.TI_allowance_unit
          ? values.TI_allowance_unit
          : null,
        asking_rent: parseFloat(
          values.asking_rent.toString().replace('$', '').replace(/,/g, '')
        ),
        asking_rent_unit: values.asking_rent_unit,
        escalators: values.escalators ? values.escalators : null,
        utilities_select_custom: values.utilities_select_custom,
        free_rent: values.free_rent ? values.free_rent : null,
        lease_status: values.lease_status,
        total_operating_expense:
          values.type === 'sales'
            ? values.comp_type === 'building_with_land'
              ? totalOperatingValue
              : null
            : null,
        operating_expense_psf:
          values.type === 'sales'
            ? values.comp_type === 'building_with_land'
              ? totalOpeartingExpensePsf
              : null
            : null,
        list_price: values.type === 'sales' ? listPriceValue : null,
        date_list:
          values.type === 'sales'
            ? values.date_list === 'NaN/NaN/NaN'
              ? ''
              : values.date_list
            : null,
        days_on_market: values.type === 'sales' ? values.days_on_market : null,
        total_concessions:
          values.type === 'sales' ? totalConcessionValue : null,
        offeror_type: values.offeror_type ? values.offeror_type : '',
        lot_shape_custom: values.lot_shape_custom,
        offeror_id: Number(values.offeror_id) ? values.offeror_id : null,
        acquirer_type: values.acquirer_type ? values.acquirer_type : '',
        acquirer_id: Number(values.acquirer_id) ? values.acquirer_id : null,
        private_comp: values.private_comp,
        sale_status: values.sale_status,
        comparison_basis: values.comparison_basis,
        occupancy: values.occupancy,
        location_desc: values.location_desc,
        legal_desc: values.legal_desc,
        grantor: values.grantor,
        grantee: values.grantee,
        instrument: values.instrument,
        confirmed_by: values.confirmed_by,
        confirmed_with: values.confirmed_with,
        financing: values.type === 'sales' ? values.financing : null,
        marketing_time: values.type === 'sales' ? values.marketing_time : null,
        est_land_value: values.type === 'sales' ? estimatedLandValue : null,
        est_building_value: values.type === 'sales' ? estBuildingValue : null,
        construction_class: values.construction_class,
        stories: values.stories,
        site_access: values.site_access,
        gross_building_area: values.gross_building_area
          ? parseFloat(values.gross_building_area.replace(/,/g, ''))
          : null,
        net_building_area: values.net_building_area
          ? parseFloat(values.net_building_area.replace(/,/g, ''))
          : null,
        site_coverage_percent: Number(values.site_coverage_percent),
        effective_age: values.effective_age,
        site_comments: values.site_comments,
        building_comments: values.building_comments,
        other_include_utilities:
          values.type === 'leases' ? values.other_include_utilities : '',
        parking: values.parking,
        zonings:
          values.comp_type === 'building_with_land' && zonings.length > 0
            ? zonings
            : [],
        included_utilities:
          values.type === 'leases'
            ? values.included_utilities === ''
              ? []
              : values.included_utilities
            : [],
        property_units:
          values.comp_type === 'building_with_land' &&
          propertyUnits &&
          propertyUnits
            ? propertyUnits
            : [],
        date_sold: values.date_sold === 'NaN/NaN/NaN' ? '' : values.date_sold,
        land_type: values?.comp_type === 'land_only' ? values.land_type : null,
        condition_custom:
          values.condition === 'Type My Own' ? values.condition_custom : null,
        parking_custom: values.parking_custom,
        land_type_custom:
          values.comp_type === 'land_only' ? values.land_type_custom : '',
      },

      {
        onSuccess: () => {
          toast.success('Comp Updated Successfully');
          setLoader(false);

          const activeType = localStorage.getItem('activeType');
          if (locations.pathname.includes('evaluation/update-comps')) {
            navigate(
              `/evaluation/sales-approach?id=${appraisalId}&salesId=${compId}`
            );
            return;
          }
          if (locations.pathname.includes('evaluation/update-lease-comps')) {
            navigate(
              `/evaluation/lease-approach?id=${appraisalId}&leaseId=${compId}`
            );
            return;
          }
          if (locations.pathname.includes('evaluation/update-cost-comps')) {
            navigate(
              `/evaluation/cost-approach?id=${appraisalId}&costId=${compId}`
            );
            localStorage.setItem('activeType', 'building_with_land');
            return;
          }
          if (locations.pathname.includes('residential/update-sales-comps')) {
            navigate(
              `/residential/sales-approach?id=${appraisalId}&salesId=${compId}`
            );
            return;
          }
          if (locations.pathname.includes('evaluation/update-cap-comps')) {
            navigate(
              `/evaluation/cap-approach?id=${appraisalId}&capId=${compId}`
            );
            return;
          }
          if (
            locations.pathname.includes('evaluation/update-multi-family-comps')
          ) {
            navigate(
              `/evaluation/multi-family-approach?id=${appraisalId}&evaluationId=${compId}`
            );
            return;
          }

          if (locations.pathname.includes('evaluation/update-lease-comps')) {
            navigate(
              `/evaluation/lease-approach?id=${appraisalId}&leaseId=${compId}`
            );
            return;
          }

          if (type === 'sales' && activeType === 'building_with_land') {
            navigate(`/sales-approach?id=${appraisalId}&salesId=${compId}`);
          } else if (type === 'sales' && activeType === 'land_only') {
            navigate(`/sales-approach?id=${appraisalId}&salesId=${compId}`);
          } else if (type === 'lease' && activeType === 'land_only') {
            navigate(`/lease-approach?id=${appraisalId}&leaseId=${compId}`);
          } else if (activeType === 'land_only') {
            navigate('/land_comps', { state: { type: values.type } });
          } else if (type === 'cost' && activeType === 'building_with_land') {
            navigate(`/cost-approach?id=${appraisalId}&costId=${compId}`);
          } else if (type === 'lease' && activeType === 'building_with_land') {
            navigate(`/lease-approach?id=${appraisalId}&leaseId=${compId}`);
          } else {
            navigate('/comps', { state: { type: values.type } });
          }
        },
      }
    );
  };
  const passBoolean = (event: any) => {
    setSetDataRequited(event);
  };

  const manageSelectFieldSchema = () => {
    setSetDataRequited(false);
  };

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading || loading || loader) {
    return (
      <>
        <div className="img-update-loader">
          <img src={loadingImage} />
        </div>
      </>
    );
  }
  const allSections = [
    {
      name: 'LOCATION',
      component: (
        <Broker
          passData={passData}
          setDataRequited={setDataRequited}
          hasExistingAddress={!!passData?.street_address}
        />
      ),
    },
    { name: 'PROPERTY', component: <Property passData={passData} /> },
    {
      name: 'BUILDIING',
      component: (
        <Building
          getCompType={getCompType}
          passData={passData}
          setDataRequited={setDataRequited}
        />
      ),
    },
    {
      name: 'SITE',
      component: (
        <Site
          passData={passData}
          setDataRequited={setDataRequited}
          manageSelectFieldSchema={manageSelectFieldSchema}
        />
      ),
    },
    compStatus === Alignments.SALES
      ? {
          name: 'TRANSACTION',
          component: (
            <Transaction
              passDataT={passData}
              setDataRequited={setDataRequited}
              passBoolean={passBoolean}
            />
          ),
        }
      : {
          name: 'SPACE',
          component: (
            <SpaceDetails
              passBoolean={passBoolean}
              setDataRequited={setDataRequited}
              passDataT={passData}
            />
          ),
        },
  ];

  return (
    <>
      <SidebarContainer sx={{ marginTop: '15px' }}>
        <Formik
          initialValues={{
            map_pin_lng: '',
            acquirer_id: '',
            acquirer_type: 'select',
            building_size: '',
            county: '',
            latitude: '',
            longitude: '',
            map_pin_lat: '',
            map_pin_zoom: 0,
            offeror_id: '',
            offeror_type: 'select',
            price_square_foot: 0,
            property_class: '',
            year_remodeled: '',
            other_include_utilities: '',
            property_image_url: '',
            business_name: '',
            street_address: '',
            street_suite: '',
            city: '',
            summary: '',
            state: '',
            zipcode: '',
            location_desc: '',
            legal_desc: '',
            site_coverage_percent: '',
            lot_shape_custom: '',
            zoning_type: '',
            occupancy: '',
            grantor: '',
            grantee: '',
            instrument: '',
            confirmed_by: '',
            confirmed_with: '',
            parcel_id_apn: '',
            comparison_basis: 'SF',
            sub_zone: 'select',
            // sq_ft: '',
            year_built: '',
            // year_modeled: '',
            construction_class: '',
            stories: '',
            // gross_area: '',
            // net_area: '',
            effective_age: '',
            building_comments: '',
            condition:
              passData && passData.condition ? passData.condition : 'select',
            parking: '',
            land_size: '',
            land_dimension: 'sf',
            topography: 'select',
            lot_shape: 'select',
            frontage: 'select',
            frontage_custom: '',
            site_access: '',
            utilities_select: 'select',
            topography_custom: '',
            site_comments: '',
            sale_price: '',
            date_sold: '',
            sale_status: 'closed',
            net_operating_income: '',
            cap_rate: '',
            total_operating_expense: '',
            operating_expense_psf: '',
            list_price: '',
            date_list: '',
            days_on_market: '',
            total_concessions: '',
            financing: '',
            marketing_time: '',
            est_land_value: '',
            est_building_value: '',
            concessions: '',
            space: '',
            lease_rate: '',
            land_type_custom: '',
            utilities_select_custom: '',
            lease_rate_unit:
              passData && passData.lease_rate_unit
                ? passData.lease_rate_unit
                : 'sf_year',
            lease_type:
              passData && passData.lease_type ? passData.lease_type : 'select',
            cam: '',
            term: '',
            date_execution: '',
            date_commencement: '',
            date_expiration: '',
            TI_allowance: '',
            TI_allowance_unit: 'sf',
            asking_rent: '',
            escalators: '',
            free_rent: '',
            gross_building_area: '',
            net_building_area: '',
            lease_status:
              passData && passData.lease_status
                ? passData.lease_status
                : 'select',
            asking_rent_unit:
              passData && passData.asking_rent_unit
                ? passData.asking_rent_unit
                : 'sf_year',
            private_comp: 0,
            geometry: {
              latitude: '',
              logitude: '',
            },
            comp_type: BuildingLand.BUILDING_WITH_LAND,
            type: Alignments.SALES,
            zonings: [
              {
                zone: '',
                sub_zone: '',
                sq_ft: 0,
                unit: 0,
                bed: 0,
                sub_zone_custom: '',
              },
            ],
            property_units: [
              {
                beds: 0,
                baths: 0,
                sq_ft: 0,
                unit_count: 0,
                avg_monthly_rent: 0,
              },
            ],
            included_utilities: '',
            land_type: '',
            condition_custom: '',
            parking_custom: '',
          }}
          validationSchema={
            compType == 'building_with_land'
              ? createCompValidation
              : createCompValidationLandOnly
          }
          onSubmit={handleSubmit}
        >
          {({ values }) => {
            setCompStatus(values.type);
            return (
              <>
                <div className="sidebarWrapper fixed w-[175px] xl:w-[242px] z-10 h-[calc(100vh-270px)] overflow-auto xl:p-[20px] p-[8px] border-[1px] border-[#eeeeee] bg-[#0da1c714] rounded-[10px]">
                  <List>
                    {allSections?.map((item, index) => (
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
                {passData && (
                  <Form className="w-full lg:pl-[230px] pl-[180px]">
                    {[
                      <Broker
                        passData={passData}
                        setDataRequited={setDataRequited}
                        hasExistingAddress={!!passData?.street_address}
                      />,
                      <Property passData={passData} />,
                      <Building
                        getCompType={getCompType}
                        passData={passData}
                        setDataRequited={setDataRequited}
                      />,
                      <Site
                        passData={passData}
                        setDataRequited={setDataRequited}
                        manageSelectFieldSchema={manageSelectFieldSchema}
                      />,
                      values.type === Alignments.SALES ? (
                        <Transaction
                          passDataT={passData}
                          setDataRequited={setDataRequited}
                          passBoolean={passBoolean}
                        />
                      ) : (
                        <SpaceDetails
                          passBoolean={passBoolean}
                          setDataRequited={setDataRequited}
                          passDataT={passData}
                        />
                      ),
                    ].map((item, i) => {
                      return item ? (
                        <section className="lg:pl-12 lg:pr-20 px-4" key={i + 1}>
                          {item}
                        </section>
                      ) : null;
                    })}
                  </Form>
                )}
              </>
            );
          }}
        </Formik>
      </SidebarContainer>
    </>
  );
};

export default Sidebar;
