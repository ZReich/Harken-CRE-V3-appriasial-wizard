import React, { useEffect, useRef, useState } from 'react';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Icons } from '@/components/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { roundingOptions } from '@/pages/comps/comp-form/fakeJson';
// import { useGet } from '@/hook/useGet';
import axios from 'axios';
// import { RequestType, useMutate } from '@/hook/useMutate';
import ResidentialMenuOptions from '../../set-up/residential-menu-option';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useSelector } from 'react-redux';

// import { useGet } from '@/hook/useGet';
import { usa_state } from '@/pages/comps/comp-form/fakeJson';
import {
  Modal,
  Box,
  Typography,
  Button,
  Stack,
  FormControl,
  Select,
  ListSubheader,
  TextField,
  MenuItem,
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import TextEditor from '@/components/styles/text-editor';

import { useGet } from '@/hook/useGet';
import { RoundingValues } from '../../Enum/evaluation-enums';
import moment from 'moment';
import { RootState } from '@/utils/store';

import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
const modalStyle = {
  position: 'absolute',
  top: '25%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 430,
  bgcolor: 'background.paper',
  borderRadius: 1,
  // boxShadow: 24,
  p: 4,
  textAlign: 'center',
};
const ResidentialReview = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [reviewData, setReviewData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [evaluationDetails, setEvaluationDetails] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [analysisType, setAnalysisType] = useState<string>(''); // or 'land_only' as default

  const [salesNote, setSalesNote] = useState('new');
  const [dropdown1Value, setDropdown1Value] = useState('');
  const [dropdown2Value, setDropdown2Value] = useState<Date | null>(null);
  const [dropdown1Open, setDropdown1Open] = useState(false);
  // const [dropdown2Open, setDropdown2Open] = useState(false);
  const [userOptions, setUserOptions] = useState<
    { id: number; name: string }[]
  >([]);
  const [filteredUserOptions, setFilteredUserOptions] = useState<
    { id: number; name: string }[]
  >([]);
  const [searchText, setSearchText] = useState('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const searchTimeoutRef = useRef<number | null>(null);
  const navigate = useNavigate();
  const [isReviewDateEditable, setIsReviewDateEditable] = useState(false);
  // Add a state to track if review date was ever filled
  console.log(setAnalysisType, isLoadingUsers);
  const [hasReviewDateBeenSet, setHasReviewDateBeenSet] = useState(false);
  const [openDatePicker, setOpenDatePicker] = useState(false);

  // const selectedUser = useMemo(() => {
  //   return userOptions.find((user) => user.id === Number(dropdown1Value));
  // }, [dropdown1Value, userOptions]);
  const userId = useSelector((state: RootState) => state.user.id);
  const datePickerRef = useRef(null);

  console.log(loading, setEvaluationDetails);
  const fetchReviewData = async () => {
    try {
      const response = await axios.get(`/res-evaluations/get-review/${id}`);
      setReviewData(response.data);
      setSalesNote(response?.data?.data?.data?.review_summary);

      // Set the reviewed_by and review_date from the API response
      const reviewData = response?.data?.data?.data;
      if (reviewData?.reviewed_by) {
        setDropdown1Value(reviewData.reviewed_by.toString());
        // Check if current user is the reviewer
        if (
          userId &&
          reviewData.reviewed_by &&
          String(userId) === reviewData.reviewed_by.toString()
        ) {
          setIsReviewDateEditable(true);
        } else {
          setIsReviewDateEditable(false);
        }
      } else {
        setIsReviewDateEditable(false);
      }
      if (reviewData?.review_date) {
        // Convert the review_date string to Date object
        setDropdown2Value(new Date(reviewData.review_date));
        setHasReviewDateBeenSet(true);
      } else {
        setDropdown2Value(null);
        // Only reset hasReviewDateBeenSet if no reviewer is selected
        if (!reviewData?.reviewed_by) {
          setHasReviewDateBeenSet(false);
        }
      }
    } catch (error) {
      console.error('Error fetching review data:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoadingUsers(true);
        const response = await axios.get('user/dropdown');
        if (response.data?.data?.data) {
          // Format the user data for dropdown
          const formattedUsers = response.data.data.data.map((user: any) => ({
            id: user.id,
            name: `${user.first_name} ${user.last_name}`,
          }));
          setUserOptions(formattedUsers);
          // Set all options
          setFilteredUserOptions(formattedUsers);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    // Use Promise.all to fetch data in parallel
    Promise.all([fetchReviewData(), fetchUserData()]).catch((error) =>
      console.error('Error fetching data:', error)
    );

    fetchReviewData();
  }, [id]);

  const formatCurrency = (
    value: number | string | null | undefined
  ): string => {
    if (value === null || value === undefined || value === '') {
      return '$0.00';
    }

    // Convert to number if it's a string
    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    // Check if it's a valid number
    if (isNaN(numValue)) {
      return '$0.00';
    }

    // Format with commas and 2 decimal places
    return numValue.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };
  const { data: evaluationData } = useGet<any>({
    // queryKey: ['evaluation', id],
    queryKey: 'res-evaluations/get',
    endPoint: `res-evaluations/get/${id}`,
    config: {
      enabled: Boolean(id),
      onSuccess: (data: any) => {
        setEvaluationDetails(data?.data?.data);
      },
    },
  });
  console.log(evaluationData);
  // Add this function to your component
  const getFullStateName = (stateAbbr: string | null | undefined): string => {
    if (!stateAbbr) return '';

    const stateMap = usa_state[0];
    const lowerCaseAbbr = stateAbbr.toLowerCase();

    return stateMap[lowerCaseAbbr] || stateAbbr;
  };
  const submitReview = () => {
    setIsModalOpen(true);
    // navigate('/evaluation-list');
  };
  console.log('evallllll', evaluationDetails);
  return (
    <ResidentialMenuOptions>
      <div className="flex items-center border-0 border-b border-[#ccc] border-solid gap-8 text-base">
        <div className="flex flex-1 justify-between w-full">
          <h1 className="text-2xl flex items-center justify-between w-full py-6 pl-12">
            FINAL VALUE REVIEW{' '}
            <span className="text-xs font-normal flex items-center gap-2.5">
              <ErrorOutlineIcon /> You're all done! View your proof, download
              the PDF, and save your document.
            </span>
          </h1>
        </div>
        <div className="flex min-w-80 pl-8 border-0 border-l border-[#ccc] border-solid min-h-20 items-center">
          <div className="complete-button inline-block">
            <div
              onClick={submitReview}
              className="py-2 w-full bg-customBlue text-white px-4 rounded no-underline hover:shadow-lg uppercase text-sm font-medium flex items-center gap-1 cursor-pointer"
            >
              Complete{' '}
              <Icons.ArrowForwardIcon className="cursor-pointer text-sm" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col px-12 mt-5 mb-5 text-lg">
        <h2 className="text-[#0DA1C7] text-3xl mb-3">
          {evaluationDetails?.property_name} |{' '}
          {getFullStateName(evaluationDetails?.state)}
        </h2>

        <p className="text-lg text-[#687F8B]">
          {evaluationDetails?.street_address} |{' '}
          {getFullStateName(evaluationDetails?.state)},{' '}
          {getFullStateName(evaluationDetails?.state)}{' '}
          {/* {evaluationDetails.pin_code} */}
        </p>
        {reviewData?.data?.data?.res_evaluation_scenarios?.map(
          (scenario: any, index: any) => {
            // Skip scenarios that don't have any approach data
            if (
              !scenario ||
              (!scenario.res_evaluation_income_approach &&
                !scenario.res_evaluation_sales_approach &&
                !scenario.res_evaluation_cost_approach)
            ) {
              return null;
            }
            return (
              <React.Fragment key={index}>
                {reviewData?.data?.data?.res_evaluation_scenarios?.length >
                  1 && (
                  <h2 className="text-[#0DA1C7] text-3xl">{scenario.name}</h2>
                )}{' '}
                <div className="table bg-[#F1F3F4] rounded py-5 px-3">
                  <div className="grid grid-cols-5">
                    <div className="py-1 px-4 text-xs text-[#223c48] font-bold uppercase">
                      Market Value Breakdown
                    </div>
                    <div className="py-1 px-4 text-xs text-[#223c48] font-bold uppercase">
                      Value Indicated
                    </div>
                    <div className="py-1 px-4 text-xs text-[#223c48] font-bold uppercase">
                      Weighting
                    </div>
                    <div className="py-1 px-4 text-xs text-[#223c48] font-bold uppercase">
                      Incremental Value
                    </div>
                    <div className="py-1 px-4 text-xs text-[#223c48] font-bold uppercase">
                      $/SF
                    </div>
                  </div>

                  {['income', 'sales', 'cost'].map((approach) => {
                    const approachKey = `res_evaluation_${approach}_approach`;
                    const data = scenario[approachKey]; // Use current scenario
                    if (!data) return null;

                    const label = `${approach.charAt(0).toUpperCase() + approach.slice(1)} Approach`;

                    // Get building size once
                    const buildingSize =
                      reviewData?.data?.data?.building_size || 0;

                    // Get the appropriate value for each approach type
                    const approachValue =
                      approach === 'income'
                        ? data?.indicated_range_annual
                        : approach === 'sales'
                          ? data?.sales_approach_value
                          : approach === 'cost'
                            ? data?.total_cost_valuation
                            : 0;

                    // Use the incremental_value directly from the API data
                    // const incrementalValue = data?.incremental_value || 0;

                    return (
                      <div className={`grid grid-cols-5`} key={approach}>
                        <div className="flex py-1 px-4 text-sm text-[#223c48] items-center">
                          <label>{label}</label>
                        </div>

                        <div className="flex py-1 px-4 text-xs text-[#223c48]">
                          <input
                            className="w-full border-0 border-b border-[#ccc] text-sm py-1 px-0 h-8 bg-transparent focus-visible:outline-none"
                            type="text"
                            value={formatCurrency(approachValue || '')}
                            readOnly
                          />
                        </div>
                        <div className="flex py-1 px-4 text-xs text-[#223c48]">
                          <input
                            className="w-full border-0 border-b border-[#ccc] text-sm py-1 px-0 h-8 bg-white focus-visible:outline-none"
                            type="text"
                            value={
                              data?.eval_weight !== undefined &&
                              data?.eval_weight !== ''
                                ? data.eval_weight_to_display
                                  ? data.eval_weight_to_display + '%'
                                  : `${parseFloat(((data.eval_weight || 0) * 100).toFixed(2))}%`
                                : ''
                            }
                            onChange={(e) => {
                              // Get the input value without the percentage symbol
                              let value = e.target.value.replace(/%/g, '');

                              // Remove any non-numeric characters except decimal point
                              value = value.replace(/[^0-9.-]/g, '');

                              // Ensure only one decimal point
                              const parts = value.split('.');
                              if (parts.length > 2) {
                                value =
                                  parts[0] + '.' + parts.slice(1).join('');
                              }

                              // Limit to 2 decimal places
                              if (parts.length > 1 && parts[1].length > 2) {
                                value =
                                  parts[0] + '.' + parts[1].substring(0, 2);
                              }

                              // If the value is empty, set to empty
                              if (!value) {
                                data.eval_weight = '';
                                setReviewData({ ...reviewData });
                                return;
                              }

                              // Parse as float and limit to 100
                              const numValue = parseFloat(value);
                              if (numValue > 100) return;
                              data.eval_weight_to_display = value;
                              if (value.includes('-')) {
                                data.eval_weight_to_display =
                                  '-' + value.replace('-', '');
                              }
                              if (!isNaN(numValue)) {
                                const limitedValue = Math.min(numValue, 100);
                                data.eval_weight = limitedValue / 100;

                                // Determine which approach was changed
                                let approachType = '';
                                if (approachKey.includes('income')) {
                                  approachType = 'income';
                                } else if (approachKey.includes('sales')) {
                                  approachType = 'sale';
                                } else if (approachKey.includes('cost')) {
                                  approachType = 'cost';
                                }

                                // Get the appropriate value for the current approach
                                const approachValue =
                                  approachType === 'income'
                                    ? data?.indicated_range_annual
                                    : approachType === 'sales'
                                      ? data?.sales_approach_value
                                      : approachType === 'cost'
                                        ? data?.total_cost_valuation
                                        : data?.incremental_value;

                                // Calculate weighted market value
                                let weightedMarketValue = 0;
                                ['income', 'sales', 'cost'].forEach(
                                  (approach) => {
                                    const approachKey = `res_evaluation_${approach}_approach`;
                                    const data = scenario?.[approachKey];

                                    if (data?.eval_weight) {
                                      const approachValue =
                                        approach === 'income'
                                          ? data?.indicated_range_annual
                                          : approach === 'sales'
                                            ? data?.sales_approach_value
                                            : approach === 'cost'
                                              ? data?.total_cost_valuation
                                              : data?.incremental_value;

                                      if (approachValue) {
                                        weightedMarketValue +=
                                          approachValue * data.eval_weight;
                                      }
                                    }
                                  }
                                );

                                // Prepare API payload
                                const payload = {
                                  res_evaluation_scenario_id: scenario.id,
                                  eval_weight: data.eval_weight * 100,
                                  approach: approachType,
                                  approach_id: data.id,
                                  incremental_value:
                                    approachValue * data.eval_weight.toFixed(2),
                                  weighted_market_value: weightedMarketValue,
                                  rounding: scenario.rounding || 0,
                                  review_summary: null,
                                };

                                // Call the API
                                axios
                                  .patch(
                                    `/res-evaluations/save-review/${id}`,
                                    payload
                                  )
                                  .then((response) => {
                                    console.log('Update successful', response);
                                  })
                                  .catch((error) => {
                                    console.error(
                                      'Error updating review',
                                      error
                                    );
                                  });

                                // Update the UI
                                setReviewData({ ...reviewData });
                              }
                            }}
                            onKeyDown={(e: any) => {
                              // Handle backspace when cursor is after the % symbol
                              if (
                                e.key === 'Backspace' &&
                                e.target.selectionStart ===
                                  e.target.value.length
                              ) {
                                const currentValue =
                                  data.eval_weight !== undefined &&
                                  data.eval_weight !== ''
                                    ? parseFloat(
                                        (data.eval_weight * 100).toFixed(2)
                                      ).toString()
                                    : '';

                                if (currentValue.length > 0) {
                                  // Remove the last character
                                  const newValue = currentValue.slice(0, -1);
                                  data.eval_weight_to_display = newValue;
                                  data.eval_weight = newValue
                                    ? parseFloat(newValue) / 100
                                    : '';

                                  // Determine which approach was changed
                                  let approachType = '';
                                  if (approachKey.includes('income')) {
                                    approachType = 'income';
                                  } else if (approachKey.includes('sales')) {
                                    approachType = 'sale';
                                  } else if (approachKey.includes('cost')) {
                                    approachType = 'cost';
                                  }

                                  // Get the appropriate value for the current approach
                                  const approachValue =
                                    approachType === 'income'
                                      ? data?.indicated_range_annual
                                      : approachType === 'sales'
                                        ? data?.sales_approach_value
                                        : approachType === 'cost'
                                          ? data?.total_cost_valuation
                                          : data?.incremental_value;

                                  // Calculate weighted market value for API call
                                  let weightedMarketValue = 0;
                                  ['income', 'sales', 'cost'].forEach(
                                    (approach) => {
                                      const approachKey = `res_evaluation_${approach}_approach`;
                                      const data = scenario?.[approachKey];

                                      if (data?.eval_weight) {
                                        const approachValue =
                                          approach === 'income'
                                            ? data?.indicated_range_annual
                                            : approach === 'sales'
                                              ? data?.sales_approach_value
                                              : approach === 'cost'
                                                ? data?.total_cost_valuation
                                                : data?.incremental_value;

                                        if (approachValue) {
                                          weightedMarketValue +=
                                            approachValue * data.eval_weight;
                                        }
                                      }
                                    }
                                  );

                                  // Prepare API payload
                                  const payload = {
                                    res_evaluation_scenario_id: scenario.id,
                                    eval_weight: data.eval_weight
                                      ? data.eval_weight * 100
                                      : 0,
                                    approach: approachType,
                                    approach_id: data.id,
                                    incremental_value: data.eval_weight
                                      ? approachValue * data.eval_weight
                                      : 0,
                                    weighted_market_value: weightedMarketValue,
                                    rounding: scenario.rounding || 0,
                                    review_summary: null,
                                  };

                                  // Call the API
                                  axios
                                    .patch(
                                      `/res-evaluations/save-review/${id}`,
                                      payload
                                    )
                                    .then((response) => {
                                      console.log(
                                        'Update successful',
                                        response
                                      );
                                    })
                                    .catch((error) => {
                                      console.error(
                                        'Error updating review',
                                        error
                                      );
                                    });

                                  setReviewData({ ...reviewData });
                                  e.preventDefault();
                                }
                              }
                            }}
                          />
                        </div>
                        <div className="flex py-1 px-4 text-xs text-[#223c48]">
                          <input
                            className="w-full border-0 border-b border-[#ccc] text-sm py-1 px-0 h-8 bg-transparent focus-visible:outline-none"
                            type="text"
                            value={formatCurrency(
                              approachValue && data?.eval_weight
                                ? (approachValue * data.eval_weight).toString()
                                : ''
                            )}
                            readOnly
                          />
                        </div>
                        <div className="flex py-1 px-4 text-xs text-[#223c48]">
                          <input
                            className="w-full border-0 border-b border-[#ccc] text-sm py-1 px-0 h-8 bg-transparent focus-visible:outline-none"
                            type="text"
                            value={formatCurrency(
                              buildingSize > 0
                                ? (approach === 'income'
                                    ? data?.indicated_psf_annual ?? 0
                                    : approach === 'sales'
                                      ? data?.averaged_adjusted_psf ?? 0
                                      : approach === 'cost'
                                        ? data?.indicated_value_psf ?? 0
                                        : 0
                                  ).toString()
                                : ''
                            )}
                            readOnly
                          />
                        </div>
                      </div>
                    );
                  })}

                  <div className="grid grid-cols-5">
                    {/* Empty space (2 columns) to push all 3 items to the right */}
                    <div className="col-span-2"></div>

                    {/* Label */}
                    <div className="flex col-span-1 py-1 px-4 text-sm text-[#223c48] whitespace-nowrap justify-end items-center">
                      <label>
                        Market Value based upon proportionate weighting
                      </label>
                    </div>

                    {/* Market Value Input */}
                    <div className="flex col-span-1 py-1 px-4 text-xs text-[#223c48] items-center">
                      <input
                        className="w-full border-0 border-b border-[#ccc] text-sm py-1 px-0 h-8 bg-transparent focus-visible:outline-none"
                        type="text"
                        value={(() => {
                          let sum = 0;

                          ['income', 'sales', 'cost'].forEach((approach) => {
                            const approachKey = `res_evaluation_${approach}_approach`;
                            const data = scenario?.[approachKey];

                            if (data?.eval_weight) {
                              const approachValue =
                                approach === 'income'
                                  ? data?.indicated_range_annual
                                  : approach === 'sales'
                                    ? data?.sales_approach_value
                                    : approach === 'cost'
                                      ? data?.total_cost_valuation
                                      : data?.incremental_value;

                              console.log(`Approach: ${approach}`);
                              console.log(`Value: ${approachValue}`);
                              console.log(`Weight: ${data.eval_weight}`);

                              if (approachValue) {
                                sum += approachValue * data.eval_weight;
                              }
                            }
                          });

                          console.log(`Final Sum: ${sum}`);

                          return formatCurrency(sum ? sum.toFixed(2) : '');
                        })()}
                      />
                    </div>

                    {/* PSF Input */}
                    <div className="flex col-span-1 py-1 px-4 text-xs text-[#223c48] items-center">
                      <input
                        className="w-full border-0 border-b border-[#ccc] text-sm py-1 px-0 h-8 bg-transparent focus-visible:outline-none"
                        type="text"
                        value={(() => {
                          let weightedSum = 0;

                          const buildingSize =
                            reviewData?.data?.data?.building_size || 0;
                          const landSize =
                            reviewData?.data?.data?.land_size || 0;
                          const divisor =
                            analysisType === 'land_only'
                              ? landSize
                              : buildingSize;

                          console.log(`Analysis Type: ${analysisType}`);
                          console.log(`Divisor: ${divisor}`);

                          if (divisor > 0) {
                            ['income', 'sales', 'cost'].forEach((approach) => {
                              const approachKey = `res_evaluation_${approach}_approach`;
                              const data = scenario?.[approachKey];

                              if (data?.eval_weight) {
                                const approachValue =
                                  approach === 'income'
                                    ? data?.indicated_range_annual
                                    : approach === 'sales'
                                      ? data?.sales_approach_value
                                      : approach === 'cost'
                                        ? data?.total_cost_valuation
                                        : data?.incremental_value;
                                const weightedValue =
                                  approachValue * data.eval_weight;
                                const dividedValue = weightedValue / divisor;

                                console.log(`Approach: ${approach}`);
                                console.log(
                                  `Incremental Value: ${data.incremental_value}`
                                );
                                console.log(`Weight: ${data.eval_weight}`);
                                console.log(`Weighted Value: ${weightedValue}`);
                                console.log(`Divided Value: ${dividedValue}`);

                                weightedSum += dividedValue;
                              }
                            });
                          }

                          console.log(
                            `Final Weighted & Divided Sum: ${weightedSum}`
                          );

                          return formatCurrency(weightedSum.toFixed(2));
                        })()}
                      />
                    </div>
                  </div>
                </div>
                <div className="table bg-white rounded py-5 px-3">
                  <div className="grid grid-cols-6">
                    <div className="py-1 px-4 col-span-4 text-base text-[#0da1c7] font-bold uppercase">
                      Market Value Breakdown
                    </div>
                    <div className="py-1 px-4 text-xs text-[#223c48] font-bold uppercase">
                      Low
                    </div>
                    <div className="py-1 px-4 text-xs text-[#223c48] font-bold uppercase">
                      High
                    </div>
                  </div>
                  <div className="grid grid-cols-6">
                    <div className="flex py-1 px-2 text-xs col-span-4 text-[#223c48] items-center justify-end">
                      <label>Overall Price Range</label>
                    </div>
                    <div className="flex py-0.5 px-2 text-xs text-[#223c48]">
                      {/* <input
                        className="w-full border-0 border-b border-[#ccc] text-sm py-1 px-0 h-8 bg-transparent focus-visible:outline-none"
                        type="text"
                        value={(() => {
                          // Find the lowest value from approach-specific values
                          let lowestValue = Infinity;
                          ['income', 'sales', 'cost'].forEach((approach) => {
                            const approachKey = `res_evaluation_${approach}_approach`;
                            const data = scenario[approachKey];
                            if (data) {
                              // Get the appropriate value based on approach type
                              const approachValue =
                                approach === 'income'
                                  ? data?.indicated_range_annual
                                  : approach === 'sales'
                                    ? data?.sales_approach_value
                                  : approach === 'cost'
                                    ? data?.total_cost_valuation
                                    : 0;

                              if (
                                approachValue &&
                                parseFloat(approachValue) > 0
                              ) {
                                lowestValue = Math.min(
                                  lowestValue,
                                  parseFloat(approachValue)
                                );
                              }
                            }
                          });
                          return lowestValue !== Infinity
                            ? formatCurrency(lowestValue.toString())
                            : '';
                        })()}
                        readOnly
                      /> */}
                      <input
                        className="w-full border-0 border-b border-[#ccc] text-sm py-1 px-0 h-8 bg-transparent focus-visible:outline-none"
                        type="text"
                        value={(() => {
                          let lowestValue = Infinity;
                          ['income', 'sales', 'cost'].forEach((approach) => {
                            const approachKey = `res_evaluation_${approach}_approach`;
                            const data = scenario[approachKey];
                            if (data) {
                              const approachValue =
                                approach === 'income'
                                  ? data?.indicated_range_annual
                                  : approach === 'sales'
                                    ? data?.sales_approach_value
                                    : approach === 'cost'
                                      ? data?.total_cost_valuation
                                      : data?.incremental_value;

                              console.log(approachValue, 'approachValue');

                              if (
                                approachValue !== null &&
                                approachValue !== undefined
                              ) {
                                lowestValue = Math.min(
                                  lowestValue,
                                  approachValue
                                );
                              }
                            }
                          });
                          return lowestValue !== Infinity
                            ? formatCurrency(lowestValue.toString())
                            : '';
                        })()}
                        readOnly
                      />
                    </div>
                    <div className="flex py-0.5 px-2 text-xs text-[#223c48]">
                      <input
                        className="w-full border-0 border-b border-[#ccc] text-sm py-1 px-0 h-8 bg-transparent focus-visible:outline-none"
                        type="text"
                        value={(() => {
                          // Find the highest value from approach-specific values
                          let highestValue = -Infinity;
                          ['income', 'sales', 'cost'].forEach((approach) => {
                            const approachKey = `res_evaluation_${approach}_approach`;
                            const data = scenario[approachKey];
                            if (data) {
                              // Get the appropriate value based on approach type
                              const approachValue =
                                approach === 'income'
                                  ? data?.indicated_range_annual
                                  : approach === 'sales'
                                    ? data?.sales_approach_value
                                    : approach === 'cost'
                                      ? data?.total_cost_valuation
                                      : 0;

                              if (
                                approachValue &&
                                parseFloat(approachValue) > 0
                              ) {
                                highestValue = Math.max(
                                  highestValue,
                                  parseFloat(approachValue)
                                );
                              }
                            }
                          });
                          return highestValue !== -Infinity
                            ? formatCurrency(highestValue.toString())
                            : '';
                        })()}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-6">
                    <div className="flex py-0.5 px-2 text-xs col-span-5 text-[#223c48] items-center justify-end">
                      <label>Rounding</label>
                    </div>
                    <div className="flex py-0.5 px-2 text-xs text-[#223c48]">
                      <select
                        className="w-full cursor-pointer border-0 border-b border-[#ccc] py-1 px-0 h-8 text-xs bg-[#f7f7f7] focus-visible:outline-none"
                        value={scenario.rounding || ''}
                        onChange={(e) => {
                          // Update the rounding value
                          scenario.rounding = e.target.value;
                          const roundingVal = e.target.value;

                          // Calculate weighted sum based on approach-specific values
                          let weightedSum = 0;
                          ['income', 'sales', 'cost'].forEach((approach) => {
                            const approachKey = `res_evaluation_${approach}_approach`;
                            const data = scenario?.[approachKey];

                            if (data?.eval_weight) {
                              const approachValue =
                                approach === 'income'
                                  ? data?.indicated_range_annual
                                  : approach === 'sales'
                                    ? data?.sales_approach_value
                                    : approach === 'cost'
                                      ? data?.total_cost_valuation
                                      : data?.incremental_value;

                              if (approachValue) {
                                weightedSum += approachValue * data.eval_weight;
                              }
                            }
                          });

                          // Apply rounding to the weighted sum
                          let roundedValue = weightedSum;
                          if (roundingVal) {
                            let acc = 0;
                            if (roundingVal === '1000') acc = 1000;
                            else if (roundingVal === '5000') acc = 5000;
                            else if (roundingVal === '10000') acc = 10000;
                            else if (roundingVal === '100000') acc = 100000;
                            else if (roundingVal === '1000000') acc = 1000000;

                            if (acc > 0) {
                              roundedValue =
                                Math.round(weightedSum / acc) * acc;
                            }
                          }

                          // Store the rounded value in the scenario for display
                          scenario.roundedMarketValue = roundedValue;

                          // Prepare API payload
                          const payload = {
                            res_evaluation_scenario_id: scenario.id,
                            eval_weight: 0,
                            approach: '',
                            approach_id: 0,
                            incremental_value: 0,
                            weighted_market_value: roundedValue,
                            rounding: e.target.value,
                            review_summary: null,
                          };

                          // Call the API
                          axios
                            .patch(
                              `/res-evaluations/save-review/${id}`,
                              payload
                            )
                            .then((response) => {
                              console.log('Update successful', response);
                            })
                            .catch((error) => {
                              console.error('Error updating review', error);
                            });

                          // Update the UI
                          setReviewData({ ...reviewData });
                        }}
                      >
                        {roundingOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-6">
                    <div className="flex py-0.5 px-2 text-xs col-span-5 text-[#223c48] items-center justify-end">
                      <label>Final Market Value</label>
                    </div>
                    <div className="flex py-0.5 px-2 text-xs text-[#223c48]">
                      <input
                        className="w-full border-0 border-b border-[#ccc] text-sm py-1 px-0 h-8 bg-transparent focus-visible:outline-none"
                        type="text"
                        value={(() => {
                          let weightedSum = 0;

                          // Step 1: Calculate weighted sum based on approach-specific values
                          ['income', 'sales', 'cost'].forEach((approach) => {
                            const approachKey = `res_evaluation_${approach}_approach`;
                            const data = scenario?.[approachKey];

                            if (data?.eval_weight) {
                              const approachValue =
                                approach === 'income'
                                  ? data?.indicated_range_annual
                                  : approach === 'sales'
                                    ? data?.sales_approach_value
                                    : approach === 'cost'
                                      ? data?.total_cost_valuation
                                      : data?.incremental_value;

                              console.log(`Approach: ${approach}`);
                              console.log(`Value: ${approachValue}`);
                              console.log(`Weight: ${data.eval_weight}`);

                              if (approachValue) {
                                weightedSum += approachValue * data.eval_weight;
                              }
                            }
                          });

                          console.log(
                            `Weighted Sum before rounding: ${weightedSum}`
                          );

                          // Step 2: Apply rounding if scenario.rounding is selected
                          let finalValue = weightedSum;
                          const roundingVal = scenario.rounding;

                          if (roundingVal) {
                            let acc = 0;
                            switch (roundingVal.toString()) {
                              case RoundingValues.Thousand.toString():
                                acc = RoundingValues.Thousand;
                                break;
                              case RoundingValues.FiveThousand.toString():
                                acc = RoundingValues.FiveThousand;
                                break;
                              case RoundingValues.TenThousand.toString():
                                acc = RoundingValues.TenThousand;
                                break;
                              case RoundingValues.OneHundredThousand.toString():
                                acc = RoundingValues.OneHundredThousand;
                                break;
                              case RoundingValues.OneMillion.toString():
                                acc = RoundingValues.OneMillion;
                                break;
                              default:
                                acc = 0;
                            }

                            if (acc > 0) {
                              finalValue = Math.round(weightedSum / acc) * acc;
                              console.log(
                                `Rounded value (to ${acc}):`,
                                finalValue
                              );
                            }
                          }

                          return formatCurrency(finalValue.toFixed(2));
                        })()}
                      />
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          }
        )}
        <div className="mb-4">
          <div
            onBlur={() => {
              axios
                .patch(`/res-evaluations/save-review/${id}`, {
                  // evaluation_scenario_id: scenario.id,
                  review_summary: salesNote,
                  // rounding: scenario.rounding || 0,
                })
                .then((response) => console.log('Sales note saved', response))
                .catch((error) =>
                  console.error('Error saving sales note', error)
                );
            }}
          >
            <label className="text-customGray text-base">
              Review Notes (Only 850 characters allowed)
            </label>
            <TextEditor
              editorData={(content) => {
                const plainText = content.replace(/<[^>]+>/g, ''); // Remove HTML tags
                if (plainText.length <= 820) {
                  setSalesNote(content);
                }
              }}
              editorContent={salesNote || ''}
              value={salesNote}
            />
          </div>
        </div>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: 'rgb(13 161 199 / var(--tw-text-opacity, 1))',
            mb: 2,
            ml: -1, // move slightly to the left
          }}
        >
          Review Information
        </Typography>

        <Box
          sx={{
            background: 'rgb(241 243 244 / var(--tw-bg-opacity, 1))',
            borderRadius: 2,
            p: 5,
            mb: 2,
          }}
        >
          <div className="flex gap-4 mb-2 items-end" style={{ marginLeft: '-28px' }}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.5, ml: 0.5 }}>
                Reviewed By
              </Typography>
              <FormControl
                size="small"
                sx={{ width: 300 }}
                disabled={Boolean(
                  (dropdown1Value && String(userId) === dropdown1Value) || // Disabled when IS the reviewer
                    hasReviewDateBeenSet
                )}
              >
                <Select
                  value={dropdown1Value}
                  onChange={(e) => {
                    const value = e.target.value;
                    setDropdown1Value(value);
                    setDropdown1Open(false);
                    console.log('Selected value:', value);

                    // Update isReviewDateEditable based on whether current user is the selected reviewer
                    if (value && String(userId) === String(value)) {
                      setIsReviewDateEditable(true);
                    } else {
                      setIsReviewDateEditable(false);
                    }

                    // Call API when user selects an option
                    if (value) {
                      const payload = {
                        reviewed_by: Number(value),
                        review_date: dropdown2Value
                          ? moment(dropdown2Value).format('MM/DD/YYYY')
                          : null,
                      };

                      axios
                        .patch(`/res-evaluations/save-review/${id}`, payload)
                        .then((response) => {
                          console.log(
                            'Review data saved successfully',
                            response
                          );
                          fetchReviewData();
                        })
                        .catch((error) => {
                          console.error('Error saving review data', error);
                        });
                    }
                  }}
                  open={dropdown1Open}
                  onOpen={() => {
                    setFilteredUserOptions(userOptions);
                    setDropdown1Open(true);
                  }}
                  onClose={() => {
                    setDropdown1Open(false);
                    setSearchText('');
                  }}
                  MenuProps={{
                    disableScrollLock: true,
                    PaperProps: {
                      style: {
                        maxHeight: 250,
                      },
                    },
                    autoFocus: false,
                    TransitionProps: { timeout: 0 },
                    disableAutoFocusItem: true,
                  }}
                  inputProps={{
                    sx: {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#b6d0fa',
                        borderWidth: 1,
                      },
                      borderRadius: 2,
                      background: '#fff',
                    },
                  }}
                  disabled={Boolean(
                    (dropdown1Value && String(userId) === dropdown1Value) || // Disabled when IS the reviewer
                      hasReviewDateBeenSet
                  )}
                  displayEmpty
                  renderValue={
                    dropdown1Value !== ''
                      ? undefined
                      : () => (
                          <span style={{ color: '#aaa' }}>Select option</span>
                        )
                  }
                >
                  {/* This MenuItem is just for the placeholder, not shown in dropdown */}
                  <ListSubheader>
                    <TextField
                      size="small"
                      autoFocus
                      placeholder="Search names..."
                      fullWidth
                      value={searchText}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSearchText(value);

                        // Clear previous timeout
                        if (searchTimeoutRef.current) {
                          window.clearTimeout(searchTimeoutRef.current);
                        }

                        // Set loading state
                        setIsLoadingUsers(true);

                        // Debounce filtering
                        searchTimeoutRef.current = window.setTimeout(() => {
                          // Filter options
                          const filtered = userOptions.filter((user) =>
                            user.name
                              .toLowerCase()
                              .includes(value.toLowerCase())
                          );
                          setFilteredUserOptions(filtered);
                          setIsLoadingUsers(false);
                        }, 100);
                      }}
                      onKeyDown={(e) => {
                        if (e.key !== 'Escape') {
                          // Prevents closing when typing
                          e.stopPropagation();
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </ListSubheader>
                  {filteredUserOptions.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ mb: 0.5, mt: 0.4, ml: 0.5 }}
              >
                Review Date
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  value={dropdown2Value}
                  onChange={(newValue) => {
                    setDropdown2Value(newValue);

                    // Set hasReviewDateBeenSet to true when any date is selected
                    if (newValue) {
                      setHasReviewDateBeenSet(true);
                    }

                    // Always call the API, even if newValue is null
                    const payload = {
                      reviewed_by: dropdown1Value
                        ? Number(dropdown1Value)
                        : null,
                      review_date: newValue
                        ? moment(newValue).format('MM/DD/YYYY')
                        : null,
                    };
                    axios
                      .patch(`/res-evaluations/save-review/${id}`, payload)
                      .then((response) => {
                        console.log('Review date saved successfully', response);
                      })
                      .catch((error) => {
                        console.error('Error saving review date', error);
                      });
                  }}
                  open={openDatePicker}
                  onOpen={() => setOpenDatePicker(true)}
                  onClose={() => setOpenDatePicker(false)}
                  disabled={!isReviewDateEditable}
                  slotProps={{
                    textField: {
                      size: 'small',
                      sx: {
                        minWidth: 300,
                        width: 300,
                        background: isReviewDateEditable ? '#fff' : '#f5f5f5',
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: isReviewDateEditable
                            ? '#fff'
                            : '#f5f5f5',
                          '& fieldset': {
                            borderColor: isReviewDateEditable
                              ? '#b6d0fa'
                              : '#e0e0e0',
                            borderWidth: 1,
                          },
                          '&:hover fieldset': {
                            borderColor: isReviewDateEditable
                              ? '#b6d0fa'
                              : '#e0e0e0',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: isReviewDateEditable
                              ? '#b6d0fa'
                              : '#e0e0e0',
                          },
                        },
                        '& .MuiInputBase-input': {
                          color: isReviewDateEditable ? '#000' : '#8a8a8a',
                          cursor: isReviewDateEditable ? 'text' : 'not-allowed',
                        },
                        '& .MuiInputAdornment-root .MuiSvgIcon-root': {
                          color: isReviewDateEditable ? '#666' : '#ccc',
                        },
                        '& .Mui-disabled': {
                          color: '#8a8a8a !important',
                          WebkitTextFillColor: '#8a8a8a !important',
                        },
                      },
                      onClick: () => {
                        if (isReviewDateEditable) {
                          setOpenDatePicker(true);
                        }
                      },
                    },
                  }}
                  ref={datePickerRef}
                />
              </LocalizationProvider>
            </Box>
          </div>
        </Box>
        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          style={{ borderColor: 'white' }}
        >
          <Box sx={modalStyle}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              COMPLETE YOUR EVALUATION
            </Typography>

            <Stack spacing={2} alignItems="center">
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() =>
                  window.open(`/prototypes/evaluation-report-preview-editor.html?id=${id}`, '_blank')
                }
                sx={{ 
                  textTransform: 'none', 
                  backgroundColor: '#0da1c7',
                  '&:hover': {
                    backgroundColor: '#0890a8'
                  },
                  minWidth: '240px',
                  fontWeight: 600
                }}
              >
                Preview & Edit Report
              </Button>

              <Button
                variant="text"
                startIcon={<PictureAsPdfIcon color="error" />}
                onClick={() =>
                  window.open(`/residential/report/${id}`, '_blank')
                }
                sx={{ textTransform: 'none', color: '#0288d1' }}
              >
                View Final PDF
              </Button>

              <Button
                variant="text"
                startIcon={<SaveIcon />}
                onClick={() => {
                  navigate('/evaluation/residential-list'),
                    setIsModalOpen(false);
                }}
                sx={{ textTransform: 'none', color: '#0288d1' }}
              >
                Save & Exit
              </Button>
            </Stack>
          </Box>
        </Modal>
      </div>
    </ResidentialMenuOptions>
  );
};

export default ResidentialReview;
