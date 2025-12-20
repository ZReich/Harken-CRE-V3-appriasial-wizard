import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import StyledField from '@/components/styles/StyleFieldEditComp';
import { HarkenHr } from '@/components/harken-hr';
import SelectTextField from '@/components/styles/select-input';
import SellerBuyer from './SellerBuyer';
import { useFormikContext } from 'formik';
import DatePickerComp from '@/components/date-picker';
import { formatDateToMMDDYYYY } from '@/utils/date-format';
import { spaceConditionOptions } from './SelectOption';
import {
  handleInputChange,
  // sanitizeInputPercentageLease,
  sanitizeInputTermFreeRent,
  sanitizeInputTerm1,
  sanitizeInputDollarSignComps1,
  formatPercentageInput,
} from '@/utils/sanitize';
import {
  leaseTypeOptions,
  leaseRateUnitOptions,
  leaseStatusOptions,
  TIAllowanceOptions,
  askingRentUnitOptions,
} from './SelectOption';
import moment from 'moment';
import React, { ChangeEvent, useEffect, useState } from 'react';
import StarIcon from '@mui/icons-material/Star';
import { CreateCompsEnum } from '../enum/CompsEnum';
import { ResidentialComponentHeaderEnum } from '@/pages/residential/enum/ResidentialEnum';
import { AmenitisResidentialComp } from '@/pages/residential/enum/ResidentialEnum';
import TextAreaField from '@/components/styles/textarea';

export const SpaceDetails = ({
  setDataRequited,
  passBoolean,
  passDataT,
  newlyCreatedComp,
}: any) => {
  const [topography, setTopography] = React.useState('');
  const [conditionOption, setConditionOption] = useState('');
  const { handleChange, values, setFieldValue, errors }: any =
    useFormikContext();
  const getValueOrTypeMySpaceCondition = (value: any) => {
    const foundOption = spaceConditionOptions.find(
      (option) => option.value === value
    );
    const founderOption = foundOption ? foundOption.value : 'Type My Own';
    setConditionOption(founderOption);
    return foundOption ? foundOption.value : 'Type My Own';
  };

  useEffect(() => {
    if (passDataT && passDataT.id) {
      if (passDataT && passDataT.space && passDataT.space !== null) {
        setFieldValue('space', passDataT.space.toLocaleString());
      } else {
        setFieldValue('space', '');
      }

      setFieldValue('free_rent', passDataT.free_rent);
      setFieldValue('escalators', passDataT.escalators);
      const TIAllowance = passDataT.TI_allowance;
      const formatedTIAllowance =
        passDataT.TI_allowance !== null
          ? parseFloat(TIAllowance).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : '';
      setFieldValue(
        'TI_allowance',
        formatedTIAllowance ? '$' + formatedTIAllowance : ''
      );
      setFieldValue('concessions', passDataT.concessions);
      setFieldValue('lease_type', passDataT.lease_type);
      setFieldValue('lease_rate_unit', passDataT.lease_rate_unit);
      setFieldValue('lease_status', passDataT.lease_status);
      setFieldValue('asking_rent_unit', passDataT.asking_rent_unit);
      setFieldValue(
        'TI_allowance_unit',
        passDataT.TI_allowance_unit ? passDataT.TI_allowance_unit : 'sf'
      );
      setFieldValue('term', passDataT.term);
      const Cam = passDataT.cam;
      const formatedCam =
        passDataT.cam !== null
          ? parseFloat(Cam).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : '';
      setFieldValue('cam', formatedCam ? '$' + formatedCam : '');
      const leaseRate = passDataT.lease_rate;
      const formatedLeaseRate =
        passDataT.lease_rate !== null
          ? parseFloat(leaseRate).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : '';
      setFieldValue(
        'lease_rate',
        formatedLeaseRate ? '$' + formatedLeaseRate : ''
      );
      setFieldValue('other_topography', passDataT.other_topography);

      setFieldValue(
        'condition',
        getValueOrTypeMySpaceCondition(passDataT.condition)
      );
      setFieldValue('condition_custom', passDataT.condition);

      setFieldValue('date_sold', formatDateToMMDDYYYY(passDataT.date_sold));
      setFieldValue('date_execution', passDataT.date_execution);
      setFieldValue('date_commencement', passDataT.date_commencement);
      setFieldValue('date_expiration', passDataT.date_expiration);
      const askingRent = passDataT.asking_rent;
      const formatedAskingRent =
        passDataT.asking_rent !== null
          ? parseFloat(askingRent).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : '';
      setFieldValue(
        'asking_rent',
        formatedAskingRent ? '$' + formatedAskingRent : ''
      );
    }
  }, [passDataT]);

  const handleTopography = (e: ChangeEvent<HTMLInputElement>) => {
    setTopography(e.target.value);
    setFieldValue('lease_type', e.target.value);
  };

  const handleInput = (e: any) => {
    const { name, value } = e.target;
    setFieldValue(name, value);
  };

  const handleLeaseRateUnit = (e: ChangeEvent<HTMLInputElement>) => {
    console.log('🔄 Selected Lease Rate Unit:', e.target.value);
    setFieldValue('lease_rate_unit', e.target.value);
  };

  const handleAllowanceUnit = (e: ChangeEvent<HTMLInputElement>) => {
    setFieldValue('TI_allowance_unit', e.target.value);
  };

  const formatNumber = (value: string) => {
    const parts = value.split('').reverse();
    const formattedParts = [];
    for (let i = 0; i < parts.length; i++) {
      if (i % 3 === 0 && i !== 0) {
        formattedParts.push(',');
      }
      formattedParts.push(parts[i]);
    }
    return formattedParts.reverse().join('');
  };

  const passData = (event: any) => {
    passBoolean(event);
  };

  return (
    <>
      <div>
        <Typography
          variant="h6"
          component="h5"
          className="text-[17px] font-bold"
          sx={{ fontFamily: '"Montserrat", serif' }}
        >
          {ResidentialComponentHeaderEnum.SPACE}
        </Typography>
        <div className="mt-[6px]">
          <Grid className="mt-[10px] items-end" container spacing={3}>
            <Grid item xs={6}>
              <StyledField
                label="Space (SF)"
                name="space"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const value = e.target.value.replace(/\D/g, '');
                  const formattedValue = formatNumber(value);
                  setFieldValue('space', formattedValue);
                }}
              />
            </Grid>
            <Grid
              item
              xs={
                values.condition === AmenitisResidentialComp.TYPE_MY_OWN ? 3 : 6
              }
              className="relative pt-[24px] selectFixedHeight"
            >
              <SelectTextField
                onChange={(v: any) => {
                  // setCondition(v.target.value);
                  setFieldValue('condition_custom', '');
                  handleInput({
                    target: {
                      name: 'condition',
                      value: v.target.value,
                    },
                  });
                }}
                options={spaceConditionOptions}
                label={
                  <span className="text-customGray relative">
                    {CreateCompsEnum.CONDITION}
                    <span className="text-red-500 text-base">*</span>
                  </span>
                }
                name="condition"
                value={values.condition}
              ></SelectTextField>
              {(setDataRequited && errors && values.condition === 'select') ||
                (setDataRequited && errors && !values.condition && (
                  <div className="text-red-500 text-[11px] absolute">
                    {CreateCompsEnum.REQUIRED_FIELD}
                  </div>
                ))}
              {/* {setDataRequited && errors && (
                <div className="text-red-500 text-[11px] pt-1 absolute">
                  {CreateCompsEnum.REQUIRED_FIELD}
                  {errors?.condition}
                </div>
              )} */}
            </Grid>
            {values.condition === AmenitisResidentialComp.TYPE_MY_OWN ||
            conditionOption === 'Type My Own' ? (
              <>
                <Grid item xs={3}>
                  {errors && (
                    <div className="text-red-500 text-[11px]">
                      {errors?.condition}
                    </div>
                  )}
                  <StyledField
                    label={
                      <span className="relative">
                        Other Condition
                        <StarIcon className="absolute text-[6px] text-red-500 right-[-10px]" />
                      </span>
                    }
                    name="condition_custom"
                  />
                  {/* {setDataRequited &&
                    values.condition === 'Type My Own' &&
                    values.condition_custom === '' && (
                      <div className="text-red-500 text-sm">
                        This field is required.
                      </div>
                    )} */}
                </Grid>
              </>
            ) : (
              ''
            )}
          </Grid>
          <Grid container spacing={3} className="mt-[10px] items-end">
            <Grid item xs={6} className="relative pt-2">
              <SelectTextField
                onChange={handleTopography}
                label={
                  <span className="text-customGray">
                    {CreateCompsEnum.LEASE_TYPE}
                    <span className="text-red-500 text-base">*</span>
                  </span>
                }
                value={values.lease_type}
                options={leaseTypeOptions}
                name="lease_type"
              ></SelectTextField>
              {(setDataRequited && errors && (values.lease_type === 'select' || values.lease_type === 'Select Lease Type')) ||
                (setDataRequited && errors && !values.lease_type && (
                  <div className="text-red-500 text-[11px] absolute">
                    {CreateCompsEnum.REQUIRED_FIELD}
                  </div>
                ))}
            </Grid>
            {topography === 'Type My Own' ? (
              <>
                <Grid item xs={3}>
                  <StyledField
                    label="Other Topography"
                    name="other_topography"
                  />
                </Grid>
              </>
            ) : (
              ''
            )}
            <Grid
              item
              xs={6}
              className="relative common-label-wrapper pt-2"
            >
              <DatePickerComp
                name="date_sold"
                label={
                  <span className="text-customGray text-base">
                    {CreateCompsEnum.TRANSACTION_DATE}
                    <span className="text-red-500 text-base"> *</span>
                  </span>
                }
                value={
                  values.date_sold != null || values.date_sold != ''
                    ? moment(values.date_sold, [
                        moment.ISO_8601,
                        'MM/DD/YYYY',
                        'YYYY-MM-DD',
                        'YYYY-MM-DD HH:mm:ss',
                        'x', // Unix ms timestamp
                        'X', // Unix s timestamp
                      ])
                    : null
                }
                // value={values.close_date ? moment(values.close_date, 'MM/DD/YYYY') : null}
                onChange={(value: Date | null) => {
                  if (value) {
                    const formattedDate = moment(value).format('MM/DD/YYYY');
                    handleChange({
                      target: {
                        name: 'date_sold',
                        value: formattedDate,
                      },
                    });
                  } else {
                    handleChange({
                      target: {
                        name: 'date_sold',
                        value: null,
                      },
                    });
                  }
                }}
              />
              {setDataRequited && errors && !values.date_sold && (
                <div className="text-red-500 text-[11px] absolute">
                  This field is required
                </div>
              )}
            </Grid>
          </Grid>
          <Grid container spacing={3} className="mt-[10px] relative items-end">
            <Grid item xs={6} className="pt-2">
              <StyledField
                label={
                  <span className="relative">
                    {CreateCompsEnum.LEASE_RATE}
                    <span className="text-red-500 text-xs absolute !bottom-[2px] !right-[-7px]">
                      *
                    </span>
                  </span>
                }
                name="lease_rate"
                onKeyDown={(e: React.KeyboardEvent) => {
                  const event = e as React.KeyboardEvent<HTMLInputElement>;
                  const isBack = e.code === 'Backspace';
                  if (isBack) {
                    const inputElement = event.currentTarget;
                    const { selectionStart, selectionEnd } = inputElement;
                    const input = values.lease_rate
                      .toString()
                      .replace(/[^\d]/g, ''); // remove any non-digit characters
                    if (
                      selectionStart === 0 &&
                      selectionEnd === inputElement.value.length
                    ) {
                      handleInputChange(handleChange, 'lease_rate', '');
                      event.preventDefault();
                    } else if (input.length > 0) {
                      const newValue = input.slice(0, -1); // Remove last digit
                      const shiftedValue = parseInt(newValue, 10) / 100; // Shift decimal left by 1
                      handleInputChange(
                        handleChange,
                        'lease_rate',
                        `$${shiftedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      );
                      event.preventDefault();
                    }
                  }
                }}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const input = sanitizeInputDollarSignComps1(e.target.value);
                  handleInputChange(handleChange, 'lease_rate', input);
                }}
                value={values.lease_rate}
              />
              {setDataRequited && errors && !values?.lease_rate && (
                <div className="text-red-500 text-[11px] absolute">
                  {CreateCompsEnum.REQUIRED_FIELD}
                </div>
              )}
            </Grid>
            <Grid item xs={6} className="pt-2 selectFixedHeight ">
              <SelectTextField
                onChange={handleLeaseRateUnit}
                label={
                  <span className="text-customGray">
                    {CreateCompsEnum.LEASE_RATE_UNITS}
                  </span>
                }
                value={values.lease_rate_unit}
                name="lease_rate_unit"
                options={leaseRateUnitOptions}
              ></SelectTextField>
            </Grid>
          </Grid>
          <Grid container spacing={3} className="mt-[10px] items-end">
            <Grid item xs={6} className="pt-2">
              <StyledField
                label="CAM"
                name="cam"
                onKeyDown={(e: React.KeyboardEvent) => {
                  const event = e as React.KeyboardEvent<HTMLInputElement>;
                  const isBack = e.code === 'Backspace';
                  if (isBack) {
                    const inputElement = event.currentTarget;
                    const { selectionStart, selectionEnd } = inputElement;
                    const input = values.cam.toString().replace(/[^\d]/g, ''); // remove any non-digit characters
                    if (
                      selectionStart === 0 &&
                      selectionEnd === inputElement.value.length
                    ) {
                      handleInputChange(handleChange, 'cam', '');
                      event.preventDefault();
                    } else if (input.length > 0) {
                      const newValue = input.slice(0, -1); // Remove last digit
                      const shiftedValue = parseInt(newValue, 10) / 100; // Shift decimal left by 1
                      handleInputChange(
                        handleChange,
                        'cam',
                        `$${shiftedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      );
                      event.preventDefault();
                    }
                  }
                }}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const input = sanitizeInputDollarSignComps1(e.target.value);
                  handleInputChange(handleChange, 'cam', input);
                }}
                value={values.cam}
              />
            </Grid>
            <Grid item xs={6} className="pt-2">
              <StyledField
                label="Term(Months)"
                name="term"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const input = sanitizeInputTerm1(e.target.value);
                  handleInputChange(handleChange, 'term', input);
                }}
                value={values.term}
              />
            </Grid>
          </Grid>
          <Grid container spacing={3} className="mt-[10px] items-end">
            <Grid item xs={12} className="pt-2 textareaField">
              {/* <StyledField
                label="Lease Notes"
                name="concessions"
                value={values.concessions}
              /> */}
              <TextAreaField
                label="Lease Notes"
                name="concessions"
                value={values.concessions}
                // onChange={(e: any) => {
                //   setFieldValue('comments', e.target.value);
                // }}
              />
            </Grid>
          </Grid>
          <Grid
            container
            spacing={3}
            className="mt-[15px] relative common-label-wrapper items-end"
          >
            <Grid item xs={6} className="pt-2">
              <DatePickerComp
                name="date_execution"
                label={
                  <span className="custom-label text-base">Execution Date</span>
                }
                style={{ width: '100%', fontFamily: 'montserrat-normal' }}
                value={
                  values.date_execution != null || values.date_execution != ''
                    ? moment(values.date_execution, [
                        moment.ISO_8601,
                        'MM/DD/YYYY',
                        'YYYY-MM-DD',
                        'YYYY-MM-DD HH:mm:ss',
                        'x', // Unix ms timestamp
                        'X', // Unix s timestamp
                      ])
                    : null
                }
                // value={values.close_date ? moment(values.close_date, 'MM/DD/YYYY') : null}
                onChange={(value: Date | null) => {
                  if (value) {
                    const formattedDate = moment(value).format('MM/DD/YYYY');
                    handleChange({
                      target: {
                        name: 'date_execution',
                        value: formattedDate,
                      },
                    });
                  } else {
                    handleChange({
                      target: {
                        name: 'date_execution',
                        value: null,
                      },
                    });
                  }
                }}
              />
            </Grid>

            <Grid item xs={6} className="pt-2">
              <DatePickerComp
                name="date_commencement"
                label="Commencement Date"
                style={{
                  width: '100%',
                  fontSize: '16px',
                  fontFamily: 'montserrat-normal',
                }}
                // value={moment(values?.date_commencement)}
                // onChange={(value: Date | null) => {
                //   if (value) {
                //     const formattedDate = formatDate(value);
                //     handleChange({
                //       target: {
                //         name: 'date_commencement',
                //         value: formattedDate,
                //       },
                //     });
                //   }
                // }}
                value={
                  values.date_commencement != null ||
                  values.date_commencement != ''
                    ? moment(values.date_commencement, [
                        moment.ISO_8601,
                        'MM/DD/YYYY',
                        'YYYY-MM-DD',
                        'YYYY-MM-DD HH:mm:ss',
                        'x', // Unix ms timestamp
                        'X', // Unix s timestamp
                      ])
                    : null
                }
                // value={values.close_date ? moment(values.close_date, 'MM/DD/YYYY') : null}
                onChange={(value: Date | null) => {
                  if (value) {
                    const formattedDate = moment(value).format('MM/DD/YYYY');
                    handleChange({
                      target: {
                        name: 'date_commencement',
                        value: formattedDate,
                      },
                    });
                  } else {
                    handleChange({
                      target: {
                        name: 'date_commencement',
                        value: null,
                      },
                    });
                  }
                }}
              />
            </Grid>
          </Grid>
          <Grid
            container
            spacing={3}
            className="mt-[10px] relative common-label-wrapper items-end"
          >
            <Grid item xs={6} className="pt-2">
              <DatePickerComp
                name="date_expiration"
                label={
                  <span className="label-margin text-base">
                    Expiration Date
                  </span>
                }
                style={{ width: '100%', fontFamily: 'montserrat-normal' }}
                value={
                  values.date_expiration != null || values.date_expiration != ''
                    ? moment(values.date_expiration, [
                        moment.ISO_8601,
                        'MM/DD/YYYY',
                        'YYYY-MM-DD',
                        'YYYY-MM-DD HH:mm:ss',
                        'x', // Unix ms timestamp
                        'X', // Unix s timestamp
                      ])
                    : null
                }
                // value={values.close_date ? moment(values.close_date, 'MM/DD/YYYY') : null}
                onChange={(value: Date | null) => {
                  if (value) {
                    const formattedDate = moment(value).format('MM/DD/YYYY');
                    handleChange({
                      target: {
                        name: 'date_expiration',
                        value: formattedDate,
                      },
                    });
                  } else {
                    handleChange({
                      target: {
                        name: 'date_expiration',
                        value: null,
                      },
                    });
                  }
                }}
              />
            </Grid>
            <Grid item xs={6} className="pt-2 selectFixedHeight">
              <SelectTextField
                onChange={(v: any) => {
                  handleInput({
                    target: {
                      name: 'lease_status',
                      value: v.target.value,
                    },
                  });
                }}
                label={
                  <span className="text-customGray">
                    {CreateCompsEnum.LEASE_STATUS}
                  </span>
                }
                value={values.lease_status}
                options={leaseStatusOptions}
                name="lease_status"
              ></SelectTextField>
            </Grid>
          </Grid>
          <Grid container spacing={3} className="mt-[10px] items-end">
            <Grid item xs={6} className="pt-2">
              <StyledField
                label="TI Allowance"
                name="TI_allowance"
                onKeyDown={(e: React.KeyboardEvent) => {
                  const event = e as React.KeyboardEvent<HTMLInputElement>;
                  const isBack = e.code === 'Backspace';
                  if (isBack) {
                    const inputElement = event.currentTarget;
                    const { selectionStart, selectionEnd } = inputElement;
                    const input = values.TI_allowance.toString().replace(
                      /[^\d]/g,
                      ''
                    ); // remove any non-digit characters
                    if (
                      selectionStart === 0 &&
                      selectionEnd === inputElement.value.length
                    ) {
                      handleInputChange(handleChange, 'TI_allowance', '');
                      event.preventDefault();
                    } else if (input.length > 0) {
                      const newValue = input.slice(0, -1); // Remove last digit
                      const shiftedValue = parseInt(newValue, 10) / 100; // Shift decimal left by 1
                      handleInputChange(
                        handleChange,
                        'TI_allowance',
                        `$${shiftedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      );
                      event.preventDefault();
                    }
                  }
                }}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const input = sanitizeInputDollarSignComps1(e.target.value);
                  handleInputChange(handleChange, 'TI_allowance', input);
                }}
                value={values.TI_allowance}
              />
            </Grid>
            <Grid item xs={6} className="selectFixedHeight pt-2">
              <SelectTextField
                onChange={handleAllowanceUnit}
                label={
                  <span className="text-customGray">
                    {CreateCompsEnum.TI_ALLOWANCE}
                  </span>
                }
                options={TIAllowanceOptions}
                name="TI_allowance_unit"
                value={values.TI_allowance_unit}
              ></SelectTextField>
            </Grid>
          </Grid>
          <Grid container spacing={3} className="mt-[10px] items-end">
            <Grid item xs={6} className="pt-2">
              <StyledField
                label="Asking Rent"
                name="asking_rent"
                onKeyDown={(e: React.KeyboardEvent) => {
                  const event = e as React.KeyboardEvent<HTMLInputElement>;
                  const isBack = e.code === 'Backspace';
                  if (isBack) {
                    const inputElement = event.currentTarget;
                    const { selectionStart, selectionEnd } = inputElement;
                    const input = values.asking_rent
                      .toString()
                      .replace(/[^\d]/g, ''); // remove any non-digit characters
                    if (
                      selectionStart === 0 &&
                      selectionEnd === inputElement.value.length
                    ) {
                      handleInputChange(handleChange, 'asking_rent', '');
                      event.preventDefault();
                    } else if (input.length > 0) {
                      const newValue = input.slice(0, -1); // Remove last digit
                      const shiftedValue = parseInt(newValue, 10) / 100; // Shift decimal left by 1
                      handleInputChange(
                        handleChange,
                        'asking_rent',
                        `$${shiftedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      );
                      event.preventDefault();
                    }
                  }
                }}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const input = sanitizeInputDollarSignComps1(e.target.value);
                  handleInputChange(handleChange, 'asking_rent', input);
                }}
                value={values.asking_rent}
              />
            </Grid>
            <Grid item xs={6} className="selectFixedHeight pt-2">
              <SelectTextField
                onChange={(v: any) => {
                  handleInput({
                    target: {
                      name: 'asking_rent_unit',
                      value: v.target.value,
                    },
                  });
                }}
                label={
                  <span className="text-customGray">
                    {CreateCompsEnum.ASKING_RATE}
                  </span>
                }
                value={values.asking_rent_unit}
                name="asking_rent_unit"
                options={askingRentUnitOptions}
              ></SelectTextField>
            </Grid>
          </Grid>
          <Grid container spacing={3} className="mt-[10px] items-end">
            <Grid item xs={6} className="pt-2">
              <StyledField
                label="Escalators"
                name="escalators"
                onKeyDown={(e: React.KeyboardEvent) => {
                  const event = e as React.KeyboardEvent<HTMLInputElement>;
                  const isBack = e.code === 'Backspace';

                  const { selectionStart, selectionEnd }: any = e.target;
                  const inputValue = values?.escalators?.toString() || '';

                  if (isBack) {
                    if (
                      selectionStart === 0 &&
                      selectionEnd >= inputValue.length
                    ) {
                      handleInputChange(handleChange, 'escalators', '');
                      event.preventDefault();
                    } else {
                      const inpArr = Array.from(inputValue);
                      inpArr.pop();
                      handleInputChange(
                        handleChange,
                        'escalators',
                        inpArr.join('')
                      );
                      event.preventDefault();
                    }
                  }
                }}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const input = e.target.value;

                  const sanitizedInput = input.replace(/[%|,]/g, '');

                  if (/^\d*\.?\d{0,2}$/.test(sanitizedInput)) {
                    handleInputChange(
                      handleChange,
                      'escalators',
                      sanitizedInput
                    );
                  }
                }}
                // value={sanitizeInputPercentageLease(values.escalators)}
                value={
                  values.escalators
                    ? formatPercentageInput(values.escalators)
                    : ''
                }
              />
            </Grid>
            <Grid item xs={6} className="pt-2">
              <StyledField
                label="Free Rent(Months)"
                name="free_rent"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const input = sanitizeInputTermFreeRent(e.target.value);
                  handleInputChange(handleChange, 'free_rent', input);
                }}
                value={values.free_rent}
              />
            </Grid>
          </Grid>
        </div>
        <div>
          <HarkenHr />
          <div className="pb-[40px]">
            <SellerBuyer
              passDataT={passDataT}
              passData={passData}
              newlyCreatedComp={newlyCreatedComp}
            />
          </div>
        </div>
      </div>
    </>
  );
};
