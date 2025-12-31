import CommonButton from '@/components/elements/button/Button';
import { Icons } from '@/components/icons';
import { AppraisalSetup } from '@/components/interface/appraisal-set-up';
import { ClientListDataType } from '@/components/interface/client-list-data-type';
import { Hr } from '@/components/styles/hr';
import SelectTextField from '@/components/styles/select-input';
import StyledField from '@/components/styles/StyleFieldEditComp';
import { useGet } from '@/hook/useGet';
import { RequestType, useMutate } from '@/hook/useMutate';
import { AppraisalSetUpSchema } from '@/utils/appraisalSetUpSchema';
import { Box, Button, Grid, Typography } from '@mui/material';
import { FieldArray, Form, Formik } from 'formik';
import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import group3 from '../../../images/Group3.png';
import AppraisalMenu from './appraisa-menu';
import CreateClientModal from './create-client-modal';
import { AppraisalTypeOptions, ApproachTypeOptions } from './SelectOption';
import { AppraisalEnum, SetUpEnum } from './setUpEnum';
import loadingImage from '../../../images/loading.png';
export const UpdatedSetup = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const navigate = useNavigate();
  const [saleType, setSaleType] = React.useState(false);
  const [open, setOpen] = useState(false);
  const [loader, setLoader] = useState(false);
  const [clientId, setClientID] = useState(localStorage.getItem('client_id'));
  const [setDataRequited, setSetDataRequited] = React.useState(false);
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
  // const setValidationSelectTag = (values: any) => {
  //   const hasEmptyApproaches = values.approaches.some(
  //     (approach: { type: string; name: string }) =>
  //       approach.type === '' || approach.name === ''
  //   );

  //   if (
  //     values.appraisal_type === '' ||
  //     values.client_id === '' ||
  //     hasEmptyApproaches
  //   ) {
  //     toast.error(
  //       'There are required fields to be filled. Check them before you proceed.'
  //     );
  //   }

  //   setSetDataRequited(true);
  // };
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
    label: 'Select',
  });

  const { data: dataGet, isLoading } = useGet<any>({
    queryKey: 'appraisals/get',
    endPoint: `appraisals/get/${id}`,
    config: { enabled: Boolean(id !== undefined), refetchOnWindowFocus: false },
  });
  const setData = dataGet?.data?.data;

  const appraisal_approaches = setData?.appraisal_approaches.map((ele: any) => {
    return {
      type: ele.type,
      name: ele.name,
      id: ele.id,
    };
  });

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
  const setValidationSelectTag = (values: any) => {
    const hasEmptyApproaches = values.approaches.some(
      (approach: { type: string; name: string }) =>
        approach.type === '' || approach.name === ''
    );

    if (
      values.appraisal_type === '' ||
      values.client_id === '' ||
      hasEmptyApproaches
    ) {
      toast.error(
        'There are required fields to be filled. Check them before you proceed.'
      );
    }

    setSetDataRequited(true);
  };
  const { mutate: mutateUpdate } = useMutate<any, any>({
    queryKey: 'appraisals/update-setup',
    endPoint: `appraisals/update-setup/${id}`,
    requestType: RequestType.PATCH,
  });
  const activeType = localStorage.getItem('activeType');
  console.log(activeType, 'activeType');
  const handleSubmit = (values: AppraisalSetup) => {
    setLoader(true);
    if (id === undefined) {
      mutateUpdate(
        {
          client_id: clientId ? clientId : values.client_id,
          comp_type: activeType,
          appraisal_type: values.appraisal_type,
          approaches: values.approaches.map((ele: any) => {
            return {
              type: ele.type,
              name: ele.name,
              id: ele.id,
            };
          }),
        },
        {
          onSuccess: (res) => {
            navigate(`/overview?id=${id}`);
            toast(res?.data?.message);
          },
          onError: () => { },
        }
      );
    } else {
      const names = values.approaches.map(
        (approach: { name: string }) => approach.name
      );
      const duplicateName = names.find(
        (name: string, index: number) => names.indexOf(name) !== index
      );

      if (duplicateName) {
        toast('Duplicate Assign Name Found');
        setLoader(false)
        return;
      } else {
        mutateUpdate(
          {
            client_id: clientId ? clientId : values.client_id,
            appraisal_type: values.appraisal_type,
            comp_type: activeType,
            approaches: values.approaches.map((ele: any) => {
              return {
                type: ele.type,
                name: ele.name,
                id: ele.id,
              };
            }),
          },
          {
            onSuccess: (res: any) => {
              setLoader(false);
              navigate(`/overview?id=${id}`);
              toast(res?.data?.message);
            },
            onError: () => { },
          }
        );
      }
    }
  };
  const filteredOptions = useMemo(() => {
    const activeType = localStorage.getItem('activeType');
    if (activeType === 'land_only') {
      return ApproachTypeOptions.filter(
        (option) => option.value !== 'cost' && option.value !== 'rent_roll'
      );
    }
    return ApproachTypeOptions;
  }, []); // No dependencies here;
  if (loader || isLoading) {
    return (
      <div className="img-update-loader">
        <img src={loadingImage} />
      </div>
    );
  }

  return (
    <>
      <AppraisalMenu>
        <div>
          <div className="flex items-center justify-between h-[50px] w-[100%] xl:pl-[40px] border-0 border-b border-[#eee] border-solid xl:pr-[70px] px-[15px] map-header-sticky">
            <Typography
              variant="h1"
              component="h2"
              className="text-xl font-bold uppercase"
            >
              {SetUpEnum.APPRAISAL_DETAILS}
            </Typography>
          </div>
        </div>
        <div className="pt-[40px] xl:px-[60px] px-[15px]">
          <Formik
            initialValues={{
              appraisal_type:
                setData && setData.appraisal_type
                  ? setData.appraisal_type.toLocaleLowerCase()
                  : '',
              client_id: setData && setData.client_id,
              approaches: setData
                ? appraisal_approaches
                : [
                  {
                    type: '',
                    name: '',
                    id: '',
                  },
                ],
            }}
            onSubmit={handleSubmit}
            validationSchema={AppraisalSetUpSchema}
          >
            {({ values, setFieldValue, errors }) => {
              if (values.approaches) {
                values?.approaches?.map((ele: any) => {
                  if (ele?.type === 'sale') {
                    setSaleType(true);
                  }
                });
              }
              return (
                <Form>
                  <div>
                    <Grid container spacing={2} className="mt-[20px]">
                      <Grid item xs={12}>
                        <SelectTextField
                          label={
                            <span className="relative">
                              {SetUpEnum.APPRAISAL_TYPE}
                              <span className="text-red-500 text-base">*</span>
                            </span>
                          }
                          name={SetUpEnum.APPRAISAL_TYPE_NAME}
                          options={AppraisalTypeOptions}
                          value={values.appraisal_type}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setFieldValue(
                              SetUpEnum.APPRAISAL_TYPE_NAME,
                              e.target.value
                            )
                          }
                          disabled={saleType && id}
                        />
                        {setDataRequited && errors && (
                          <span className="text-red-500 text-[11px] absolute">
                            {errors?.appraisal_type as any}
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
                      {SetUpEnum.APPROACH_TYPE}
                    </Typography>
                    <FieldArray
                      name={SetUpEnum.APPROACHES}
                      render={(arrayHelpers) => (
                        <Box className="mt-[20px] bg-[#FBFBFB] p-6">
                          {values.approaches.map(
                            (field: { name: string }, index: number) => {
                              return (
                                <Grid
                                  container
                                  spacing={2}
                                  key={index}
                                  className="mt-1"
                                  alignItems="center"
                                >
                                  <Grid
                                    item
                                    xs={4}
                                    xl={3}
                                    className="selectFixedHeight"
                                  >
                                    <SelectTextField
                                      label={
                                        <span className="relative">
                                          {SetUpEnum.APPROACH_TYPE_LABEL}
                                          <span className="text-red-500 text-base m-0 p-0">
                                            *
                                          </span>
                                        </span>
                                      }
                                      name={`${SetUpEnum.APPROACHES}[${index}].${SetUpEnum.TYPE}`}
                                      value={values.approaches[index].type}
                                      onChange={(e) => {
                                        setFieldValue(
                                          `${SetUpEnum.APPROACHES}[${index}].${SetUpEnum.TYPE}`,
                                          e.target.value
                                        );
                                      }}
                                      options={filteredOptions} // Use the filtered options here
                                    />
                                    {errors && setDataRequited && (
                                      <div className="text-red-500 text-[11px] absolute">
                                        {Array.isArray(errors.approaches) &&
                                          errors.approaches[index] &&
                                          typeof errors.approaches[index] ===
                                          'object' &&
                                          (errors.approaches[index] as any)
                                            .type}
                                      </div>
                                    )}
                                    {setDataRequited &&
                                      errors &&
                                      typeof errors === 'object' &&
                                      errors.approaches &&
                                      Array.isArray(errors.approaches) &&
                                      errors.approaches.length > 0 && (
                                        <span className="text-red-500 text-[11px] absolute">
                                          {typeof errors.approaches[0] ===
                                            'object' &&
                                            (errors.approaches[0].type as any)}
                                        </span>
                                      )}
                                  </Grid>
                                  <Grid item xs={4} xl={3}>
                                    <StyledField
                                      label={
                                        <span className="relative">
                                          {SetUpEnum.ASSIGN_NAME}
                                          <span className="text-red-500 text-xs absolute !bottom-[2px] !right-[-7px]">
                                            *
                                          </span>
                                        </span>
                                      }
                                      name={`${SetUpEnum.APPROACHES}[${index}].${SetUpEnum.NAME}`}
                                      value={field.name}
                                      style={{
                                        backgroundColor: '#FBFBFB',
                                        borderBottomWidth: '1px',
                                      }}
                                    />
                                  </Grid>
                                  <Grid item xs={3} xl={5}>
                                    {index === values.approaches.length - 1 && (
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
                                          height: '45px',
                                        }}
                                        onClick={() => {
                                          arrayHelpers.insert(
                                            values.approaches.length,
                                            {
                                              type: '',
                                              name: '',
                                            }
                                          );
                                        }}
                                      >
                                        <img
                                          src={group3}
                                          alt="add"
                                          className="mr-2"
                                        />
                                        {SetUpEnum.ADD_MORE}
                                      </CommonButton>
                                    )}
                                  </Grid>
                                  {values.approaches.length > 1 && (
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
                                  )}
                                </Grid>
                              );
                            }
                          )}
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
                      {SetUpEnum.CLIENT_DETAILS}
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
                                {SetUpEnum.SELECT_CLIENT}
                                <span className="text-red-500 text-base">
                                  *
                                </span>
                              </span>
                            }
                            name={SetUpEnum.CLIENT_ID}
                            options={clientListOptions}
                            value={clientId || values.client_id} // Ensure correct default value
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                              const selectedClientId = e.target.value;

                              setFieldValue(
                                SetUpEnum.CLIENT_ID,
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
                            {SetUpEnum.ADD_NEW_CLIENT}
                          </CommonButton>
                          <CreateClientModal
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
                          setValidationSelectTag(values);
                        }}
                        color="primary"
                        type="submit"
                        style={{
                          fontSize: '14px',
                          width: '300px',
                        }}
                      >
                        {AppraisalEnum.SAVE_AND_CONTINUE}
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
      </AppraisalMenu>
    </>
  );
};
