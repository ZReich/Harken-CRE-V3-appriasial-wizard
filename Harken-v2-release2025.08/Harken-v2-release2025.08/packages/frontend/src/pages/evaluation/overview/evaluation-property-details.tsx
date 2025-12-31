import { Typography, Autocomplete, TextField } from '@mui/material';
import Grid from '@mui/material/Grid';
import StyledField from '@/components/styles/StyleFieldEditComp';
import SelectTextField from '@/components/styles/select-input';
import DatePickerComp from '@/components/date-picker';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import React, { useEffect, useState } from 'react';
import { HarkenHr } from '@/components/harken-hr';
import {
  AppraisalTypeOption,
  AppraisalPropertyRightsOption,
} from '@/pages/appraisal/overview/SelectOption';

import { useFormikContext } from 'formik';
import AutocompleteLocation from '@/pages/comps/create-comp/searchLocation';
import { usa_state } from '@/pages/comps/comp-form/fakeJson';
import { CreateCompsEnum } from '@/pages/comps/enum/CompsEnum';
import moment from 'moment';
// import { formatDate } from '@/utils/date-format';
import {
  AmenitiesEnum,
  PropertyDetailsEnum,
  PropertyDetailsEnumParams,
} from '@/pages/appraisal/overview/OverviewEnum';

import GoogleMapLocation from '../../comps/create-comp/createCompMap';
import TextAreaField from '@/components/styles/textarea';
import {
  handleInputChange,
  sanitizeInputDollarSignComps,
  sanitizeHundredChar,
  sanitizeInpuAppraisalFile,
  sanitizePropertyLegal,
} from '@/utils/sanitize';
import axios from 'axios';
import { toast } from 'react-toastify';
export const EvaluationPropertyDetails = ({
  validationSchema,
  hasExistingAddress,
}: any) => {
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

  const getStateAbbreviation = (stateName: string): string => {
    const stateEntry = Object.entries(usa_state[0]).find(
      ([, fullName]) => fullName.toLowerCase() === stateName.toLowerCase()
    );
    return stateEntry ? stateEntry[0].toUpperCase() : stateName;
  };

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
  const [zoomLevel, setZoomLevel] = useState<number>(
    Number(localStorage.getItem('mapZoom')) || 10
  );
  return (
    <>
      <div>
        <Typography
          variant="h1"
          component="h2"
          className="text-lg font-bold mt-6"
        >
          {PropertyDetailsEnum.PROPERTY_DETAILS}
        </Typography>
        <div className="mt-[6px]">
          <Grid container spacing={3} className="mt-1 items-end">
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
                onSelected={async (location: any) => {
                  setValues((old: any) => ({
                    ...old,
                    state: location.state,
                    zipcode: location.zipCode,
                    county: location.county,
                    city: location.city,
                    street_address: location.address,
                    geometry: location.geometry,
                  }));

                  // Trigger property search API only if form doesn't have existing data (not updating)
                  if (
                    location.address &&
                    location.zipCode &&
                    !hasExistingAddress
                  ) {
                    // setSearchLoader(true);
                    try {
                      const response = await axios.post('/search-property', {
                        streetAddress: location.address,
                        city: location.city || '',
                        state: getStateAbbreviation(location.state || ''),
                        zipCode: location.zipCode,
                        apn: location.apn,
                      });
                      if (response.data?.data?.statusCode === 429) {
                        console.log('429 error detected, showing toast');
                        // toast.info(
                        //   response.data?.data?.message ||
                        //     'CoreLogic API quota exceeded. Please try again later.'
                        // );
                        return;
                      }
                      // Check if no properties found

                      if (response.data?.data?.data?.items?.[0]) {
                        const property = response.data.data.data.items[0];
                        const clipId = property.clip;
                        const id = property.id;

                        if (property?.propertyAPN?.apnParcelNumberFormatted) {
                          setFieldValue(
                            'parcel_id_apn',
                            property.propertyAPN.apnParcelNumberFormatted
                          );
                        }

                        // Call get-property-data API with clip ID
                        if (clipId || id) {
                          const params = new URLSearchParams();
                          if (clipId) params.append('clipId', clipId);
                          if (id) params.append('propertyId', id);

                          const propertyDataResponse = await axios.get(
                            `/get-property-data?${params.toString()}`
                          );

                          if (propertyDataResponse.data?.data?.data) {
                            const propertyData =
                              propertyDataResponse.data.data.data;

                            // Set zonings data
                            if (
                              propertyData.zonings &&
                              Array.isArray(propertyData.zonings)
                            ) {
                              const zoningsData = propertyData.zonings.map(
                                (zoning: any) => ({
                                  // id: index + 1,
                                  zone: '',
                                  sub_zone: '',
                                  sq_ft: zoning.sq_ft || '',
                                  bed: '',
                                  unit: '',
                                  weight_sf: '100',
                                  sub_zone_custom: '',
                                })
                              );
                              setFieldValue('zonings', zoningsData);
                            }

                            // Set property fields from API data
                            if (propertyData.owner_of_record) {
                              setFieldValue(
                                'owner_of_record',
                                propertyData.owner_of_record
                              );
                            }
                            if (propertyData.year_built) {
                              setFieldValue(
                                'year_built',
                                propertyData.year_built
                              );
                            }
                            if (propertyData.heating_cooling) {
                              setFieldValue(
                                'heating_cooling',
                                propertyData.heating_cooling
                              );
                            }
                            if (propertyData.condition) {
                              setFieldValue(
                                'condition',
                                propertyData.condition
                              );
                            }
                            if (propertyData.property_class) {
                              setFieldValue(
                                'property_class',
                                propertyData.property_class
                              );
                            }
                            if (propertyData.land_assessment) {
                              setFieldValue(
                                'land_assessment',
                                '$' +
                                  propertyData.land_assessment.toLocaleString(
                                    'en-US',
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )
                              );
                            }
                            if (propertyData.land_type) {
                              setFieldValue(
                                'land_type',
                                propertyData.land_type
                              );
                            }
                            if (propertyData.structure_assessment) {
                              setFieldValue(
                                'structure_assessment',
                                '$' +
                                  propertyData.structure_assessment.toLocaleString(
                                    'en-US',
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )
                              );
                            }
                            if (propertyData.tax_liability) {
                              setFieldValue(
                                'tax_liability',
                                '$' +
                                  propertyData.tax_liability.toLocaleString(
                                    'en-US',
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )
                              );
                            }
                            if (propertyData.building_size) {
                              setFieldValue(
                                'building_size',
                                propertyData.building_size
                              );
                            }
                            if (propertyData.land_size) {
                              setFieldValue(
                                'land_size',
                                propertyData.land_size.toLocaleString()
                              );
                            }
                            if (propertyData.utilities_select) {
                              setFieldValue(
                                'utilities_select',
                                propertyData.utilities_select
                              );
                            }
                            if (propertyData.utilities_select_custom) {
                              setFieldValue(
                                'utilities_select_custom',
                                propertyData.utilities_select_custom
                              );
                            }
                            if (propertyData.no_stories) {
                              setFieldValue(
                                'no_stories',
                                propertyData.no_stories.toString()
                              );
                            }
                            if (propertyData.exterior) {
                              setFieldValue('exterior', propertyData.exterior);
                            }
                            if (propertyData.electrical) {
                              setFieldValue(
                                'electrical',
                                propertyData.electrical
                              );
                            }
                            if (propertyData.plumbing) {
                              setFieldValue('plumbing', propertyData.plumbing);
                            }
                            if (propertyData.last_transferred_date) {
                              const date = new Date(
                                propertyData.last_transferred_date
                              );
                              const formattedDate = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`;
                              setFieldValue(
                                'last_transferred_date',
                                formattedDate
                              );
                            }
                            if (propertyData.latitude) {
                              setFieldValue(
                                'latitude',
                                propertyData.latitude.toString()
                              );
                            }
                            if (propertyData.longitude) {
                              setFieldValue(
                                'longitude',
                                propertyData.longitude.toString()
                              );
                            }
                          }
                        }
                      }

                      // Set mock data for missing fields
                    } catch (error) {
                      console.error('Property search failed:', error);

                      const hasResponse =
                        error &&
                        typeof error === 'object' &&
                        'response' in error &&
                        (error as any).response !== undefined;
                      const response = hasResponse
                        ? (error as any).response
                        : undefined;
                      const message = response?.data?.data?.message;
                      const statusCode = response?.data?.data?.statusCode;
                      const httpStatus = response?.status;

                      if (
                        message ===
                        'No properties found matching the search criteria'
                      ) {
                        toast.info(
                          'No properties found matching the search criteria'
                        );
                      } else if (
                        message === 'Missing CoreLogic API credentials'
                      ) {
                        // Do NOT show toast for this message
                        console.log(
                          'Missing CoreLogic API credentials — toast skipped'
                        );
                      } else if (statusCode === 429) {
                        console.log('429 error in catch block, showing toast');
                        toast.info(
                          message ||
                            'CoreLogic API quota exceeded. Please try again later.'
                        );
                      } else if (httpStatus === 429) {
                        console.log('429 HTTP status error, showing toast');
                        toast.info(
                          'API quota exceeded. Please try again later.'
                        );
                      } else {
                        console.log(
                          'Other error occurred:',
                          (error as any).message
                        );
                        toast.info(
                          'Failed to search property. Please try again.'
                        );
                      }
                    } finally {
                      // setSearchLoader(false);
                    }
                  }
                }}
                onRawInput={onRawInput}
              />
              {errors?.street_address && touched?.street_address ? (
                <span className="text-red-500 pt-1 absolute text-[11px] font-sans">
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
          <Grid container spacing={3} className="mt-4 items-end">
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
                  This Field is required
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
          <Grid className="mt-6 items-end">
            <Grid item xs={12}>
              <GoogleMapLocation
                passData={values.geometry}
                initialZoom={zoomLevel}
                onMarkerChange={(coords) => {
                  setValues((prev: any) => ({
                    ...prev,
                    geometry: coords,
                  }));
                }}
                onZoomChange={(newZoom) => {
                  setZoomLevel(newZoom);
                  localStorage.setItem('mapZoom', newZoom.toString());
                }}
              />

              {/* <GoogleMapLocation passData={values.geometry} /> */}
            </Grid>
          </Grid>
          <Grid container spacing={3} className="mt-4 items-end">
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
                  onKeyDown={(e: React.KeyboardEvent<Element>) => {
                    const target = e.target as HTMLInputElement;
                    if ((e.key === 'Backspace' || e.key === 'Delete') && 
                        (target.value === '$0.00' || target.value === '')) {
                      handleInputChange(handleChange, 'under_contract_price', '');
                    }
                  }}
                />
              </Grid>
            ) : null}
            {values.type === PropertyDetailsEnumParams.SALE ? (
              <Grid
                item
                xs={6}
                xl={3}
                className="mt-[8px] common-label-wrapper pt-2"
              >
                <DatePickerComp
                  label={PropertyDetailsEnum.CLOSE_DATE}
                  name={PropertyDetailsEnum.CLOSE_DATE_NAME}
                  // value={ moment(values.close_date, 'MM/DD/YYYY')}
                  value={
                    values.close_date != null || values.close_date != ''
                      ? moment(values.close_date, [
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
                          name: PropertyDetailsEnum.CLOSE_DATE_NAME,
                          value: formattedDate,
                        },
                      });
                    } else {
                      handleChange({
                        target: {
                          name: PropertyDetailsEnum.CLOSE_DATE_NAME,
                          value: null,
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
                  onKeyDown={(e: React.KeyboardEvent<Element>) => {
                    const target = e.target as HTMLInputElement;
                    if ((e.key === 'Backspace' || e.key === 'Delete') && 
                        (target.value === '$0.00' || target.value === '')) {
                      handleInputChange(handleChange, 'price', '');
                    }
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
                    value={
                      values.last_transferred_date != null ||
                      values.last_transferred_date != ''
                        ? moment(values.last_transferred_date, [
                            moment.ISO_8601,
                            'MM/DD/YYYY',
                            'YYYY-MM-DD',
                            'YYYY-MM-DD HH:mm:ss',
                            'x', // Unix ms timestamp
                            'X', // Unix s timestamp
                          ])
                        : null
                    }
                    //  value={values.last_transferred_date ? moment(values.last_transferred_date, 'MM/DD/YYYY') : null}
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
