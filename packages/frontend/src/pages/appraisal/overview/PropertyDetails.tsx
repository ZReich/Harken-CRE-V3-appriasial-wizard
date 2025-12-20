import { Typography, Autocomplete, TextField } from '@mui/material';
import Grid from '@mui/material/Grid';
import StyledField from '@/components/styles/StyleFieldEditComp';
import SelectTextField from '@/components/styles/select-input';
import DatePickerComp from '@/components/date-picker';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import React, { useEffect } from 'react';
import { HarkenHr } from '@/components/harken-hr';
import {
  AppraisalTypeOption,
  AppraisalPropertyRightsOption,
} from './SelectOption';
import { useFormikContext } from 'formik';
import AutocompleteLocation from '@/pages/comps/create-comp/searchLocation';
import { usa_state } from '@/pages/comps/comp-form/fakeJson';
import { CreateCompsEnum } from '@/pages/comps/enum/CompsEnum';
import moment from 'moment';
import {
  AmenitiesEnum,
  PropertyDetailsEnum,
  PropertyDetailsEnumParams,
} from './OverviewEnum';

import GoogleMapLocation from '../../comps/create-comp/createCompMap';
import { sanitizePropertyLegal } from '@/utils/sanitize';
import TextAreaField from '@/components/styles/textarea';
import {
  handleInputChange,
  sanitizeInputDollarSignComps,
  sanitizeHundredChar,
  sanitizeInpuAppraisalFile,
} from '@/utils/sanitize';
export const PropertyDetails = ({ validationSchema }: any) => {
  const { values, setFieldValue, handleChange, errors, touched, setValues } =
    useFormikContext<any>();
  useEffect(() => {
    if (values.zipcode?.state) {
      setFieldValue(PropertyDetailsEnum.STATE, values.zipcode?.state);
    }
  }, [values.zipcode?.state]);

  useEffect(() => {
    if (values.zipcode?.zipCode) {
      setFieldValue(PropertyDetailsEnum.ZIPCODE_NAME, values.zipcode?.zipCode);
      setFieldValue(PropertyDetailsEnum.CITY_NAME, values.zipcode?.city);
    }
  }, [values.zipcode?.state]);

  const handleChange1 = (
    _event: React.MouseEvent<HTMLElement>,
    newAlignment: string
  ) => {
    if (!newAlignment.length) {
      return;
    }
    setFieldValue(PropertyDetailsEnum.LAST_TRANSFER_DATE_UNKNOWN, newAlignment);
  };
  const activeToggle = 'rounded-[20px] bg-[#0da1c7] text-white';

  const usaStateOptions = Object.entries(usa_state[0]).map(
    ([value, label]) => ({
      value,
      label,
    })
  );

  const onRawInput = (e: any) => {
    if (e === '') {
      setFieldValue(PropertyDetailsEnum.CITY_NAME, '');
      setFieldValue(PropertyDetailsEnum.ZIPCODE_NAME, '');
      setFieldValue(PropertyDetailsEnum.STATE, '');
    }
  };

  const handleChangeZipcode = (event: React.ChangeEvent<HTMLInputElement>) => {
    let { value } = event.target;
    value = value.replace(/\D/g, '');
    if (value.length <= 5) {
      setFieldValue('zipcode', value);
    }
  };

  return (
    <>
      <div>
        <Typography
          variant="h1"
          component="h2"
          className="text-lg font-bold mt-5"
        >
          {PropertyDetailsEnum.PROPERTY_DETAILS}
        </Typography>
        <div className="mt-[6px]">
          <Grid container spacing={3} className="mt-3 items-end">
            <Grid item xs={6} className="pt-2">
              <StyledField
                label={
                  <span className="text-customGray">
                    {PropertyDetailsEnum.REPORT_TITLE}
                    <span className="text-red-500"> *</span>
                  </span>
                }
                name={PropertyDetailsEnum.BUSINESS_NAME}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const input = sanitizePropertyLegal(e.target.value);
                  handleInputChange(handleChange, 'business_name', input);
                }}
                value={values.business_name}
              />
            </Grid>
            <Grid item xs={3} className="pt-2">
              <AutocompleteLocation
                onSelected={(location: any) => {
                  setValues((old: any) => ({
                    ...old,
                    state: location.state,
                    zipcode: location.zipCode,
                    county: location.county,
                    city: location.city,
                    street_address: location.address,
                    geometry: location.geometry,
                  }));
                }}
                onRawInput={onRawInput}
              />
              {errors?.street_address && touched?.street_address ? (
                <span className="text-red-500 text-[11px] font-sans absolute">
                  {errors?.street_address as any}
                </span>
              ) : null}
            </Grid>

            <Grid item xs={3} className="pt-2">
              <StyledField
                label={PropertyDetailsEnum.SUITE_NUMBER}
                name={PropertyDetailsEnum.STREET_SUITE}
              />
            </Grid>
          </Grid>
          <Grid container spacing={3} className="mt-3 items-end">
            <Grid item xs={6} xl={3} className="pt-2">
              <Autocomplete
                disableClearable={true}
                className="mt-1"
                options={usaStateOptions}
                value={
                  values.state ? values.state : PropertyDetailsEnum.SELECT_STATE
                }
                isOptionEqualToValue={(option, value) =>
                  option.value === value.value
                }
                onChange={(_event, newValue) => {
                  setFieldValue(
                    PropertyDetailsEnum.STATE,
                    newValue?.label || values.zipcode?.state || ''
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={
                      <span className="text-customGray">
                        {CreateCompsEnum.STATE}
                        <span className="text-red-500">*</span>
                      </span>
                    }
                    variant="standard"
                  />
                )}
              />
              {validationSchema && values.state === '--Select State--' && (
                <div className="text-red-500 pt-1  text-[11px] absolute">
                  This Field is required.
                </div>
              )}
              {errors?.state && touched?.state && (
                <div className="text-red-500 pt-1  text-[11px] absolute">
                  {errors.state as any}
                </div>
              )}
            </Grid>
            <Grid item xs={6} xl={3} className="pt-2">
              <StyledField
                label={
                  <span className="text-customGray relative">
                    {PropertyDetailsEnum.CITY}
                    <span className="text-red-500">*</span>
                  </span>
                }
                name={PropertyDetailsEnum.CITY_NAME}
                value={values.city}
              />
            </Grid>
            <Grid item xs={6} xl={3} className="pt-2">
              <StyledField
                label={
                  <span className="relative">
                    {' '}
                    {PropertyDetailsEnum.ZIPCODE}
                  </span>
                }
                name={PropertyDetailsEnum.ZIPCODE_NAME}
                type="text"
                value={values.zipcode}
                onChange={handleChangeZipcode}
              />
            </Grid>
            <Grid item xs={6} xl={3} className="pt-2">
              <StyledField
                label={
                  <span className="relative">
                    {PropertyDetailsEnum.COUNTRY}
                  </span>
                }
                name={PropertyDetailsEnum.COUNTRY_NAME}
                type="text"
                value={values.county}
                onChange={(e) => {
                  setFieldValue(PropertyDetailsEnum.COUNTY, e.target.value);
                }}
              />
            </Grid>
          </Grid>
          <Grid className="mt-5">
            <Grid item xs={12}>
              <GoogleMapLocation passData={values.geometry} />
            </Grid>
          </Grid>
          <Grid container spacing={3} className="mt-3 items-end">
            <Grid item xs={6} xl={3} className="pt-2 selectFixedHeight">
              <SelectTextField
                label={PropertyDetailsEnum.TYPE}
                name={PropertyDetailsEnum.TYPE_NAME}
                options={AppraisalTypeOption}
                value={values.type}
                onChange={(e) =>
                  setFieldValue(PropertyDetailsEnum.TYPE_NAME, e.target.value)
                }
              />
            </Grid>
            {values.type === PropertyDetailsEnumParams.SALE ? (
              <Grid item xs={6} xl={3} className="pt-2">
                <StyledField
                  label={PropertyDetailsEnum.UNDER_CONTRACT_PRICE}
                  name={PropertyDetailsEnum.UNDER_CONTRACT_PRICE_NAME}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const input = sanitizeInputDollarSignComps(e.target.value);
                    handleInputChange(
                      handleChange,
                      'under_contract_price',
                      input
                    );
                  }}
                />
              </Grid>
            ) : null}
            {values.type === PropertyDetailsEnumParams.SALE ? (
              <Grid item xs={6} xl={3} className="pt-2 common-label-wrapper">
                <DatePickerComp
                  label={PropertyDetailsEnum.CLOSE_DATE}
                  name={PropertyDetailsEnum.CLOSE_DATE_NAME}
                  value={moment(values.close_date, 'MM/DD/YYYY')}
                  onChange={(value: Date | null) => {
                    if (value) {
                      const formattedDate = moment(value).format('MM/DD/YYYY');
                      handleChange({
                        target: {
                          name: PropertyDetailsEnum.CLOSE_DATE_NAME,
                          value: formattedDate,
                        },
                      });
                    } else {
                      handleChange({
                        target: {
                          name: PropertyDetailsEnum.CLOSE_DATE_NAME,
                          value: null, // Set null when cleared
                        },
                      });
                    }
                  }}
                />
              </Grid>
            ) : null}

            {values.type === PropertyDetailsEnumParams.NON_SALE ? (
              <Grid item xs={6} xl={3} className="pt-2">
                <StyledField
                  label={PropertyDetailsEnum.PRICE_LABEL}
                  name={PropertyDetailsEnum.PRICE}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const input = sanitizeInputDollarSignComps(e.target.value);
                    handleInputChange(handleChange, 'price', input);
                  }}
                />
              </Grid>
            ) : null}

            <Grid item xs={3} className="pt-2">
              <p className="text-xs font-medium">
                {PropertyDetailsEnum.IS_LAST_SALE_DATE}
              </p>
              <ToggleButtonGroup
                color="primary"
                value={values.last_transfer_date_known}
                onChange={handleChange1}
                exclusive
                sx={{
                  '&.MuiToggleButtonGroup-root': {
                    maxHeight: 32,
                    p: 0.3,
                    borderRadius: 32,
                    width: '100%',
                  },
                }}
                className="bg-[#e8f8fc] mt-[13px]"
              >
                <ToggleButton
                  value={PropertyDetailsEnum.YES.toLowerCase()}
                  sx={{
                    '&.MuiButtonBase-root': { width: '50%' },
                    fontSize: '12px',
                    textTransform: 'capitalize',
                  }}
                  className={
                    values.last_transfer_date_known === 'yes'
                      ? activeToggle // Inactive styling when 'yes' is selected
                      : 'border-0 text-[#90bcc8] bg-transparent' // Active styling when 'no' is selected
                  }
                >
                  {PropertyDetailsEnum.YES}
                </ToggleButton>
                <ToggleButton
                  value={PropertyDetailsEnum.NO.toLowerCase()}
                  sx={{
                    '&.MuiButtonBase-root': { width: '50%' },
                    fontSize: '12px',
                    textTransform: 'capitalize',
                  }}
                  className={
                    values.last_transfer_date_known === 'no'
                      ? activeToggle // Inactive styling when 'no' is selected
                      : 'border-0 text-[#90bcc8] bg-transparent' // Active styling when 'yes' is selected
                  }
                >
                  {PropertyDetailsEnum.NO}
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
          </Grid>
          <Grid container spacing={3} className="mt-2 items-end">
            {values.last_transfer_date_known === 'yes' ? (
              <Grid item xs={6} xl={3} className="common-label-wrapper pt-2">
                <div style={{ marginTop: '11px' }}>
                  <DatePickerComp
                    label={PropertyDetailsEnum.LAST_SALE_DATE}
                    name={PropertyDetailsEnum.LAST_TRANSFER_DATE}
                    value={moment(values.last_transferred_date, 'MM/DD/YYYY')}
                    onChange={(value: Date | null) => {
                      if (value) {
                        const formattedDate =
                          moment(value).format('MM/DD/YYYY');
                        handleChange({
                          target: {
                            name: PropertyDetailsEnum.LAST_TRANSFER_DATE,
                            value: formattedDate,
                          },
                        });
                      } else {
                        handleChange({
                          target: {
                            name: PropertyDetailsEnum.LAST_TRANSFER_DATE,
                            value: null, // Set null when cleared
                          },
                        });
                      }
                    }}
                  />
                </div>
              </Grid>
            ) : null}

            <Grid item xs={6} xl={3} className="pt-2">
              <StyledField
                label={PropertyDetailsEnum.APN_PARCEL_ID_TAX_ID}
                name={PropertyDetailsEnum.PARCEL_ID_APN}
              />
            </Grid>
            <Grid item xs={6} xl={3} className="pt-2">
              <StyledField
                label={PropertyDetailsEnum.OWNER_OF_RECORD}
                name={PropertyDetailsEnum.OWNER_OF_RECORD_NAME}
              />
            </Grid>
            <Grid item xs={6} xl={3} className="pt-2">
              <StyledField
                label={PropertyDetailsEnum.PROPERTY_GEOCODE}
                name={PropertyDetailsEnum.PROPERTY_GEOCODE_NAME}
              />
            </Grid>
          </Grid>
          <Grid container spacing={3} className="mt-2 items-end">
            <Grid item xs={3} className="property-legal pt-2 textareaField">
              <TextAreaField
                label={PropertyDetailsEnum.PROPERTY_LEGAL}
                name={PropertyDetailsEnum.PROPERTY_LEGAL_NAME}
                maxLength={400}
              />
            </Grid>
            <Grid
              item
              className="property-rights pt-2 selectFixedHeight"
              xs={values.property_rights === AmenitiesEnum.TYPE_MY_OWN ? 3 : 3}
            >
              <SelectTextField
                label={PropertyDetailsEnum.PROPERTY_RIGHTS}
                name={PropertyDetailsEnum.PROPERTY_RIGHTS_NAME}
                options={AppraisalPropertyRightsOption}
                onChange={(e) =>
                  setFieldValue(
                    PropertyDetailsEnum.PROPERTY_RIGHTS_NAME,
                    e.target.value
                  )
                }
                value={values.property_rights}
              />
            </Grid>
            {values.property_rights === AmenitiesEnum.TYPE_MY_OWN ? (
              <Grid item xs={3} className="pt-2">
                <StyledField
                  label={PropertyDetailsEnum.OTHER_PROPERTY_RIGHTS_TYPE}
                  name={PropertyDetailsEnum.PROPERTY_RIGHTS_CUSTOM}
                />
              </Grid>
            ) : null}
            <Grid item xs={6} xl={3} className="pt-2">
              <StyledField
                label={PropertyDetailsEnum.FILE}
                name={PropertyDetailsEnum.FILE_NUMBER}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const input = sanitizeInpuAppraisalFile(e.target.value);
                  handleInputChange(handleChange, 'file_number', input);
                }}
                value={values.file_number}
              />
            </Grid>
          </Grid>
          <Grid container spacing={3} className="mt-2 items-end">
            <Grid item xs={6} xl={6} className="pt-2">
              <StyledField
                label={PropertyDetailsEnum.PROPERTY_INTENDED_USE}
                name={PropertyDetailsEnum.INTENDED_USE}
              />
            </Grid>
            <Grid item xs={6} xl={6} className="pt-2">
              <StyledField
                label={PropertyDetailsEnum.INTENDED_USERS}
                name={PropertyDetailsEnum.INTENDED_USER}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const input = sanitizeHundredChar(e.target.value);
                  handleInputChange(handleChange, 'intended_user', input);
                }}
                value={values.intended_user}
              />
            </Grid>
          </Grid>
          <HarkenHr />
        </div>
      </div>
    </>
  );
};
