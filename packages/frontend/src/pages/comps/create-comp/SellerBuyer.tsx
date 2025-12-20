import { Button, Grid } from '@mui/material';
import CommonButton from '@/components/elements/button/Button';
import AddIcon from '@mui/icons-material/Add';
import AddNewPerson from './AddNewPerson';
import CompDeleteModal from '@/components/modal/Comp-delete-modal';
import ClearIcon from '@mui/icons-material/Clear';
import React, { ChangeEvent, useEffect, useMemo } from 'react';
import SelectTextField from '@/components/styles/select-input';
import { useGet } from '@/hook/useGet';
import { useFormikContext } from 'formik';
import AddCompany from './AddComapany';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  buyerTypeOptions,
  landLordTypeOptions,
  sellerTyoeOptions,
  tenantTypeOptions,
} from './SelectOption';
import { toast } from 'react-toastify';
import { CreateCompType } from '@/components/interface/create-comp-type';
import { ClientListAllDataType } from '@/components/interface/client-list-data-type';
import { CompanyListDataType } from '@/components/interface/company-list-data-type';
import InfoIcon from '@mui/icons-material/Info';
import { PrivateCompEnum } from '@/pages/residential/enum/ResidentialEnum';
import { SellerBuyierEnum } from '../enum/CompsEnum';
import Tooltip from '@mui/material/Tooltip';

const SellerBuyer = ({
  passData,
  passDataT,

  // values: salesValues,
  newlyCreatedComp,
}: any) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const salesId = searchParams.get('approachId');
  const [modelOpenBuyier, setModalOpenBuyier] = React.useState(false);
  const [modalOpenCompanyBuyier, setModalOpenCompanyBuyier] =
    React.useState(false);
  const [modelOpenSeller, setModalOpenSeller] = React.useState(false);
  const [modalOpenCompanySeller, setModalOpenCompanySeller] =
    React.useState(false);
  const windows: any = window.location.pathname;
  const parts: string[] = windows.split('/');
  const update_comps: string = parts[1];
  const isUpdate =
    update_comps === 'update-comps' || windows.includes('evaluation/update');

  const { setFieldValue, values } = useFormikContext<CreateCompType>();
  console.log(values.comparison_basis, 'comparison_basiscomparison_basis');
  const [buyerCompanyData, setBuyerCompanyData] = React.useState<any>();
  const [companyData, setCompanyData] = React.useState<any>();
  const [buyerPersonData, setBuyerPersonData] = React.useState<any>();
  const [personData, setPersonData] = React.useState<any>();

  const [isFieldValuesPopulate, setIsFieldValuesPopulate] =
    React.useState<any>(false);
  const closeCompsModal1 = () => {
    setModalOpenBuyier(false);
    setModalOpenCompanyBuyier(false);
    setModalOpenSeller(false);
    setModalOpenCompanySeller(false);
  };
  const [showScrollTop, setShowScrollTop] = React.useState(false);
  console.log('newlyCreatedComp', newlyCreatedComp);
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const setValidationSelectTag = async () => {
    // For sales/create-comp, use evaluation submit after form validation
    if (location.pathname.includes('sales/create-comp')) {
      if (newlyCreatedComp) {
        await handleEvaluationSubmit();
      } else {
        passData(true);
      }
    }

    // For cost/create-comp, use cost evaluation submit after form validation
    if (location.pathname.includes('cost/create-comp')) {
      if (newlyCreatedComp) {
        await handleCostEvaluationSubmit();
      } else {
        passData(true);
      }
    }

    passData(true);

    // Validate zoning only when comp_type is 'building_with_land'
    const isZoningInvalid =
      localStorage.getItem('activeType') === 'building_with_land' &&
      passDataT.length === 0
        ? // Check if `passDataT` is empty
          // passDataT.comp_type === 'building_with_land' || // Check if `comp_type` is 'land_only'
          //  passDataT.zonings.length===0 ||
          !values.zonings || // Check if `zonings` is null or undefined
          values.zonings.length === 0 || // Check if `zonings` array is empty
          values.zonings.some(
            (zoning: any) =>
              !zoning.zone || // Check if `zone` is empty
              !zoning.sub_zone || // Check if `sub_zone` is empty
              !zoning.sq_ft // Check if `sq_ft` is empty
          )
        : localStorage.getItem('activeType') === 'building_with_land' &&
          passDataT.comp_type === 'building_with_land' &&
          (!values.zonings || // Check if `zonings` is null or undefined
            values.zonings.length === 0 || // Check if `zonings` array is empty
            values.zonings.some(
              (zoning: any) =>
                !zoning.zone || // Check if `zone` is empty
                !zoning.sub_zone || // Check if `sub_zone` is empty
                !zoning.sq_ft // Check if `sq_ft` is empty
            ));
    const isZoningInvalid1 =
      localStorage.getItem('activeType') === 'building_with_land' &&
      passDataT.length === 0
        ? // Check if `passDataT` is empty
          // passDataT.comp_type === 'building_with_land' || // Check if `comp_type` is 'land_only'
          //  passDataT.zonings.length===0 ||
          !values.zonings || // Check if `zonings` is null or undefined
          values.zonings.length === 0 || // Check if `zonings` array is empty
          values.zonings.some(
            (zoning: any) =>
              !zoning.zone || // Check if `zone` is empty
              !zoning.sub_zone || // Check if `sub_zone` is empty
              !zoning.unit // Check if `sq_ft` is empty
          )
        : localStorage.getItem('activeType') === 'building_with_land' &&
          passDataT.comp_type === 'building_with_land' &&
          (!values.zonings || // Check if `zonings` is null or undefined
            values.zonings.length === 0 || // Check if `zonings` array is empty
            values.zonings.some(
              (zoning: any) =>
                !zoning.zone || // Check if `zone` is empty
                !zoning.sub_zone || // Check if `sub_zone` is empty
                !zoning.unit // Check if `sq_ft` is empty
            ));
    const isZoningInvalid2 =
      localStorage.getItem('activeType') === 'building_with_land' &&
      passDataT.length === 0
        ? // Check if `passDataT` is empty

          !values.zonings || // Check if `zonings` is null or undefined
          values.zonings.length === 0 || // Check if `zonings` array is empty
          values.zonings.some(
            (zoning: any) =>
              !zoning.zone || // Check if `zone` is empty
              !zoning.sub_zone || // Check if `sub_zone` is empty
              !zoning.bed // Check if `sq_ft` is empty
          )
        : localStorage.getItem('activeType') === 'building_with_land' &&
          passDataT.comp_type === 'building_with_land' &&
          (!values.zonings || // Check if `zonings` is null or undefined
            values.zonings.length === 0 || // Check if `zonings` array is empty
            values.zonings.some(
              (zoning: any) =>
                !zoning.zone || // Check if `zone` is empty
                !zoning.sub_zone || // Check if `sub_zone` is empty
                !zoning.bed // Check if `sq_ft` is empty
            ));

    const zoningValidate =
      values.comparison_basis === 'SF'
        ? isZoningInvalid
        : values.comparison_basis === 'Unit'
          ? isZoningInvalid1
          : isZoningInvalid2;

    // Additional validation for 'land_only' type
    const isLandOnlyInvalid =
      (localStorage.getItem('activeType') === 'land_only' &&
        (!values.land_type ||
          values.land_type === '' ||
          !values.land_size ||
          values.land_size === '')) ||
      (localStorage.getItem('activeType') === 'building_with_land' &&
        passData.comp_type === 'land_only');

    const hasErrors =
      values?.type === 'leases'
        ? values.lease_type === '' ||
          values.lease_rate === '' ||
          values.street_address === '' ||
          values.state === '--Select State--' ||
          values.state === '' ||
          values.state === null ||
          values.city === '' ||
          values.city === null ||
          values.zipcode === '' ||
          values.zipcode === null ||
          values.condition === '' ||
          // values.condition_custom === '' ||
          values.date_sold === '' ||
          // values.business_name === '' ||
          (values.type === 'leases' &&
            values.comp_type === 'land_only' &&
            values.land_size === '') ||
          zoningValidate || // Validate zoning only for leases with 'building_with_land'
          isLandOnlyInvalid // Validate 'land_only' type fields
        : values.street_address === '' ||
          values.city === '' ||
          values.city === null ||
          values.state === '' ||
          values.state === '--Select State--' ||
          values.state === null ||
          values.zipcode === '' ||
          values.zipcode === null ||
          values.condition === '' ||
          values.sale_price === '' ||
          //  values.condition_custom==='' ||
          values.date_sold === '' ||
          (values.type === 'sales' &&
            values.comp_type === 'land_only' &&
            values.land_size === '') ||
          // values.business_name === '' ||
          zoningValidate || // Validate zoning only for sales with 'building_with_land'
          isLandOnlyInvalid; // Validate 'land_only' type fields

    if (hasErrors) {
      toast.info('Please complete the missing fields', {
        icon: false,
        style: {
          backgroundColor: '#0DA1C7',
          color: 'white',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          width: '320px',
        },
      });
      return; // Prevent further execution if there are errors
    }
  };

  // for evauations
  const salesApproachId =
    searchParams.get('approachId') || searchParams.get('salesId');
  console.log('sakesissssssss', salesId);
  const handleEvaluationSubmit = async () => {
    console.log('handleEvaluationSubmitsaesssss called', newlyCreatedComp);
    if (!newlyCreatedComp) {
      console.log('No comp data available.');
      return;
    }

    // Get stored sales values from localStorage
    const storedSalesValues = localStorage.getItem('salesApproachValues');
    const parsedSalesValues = storedSalesValues
      ? JSON.parse(storedSalesValues)
      : {};

    const updatedComps = [
      {
        ...newlyCreatedComp,
        comp_id: newlyCreatedComp.id,
        expenses:
          parsedSalesValues?.operatingExpenses?.map((exp: any) => ({
            ...exp,
            adj_value: 0,
            comparison_basis: 0,
          })) || [],
        quantitativeAdjustments:
          parsedSalesValues?.salesCompQualitativeAdjustment?.map(
            (exp: any) => ({
              ...exp,
              adj_value: 'similar',
              comparison_basis: 0,
            })
          ) || [],
        comparativeAdjustmentsList:
          parsedSalesValues?.appraisalSpecificAdjustment?.map((exp: any) => ({
            ...exp,
            comparison_value: 0,
            comparison_basis: 0,
          })) || [],
        adjusted_psf: newlyCreatedComp.price_square_foot,
      },
    ];

    console.log('=== NAVIGATION DEBUG ===');
    console.log('Current URL:', location.pathname + location.search);
    console.log('id:', id);
    console.log('salesApproachId:', salesApproachId);
    const navigationUrl = `/evaluation/sales-approach?id=${id}&salesId=${salesApproachId}`;
    console.log('About to navigate to:', navigationUrl);

    navigate(navigationUrl, {
      state: { updatedComps },
    });

    console.log('Navigation command executed');
  };
  console.log(newlyCreatedComp, 'newlyCreatedComp');

  const handleCostEvaluationSubmit = async () => {
    console.log('handleCostEvaluationSubmit called', newlyCreatedComp);
    localStorage.setItem('activeType', 'building_with_land');

    if (!newlyCreatedComp) {
      console.log('No comp data available.');
      return;
    }

    // Extract id and costId from URL params
    const searchParams = new URLSearchParams(location.search);
    const evaluationId = searchParams.get('id');
    const costApproachId =
      searchParams.get('costId') || searchParams.get('approachId');

    console.log('URL params:', { evaluationId, costApproachId });
    console.log('Current location:', location.pathname, location.search);

    // Get stored cost approach values from localStorage
    const storedCostValues = localStorage.getItem('costApproachValues');
    const parsedCostValues = storedCostValues
      ? JSON.parse(storedCostValues)
      : {};

    console.log('Stored cost values:', parsedCostValues);

    const updatedComps = [
      {
        ...newlyCreatedComp,
        comp_id: newlyCreatedComp.id,
        expenses:
          parsedCostValues?.operatingExpenses?.map((exp: any) => ({
            ...exp,
            adj_value: 0,
            comparison_basis: 0,
          })) || [],
        comparativeAdjustmentsList:
          parsedCostValues?.appraisalSpecificAdjustment?.map((exp: any) => ({
            ...exp,
            comparison_value: 0,
            comparison_basis: 0,
          })) || [],
        adjusted_psf: newlyCreatedComp.price_square_foot || 0,
      },
    ];

    console.log('Updated comps:', updatedComps);

    const navigationUrl = `/evaluation/cost-approach?id=${evaluationId}&costId=${costApproachId}`;
    console.log('Navigating to:', navigationUrl);

    try {
      navigate(navigationUrl, {
        state: { updatedComps },
      });
      console.log('Navigation completed');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };
  const leaseApproachId =
    searchParams.get('approachId') || searchParams.get('leaseId');
  const handleLeaseEvaluationSubmit = async () => {
    console.log(
      'EVALUATION handleLeaseEvaluationSubmit called',
      newlyCreatedComp
    );
    if (!newlyCreatedComp) {
      console.log('No comp data available.');
      return;
    }

    // Get stored sales values from localStorage
    const storedSalesValues = localStorage.getItem('leaseApproachValues');
    const parsedSalesValues = storedSalesValues
      ? JSON.parse(storedSalesValues)
      : {};

    const updatedComps = [
      {
        ...newlyCreatedComp,
        comp_id: newlyCreatedComp.id,
        expenses:
          parsedSalesValues?.operatingExpenses?.map((exp: any) => ({
            ...exp,
            adj_value: 0,
            comparison_basis: 0,
          })) || [],
        quantitativeAdjustments:
          parsedSalesValues?.salesCompQualitativeAdjustment?.map(
            (exp: any) => ({
              ...exp,
              adj_value: 'similar',
              comparison_basis: 0,
            })
          ) || [],
        comparativeAdjustmentsList:
          parsedSalesValues?.appraisalSpecificAdjustment?.map((exp: any) => ({
            ...exp,
            comparison_value: 0,
            comparison_basis: 0,
          })) || [],
        adjusted_psf: newlyCreatedComp.price_square_foot,
      },
    ];

    navigate(`/evaluation/lease-approach?id=${id}&leaseId=${leaseApproachId}`, {
      state: { updatedComps },
    });
  };

  const multiFamilyApproachId =
    searchParams.get('evaluationId') || searchParams.get('approachId');
  const handleMultiFamilyEvaluationSubmit = async () => {
    console.log('handleEvaluationSubmit called', newlyCreatedComp);
    if (!newlyCreatedComp) {
      console.log('No comp data available.');
      return;
    }

    // Get stored sales values from localStorage
    const storedSalesValues = localStorage.getItem('multiFamilyApproachValues');
    const parsedSalesValues = storedSalesValues
      ? JSON.parse(storedSalesValues)
      : {};

    const updatedComps = [
      {
        ...newlyCreatedComp,
        comp_id: newlyCreatedComp.id,
        expenses:
          parsedSalesValues?.operatingExpenses?.map((exp: any) => ({
            ...exp,
            adj_value: 0,
            comparison_basis: 0,
          })) || [],

        comparativeAdjustmentsList:
          parsedSalesValues?.appraisalSpecificAdjustment?.map((exp: any) => ({
            ...exp,
            comparison_value: 0,
            comparison_basis: 0,
          })) || [],
        adjusted_psf: newlyCreatedComp.price_square_foot,
      },
    ];

    navigate(
      `/evaluation/multi-family-approach?id=${id}&evaluationId=${multiFamilyApproachId}`,
      {
        state: { updatedComps },
      }
    );
  };
  const capApproachId =
    searchParams.get('capId') || searchParams.get('approachId');
  const handleCapEvaluationSubmit = async () => {
    console.log('handleEvaluationSubmit called', newlyCreatedComp);
    if (!newlyCreatedComp) {
      console.log('No comp data available.');
      return;
    }

    // Get stored sales values from localStorage
    const storedSalesValues = localStorage.getItem('capApproachValues');
    const parsedSalesValues = storedSalesValues
      ? JSON.parse(storedSalesValues)
      : {};

    const updatedComps = [
      {
        ...newlyCreatedComp,
        comp_id: newlyCreatedComp.id,

        comparativeAdjustmentsList:
          parsedSalesValues?.appraisalSpecificAdjustment?.map((exp: any) => ({
            ...exp,
            comparison_value: 0,
            comparison_basis: 0,
          })) || [],
        adjusted_psf: newlyCreatedComp.price_square_foot,
      },
    ];

    navigate(`/evaluation/cap-approach?id=${id}&capId=${capApproachId}`, {
      state: { updatedComps },
    });
  };

  // for appraisals

  const handleSalesEvaluationSubmitAppraisal = async () => {
    if (!newlyCreatedComp) {
      console.log('No comp data available.');
      return;
    }

    // Get stored sales values from localStorage
    const storedSalesValues = localStorage.getItem(
      'salesApproachValuesAppraisal'
    );
    const parsedSalesValues = storedSalesValues
      ? JSON.parse(storedSalesValues)
      : {};

    const updatedComps = [
      {
        ...newlyCreatedComp,
        comp_id: newlyCreatedComp.id,
        expenses:
          parsedSalesValues?.operatingExpenses?.map((exp: any) => ({
            ...exp,
            adj_value: 0,
            comparison_basis: 0,
          })) || [],
        quantitativeAdjustments:
          parsedSalesValues?.salesCompQualitativeAdjustment?.map(
            (exp: any) => ({
              ...exp,
              adj_value: 'similar',
              comparison_basis: 0,
            })
          ) || [],
        comparativeAdjustmentsList:
          parsedSalesValues?.appraisalSpecificAdjustment?.map((exp: any) => ({
            ...exp,
            comparison_value: 0,
            comparison_basis: 0,
          })) || [],
        adjusted_psf: newlyCreatedComp.price_square_foot,
      },
    ];

    navigate(`/sales-approach?id=${id}&salesId=${salesId}`, {
      state: { updatedComps },
    });
  };
  const costApproachIdAppraisal =
    searchParams.get('capId') || searchParams.get('approachId');
  const handleSCostEvaluationSubmitAppraisal = async () => {
    console.log('handleEvaluationSubmit called', newlyCreatedComp);
    if (!newlyCreatedComp) {
      console.log('No comp data available.');
      return;
    }

    // Get stored sales values from localStorage
    const storedSalesValues = localStorage.getItem(
      'costApproachValuesAppraisal'
    );
    const parsedSalesValues = storedSalesValues
      ? JSON.parse(storedSalesValues)
      : {};

    const updatedComps = [
      {
        ...newlyCreatedComp,
        comp_id: newlyCreatedComp.id,
        expenses:
          parsedSalesValues?.operatingExpenses?.map((exp: any) => ({
            ...exp,
            adj_value: 0,
            comparison_basis: 0,
          })) || [],

        adjusted_psf: newlyCreatedComp.price_square_foot,
      },
    ];

    navigate(`/cost-approach?id=${id}&costId=${costApproachIdAppraisal}`, {
      state: { updatedComps },
    });
  };
  // for cost appraisal
  const leaseApproachIdAppraisal =
    searchParams.get('leaseId') || searchParams.get('approachId');
  const handleSLeaseEvaluationSubmitAppraisal = async () => {
    console.log(
      'APPRAISAL handleSLeaseEvaluationSubmitAppraisal called',
      newlyCreatedComp
    );
    if (!newlyCreatedComp) {
      console.log('No comp data available.');
      return;
    }

    // Get stored sales values from localStorage
    const storedSalesValues = localStorage.getItem(
      'leaseApproachValuesAppraisal'
    );
    const parsedSalesValues = storedSalesValues
      ? JSON.parse(storedSalesValues)
      : {};

    const updatedComps = [
      {
        ...newlyCreatedComp,
        comp_id: newlyCreatedComp.id,
        expenses:
          parsedSalesValues?.operatingExpenses?.map((exp: any) => ({
            ...exp,
            adj_value: 0,
            comparison_basis: 0,
          })) || [],
        quantitativeAdjustments:
          parsedSalesValues?.salesCompQualitativeAdjustment?.map(
            (exp: any) => ({
              ...exp,
              adj_value: 'similar',
              comparison_basis: 0,
            })
          ) || [],

        adjusted_psf: newlyCreatedComp.price_square_foot,
      },
    ];

    navigate(`/lease-approach?id=${id}&leaseId=${leaseApproachIdAppraisal}`, {
      state: { updatedComps },
    });
  };
  // for residential

  const handleSalesResidentialSubmmit = async () => {
    if (!newlyCreatedComp) {
      console.log('No comp data available.');
      return;
    }

    // Get stored sales values from localStorage
    const storedSalesValues = localStorage.getItem(
      'salesApproachValuesResidential'
    );
    const parsedSalesValues = storedSalesValues
      ? JSON.parse(storedSalesValues)
      : {};

    const updatedComps = [
      {
        ...newlyCreatedComp,
        comp_id: newlyCreatedComp.id,
        expenses:
          parsedSalesValues?.operatingExpenses?.map((exp: any) => ({
            ...exp,
            adj_value: 0,
            comparison_basis: 0,
          })) || [],
        quantitativeAdjustments:
          parsedSalesValues?.salesCompQualitativeAdjustment?.map(
            (exp: any) => ({
              ...exp,
              adj_value: 'similar',
              comparison_basis: 0,
            })
          ) || [],
        comparativeAdjustmentsList:
          parsedSalesValues?.appraisalSpecificAdjustment?.map((exp: any) => ({
            ...exp,
            comparison_value: 0,
            comparison_basis: 0,
          })) || [],
        adjusted_psf: newlyCreatedComp.price_square_foot,
      },
    ];

    navigate(`/residential/sales-approach?id=${id}&salesId=${salesId}`, {
      state: { updatedComps },
    });
  };
  const handleModalBuyier = () => {
    if (values.acquirer_type == 'select') {
      toast.error('Please Select Type First');
      return false;
    }
    if (values.acquirer_type == SellerBuyierEnum.PERSON) {
      setModalOpenBuyier(true);
      setModalOpenCompanyBuyier(false);
    } else {
      setModalOpenCompanyBuyier(true);
      setModalOpenBuyier(false);
    }
  };
  const handleSellerType = (e: ChangeEvent<HTMLInputElement>) => {
    setFieldValue('offeror_type', e.target.value);
  };

  const handleBuyierType = (e: ChangeEvent<HTMLInputElement>) => {
    setFieldValue('acquirer_type', e.target.value);
  };

  const handleOfferId = (e: ChangeEvent<HTMLInputElement>) => {
    setFieldValue('offeror_id', e.target.value);
  };

  const handleOfferIdBuyier = (e: ChangeEvent<HTMLInputElement>) => {
    setFieldValue('acquirer_id', e.target.value);
  };

  const handleModal = () => {
    if (values.offeror_type == 'select') {
      toast.error('Please Select Type First');
      return false;
    }
    if (values.offeror_type == SellerBuyierEnum.PERSON) {
      setModalOpenSeller(true);
      setModalOpenCompanySeller(false);
    } else {
      setModalOpenCompanySeller(true);
      setModalOpenSeller(false);
    }
  };

  const { data: person, refetch: refetch1 } = useGet<ClientListAllDataType>({
    queryKey: 'person-list',
    endPoint: `client/getAll`,
    config: {
      enabled: Boolean(
        (values.offeror_type &&
          values.offeror_type === SellerBuyierEnum.PERSON) ||
          (values.acquirer_type &&
            values.acquirer_type === SellerBuyierEnum.PERSON)
      ),
    },
  });

  const personList = person && person.data && person.data.data;

  const { data: company, refetch } = useGet<CompanyListDataType>({
    queryKey: 'company-list',
    endPoint: `company/list`,
    config: {
      enabled: Boolean(
        (values.offeror_type && values.offeror_type === 'company') ||
          (values.acquirer_type && values.acquirer_type === 'company')
      ),
    },
  });
  const companyList = company && company.data && company.data.data;

  const sortedPersonList = useMemo(() => {
    if (personList) {
      return personList.slice().sort((a, b) => {
        return a.first_name.localeCompare(b.first_name);
      });
    }
    return [];
  }, [personList]);

  const sortedCompanyList = useMemo(() => {
    if (companyList) {
      return companyList.slice().sort((a, b) => {
        return a.company_name.localeCompare(b.company_name);
      });
    }
    return [];
  }, [companyList]);

  const companyListing1 = (event: any) => {
    setBuyerCompanyData(event);
  };
  const buyerCompanyId = companyList?.find(
    (ele) => ele.id === buyerCompanyData?.data?.data?.id
  );
  React.useEffect(() => {
    setFieldValue(SellerBuyierEnum.ACQUIRE_ID, buyerCompanyId?.id);
  }, [buyerCompanyId]);

  const companyListing = (event: any) => {
    setCompanyData(event);
  };
  const companyId = companyList?.find(
    (ele: any) => ele.id === companyData?.data?.data?.id
  );

  useEffect(() => {
    setFieldValue(SellerBuyierEnum.OFFEROR_ID, companyId?.id);
  }, [companyId]);

  const personListing1 = (event: any) => {
    setBuyerPersonData(event);
  };
  const buyerPersonId = personList?.find(
    (ele) => ele.id === buyerPersonData?.data?.data?.id
  );
  React.useEffect(() => {
    setFieldValue(SellerBuyierEnum.ACQUIRE_ID, buyerPersonId?.id);
  }, [buyerPersonId]);

  const personListing = (event: any) => {
    setPersonData(event);
  };
  const personId = personList?.find(
    (ele: any) => ele.id === personData?.data?.data?.id
  );
  React.useEffect(() => {
    setFieldValue(SellerBuyierEnum.OFFEROR_ID, personId?.id);
  }, [personId]);

  React.useEffect(() => {
    if (passDataT?.id && !isFieldValuesPopulate) {
      setFieldValue('offeror_id', passDataT?.offeror_id);
      setFieldValue('acquirer_id', passDataT?.acquirer_id);
      setFieldValue('acquirer_type', passDataT?.acquirer_type);
      setFieldValue('private_comp', passDataT?.private_comp);
      if (passDataT.offeror_type !== 'select') {
        setFieldValue('offeror_type', passDataT?.offeror_type);
      }
      setIsFieldValuesPopulate(true);
    }
  }, [passDataT?.id, sortedPersonList]);

  React.useEffect(() => {
    if (
      newlyCreatedComp &&
      location.pathname === '/evaluation/sales/create-comp'
    ) {
      handleEvaluationSubmit();
    }
  }, [newlyCreatedComp]);

  React.useEffect(() => {
    if (
      newlyCreatedComp &&
      location.pathname === '/evaluation/cost/create-comp'
    ) {
      handleCostEvaluationSubmit();
    }
  }, [newlyCreatedComp]);

  React.useEffect(() => {
    if (
      newlyCreatedComp &&
      location.pathname === '/evaluation/lease/create-comp'
    ) {
      handleLeaseEvaluationSubmit();
    }
  }, [newlyCreatedComp]);
  React.useEffect(() => {
    if (
      newlyCreatedComp &&
      location.pathname === '/evaluation/cap/create-comp'
    ) {
      handleCapEvaluationSubmit();
    }
  }, [newlyCreatedComp]);
  React.useEffect(() => {
    if (
      newlyCreatedComp &&
      location.pathname === '/evaluation/multi-family/create-comp'
    ) {
      handleMultiFamilyEvaluationSubmit();
    }
  }, [newlyCreatedComp]);

  // for appraisals
  React.useEffect(() => {
    if (newlyCreatedComp && location.pathname === '/sales/create-comp') {
      handleSalesEvaluationSubmitAppraisal();
    }
  }, [newlyCreatedComp]);
  React.useEffect(() => {
    if (newlyCreatedComp && location.pathname === '/cost/create-comp') {
      handleSCostEvaluationSubmitAppraisal();
    }
  }, [newlyCreatedComp]);

  React.useEffect(() => {
    if (newlyCreatedComp && location.pathname === '/lease/create-comp') {
      handleSLeaseEvaluationSubmitAppraisal();
    }
  }, [newlyCreatedComp]);

  React.useEffect(() => {
    if (
      newlyCreatedComp &&
      location.pathname === '/residential/sales/create-comp'
    ) {
      console.log('gotcap');
      handleSalesResidentialSubmmit();
    }
  }, [newlyCreatedComp]);

  return (
    <>
      <div className="mb-[80px] mt-12 items-end">
        <Grid container spacing={3}>
          <Grid item xs={4} className="pt-2">
            <SelectTextField
              label={
                <span style={{ fontSize: '17px' }}>
                  {values.type === 'sales'
                    ? SellerBuyierEnum.SELLER_TYPE
                    : SellerBuyierEnum.LANDLORD_TYPE}
                </span>
              }
              onChange={handleSellerType}
              options={
                values.type === 'sales'
                  ? sellerTyoeOptions
                  : landLordTypeOptions
              }
              name="offeror_type"
              value={values.offeror_type}
            ></SelectTextField>
          </Grid>
          <Grid item xs={4} className="pt-2">
            <SelectTextField
              label={<span>{SellerBuyierEnum.NAME}</span>}
              options={[
                {
                  value: 'select',
                  label:
                    values.offeror_type === 'person'
                      ? '--Select Person--'
                      : values.offeror_type === 'company'
                        ? '--Select Company--'
                        : '',
                }, // Add 'Select Person' option
                ...(values.offeror_type === 'person' ||
                values?.offeror_type === 'person'
                  ? sortedPersonList.map((elem) => ({
                      value: elem.id,
                      label: elem.first_name + ' ' + elem.last_name,
                    }))
                  : values.offeror_type === 'company' ||
                      values?.offeror_type === 'company'
                    ? sortedCompanyList.map((elem) => ({
                        value: elem.id,
                        label: elem.company_name,
                      }))
                    : []),
              ]}
              value={values.offeror_id ? values.offeror_id : 'select'}
              onChange={(selectedValue) => handleOfferId(selectedValue)}
              name="offeror_id"
            />
          </Grid>
          <Grid item xs={4} className="pt-2">
            <CommonButton
              variant="contained"
              color="primary"
              size="small"
              style={{
                background: 'white',
                border: 'dashed',
                color: '#5A5A5A',
                borderRadius: '10px',
                borderWidth: '1px',
                marginTop: '8px',
                fontSize: '12px',
                fontFamily: 'montserrat',
                boxShadow: 'none',
                cursor: 'pointer',
              }}
              onClick={handleModal}
            >
              <AddIcon className="text-[#3391C7]" />
              {values.offeror_type === SellerBuyierEnum.PERSON
                ? SellerBuyierEnum.ADD_NEW_PERSON
                : values.offeror_type === SellerBuyierEnum.COMPANY
                  ? SellerBuyierEnum.ADD_NEW_COMPANY
                  : SellerBuyierEnum.ADD_NEW}
            </CommonButton>
          </Grid>
        </Grid>
        <Grid container spacing={3} className="mt-4 items-end">
          <Grid item xs={4} className="pt-2">
            <SelectTextField
              label={
                <span style={{ fontSize: '17px' }}>
                  {values.type === 'sales' ? 'Buyer Type' : 'Tenant Type'}
                </span>
              }
              options={
                values.type === 'sales' ? buyerTypeOptions : tenantTypeOptions
              }
              // defaultValue="select"
              onChange={handleBuyierType}
              value={values.acquirer_type}
              name="acquirer_type"
            ></SelectTextField>
          </Grid>
          <Grid item xs={4} className="pt-2">
            <SelectTextField
              label={
                <span style={{ fontSize: '17px' }}>
                  {SellerBuyierEnum.NAME}
                </span>
              }
              options={[
                {
                  value: 'select',
                  label:
                    values.acquirer_type === 'person'
                      ? '--Select Person--'
                      : values.acquirer_type === 'company'
                        ? '--Select Company--'
                        : '',
                }, // Add 'Select Person' option
                ...(values.acquirer_type === SellerBuyierEnum.PERSON ||
                values.acquirer_type === SellerBuyierEnum.PERSON
                  ? sortedPersonList.map((elem) => ({
                      value: elem.id,
                      label: elem.first_name + ' ' + elem.last_name,
                    }))
                  : values.acquirer_type === SellerBuyierEnum.COMPANY ||
                      values.acquirer_type === SellerBuyierEnum.COMPANY
                    ? sortedCompanyList.map((elem) => ({
                        value: elem.id,
                        label: elem.company_name,
                      }))
                    : []),
              ]}
              defaultValue="select"
              onChange={handleOfferIdBuyier}
              value={values.acquirer_id ? values.acquirer_id : 'select'}
              name="acquirer_id"
            ></SelectTextField>
          </Grid>
          <Grid item xs={4} className="pt-2">
            <CommonButton
              variant="contained"
              color="primary"
              size="small"
              onClick={handleModalBuyier}
              style={{
                background: 'white',
                border: 'dashed',
                color: '#5A5A5A',
                borderRadius: '10px',
                borderWidth: '1px',
                marginTop: '8px',
                fontSize: '12px',
                fontFamily: 'montserrat',
                boxShadow: 'none',
                cursor: 'pointer',
              }}
            >
              <AddIcon className="text-[#3391C7]" />
              {values.acquirer_type === SellerBuyierEnum.PERSON
                ? SellerBuyierEnum.ADD_NEW_PERSON
                : values.acquirer_type === SellerBuyierEnum.COMPANY
                  ? SellerBuyierEnum.ADD_NEW_COMPANY
                  : SellerBuyierEnum.ADD_NEW}
            </CommonButton>
          </Grid>
        </Grid>
        <div className="mt-5 info-wrapper">
          <div className="flex items-center gap-3">
            <p className="font-bold mb-0 leading-1">
              {SellerBuyierEnum.MARK_COMP_PRIVATE}
            </p>
            <div className="information-content">
              <Tooltip
                title={
                  <p className="text-sm">
                    Marking a comp as private means that only the person that
                    created the comp will be able to view it or link it to an
                    appraisal
                  </p>
                }
                placement="bottom-start"
              >
                <InfoIcon className="cursor-pointer" id="info"></InfoIcon>
              </Tooltip>
            </div>
          </div>
          <div className="flex items-center gap-5 mt-2">
            <div className="flex items-center gap-1">
              <input
                type="radio"
                name="private_comp"
                className="cursor-pointer"
                id="no"
                onChange={() => {
                  setFieldValue('private_comp', 0);
                }}
                checked={values.private_comp === 0 ? true : false}
              />

              <label htmlFor="no" className="cursor-pointer">
                {PrivateCompEnum.NO}
              </label>
            </div>
            <div className="flex items-center gap-1">
              <input
                name="private_comp"
                type="radio"
                id="yes"
                className="cursor-pointer"
                onChange={() => {
                  setFieldValue('private_comp', 1);
                }}
                checked={values.private_comp === 1 ? true : false}
              />
              <label htmlFor="yes" className="cursor-pointer">
                {PrivateCompEnum.YES}
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-center items-center fixed inset-x-0 bottom-0 bg-white py-5 z-10">
          <CommonButton
            type="submit"
            variant="contained"
            color="primary"
            size="small"
            onClick={setValidationSelectTag}
            style={{
              width: '200px',
              borderRadius: '7px',
              fontSize: '14px',
              fontFamily: 'montserrat',
            }}
          >
            {isUpdate ? 'UPDATE' : 'CREATE'}
          </CommonButton>
          {showScrollTop && (
            <Button
              id="backToTop"
              color="primary"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              style={{
                fontSize: '24px',
                cursor: 'pointer',
                border: 'none',
                padding: '0px',
              }}
            >
              ↑
            </Button>
          )}
        </div>
        {modelOpenBuyier ? (
          <CompDeleteModal>
            <div className="text-right text-gray-500 pr-3 mt-[10px]">
              <ClearIcon
                className="text-3xl cursor-pointer"
                onClick={closeCompsModal1}
              />
            </div>
            <AddNewPerson
              close={closeCompsModal1}
              refetch2={refetch1}
              companyListing={personListing1}
            />
          </CompDeleteModal>
        ) : (
          ''
        )}

        {modalOpenCompanyBuyier ? (
          <CompDeleteModal>
            <div className="text-right text-gray-500 pr-3 mt-[10px]">
              <ClearIcon
                className="text-3xl cursor-pointer"
                onClick={closeCompsModal1}
              />
            </div>
            <AddCompany
              close={closeCompsModal1}
              refetch2={refetch}
              companyListing={companyListing1}
            />
          </CompDeleteModal>
        ) : (
          ''
        )}

        {modelOpenSeller ? (
          <CompDeleteModal>
            <div className="text-right text-gray-500 pr-3 mt-[10px]">
              <ClearIcon
                className="text-3xl cursor-pointer"
                onClick={closeCompsModal1}
              />
            </div>
            <AddNewPerson
              close={closeCompsModal1}
              refetch2={refetch1}
              companyListing={personListing}
            />
          </CompDeleteModal>
        ) : (
          ''
        )}

        {modalOpenCompanySeller ? (
          <CompDeleteModal>
            <div className="text-right text-gray-500 pr-3 mt-[10px]">
              <ClearIcon
                className="text-3xl cursor-pointer"
                onClick={closeCompsModal1}
              />
            </div>
            <AddCompany
              close={closeCompsModal1}
              refetch2={refetch}
              companyListing={companyListing}
            />
          </CompDeleteModal>
        ) : (
          ''
        )}
      </div>
    </>
  );
};
export default SellerBuyer;
