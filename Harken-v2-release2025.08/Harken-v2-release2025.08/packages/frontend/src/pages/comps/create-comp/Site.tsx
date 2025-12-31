import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import StyledField from '@/components/styles/StyleFieldEditComp';
import { HarkenHr } from '@/components/harken-hr';
import SelectTextField from '@/components/styles/select-input';
import {
  topographyOptions,
  lotshapeOptions,
  frontageOptions,
  utilitiesOptions,
  sizeTypeOptions,
  landTypeOptions,
} from './SelectOption';
import {
  sanitizeInputLandSize,
  handleInputChange,
  sanitizeInputLandSizeAc,
  sanitizeInputLandSizeAcAfterSf,
  sanitizeInputLandSizeAcAfterSF,
  sanitizeInputLandSizeAcToSF,
} from '@/utils/sanitize';
import StarIcon from '@mui/icons-material/Star';
import { useFormikContext } from 'formik';
import React, { ChangeEvent, useEffect } from 'react';
import IncludedUtilities from './IncludedUtilities';
// import { Icons } from '@/components/icons';
import {
  CreateCompsEnum,
  ListingEnum,
  SiteDetailsEnum,
} from '../enum/CompsEnum';
import {
  PropertyResidentialComp,
  ResidentialComponentHeaderEnum,
} from '@/pages/residential/enum/ResidentialEnum';
import TextAreaField from '@/components/styles/textarea';
import { AmenitisResidentialComp } from '@/pages/residential/enum/ResidentialEnum';
import {
  sanitizeFiveHundredChar,
  sanitizeTwoHundredChar,
} from '@/utils/sanitize';

export const Site = ({ passData, setDataRequited }: any) => {
  const [topography, setTopography] = React.useState('');
  const [lotshape, setLotshape] = React.useState('');
  const [utility, setUtility] = React.useState('');
  const [frontage, setFrontage] = React.useState('');
  const [founderOption, setFounderOption] = React.useState<string>('');
  const [frontageOption, setFrontageOption] = React.useState<string>('');
  const [utilitiesOption, setUtilitiesOption] = React.useState<string>('');
  const [lotOption, setLotOption] = React.useState<string>('');
  const [, setLandOptions] = React.useState<string>('');

  const { values, setFieldValue, handleChange, errors } =
    useFormikContext<any>();
  const getValueOrTypeMyOwn = (value: any) => {
    const foundOption = topographyOptions.find(
      (option) => option.value === value
    );
    const founderOption = foundOption
      ? foundOption.value
      : AmenitisResidentialComp.TYPE_MY_OWN;
    setFounderOption(founderOption);
    return foundOption
      ? foundOption.value
      : AmenitisResidentialComp.TYPE_MY_OWN;
  };

  const getValueOrTypeMyOwn_frontage = (value: any) => {
    const foundOption = frontageOptions.find(
      (option) => option.value === value
    );
    const founderOption = foundOption
      ? foundOption.value
      : AmenitisResidentialComp.TYPE_MY_OWN;
    setFrontageOption(founderOption);
    return foundOption
      ? foundOption.value
      : AmenitisResidentialComp.TYPE_MY_OWN;
  };

  const getValueOrTypeMyOwn_utilities = (value: any) => {
    const foundOption = utilitiesOptions.find(
      (option) => option.value === value
    );
    const founderOption = foundOption
      ? foundOption.value
      : AmenitisResidentialComp.TYPE_MY_OWN;
    setUtilitiesOption(founderOption);
    return foundOption
      ? foundOption.value
      : AmenitisResidentialComp.TYPE_MY_OWN;
  };

  const getValueOrTypeMyOwn_lot = (value: any) => {
    const foundOption = lotshapeOptions.find(
      (option) => option.value === value
    );
    const founderOption = foundOption
      ? foundOption.value
      : AmenitisResidentialComp.TYPE_MY_OWN;
    setLotOption(founderOption);
    return foundOption
      ? foundOption.value
      : AmenitisResidentialComp.TYPE_MY_OWN;
  };

  const getValueOrTypeMyOwnLandType = (value: any) => {
    const foundOption = landTypeOptions.find(
      (option) => option.value === value
    );
    const founderOption = foundOption
      ? foundOption.value
      : AmenitisResidentialComp.TYPE_MY_OWN;
    setLandOptions(founderOption);
    return foundOption
      ? foundOption.value
      : AmenitisResidentialComp.TYPE_MY_OWN;
  };

  useEffect(() => {
    if (passData.id) {
      if (passData && passData.land_size) {
        setFieldValue(
          SiteDetailsEnum.LAND_SIZE_SITE,
          passData.land_size.toLocaleString()
        );
      } else {
        setFieldValue(SiteDetailsEnum.LAND_SIZE_SITE, '');
      }
      if (
        passData &&
        passData.land_size &&
        passData.land_dimension === 'ACRE'
      ) {
        const FormatedLandSize = parseFloat(passData.land_size).toLocaleString(
          'en-US',
          { minimumFractionDigits: 3, maximumFractionDigits: 3 }
        );
        setFieldValue(SiteDetailsEnum.LAND_SIZE_SITE, FormatedLandSize);
      }
      setFieldValue(SiteDetailsEnum.LAND_DIMENSION, passData.land_dimension);
      setFieldValue(
        SiteDetailsEnum.OTHER_TOPOGRAPHY,
        passData.other_topography
      );
      setFieldValue(
        SiteDetailsEnum.LOT_SHAPE,
        getValueOrTypeMyOwn_lot(passData.lot_shape)
      );
      setFieldValue(
        SiteDetailsEnum.FRONTAGE_SITE,
        getValueOrTypeMyOwn_frontage(passData.frontage)
      );
      setFieldValue(SiteDetailsEnum.FRONTAGE_CUSTOM, passData.frontage);
      setFieldValue(SiteDetailsEnum.SITE_ACCESS, passData.site_access);
      setFieldValue(
        SiteDetailsEnum.UTILITIES_SELECT,
        getValueOrTypeMyOwn_utilities(passData.utilities_select)
      );
      setFieldValue(SiteDetailsEnum.OTHER_UTILITY, passData.other_utility);
      setFieldValue(SiteDetailsEnum.SITE_COMMENTS, passData.site_comments);
      setFieldValue(SiteDetailsEnum.TOPOGRAPHY_CUSTOM, passData.topography);
      setFieldValue(
        SiteDetailsEnum.TOPOGRAPHY,
        getValueOrTypeMyOwn(passData.topography)
      );
      setFieldValue(
        SiteDetailsEnum.UTILITIES_SELECT_CUSTOM,
        passData.utilities_select
      );
      setFieldValue(SiteDetailsEnum.LOT_SHAPE_CUSTOM, passData.lot_shape);
      setFieldValue(
        SiteDetailsEnum.OTHER_INCLUDED_UTILITIES,
        passData.other_include_utilities
      );
      setFieldValue(
        SiteDetailsEnum.LAND_TYPE,
        getValueOrTypeMyOwnLandType(passData.land_type)
      );
      setFieldValue(SiteDetailsEnum.LAND_TYPE_CUSTOM, passData.land_type);
    }
  }, [passData]);

  const handleTopography = (e: ChangeEvent<HTMLInputElement>) => {
    setTopography(e.target.value);
    setFounderOption('');
    setFieldValue('topography', e.target.value);
    setFieldValue('topography_custom', '');
  };

  const handleLotshape = (e: ChangeEvent<HTMLInputElement>) => {
    setFieldValue('lot_shape', e.target.value);
    setLotOption('');
    setLotshape(e.target.value);
    setFieldValue('lot_shape_custom', '');
  };

  const handleUtilities = (e: ChangeEvent<HTMLInputElement>) => {
    setUtility(e.target.value);
    setUtilitiesOption('');
    setFieldValue('utilities_select', e.target.value);
    setFieldValue('utilities_select_custom', '');
  };

  const handleFrontage = (e: ChangeEvent<HTMLInputElement>) => {
    setFrontage(e.target.value);
    setFrontageOption('');
    setFieldValue('frontage', e.target.value);
    setFieldValue('frontage_custom', '');
  };

  const handleSizeType1 = (e: ChangeEvent<HTMLInputElement>) => {
    setFieldValue('land_type', e.target.value);
    setFieldValue('land_type_custom', '');
    setLandOptions('');
  };

  return (
    <>
      <div>
        <Typography variant="h6" component="h5" className="text-lg font-bold">
          {ResidentialComponentHeaderEnum.SITE}
        </Typography>

        <div className="mt-6">
          <Grid container spacing={3} className="items-end">
            {localStorage.getItem('activeType') === 'land_only' ? (
              <>
                <Grid
                  item
                  xs={
                    values.land_type === AmenitisResidentialComp.TYPE_MY_OWN
                      ? 3
                      : 6
                  }
                  className="relative selectFixedHeight"
                >
                  <SelectTextField
                    onChange={handleSizeType1}
                    name="land_type"
                    label={
                      <span>
                        {CreateCompsEnum.LAND_TYPE}
                        <span className="text-red-500"> *</span>
                      </span>
                    }
                    options={landTypeOptions}
                    value={values.land_type}
                  />
                  {setDataRequited && values?.land_type === '' ? (
                    <div className="text-red-500 text-[11px] pt-1 absolute">
                      This field is required.
                    </div>
                  ) : null}
                  {setDataRequited && errors && values.land_type === '' && (
                    <div className="text-red-500 text-[11px] pt-1 absolute">
                      {errors.land_type as any}
                    </div>
                  )}
                </Grid>
              </>
            ) : localStorage.getItem('activeType') === 'building_with_land' &&
              passData.comp_type === 'land_only' ? (
              <>
                <Grid
                  item
                  xs={
                    values.land_type === AmenitisResidentialComp.TYPE_MY_OWN
                      ? 3
                      : 6
                  }
                  className="relative selectFixedHeight"
                >
                  <SelectTextField
                    onChange={handleSizeType1}
                    name="land_type"
                    label={
                      <span>
                        {CreateCompsEnum.LAND_TYPE}
                        <span className="text-red-500"> *</span>
                      </span>
                    }
                    options={landTypeOptions}
                    value={values.land_type}
                  />
                  {values?.land_type === '' ? (
                    <div className="text-red-500 text-[11px] pt-1 absolute">
                      This field is required.
                    </div>
                  ) : null}
                  {setDataRequited && errors && values.land_type === '' && (
                    <div className="text-red-500 text-[11px] pt-1 absolute">
                      {errors.land_type as any}
                    </div>
                  )}
                </Grid>
              </>
            ) : null}
            {values.land_type === AmenitisResidentialComp.TYPE_MY_OWN &&
            localStorage.getItem('activeType') === 'land_only' ? (
              <Grid item xs={3} className="">
                <StyledField
                  label={
                    <span className="relative">
                      Other Land Type
                      <StarIcon className="absolute text-[6px] text-red-500 right-[-10px]" />
                    </span>
                  }
                  name="land_type_custom"
                />
              </Grid>
            ) : null}
            <Grid
              item
              xs={
                localStorage.getItem('activeType') === 'building_with_land'
                  ? 6
                  : localStorage.getItem('activeType') ===
                        'building_with_land' &&
                      passData.comp_type === 'land_only'
                    ? 3
                    : 3
              }
              className=""
            >
              <StyledField
                label={
                  <span className="relative z-10">
                    {ListingEnum.LAND_SIZE}
                    {localStorage.getItem('activeType') === 'land_only' &&
                    passData.length === 0 ? (
                      <span className="text-red-500 text-xs absolute !bottom-[2px] !right-[-7px]">
                        *
                      </span>
                    ) : localStorage.getItem('activeType') ===
                        'building_with_land' &&
                      passData.comp_type === 'land_only' ? (
                      <span className="text-red-500 text-xs absolute !bottom-[2px] !right-[-7px]">
                        *
                      </span>
                    ) : null}
                  </span>
                }
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  let input;
                  if (values.land_dimension === PropertyResidentialComp.ACRE) {
                    input = sanitizeInputLandSizeAc(e.target.value);
                  } else {
                    input = sanitizeInputLandSize(e.target.value);
                  }
                  handleInputChange(
                    handleChange,
                    PropertyResidentialComp.LAND_SIZE_NAME,
                    input
                  );
                }}
                value={values.land_size}
                name={PropertyResidentialComp.LAND_SIZE_NAME}
              />
              {localStorage.getItem('activeType') === 'land_only' &&
              setDataRequited &&
              values?.land_size == '' ? (
                <div className="text-red-500 text-[11px] pt-1 absolute">
                  This field is required.
                </div>
              ) : null}
            </Grid>
            <Grid
              className="selectFixedHeight"
              item
              xs={
                localStorage.getItem('activeType') === 'building_with_land'
                  ? 6
                  : localStorage.getItem('activeType') ===
                        'building_with_land' &&
                      passData.comp_type === 'land_only'
                    ? 3
                    : 3
              }
            >
              <SelectTextField
                label={
                  <span>
                    {CreateCompsEnum.SIZE_TYPE}{' '}
                    {values.comp_type === 'land_only' ? (
                      <span className="text-red-500"> *</span>
                    ) : null}
                  </span>
                }
                name={PropertyResidentialComp.LAND_DIMENSION_NAME}
                value={values.land_dimension || 'SF'}
                onChange={(e: React.ChangeEvent<{ value: unknown }>) => {
                  const newDimension = e.target.value;
                  setFieldValue(
                    PropertyResidentialComp.LAND_DIMENSION_NAME,
                    newDimension
                  );

                  let input;
                  if (newDimension === PropertyResidentialComp.ACRE) {
                    input = sanitizeInputLandSizeAcAfterSf(values.land_size); // Ensure this properly formats for acres
                  } else if (newDimension === PropertyResidentialComp.SF) {
                    input = sanitizeInputLandSizeAcAfterSF(values.land_size); // Ensure this properly formats for square feet
                  } else {
                    input = sanitizeInputLandSizeAcToSF(values.land_size);
                  }

                  handleInputChange(
                    handleChange,
                    PropertyResidentialComp.LAND_SIZE_NAME,
                    input
                  );
                }}
                options={sizeTypeOptions}
                defaultValue={values.land_dimension}
              />
            </Grid>
          </Grid>
          <Grid container spacing={3} className="mt-4 items-end">
            <Grid
              className="pt-2"
              item
              xs={
                topography === AmenitisResidentialComp.TYPE_MY_OWN ||
                founderOption === AmenitisResidentialComp.TYPE_MY_OWN
                  ? 3
                  : 6
              }
            >
              <SelectTextField
                onChange={handleTopography}
                name="topography"
                label={<span>{CreateCompsEnum.TOPOGRAPHY} </span>}
                value={values.topography}
                options={topographyOptions}
              />
            </Grid>
            {topography === AmenitisResidentialComp.TYPE_MY_OWN ||
            founderOption === AmenitisResidentialComp.TYPE_MY_OWN ? (
              <Grid item xs={3} className="pt-2">
                <StyledField
                  label={
                    <span className="relative -top-1.5 z-10">
                      Other Topography
                    </span>
                  }
                  name="topography_custom"
                />
              </Grid>
            ) : null}
            <Grid
              className="pt-2"
              item
              xs={
                lotshape === AmenitisResidentialComp.TYPE_MY_OWN ||
                lotOption === AmenitisResidentialComp.TYPE_MY_OWN
                  ? 3
                  : 6
              }
            >
              <SelectTextField
                onChange={handleLotshape}
                label={<span>{CreateCompsEnum.LOT_SHAPE}</span>}
                value={values.lot_shape}
                name="lot_shape"
                options={lotshapeOptions}
              />
            </Grid>
            {lotshape === AmenitisResidentialComp.TYPE_MY_OWN ||
            lotOption === AmenitisResidentialComp.TYPE_MY_OWN ? (
              <Grid item xs={3} className="pt-2">
                <StyledField
                  label={
                    <span className="relative -top-1.5 z-10">
                      Other Lot Shape
                    </span>
                  }
                  name="lot_shape_custom"
                />
              </Grid>
            ) : null}
          </Grid>
          <Grid container spacing={3} className="mt-3 items-end">
            <Grid
              item
              xs={
                frontage === AmenitisResidentialComp.TYPE_MY_OWN ||
                frontageOption === AmenitisResidentialComp.TYPE_MY_OWN
                  ? 3
                  : 6
              }
              className="mt-[0px] frontage-wrapper selectFixedHeight pt-2"
            >
              <SelectTextField
                onChange={handleFrontage}
                label={
                  <span className="relative">{CreateCompsEnum.FRONTAGE}</span>
                }
                defaultValue={values.frontage}
                value={values.frontage}
                options={frontageOptions}
              />
            </Grid>
            {frontage === AmenitisResidentialComp.TYPE_MY_OWN ||
            frontageOption === AmenitisResidentialComp.TYPE_MY_OWN ? (
              <Grid item xs={3} className="pt-2">
                <StyledField
                  label="Other Frontage"
                  name="frontage_custom"
                  value={values.frontage_custom}
                />
              </Grid>
            ) : null}

            <Grid item xs={6} className="pt-2">
              <StyledField label="Access" name="site_access" />
            </Grid>
          </Grid>
          <Grid container spacing={3} className="mt-3 items-end">
            <Grid
              className="pt-2 selectFixedHeight"
              item
              xs={
                utility === AmenitisResidentialComp.TYPE_MY_OWN ||
                utilitiesOption === AmenitisResidentialComp.TYPE_MY_OWN
                  ? 3
                  : 6
              }
            >
              <SelectTextField
                onChange={handleUtilities}
                options={utilitiesOptions}
                name="utilities_select"
                label={<span>{CreateCompsEnum.UTILITIES}</span>}
                defaultValue={values.utilities_select}
                value={values.utilities_select}
              />
            </Grid>
            {utility === AmenitisResidentialComp.TYPE_MY_OWN ||
            utilitiesOption === AmenitisResidentialComp.TYPE_MY_OWN ? (
              <Grid item xs={3} className="pt-2">
                <StyledField
                  label={
                    <span className="relative top-[1px]">Other Utilities</span>
                  }
                  name="utilities_select_custom"
                  value={values.utilities_select_custom}
                />
              </Grid>
            ) : null}
            {values.type === 'leases' ? (
              <Grid item xs={6} className="mt-[4px] pt-2">
                <IncludedUtilities passData={passData} />
              </Grid>
            ) : null}
          </Grid>

          <Grid container spacing={2} className="mt-3 items-end">
            <Grid item xs={12} className="">
              {values.type === 'leases' ? (
                <StyledField
                  label="Other Include Utilities"
                  name="other_include_utilities"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const input = sanitizeTwoHundredChar(e.target.value);
                    handleInputChange(
                      handleChange,
                      'other_include_utilities',
                      input
                    );
                  }}
                  value={values.other_include_utilities}
                />
              ) : (
                ''
              )}
            </Grid>
          </Grid>
          <Grid container spacing={3} className="mt-3 items-end">
            <Grid item xs={12} className="pt-2">
              <TextAreaField
                label="Site Comments"
                name="site_comments"
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  const input = sanitizeFiveHundredChar(e.target.value);
                  handleInputChange(handleChange, 'site_comments', input);
                }}
                value={values.site_comments}
              />
            </Grid>
          </Grid>
        </div>
        <HarkenHr />
      </div>
    </>
  );
};
