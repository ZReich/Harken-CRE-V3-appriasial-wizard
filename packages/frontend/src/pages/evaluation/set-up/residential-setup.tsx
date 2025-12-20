import CommonButton from '@/components/elements/button/Button';
import StyledField from '@/components/styles/StyleFieldEditComp';
import SelectTextField from '@/components/styles/select-input';
import { formatClientOptions } from '@/utils/clientUtils';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Typography,
} from '@mui/material';
import { FieldArray, Form, Formik } from 'formik';

import { Icons } from '@/components/icons';
import { EvaluationSetupParams } from '@/components/interface/appraisal-set-up';
import { ClientListDataType } from '@/components/interface/client-list-data-type';
import { ResponseType } from '@/components/interface/response-type';
import { Hr } from '@/components/styles/hr';
import { StorageKeys, ValidationMessages } from '@/enums/storage-keys';
import { useGet } from '@/hook/useGet';
import { RequestType, useMutate } from '@/hook/useMutate';
import { EvaluationSetUpSchema } from '@/utils/evaluationSetUpSchema';
import { useLocalStorageSync } from '@/utils/storageUtils';
import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import group3 from '../../../images/Group3.png';
import useGlobalCodeOptions from '../globalCodes/global-codes-option';
import { EvaluationEnum, EvaluationSetUpEnum } from './evaluation-setup-enums';
import ResidentialCreateClientModal from './residential-create-client';
import ResidentialMenuOptions from './residential-menu-option';
import loadingImage from '../../../images/loading.png'
export const ResidentialSetup = () => {
  const { AppraisalTypeOptions } = useGlobalCodeOptions();
  const ResidentialTypeOptions = AppraisalTypeOptions.filter((ele) => ele.value === 'residential');
  const [open, setOpen] = useState(false);
  const [loader, setLoader] = useState(false);
  const [clientId, setClientID] = useLocalStorageSync('client_id');
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
  const navigate = useNavigate();
  // api to get client list
  const { data, refetch } = useGet<ClientListDataType>({
    queryKey: 'person-list',
    endPoint: `client/getAll`,
    config: { refetchOnWindowFocus: false },
  });

  // save setup api
  const { mutate } = useMutate<ResponseType, EvaluationSetupParams>({
    queryKey: 'res-evaluations/save-setup',
    endPoint: 'res-evaluations/save-setup',
    requestType: RequestType.POST,
  });
  // Fetch client list and update client ID
  const fetchClientList = async () => {
    try {
      await refetch();
      const storedClientId = localStorage.getItem(StorageKeys.CLIENT_ID);
      if (storedClientId) {
        setClientID(storedClientId);
      }
    } catch (error) {
      console.error('Error fetching client list:', error);
    }
  };
  // Fetch client list when modal is closed and update client ID from storage
  useEffect(() => {
    if (!open) {
      fetchClientList();
    }
  }, [open, refetch]);
  // client list
  const clientListOptions = formatClientOptions(data);

  let lastErrorMessage = '';

  const showErrorToast = (message: string) => {
    if (lastErrorMessage !== message) {
      toast.error(message);
      lastErrorMessage = message;
      setTimeout(() => (lastErrorMessage = ''), 500); // Reset after 500ms
    }
  };

  // Validation function
  const validateEvaluationSetupFields = (
    values: EvaluationSetupParams
  ): boolean => {
    // If there's only one scenario, set its name to 'Primary' if empty
    if (values.scenarios.length === 1 && !values.scenarios[0].name?.trim()) {
      values.scenarios[0].name = 'Primary';
    }

    const validationRules = [
      {
        condition: !getEvalType(values.evaluation_type),
        message: ValidationMessages.SELECT_EVALUATION_TYPE,
      },
      {
        // Only check scenario names if there's more than one scenario
        condition:
          values.scenarios.length > 1 &&
          values.scenarios.some((s: any) => !s.name?.trim()),
        message: ValidationMessages.FILL_SCENARIO_NAMES,
      },
      {
        condition: hasDuplicateScenarios(values.scenarios),
        message: ValidationMessages.UNIQUE_SCENARIO_NAMES,
      },
      {
        condition: values.scenarios?.length === 0 || values.scenarios.some((s: any) => !hasAnyApproach(s)),
        message: (s: any) => values.scenarios.length === 0 ? ValidationMessages.SELECT_APPROACH1 :
          ValidationMessages.SELECT_APPROACH.replace(
            '{0}',
            s.name || 'Primary'
          ),
      },
      {
        condition:
          !values.client_id && !localStorage.getItem(StorageKeys.CLIENT_ID),
        message: ValidationMessages.CLIENT_REQUIRED,
      },
    ];

    for (const rule of validationRules) {
      if (rule.condition) {
        const message =
          typeof rule.message === 'function'
            ? rule.message(values.scenarios.find((s: any) => !hasAnyApproach(s)))
            : rule.message;
        showErrorToast(message);
        return false;
      }
    }

    return true;
  };

  const getEvalType = (evaluationType: any): string => {
    return typeof evaluationType === 'string'
      ? evaluationType.trim()
      : typeof evaluationType === 'object' && 'value' in evaluationType
        ? evaluationType.value.trim()
        : '';
  };

  const hasDuplicateScenarios = (scenarios: any[]): boolean => {
    const names = scenarios.map((e) => e.name?.trim());
    return names.length !== new Set(names).size;
  };

  const hasAnyApproach = (scenario: any): boolean => {
    return Object.entries(scenario)
      .filter(([key]) => key.startsWith('has_') && key.endsWith('_approach'))
      .some(([, value]) => value);
  };

  // Handle submit
  const handleSubmit = (values: EvaluationSetupParams) => {
    if (!validateEvaluationSetupFields(values)) return;
        setLoader(true);

    // Inject client_id if missing
    const payload: any = {
      evaluation_type: values.evaluation_type,
      res_evaluation_scenarios: values.scenarios,
      client_id: clientId ? clientId : values.client_id,
    };

    mutate(payload, {
      onSuccess: (res) => {
        setLoader(false);
        localStorage.removeItem('client_id');
        const id = res?.data?.data?.id;

        if (id) {
          navigate(`/residential-overview?id=${id}`);
        } else {
          toast.error('ID not returned from API.');
        }
      },
      onError: () => {
        toast.error('Failed to submit evaluation setup.');
      },
    });
  };
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
        <div className="p-5 xl:px-14 px-4 ">
          <Formik
            initialValues={{
              evaluation_type: '',
              client_id: '',
              // comp_type: localStorage.getItem('activeType'),
              scenarios: [],
            }}
            onSubmit={handleSubmit}
            validationSchema={EvaluationSetUpSchema}
          >
            {({
              values,
              setFieldValue,
              errors,
              initialValues,
              touched,
              submitCount,
            }: any) => {
              const client_id = localStorage?.getItem('client_id');
              if (!values?.client_id) {
                if (
                  localStorage?.getItem('client_id') &&
                  !initialValues?.client_id
                ) {
                  setFieldValue('client_id', client_id);
                } else if (initialValues?.client_id) {
                  localStorage?.removeItem('client_id');
                }
              }

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
                          // options={ResidentialTypeOptions}
                          options={[
                            { label: 'Select type', value: '' }, // <-- placeholder option
                            ...ResidentialTypeOptions,
                          ]}
                          value={values.evaluation_type}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setFieldValue(
                              EvaluationSetUpEnum.EVALUATION_TYPE_NAME,
                              e.target.value
                            )
                          }
                        />
                        {(touched.evaluation_type || submitCount > 0) &&
                          errors.evaluation_type && (
                            <span className="text-red-500 text-[11px] absolute">
                              {errors.evaluation_type}
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
                      {EvaluationSetUpEnum.VALUATION_SCENARIO}
                    </Typography>
                    <FieldArray
                      name="scenarios"
                      render={(arrayHelpers) => (
                        <Box className="mt-[20px] bg-[#FBFBFB] p-6">
                          {values.scenarios.length === 0 ? (
                            <Box>
                              {/* Show only approaches initially */}
                              <Grid container spacing={1} className="mt-2">
                                {[
                                  {
                                    key: 'has_sales_approach',
                                    label: 'Sales Comparison Approach',
                                  },
                                  {
                                    key: 'has_cost_approach',
                                    label: 'Cost Approach',
                                    hide: localStorage.getItem('activeType') === 'land_only',
                                  },
                                  {
                                    key: 'has_income_approach',
                                    label: 'Income Approach',
                                  },
                                ]
                                  .filter(option => !option.hide)
                                  .map((option) => (
                                    <Grid item key={option.key}>
                                      <FormControlLabel
                                        control={
                                          <Checkbox
                                            onChange={(e) => {
                                              // When first checkbox is clicked, create a scenario
                                              if (values.scenarios.length === 0) {
                                                arrayHelpers.push({
                                                  name: '',
                                                  has_sales_approach: 0,
                                                  has_cost_approach: 0,
                                                  has_income_approach: 0,
                                                  [option.key]: e.target.checked
                                                    ? 1
                                                    : 0,
                                                });
                                              }
                                            }}
                                          />
                                        }
                                        label={option.label}
                                      />
                                    </Grid>
                                  ))}
                              </Grid>

                              <Grid container className="mt-4">
                                <Grid
                                  item
                                  xs={12}
                                  className="flex justify-center"
                                >
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
                                      width: '100%',
                                    }}
                                    onClick={() => {
                                      // Create a new scenario with empty name
                                      const newScenario = {
                                        name: '',
                                        has_sales_approach: 0,
                                        has_cost_approach: 0,
                                        has_income_approach: 0,

                                      };

                                      // Add the new scenario
                                      arrayHelpers.push(newScenario);
                                    }}
                                  >
                                    <img
                                      src={group3}
                                      alt="add"
                                      className="mr-2"
                                    />
                                    {EvaluationSetUpEnum.ADD_MORE}
                                  </CommonButton>
                                </Grid>
                              </Grid>
                            </Box>
                          ) : (
                            values.scenarios.map(
                              (field: any, index: number) => (
                                <Box key={index} className="mb-6 border-b pb-4">
                                  {/* Row 1: Scenario Name and Delete Icon - Only show if there's more than one scenario */}
                                  {values.scenarios.length > 1 ? (
                                    <Grid
                                      container
                                      spacing={2}
                                      alignItems="center"
                                    >
                                      <Grid item xs={5}>
                                        <StyledField
                                          label="Scenario Name"
                                          name={`scenarios[${index}].name`}
                                          value={values.scenarios[index].name}
                                          onChange={(e: any) =>
                                            setFieldValue(
                                              `scenarios[${index}].name`,
                                              e.target.value
                                            )
                                          }
                                        />
                                      </Grid>

                                      {/* Delete Icon */}
                                      <Grid
                                        item
                                        xs={1}
                                        className="flex justify-center"
                                      >
                                        <Icons.DeleteIcon
                                          className="text-red-500 cursor-pointer"
                                          onClick={() =>
                                            arrayHelpers.remove(index)
                                          }
                                        />
                                      </Grid>
                                    </Grid>
                                  ) : null}

                                  {/* Row 2: Checkboxes for Approaches */}
                                  <Grid container spacing={1} className="mt-2">
                                    {[
                                      {
                                        key: 'has_sales_approach',
                                        label: 'Sales Comparison Approach',
                                      },
                                      {
                                        key: 'has_cost_approach',
                                        label: 'Cost Approach',
                                        hide: localStorage.getItem('activeType') === 'land_only',
                                      },
                                      {
                                        key: 'has_income_approach',
                                        label: 'Income Approach',
                                      },

                                    ]
                                      .filter(option => !option.hide)
                                      .map((option) => (
                                        <Grid item key={option.key}>
                                          <FormControlLabel
                                            control={
                                              <Checkbox
                                                checked={Boolean(
                                                  field[option.key]
                                                )}
                                                onChange={(e) =>
                                                  setFieldValue(
                                                    `scenarios[${index}].${option.key}`,
                                                    e.target.checked ? 1 : 0
                                                  )
                                                }
                                              />
                                            }
                                            label={option.label}
                                          />
                                        </Grid>
                                      ))}
                                  </Grid>

                                  {/* Row 3: Add More Button */}
                                  {index === values.scenarios.length - 1 && (
                                    <Grid container className="mt-4">
                                      <Grid
                                        item
                                        xs={12}
                                        className="flex justify-end"
                                      >
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
                                          onClick={() => {
                                            // Create a new scenario with empty name
                                            const newScenario = {
                                              name: '',
                                              has_sales_approach: 0,
                                              has_cost_approach: 0,
                                              has_income_approach: 0,

                                            };

                                            // Add the new scenario directly
                                            arrayHelpers.push(newScenario);
                                          }}
                                        >
                                          <img
                                            src={group3}
                                            alt="add"
                                            className="mr-2"
                                          />
                                          {EvaluationSetUpEnum.ADD_MORE}
                                        </CommonButton>
                                      </Grid>
                                    </Grid>
                                  )}
                                </Box>
                              )
                            )
                          )}
                        </Box>
                      )}
                    />
                  </div>

                  <Hr />
                  <div>
                    <Typography
                      className="text-lg font-bold pb-[20px]"
                      variant="h5"
                      component="h5"
                    >
                      {EvaluationSetUpEnum.CLIENT_DETAILS}
                    </Typography>
                    <Box className="mt-[20px] bg-[#FBFBFB] p-6 mb-28">
                      <Grid
                        container
                        spacing={2}
                        className="mt-1"
                        alignItems="center"
                      >
                        <Grid item xs={6}>
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

                              // Update Formik state
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
                            }}
                          />

                          {(touched.client_id || submitCount > 0) &&
                            errors.client_id && (
                              <span className="text-red-500 text-[11px] absolute">
                                {errors.client_id}
                              </span>
                            )}
                        </Grid>
                        <Grid item xs={5} className="mt-[3px]">
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

                          {/* Modal */}
                          <ResidentialCreateClientModal
                            open={open}
                            onClose={() => setOpen(false)}
                            handleCloseModal={() => setOpen(false)}
                            GetData={() => fetchClientList()} // Pass function as prop
                          />
                        </Grid>
                      </Grid>
                    </Box>
                    <div className="flex justify-center fixed m-0 py-5 w-full bottom-0 left-0 bg-white">
                      <CommonButton
                        variant="contained"
                        onClick={() => {
                          validateEvaluationSetupFields(values);
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

