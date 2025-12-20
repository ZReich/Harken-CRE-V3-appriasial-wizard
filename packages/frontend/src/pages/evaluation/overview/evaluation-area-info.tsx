import { Box, Grid, Typography, Tooltip, Button } from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TextEditor from '@/components/styles/text-editor';
import upImage from '../../../images/up.svg';
import downImage from '../../../images/down.svg';
import leftRightOuter from '../../../images/left-right-outer.png';
import { useMutate, RequestType } from '../../../hook/useMutate';
import { useGet } from '@/hook/useGet';
import EvaluationMenuOptions from '../set-up/evaluation-menu-options';
import CommonButton from '@/components/elements/button/Button';
import { EvaluationEnum } from '../set-up/evaluation-setup-enums';
// import { EvaluationEnum } from '../set-up/setUpEnum';
import axios from 'axios';
import { Icons } from '@/components/icons';
import { usa_state } from '@/pages/comps/comp-form/fakeJson';
import { toast } from 'react-toastify';
import { findNextRoute } from './utils/navigation';

interface SelectedImages {
  [key: string]: string;
}

export const EvaluationAreaInfo: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [cityInfo, setCityInfo] = useState<string>('');
  const [countyInfo, setCountyInfo] = useState<string>('');
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
    Sales: 'up',
    Vacancy: 'up',
    'Net Absorption': 'up',
    Construction: 'up',
    'Lease rates': 'up',
  });
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  //  update-area info api
  const areaInfoMutation = useMutate<any, any>({
    queryKey: `evaluations`,
    endPoint: `/evaluations/update-area-info/${id}`,
    requestType: RequestType.POST,
  });
  const { mutateAsync } = useMutate<ResponseType, any>({
    queryKey: 'evaluations/update-position',
    endPoint: `evaluations/update-position/${id}`,
    requestType: RequestType.PATCH,
  });
  // useEffect(() => {
  //   window.scrollTo(0, 0);
  // });

  useEffect(() => {
    const updatePositionWithCurrentUrl = async () => {
      const ApiUrl = window.location.href.replace(window.location.origin, '');
      await mutateAsync({
        position: ApiUrl,
      });
    };
    updatePositionWithCurrentUrl();
  }, [id, mutateAsync]);

  // get area-info data
  const { data: areaInfoData } = useGet<any>({
    queryKey: `areaInfo`,
    endPoint: `/evaluations/get-area-info/${id}`,
    config: { refetchOnWindowFocus: false },
  });

  // get appraisals data
  const { data: appraisalData } = useGet<any>({
    queryKey: 'evaluations/get',
    endPoint: `/evaluations/get/${id}`,
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

          // Map state abbreviation to full name
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
            (item: any) => item.name === 'property_summary_sales_arrow'
          );
          const vacancy = areaInfo.find(
            (item: any) => item.name === 'property_summary_vacancy_arrow'
          );
          const netAbsorption = areaInfo.find(
            (item: any) => item.name === 'property_summary_net_absorption_arrow'
          );
          const construction = areaInfo.find(
            (item: any) => item.name === 'property_summary_construction_arrow'
          );
          const leaseRates = areaInfo.find(
            (item: any) => item.name === 'property_summary_lease_rates_arrow'
          );

          setCityInfo(
            areaInfo.find((item: any) => item.name === 'city_info')?.value || ''
          );
          setCountyInfo(
            areaInfo.find((item: any) => item.name === 'county_info')?.value ||
            ''
          );

          const arrowImages: {
            [key in 'up' | 'down' | 'even_flat']: string;
          } = {
            up: upImage,
            down: downImage,
            even_flat: leftRightOuter,
          };

          setSelectedImages({
            Sales:
              arrowImages[sales?.value as 'up' | 'down' | 'even_flat'] ||
              arrowImages['up'],
            Vacancy:
              arrowImages[vacancy?.value as 'up' | 'down' | 'even_flat'] ||
              arrowImages['up'],
            'Net Absorption':
              arrowImages[
              netAbsorption?.value as 'up' | 'down' | 'even_flat'
              ] || arrowImages['up'],
            Construction:
              arrowImages[construction?.value as 'up' | 'down' | 'even_flat'] ||
              arrowImages['up'],
            'Lease rates':
              arrowImages[leaseRates?.value as 'up' | 'down' | 'even_flat'] ||
              arrowImages['up'],
          });

          setDirections({
            Sales: sales?.value || 'up',
            Vacancy: vacancy?.value || 'up',
            'Net Absorption': netAbsorption?.value || 'up',
            Construction: construction?.value || 'up',
            'Lease rates': leaseRates?.value || 'up',
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
    const data = {
      city_info: cityInfo,
      county_info: countyInfo,
      property_summary_sales_arrow: directions.Sales || 'up',
      property_summary_vacancy_arrow: directions.Vacancy || 'up',
      property_summary_net_absorption_arrow:
        directions['Net Absorption'] || 'up',
      property_summary_construction_arrow: directions.Construction || 'up',
      property_summary_lease_rates_arrow: directions['Lease rates'] || 'up',
    };

    try {
      await areaInfoMutation.mutateAsync(data);
      toast('Area Info saved successfully!');
      const scenarios = appraisalData?.data?.data?.scenarios || [];
      const nextRoute = findNextRoute(scenarios, id);
      navigate(nextRoute);
    } catch (error) {
      setShowError(true);
    }
  };

  const handleCityInfoChange = (content: string) => {
    setCityInfo(content.slice(0, 1200));
    // if (content.length <= 1207) {
    //   setCityInfo(content);
    // }
  };
  const handleCountyInfoChange = (content: string) => {
    setCountyInfo(content.slice(0, 1200));
    // if (content.length <= 1207) {
    //   setCountyInfo(content);
    // }
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

  return (
    <div
      className="px-2"
      style={{ width: '100%', paddingBottom: '100px', marginBottom: '20px' }}
    >
      <EvaluationMenuOptions>
        <div className="flex items-center justify-between h-[50px] w-[100%] xl:pl-[40px] border-0 border-b border-[#eee] border-solid xl:pr-[70px] px-[15px] map-header-sticky">
          <Typography
            variant="h1"
            component="h2"
            className="text-xl font-bold uppercase"
          >
            AREA INFO
          </Typography>
        </div>
        <Box className="mt-5 xl:px-[50px] px-[15px]">
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <label className="text-customGray text-xs">
                City Info (Only 1200 characters allowed)
              </label>
              <TextEditor
                name="cityInfo"
                editorContent={cityInfo}
                editorData={handleCityInfoChange}
              />
              <Typography variant="caption" color={cityInfo.length > 1200 ? 'error' : 'textSecondary'}>
                {cityInfo.length}/1200 characters
              </Typography>
            </Grid>
            <Grid item xs={12} className="mt-[50px]">
              <label className="text-customGray text-xs">
                County Info (Only 1200 characters allowed)
              </label>
              <TextEditor
                name="countyInfo"
                editorContent={countyInfo}
                editorData={handleCountyInfoChange}
              />
              <Typography variant="caption" color={countyInfo.length > 1200 ? 'error' : 'textSecondary'}>
                {countyInfo.length}/1200 characters
              </Typography>
            </Grid>
            <Grid item xs={12} className="mt-[50px]">
              <Typography
                variant="h4"
                component="h4"
                className="text-lg font-montserrat font-bold py-5"
                style={{ fontFamily: 'montserrat-normal' }}
              >
                MARKET TRENDS
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
                  'Sales',
                  'Vacancy',
                  'Net Absorption',
                  'Construction',
                  'Lease rates',
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
              onClick={() => navigate(`/evaluation-aerialmap?id=${id}`)}
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
      </EvaluationMenuOptions>
    </div>
  );
};
export default EvaluationAreaInfo;

                          