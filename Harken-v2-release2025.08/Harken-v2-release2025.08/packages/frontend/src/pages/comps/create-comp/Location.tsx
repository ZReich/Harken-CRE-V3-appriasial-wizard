import { Typography, Autocomplete, TextField } from '@mui/material';
import Grid from '@mui/material/Grid';
import StyledField from '@/components/styles/StyleFieldEditComp';
import { HarkenHr } from '@/components/harken-hr';
import { useFormikContext } from 'formik';
// import StarIcon from '@mui/icons-material/Star';
import { usa_state } from '../comp-form/fakeJson';
import AutocompleteLocation from './searchLocation';
import GoogleMapLocation from './createCompMap';
import React, { useEffect, useState } from 'react';
import TextAreaField from '@/components/styles/textarea';
import { CreateCompsEnum } from '../enum/CompsEnum';
import { ResidentialComponentHeaderEnum } from '@/pages/residential/enum/ResidentialEnum';
import { toast } from 'react-toastify';

// type keys = keyof typeof UsaStateCodes;
export const Location = ({
  setDataRequited,
  passData,
  hasExistingAddress,
}: any) => {
  const { values, errors, setFieldValue, setValues } = useFormikContext<any>();
  const [zoomLevel, setZoomLevel] = useState<number>(
    Number(localStorage.getItem('mapZoom')) || 10
  );
  console.log(values?.zipcode, 'zipcodezipcode');
  useEffect(() => {
    if (values.zipcode?.state) {
      setFieldValue('state', values.zipcode?.state);
    }
  }, [values.zipcode?.state]);

  useEffect(() => {
    if (values.zipcode?.zipCode) {
      setFieldValue('zipcode', values.zipcode?.zipCode);
      setFieldValue('city', values.zipcode?.city);
    }
  }, [values.zipcode?.state]);

  useEffect(() => {
    if (passData.id) {
      const lat = parseFloat(passData.latitude);
      const lng = parseFloat(passData.longitude);

      const geometry = {
        lat: lat,
        lng: lng,
      };

      setFieldValue('business_name', passData.business_name);
      setFieldValue('location_desc', passData.location_desc);
      setFieldValue('legal_desc', passData.legal_desc);
      setFieldValue('legal_desc', passData.legal_desc);
      setFieldValue('city', passData.city);
      setFieldValue('street_suite', passData.street_suite);
      setFieldValue('zipcode', passData.zipcode);
      setFieldValue('street_address', passData.street_address);
      setFieldValue('geometry', geometry);

      setFieldValue('map_pin_lat', passData.map_pin_lat);
      setFieldValue('map_pin_lng', passData.map_pin_lng);

      const stateCode = usa_state.find((state) => state[passData.state]);
      if (stateCode) {
        const fullName = stateCode[passData.state];
        setFieldValue('state', fullName);
      }
    }
  }, [passData.id, passData.state]);

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

  const handleChangeZipcode = (event: React.ChangeEvent<HTMLInputElement>) => {
    let { value } = event.target;
    value = value.replace(/\D/g, '');
    if (value.length <= 5) {
      setFieldValue('zipcode', value);
    }
  };

  const onRawInput = (e: any) => {
    if (e === '') {
      setFieldValue('city', '');
      setFieldValue('zipcode', '');
      setFieldValue('state', '');
    }
  };

  return (
    <>
      <div>
        <Typography variant="h6" component="h5" className="text-lg font-bold">
          {ResidentialComponentHeaderEnum.LOCATION}
        </Typography>
        <div className="mt-4">
          <Grid container spacing={3} className="mt-2 relative items-end">
            <Grid item xs={6} className="mt-1 pt-2">
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

                  // Trigger property search API only if form doesn't have existing address data
                  const originalStreetAddress = values?.street_address;
                  if (
                    location.address &&
                    location.zipCode &&
                    (hasExistingAddress === false ||
                      (!originalStreetAddress &&
                        hasExistingAddress === undefined))
                  ) {
                    // setSearchLoader(true);
                    try {
                      const axios = (await import('axios')).default;
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

                            // Set zonings data from API
                            if (
                              propertyData.zonings &&
                              Array.isArray(propertyData.zonings)
                            ) {
                              const compZoningsData = propertyData.zonings.map(
                                (zoning: any) => ({
                                  zone: zoning.zone || '',
                                  sub_zone: zoning.sub_zone || '',
                                  sq_ft: zoning.sq_ft
                                    ? zoning.sq_ft.toLocaleString()
                                    : '',
                                  unit: zoning.unit || '',
                                  bed: zoning.bed || '',
                                  sub_zone_custom: zoning.sub_zone_custom || '',
                                })
                              );
                              setFieldValue('zonings', compZoningsData);
                            }

                            // Set building data from API
                            if (propertyData.building_size) {
                              setFieldValue(
                                'gross_building_area',
                                propertyData.building_size.toLocaleString()
                              );
                              setFieldValue(
                                'net_building_area',
                                (
                                  propertyData.building_size * 0.85
                                ).toLocaleString()
                              );
                            }
                            if (propertyData.no_stories) {
                              setFieldValue(
                                'stories',
                                propertyData.no_stories.toString()
                              );
                            }
                            if (propertyData.condition) {
                              setFieldValue(
                                'condition',
                                propertyData.condition
                              );
                            }
                            if (propertyData.year_built) {
                              setFieldValue(
                                'year_built',
                                propertyData.year_built.toString()
                              );
                            }

                            // Set site data from API
                            if (propertyData.topography) {
                              setFieldValue(
                                'topography',
                                propertyData.topography
                              );
                            }
                            if (propertyData.lot_shape) {
                              setFieldValue(
                                'lot_shape',
                                propertyData.lot_shape
                              );
                            }
                            if (propertyData.frontage) {
                              setFieldValue('frontage', propertyData.frontage);
                            }
                            if (propertyData.land_size) {
                              setFieldValue(
                                'land_size',
                                propertyData.land_size.toLocaleString()
                              );
                            }

                            // Set transaction data from API
                            if (propertyData.grantor) {
                              setFieldValue('grantor', propertyData.grantor);
                            }
                            if (propertyData.grantee) {
                              setFieldValue('grantee', propertyData.grantee);
                            }
                            if (propertyData.sale_price) {
                              setFieldValue(
                                'sale_price',
                                '$' +
                                  propertyData.sale_price.toLocaleString(
                                    'en-US',
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )
                              );
                            }
                            if (propertyData.date_sold) {
                              const date = new Date(propertyData.date_sold);
                              const formattedDate = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`;
                              setFieldValue('date_sold', formattedDate);
                            }
                            if (propertyData.zoning_type) {
                              setFieldValue(
                                'zoning_type',
                                propertyData.zoning_type
                              );
                            }
                            if (propertyData.utilities_select) {
                              setFieldValue(
                                'utilities_select',
                                propertyData.utilities_select
                              );
                            }
                          }
                        }
                      }
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

              {setDataRequited && errors && (
                <div className="text-red-500 text-[11px] absolute">
                  {errors.street_address as any}
                </div>
              )}
            </Grid>
            <Grid item xs={6} className="mt-1 pt-2">
              <StyledField label="Suite Number" name="street_suite" />
            </Grid>
          </Grid>

          <Grid container spacing={3} className="mt-2 relative items-end">
            <Grid item xs={4} lg={3} className="pt-2">
              <StyledField
                label={
                  <span className="relative z-10">
                    {CreateCompsEnum.CITY}
                    <span className="text-red-500 text-xs absolute !bottom-[2px] !right-[-7px]">
                      *
                    </span>
                  </span>
                }
                name="city"
                value={values.city}
              />
              {setDataRequited && errors && !values?.city && (
                <div className="text-red-500 text-[11px] absolute">
                  {CreateCompsEnum.REQUIRED_FIELD}
                </div>
              )}
            </Grid>
            <Grid
              item
              xs={4}
              lg={3}
              className="relative pt-2 selectFixedHeight"
            >
              <Autocomplete
                disableClearable={true}
                options={usaStateOptions}
                value={values.state ? values.state : '-Select State-'}
                isOptionEqualToValue={(option, value) =>
                  option.value === value.value
                }
                onChange={(_event, newValue) => {
                  setFieldValue(
                    'state',
                    newValue?.label || values.zipcode?.state || ''
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    className="relative"
                    {...params}
                    label={
                      <span className="text-customGray">
                        {CreateCompsEnum.STATE}
                        <span className="text-red-500"> *</span>
                      </span>
                    }
                    variant="standard"
                  />
                )}
              />
              {/* {setDataRequited && errors && !values?.city && (
                <div className="text-red-500 pt-1 text-sm absolute">
                  {errors.state as any}
                </div>
              )} */}
              {setDataRequited &&
                (values?.state === '--Select State--' ||
                  values?.state === '' ||
                  values.state === null) && (
                  <div className="text-red-500 text-[11px] absolute">
                    This field is required
                  </div>
                )}
            </Grid>
            <Grid item xs={4} lg={3} className="pt-2">
              <StyledField
                label={
                  <span className="relative z-10">
                    {CreateCompsEnum.ZIPCODE}
                    <span className="text-red-500 text-xs absolute !bottom-[2px] !right-[-7px]">
                      *
                    </span>
                  </span>
                }
                name="zipcode"
                type="text"
                value={values?.zipcode}
                onChange={handleChangeZipcode}
              />
              {setDataRequited && values?.zipcode?.length > 5 && (
                <div className="text-red-500 text-[11px] absolute">
                  Please enter no more than 5 characters.
                </div>
              )}
            </Grid>
          </Grid>

          <Grid className="mt-5">
            <Grid item xs={12} className="pt-2">
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
              />{' '}
            </Grid>
          </Grid>

          <Grid container spacing={3} className="mt-5 items-end">
            <Grid item xs={12} className="pt-2">
              <TextAreaField
                label="Location Description"
                name="location_desc"
              />
            </Grid>
          </Grid>
          <Grid container spacing={3} className="mt-2 items-end">
            <Grid item xs={12} className="pt-2">
              <TextAreaField label="Legal Description" name="legal_desc" />
            </Grid>
          </Grid>
        </div>
        <div>
          <HarkenHr />
        </div>
      </div>
    </>
  );
};
