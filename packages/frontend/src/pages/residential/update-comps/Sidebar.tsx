import React, { useState, useEffect } from 'react';
import { List, ListItem } from '@mui/material';
import { styled } from '@mui/system';
import Broker from '../Broker';
import { Property } from '../create-comp/Property';
import { Formik, Form } from 'formik';
import { useMutate, RequestType } from '@/hook/useMutate';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import { ResponseType } from '@/components/interface/response-type';
import { Amenities } from '../create-comp/Amenities';
import { Transaction } from '../create-comp/Transaction';
import { residentialCreateCompsValidation } from '@/utils/residentialCreateCompSchema';
import { useGet } from '@/hook/useGet';
import { useParams } from 'react-router-dom';
import { UsaStateCodes } from '@/utils/usaState';
import { setPriceSquareFootResidential } from '@/utils/setPriceSquareFootResidential';
import loadingImage from '../../../images/loading.png';
import { ResidentialComponentHeaderEnum } from '../enum/ResidentialEnum';
const SidebarContainer = styled('div')({
  display: 'flex',
});

export enum Alignments {
  SALES = ResidentialComponentHeaderEnum.SALES,
  LEASES = ResidentialComponentHeaderEnum.LEASES,
}

const ResidentialUpdateSidebar: React.FC = () => {
  const [updateData, setUpdateData] = React.useState<any[]>([]);
  const { appraisalId, compId } = useParams();
  const { id } = useParams();
  const navigate = useNavigate();
  const { mutate } = useMutate<ResponseType, any>({
    queryKey: 'resComps/update',
    endPoint: `resComps/update/${id}`,
    requestType: RequestType.PATCH,
  });
  const [activeItem, setActiveItem] = useState<number | null>(null);
  const [setDataRequited, setSetDataRequited] = useState(false);
  const [loader, setLoader] = useState(false);
  const location = useLocation();
  const { data, refetch, isLoading } = useGet<any>({
    queryKey: 'all',
    endPoint: `resComps/get/${id}`,
    config: { refetchOnWindowFocus: false },
  });

  useEffect(() => {
    setUpdateData(data?.data?.data as any);
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
    if (!values.city || values.city.trim() === '') {
      setLoader(false);
      return;
    }
    setLoader(true);
    const stateCode = Object.keys(UsaStateCodes).find(
      (key) => UsaStateCodes[key] === values.state
    );
    const building = values.zonings.map(
      (ele: {
        gross_living_sq_ft: any;
        basement_finished_sq_ft: any;
        basement_unfinished_sq_ft: any;
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

    const inputDate1 = values.date_sold;
    const date = new Date(inputDate1);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const formattedDate = `${month}/${day}/${year}`;

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
        map_pin_zoom: localStorage.getItem(
          ResidentialComponentHeaderEnum.MAP_ZOOM_RESIDENTIAL
        ),
        latitude: values.geometry.lat.toString(),
        longitude: values.geometry.lng.toString(),
        summary: values.summary,
        zonings: values.zonings.map((ele: any) => {
          return {
            id: ele.id,
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
        }),
        building_size: building_size,
        land_size: Number(values.land_size.replace(/,/g, '')),
        land_dimension: values.land_dimension,
        topography: values.topography,
        lot_shape: values.lot_shape,
        frontage: values.frontage,
        year_built: values.year_built,
        year_remodeled: values.year_remodeled,
        condition: values.condition,
        utilities_select: values.utilities_select,
        zoning_type: values.zoning_type,
        basement: values.basement,
        offeror_type: values.offeror_type,
        offeror_id: Number(values.offeror_id) ? values.offeror_id : null,
        acquirer_type: values.acquirer_type,
        acquirer_id: Number(values.acquirer_id) ? values.acquirer_id : null,
        exterior: values.exterior,
        price_square_foot: setPriceSquareFootResidential(values, building_size),
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
        sale_price: parseFloat(
          (values.sale_price as string)?.replace(/[$,]/g, '')
        ),
        date_sold: values.date_sold === 'NaN/NaN/NaN' ? '' : formattedDate,
        sale_status: values.sale_status,
        date_list: values.date_list === 'NaN/NaN/NaN' ? null : values.date_list,
        list_price: parseFloat(
          (values.list_price as string)?.replace(/[$,]/g, '')
        ),
        days_on_market: values.days_on_market ? values.days_on_market : 0,
        total_concessions: parseFloat(
          (values.total_concessions as string)?.replace(/[$,]/g, '')
        ),
        private_comp: values.private_comp,
        topography_custom: values.topograhpy_custom,
        lot_shape_custom: values.lot_shape_custom,
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
      },
      {
        onSuccess: (res) => {
          setLoader(false);
          if (
            location.pathname.includes(
              'residential/evaluation/update-cost-comps/'
            )
          ) {
            navigate(
              `/residential/evaluation/cost-approach?id=${appraisalId}&costId=${compId}`
            );
            return;
          }

          if (location.pathname.includes('residential/update-sales-comps')) {
            navigate(
              `/residential/sales-approach?id=${appraisalId}&salesId=${compId}`
            );
            return;
          }

          toast(res.data.message);
          navigate('/res_comps');
        },
      }
    );
  };

  const passBoolean = (event: any) => {
    setSetDataRequited(event);
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
      name: ResidentialComponentHeaderEnum.LOCATION_COMPONENT,
      component: (
        <Broker
          setDataRequited={setDataRequited}
          updateData={updateData}
          key={ResidentialComponentHeaderEnum.BROKER_KEY}
        />
      ),
    },
    {
      name: ResidentialComponentHeaderEnum.PROPERTY_COMPONENT,
      component: (
        <Property
          setDataRequited={setDataRequited}
          updateData={updateData}
          key={ResidentialComponentHeaderEnum.PROPERTY_KEY}
        />
      ),
    },
    {
      name: ResidentialComponentHeaderEnum.AMENITIES_COMPONENT,
      component: (
        <Amenities
          updateData={updateData}
          key={ResidentialComponentHeaderEnum.AMENITIES_KEY}
        />
      ),
    },
    {
      name: ResidentialComponentHeaderEnum.TRANSACTION_COMPONENT,
      component: (
        <Transaction
          updateData={updateData}
          setDataRequited={setDataRequited}
          passBoolean={passBoolean}
          key={ResidentialComponentHeaderEnum.TRANSACTION_KEY}
        />
      ),
    },
  ];

  return (
    <SidebarContainer sx={{ marginTop: '15px' }}>
      <Formik
        initialValues={{
          property_name: '',
          property_image_url: '',
          street_address: '',
          street_suite: '',
          city: '',
          county: '',
          state: '',
          zipcode: '',
          map_pin_lat: '',
          map_pin_lng: '',
          map_pin_zoom: '',
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
              basement_sq_ft: '',
              created: '',
              id: '',
              res_comp_id: '',
              res_evaluation_id: '',
              sub_zone_custom: '',
            },
          ],
          building_size: '',
          land_size: '',
          land_dimension: ResidentialComponentHeaderEnum.SF,
          topography: ResidentialComponentHeaderEnum.SELECT,
          lot_shape: ResidentialComponentHeaderEnum.SELECT,
          frontage: ResidentialComponentHeaderEnum.SELECT,
          year_built: '',
          year_remodeled: '',
          condition: '',
          utilities_select: ResidentialComponentHeaderEnum.SELECT,
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
          price_square_foot: 0,
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
        {() => (
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
            {updateData && (
              <Form className="w-full lg:pl-[230px] pl-[180px]">
                {[
                  <Broker
                    setDataRequited={setDataRequited}
                    updateData={updateData}
                    key={ResidentialComponentHeaderEnum.BROKER_KEY}
                  />,
                  <Property
                    setDataRequited={setDataRequited}
                    updateData={updateData}
                    key={ResidentialComponentHeaderEnum.PROPERTY_KEY}
                  />,
                  <Amenities
                    updateData={updateData}
                    key={ResidentialComponentHeaderEnum.AMENITIES_KEY}
                  />,
                  <Transaction
                    updateData={updateData}
                    setDataRequited={setDataRequited}
                    passBoolean={passBoolean}
                    key={ResidentialComponentHeaderEnum.TRANSACTION_KEY}
                  />,
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
        )}
      </Formik>
    </SidebarContainer>
  );
};

export default ResidentialUpdateSidebar;
