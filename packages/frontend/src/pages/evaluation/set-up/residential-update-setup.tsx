import CommonButton from '@/components/elements/button/Button';
import { Icons } from '@/components/icons';
import { EvaluationSetupParams } from '@/components/interface/appraisal-set-up';
import { ClientListDataType } from '@/components/interface/client-list-data-type';
import StyledField from '@/components/styles/StyleFieldEditComp';
import { Hr } from '@/components/styles/hr';
import SelectTextField from '@/components/styles/select-input';
import { useGet } from '@/hook/useGet';
import { RequestType, useMutate } from '@/hook/useMutate';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid,
  Typography,
} from '@mui/material';
import { FieldArray, Form, Formik } from 'formik';
import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import group3 from '../../../images/Group3.png';
import useGlobalCodeOptions from '../globalCodes/global-codes-option';
import ResidentialMenuOptions from './residential-menu-option';

import {
  EvaluationEnum,
  // EvaluationLocalStorageEnums,
  EvaluationSetUpEnum,
} from './evaluation-setup-enums';
import ResidentialCreateClientModal from './residential-create-client';
import loadingImage from '../../../images/loading.png'
export const UpdatedResidentialSetup = () => {
  const { AppraisalTypeOptions } = useGlobalCodeOptions();
  const ResidentialTypeOptions = AppraisalTypeOptions.filter((ele) => ele.value === 'residential');
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const navigate = useNavigate();
  // const [saleType, _] = React.useState(false);
  const [open, setOpen] = useState(false);
  const [clientId, setClientID] = useState(localStorage.getItem('client_id'));
  const [disabled, setDisabled] = useState(false);
  const [loader, setLoader] = useState(false);
  // const [setDataRequited, setSetDataRequited] = React.useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem('client_id');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  // const saleType = false;
  const setDataRequited = false;

  const { data, refetch } = useGet<ClientListDataType>({
    queryKey: 'person-list',
    endPoint: `client/getAll`,
    config: { refetchOnWindowFocus: false },
  });
  useEffect(() => {
    if (!open) {
      fetchClientList(); // Fetch latest client when modal closes
    }
  }, [open]);

  useEffect(() => {
    console.log('Updated clientId in state:', clientId);
  }, [clientId]);
  const fetchClientList = async () => {
    console.log('Fetching client ID...');
    try {
      const storedClientId = localStorage.getItem('client_id');
      if (storedClientId) {
        refetch();

        setClientID(storedClientId);
      }
    } catch (error) {
      console.error('Error fetching client list:', error);
    }
  };

  const clientListOptions = Array.isArray(data?.data?.data)
    ? data.data.data.map((ele) => {
      return {
        value: ele.id,
        label: ele.first_name + ' ' + ele.last_name,
      };
    })
    : [];

  clientListOptions?.unshift({
    value: '',
    label: 'select',
  });

  const { data: dataGet, isLoading } = useGet<any>({
    queryKey: 'res-evaluations/get',
    endPoint: `res-evaluations/get/${id}`,
    config: { enabled: Boolean(id !== undefined), refetchOnWindowFocus: false },
  });
  const setData = dataGet?.data?.data;
  useEffect(() => {
    const hasSalesApproach = setData?.res_evaluation_scenarios?.some((item: any) => item.has_sales_approach === 1);
    if (hasSalesApproach) {
      setDisabled(true); // or whatever your state updater is
    } else {
      setDisabled(false);
    }
  }, [setData?.res_evaluation_scenarios])


  const transformedScenarios =
    setData?.res_evaluation_scenarios?.map((scenario: any) => ({
      id: scenario.id, // Include the ID
      name: scenario.name || '',
      has_sales_approach: scenario.has_sales_approach || 0,
      has_cost_approach: scenario.has_cost_approach || 0,
      has_income_approach: scenario.has_income_approach || 0,
      has_lease_approach: scenario.has_lease_approach || 0,
      has_cap_approach: scenario.has_cap_approach || 0,
      has_multi_family_approach: scenario.has_multi_family_approach || 0,
    })) || [];

  useEffect(() => {
    if (id !== undefined) {
      const fetchData = async () => {
        try {
          refetch();
        } catch (error) {
          console.error('Error while mutating data:', error);
        }
      };
      fetchData();
    }
  }, [dataGet?.data?.data, refetch]);

  const { mutate: mutateUpdate } = useMutate<any, any>({
    queryKey: 'res-evaluations/update-setup',
    endPoint: `res-evaluations/update-setup/${id}`,
    requestType: RequestType.POST,
  });

  let lastErrorMessage = '';

  const showErrorToast = (message: string) => {
    if (lastErrorMessage !== message) {
      toast.error(message);
      lastErrorMessage = message;
      setTimeout(() => (lastErrorMessage = ''), 500); // Reset after 500ms
    }
  };

  const validateUpdateEvaluationFields = (
    values: EvaluationSetupParams,
    clientId?: string
  ): boolean => {
    // 1. Evaluation Type
    const evalType =
      typeof values.evaluation_type === 'string'
        ? values.evaluation_type.trim()
        : typeof values.evaluation_type === 'object' &&
          'value' in values.evaluation_type
          ? values.evaluation_type.value.trim()
          : '';

    if (!evalType) {
      showErrorToast('Please select an evaluation type.');
      return false;
    }

    // 2. Scenario Name Missing - Set to 'Primary' if only one scenario
    if (values.scenarios.length === 1 && !values.scenarios[0].name?.trim()) {
      values.scenarios[0].name = 'Primary';
    } else {
      const emptyScenario = values.scenarios.find((s: any) => !s.name?.trim());
      if (emptyScenario) {
        showErrorToast('Please fill all scenario names.');
        return false;
      }
    }

    // 3. Duplicate Scenario Names
    const scenarioNames = values.scenarios.map((e: any) => e.name?.trim());
    const nameSet = new Set<string>();
    const hasDuplicate = scenarioNames.some((name: any) => {
      if (nameSet.has(name)) return true;
      nameSet.add(name);
      return false;
    });

    if (hasDuplicate) {
      showErrorToast('Scenario names must be unique.');
      return false;
    }

    // 4. At least one approach must be selected in every scenario
    const invalidApproach = values.scenarios.find((scenario: any) => {
      const {
        has_sales_approach,
        has_cost_approach,
        has_income_approach,
        has_multi_family_approach,
        has_cap_approach,
        has_lease_approach,
      } = scenario;

      return !(
        has_sales_approach ||
        has_cost_approach ||
        has_income_approach ||
        has_multi_family_approach ||
        has_cap_approach ||
        has_lease_approach
      );
    });

    if (invalidApproach) {
      showErrorToast(
        `Please select at least one approach for "${invalidApproach.name || 'Primary'}" scenario.`
      );
      return false;
    }

    // 5. Client ID Check
    const clientIdFromStorage = localStorage.getItem('client_id');
    if (!clientId && !values.client_id && !clientIdFromStorage) {
      showErrorToast('Client is required.');
      return false;
    }

    return true;
  };

  const handleSubmit = (values: EvaluationSetupParams) => {
   const clientIdFromStorage = localStorage.getItem('client_id');

    const isValid = validateUpdateEvaluationFields(
      values,
      clientId || clientIdFromStorage || undefined
    );
    if (!isValid) return;
    setLoader(true);

    // Map scenarios and preserve IDs for existing scenarios
    const scenarios = values.scenarios.map((approach: any, index: number) => {
      // Get the original scenario with ID if it exists
      const originalScenario = setData?.scenarios?.[index];

      return {
        id: approach.id || originalScenario?.id || undefined, // Include ID if available
        name: approach.name,
        has_sales_approach: approach.has_sales_approach || 0,
        has_cost_approach: approach.has_cost_approach || 0,
        has_income_approach: approach.has_income_approach || 0,
        // has_multi_family_approach: approach.has_multi_family_approach || 0,
        // has_cap_approach: approach.has_cap_approach || 0,
        // has_lease_approach: approach.has_lease_approach || 0,
      };
    });

    mutateUpdate(
      {
        client_id: clientId ? clientId : values.client_id,
        // comp_type: localStorage.getItem('activeType'),
        evaluation_type: values.evaluation_type,
        res_evaluation_scenarios: scenarios,
      },
      {
        onSuccess: (res) => {
          setLoader(false);
          navigate(`/residential-overview?id=${id}`);
          toast(res?.data?.message);
        },
        onError: () => { },
      }
    );
  };

  if (isLoading || loader) {
    return (
      <>
        <div className="img-update-loader">
          <img src={loadingImage} />
        </div>
      </>
    );
  }

  return (
    <>
      <ResidentialMenuOptions>
        <div>
          <div className="flex items-center justify-between h-[50px] w-[100%] xl:pl-[40px] border-0 border-b border-[#eee] border-solid xl:pr-[70px] px-[15px] map-header-sticky">
            <Typography
              variant="h1"
              component="h2"
              className="text-xl font-bold uppercase"
            >
              {EvaluationSetUpEnum.EVALUATION_DETAILS}
            </Typography>
          </div>
        </div>
        <div className="pt-[40px] xl:px-[60px] px-[15px]">
          <Formik
            initialValues={{
              evaluation_type:
                setData && setData.evaluation_type
                  ? setData.evaluation_type.toLocaleLowerCase()
                  : '',
              client_id: setData && setData.client_id,
              comp_type: '',
              scenarios:
                transformedScenarios.length > 0
                  ? transformedScenarios
                  : [
                    {
                      name: '',
                      has_sales_approach: 0,
                      has_cost_approach: 0,
                      has_income_approach: 0,
                      has_lease_approach: 0,
                      has_cap_approach: 0,
                      has_multi_family_approach: 0,
                    },
                  ],
            }}
            onSubmit={handleSubmit}
          // validationSchema={EvaluationSetUpSchema}
          >
            {({ values, setFieldValue, errors }) => {
              console.log(values, 'residentialupdatevalues')
              return (
                <Form>
                  <div>
                    <Grid container spacing={2} className="mt-[20px]">
                      <Grid item xs={12}>
                        <SelectTextField
                          label={
                            <span className="relative">
                              {EvaluationSetUpEnum.EVALUATION_TYPE}
                              <span className="text-red-500 text-base">*</span>
                            </span>
                          }
                          name={EvaluationSetUpEnum.EVALUATION_TYPE_NAME}
                          options={ResidentialTypeOptions}
                          value={values.evaluation_type}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setFieldValue(
                              EvaluationSetUpEnum.EVALUATION_TYPE_NAME,
                              e.target.value
                            )
                          }
                          disabled={disabled}
                        />
                        {setDataRequited && errors && (
                          <span className="text-red-500 text-[11px] absolute">
                            {errors?.evaluation_type as any}
                          </span>
                        )}
                      </Grid>
                    </Grid>
                  </div>
                  <div>
                    <Typography
                      className="text-lg font-bold pt-[40px] pb-[20px]"
                      variant="h5"
                      component="h5"
                    >
                      {EvaluationSetUpEnum.APPROACH_TYPE}
                    </Typography>
                    <FieldArray
                      name="scenarios"
                      render={(arrayHelpers) => (
                        <Box className="mt-[20px] bg-[#FBFBFB] p-6">
                          {values.scenarios.map((_: any, index: any) => (
                            <Box
                              key={index}
                              className="relative border border-gray-200 rounded-lg p-4 mb-6"
                            >
                              <Grid container spacing={2}>
                                {/* Only show scenario name field if there's more than one scenario */}
                                {values.scenarios.length > 1 && (
                                  <Grid item xs={5}>
                                    <StyledField
                                      label="Scenario Name"
                                      name={`scenarios[${index}].name`}
                                      value={values.scenarios[index].name}
                                      onChange={(e) =>
                                        setFieldValue(
                                          `scenarios[${index}].name`,
                                          e.target.value
                                        )
                                      }
                                    />
                                  </Grid>
                                )}

                                {values.scenarios.length > 1 && (
                                  <Grid
                                    item
                                    xs={1}
                                    className="flex justify-center"
                                  >
                                    <Icons.DeleteIcon
                                      className="text-red-500 cursor-pointer"
                                      onClick={() => arrayHelpers.remove(index)}
                                    />
                                  </Grid>
                                )}

                                <Grid item xs={12} className="mt-2">
                                  <FormGroup row>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={
                                            values.scenarios[index]
                                              .has_sales_approach === 1
                                          }
                                          onChange={(e) =>
                                            setFieldValue(
                                              `scenarios[${index}].has_sales_approach`,
                                              e.target.checked ? 1 : 0
                                            )
                                          }
                                        />
                                      }
                                      label="Sales Comparison Approach"
                                    />
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={
                                            values.scenarios[index]
                                              .has_cost_approach === 1
                                          }
                                          onChange={(e) =>
                                            setFieldValue(
                                              `scenarios[${index}].has_cost_approach`,
                                              e.target.checked ? 1 : 0
                                            )
                                          }
                                        />
                                      }
                                      label="Cost Approach"
                                    />
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={
                                            values.scenarios[index]
                                              .has_income_approach === 1
                                          }
                                          onChange={(e) =>
                                            setFieldValue(
                                              `scenarios[${index}].has_income_approach`,
                                              e.target.checked ? 1 : 0
                                            )
                                          }
                                        />
                                      }
                                      label="Income Approach"
                                    />



                                  </FormGroup>
                                </Grid>

                                <Grid item xs={12} className="mt-4">
                                  {index === values.scenarios.length - 1 && (
                                    <CommonButton
                                      variant="contained"
                                      color="primary"
                                      style={{
                                        background: '#FBFBFB',
                                        border: '1px dashed #A1AFB7',
                                        color: '#A1AFB7',
                                        borderRadius: '10px',
                                        borderWidth: '1px',
                                        fontSize: '12px',
                                        boxShadow: 'none',
                                        height: '55px',
                                        width: '100%',
                                      }}
                                      onClick={() =>
                                        arrayHelpers.push({
                                          name: '',
                                          has_sales_approach: 0,
                                          has_cost_approach: 0,
                                          has_income_approach: 0,
                                          has_multi_family_approach: 0,
                                          has_cap_approach: 0,
                                          has_lease_approach: 0,
                                        })
                                      }
                                    >
                                      <img
                                        src={group3}
                                        alt="add"
                                        className="mr-2"
                                        style={{
                                          width: '16px',
                                          height: '16px',
                                        }}
                                      />
                                      Add More...
                                    </CommonButton>
                                  )}
                                </Grid>
                              </Grid>
                            </Box>
                          ))}
                        </Box>
                      )}
                    />
                  </div>
                  <Hr />
                  <div className="mb-28">
                    <Typography
                      className="text-lg font-bold pb-[20px]"
                      variant="h5"
                      component="h5"
                    >
                      {EvaluationSetUpEnum.CLIENT_DETAILS}
                    </Typography>
                    <Box className="mt-[20px] bg-[#FBFBFB] p-6">
                      <Grid
                        container
                        spacing={2}
                        className="mt-1"
                        alignItems="center"
                      >
                        <Grid item xs={8} xl={6}>
                          <SelectTextField
                            label={
                              <span className="relative">
                                {EvaluationSetUpEnum.SELECT_CLIENT}
                                <span className="text-red-500 text-base">
                                  *
                                </span>
                              </span>
                            }
                            name={EvaluationSetUpEnum.CLIENT_ID}
                            options={clientListOptions}
                            value={clientId || values.client_id} // Ensure correct default value
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                              const selectedClientId = e.target.value;

                              setFieldValue(
                                EvaluationSetUpEnum.CLIENT_ID,
                                selectedClientId
                              );

                              // Update local state
                              setClientID(selectedClientId);

                              // Store in localStorage
                              localStorage.setItem(
                                'client_id',
                                selectedClientId
                              );
                              // setFieldValue(
                              //   SetUpEnum.CLIENT_ID,
                              //   e.target.value
                              // );
                            }}
                          />
                          {setDataRequited && errors && (
                            <span className="text-red-500 text-[11px] absolute">
                              {errors?.client_id as any}
                            </span>
                          )}
                        </Grid>
                        <Grid item xs={3} xl={5} className="mt-[3px]">
                          <CommonButton
                            variant="contained"
                            color="primary"
                            style={{
                              background: '#FBFBFB',
                              border: 'dashed',
                              color: '#A1AFB7',
                              borderRadius: '10px',
                              borderWidth: '1px',
                              fontSize: '12px',
                              boxShadow: 'none',
                              height: '55px',
                            }}
                            onClick={() => setOpen(true)}
                          >
                            <img src={group3} alt="add" className="mr-2" />
                            {EvaluationSetUpEnum.ADD_NEW_CLIENT}
                          </CommonButton>
                          <ResidentialCreateClientModal
                            open={open}
                            onClose={() => setOpen(false)}
                            handleCloseModal={() => setOpen(false)}
                            GetData={() => fetchClientList()} // Pass function as prop
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  </div>
                  <div className="flex justify-center fixed m-0 py-5 w-full bottom-0 left-0 bg-white">
                    <div className="flex justify-center fixed m-0 py-5 w-full bottom-0 left-0 bg-white">
                      <CommonButton
                        variant="contained"
                        onClick={() => {
                          // setValidationSelectTag(values);
                        }}
                        color="primary"
                        type="submit"
                        style={{
                          fontSize: '14px',
                          width: '300px',
                        }}
                      >
                        {EvaluationEnum.SAVE_AND_CONTINUE}
                        <Icons.ArrowForwardIcon className="cursor-pointer text-sm" />
                      </CommonButton>
                      {showScrollTop && (
                        <Button
                          id="backToTop"
                          color='primary'
                          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                          style={{ fontSize: '24px', cursor: 'pointer', border: 'none', padding: '0px' }}
                        >
                          ↑
                        </Button>
                      )}
                    </div>
                  </div>
                </Form>
              );
            }}
          </Formik>
        </div>
      </ResidentialMenuOptions>
    </>
  );
};
