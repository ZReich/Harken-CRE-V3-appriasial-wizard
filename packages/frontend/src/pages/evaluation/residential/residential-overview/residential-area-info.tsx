
import { Box, Grid, Typography, Tooltip, Button } from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TextEditor from '@/components/styles/text-editor';
import upImage from '../../../../images/up.svg';
import downImage from '../../../../images/down.svg';
import leftRightOuter from '../../../../images/left-right-outer.png'
import { useMutate, RequestType } from '@/hook/useMutate';
import { useGet } from '@/hook/useGet';
import ResidentialMenuOptions from '../../set-up/residential-menu-option';
import CommonButton from '@/components/elements/button/Button';
import { EvaluationEnum } from '../../set-up/evaluation-setup-enums';
import axios from 'axios';
import { Icons } from '@/components/icons';
import { usa_state } from '@/pages/comps/comp-form/fakeJson';
import { toast } from 'react-toastify';
import { findNextRoute1 } from '../../overview/utils/residential-navigation';
import loadingImage from '../../../../images/loading.png';
import { ResidentialOverviewEnum } from './residential-overview-enum';
interface SelectedImages {
  [key: string]: string;
}

export const ResidentialAreaInfo: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [cityInfo, setCityInfo] = useState<string>('');
  const [countyInfo, setCountyInfo] = useState<string>('');
  const [loader, setLoader] = useState(false);
  const id = searchParams.get('id');
  const navigate = useNavigate();

  const [selectedImages, setSelectedImages] = useState<SelectedImages>({
    Sales: upImage,
    Vacancy: upImage,
    'Net Absorption': upImage,
    Construction: upImage,
    'Lease rates': upImage,
  });

  const [, setShowError] = useState(false);
  const [directions, setDirections] = useState({
    Sales: ResidentialOverviewEnum.UP,
    Vacancy: ResidentialOverviewEnum.UP,
    'Net Absorption': ResidentialOverviewEnum.UP,
    Construction: ResidentialOverviewEnum.UP,
    'Lease rates': ResidentialOverviewEnum.UP,
  });
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 100);
    };

    window.addEventListener(ResidentialOverviewEnum.SCROLL, handleScroll);
    return () => window.removeEventListener(ResidentialOverviewEnum.SCROLL, handleScroll);
  }, []);
  const areaInfoMutation = useMutate<any, any>({
    queryKey: `res-evaluations`,
    endPoint: `/res-evaluations/update-area-info/${id}`,
    requestType: RequestType.POST,
  });
  const { mutateAsync } = useMutate<ResponseType, any>({
    queryKey: 'res-evaluations/update-position',
    endPoint: `res-evaluations/update-position/${id}`,
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

  const { data: areaInfoData } = useGet<any>({
    queryKey: `areaInfo`,
    endPoint: `/res-evaluations/get-area-info/${id}`,
    config: { refetchOnWindowFocus: false },
  });

  const { data: appraisalData } = useGet<any>({
    queryKey: 'res-evaluations/get',
    endPoint: `/res-evaluations/get/${id}`,
    config: { refetchOnWindowFocus: false },
  });
  useEffect(() => {
    const fetchWikipediaData = async (searchString: string) => {
      try {
        const response = await axios.post('/get-wikipedia-info', {
          string: searchString,
        });

        return response.data.data.data;
      } catch (error) {
        console.error('Error fetching Wikipedia data:', error);
        return '';
      }
    };
    const usaStateOptions = Object.entries(usa_state[0]).map(
      ([value, label]) => ({
        value,
        label,
      })
    );

    const fetchCityAndCountyInfo = async () => {
      if (areaInfoData && appraisalData) {
        if (areaInfoData.data.data.areaInfo.length === 0) {
          const { city, county, state } = appraisalData.data.data || {};
          const fullState =
            usaStateOptions.find((option) => option.value === state)?.label ||
            state;

          if (city && fullState) {
            const citySearchString = `${city}, ${fullState}`;
            const cityData = await fetchWikipediaData(citySearchString);
            setCityInfo(cityData);
          }

          if (county && fullState) {
            const countySearchString = `${county}, ${fullState}`;
            const countyData = await fetchWikipediaData(countySearchString);
            setCountyInfo(countyData);
          }
        } else {
          const areaInfo = areaInfoData.data.data.areaInfo;
          const sales = areaInfo.find(
            (item: any) => item.name === ResidentialOverviewEnum.PROPERTY_SUMMARY_SALES_ARROW
          );
          const vacancy = areaInfo.find(
            (item: any) => item.name === ResidentialOverviewEnum.PROPERTY_SUMMARY_VACANCY_ARROW
          );
          const netAbsorption = areaInfo.find(
            (item: any) => item.name === ResidentialOverviewEnum.PROPERTY_SUMMARY_NET_ABSORPTION_ARROW
          );
          const construction = areaInfo.find(
            (item: any) => item.name === ResidentialOverviewEnum.PROPERTY_SUMMARY_CONSTRUCTION_ARROW
          );
          const leaseRates = areaInfo.find(
            (item: any) => item.name === ResidentialOverviewEnum.PROPERTY_SUMMARY_LEASE_RATES_ARROW
          );

          setCityInfo(
            areaInfo.find((item: any) => item.name === ResidentialOverviewEnum.CITY_INFO)?.value || ''
          );
          setCountyInfo(
            areaInfo.find((item: any) => item.name === ResidentialOverviewEnum.COUNTY_INFO)?.value ||
            ''
          );

          const arrowImages: {
            [key in ResidentialOverviewEnum.UP | ResidentialOverviewEnum.DOWN | ResidentialOverviewEnum.EVEN_FLAT]: string;
          } = {
            up: upImage,
            down: downImage,
            even_flat: leftRightOuter,
          };

          setSelectedImages({
            Sales:
              arrowImages[sales?.value as ResidentialOverviewEnum.UP | ResidentialOverviewEnum.DOWN | ResidentialOverviewEnum.EVEN_FLAT] ||
              arrowImages[ResidentialOverviewEnum.UP],
            Vacancy:
              arrowImages[vacancy?.value as ResidentialOverviewEnum.UP | ResidentialOverviewEnum.DOWN | ResidentialOverviewEnum.EVEN_FLAT] ||
              arrowImages[ResidentialOverviewEnum.UP],
            'Net Absorption':
              arrowImages[
              netAbsorption?.value as ResidentialOverviewEnum.UP | ResidentialOverviewEnum.DOWN | ResidentialOverviewEnum.EVEN_FLAT
              ] || arrowImages[ResidentialOverviewEnum.UP],
            Construction:
              arrowImages[construction?.value as ResidentialOverviewEnum.UP | ResidentialOverviewEnum.DOWN | ResidentialOverviewEnum.EVEN_FLAT] ||
              arrowImages[ResidentialOverviewEnum.UP],
            'Lease rates':
              arrowImages[leaseRates?.value as ResidentialOverviewEnum.UP | ResidentialOverviewEnum.DOWN | ResidentialOverviewEnum.EVEN_FLAT] ||
              arrowImages[ResidentialOverviewEnum.UP],
          });

          setDirections({
            Sales: sales?.value || ResidentialOverviewEnum.UP,
            Vacancy: vacancy?.value || ResidentialOverviewEnum.UP,
            'Net Absorption': netAbsorption?.value || ResidentialOverviewEnum.UP,
            Construction: construction?.value || ResidentialOverviewEnum.UP,
            'Lease rates': leaseRates?.value || ResidentialOverviewEnum.UP,
          });
        }
      }
    };

    fetchCityAndCountyInfo();
  }, [areaInfoData, appraisalData]);

  const handleArrowImageClick = (
    label: string,
    image: string,
    direction: string
  ) => {
    setSelectedImages((prevImages) => ({
      ...prevImages,
      [label]: image,
    }));
    setDirections((prevDirections) => ({
      ...prevDirections,
      [label]: direction,
    }));
  };
  // handlesubmit for update the area-info data

  const handleSubmit = async () => {
    setLoader(true);
    const data = {
      city_info: cityInfo,
      county_info: countyInfo,
      property_summary_sales_arrow: directions.Sales || ResidentialOverviewEnum.UP,
      property_summary_vacancy_arrow: directions.Vacancy || ResidentialOverviewEnum.UP,
      property_summary_net_absorption_arrow:
        directions[ResidentialOverviewEnum.NET_ABSORPTION] || ResidentialOverviewEnum.UP,
      property_summary_construction_arrow: directions.Construction || ResidentialOverviewEnum.UP,
      property_summary_lease_rates_arrow: directions[ResidentialOverviewEnum.LEASE_RATES] || ResidentialOverviewEnum.UP,
    };

    try {
      await areaInfoMutation.mutateAsync(data);
      setLoader(false);
      toast(ResidentialOverviewEnum.AREA_INFO_SAVED_SUCCESSFULLY);
      const scenarios = appraisalData?.data?.data?.res_evaluation_scenarios || [];
      const nextRoute = findNextRoute1(scenarios, id);
      navigate(nextRoute);
    } catch (error) {
      setShowError(true);
    }
  };

  const handleCityInfoChange = (content: string) => {
    setCityInfo(content.slice(0, 1200));
  };
  const handleCountyInfoChange = (content: string) => {
    setCountyInfo(content.slice(0, 1200));
  };

  const renderTooltipContent = (label: string) => (
    <Box sx={{ display: 'flex', gap: 1 }}>
      {[
        { icon: upImage, direction: 'up' },
        { icon: downImage, direction: 'down' },
        { icon: leftRightOuter, direction: 'even_flat' },
      ].map(({ icon, direction }, index) => (
        <Box
          key={index}
          sx={{
            width: 40,
            height: 40,
            backgroundColor: 'black',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          onClick={() => handleArrowImageClick(label, icon, direction)}
        >
          <img
            src={icon}
            alt={`Icon-${direction}`}
            style={{ width: 20, height: 20, filter: 'invert(1)' }}
          />
        </Box>
      ))}
    </Box>
  );
  if (loader) {
    return (
      <>
        <div className="img-update-loader">
          <img src={loadingImage} />
        </div>
      </>
    );
  }

  return (
    <div
      className="px-2"
      style={{ width: '100%', paddingBottom: '100px', marginBottom: '20px' }}
    >
      <ResidentialMenuOptions>
        <div className="flex items-center justify-between h-[50px] w-[100%] xl:pl-[40px] border-0 border-b border-[#eee] border-solid xl:pr-[70px] px-[15px] map-header-sticky">
          <Typography
            variant="h1"
            component="h2"
            className="text-xl font-bold uppercase"
          >
            {ResidentialOverviewEnum.AREA_INFO}
          </Typography>
        </div>
        <Box className="mt-5 xl:px-[50px] px-[15px]">
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <label className="text-customGray text-xs">
                {ResidentialOverviewEnum.CITY_INFO_HEADER}
              </label>
              <TextEditor
                name="cityInfo"
                editorContent={cityInfo}
                editorData={handleCityInfoChange}
              />
              <Typography variant="caption" color={cityInfo.length > 1200 ? 'error' : 'textSecondary'}>
                {cityInfo.length}/{ResidentialOverviewEnum.MAX_CHARACTERS}
              </Typography>
            </Grid>
            <Grid item xs={12} className="mt-[50px]">
              <label className="text-customGray text-xs">
                {ResidentialOverviewEnum.COUNTY_INFO_HEADER}
              </label>
              <TextEditor
                name="countyInfo"
                editorContent={countyInfo}
                editorData={handleCountyInfoChange}
              />
              <Typography variant="caption" color={countyInfo.length > 1200 ? 'error' : 'textSecondary'}>
                {countyInfo.length}/{ResidentialOverviewEnum.MAX_CHARACTERS}
              </Typography>
            </Grid>
            <Grid item xs={12} className="mt-[50px]">
              <Typography
                variant="h4"
                component="h4"
                className="text-lg font-montserrat font-bold py-5"
                style={{ fontFamily: 'montserrat-normal' }}
              >
                {ResidentialOverviewEnum.MARKET_TRENDS}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  p: 1,
                  m: 1,
                  gap: 5,
                  borderRadius: 1,
                }}
              >
                {[
                  ResidentialOverviewEnum.SALES,
                  ResidentialOverviewEnum.VACANCY,
                  ResidentialOverviewEnum.NET_ABSORPTION,
                  ResidentialOverviewEnum.CONSTRUCTION,
                  ResidentialOverviewEnum.LEASE_RATES,
                ].map((label, index) => (
                  <Tooltip
                    key={index}
                    title={renderTooltipContent(label)}
                    placement="bottom"
                    arrow
                    componentsProps={{
                      tooltip: {
                        sx: {
                          backgroundColor: 'transparent',
                          boxShadow: 'none',
                          padding: 0,
                          margin: 0,
                        },
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                    >
                      <img
                        src={selectedImages[label]}
                        alt={label}
                        style={{ width: 60, height: 50 }}
                      />
                      {label}
                    </Box>
                  </Tooltip>
                ))}
              </Box>
            </Grid>
          </Grid>
          <div className="flex gap-3 justify-center items-center fixed inset-x-0 bottom-0 bg-white py-5 z-10">
            <Button
              variant="contained"
              color="primary"
              size="small"
              className="appraisal-previous-button text-xs !p-0 text-white font-medium h-[38px]"
              onClick={() => navigate(`/residential/evaluation-aerialmap?id=${id}`)}
            >
              <Icons.ArrowBackIcon className="cursor-pointer text-sm" />
            </Button>
            <CommonButton
              variant="contained"
              color="primary"
              type="submit"
              onClick={handleSubmit}
              style={{
                fontSize: '14px',
                width: '300px',
              }}
            >
              {EvaluationEnum.SAVE_AND_CONTINUE}
              <Icons.ArrowForwardIcon className="cursor-pointer text-sm" />
            </CommonButton>
            {showScrollTop && (
              <a
                href="#harken"
                id="backToTop"
              >
                &#8593;
              </a>
            )}
          </div>
        </Box>
      </ResidentialMenuOptions>
    </div>
  );
};
export default ResidentialAreaInfo;



