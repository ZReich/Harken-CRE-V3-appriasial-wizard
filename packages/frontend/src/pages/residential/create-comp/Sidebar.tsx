import React, { useState, useEffect } from 'react';
import { List, ListItem } from '@mui/material';
import { styled } from '@mui/system';
import Broker from '../Broker';
import { Property } from './Property';
import { Formik, Form } from 'formik';
import { useMutate, RequestType } from '@/hook/useMutate';
import { toast } from 'react-toastify';
import { ResponseType } from '@/components/interface/response-type';
import { Amenities } from './Amenities';
import { Transaction } from './Transaction';
import { residentialCreateCompsValidation } from '@/utils/residentialCreateCompSchema';
import { ResidentialCreateComp } from '@/components/interface/residential-create-comp';
import { UsaStateCodes } from '@/utils/usaState';
import { useNavigate } from 'react-router-dom';
import { setPriceSquareFootResidential } from '@/utils/setPriceSquareFootResidential';
import { ResidentialComponentHeaderEnum } from '../enum/ResidentialEnum';
const SidebarContainer = styled('div')({
  display: 'flex',
});

export enum Alignments {
  SALES = ResidentialComponentHeaderEnum.SALES,
  LEASES = ResidentialComponentHeaderEnum.LEASES,
}

export enum BuildingLand {
  BUILDING_WITH_LAND = ResidentialComponentHeaderEnum.BUILDING_WITH_LAND,
  LAND_ONLY = ResidentialComponentHeaderEnum.LAND_ONLY,
}
const ResidentialSidebar: React.FC = () => {
  const { mutate } = useMutate<ResponseType, ResidentialCreateComp>({
    queryKey: 'resComps/create',
    endPoint: 'resComps/create',
    requestType: RequestType.POST,
  });
  const [activeItem, setActiveItem] = useState<number | null | any>(null);

  const [setDataRequited, setSetDataRequited] = useState<boolean>(false);
  const [newlyCreatedComp, setNewlyCreatedComp] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll(
        ResidentialComponentHeaderEnum.SECTION
      );
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
    window.addEventListener(
      ResidentialComponentHeaderEnum.SCROLL,
      handleScroll
    );
    return () =>
      window.removeEventListener(
        ResidentialComponentHeaderEnum.SCROLL,
        handleScroll
      );
  }, [setActiveItem]);

  const scrollToSection = (index: number) => {
    const section = document.querySelectorAll(
      ResidentialComponentHeaderEnum.SECTION
    )[index] as HTMLElement;
    if (section) {
      window.scrollTo({
        top: section.offsetTop - 225,
        behavior: ResidentialComponentHeaderEnum.SMOOTH,
      });
    }
  };

  const handleSubmit = (values: any) => {
    const stateCode = Object.keys(UsaStateCodes).find(
      (key) => UsaStateCodes[key] === values.state
    );

    const listPriceValue =
      typeof values.list_price === ResidentialComponentHeaderEnum.STRING &&
      values.list_price
        ? parseFloat((values.list_price as string).replace('$', ''))
        : null;

    const totalConcessionValue =
      typeof values.total_concessions ===
        ResidentialComponentHeaderEnum.STRING && values.total_concessions
        ? parseFloat(
            (values.total_concessions as string).replace('$', '')
          ).toFixed(2)
        : null;
    const building = values.zonings.map(
      (ele: {
        gross_living_sq_ft: string;
        basement_finished_sq_ft: string;
        basement_unfinished_sq_ft: string;
      }) => {
        return {
          gross_living_sq_ft: parseFloat(
            ele.gross_living_sq_ft.replace(/,/g, '')
          ),
          basement_finished_sq_ft: parseFloat(
            ele.basement_finished_sq_ft.replace(/,/g, '')
          ),
          basement_unfinished_sq_ft: parseFloat(
            ele.basement_unfinished_sq_ft.replace(/,/g, '')
          ),
        };
      }
    );
    const total = building.reduce(
      (accumulator: any, currentValue: any) => {
        accumulator.gross_living_sq_ft += currentValue.gross_living_sq_ft;
        accumulator.basement_finished_sq_ft +=
          currentValue.basement_finished_sq_ft;
        accumulator.basement_unfinished_sq_ft +=
          currentValue.basement_unfinished_sq_ft;
        return accumulator;
      },
      {
        gross_living_sq_ft: 0,
        basement_finished_sq_ft: 0,
        basement_unfinished_sq_ft: 0,
      }
    );
    const building_size =
      total.gross_living_sq_ft +
      total.basement_finished_sq_ft +
      total.basement_unfinished_sq_ft;
    const zonings = values.zonings.map(
      (ele: {
        gross_living_sq_ft: string;
        basement_finished_sq_ft: string;
        basement_unfinished_sq_ft: string;
        zone: string;
        sub_zone: string;
        weight_sf: string;
        sub_zone_custom: string;
      }) => {
        return {
          gross_living_sq_ft: parseFloat(
            ele.gross_living_sq_ft.replace(/,/g, '')
          ),
          basement_finished_sq_ft: parseFloat(
            ele.basement_finished_sq_ft.replace(/,/g, '')
          ),
          basement_unfinished_sq_ft: parseFloat(
            ele.basement_unfinished_sq_ft.replace(/,/g, '')
          ),
          total_sq_ft:
            parseFloat(ele.gross_living_sq_ft.replace(/,/g, '')) +
            parseFloat(ele.basement_finished_sq_ft.replace(/,/g, '')) +
            parseFloat(ele.basement_unfinished_sq_ft.replace(/,/g, '')),
          zone: ele.zone,
          sub_zone: ele.sub_zone,
          sub_zone_custom: ele.sub_zone_custom,
          weight_sf: parseFloat(ele.weight_sf.replace(/,/g, '')),
        };
      }
    );

    mutate(
      {
        property_image_url: values.property_image_url,
        street_address: values.street_address,
        street_suite: values.street_suite,
        city: values.city,
        county: 'Suffolk County',
        state: stateCode ? stateCode.toLocaleLowerCase() : '',
        zipcode: values.zipcode,
        map_pin_lat: values.geometry.lat.toString(),
        map_pin_lng: values.geometry.lng.toString(),
        map_pin_zoom:
          localStorage.getItem(
            ResidentialComponentHeaderEnum.MAP_ZOOM_RESIDENTIAL
          ) ?? '',
        latitude: values.geometry.lat.toString(),
        longitude: values.geometry.lng.toString(),
        summary: values.summary,
        zonings: zonings,
        building_size: building_size,
        land_size: parseFloat(values.land_size.replace(/,/g, '')),
        land_dimension: values.land_dimension,
        lot_shape_custom: values.lot_shape_custom,
        topography: values.topography,
        lot_shape: values.lot_shape,
        frontage: values.frontage,
        year_built: values.year_built,
        year_remodeled: values.year_remodeled,
        condition: values.condition,
        utilities_select: values.utilities_select,
        zoning_type: values.zoning_type,
        basement: values.basement,
        offeror_type: values.offeror_type ? values.offeror_type : '',
        offeror_id: Number(values.offeror_id) ? values.offeror_id : null,
        acquirer_type: values.acquirer_type ? values.acquirer_type : '',
        acquirer_id: Number(values.acquirer_id) ? values.acquirer_id : null,
        exterior: values.exterior,
        roof: values.roof,
        electrical: values.electrical,
        plumbing: values.plumbing,
        heating_cooling: values.heating_cooling,
        windows: values.windows,
        bedrooms: values.bedrooms,
        bathrooms: values.bathrooms,
        garage: values.garage,
        fencing: values.fencing,
        fireplace: values.fireplace,
        additional_amenities: values.additional_amenities,
        other_amenities: values.other_amenities,
        price_square_foot: setPriceSquareFootResidential(values, building_size),
        sale_price: parseFloat(
          (values.sale_price as string)?.replace(/[$,]/g, '')
        ),
        date_sold: values.date_sold === 'NaN/NaN/NaN' ? '' : values.date_sold,
        sale_status: values.sale_status,
        list_price: listPriceValue,
        date_list: values.date_list === 'NaN/NaN/NaN' ? null : values.date_list,
        days_on_market: values.days_on_market ? values.days_on_market : null,
        total_concessions: totalConcessionValue,
        private_comp: values.private_comp,
        topography_custom: values.topograhpy_custom,
        frontage_custom: values.frontage_custom,
        condition_custom: values.condition_custom,
        utilities_select_custom: values.utilities_select_custom,
        fireplace_custom: values.fireplace_custom,
        roof_custom: values.roof_custom,
        fencing_custom: values.fencing_custom,
        basement_custom: values.basement_custom,
        exterior_custom: values.exterior_custom,
        electrical_custom: values.electrical_custom,
        plumbing_custom: values.plumbing_custom,
        heating_cooling_custom: values.heating_cooling_custom,
        windows_custom: values.windows_custom,
        garage_custom: values.garage_custom,
        bedrooms_custom: values.bedrooms_custom,
        bathrooms_custom: values.bathrooms_custom,
        comp_link: location.pathname.includes('residential/sales/create-comp')
          ? ResidentialComponentHeaderEnum.TRUE
          : ResidentialComponentHeaderEnum.FALSE,
      },
      {
        onSuccess: (res) => {
          toast(res.data.message);

          const isSalesPath = location.pathname.includes(
            '/residential/sales/create-comp'
          );
          const isCostPath = location.pathname.includes(
            '/residential/cost/create-comp'
          );

          if (isSalesPath || isCostPath) {
            setNewlyCreatedComp(res.data.data);
          } else {
            navigate('/res_comps');
          }
        },
      }
    );
  };
  const passBoolean = (event: boolean) => {
    setSetDataRequited(event);
  };
  const allSections = [
    {
      name: ResidentialComponentHeaderEnum.LOCATION_COMPONENT,
      component: (
        <Broker setDataRequited={setDataRequited} updateData={undefined} />
      ),
    },
    {
      name: ResidentialComponentHeaderEnum.PROPERTY_COMPONENT,
      component: (
        <Property setDataRequited={setDataRequited} updateData={undefined} />
      ),
    },
    {
      name: ResidentialComponentHeaderEnum.AMENITIES_COMPONENT,
      component: <Amenities updateData={undefined} />,
    },
    {
      name: ResidentialComponentHeaderEnum.TRANSACTION_COMPONENT,
      component: (
        <Transaction
          setDataRequited={setDataRequited}
          passBoolean={passBoolean}
          newlyCreatedComp={newlyCreatedComp}
        />
      ),
    },
  ];

  return (
    <SidebarContainer sx={{ marginTop: '15px' }}>
      <Formik
        initialValues={{
          property_image_url: '',
          street_address: '',
          street_suite: '',
          city: '',
          county: '',
          state: '',
          zipcode: '',
          map_pin_lat: '',
          map_pin_lng: '',
          map_pin_zoom: localStorage.getItem('mapZoomResidential') ?? '',
          latitude: '',
          longitude: '',
          summary: '',
          zonings: [
            {
              zone: '',
              sub_zone: '',
              gross_living_sq_ft: '',
              basement_finished_sq_ft: '',
              basement_unfinished_sq_ft: '',
              weight_sf: '',
              total_sq_ft: '',
              id: '',
              sub_zone_custom: '',
            },
          ],
          building_size: '',
          land_size: '',
          land_dimension: ResidentialComponentHeaderEnum.SF,
          topography: '',
          price_square_foot: 0,
          lot_shape: '',
          frontage: '',
          year_built: '',
          year_remodeled: '',
          condition: '',
          utilities_select: '',
          zoning_type: '',
          basement: '',
          offeror_type: ResidentialComponentHeaderEnum.SELECT,
          offeror_id: '',
          acquirer_type: ResidentialComponentHeaderEnum.SELECT,
          acquirer_id: '',
          exterior: '',
          roof: '',
          electrical: '',
          plumbing: '',
          heating_cooling: '',
          windows: '',
          bedrooms: ResidentialComponentHeaderEnum.STUDIO,
          bathrooms: '0',
          garage: ResidentialComponentHeaderEnum.NONE,
          fencing: ResidentialComponentHeaderEnum.ALUMINIUM,
          fireplace: '0',
          additional_amenities: [],
          other_amenities: '',
          sale_price: '',
          date_sold: '',
          sale_status: ResidentialComponentHeaderEnum.CLOSED,
          list_price: '',
          date_list: '',
          days_on_market: '',
          total_concessions: '',
          private_comp: 0,
          topography_custom: '',
          lot_shape_custom: '',
          frontage_custom: '',
          condition_custom: '',
          utilities_select_custom: '',
          fireplace_custom: '',
          roof_custom: '',
          fencing_custom: '',
          basement_custom: '',
          exterior_custom: '',
          electrical_custom: '',
          plumbing_custom: '',
          heating_cooling_custom: '',
          windows_custom: '',
          garage_custom: '',
          bedrooms_custom: '',
          bathrooms_custom: '',
          geometry: {
            latitude: '',
            longitude: '',
          },
        }}
        validationSchema={residentialCreateCompsValidation}
        onSubmit={handleSubmit}
      >
        {() => {
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
                  <Broker
                    setDataRequited={setDataRequited}
                    updateData={undefined}
                  />,
                  <Property
                    setDataRequited={setDataRequited}
                    updateData={undefined}
                  />,
                  <Amenities updateData={undefined} />,
                  <Transaction
                    setDataRequited={setDataRequited}
                    passBoolean={passBoolean}
                    newlyCreatedComp={newlyCreatedComp}
                  />,
                ].map((item, i) => {
                  return item ? (
                    <section className="lg:pl-12 lg:pr-20 px-4" key={i + 1}>
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

export default ResidentialSidebar;
