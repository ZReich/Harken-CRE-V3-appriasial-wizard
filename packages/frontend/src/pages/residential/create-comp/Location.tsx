import { Typography, Autocomplete, TextField } from '@mui/material';
import Grid from '@mui/material/Grid';
import StyledField from '@/components/styles/StyleFieldEditComp';
import { HarkenHr } from '@/components/harken-hr';
import { useFormikContext } from 'formik';
import StarIcon from '@mui/icons-material/Star';
import { usa_state } from '@/pages/comps/comp-form/fakeJson';
import AutocompleteLocation from '@/pages/comps/create-comp/searchLocation';
import GoogleMapLocation from '../../comps/create-comp/createCompMap';
import React, { useEffect, useState } from 'react';
import {
  ResidentialComponentHeaderEnum,
  LocationResidentialComp,
} from '../enum/ResidentialEnum';
import { CreateCompsEnum } from '@/pages/comps/enum/CompsEnum';

export const Location = ({ setDataRequited, updateData }: any) => {
  const { values, errors, setFieldValue, setValues } = useFormikContext<any>();
  console.log(values, 'res_comp_value');
  const [zoomLevel, setZoomLevel] = useState<number>(
    Number(localStorage.getItem('mapZoomResidential')) || 10
  );

  useEffect(() => {
    if (values.zipcode?.state) {
      setFieldValue(LocationResidentialComp.STATE_NAME, values.zipcode?.state);
      setFieldValue(LocationResidentialComp.CITY_NAME, values.zipcode?.city);
      setFieldValue(
        LocationResidentialComp.ZIPCODE_NAME,
        values.zipcode?.zipCode
      );
    }
  }, [values.zipcode?.state]);

  useEffect(() => {
    if (values.zipcode?.zipCode) {
      setFieldValue(
        LocationResidentialComp.ZIPCODE_NAME,
        values.zipcode?.zipCode
      );
      setFieldValue(LocationResidentialComp.CITY_NAME, values.zipcode?.city);
    }
  }, [values.zipcode?.state]);

  const handleChangeZipcode = (event: React.ChangeEvent<HTMLInputElement>) => {
    let { value } = event.target;
    value = value.replace(/\D/g, '');
    if (value.length <= 5) {
      setFieldValue(LocationResidentialComp.ZIPCODE_NAME, value);
    }
  };

  const onRawInput = (e: any) => {
    if (e === '') {
      setFieldValue(LocationResidentialComp.CITY_NAME, '');
      setFieldValue(LocationResidentialComp.STATE_NAME, '');
      setFieldValue(LocationResidentialComp.ZIPCODE_NAME, '');
    }
  };
  useEffect(() => {
    if (values.zipcode?.state) {
      setFieldValue(LocationResidentialComp.STATE_NAME, values.zipcode?.state);
      setFieldValue(LocationResidentialComp.CITY_NAME, values.zipcode?.city);
      setFieldValue(
        LocationResidentialComp.ZIPCODE_NAME,
        values.zipcode?.zipCode
      );
    }
  }, [values.zipcode?.state]);

  useEffect(() => {
    if (updateData?.id) {
      const lat = parseFloat(updateData.latitude);
      const lng = parseFloat(updateData.longitude);

      const geometry = {
        lat: lat,
        lng: lng,
      };

      setFieldValue(
        LocationResidentialComp.PROPERTY_NAME,
        updateData.property_name
      );
      setFieldValue(LocationResidentialComp.CITY_NAME, updateData.city);
      setFieldValue(
        LocationResidentialComp.STREET_SUITE_NAME,
        values.street_suite
      );
      setFieldValue(LocationResidentialComp.ZIPCODE_NAME, updateData.zipcode);
      setFieldValue(
        LocationResidentialComp.STREET_ADDRESS_NAME,
        updateData.street_address
      );
      setFieldValue(LocationResidentialComp.LATITUDE, updateData.latitude);
      setFieldValue(LocationResidentialComp.LONGITUDE, updateData.longitude);
      setFieldValue(LocationResidentialComp.GEOMETRY, geometry);

      const stateCode = usa_state.find((state) => state[updateData.state]);
      if (stateCode) {
        const fullName = stateCode[updateData.state];
        setFieldValue(LocationResidentialComp.STATE_NAME, fullName);
      }
    }
  }, [updateData?.id]);

  const usaStateOptions = Object.entries(usa_state[0]).map(
    ([value, label]) => ({
      value,
      label,
    })
  );

  return (
    <>
      <div>
        <Typography variant="h6" component="h5" className="text-lg font-bold">
          {ResidentialComponentHeaderEnum.LOCATION}
        </Typography>
        <div className="mt-6">
          {/* <Grid>
            <Grid item xs={12}>
              <StyledField
                label={
                  <span className="relative">
                    {LocationResidentialComp.PROPERTY_TYPE}
                    <StarIcon className="absolute text-[6px] text-red-500 right-[-10px]" />
                  </span>
                }
                name={LocationResidentialComp.PROPERTY_NAME}
              />
            </Grid>
          </Grid> */}
          <Grid container spacing={3} className="mt-[10px]">
            <Grid item xs={6} className="relative pt-4">
              <AutocompleteLocation
                onSelected={(location: any) => {
                  setValues((old: any) => ({
                    ...old,
                    state: location.state,
                    zipcode: location.zipCode,
                    county: location.county,
                    city: location.city === null ? '' : location?.city,
                    street_address: location.address,
                    geometry: location.geometry,
                  }));
                }}
                onRawInput={onRawInput}
              />

              {setDataRequited && errors && (
                <div className="text-red-500 text-[11px] absolute">
                  {errors.street_address as any}
                </div>
              )}
            </Grid>
          </Grid>

          <Grid container spacing={3} className="mt-[10px]">
            <Grid item xs={3} className="relative pt-4">
              <StyledField
                label={
                  <span className="relative -top-1">
                    {LocationResidentialComp.CITY}
                    <StarIcon className="absolute text-[6px] text-red-500 right-[-10px]" />
                  </span>
                }
                name={LocationResidentialComp.CITY_NAME}
                value={values.city}
              />
              {setDataRequited && !values?.city && (
                <div className="text-red-500 text-[11px] absolute">
                  {CreateCompsEnum.REQUIRED_FIELD}
                </div>
              )}
            </Grid>
            <Grid item xs={3} className="relative -mt-[2px] pt-4">
              <Autocomplete
                disableClearable={true}
                options={usaStateOptions}
                value={values.state ? values.state : '-Select State-'}
                isOptionEqualToValue={(option, value) =>
                  option.value === value.value
                }
                onChange={(_event, newValue) => {
                  setFieldValue(
                    LocationResidentialComp.STATE_NAME,
                    newValue?.label || values.zipcode?.state || ''
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={
                      <span className="text-customGray">
                        {LocationResidentialComp.SELECT_STATE}
                        <span className="text-red-500"> *</span>
                      </span>
                    }
                    variant="standard"
                  />
                )}
              />
              {setDataRequited &&
                (values?.state === '--Select State--' ||
                  values?.state === '') && (
                  <div className="text-red-500 text-[11px] absolute">
                    This field is required
                  </div>
                )}
            </Grid>
            <Grid item xs={3} className="relative pt-4">
              <StyledField
                label={
                  <span className="relative -top-1">
                    {LocationResidentialComp.ZIPCODE}
                    <StarIcon className="absolute text-[6px] text-red-500 right-[-10px]" />
                  </span>
                }
                name={LocationResidentialComp.ZIPCODE_NAME}
                type="text"
                value={values.zipcode}
                onChange={handleChangeZipcode}
              />
            </Grid>
          </Grid>

          <Grid className="mt-[20px]">
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
                  localStorage.setItem(
                    'mapZoomResidential',
                    newZoom.toString()
                  );
                }}
              />{' '}
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
