import { useGet } from '@/hook/useGet';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { HeaderEnum } from './ENUM/headerEnum';

const ReportHeader = () => {
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
  console.log(data, activeButton);

  // const { logout } = useContext(AuthContext);

  useEffect(() => {
    const location = window.location.href;
    const url = new URL(document.URL);
    const originUrl = url.origin;
    console.log(originUrl, 'originurlll');
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
  }, [compsText, check]);

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
    } else if (location.pathname === '/comps') {
      localStorage.setItem('activeType', 'building_with_land');
    } else if (location.pathname === '/land_comps') {
      localStorage.setItem('activeType', 'land_only');
    }
  }, [location.pathname]);

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
  }, []);

  // handle click for rvaluation

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

  useEffect(() => {
    refetch();
  }, [refetch, compsText]);

  return <></>;
};
export default ReportHeader;
