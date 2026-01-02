import { useGet } from '@/hook/useGet';
import ArrowDropDown from '@mui/icons-material/ArrowDropDown';
import { SetStateAction, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import logo from '../../images/logo-white.svg';
import user_image from '../../images/user_image.png';
import { HeaderEnum } from './ENUM/headerEnum';
import { menu } from './headerJson';
// import { useDirty } from '@/pages/evaluation/overview/dirty-state-context';
import {
  Button,
  Dialog,
  DialogActions,
  // DialogContent,
  DialogTitle,
} from '@mui/material';
import React from 'react';
import { useDispatch } from 'react-redux';
import { setId } from '../../utils/userSlice';
import { ThemeToggle } from '../ThemeToggle';
import { useTheme } from '../../context/ThemeContext';

const Header = () => {
  const { resolvedTheme } = useTheme();
  const [openConfirm, setOpenConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // const [nextAction, setNextAction] = useState<(() => void) | null>(null);

  // const { isDirty } = useDirty();

  const handleConfirm = () => {
    setOpenConfirm(false);
    if (pendingAction) {
      pendingAction();
    }
  };

  const handleCancel = () => {
    setOpenConfirm(false);
    setPendingAction(null);
  };

  const [activeButton, setActiveButton] = useState(
    localStorage.getItem('activeType') || HeaderEnum.COMMERCIAL // Default to COMMERCIAL if localStorage is empty
  );
  // const [, setActiveType] = useState('building_with_land');

  const [compsText, setCompsText] = useState<any>('COMPS');
  const { data, refetch } = useGet<any>({
    queryKey: 'header',
    endPoint: 'user/get',
    config: {},
  });
  const { check } = useParams<{ check: any }>();
  const id = data?.data?.data?.user?.id;
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (id) {
      dispatch(setId(id));
    }
  }, [id, dispatch]);
  const apiData = data && data.data && data.data.data && data.data.data.user;
  const fullName = apiData && apiData.first_name + ' ' + apiData.last_name;
  const role = data?.data?.data?.user?.role;
  const accountEdit = data?.data?.data?.user?.account_id;

  const profileImageUrl = apiData && apiData.profile_image_url;
  const location = useLocation();
  // const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  interface ListItemHoverProps {
    text: string;
    onClick?: (e: any) => void;
    style?: any;
  }
  const ListItem = ({ text, onClick, style }: ListItemHoverProps) => (
    <li
      onClick={onClick}
      style={{
        ...style,
        color: style?.color || 'var(--accent-cyan)',
      }}
      className="rounded-full list-none lg:text-md text-sm px-4 cursor-pointer px-2 py-1"
    >
      {text}
    </li>
  );

  const ListItemHover = ({ text, onClick }: ListItemHoverProps) => (
    <li
      className="list-none cursor-pointer font-medium text-sm p-3 ps-5 transition-colors"
      style={{
        color: 'var(--text-secondary)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--accent-cyan-bg)';
        e.currentTarget.style.color = 'var(--accent-cyan)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.color = 'var(--text-secondary)';
      }}
      onClick={onClick}
    >
      {text}
    </li>
  );
  useEffect(() => {
    if (location.pathname === '/evaluation/cost/create-comp') {
      setActiveButton(HeaderEnum.LAND);
    } else if (location.pathname === '/cost-approach') {
      setActiveButton(HeaderEnum.COMMERCIAL);
      localStorage.setItem('activeType', 'building_with_land');
    } else if (location.pathname === '/evaluation/cost-approach') {
      setActiveButton(HeaderEnum.COMMERCIAL);
      localStorage.setItem('activeType', 'building_with_land');
    }
  }, [location.pathname]);

  useEffect(() => {
    const location = window.location.href;
    const url = new URL(document.URL);
    const originUrl = url.origin;
    url.searchParams.delete('id');
    url.searchParams.delete('salesId');
    url.searchParams.delete('IncomeId');
    url.searchParams.delete('leaseId');
    url.searchParams.delete('costId');
    if (
      url.toString() === `${originUrl}/overview` ||
      url.toString() === `${originUrl}/sales-approach` ||
      url.toString() === `${originUrl}/sales-comps-map` ||
      url.toString() === `${originUrl}/appraisal-image` ||
      url.toString() === `${originUrl}/appraisal-photo-sheet` ||
      url.toString() === `${originUrl}/property-boundaries` ||
      url.toString() === `${originUrl}/aerialmap` ||
      url.toString() === `${originUrl}/area-info` ||
      url.toString() === `${originUrl}/appraisal-exhibits` ||
      url.toString() === `${originUrl}/report` ||
      url.toString() === `${originUrl}/income-approch` ||
      url.toString() === `${originUrl}/lease-approach` ||
      url.toString() === `${originUrl}/lease-comps-map` ||
      url.toString() === `${originUrl}/cost-approach` ||
      url.toString() === `${originUrl}/cost-comps-map` ||
      url.toString() === `${originUrl}/cost-approach-improvement`
    ) {
      // localStorage.removeItem('activeButton');
      setCompsText(HeaderEnum.APPRAISAL);
    }
    if (url.toString() === `${originUrl}/update-appraisal-set-up`) {
      // localStorage.removeItem('activeButton');
      setCompsText(HeaderEnum.APPRAISAL);
    }
    const regex = new RegExp(`/\\d+/${check}$`);
    const newUrl1 = location.replace(regex, '');
    const newUrl = location.replace(/\/\d+$/, '');
    if (location === `${originUrl}/appraisal-set-up`) {
      // localStorage.removeItem('activeButton');
      setCompsText(HeaderEnum.APPRAISAL);
    }
    if (
      newUrl1 === `${originUrl}/comps-view` &&
      localStorage.getItem('activeType') === 'building_with_land'
    ) {
      // localStorage.removeItem('activeButton');
      setActiveButton('Commercial');
    }
    if (
      newUrl1 === `${originUrl}/comps-view` &&
      localStorage.getItem('activeType') === 'land_only'
    ) {
      // localStorage.removeItem('activeButton');
      setActiveButton('Land');
    }
    if (newUrl === `${originUrl}/res-comps-view`) {
      // localStorage.removeItem('activeButton');
      setActiveButton('Residential');
    }
    if (
      newUrl === `${originUrl}/update-comps` &&
      localStorage.getItem('activeType') === 'building_with_land'
    ) {
      // localStorage.removeItem('activeButton');
      setActiveButton('Commercial');
    }
    if (
      newUrl === `${originUrl}/update-comps` &&
      localStorage.getItem('activeType') === 'land_only'
    ) {
      // localStorage.removeItem('activeButton');
      setActiveButton('Land');
    }
    if (newUrl === `${originUrl}/residential-update-comps`) {
      // localStorage.removeItem('activeButton');
      setActiveButton('Residential');
    }
    if (location === `${originUrl}/comps`) {
      setCompsText(HeaderEnum.COMPS);
      // localStorage.removeItem('activeButton');
      setActiveButton('Commercial');
    } else if (location === `${originUrl}/appraisal-list`) {
      setCompsText(HeaderEnum.APPRAISAL);
    } else if (location === `${originUrl}/res_comps`) {
      // localStorage.removeItem('activeButton');
      setActiveButton('Residential');
    }
    // Handle create-comp routes
    if (
      location === `${originUrl}/cost/create-comp` ||
      location === `${originUrl}/sales/create-comp` ||
      location === `${originUrl}/lease/create-comp`
    ) {
      setActiveButton('Commercial');
      localStorage.setItem('activeType', 'building_with_land');
    }
  }, [compsText, check]);
  const logOutFunction = () => {
    const token = localStorage.removeItem('accessToken');
    localStorage.removeItem('refresh');
    localStorage.removeItem('activeButton');
    localStorage.removeItem('activeMain');
    localStorage.removeItem('checkStatus');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('property_type');
    localStorage.clear();
    navigate('/login', { replace: true });
    if (token === undefined) {
      localStorage.removeItem('role');
      navigate('/login');
    }
  };

  useEffect(() => {
    const storedActiveButton = localStorage.getItem('activeButton');
    const storedActiveMain = localStorage.getItem('activeMain');
    if (storedActiveButton) {
      setActiveButton(storedActiveButton);
    }
    if (storedActiveMain) {
      // setCompsText(storedActiveMain);
    }
  }, [compsText]);
  useEffect(() => {
    const activeType = localStorage.getItem('activeType');
    if (activeType) {
      setActiveButton(activeType);
    }
  }, []);

  useEffect(() => {
    // Set activeType based on the current URL
    if (location.pathname === '/appraisal-list') {
      localStorage.setItem('activeType', 'building_with_land');
    } else if (location.pathname === '/appraisal-list-land-only') {
      localStorage.setItem('activeType', 'land_only');
    }
    //  else if (location.pathname === '/comps') {
    //   localStorage.setItem('activeType', 'building_with_land');
    // }
    else if (location.pathname === '/land_comps') {
      localStorage.setItem('activeType', 'land_only');
    }
    //  else if(cleanedUrl){
    //   localStorage.setItem('activeType','land_only')
    // }
  }, [location.pathname]);

  const handleClickCommercial = () => {
    localStorage.removeItem('selectedSize');
    localStorage.removeItem('clientId');
    localStorage.removeItem('client_id');

    handleClick('Commercial', 'building_with_land');
    if (compsText === HeaderEnum.APPRAISAL) {
      localStorage.setItem('routeType', 'appraisal-list');
      navigate('/appraisal-list');
    } else if (compsText === HeaderEnum.EVALUATION) {
      localStorage.setItem('routeType', 'evaluation-list');
      navigate('/evaluation-list');
    } else {
      localStorage.setItem('routeType', 'comps');
      localStorage.setItem('activeMain', 'COMPS');
      navigate('/comps');
    }
  };

  const handleClickLand = () => {
    handleClick('Land', 'land_only');
    localStorage.removeItem('clientId');
    localStorage.removeItem('client_id');
    localStorage.removeItem('checkType');
    localStorage.removeItem('approachType');

    if (compsText === HeaderEnum.APPRAISAL) {
      localStorage.setItem('routeType', 'appraisal-list-land-only');
      navigate('/appraisal-list-land-only');
    } else if (compsText === HeaderEnum.EVALUATION) {
      localStorage.setItem('routeType', 'evaluation-list-land-only');
      navigate('/evaluation-list-land-only');
    } else {
      localStorage.setItem('routeType', 'land_comps');
      localStorage.setItem('activeMain', 'COMPS');
      navigate('/land_comps');
    }
  };

  const handleClickResidential = () => {
    localStorage.removeItem('checkType');
    handleClick('Residential', 'residential');
    if (compsText === HeaderEnum.APPRAISAL) {
      localStorage.setItem('routeType', 'approach-residential');
      navigate('/approach-residential');
    } else if (compsText === HeaderEnum.EVALUATION) {
      localStorage.setItem('routeType', 'evaluation-residential');
      navigate('/evaluation/residential-list');
    } else {
      localStorage.setItem('routeType', 'res_comps');
      localStorage.setItem('activeMain', 'COMPS');
      navigate('/res_comps');
    }
  };

  useEffect(() => {
    // Ensure the state reflects localStorage values on refresh
    const storedActiveButton = localStorage.getItem('activeButton');
    const storedCompsText = localStorage.getItem('activeMain');

    if (storedActiveButton) {
      setActiveButton(storedActiveButton);
    }
    if (storedCompsText) {
      setCompsText(storedCompsText);
    }
  }, []);
  useEffect(() => {
    // Get activeType from localStorage and set the active button accordingly
    const storedActiveType = localStorage.getItem('activeType');
    if (storedActiveType === 'building_with_land') {
      setActiveButton(HeaderEnum.COMMERCIAL);
    } else if (storedActiveType === 'land_only') {
      setActiveButton(HeaderEnum.LAND);
    }
  }, [localStorage.getItem('activeType')]);
  const handleClick = (buttonName: string, activeType?: string) => {
    // Remove specified keys from localStorage
    const keysToRemove = [
      'all',
      'cap_rate_max',
      'state',
      'street_address',
      'property_type',
      'price_sf_min',
      'price_sf_max',
      'building_sf_min',
      'building_sf_max',
      'square_footage_min',
      'square_footage_max',
      'start_date',
      'end_date',
      'lease_type',
      'selectedCities',
      'land_sf_max',
      'land_sf_min',
      'street_address_comps',
      'compStatus',
    ];

    keysToRemove.forEach((key) => localStorage.removeItem(key));

    // Set activeButton and activeType
    setActiveButton(buttonName);
    localStorage.setItem('activeButton', buttonName);

    if (activeType) {
      localStorage.setItem('activeType', activeType);
    }
  };

  const handleClickComps = () => {
    setCompsText('COMPS');
    localStorage.setItem('routeType', 'comps');

    localStorage.setItem('activeMain', 'COMPS');
    localStorage.removeItem('clientId');
    localStorage.removeItem('compsLenght');
    localStorage.removeItem('approachType');

    localStorage.removeItem('client_id');

    if (activeButton === 'Commercial') {
      navigate('/comps');
    } else if (activeButton === 'Land') {
      navigate('/land_comps');
    } else if (activeButton === 'Residential') {
      navigate('/res_comps');
    }
  };

  // const proceedToComps = () => {
  //   setCompsText('COMPS');
  //   localStorage.setItem('routeType', 'comps');
  //   localStorage.setItem('activeMain', 'COMPS');

  //   localStorage.removeItem('clientId');
  //   localStorage.removeItem('compsLenght');
  //   localStorage.removeItem('approachType');
  //   localStorage.removeItem('client_id');

  //   if (activeButton === 'Commercial') {
  //     navigate('/comps');
  //   } else if (activeButton === 'Land') {
  //     navigate('/land_comps');
  //   } else if (activeButton === 'Residential') {
  //     navigate('/res_comps');
  //   }
  // };

  const handleClickAppraisal = (e: {
    target: { innerText: SetStateAction<string> };
  }) => {
    const text = e?.target?.innerText;
    const location = window.location.pathname;

    if (compsText !== text) {
      setCompsText(text);

      // Update activeMain in localStorage
      localStorage.setItem('activeMain', HeaderEnum.APPRAISAL);
      localStorage.removeItem('rollType');
      localStorage.removeItem('selectedToggle');
      // localStorage.removeItem('comparisonBasis');

      localStorage.removeItem('compsLenght');
      localStorage.removeItem('compsLengthCost');
      localStorage.removeItem('compsLengthLease');

      localStorage.removeItem('open');
      localStorage.removeItem('clientId');
      localStorage.removeItem('client_id');

      // Remove ResidentialCompsAdvanceFilter values
      localStorage.removeItem('property_type_res');
      localStorage.removeItem('start_date_res');
      localStorage.removeItem('end_date_res');
      localStorage.removeItem('state_res');
      localStorage.removeItem('street_address_res');
      localStorage.removeItem('building_sf_min_res');
      localStorage.removeItem('building_sf_max_res');
      localStorage.removeItem('land_sf_min_res');
      localStorage.removeItem('land_sf_max_res');
      localStorage.removeItem('selectedCities_res');
      localStorage.removeItem('params_res');

      // Remove standard filter keys
      localStorage.removeItem('selectedCities');
      localStorage.removeItem('state');
      localStorage.removeItem('street_address');
      localStorage.removeItem('building_sf_min');
      localStorage.removeItem('building_sf_max');
      localStorage.removeItem('land_sf_min');
      localStorage.removeItem('land_sf_max');
      localStorage.removeItem('start_date');
      localStorage.removeItem('end_date');
      localStorage.removeItem('property_type');
      localStorage.removeItem('compStatus');
      localStorage.removeItem('lease_type');
      localStorage.removeItem('cap_rate_min');
      localStorage.removeItem('cap_rate_max');
      localStorage.removeItem('price_sf_min');
      localStorage.removeItem('price_sf_max');
      localStorage.removeItem('square_footage_min');
      localStorage.removeItem('square_footage_max');
      localStorage.removeItem('all');

      // Navigate based on activeButton
      if (activeButton === HeaderEnum.COMMERCIAL) {
        localStorage.setItem('routeType', 'appraisal-list');
        navigate('/appraisal-list');
      } else if (activeButton === HeaderEnum.LAND) {
        localStorage.setItem('routeType', 'appraisal-list-land-only');
        navigate('/appraisal-list-land-only');
      } else if (activeButton === HeaderEnum.RESIDENTIAL) {
        localStorage.setItem('routeType', 'approach-residential');
        navigate('/approach-residential');
      }
    } else {
      // If compsText matches and activeButton is unchanged, re-check the route
      if (
        activeButton === HeaderEnum.COMMERCIAL &&
        location !== '/appraisal-list'
      ) {
        localStorage.setItem('routeType', 'appraisal-list');
        navigate('/appraisal-list');
      } else if (
        activeButton === HeaderEnum.LAND &&
        location !== '/appraisal-list-land-only'
      ) {
        localStorage.setItem('routeType', 'appraisal-list-land-only');
        navigate('/appraisal-list-land-only');
      } else if (
        activeButton === HeaderEnum.RESIDENTIAL &&
        location !== '/approach-residential'
      ) {
        localStorage.setItem('routeType', 'approach-residential');
        navigate('/approach-residential');
      }
    }
  };
  // handle click for rvaluation
  const handleClickEvaluation = (e: {
    target: { innerText: SetStateAction<string> };
  }) => {
    const text = e?.target?.innerText;
    const location = window.location.pathname;

    if (compsText !== text) {
      setCompsText(text);

      // Update activeMain in localStorage
      localStorage.setItem('activeMain', HeaderEnum.EVALUATION);
      localStorage.removeItem('rollType');
      localStorage.removeItem('selectedToggle');
      localStorage.removeItem('salesValuePerUnit');
      localStorage.removeItem('approachType');

      localStorage.removeItem('landSizeInput');
      localStorage.removeItem('buildingSize');

      // localStorage.removeItem('comparisonBasis');

      localStorage.removeItem('compsLenght');
      localStorage.removeItem('compsLengthCost');
      localStorage.removeItem('compsLengthLease');

      localStorage.removeItem('open');
      localStorage.removeItem('clientId');
      localStorage.removeItem('client_id');

      // Remove ResidentialCompsAdvanceFilter values
      localStorage.removeItem('property_type_res');
      localStorage.removeItem('start_date_res');
      localStorage.removeItem('end_date_res');
      localStorage.removeItem('state_res');
      localStorage.removeItem('street_address_res');
      localStorage.removeItem('building_sf_min_res');
      localStorage.removeItem('building_sf_max_res');
      localStorage.removeItem('land_sf_min_res');
      localStorage.removeItem('land_sf_max_res');
      localStorage.removeItem('selectedCities_res');
      localStorage.removeItem('params_res');

      // Remove standard filter keys
      localStorage.removeItem('selectedCities');
      localStorage.removeItem('state');
      localStorage.removeItem('street_address');
      localStorage.removeItem('building_sf_min');
      localStorage.removeItem('building_sf_max');
      localStorage.removeItem('land_sf_min');
      localStorage.removeItem('land_sf_max');
      localStorage.removeItem('start_date');
      localStorage.removeItem('end_date');
      localStorage.removeItem('property_type');
      localStorage.removeItem('compStatus');
      localStorage.removeItem('lease_type');
      localStorage.removeItem('cap_rate_min');
      localStorage.removeItem('cap_rate_max');
      localStorage.removeItem('price_sf_min');
      localStorage.removeItem('price_sf_max');
      localStorage.removeItem('square_footage_min');
      localStorage.removeItem('square_footage_max');
      localStorage.removeItem('all');

      // Navigate based on activeButton
      if (activeButton === HeaderEnum.COMMERCIAL) {
        localStorage.setItem('routeType', 'evaluation-list');
        navigate('/evaluation-list');
      } else if (activeButton === HeaderEnum.LAND) {
        localStorage.setItem('routeType', 'evaluation-list-land-only');
        navigate('/evaluation-list-land-only');
      } else if (activeButton === HeaderEnum.RESIDENTIAL) {
        localStorage.setItem('routeType', 'evaluation-residential');
        navigate('/evaluation/residential-list');
      }
    } else {
      // If compsText matches and activeButton is unchanged, re-check the route
      if (
        activeButton === HeaderEnum.COMMERCIAL &&
        location !== '/evaluation-list'
      ) {
        localStorage.setItem('routeType', 'evaluation-list');
        navigate('/evaluation-list');
      } else if (
        activeButton === HeaderEnum.LAND &&
        location !== '/evaluation-list-land-only'
      ) {
        localStorage.setItem('routeType', 'evaluation-list-land-only');
        navigate('/evaluation-list-land-only');
      } else if (
        activeButton === HeaderEnum.RESIDENTIAL &&
        location !== '/evaluation/residential-list'
      ) {
        localStorage.setItem('routeType', 'evaluation-residential');
        navigate('/evaluation/residential-list');
      }
    }
  };

  useEffect(() => {
    if (
      location.pathname === '/evaluation-list' ||
      location.pathname === '/evaluation-list-land-only'
    ) {
      localStorage.removeItem('client_id');
      localStorage.removeItem('');
      localStorage.removeItem('salesValuePerUnit');

      localStorage.removeItem('selectedToggle');
      localStorage.removeItem('compsLenght');
      localStorage.removeItem('compsLengthCost');
      localStorage.removeItem('compsLengthLease');
    }
  }, [location.pathname]);

  useEffect(() => {
    if (
      location.pathname === '/evaluation/residential-list' ||
      location.pathname === '/evaluation/residential-list-land-only'
    ) {
      localStorage.removeItem('client_id');
      localStorage.removeItem('');
      localStorage.removeItem('salesValuePerUnit');

      localStorage.removeItem('selectedToggle');
      localStorage.removeItem('compsLenght');
      localStorage.removeItem('compsLengthCost');
      localStorage.removeItem('compsLengthLease');
    }
  }, [location.pathname]);

  const backToComps = () => {
    const activeType = localStorage.getItem('activeType');
    const button =
      activeType === HeaderEnum.BUILDNING_WITH_LAND
        ? HeaderEnum.COMMERCIAL
        : activeType === HeaderEnum.RESIDENTIAL_ACTIVE
          ? HeaderEnum.RESIDENTIAL
          : HeaderEnum.LAND;
    const path =
      activeType === HeaderEnum.BUILDNING_WITH_LAND
        ? HeaderEnum.COMPS_URL
        : activeType === HeaderEnum.RESIDENTIAL_ACTIVE
          ? HeaderEnum.RES_COMPS_URL
          : HeaderEnum.LAND_COMPS_URL;
    setActiveButton(button);
    setCompsText(HeaderEnum.COMPS);
    navigate(path);
  };
  useEffect(() => {
    refetch();
  }, [refetch, compsText]);

  const profileImage = import.meta.env.VITE_S3_URL + profileImageUrl;

  return (
    <>
      <div
        className="flex py-2 header-image lg:gap-3 gap-2"
        style={{
          backgroundColor: 'var(--bg-header)',
        }}
      >
        <div
          className="2xl:pl-12 pl-4 mt-1 flex items-center"
          onClick={backToComps}
        >
          <img src={logo} className="cursor-pointer max-w-full lg:h-[50px]" />
        </div>
        <div className="flex mx-auto w-full items-center lg:gap-4 gap-2 justify-center lg:pl-8 pl-2">
          <div className="flex flex-1 justify-center">
            <ul
              className="flex py-1 rounded-full px-1"
              style={{
                backgroundColor: 'rgba(232, 248, 252, 1)',
              }}
            >
              <li
                className={`list-none lg:text-lg text-base font-normal rounded-full ml-1 px-2 cursor-pointer transition-colors ${
                  activeButton === HeaderEnum.COMMERCIAL
                    ? ''
                    : ''
                }`}
                style={{
                  backgroundColor: activeButton === HeaderEnum.COMMERCIAL ? 'var(--accent-cyan)' : 'transparent',
                  color: activeButton === HeaderEnum.COMMERCIAL ? 'var(--text-inverse)' : 'var(--accent-cyan-muted)',
                  border: activeButton === HeaderEnum.COMMERCIAL ? 'none' : '1px solid var(--border-subtle)',
                }}
                onClick={handleClickCommercial}
              >
                {HeaderEnum.COMMERCIAL}
              </li>

              <li
                className={`list-none lg:text-lg text-base lg:px-3 px-2 font-normal rounded-full ml-1 cursor-pointer transition-colors ${
                  activeButton === HeaderEnum.RESIDENTIAL
                    ? ''
                    : ''
                }`}
                style={{
                  backgroundColor: activeButton === HeaderEnum.RESIDENTIAL ? 'var(--accent-cyan)' : 'transparent',
                  color: activeButton === HeaderEnum.RESIDENTIAL ? 'var(--text-inverse)' : 'var(--accent-cyan-muted)',
                  border: activeButton === HeaderEnum.RESIDENTIAL ? 'none' : '1px solid var(--border-subtle)',
                }}
                onClick={handleClickResidential}
              >
                {HeaderEnum.RESIDENTIAL}
              </li>
              <li
                className={`list-none lg:text-lg text-base lg:px-3 px-2 font-normal rounded-full ml-1 cursor-pointer transition-colors ${
                  localStorage.getItem('activeType') === 'land_only'
                    ? ''
                    : ''
                }`}
                style={{
                  backgroundColor: localStorage.getItem('activeType') === 'land_only' ? 'var(--accent-cyan)' : 'transparent',
                  color: localStorage.getItem('activeType') === 'land_only' ? 'var(--text-inverse)' : 'var(--accent-cyan-muted)',
                  border: localStorage.getItem('activeType') === 'land_only' ? 'none' : '1px solid var(--border-subtle)',
                }}
                onClick={handleClickLand}
              >
                {HeaderEnum.LAND}
              </li>
            </ul>
          </div>
          <Dialog open={openConfirm} onClose={handleCancel}>
            <DialogTitle>Unsaved Changes</DialogTitle>
            {/* <DialogContent>
              You have unsaved changes. Do you want to continue?
            </DialogContent> */}
            <DialogActions>
              <Button onClick={handleCancel} color="primary">
                No
              </Button>
              <Button onClick={handleConfirm} color="primary" autoFocus>
                Yes
              </Button>
            </DialogActions>
          </Dialog>
          {menu.map((item, index) => {
            return (
              <ul className="flex justify-center xl:mr-10" key={index}>
                <ListItem
                  style={{
                    border:
                      compsText === HeaderEnum.COMPS ? '1px solid var(--accent-cyan-muted)' : 'none',
                    color: compsText === HeaderEnum.COMPS ? 'var(--accent-cyan-muted)' : 'var(--text-inverse)',
                  }}
                  onClick={handleClickComps}
                  text={item.comps}
                />
                <ListItem
                  style={{
                    border:
                      compsText === HeaderEnum.APPRAISAL
                        ? '1px solid var(--accent-cyan-muted)'
                        : 'none',
                    color:
                      compsText === HeaderEnum.APPRAISAL ? 'var(--accent-cyan-muted)' : 'var(--text-inverse)',
                  }}
                  onClick={handleClickAppraisal}
                  text={item.evaluations}
                />
                <ListItem
                  style={{
                    border:
                      compsText === HeaderEnum.EVALUATION
                        ? '1px solid var(--accent-cyan-muted)'
                        : 'none',
                    color:
                      compsText === HeaderEnum.EVALUATION ? 'var(--accent-cyan-muted)' : 'var(--text-inverse)',
                  }}
                  onClick={handleClickEvaluation}
                  text={HeaderEnum.EVALUATION}
                />
              </ul>
            );
          })}
        </div>
        <div className="all-true-true py-1 mr-2 flex items-center gap-3">
          {/* Theme Toggle Button */}
          <div className="flex items-center" style={{ marginRight: '8px' }}>
            <ThemeToggle showSystemOption size="medium" />
          </div>
          <ul className="rounded-full all-true m-0">
            <li className="list-none text-lg font-medium flex" style={{ color: 'var(--text-inverse)' }}>
              <div className="pt-1 mr-3">
                <div className="text-sm flex" style={{ color: 'var(--accent-cyan)' }}>
                  <div className="lg:text-base text-sm capitalize cursor-pointer w-full overflow-hidden text-ellipsis whitespace-nowrap lg:mt-2.5 mt-2">
                    {fullName}
                  </div>
                  <div className="lg:mt-2.5 mt-2">
                    <ArrowDropDown />
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <img
                  src={profileImage ? profileImage : user_image}
                  className="lg:w-10 lg:h-10 w-8 h-8 rounded-full cursor-pointer"
                  onError={({ currentTarget }) => {
                    currentTarget.onerror = null;
                    currentTarget.src = user_image;
                  }}
                />
              </div>
            </li>
          </ul>
          {menu.map((item, index) => (
            <ul
              className="text-base rounded-sm shadow-md w-[300px] absolute top-14 right-2 shadow-lg p-0 all-fail"
              style={{
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-primary)',
              }}
              key={index}
            >
              <ListItemHover
                text={item.my_profile}
                onClick={() => {
                  // localStorage.removeItem('activeButton');
                  setCompsText('');
                  navigate(`/user/edit/${id}`);
                }}
              />
              {role === 1 ? (
                <ListItemHover
                  onClick={() => {
                    // localStorage.removeItem('activeButton');
                    setCompsText('');
                    navigate('/accounts');
                  }}
                  text={item.accounts}
                />
              ) : role === 3 ? (
                <ListItemHover
                  onClick={() => {
                    // localStorage.removeItem('activeButton');
                    setCompsText('');
                    navigate(`/account-edit/${accountEdit}`);
                  }}
                  text={item.accountsSetting}
                />
              ) : null}

              <ListItemHover
                onClick={() => {
                  // localStorage.removeItem('activeButton');
                  setCompsText('');
                  navigate('/template-list');
                }}
                text={item.templates}
              />

              <ListItemHover
                onClick={() => {
                  // localStorage.removeItem('activeButton');
                  setCompsText('');
                  navigate('/clients-list');
                }}
                text={item.clients}
              />

              {/* <ListItemHover text={item.users} />
              <ListItemHover text={item.settings} /> */}
              <ListItemHover
                onClick={() => logOutFunction()}
                text={item.logout}
              />
            </ul>
          ))}
        </div>
      </div>
    </>
  );
};
export default Header;
