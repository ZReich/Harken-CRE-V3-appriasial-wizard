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
import { StorageKeys } from '@/enums/storage-keys';
import { useGet } from '@/hook/useGet';
import { RequestType, useMutate } from '@/hook/useMutate';
import { EvaluationSetUpSchema } from '@/utils/evaluationSetUpSchema';
import {
  prepareSubmitPayload,
  validateEvaluationSetupFields,
} from '@/utils/evaluationUtils';
import { useLocalStorageSync } from '@/utils/storageUtils';
import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import group3 from '../../../images/Group3.png';
import useGlobalCodeOptions from '../globalCodes/global-codes-option';
import EvaluationCreateClientModal from './evaluation-create-client';
import EvaluationMenuOptions from './evaluation-menu-options';
import {
  createEmptyScenario,
  getApproachOptions,
} from '@/components/modals/evaluation-approach-config';
import { ScenarioEnum } from '@/components/modals/evaluation-setup-enums';
import { EvaluationEnum, EvaluationSetUpEnum } from './evaluation-setup-enums';
import loadingImage from '../../../images/loading.png'
export const EvaluationSetup = () => {
  const { AppraisalTypeOptions } = useGlobalCodeOptions();
  const [open, setOpen] = useState(false);
  const [loader, setLoader] = useState(false);
  const [clientId, setClientID] = useLocalStorageSync('client_id');
  const navigate = useNavigate();
  const activeType = localStorage.getItem('activeType');
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Clean up client_id on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem('client_id');
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // API calls
  const { data, refetch } = useGet<ClientListDataType>({
    queryKey: 'person-list',
    endPoint: `client/getAll`,
    config: { refetchOnWindowFocus: false },
  });

  const { mutate } = useMutate<ResponseType, EvaluationSetupParams>({
    queryKey: 'evaluations/save-setup',
    endPoint: 'evaluations/save-setup',
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

  // Fetch client list when modal is closed
  useEffect(() => {
    if (!open) {
      fetchClientList();
    }
  }, [open, refetch]);

  // Client list options
  const clientListOptions = formatClientOptions(data);

  // Handle form submission
  const handleSubmit = (values: EvaluationSetupParams) => {
    if (!validateEvaluationSetupFields(values)) return;
    setLoader(true);
    const payload = prepareSubmitPayload(values, clientId);

    mutate(payload, {
      onSuccess: (res) => {
        const id = res?.data?.data?.id;
        setLoader(false);
        if (id) {
          navigate(`/evaluation-overview?id=${id}`);
        } else {
          toast.error('ID not returned from API.');
        }
      },
      onError: () => {
        toast.error('Failed to submit evaluation setup.');
      },
    });
  };

  // Get filtered approach options
  const approachOptions = getApproachOptions(activeType);
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
      <EvaluationMenuOptions>
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
              comp_type: activeType,
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
              // Handle client ID from localStorage
              if (!values?.client_id) {
                if (
                  localStorage?.getItem('client_id') &&
                  !initialValues?.client_id
                ) {
                  setFieldValue(EvaluationSetUpEnum.CLIENT_ID, clientId);
                } else if (initialValues?.client_id) {
                  localStorage?.removeItem('client_id');
                }
              }

              return (
                <Form>
                  {/* Evaluation Type Section */}
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
                          options={[
                            { label: 'Select type', value: '' },
                            ...AppraisalTypeOptions,
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

                  {/* Valuation Scenario Section */}
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
                                {approachOptions
                                  .filter((option) => !option.hide)
                                  .map((option) => (
                                    <Grid item key={option.key}>
                                      <FormControlLabel
                                        control={
                                          <Checkbox
                                            onChange={(e) => {
                                              // When first checkbox is clicked, create a scenario
                                              if (
                                                values.scenarios.length === 0
                                              ) {
                                                const newScenario =
                                                  createEmptyScenario();
                                                newScenario[option.key] = e
                                                  .target.checked
                                                  ? 1
                                                  : 0;
                                                arrayHelpers.push(newScenario);
                                              }
                                            }}
                                          />
                                        }
                                        label={option.label}
                                      />
                                    </Grid>
                                  ))}
                              </Grid>

                              {/* Add More Button */}
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
                                    onClick={() =>
                                      arrayHelpers.push(createEmptyScenario())
                                    }
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
                                  {/* Scenario Name and Delete Icon - Only show if there's more than one scenario */}
                                  {values.scenarios.length > 1 ? (
                                    <Grid
                                      container
                                      spacing={2}
                                      alignItems="center"
                                    >
                                      <Grid item xs={5}>
                                        <StyledField
                                          label={ScenarioEnum.SCENARIO_NAME}
                                          name={`scenarios[${index}].${ScenarioEnum.NAME}`}
                                          value={values.scenarios[index].name}
                                          onChange={(e: any) =>
                                            setFieldValue(
                                              `scenarios[${index}].${ScenarioEnum.NAME}`,
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

                                  {/* Checkboxes for Approaches */}
                                  <Grid container spacing={1} className="mt-2">
                                    {approachOptions
                                      .filter((option) => !option.hide)
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

                                  {/* Add More Button */}
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
                                          onClick={() =>
                                            arrayHelpers.push(
                                              createEmptyScenario()
                                            )
                                          }
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

                  {/* Client Details Section */}
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
                            value={clientId || values.client_id}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                              const selectedClientId = e.target.value;
                              setFieldValue(
                                EvaluationSetUpEnum.CLIENT_ID,
                                selectedClientId
                              );
                              setClientID(selectedClientId);
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
                          <EvaluationCreateClientModal
                            open={open}
                            onClose={() => setOpen(false)}
                            handleCloseModal={() => setOpen(false)}
                            GetData={fetchClientList}
                          />
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Save Button */}
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
      </EvaluationMenuOptions>
    </>
  );
};
