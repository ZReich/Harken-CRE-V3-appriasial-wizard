import React, { useState, useEffect } from 'react';
import { List, ListItem } from '@mui/material';
import { styled } from '@mui/system';
import Broker from './Broker';
import { Property } from './Property';
import { Building } from './Building';
import { Site } from './Site';
import { Transaction } from './Transaction';
import { SpaceDetails } from './SpaceDetails';
import { Formik, Form } from 'formik';
import { useMutate, RequestType } from '@/hook/useMutate';
import {
  useNavigate,
  useLocation,
  // useParams,
  // useSearchParams,
} from 'react-router-dom';
import {
  createCompLandLeaseValidation,
  createCompLeaseValidation,
  createCompValidation,
  createCompValidationLandOnly,
} from '@/utils/validation-Schema';
import { setPriceSquareFoot } from '@/utils/setPriceSquareFoot';
// import { CreateCompType } from '@/components/interface/create-comp-type';
import { ResponseType } from '@/components/interface/response-type';
import { UsaStateCodes } from '@/utils/usaState';
import loadingImage from '../../../images/loading.png';
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
  const navigate = useNavigate();
  // const [searchParams] = useSearchParams();

  // const id = searchParams.get('id');
  // const approachId = searchParams.get('approachId');
  const { mutate } = useMutate<ResponseType, any>({
    queryKey: 'create-comp',
    endPoint: 'comps/create',
    requestType: RequestType.POST,
  });
  const [activeItem, setActiveItem] = useState<number | null>(null);
  const [, setCompType] = useState('');
  const [setDataRequited, setSetDataRequited] = useState(false);
  const [passData] = useState([]);

  const [selectTypeAll, setSelectTypeAll] = useState('sales');
  const [compStatus, setCompStatus] = useState('');

  const [loader, setLoader] = useState(false);
  const [searchLoader, setSearchLoader] = useState(false);
  const [newlyCreatedComp, setNewlyCreatedComp] = useState(null);
  const location = useLocation();
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

  const sendType = (event: string) => {
    setSelectTypeAll(event);
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

    const zonings = values.zonings?.map((ele: any) => {
      return {
        zone: ele.zone,
        sub_zone: ele.sub_zone,
        sq_ft: ele.sq_ft === 0 ? 0 : parseFloat(ele.sq_ft.replace(/,/g, '')),
        unit: ele.unit === 0 ? 0 : parseFloat(ele.unit.replace(/,/g, '')),
        bed: ele.bed === 0 ? 0 : parseFloat(ele.bed.replace(/,/g, '')),
        sub_zone_custom: ele.sub_zone_custom ? ele.sub_zone_custom : '',
      };
    });

    const propertyUnits = values.property_units?.map((ele: any) => {
      const avgMonthlyRent =
        ele.avg_monthly_rent !== 0
          ? parseFloat(ele.avg_monthly_rent.replace(/[^\d.]/g, ''))
          : 0;
      const baths =
        ele.baths !== 0 ? parseFloat(ele.baths.replace(/,/g, '')) : 0;
      const beds = ele.beds !== 0 ? parseFloat(ele.beds.replace(/,/g, '')) : 0;
      return {
        avg_monthly_rent: ele.avg_monthly_rent ? avgMonthlyRent : 0,
        baths: ele.baths ? baths : 0,
        beds: ele.beds ? beds : 0,
        sq_ft: ele.sq_ft !== 0 ? parseFloat(ele.sq_ft.replace(/,/g, '')) : 0,
        unit_count:
          ele.unit_count !== 0
            ? parseFloat(ele.unit_count.replace(/,/g, ''))
            : 0,
      };
    });

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

    const estBuildingValue =
      typeof values.est_building_value === 'string' && values.est_building_value
        ? convertCurrencyToNumber(values?.est_building_value)
        : null;
    const totalOperatingValue =
      typeof values.total_operating_expense === 'string' &&
        values.total_operating_expense
        ? convertCurrencyToNumber(values?.total_operating_expense)
        : null;

    const totalConcessionValue =
      typeof values.total_concessions === 'string' && values.total_concessions
        ? convertCurrencyToNumber(values?.total_concessions)
        : null;

    const listPriceValue =
      typeof values.list_price === 'string' && values.list_price
        ? convertCurrencyToNumber(values?.list_price)
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
    const estimatedLandValue =
      typeof values.est_land_value === 'string' && values.est_land_value
        ? convertCurrencyToNumber(values?.est_land_value)
        : null;

    mutate(
      {
        // business_name: values.business_name,
        street_address: values.street_address,
        street_suite: values.street_suite,
        city: values.city,
        // county: 'Suffolk County',
        county: values.county,
        comparison_basis: values.comparison_basis,
        state: stateCode ? stateCode.toLocaleLowerCase() : '',
        zipcode: values.zipcode,
        type: values.type === 'sales' ? 'sale' : 'lease',
        property_image_url: values.property_image_url,
        condition: values.condition,
        condition_custom: values.condition_custom,
        property_class: 'class_b',
        year_built: values.year_built == '' ? null : values.year_built,
        year_remodeled:
          values.year_remodeled == '' ? null : values.year_remodeled,
        sale_price: parseFloat(
          (values.sale_price as string)?.replace(/[$,]/g, '')
        ),
        price_square_foot: setPriceSquareFoot(values, calculateBuildingSize),
        lease_rate: parseFloat(
          values.lease_rate.toString().replace('$', '').replace(/,/g, '')
        ),
        term: values.term ? Number(values.term) : null,
        concessions: values.concessions,
        building_size:
          values.comp_type === 'building_with_land'
            ? calculateBuildingSize
            : null,
        land_size: parseFloat((values.land_size as string)?.replace(/,/g, '')),
        summary: values.summary,
        parcel_id_apn: values.parcel_id_apn,
        frontage: values.frontage,
        frontage_custom: values.frontage_custom,
        utilities_select: values.utilities_select,
        utilities_select_custom: values.utilities_select_custom,
        zoning_type: values.zoning_type,
        net_operating_income: totalNetOperatingIncome,
        map_pin_lat: values.geometry.lat.toString(),
        map_pin_lng: values.geometry.lng.toString(),
        map_pin_zoom: 16,
        latitude: values.geometry.lat.toString(),
        longitude: values.geometry.lng.toString(),
        cap_rate: values.cap_rate === '' ? null : Number(values.cap_rate),
        // comp_type: values.comp_type,
        comp_type: localStorage.getItem('activeType'),
        lease_type: values.lease_type ? values.lease_type : null,
        topography: values.topography,
        topography_custom: values.topography_custom,
        lot_shape: values.lot_shape,
        lot_shape_custom: values.lot_shape_custom,
        lease_rate_unit: values.lease_rate_unit
          ? values.lease_rate_unit
          : 'year',
        space: values.space ? parseFloat(values.space.replace(/,/g, '')) : null,
        cam: parseFloat(values.cam.replace('$', '').replace(/,/g, '')),
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
        TI_allowance: values.TI_allowance
          ? parseFloat(values.TI_allowance.replace('$', '').replace(/,/g, ''))
          : null,
        TI_allowance_unit: values.TI_allowance_unit,
        asking_rent: values.asking_rent
          ? parseFloat(values.asking_rent.replace('$', '').replace(/,/g, ''))
          : null,
        asking_rent_unit: values.asking_rent_unit,
        escalators: values.escalators ? values.escalators : null,
        free_rent: values.free_rent ? values.free_rent : null,
        lease_status: values.lease_status,
        total_operating_expense: totalOperatingValue,
        operating_expense_psf: totalOpeartingExpensePsf,
        list_price: listPriceValue,
        date_list: values.date_list === 'NaN/NaN/NaN' ? '' : values.date_list,
        days_on_market: values.days_on_market ? values.days_on_market : null,
        total_concessions: totalConcessionValue,
        offeror_type: values.offeror_type ? values?.offeror_type : '',
        offeror_id: Number(values.offeror_id) ? values?.offeror_id : null,
        acquirer_type: values.acquirer_type ? values?.acquirer_type : '',
        acquirer_id: Number(values.acquirer_id) ? values?.acquirer_id : null,
        private_comp: values.private_comp,
        sale_status: values.sale_status,
        land_dimension: values.land_dimension || 'SF',
        date_sold: values.date_sold === 'NaN/NaN/NaN' ? '' : values?.date_sold,
        occupancy: values.occupancy,
        location_desc: values.location_desc,
        legal_desc: values.legal_desc,
        grantor: values.grantor,
        grantee: values.grantee,
        instrument: values.instrument,
        confirmed_by: values.confirmed_by,
        confirmed_with: values.confirmed_with,
        financing: values.financing,
        marketing_time: values.marketing_time,
        est_land_value: estimatedLandValue,
        est_building_value: estBuildingValue,
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
        parking: values.parking,
        parking_custom: values.parking_custom,
        zonings: zonings[0].zone ? zonings : [],
        property_units: propertyUnits,
        other_include_utilities: values.other_include_utilities,
        included_utilities:
          values.included_utilities === '' ? [] : values.included_utilities,
        land_type: values.land_type ? values.land_type : null,
        land_type_custom: values.land_type_custom,
        comp_link: location.pathname.includes('sales/create-comp')
          ? 'true'
          : 'false',
      },
      {
        onSuccess: (res: any) => {
          console.log('resdataaa', res);
          console.log('checkdataa', res.data);
          setLoader(false);
          if (location.pathname.includes('sales/create-comp')) {
            setNewlyCreatedComp(res.data.data);
          } else if (location.pathname.includes('cost/create-comp')) {
            localStorage.setItem('activeType', 'building_with_land');
            setNewlyCreatedComp(res.data.data);
          } else if (location.pathname.includes('lease/create-comp')) {
            setNewlyCreatedComp(res.data.data);
          } else if (location.pathname.includes('multi-family/create-comp')) {
            setNewlyCreatedComp(res.data.data);
          } else if (
            location.pathname.includes('evaluation/sales/create-comp')
          ) {
            setNewlyCreatedComp(res.data.data);
          } else if (
            location.pathname.includes('evaluation/cost/create-comp')
          ) {
            setNewlyCreatedComp(res.data.data);
          } else if (
            location.pathname.includes('evaluation/lease/create-comp')
          ) {
            setNewlyCreatedComp(res.data.data);
          } else if (location.pathname.includes('evaluation/cap/create-comp')) {
            setNewlyCreatedComp(res.data.data);
          } else if (
            location.pathname.includes('residential/sales/create-comp')
          ) {
            setNewlyCreatedComp(res.data.data);
          } else if (localStorage.getItem('activeType') === 'land_only') {
            navigate('/land_comps');
          } else if (location.pathname.includes('cap/create-comp')) {
            setNewlyCreatedComp(res.data.data);
          } else {
            navigate('/comps');
          }
        },
      }
    );
  };

  const passBoolean = (event: any) => {
    setSetDataRequited(event);
  };
  if (loader || searchLoader) {
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
          sendType={sendType}
          setSearchLoader={setSearchLoader}
          hasExistingAddress={false}
        />
      ),
    },
    { name: 'PROPERTY', component: <Property passData={passData} /> },
    {
      name: 'BUILDING',
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
      component: <Site passData={passData} setDataRequited={setDataRequited} />,
    },
    compStatus === Alignments.SALES
      ? {
        name: 'TRANSACTION',
        component: (
          <Transaction
            passDataT={passData}
            setDataRequited={setDataRequited}
            passBoolean={passBoolean}
            newlyCreatedComp={newlyCreatedComp}
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
            newlyCreatedComp={newlyCreatedComp}
          />
        ),
      },
  ];

  return (
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
          land_type_custom: '',
          // sq_ft: '',
          year_built: '',
          // year_modeled: '',
          construction_class: '',
          stories: '',
          // gross_area: '',
          // net_area: '',
          frontage_custom: '',
          effective_age: '',
          building_comments: '',
          condition: '',
          parking: '',
          land_size: '',
          land_dimension: 'SF',
          condition_custom: '',
          topography: '',
          lot_shape: '',
          frontage: '',
          site_access: '',
          utilities_select: '',
          utilities_select_custom: '',
          site_comments: '',
          sale_price: '',
          date_sold: '',
          sale_status: 'Closed',
          net_operating_income: '',
          lot_shape_custom: '',
          cap_rate: '',
          total_operating_expense: '',
          operating_expense_psf: '',
          parking_custom: '',
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
          lease_rate_unit: 'year',
          topography_custom: '',
          lease_type: '',
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
          lease_status: '',
          asking_rent_unit: 'year',
          private_comp: 0,
          geometry: {
            lat: '',
            lng: '',
          },
          comp_type: BuildingLand.BUILDING_WITH_LAND,
          type:
            location.pathname === '/evaluation/lease/create-comp' ||
              location.pathname === '/lease/create-comp'
              ? 'leases'
              : Alignments.SALES,
          zonings: [
            {
              zone: '',
              sub_zone: '',
              sq_ft: '',
              unit: '',
              bed: '',
              sub_zone_custom: '',
            },
          ],
          property_units: [
            {
              beds: '',
              baths: '',
              sq_ft: '',
              unit_count: '',
              avg_monthly_rent: '',
            },
          ],

          included_utilities: '',
          land_type: '',
        }}
        validationSchema={
          localStorage.getItem('activeType') === 'building_with_land' &&
            selectTypeAll === 'leases'
            ? createCompLeaseValidation
            : localStorage.getItem('activeType') === 'land_only' &&
              selectTypeAll === 'leases'
              ? createCompLandLeaseValidation
              : localStorage.getItem('activeType') === 'building_with_land'
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
                        scrollToSection(index + 1);
                      }}
                    >
                      {activeItem === index + 1 && (
                        <div className="h-[1px] right-2 bg-[#3391C7] absolute top-[46px] left-[12px]" />
                      )}
                      <div
                        className={`lg:py-2 lg:px-4 p-1 cursor-pointer ${activeItem === index + 1
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
                      sendType={sendType}
                      setSearchLoader={setSearchLoader}
                      hasExistingAddress={false}
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
                    />,
                    values.type === Alignments.SALES ? (
                      <Transaction
                        passDataT={passData}
                        setDataRequited={setDataRequited}
                        passBoolean={passBoolean}
                        newlyCreatedComp={newlyCreatedComp}
                      />
                    ) : (
                      <SpaceDetails
                        passBoolean={passBoolean}
                        setDataRequited={setDataRequited}
                        passDataT={passData}
                        newlyCreatedComp={newlyCreatedComp}
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
  );
};

export default Sidebar;
