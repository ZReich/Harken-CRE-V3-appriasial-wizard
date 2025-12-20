import React, { useEffect, useState } from 'react';
import { FieldArray, useFormikContext } from 'formik';
import {
  Box,
  Button,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import StyledField from '@/components/styles/StyleFieldEditComp';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  sanitizeInput,
  handleInputChange,
  sanitizeInputDollarSignComps,
} from '@/utils/sanitize';
import { Icons } from '@/components/icons';
import AppraisalMenu from '../set-up/appraisa-menu';
import CommonButton from '@/components/elements/button/Button';
import { AppraisalPhotoPagesEnum } from './OverviewEnum';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useGet } from '@/hook/useGet';
import { ChangeRentRoll, DeleteCompEnum } from '@/pages/comps/enum/CompsEnum';
import warningImage from '../../../images/warning.png';
import { toast } from 'react-toastify';
import { RequestType, useMutate } from '@/hook/useMutate';
export const MultiFamily = () => {
  const { values, handleChange, setFieldValue } =
    useFormikContext<any>();
  const [selectedView, setSelectedView] = useState('summary');
  const [open, setOpen] = useState(false);
  const [pendingView, setPendingView] = useState<any | null>(null);
  const [searchParams] = useSearchParams();
  const [, setValidationSchema] = useState(false);
  const STATE_ID = searchParams.get('appraisalId');
  const [rollType, setRollType] = useState('summary');
  const [matchName, setMatchName] = useState('');
  const id = searchParams.get('id'); // e.g., "927"
  const appraisalId: any = searchParams.get('appraisalId');
  const [rollId, setRollId] = useState<any | null>(null);
  const navigate = useNavigate();
  const [filtereRentRollData, setFilteredRentRollData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const [, setHasIncomeType] = useState(false);
  const [, setHasSaleType] = useState(false);
  const [, setHasCostType] = React.useState(false);
  const [, setHasLeaseType] = React.useState(false);
  const [, setHasRentRollType] = React.useState(false);

  const [filtereIncomeData, setFilteredIncomeData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const [filtereSalesdData, setFilteredSalesData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const [filtereCostdData, setFilteredCostsData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const [filtereLeasedData, setFilteredLeasedData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const type = selectedView;

  const location = useLocation();

  const { data, refetch } = useGet<any>({
    queryKey: 'appraisals/get',
    endPoint: `appraisals/get/${id}`,
    config: { enabled: Boolean(id && STATE_ID), refetchOnWindowFocus: false },
  });

  // get the rollid before rendering
  useEffect(() => {
    if (rollId) {
      localStorage.setItem('rollId', rollId); // Persist rollId on success
    }
  }, [rollId]);
  // set the rolltype in the local storage before rendering the screen
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    const appraisalId = params.get('appraisalId');

    if (location.pathname === '/rent-roll' && id && appraisalId) {
      // Store rollType if the user is on /rent-roll and both parameters exist
      localStorage.setItem('rollType', rollType); // Replace "yourValue" with actual value
    } else {
      localStorage.removeItem('rollType');
    }
  }, [location]);
  // Get the  default appraisal id
  useEffect(() => {
    fetchComposData();
  }, [appraisalId]);
  // call the get-api before rendering the screen
  useEffect(() => {
    fetchComposData();
  }, []);
  const fetchComposData = async () => {
    try {
      const response = await axios.get(
        `appraisals/get-rent-roll?appraisalId=${id}&appraisalApproachId=${appraisalId}`
      );

      const rollData = response?.data?.data?.data;
      const statusCode = response?.data?.data?.statusCode;

      if (statusCode === 200) {
        setSelectedView(response?.data?.data?.data?.type);

        setRollType(response?.data?.data?.data?.type);
        setFieldValue('rent_rolls', rollData?.rent_rolls || []);
        setRollId(response?.data?.data?.data?.id);
      } else if (statusCode === 404) {
        setSelectedView('summary');
        setRollType('summary');
        localStorage.setItem('rollType', 'summary');

        const resetRentRolls = [
          {
            id: '',
            appraisal_rent_roll_type_id: '',
            beds: '',
            baths: '',
            unit: '',
            rent: '',
            tenant_exp: '',
            description: '',
            lease_expiration: '',
            sq_ft: '',
            unit_count: '',
            avg_monthly_rent: null,
            date_created: '',
            last_updated: '',
          },
        ];
        setFieldValue('rent_rolls', resetRentRolls);
      }
    } catch (error) {
      console.error('Error fetching comps data:', error);
    }
  };

  // api to get the current position of the url
  const { mutateAsync } = useMutate<ResponseType, any>({
    queryKey: 'appraisals/update-position',
    endPoint: `appraisals/update-position/${id}`,
    requestType: RequestType.PATCH,
  });

  // get the matched id of current item

  useEffect(() => {
    const fetchData = async () => {
      if (STATE_ID) {
        const matchedItem = data?.data?.data?.appraisal_approaches.find(
          (item: { id: any }) => item.id == STATE_ID
        );
        if (matchedItem) {
          setMatchName(matchedItem.name);
        }
      }
    };
    fetchData();
  }, [data?.data?.data, STATE_ID, refetch, mutateAsync]);

  // check the length of the all the approaches from the appraisal-approaches
  useEffect(() => {
    if (data?.data?.data?.appraisal_approaches && !data.isStale) {
      const updateData = data.data.data.appraisal_approaches;

      const incomeApproaches = updateData.filter(
        (item: { type: string }) => item.type === 'income'
      );

      setHasIncomeType(incomeApproaches.length > 0);
      setFilteredIncomeData(incomeApproaches); // Ensure this state updates

      const salesApproaches = updateData.filter(
        (item: { type: string }) => item.type === 'sale'
      );
      setHasSaleType(salesApproaches.length > 0);
      setFilteredSalesData(salesApproaches);

      const rentRollApproaches = updateData.filter(
        (item: { type: string }) => item.type === 'rent_roll'
      );
      setHasRentRollType(rentRollApproaches.length > 0);
      setFilteredRentRollData(rentRollApproaches);

      const costApproaches = updateData.filter(
        (item: { type: string }) => item.type === 'cost'
      );
      setHasCostType(costApproaches.length > 0);
      setFilteredCostsData(costApproaches);

      const leaseApproaches = updateData.filter(
        (item: { type: string }) => item.type === 'lease'
      );
      setHasLeaseType(leaseApproaches.length > 0);
      setFilteredLeasedData(leaseApproaches);
    }
  }, [data, data?.data?.data?.appraisal_approaches]);
  // handlesubmit for save the rent-roll data
  const handleSubmit = () => {
    setValidationSchema(true);

    if (!values?.rent_rolls || values.rent_rolls.length === 0) {
      console.error('No rent roll data available!');
      return;
    }

    let details;
    if (selectedView === 'summary') {
      details = values.rent_rolls.map((item: any) => ({
        beds: item.beds ? Number(item.beds.replace(/,/g, '')) : null,
        baths: item.baths ? Number(item.baths.replace(/,/g, '')) : null,
        sq_ft: item.sq_ft ? Number(item.sq_ft.replace(/,/g, '')) : null,
        unit_count: item.unit_count
          ? Number(item.unit_count.replace(/,/g, ''))
          : null,
        avg_monthly_rent: item.avg_monthly_rent,
      }));
    } else {
      details = values.rent_rolls.map((item: any) => ({
        beds: item.beds ? Number(item.beds?.replace(/,/g, '')) : null,
        baths: item.baths ? Number(item.baths?.replace(/,/g, '')) : null,
        rent: Number(item.rent?.replace(/[$,]/g, '')),
        unit: item.unit,
        tenant_exp: item.tenant_exp,
        description: item.description,
        lease_expiration: item.lease_expiration,
      }));
    }

    const params = {
      appraisal_id: id,
      appraisal_approach_id: appraisalId,
      type,
      rent_rolls: details,
    };

    axios
      .post('appraisals/save-rent-roll', params)
      .then((response) => {
        setValidationSchema(true);

        if (response.data?.data?.data?.id) {
          localStorage.setItem('rollId', response.data.data.data.id);
          setFieldValue(
            'rent_rolls',
            response.data.data.data?.rent_rolls || []
          );
          setRollId(response.data.data.data.id);
        }

        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        toast(response.data.data.message);

        const appraisalApproaches =
          data?.data?.data?.appraisal_approaches || [];

        // ** Function to get the next approach ID **
        const getNextApproachId = (
          currentId: string | number,
          approaches: any[]
        ) => {
          const currentIndex = approaches.findIndex(
            (item) => item.id == currentId
          );

          if (currentIndex !== -1 && currentIndex < approaches.length - 1) {
            for (let i = currentIndex + 1; i < approaches.length; i++) {
              if (approaches[i].type === 'rent_roll') {
                return { type: 'rent_roll', id: approaches[i].id };
              }
            }
          }

          // If rent_roll is last, check in order: sale → cost → lease → exhibits
          if (filtereSalesdData?.length) {
            return { type: 'sale', id: filtereSalesdData[0].id };
          }
          if (filtereCostdData?.length) {
            return { type: 'cost', id: filtereCostdData[0].id };
          }
          if (filtereLeasedData?.length) {
            return { type: 'lease', id: filtereLeasedData[0].id };
          }

          return null; // No next approach found, navigate to exhibits
        };

        const nextApproach = getNextApproachId(
          appraisalId,
          appraisalApproaches
        );
        // ** Navigation Logic **
        if (nextApproach) {
          switch (nextApproach?.type) {
            case 'rent_roll':
              navigate(`/rent-roll?id=${id}&appraisalId=${nextApproach.id}`);
              setRollId('');

              break;
            case 'sale':
              navigate(`/sales-approach?id=${id}&salesId=${nextApproach.id}`);
              break;
            case 'cost':
              navigate(`/cost-approach?id=${id}&costId=${nextApproach.id}`);
              break;
            case 'lease':
              navigate(`/lease-approach?id=${id}&leaseId=${nextApproach.id}`);
              break;
            default:
              navigate(`/appraisal-exhibits?id=${id}`);
          }
        } else {
          navigate(`/appraisal-exhibits?id=${id}`);
        }
      })
      .catch((error) => {
        console.error('Error saving data:', error);
      });
  };
  // handlesubmit for update the rent-roll data

  const handleUpdateSubmit = () => {
    setValidationSchema(true);

    if (!values?.rent_rolls || values.rent_rolls.length === 0) {
      console.error('No rent roll data available!');
      return;
    }

    let details;
    if (selectedView === 'summary') {
      details = values.rent_rolls.map((item: any) => ({
        beds: item?.beds ? Number(String(item.beds).replace(/,/g, '')) : null,
        baths: item.baths ? Number(String(item.baths).replace(/,/g, '')) : null,
        sq_ft: item.sq_ft ? Number(String(item.sq_ft).replace(/,/g, '')) : null,
        unit_count: item.unit_count
          ? Number(String(item.unit_count).replace(/,/g, ''))
          : null,
        avg_monthly_rent: item.avg_monthly_rent
          ? Number(String(item.avg_monthly_rent)?.replace(/,/g, ''))
          : null,
      }));
    } else {
      details = values.rent_rolls.map((item: any) => ({
        beds: item.beds ? Number(String(item.beds)?.replace(/,/g, '')) : null,
        baths: item.baths
          ? Number(String(item.baths)?.replace(/,/g, ''))
          : null,
        rent: Number(String(item.rent)?.replace(/[$,]/g, '')),
        unit: item.unit,
        tenant_exp: item.tenant_exp,
        description: item.description,
        lease_expiration: item.lease_expiration,
      }));
    }

    const params = {
      appraisal_id: id,
      appraisal_approach_id: appraisalId,
      type,
      rent_rolls: details,
    };

    axios
      .post(`appraisals/update-rent-roll/${rollId}`, params)
      .then((response) => {
        setValidationSchema(false);
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        toast(response.data.data.message);

        const appraisalApproaches =
          data?.data?.data?.appraisal_approaches || [];

        // ** Find the current Rent Roll index **
        const currentIndex = appraisalApproaches.findIndex(
          (item: any) => item.id == appraisalId
        );

        // ** If Rent Roll is Last, Navigate to Next Approach in Order **
        if (currentIndex === appraisalApproaches.length - 1) {
          const nextSale = appraisalApproaches.find(
            (item: any) => item.type === 'sale'
          );
          if (nextSale) {
            navigate(
              `/sales-approach?id=${id}&salesId=${filtereSalesdData?.[0]?.id}`
            );
            return;
          }

          const nextCost = appraisalApproaches.find(
            (item: any) => item.type === 'cost'
          );
          if (nextCost) {
            navigate(
              `/cost-approach?id=${id}&costId=${filtereCostdData?.[0]?.id}`
            );
            return;
          }

          const nextLease = appraisalApproaches.find(
            (item: any) => item.type === 'lease'
          );
          if (nextLease) {
            navigate(
              `/lease-approach?id=${id}&leaseId=${filtereLeasedData?.[0]?.id}`
            );
            return;
          }

          // ** If No Sale, Cost, or Lease → Navigate to Appraisal Exhibits **
          navigate(`/appraisal-exhibits?id=${id}`);
          return;
        }

        // ** If Rent Roll is NOT the Last, Go to Next Approach **
        const nextApproach = appraisalApproaches[currentIndex + 1];
        if (nextApproach) {
          switch (nextApproach.type) {
            case 'rent_roll':
              navigate(`/rent-roll?id=${id}&appraisalId=${nextApproach.id}`);
              setRollId('');

              break;
            case 'sale':
              navigate(
                `/sales-approach?id=${id}&salesId=${filtereSalesdData?.[0]?.id}`
              );
              break;
            case 'cost':
              navigate(
                `/cost-approach?id=${id}&costId=${filtereCostdData?.[0]?.id}`
              );
              break;
            case 'lease':
              navigate(
                `/lease-approach?id=${id}&leaseId=${filtereLeasedData?.[0]?.id}`
              );
              break;
            default:
              navigate(`/appraisal-exhibits?id=${id}`);
          }
        } else {
          navigate(`/appraisal-exhibits?id=${id}`);
        }
      })
      .catch((error) => {
        console.error('Error updating data:', error);
      });
  };
  // toggle fucntion for toggle summary to detail and vice-versa
  const toggleDataHandle = () => {
    if (!values?.rent_rolls || values.rent_rolls.length === 0) {
      console.error('No rent roll data available!');
      return;
    }

    const details: any[] = []; // Allows details to hold any type of values

    const params = {
      appraisal_id: id,
      appraisal_approach_id: appraisalId,
      type,
      rent_rolls: details, // Send empty array instead of nulling values
    };

    axios
      .post('appraisals/save-rent-roll', params)
      .then((response) => {
        setRollId(response.data.data?.data?.id);
        setValidationSchema(false);
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        toast(response.data.data.message);
      })
      .catch((error) => {
        console.error('Error saving data:', error);
      });
  };

  const toggleUpdateDataHandle = () => {
    if (!values?.rent_rolls || values.rent_rolls.length === 0) {
      console.error('No rent roll data available!');
      return;
    }

    const details: any[] = []; // Allows details to hold any type of values

    const params = {
      appraisal_id: id,
      appraisal_approach_id: appraisalId,
      type,
      rent_rolls: details, // Send empty array instead of nulling values
    };

    axios
      .post(`appraisals/update-rent-roll/${rollId}`, params)
      .then((response) => {
        setValidationSchema(false);
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        toast(response.data.data.message);
      })
      .catch((error) => {
        console.error('Error saving data:', error);
      });
  };
  // Set "open" to "close" in localStorage on initial render
  useEffect(() => {
    {
      localStorage.setItem('open', 'close');
    }
  }, []);

  // function for to cancel the modal
  const handleCancel = () => {
    setOpen(false);
  };

  useEffect(() => {
    const activeView = rollType;
    setSelectedView(activeView);
  }, [rollType]);
  // handle toggle for toggle between the summary and detail option
  const handleToggle = (view: string | null, values: any) => {
    setValidationSchema(false);
    if (!view || view === selectedView) return;

    setPendingView(view);
    localStorage.setItem('open', 'close');

    const rentRolls = values?.rent_rolls || [];
    if (!rentRolls.length) {
      console.log(' No rent rolls found.');
      return;
    }

    const allEmpty = rentRolls.every((item: any) => {
      return Object.entries(item).every(([key, value]) => {
        if (key === 'appraisal_rent_roll_type_id') return true; // ignore this key
        return value === null || value === '' || value === undefined;
      });
    });
    if (!allEmpty) {
      localStorage.setItem('open', 'open');
      setOpen(true);
    } else {
      setSelectedView(view);
    }
  };
  // handle confirm function for check the value in the inpunt fields

  const handleConfirmSwitch = () => {
    // Clear rent_rolls by resetting it to one default row
    setFieldValue('rent_rolls', [
      {
        appraisal_rent_roll_type_id: rollId,
        beds: null,
        baths: null,
        sq_ft: null,
        unit_count: null,
        avg_monthly_rent: null,
        description: '',
        tenant_exp: null,
        lease_expiration: null,
        unit: null,
        rent:null,
      },
    ]);

    // Save the new view in localStorage and switch after confirmation
    localStorage.setItem('rollType', rollType);
    if (rollId) {
      toggleUpdateDataHandle();
    } else {
      toggleDataHandle();
    }
    // handleClickToggle();
    // handleClickToggle();
    setSelectedView(pendingView);
    localStorage.setItem('open', 'close');

    // Now apply the toggle
    setOpen(false); // Close modal
  };
  // fucntion for to add multiple rows
  const handleAddRow = (arrayHelpers: any) => {
    const activeView = localStorage.getItem('rollType') || 'summary';

    const newRow = {
      id: null,
      beds: null,
      baths: null,
      sq_ft: null,
      unit_count: null,
      avg_monthly_rent: null,
      description: '',
      tenant_exp: null,
      lease_expiration: null,
      unit: null,
      rent: null,
    };

    // Insert row based on activeView
    if (activeView === 'summary') {
      arrayHelpers.insert(values.rent_rolls.length, newRow);
    } else {
      arrayHelpers.insert(values.rent_rolls.length, newRow);
    }
  };

  // handleclick function to check wether save or update the rent-roll

  const handleClick = () => {
    if (rollId) {
      handleUpdateSubmit();
    } else {
      handleSubmit();
    }
  };

  return (
    <>
      {/*show the header */}
      <AppraisalMenu>
        {/* show the rent-roll with the approach name */}
        <div className="flex items-center justify-between bg-white z-[11] map-header-sticky px-14 py-3 border-0 border-b border-[#eee] border-solid">
          <Typography
            variant="h1"
            component="h2"
            className="text-xl font-bold uppercase"
          >
            Rent Roll({matchName})
          </Typography>

          <Box>
            <ToggleButtonGroup
              value={selectedView}
              exclusive
              onChange={(_e, v) => handleToggle(v, values)} // Ensure values are passed
              sx={{ backgroundColor: '#D9D9D9', borderRadius: '5px', p: 0.4 }}
              className="cursor-pointer"
            >
              <Tooltip title="Summary">
                <ToggleButton
                  className={
                    selectedView === 'summary'
                      ? 'bg-[#0DA1C7] text-white rounded-[4px] px-5'
                      : 'bg-[#D9D9D9] text-black px-5'
                  }
                  value="summary"
                  sx={{
                    fontSize: '11px',
                    padding: '7px 15px !important',
                    border: 'none',
                  }}
                >
                  Summary
                </ToggleButton>
              </Tooltip>

              <Tooltip title="Detail">
                <ToggleButton
                  className={
                    selectedView === 'detail'
                      ? 'bg-[#0DA1C7] text-white rounded-[4px] px-5'
                      : 'bg-[#D9D9D9] text-black px-5'
                  }
                  value="detail"
                  sx={{
                    fontSize: '11px',
                    padding: '7px 15px !important',
                    border: 'none',
                  }}
                >
                  Detailed
                </ToggleButton>
              </Tooltip>
            </ToggleButtonGroup>

            {open && (
              <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-10">
                <div className="w-[383px] h-[320px] rounded-[14px] bg-white shadow-lg fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="flex justify-center pt-4">
                    <img src={warningImage} className="h-[75px] w-[94px]" />
                  </div>
                  <p className="text-center text-xl font-bold">
                    {DeleteCompEnum.ARE_YOU_SURE}
                  </p>
                  <div className="flex w-full justify-center px-4">
                    <div className="text-sm font-medium w-[322px] h-[40px] text-center">
                      {ChangeRentRoll.WARNING_MESSAGE}
                    </div>
                  </div>
                  <div className="flex justify-center pb-2">
                    <CommonButton
                      variant="contained"
                      color="primary"
                      style={{
                        width: '315px',
                        height: '40px',
                        borderRadius: '5px',
                        marginTop: '30px',
                        backgroundColor: 'rgba(246, 104, 96, 1)',
                      }}
                      onClick={handleConfirmSwitch}
                    >
                      {ChangeRentRoll.OK}
                    </CommonButton>
                  </div>
                  <div className="flex justify-center pb-4">
                    <CommonButton
                      variant="contained"
                      color="primary"
                      style={{
                        width: '315px',
                        height: '40px',
                        borderRadius: '5px',
                        marginTop: '10px',
                        backgroundColor: 'rgba(221, 221, 221, 1)',
                        color: 'rgba(90, 90, 90, 1)',
                      }}
                      onClick={handleCancel} // Use handleCancel instead of close
                    >
                      {DeleteCompEnum.CANCEL}
                    </CommonButton>
                  </div>
                </div>
              </div>
            )}
          </Box>
        </div>
        <Grid container spacing={2} columns={16} className="p-[72px] pt-8">
          <FieldArray
            name="rent_rolls"
            render={(arrayHelpers) => {
              if (!values.rent_rolls || values.rent_rolls.length === 0) {
                arrayHelpers.push({
                  unit: '',
                  beds: '',
                  baths: '',
                  description: '',
                  rent: '',
                  tenant_exp: '',
                  lease_expiration: '',
                });
              }

              return (
                <>
                  {values.rent_rolls.map((_zone: string, i: number) => {
                    return (
                      <Grid container spacing={2} key={i}>
                        {selectedView === 'summary' && (
                          <>
                            <Grid item xs={2} className="pt-4">
                              <StyledField
                                label={
                                  <span className="relative top-[3px] z-10 text-customGray">
                                    Beds
                                  </span>
                                }
                                name={`rent_rolls.${i}.beds`}
                                style={{
                                  borderBottomWidth: '1px',
                                }}
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                  const input = sanitizeInput(e.target.value);
                                  handleInputChange(
                                    handleChange,
                                    `rent_rolls.${i}.beds`,
                                    input
                                  );
                                }}
                                value={values.rent_rolls[
                                  i
                                ].beds?.toLocaleString()}
                                type="text"
                              />
                            </Grid>
                            <Grid item xs={2} className="pt-4">
                              <StyledField
                                label={
                                  <span className="relative top-[3px] z-10 text-customGray">
                                    Baths
                                  </span>
                                }
                                name={`rent_rolls.${i}.baths`}
                                style={{
                                  borderBottomWidth: '1px',
                                }}
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                  const input = sanitizeInput(e.target.value);
                                  handleInputChange(
                                    handleChange,
                                    `rent_rolls.${i}.baths`,
                                    input
                                  );
                                }}
                                value={values.rent_rolls[
                                  i
                                ].baths?.toLocaleString()}
                                type="text"
                              />
                            </Grid>
                            <Grid item xs={2} className="pt-4">
                              <StyledField
                                label={
                                  <span className="relative top-[3px] z-10 text-customGray">
                                    SQ.FT.
                                  </span>
                                }
                                name={`rent_rolls.${i}.sq_ft`}
                                style={{
                                  borderBottomWidth: '1px',
                                }}
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                  const input = sanitizeInput(e.target.value);
                                  handleInputChange(
                                    handleChange,
                                    `rent_rolls.${i}.sq_ft`,
                                    input
                                  );
                                }}
                                value={values.rent_rolls[
                                  i
                                ].sq_ft?.toLocaleString()}
                                type="text"
                              />
                            </Grid>
                            <Grid item xs={2} className="pt-4">
                              <StyledField
                                label={
                                  <span className="relative top-[3px] z-10 text-customGray">
                                    Unit Count
                                  </span>
                                }
                                name={`rent_rolls.${i}.unit_count`}
                                style={{
                                  borderBottomWidth: '1px',
                                }}
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                  const input = sanitizeInput(e.target.value);
                                  handleInputChange(
                                    handleChange,
                                    `rent_rolls.${i}.unit_count`,
                                    input
                                  );
                                }}
                                value={values.rent_rolls[
                                  i
                                ].unit_count?.toLocaleString()}
                                type="text"
                              />
                            </Grid>
                            <Grid item xs={2} className="pt-4">
                              <StyledField
                                label={
                                  <span className="relative top-[3px] z-10 text-customGray">
                                    Average Monthly Rent
                                  </span>
                                }
                                name={`rent_rolls.${i}.avg_monthly_rent`}
                                style={{
                                  borderBottomWidth: '1px',
                                }}
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                  const formattedValue =
                                    sanitizeInputDollarSignComps(
                                      e.target.value
                                    );
                                  let numericValue = formattedValue.replace(
                                    /[^0-9.]/g,
                                    ''
                                  ); // Keep numeric + decimal

                                  // Ensure two decimal places
                                  if (
                                    numericValue &&
                                    !numericValue.includes('.')
                                  ) {
                                    numericValue = `${numericValue}.00`;
                                  } else if (numericValue.includes('.')) {
                                    const [integerPart, rawDecimalPart] =
                                      numericValue.split('.');
                                    const decimalPart = (
                                      rawDecimalPart + '00'
                                    ).slice(0, 2); // Ensure 2 decimal places
                                    numericValue = `${integerPart}.${decimalPart}`;
                                  }

                                  handleInputChange(
                                    handleChange,
                                    `rent_rolls.${i}.avg_monthly_rent`,
                                    numericValue
                                  );
                                }}
                                value={
                                  values.rent_rolls[i]?.avg_monthly_rent !==
                                    undefined &&
                                    values.rent_rolls[i]?.avg_monthly_rent !==
                                    null
                                    ? sanitizeInputDollarSignComps(
                                      parseFloat(
                                        values.rent_rolls[i]?.avg_monthly_rent
                                      ).toFixed(2) // Ensure two decimal places
                                    )
                                    : ''
                                }
                                type="text"
                              />
                            </Grid>

                            {i ? (
                              <Grid className="flex items-center me-2 pt-3.5">
                                <div onClick={() => arrayHelpers.remove(i)}>
                                  <Icons.RemoveCircleOutlineIcon className="text-red-500 cursor-pointer" />
                                </div>
                              </Grid>
                            ) : (
                              <Grid />
                            )}
                            <Grid className="flex items-center pt-3.5">
                              {i === values.rent_rolls.length - 1 && (
                                <div onClick={() => handleAddRow(arrayHelpers)}>
                                  <Icons.AddCircleOutlineIcon className="cursor-pointer text-customDeeperSkyBlue" />
                                </div>
                              )}
                            </Grid>
                          </>
                        )}
                        {selectedView === 'detail' && (
                          <>
                            <Grid item xs={1.5} className="pt-5">
                              <StyledField
                                label={
                                  <span className="relative top-[3px] z-10 text-customGray">
                                    Unit #
                                    <span className="text-red-500 pt-1 pl-0.5 text-base">
                                      *
                                    </span>
                                  </span>
                                }
                                name={`rent_rolls.${i}.unit`}
                                style={{ borderBottomWidth: '1px' }}
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                  handleInputChange(
                                    handleChange,
                                    `rent_rolls.${i}.unit`,
                                    e.target.value
                                  );
                                }}
                                value={values.rent_rolls?.[i]?.unit || ''}
                                type="text"
                              />
                              {/* {validationSchema && errors && (
                                <div className="text-red-500  text-[11px] absolute">
                                  {Array.isArray(errors.rent_rolls) &&
                                    errors.rent_rolls[i] &&
                                    typeof errors.rent_rolls[i] === 'object' &&
                                    (errors.rent_rolls[i] as any).unit}
                                </div>
                              )} */}
                            </Grid>

                            <Grid item xs={1.5} className="pt-7">
                              <StyledField
                                label={
                                  <span className="relative top-[3px] z-10 text-customGray">
                                    Bed
                                  </span>
                                }
                                name={`rent_rolls.${i}.beds`}
                                style={{ borderBottomWidth: '1px' }}
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                  const sanitizedValue = sanitizeInput(
                                    e.target.value
                                  );
                                  handleInputChange(
                                    handleChange,
                                    `rent_rolls.${i}.beds`,
                                    sanitizedValue
                                  );
                                }}
                                value={
                                  values.rent_rolls[i]?.beds !== undefined &&
                                    values.rent_rolls[i]?.beds !== null
                                    ? sanitizeInput(
                                      values.rent_rolls[i]?.beds.toString()
                                    )
                                    : ''
                                }
                                type="text"
                              />
                            </Grid>

                            <Grid item xs={1.5} className="pt-7">
                              <StyledField
                                label={
                                  <span className="relative top-[3px] z-10 text-customGray">
                                    Bath
                                  </span>
                                }
                                name={`rent_rolls.${i}.baths`}
                                style={{ borderBottomWidth: '1px' }}
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                  const sanitizedValue = sanitizeInput(
                                    e.target.value
                                  );
                                  handleInputChange(
                                    handleChange,
                                    `rent_rolls.${i}.baths`,
                                    sanitizedValue
                                  );
                                }}
                                value={
                                  values.rent_rolls[i]?.baths !== undefined &&
                                    values.rent_rolls[i]?.baths !== null
                                    ? sanitizeInput(
                                      values.rent_rolls[i]?.baths.toString()
                                    )
                                    : ''
                                }
                                type="text"
                              />
                            </Grid>

                            <Grid item xs={1.5} className="pt-7">
                              <StyledField
                                label={
                                  <span className="relative top-[3px] z-10 text-customGray">
                                    Description
                                  </span>
                                }
                                name={`rent_rolls.${i}.description`}
                                style={{ borderBottomWidth: '1px' }}
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                  handleInputChange(
                                    handleChange,
                                    `rent_rolls.${i}.description`,
                                    e.target.value
                                  );
                                }}
                                value={values.rent_rolls[i]?.description || ''}
                                type="text"
                              />
                            </Grid>

                            <Grid item xs={1.5} className="pt-5">
                              <StyledField
                                label={
                                  <span className="relative top-[3px] z-10 text-customGray">
                                    Rent
                                    <span className="text-red-500 pt-1 pl-0.5 text-base">
                                      *
                                    </span>
                                  </span>
                                }
                                name={`rent_rolls.${i}.rent`}
                                style={{ borderBottomWidth: '1px' }}
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                  const formattedValue =
                                    sanitizeInputDollarSignComps(
                                      e.target.value
                                    );
                                  let numericValue = formattedValue.replace(
                                    /[^0-9.]/g,
                                    ''
                                  ); // Keep numeric + decimal

                                  // Ensure two decimal places
                                  if (
                                    numericValue &&
                                    !numericValue.includes('.')
                                  ) {
                                    numericValue = `${numericValue}.00`;
                                  } else if (numericValue.includes('.')) {
                                    const [integerPart, rawDecimalPart] =
                                      numericValue.split('.');
                                    const decimalPart = (
                                      rawDecimalPart + '00'
                                    ).slice(0, 2); // Ensure 2 decimal places
                                    numericValue = `${integerPart}.${decimalPart}`;
                                  }

                                  handleInputChange(
                                    handleChange,
                                    `rent_rolls.${i}.rent`,
                                    numericValue
                                  );
                                }}
                                value={
                                  values.rent_rolls[i]?.rent !== undefined &&
                                    values.rent_rolls[i]?.rent !== null
                                    ? sanitizeInputDollarSignComps(
                                      parseFloat(
                                        values.rent_rolls[i]?.rent
                                      ).toFixed(2) // Ensure two decimal places
                                    )
                                    : ''
                                }
                                type="text"
                              />

                              {/* {validationSchema && errors && (
                                <div className="text-red-500  text-[11px] absolute">
                                  {Array.isArray(errors.rent_rolls) &&
                                    errors.rent_rolls[i] &&
                                    typeof errors.rent_rolls[i] === 'object' &&
                                    (errors.rent_rolls[i] as any).rent}
                                </div>
                              )} */}
                            </Grid>

                            <Grid item xs={1.5} className="pt-7">
                              <StyledField
                                label={
                                  <span className="relative top-[3px] z-10 text-customGray">
                                    Tenant Exp.
                                  </span>
                                }
                                name={`rent_rolls.${i}.tenant_exp`}
                                style={{ borderBottomWidth: '1px' }}
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                  handleInputChange(
                                    handleChange,
                                    `rent_rolls.${i}.tenant_exp`,
                                    e.target.value
                                  );
                                }}
                                value={values.rent_rolls?.[i]?.tenant_exp || ''}
                                type="text"
                              />
                            </Grid>

                            <Grid item xs={1.5} className="pt-7">
                              <StyledField
                                label={
                                  <span className="relative top-[3px] z-10 text-customGray">
                                    Lease Expiration
                                  </span>
                                }
                                name={`rent_rolls.${i}.lease_expiration`}
                                style={{ borderBottomWidth: '1px' }}
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                  handleInputChange(
                                    handleChange,
                                    `rent_rolls.${i}.lease_expiration`,
                                    e.target.value
                                  );
                                }}
                                value={
                                  values.rent_rolls?.[i]?.lease_expiration || ''
                                }
                                type="text"
                              />
                            </Grid>

                            {values.rent_rolls.length > 1 && (
                              <Grid className="flex items-center me-2 pt-3.5">
                                <div onClick={() => arrayHelpers.remove(i)}>
                                  <Icons.RemoveCircleOutlineIcon className="text-red-500 cursor-pointer" />
                                </div>
                              </Grid>
                            )}

                            <Grid className="flex items-center pt-3.5">
                              {i === values.rent_rolls.length - 1 && (
                                <div onClick={() => handleAddRow(arrayHelpers)}>
                                  <Icons.AddCircleOutlineIcon className="cursor-pointer text-customDeeperSkyBlue" />
                                </div>
                              )}
                            </Grid>
                          </>
                        )}
                      </Grid>
                    );
                  })}
                </>
              );
            }}
          />

          <div className="flex gap-3 justify-center items-center fixed inset-x-0 bottom-0 bg-white py-5 z-10">
            <Button
              variant="contained"
              color="primary"
              size="small"
              className="appraisal-previous-button text-xs !p-0 text-white font-medium h-[40px]"
              onClick={() => {
                if (filtereRentRollData && filtereRentRollData.length > 1) {
                  const rentRollIndex = filtereRentRollData.findIndex(
                    (element: any) => element.id == appraisalId
                  );

                  if (rentRollIndex > 0) {
                    const previousRentRollId =
                      filtereRentRollData[rentRollIndex - 1].id;

                    navigate(
                      `/rent-roll?id=${id}&appraisalId=${previousRentRollId}`
                    );
                    return;
                  }
                }

                // If there is only one rent roll or no rent roll, check for income approach
                if (filtereIncomeData?.length > 0) {
                  const lastIncomeIndex = filtereIncomeData.length - 1;
                  const lastIncomeId = filtereIncomeData[lastIncomeIndex]?.id;

                  if (lastIncomeId) {
                    navigate(
                      `/income-approch?id=${id}&IncomeId=${lastIncomeId}`
                    );
                    return;
                  }
                }

                // If no rent roll or income approach exists, navigate to area info
                navigate(`/area-info?id=${id}`);
              }}
            >
              <Icons.ArrowBackIcon className="cursor-pointer text-sm" />
            </Button>

            <CommonButton
              type="submit"
              variant="contained"
              color="primary"
              size="small"
              style={{
                width: '270px',
                fontSize: '14px',
              }}
              onClick={() => handleClick()}
            >
              {AppraisalPhotoPagesEnum.SAVE_AND_CONTINUE}
              <Icons.ArrowForwardIcon className="cursor-pointer text-sm" />
            </CommonButton>
          </div>
        </Grid>
      </AppraisalMenu>
    </>
  );
};
