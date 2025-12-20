import { Button, Grid } from '@mui/material';
import CommonButton from '@/components/elements/button/Button';
import AddIcon from '@mui/icons-material/Add';
import AddNewPerson from '@/pages/comps/create-comp/AddNewPerson';
import CompDeleteModal from '@/components/modal/Comp-delete-modal';
import ClearIcon from '@mui/icons-material/Clear';
import React, { ChangeEvent, useEffect, useMemo } from 'react';
import SelectTextField from '@/components/styles/select-input';
import { useGet } from '@/hook/useGet';
import { useFormikContext } from 'formik';
import AddCompany from '@/pages/comps/create-comp/AddComapany';
import {
  buyerTypeOptions,
  sellerTyoeOptions,
} from '@/pages/comps/create-comp/SelectOption';
import { toast } from 'react-toastify';
import { ClientListAllDataType } from '@/components/interface/client-list-data-type';
import { CompanyListDataType } from '@/components/interface/company-list-data-type';
import InfoIcon from '@mui/icons-material/Info';
import { ResidentialCreateComp } from '@/components/interface/residential-create-comp';
import { ResidentialComponentHeaderEnum } from '../enum/ResidentialEnum';
import { PrivateCompEnum, ButtonTitleEnum } from '../enum/ResidentialEnum';
import { SellerBuyierEnum } from '@/pages/comps/enum/CompsEnum';
import Tooltip from '@mui/material/Tooltip';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const SellerBuyer = ({ updateData, passData, newlyCreatedComp }: any) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const salesId = searchParams.get('approachId');
  const [modelOpenBuyier, setModalOpenBuyier] = React.useState(false);
  const [companyData, setCompanyData] = React.useState<any>();
  const [personData, setPersonData] = React.useState<any>();
  const [buyerPersonData, setBuyerPersonData] = React.useState<any>();
  const [buyerCompanyData, setBuyerCompanyData] = React.useState<any>();
  const [modalOpenCompanyBuyier, setModalOpenCompanyBuyier] =
    React.useState(false);
  const [modelOpenSeller, setModalOpenSeller] = React.useState(false);
  const [modalOpenCompanySeller, setModalOpenCompanySeller] =
    React.useState(false);
  const [isFieldValuesPopulate, setIsFieldValuesPopulate] =
    React.useState<any>(false);
  const { setFieldValue, values } = useFormikContext<
    ResidentialCreateComp | any
  >();
  const closeCompsModal1 = () => {
    setModalOpenBuyier(false);
    setModalOpenCompanyBuyier(false);
    setModalOpenSeller(false);
    setModalOpenCompanySeller(false);
  };
  const [showScrollTop, setShowScrollTop] = React.useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
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

    // Extract the original operating expenses
    const originalOperatingExpenses =
      parsedSalesValues?.operatingExpenses || [];

    // Create a map of adj_key to adj_value
    const originalAdjustmentValues: { [key: string]: any } = {};
    originalOperatingExpenses.forEach((exp: any) => {
      originalAdjustmentValues[exp.adj_key] = exp.adj_value;
    });

    console.log('Original adjustment values:', originalAdjustmentValues);

    // Try to fetch evaluation data for calculations
    let appraisalData = null;
    try {
      const evaluationResponse = await axios.get(`res-evaluations/get/${id}`);
      appraisalData = evaluationResponse?.data?.data?.data;
    } catch (error) {
      console.error('Error fetching evaluation data:', error);
    }

    // Define the calculation function
    function calculateAdjustmentValue(
      expense: any,
      comp: any,
      appraisalData: any
    ) {
      // Find the expense configuration from operating expenses
      const expenseConfig = originalOperatingExpenses.find(
        (exp: any) => exp.adj_key === expense.adj_key
      );
      if (!expenseConfig) return 0;

      // Parse the configuration value based on expense type
      let configValue: number;
      if (['time', 'location', 'condition'].includes(expense.adj_key)) {
        // Preserve negative sign for percentage values
        const rawValue =
          typeof expenseConfig.adj_value === 'string'
            ? expenseConfig.adj_value.replace(/%/g, '')
            : expenseConfig.adj_value || 0;
        configValue = parseFloat(rawValue.toString());
      } else {
        configValue = parseFloat(
          typeof expenseConfig.adj_value === 'string'
            ? expenseConfig.adj_value.replace(/[$,]/g, '')
            : expenseConfig.adj_value?.toString() || '0'
        );
      }

      let calculatedValue = 0;
      const salePrice = comp.sale_price || 0;

      if (['time', 'location', 'condition'].includes(expense.adj_key)) {
        calculatedValue = (salePrice * configValue) / 100;
      } else if (expense.adj_key === 'gross_living_area_sf') {
        const subjectSqFt =
          appraisalData?.res_zonings?.reduce(
            (total: any, zone: any) =>
              total + (parseFloat(zone.gross_living_sq_ft) || 0),
            0
          ) || 0;
        const compSqFt =
          comp?.res_zonings?.reduce(
            (sum: number, item: any) =>
              sum + (Number(item.gross_living_sq_ft) || 0),
            0
          ) ?? 0;
        calculatedValue = (subjectSqFt - compSqFt) * configValue;
      } else if (expense.adj_key === 'land_size') {
        const subjectLandSize =
          appraisalData && appraisalData.land_dimension === 'ACRE'
            ? appraisalData.land_size * 43560
            : appraisalData?.land_size || 0;
        const compLandSize =
          appraisalData?.land_dimension === 'ACRE' &&
          comp?.land_dimension === 'ACRE'
            ? comp.land_size * 43560
            : comp?.land_size || 0;
        calculatedValue = (subjectLandSize - compLandSize) * configValue;
      } else if (expense.adj_key === 'year_built') {
        // Extract only numeric part using regex
        const extractNumeric = (val: any) => {
          if (!val) return 0;
          const numeric = String(val).match(/\d+/g);
          return numeric ? parseInt(numeric.join('')) : 0;
        };
        const subjectYearBuilt = extractNumeric(appraisalData?.year_built);
        const compYearBuilt = extractNumeric(comp?.year_built);
        calculatedValue = (subjectYearBuilt - compYearBuilt) * configValue;
      } else if (expense.adj_key === 'basement') {
        // For basement, we need to find the finished and unfinished configs
        const finishedConfig = originalOperatingExpenses.find(
          (exp: any) => exp.adj_key === 'basement_finished'
        );
        const unfinishedConfig = originalOperatingExpenses.find(
          (exp: any) => exp.adj_key === 'basement_unfinished'
        );

        const finishedValue = finishedConfig
          ? parseFloat(
              typeof finishedConfig.adj_value === 'string'
                ? finishedConfig.adj_value.replace(/[$%,]/g, '')
                : finishedConfig.adj_value?.toString() || '0'
            )
          : 0;
        const unfinishedValue = unfinishedConfig
          ? parseFloat(
              typeof unfinishedConfig.adj_value === 'string'
                ? unfinishedConfig.adj_value.replace(/[$%,]/g, '')
                : unfinishedConfig.adj_value?.toString() || '0'
            )
          : 0;

        const subjectFinishedSqFt =
          appraisalData?.res_zonings?.reduce(
            (total: any, zone: any) =>
              total + (zone.basement_finished_sq_ft || 0),
            0
          ) || 0;
        const subjectUnfinishedSqFt =
          appraisalData?.res_zonings?.reduce(
            (total: any, zone: any) =>
              total + (zone.basement_unfinished_sq_ft || 0),
            0
          ) || 0;
        const compFinishedSqFt =
          comp?.res_zonings?.reduce(
            (total: any, zone: any) =>
              total + (zone.basement_finished_sq_ft || 0),
            0
          ) || 0;
        const compUnfinishedSqFt =
          comp?.res_zonings?.reduce(
            (total: any, zone: any) =>
              total + (zone.basement_unfinished_sq_ft || 0),
            0
          ) || 0;
        const finishedAdjustment =
          (subjectFinishedSqFt - compFinishedSqFt) * finishedValue;
        const unfinishedAdjustment =
          (subjectUnfinishedSqFt - compUnfinishedSqFt) * unfinishedValue;
        calculatedValue = finishedAdjustment + unfinishedAdjustment;
      } else if (
        ['bedrooms', 'bathrooms', 'fireplace'].includes(expense.adj_key)
      ) {
        // Function to extract only numbers from strings
        const extractNumeric = (val: any) => {
          if (!val) return 0;
          const numeric = parseFloat(String(val).replace(/[^0-9.]/g, ''));
          return isNaN(numeric) ? 0 : numeric;
        };
        const subjectCount = extractNumeric(appraisalData?.[expense.adj_key]);
        const compCount = extractNumeric(comp?.[expense.adj_key]);
        calculatedValue = (subjectCount - compCount) * configValue;
      }

      return calculatedValue;
    }

    const updatedComps = [
      {
        ...newlyCreatedComp,
        comp_id: newlyCreatedComp.id,
        // Add the original adjustment values
        originalAdjustmentValues,
        // Add the original operating expenses
        operatingExpenses: originalOperatingExpenses,
        // Calculate adjustments if we have appraisal data
        expenses: originalOperatingExpenses.map((exp: any) => {
          // Calculate adjustment value if we have appraisal data
          const calculatedValue = appraisalData
            ? calculateAdjustmentValue(exp, newlyCreatedComp, appraisalData)
            : exp.adj_value;

          // Format the calculated value as a dollar amount
          const formattedValue =
            typeof calculatedValue === 'number'
              ? `$${calculatedValue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              : exp.adj_value;

          return {
            ...exp,
            // Keep the original adj_value for reference
            original_adj_value: exp.adj_value,
            // Set the adj_value to the calculated value
            adj_value: formattedValue,
            // Store the raw calculated value for calculations
            calculatedValue,
            comparison_basis: 0,
          };
        }),
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
  const setValidationSelectTag = async () => {
    // Only call the appropriate function based on current path
    if (
      location.pathname.includes('/residential/sales/create-comp') &&
      newlyCreatedComp
    ) {
      handleSalesResidentialSubmmit();
      return;
    }
    if (
      location.pathname.includes('/residential/cost/create-comp') &&
      newlyCreatedComp
    ) {
      handleCostResidentialSubmmit();
      return;
    }

    const isZoningInvalid =
      !values.zonings || // Check if `zonings` is null or undefined
      values.zonings.length === 0 || // Check if `zonings` array is empty
      values.zonings.some(
        (zoning: any) =>
          !zoning.zone ||
          !zoning.sub_zone ||
          !zoning.gross_living_sq_ft ||
          !zoning.basement_finished_sq_ft ||
          !zoning.basement_unfinished_sq_ft ||
          !zoning.weight_sf
      );
    if (
      values.property_name === '' ||
      values.street_address === '' ||
      values.city === '' ||
      values.state === '' ||
      values.zipcode === '' ||
      values.condition === '' ||
      values.sale_price === '' ||
      values.date_sold === '' ||
      values.sale_price === '' ||
      isZoningInvalid
    ) {
      toast.info(SellerBuyierEnum.PLZ_COMPLETE_MISSING_FIELD, {
        style: {
          backgroundColor: '#0DA1C7',
          color: 'white', // Set the background color to red
        },
      });
    }
    passData(true);
  };

  React.useEffect(() => {
    if (
      newlyCreatedComp &&
      location.pathname === '/residential/sales/create-comp'
    ) {
      console.log('residential sales');
      handleSalesResidentialSubmmit();
    }
  }, [newlyCreatedComp]);

  const costApproachId =
    searchParams.get('costId') || searchParams.get('approachId');

  const handleCostResidentialSubmmit = async () => {
    console.log('checkdataaaaa', newlyCreatedComp);

    if (!newlyCreatedComp) {
      console.log('No comp data available.');
      return;
    }

    // Get stored sales values from localStorage
    const storedSalesValues = localStorage.getItem(
      'costApproachValuesResidential'
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

    navigate(
      `/residential/evaluation/cost-approach?id=${id}&costId=${costApproachId}`,
      {
        state: { updatedComps },
      }
    );
  };
  React.useEffect(() => {
    if (
      newlyCreatedComp &&
      location.pathname === '/residential/cost/create-comp'
    ) {
      handleCostResidentialSubmmit();
    }
  }, [newlyCreatedComp]);

  const handleModalBuyier = () => {
    if (values.acquirer_type == SellerBuyierEnum.SELECT) {
      toast.error(SellerBuyierEnum.PLZ_SELECT_TYPE_FIRST);
      return false;
    }
    if (values.acquirer_type == SellerBuyierEnum.PERSON) {
      setModalOpenBuyier(true);
      setModalOpenCompanyBuyier(false);
    } else if (values.acquirer_type === SellerBuyierEnum.COMPANY) {
      setModalOpenCompanyBuyier(true);
      setModalOpenBuyier(false);
    }
  };
  const handleSellerType = (e: ChangeEvent<HTMLInputElement>) => {
    setFieldValue(SellerBuyierEnum.OFFEROR_TYPE, e.target.value);
  };

  const handleBuyierType = (e: ChangeEvent<HTMLInputElement>) => {
    setFieldValue(SellerBuyierEnum.ACQUIRE_TYPE, e.target.value);
  };

  const handleOfferId = (e: ChangeEvent<HTMLInputElement>) => {
    setFieldValue(SellerBuyierEnum.OFFEROR_ID, e.target.value);
  };

  const handleOfferIdBuyier = (e: ChangeEvent<HTMLInputElement>) => {
    setFieldValue(SellerBuyierEnum.ACQUIRE_ID, e.target.value);
  };

  const handleModal = () => {
    if (values.offeror_type === SellerBuyierEnum.SELECT) {
      toast.error(SellerBuyierEnum.PLZ_SELECT_TYPE_FIRST);
      return false;
    }
    if (values?.offeror_type == SellerBuyierEnum.PERSON) {
      setModalOpenSeller(true);
      setModalOpenCompanySeller(false);
    } else if (values.offeror_type === SellerBuyierEnum.COMPANY) {
      setModalOpenCompanySeller(true);
      setModalOpenSeller(false);
    }
  };

  const { data: person, refetch: refetch1 } = useGet<ClientListAllDataType>({
    queryKey: 'person-list',
    endPoint: `client/getAll`,
    config: {
      enabled: Boolean(
        (values && values.offeror_type === SellerBuyierEnum.PERSON) ||
          (values && values.acquirer_type === SellerBuyierEnum.PERSON)
      ),
    },
  });

  const personList = person && person.data && person.data.data;

  const { data: company, refetch } = useGet<CompanyListDataType>({
    queryKey: 'company-form',
    endPoint: `company/list`,
    config: {
      enabled: Boolean(
        (values && values.offeror_type === SellerBuyierEnum.COMPANY) ||
          (values && values.acquirer_type === SellerBuyierEnum.COMPANY)
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
    if (updateData?.id && !isFieldValuesPopulate) {
      setFieldValue(SellerBuyierEnum.ACQUIRE_ID, updateData?.acquirer_id);
      setFieldValue(SellerBuyierEnum.ACQUIRE_TYPE, updateData?.acquirer_type);
      setFieldValue(SellerBuyierEnum.OFFEROR_ID, updateData?.offeror_id);
      setFieldValue(SellerBuyierEnum.PRIVATE_COMP, updateData?.private_comp);

      if (updateData.offeror_type !== 'select') {
        setFieldValue(SellerBuyierEnum.OFFEROR_TYPE, updateData?.offeror_type);
      }
      setIsFieldValuesPopulate(true);
    }
  }, [updateData?.id, sortedPersonList]);

  return (
    <>
      <div className="mb-[80px]">
        <Grid container spacing={3}>
          <Grid item xs={4}>
            <SelectTextField
              label={
                <span className="text-customGray">
                  {SellerBuyierEnum.SELLER_TYPE}
                </span>
              }
              defaultValue={SellerBuyierEnum.SELECT}
              onChange={handleSellerType}
              options={sellerTyoeOptions}
              value={values.offeror_type}
              name={SellerBuyierEnum.OFFEROR_TYPE}
            ></SelectTextField>
          </Grid>
          <Grid item xs={4}>
            <SelectTextField
              label={
                <span className="text-customGray">{SellerBuyierEnum.NAME}</span>
              }
              defaultValue={SellerBuyierEnum.SELECT}
              options={[
                {
                  value: SellerBuyierEnum.SELECT,
                  label:
                    values.offeror_type === SellerBuyierEnum.PERSON
                      ? SellerBuyierEnum.SELECT_PERSON
                      : values.offeror_type === SellerBuyierEnum.COMPANY
                        ? SellerBuyierEnum.SELECT_COMPANY
                        : '',
                }, // Add 'Select Person' option
                ...(values.offeror_type === SellerBuyierEnum.PERSON
                  ? sortedPersonList.map((elem) => ({
                      value: elem.id,
                      label: elem.first_name + ' ' + elem.last_name,
                    }))
                  : values.offeror_type === SellerBuyierEnum.COMPANY
                    ? sortedCompanyList.map((elem) => ({
                        value: elem.id,
                        label: elem.company_name,
                      }))
                    : []),
              ]}
              onChange={(selectedValue) => handleOfferId(selectedValue)}
              name={SellerBuyierEnum.OFFEROR_ID}
              value={
                values.offeror_id ? values.offeror_id : SellerBuyierEnum.SELECT
              }
            />
          </Grid>
          <Grid item xs={4}>
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
              {values?.offeror_type === SellerBuyierEnum.PERSON
                ? ButtonTitleEnum.ADD_NEW_PERSON
                : values.offeror_type === SellerBuyierEnum.COMPANY
                  ? ButtonTitleEnum.ADD_NEW_COMPANY
                  : ButtonTitleEnum.ADD_NEW}
            </CommonButton>
          </Grid>
        </Grid>
        <Grid container spacing={3} className="mt-[10px]">
          <Grid item xs={4}>
            <SelectTextField
              label={
                <span className="text-customGray">
                  {SellerBuyierEnum.BUYER_TYPE}
                </span>
              }
              options={buyerTypeOptions}
              // defaultValue="select"
              onChange={handleBuyierType}
              value={values.acquirer_type}
              name={SellerBuyierEnum.ACQUIRE_TYPE}
            ></SelectTextField>
          </Grid>
          <Grid item xs={4}>
            <SelectTextField
              label={
                <span className="text-customGray">{SellerBuyierEnum.NAME}</span>
              }
              options={[
                {
                  value: SellerBuyierEnum.SELECT,
                  label:
                    values?.acquirer_type === SellerBuyierEnum.PERSON
                      ? SellerBuyierEnum.SELECT_PERSON
                      : values?.acquirer_type === SellerBuyierEnum.COMPANY
                        ? SellerBuyierEnum.SELECT_COMPANY
                        : '',
                }, // Add 'Select Person' option
                ...(values?.acquirer_type === SellerBuyierEnum.PERSON
                  ? sortedPersonList.map((elem) => ({
                      value: elem.id,
                      label: elem.first_name + ' ' + elem.last_name,
                    }))
                  : values?.acquirer_type === SellerBuyierEnum.COMPANY
                    ? sortedCompanyList.map((elem) => ({
                        value: elem.id,
                        label: elem.company_name,
                      }))
                    : []),
              ]}
              defaultValue={SellerBuyierEnum.SELECT}
              onChange={handleOfferIdBuyier}
              name={SellerBuyierEnum.ACQUIRE_ID}
              value={
                values.acquirer_id
                  ? values.acquirer_id
                  : SellerBuyierEnum.SELECT
              }
            ></SelectTextField>
          </Grid>
          <Grid item xs={4}>
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
              {values?.acquirer_type === SellerBuyierEnum.PERSON
                ? ButtonTitleEnum.ADD_NEW_PERSON
                : values?.acquirer_type === SellerBuyierEnum.COMPANY
                  ? ButtonTitleEnum.ADD_NEW_COMPANY
                  : ButtonTitleEnum.ADD_NEW}
            </CommonButton>
          </Grid>
        </Grid>
        <div className="mt-[20px] info-wrapper">
          <div className="flex">
            <p className="font-bold mb-0">
              {ResidentialComponentHeaderEnum.MARK_COMP_PRIVATE}
            </p>
            <div className="information-content">
              <Tooltip
                title={ResidentialComponentHeaderEnum.MARKING_COMP}
                placement="bottom-start"
              >
                <InfoIcon
                  className="mt-[-2px] ml-[10px] cursor-pointer "
                  id="info"
                ></InfoIcon>
              </Tooltip>
            </div>
          </div>
          <input
            type="radio"
            name={SellerBuyierEnum.PRIVATE_COMP}
            id="no"
            onChange={() => {
              setFieldValue(SellerBuyierEnum.PRIVATE_COMP, 0);
            }}
            checked={values.private_comp === 0 ? true : false}
          />

          <label htmlFor="no" className="ml-[5px]">
            {PrivateCompEnum.NO}
          </label>
          <input
            name={SellerBuyierEnum.PRIVATE_COMP}
            type="radio"
            id="yes"
            onChange={() => {
              setFieldValue(SellerBuyierEnum.PRIVATE_COMP, 1);
            }}
            className="ml-[10px]"
            checked={
              updateData?.private_comp || values.private_comp === 1
                ? true
                : false
            }
            // value={updateData?.private_comp}
          />
          <label htmlFor="yes" className="ml-[5px]">
            {PrivateCompEnum.YES}
          </label>
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
            {updateData?.id ? SellerBuyierEnum.UPDATE : SellerBuyierEnum.CREATE}
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
            <div
              className="text-right text-gray-500 pr-3 cursor-pointer mt-[10px]"
              onClick={closeCompsModal1}
            >
              <ClearIcon className="text-3xl" />
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
            <div
              className="text-right text-gray-500 pr-3 cursor-pointer mt-[10px]"
              onClick={closeCompsModal1}
            >
              <ClearIcon className="text-3xl" />
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
            <div
              className="text-right text-gray-500 pr-3 cursor-pointer mt-[10px]"
              onClick={closeCompsModal1}
            >
              <ClearIcon className="text-3xl" />
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
            <div
              className="text-right text-gray-500 pr-3 cursor-pointer mt-[10px]"
              onClick={closeCompsModal1}
            >
              <ClearIcon className="text-3xl" />
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
