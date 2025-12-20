import React, { useEffect } from 'react';
import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import StyledField from '@/components/styles/StyleFieldEditComp';
import { HarkenHr } from '@/components/harken-hr';
import { useFormikContext, FieldArray } from 'formik';
import {
  handleInputChange,
  sanitizeInputLandSizeAc,
  sanitizeInputLandSize,
  sanitizeInput,
  sanitizeInputLandSizeAcAfterSf,
  sanitizeInputLandSizeAcAfterSF,
  sanitizeInputLandSizeAcToSF,
  sanitizeSfWeightingInputPercentage,
} from '@/utils/sanitize';
import SelectTextField from '@/components/styles/select-input';
import { Icons } from '@/components/icons';
import {
  AllSubPropertyJson,
  conditionOptions,
  frontageOptions,
  lotshapeOptions,
  selectTypeOptions,
  sizeTypeOptions,
  utilitiesOptions,
} from '@/pages/comps/create-comp/SelectOption';
import { topographyOptions } from '@/pages/comps/create-comp/SelectOption';
import { BasementOptions, PropertyOptions } from './SelectOption';
import { residentialOptions } from '@/pages/comps/create-comp/SelectOption';
import {
  ResidentialComponentHeaderEnum,
  PropertyResidentialComp,
  AmenitisResidentialComp,
} from '../enum/ResidentialEnum';
import { ResidentialCreateComp } from '@/components/interface/residential-create-comp';
import {
  getValueOrTypeMyOwnTopoGraphy,
  getValueOrTypeMyOwnLotShape,
  getValueOrTypeMyOwnFrontage,
  getValueOrTypeMyOwnCondition,
  getValueOrTypeMyOwnBasement,
  getValueOrTypeMyUtiliesSelect,
} from '@/utils/type-my-own';

import TextAreaField from '@/components/styles/textarea';
// import { ClassNames } from '@emotion/react';
// import useGlobalCodeOptions from '@/pages/evaluation/globalCodes/global-codes-option';

export const Property = ({ setDataRequited, updateData }: any) => {
  // const { AllSubPropertyJson } = useGlobalCodeOptions();

  const { handleChange, values, setFieldValue, errors } =
    useFormikContext<ResidentialCreateComp>();
  const handleInput = (e: any) => {
    const { name, value } = e.target;
    setFieldValue(name, value);
  };

  const getValueOrTypeMyOwn = (value: any) => {
    const foundOption = AllSubPropertyJson.find(
      (option) => option.value === value
    );
    return foundOption
      ? foundOption.value
      : AmenitisResidentialComp.TYPE_MY_OWN;
  };

  useEffect(() => {
    if (updateData?.id) {
      setFieldValue(PropertyResidentialComp.SUMMARY_NAME, updateData.summary);
      if (updateData && updateData.land_size) {
        if (updateData.land_size) {
          setFieldValue(
            PropertyResidentialComp.LAND_SIZE_NAME,
            updateData.land_size.toLocaleString()
          );
        } else {
          setFieldValue(PropertyResidentialComp.LAND_SIZE_NAME, '');
        }
      } else {
        setFieldValue(PropertyResidentialComp.LAND_SIZE_NAME, '');
      }
      if (
        updateData &&
        updateData.land_size &&
        updateData.land_dimension === PropertyResidentialComp.ACRE
      ) {
        const FormatedLandSize = parseFloat(
          updateData.land_size
        ).toLocaleString('en-US', {
          minimumFractionDigits: 3,
          maximumFractionDigits: 3,
        });
        setFieldValue(PropertyResidentialComp.LAND_SIZE_NAME, FormatedLandSize);
      }

      setFieldValue(
        PropertyResidentialComp.LAND_DIMENSION_NAME,
        updateData.land_dimension
      );

      setFieldValue(
        PropertyResidentialComp.TOPOGRAPHY_NAME,
        getValueOrTypeMyOwnTopoGraphy(updateData.topography)
      );
      setFieldValue(
        PropertyResidentialComp.TOPOGRAPHY_CUSTOM,
        updateData.topography
      );

      setFieldValue(
        PropertyResidentialComp.LOT_SHAPE_NAME,
        getValueOrTypeMyOwnLotShape(updateData.lot_shape)
      );
      setFieldValue(
        PropertyResidentialComp.LOT_SHAPE_CUSTOM,
        updateData.lot_shape
      );

      setFieldValue(
        PropertyResidentialComp.FRONTAGE_NAME,
        getValueOrTypeMyOwnFrontage(updateData.frontage)
      );
      setFieldValue(
        PropertyResidentialComp.FRONTAGE_CUSTOM,
        updateData.frontage
      );

      setFieldValue(
        PropertyResidentialComp.CONDITION_NAME,
        getValueOrTypeMyOwnCondition(updateData.condition)
      );
      setFieldValue(
        PropertyResidentialComp.CONDITION_CUSTOM,
        updateData.condition
      );

      setFieldValue(PropertyResidentialComp.YEAR_BUILT, updateData.year_built);
      setFieldValue(
        PropertyResidentialComp.YEAR_REMODELED,
        updateData.year_remodeled
      );

      setFieldValue(
        PropertyResidentialComp.BASEMENT_NAME,
        getValueOrTypeMyOwnBasement(updateData.basement)
      );
      setFieldValue(
        PropertyResidentialComp.BASEMENT_CUSTOM,
        updateData.basement
      );

      setFieldValue(
        PropertyResidentialComp.UTILITIES_SELECT_NAME,
        getValueOrTypeMyUtiliesSelect(updateData.utilities_select)
      );
      setFieldValue(
        PropertyResidentialComp.UTILITIES_SELECT_CUSTOM,
        updateData.utilities_select
      );

      setFieldValue(
        PropertyResidentialComp.ZONING_TYPE,
        updateData.zoning_type
      );
      const zonings =
        updateData.res_zonings &&
        updateData.res_zonings.map((ele: any) => {
          return {
            id: ele.id,
            basement_finished_sq_ft: (
              ele.basement_finished_sq_ft ?? 0
            ).toLocaleString(),
            basement_unfinished_sq_ft: ele.basement_unfinished_sq_ft
              ? ele.basement_unfinished_sq_ft.toLocaleString()
              : '',
            gross_living_sq_ft: ele?.gross_living_sq_ft
              ? ele.gross_living_sq_ft.toLocaleString()
              : '',
            sub_zone: getValueOrTypeMyOwn(ele.sub_zone),
            zone: ele.zone,
            total_sq_ft: ele.total_sq_ft,
            weight_sf: ele.weight_sf?.toLocaleString(),
            sub_zone_custom: ele.sub_zone,
          };
        });
      setFieldValue(PropertyResidentialComp.ZONINGS_NAME, zonings);
    }
  }, [updateData?.id]);
  return (
    <>
      <div id="propertyDiv">
        <Typography variant="h6" component="h5" className="text-lg font-bold">
          {ResidentialComponentHeaderEnum.PROPERTY}
        </Typography>
        <div className="mt-[6px]">
          <Grid className="mt-[10px]" container spacing={3}>
            <Grid item xs={12} className="relative pt-2">
              <TextAreaField
                label={PropertyResidentialComp.PROPERTY_SUMMARY}
                name={PropertyResidentialComp.SUMMARY_NAME}
              />
            </Grid>
          </Grid>
          <div
            style={{
              width: '100%',
              border: '1px solid #eee',
              backgroundColor: '#f5f5f5',
              marginTop: '20px',
              paddingBottom: '30px',
            }}
          >
            <FieldArray
              name={PropertyResidentialComp.ZONINGS_NAME}
              render={(arrayHelpers) => (
                <>
                  {values.zonings && values.zonings.length > 0
                    ? values.zonings.map((zone: any, i: number) => {
                        return (
                          <>
                            <Grid
                              container
                              spacing={2}
                              columns={16}
                              className="mt-[10px] px-10 w-full items-end"
                              key={zone[i]}
                            >
                              <Grid
                                item
                                xs={6}
                                key={zone.zone}
                                className="pt-4 pb-[0px] pr-[0px] relative"
                              >
                                <SelectTextField
                                  value={values.zonings[i].zone}
                                  options={PropertyOptions}
                                  onChange={(v) => {
                                    handleInput({
                                      target: {
                                        name: `${PropertyResidentialComp.ZONINGS_NAME}.${i}.${PropertyResidentialComp.ZONE}`,
                                        value: v.target.value,
                                      },
                                    });
                                  }}
                                  name={`${PropertyResidentialComp.ZONINGS_NAME}.${i}.${PropertyResidentialComp.ZONE}`}
                                  label={
                                    <span className="relative text-customGray">
                                      {PropertyResidentialComp.PROPERTY_TYPE}
                                      <span className="text-red-500 text-base">
                                        *
                                      </span>
                                    </span>
                                  }
                                />
                                {setDataRequited && errors && (
                                  <div className="text-red-500 text-[11px] absolute">
                                    {errors.zonings &&
                                      errors.zonings[i] &&
                                      typeof errors.zonings[i] === 'object' &&
                                      (errors.zonings[i] as any).zone}
                                  </div>
                                )}
                              </Grid>

                              <Grid
                                item
                                xs={
                                  values.zonings[i].sub_zone ===
                                  AmenitisResidentialComp.TYPE_MY_OWN
                                    ? 4
                                    : 6
                                }
                                className="pt-4 pb-[0px] pl-[24px] pr-[0px] relative"
                              >
                                <SelectTextField
                                  value={getValueOrTypeMyOwn(
                                    values.zonings[i].sub_zone
                                  )}
                                  options={
                                    zone.zone ===
                                    PropertyResidentialComp.RESIDENTIAL
                                      ? residentialOptions
                                      : selectTypeOptions
                                  }
                                  onChange={(v) => {
                                    setFieldValue(
                                      `${PropertyResidentialComp.ZONINGS_NAME}[${i}].${PropertyResidentialComp.SUB_ZONE_CUSTOM}`,
                                      ''
                                    );
                                    handleInput({
                                      target: {
                                        name: `${PropertyResidentialComp.ZONINGS_NAME}[${i}].${PropertyResidentialComp.SUB_ZONE}`,
                                        value: v.target.value,
                                      },
                                    });
                                  }}
                                  name={`${PropertyResidentialComp.ZONINGS_NAME}[${i}].${PropertyResidentialComp.SUB_ZONE}`}
                                  label={
                                    <span className="relative text-customGray">
                                      {PropertyResidentialComp.SUB_PROPERTY}
                                      <span className="text-red-500 text-base">
                                        {' '}
                                        *
                                      </span>
                                    </span>
                                  }
                                />
                                {setDataRequited && errors && (
                                  <div className="text-red-500 text-[11px] absolute">
                                    {errors.zonings &&
                                      errors.zonings[i] &&
                                      typeof errors.zonings[i] === 'object' &&
                                      (errors.zonings[i] as any).sub_zone}
                                  </div>
                                )}
                              </Grid>
                              {values.zonings[i].sub_zone ===
                              AmenitisResidentialComp.TYPE_MY_OWN ? (
                                <Grid item xs={3} className="pt-4">
                                  <StyledField
                                    label={
                                      PropertyResidentialComp.OTHER_SUB_ZONE
                                    }
                                    name={`${PropertyResidentialComp.ZONINGS_NAME}[${i}].${PropertyResidentialComp.SUB_ZONE_CUSTOM}`}
                                    style={{
                                      background: '#f5f5f5',
                                      borderBottomWidth: '1px',
                                      marginTop: '6px',
                                    }}
                                    value={values.zonings[i].sub_zone_custom}
                                  />
                                </Grid>
                              ) : null}

                              {i ? (
                                <Grid item xs={1.5} lg={0.5} className="gap-1">
                                  <div
                                    onClick={() => arrayHelpers.remove(i)}
                                    style={{ marginTop: '24px' }}
                                  >
                                    <Icons.RemoveCircleOutlineIcon className="text-red-500 cursor-pointer" />
                                  </div>
                                </Grid>
                              ) : (
                                <Grid item xs={1} />
                              )}
                              {i === values.zonings.length - 1 && (
                                <Grid item xs={1.5} lg={0.5}>
                                  <div
                                    onClick={() =>
                                      arrayHelpers.push({
                                        zone: '',
                                        sub_zone: '',
                                        gross_living_sq_ft: '',
                                        basement_finished_sq_ft: '',
                                        basement_unfinished_sq_ft: '',
                                        weight_sf: '',
                                        total_sq_ft: '',
                                        id: values.zonings.length, // Keep the id unique
                                      })
                                    }
                                    style={{
                                      marginTop: '24px',
                                    }}
                                  >
                                    <Icons.AddCircleOutlineIcon className="cursor-pointer text-customDeeperSkyBlue" />
                                  </div>
                                </Grid>
                              )}
                            </Grid>
                            <Grid
                              container
                              spacing={2}
                              className="mt-[30px] px-10"
                            >
                              <Grid item xs={2.8}>
                                <StyledField
                                  style={{
                                    background: '#f5f5f5',
                                    borderBottomWidth: '1px',
                                  }}
                                  name={`${PropertyResidentialComp.ZONINGS_NAME}[${i}].${PropertyResidentialComp.GROSS_LIVING_SQ_FT}`}
                                  label={
                                    <span className="relative">
                                      {
                                        PropertyResidentialComp.GROSS_LIVING_AREA
                                      }
                                      <Icons.StarIcon className="absolute text-[6px] text-red-500 right-[-10px]" />
                                    </span>
                                  }
                                  onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                  ) => {
                                    const input = sanitizeInput(e.target.value);

                                    handleInputChange(
                                      handleChange,
                                      `${PropertyResidentialComp.ZONINGS_NAME}.${i}.${PropertyResidentialComp.GROSS_LIVING_SQ_FT}`,
                                      input
                                    );
                                  }}
                                  value={values.zonings[i].gross_living_sq_ft}
                                />
                              </Grid>
                              <Grid item xs={2.8}>
                                <StyledField
                                  style={{
                                    background: '#f5f5f5',
                                    borderBottomWidth: '1px',
                                  }}
                                  name={`${PropertyResidentialComp.ZONINGS_NAME}[${i}].${PropertyResidentialComp.BASEMENT_FINISHED_SQ_FT}`}
                                  label={
                                    <span className="relative">
                                      {
                                        PropertyResidentialComp.BASEMENT_FININISHED
                                      }
                                      <Icons.StarIcon className="absolute text-[6px] text-red-500 right-[-10px]" />
                                    </span>
                                  }
                                  onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                  ) => {
                                    const input = sanitizeInput(e.target.value);
                                    handleInputChange(
                                      handleChange,
                                      `${PropertyResidentialComp.ZONINGS_NAME}.${i}.${PropertyResidentialComp.BASEMENT_FINISHED_SQ_FT}`,
                                      input
                                    );
                                  }}
                                  value={
                                    values.zonings[i].basement_finished_sq_ft
                                  }
                                />
                              </Grid>
                              <Grid item xs={2.8}>
                                <StyledField
                                  style={{
                                    background: '#f5f5f5',
                                    borderBottomWidth: '1px',
                                  }}
                                  name={`${PropertyResidentialComp.ZONINGS_NAME}[${i}].${PropertyResidentialComp.BASEMENT_UNFINISHED_SQ_FT}`}
                                  label={
                                    <span className="relative">
                                      {
                                        PropertyResidentialComp.BASEMENT_UNFINISHED
                                      }
                                      <Icons.StarIcon className="absolute text-[6px] text-red-500 right-[-10px]" />
                                    </span>
                                  }
                                  onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                  ) => {
                                    const input = sanitizeInput(e.target.value);

                                    handleInputChange(
                                      handleChange,
                                      `${PropertyResidentialComp.ZONINGS_NAME}.${i}.${PropertyResidentialComp.BASEMENT_UNFINISHED_SQ_FT}`,
                                      input
                                    );
                                  }}
                                  value={
                                    values.zonings[i].basement_unfinished_sq_ft
                                  }
                                />
                              </Grid>
                              <Grid item xs={2.8}>
                                <StyledField
                                  style={{
                                    background: '#f5f5f5',
                                    borderBottomWidth: '1px',
                                  }}
                                  name={`${PropertyResidentialComp.ZONINGS_NAME}[${i}].${PropertyResidentialComp.WEIGHT_SF}`}
                                  label={
                                    <span className="relative">
                                      {PropertyResidentialComp.SF_WEIGHTING}
                                      <Icons.StarIcon className="absolute text-[6px] text-red-500 right-[-10px]" />
                                    </span>
                                  }
                                  onKeyDown={(e: React.KeyboardEvent) => {
                                    const isBack =
                                      e.code ===
                                      PropertyResidentialComp.BACKSPACE;
                                    if (isBack) {
                                      const input =
                                        values.zonings[i].weight_sf.toString();
                                      const inpArr = Array.from(input);
                                      inpArr.pop();
                                      handleInputChange(
                                        handleChange,
                                        `${PropertyResidentialComp.ZONINGS_NAME}.${i}.${PropertyResidentialComp.WEIGHT_SF}`,
                                        inpArr.join('')
                                      );
                                    }
                                  }}
                                  onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                  ) => {
                                    const input = e.target.value;
                                    handleInputChange(
                                      handleChange,
                                      `${PropertyResidentialComp.ZONINGS_NAME}.${i}.${PropertyResidentialComp.WEIGHT_SF}`,
                                      input.replace(/%/g, '')
                                    );
                                  }}
                                  value={sanitizeSfWeightingInputPercentage(
                                    values.zonings[i].weight_sf
                                  )}
                                />
                              </Grid>
                            </Grid>
                          </>
                        );
                      })
                    : null}
                </>
              )}
            />
          </div>

          <Grid container spacing={3} className="mt-[10px] items-end">
            <Grid item xs={6} className="relative pt-4">
              <StyledField
                label={PropertyResidentialComp.LAND_SIZE}
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
            </Grid>
            <Grid item xs={6} className="relative pt-4 selectFixedHeight">
              <SelectTextField
                label={
                  <span className="text-customGray relative">
                    {PropertyResidentialComp.SIZE_TYPE}
                  </span>
                }
                name={PropertyResidentialComp.LAND_DIMENSION_NAME}
                value={values.land_dimension}
                onChange={(e: React.ChangeEvent<{ value: unknown }>) => {
                  setFieldValue(
                    PropertyResidentialComp.LAND_DIMENSION_NAME,
                    e.target.value
                  );
                  let input;
                  if (e.target.value === PropertyResidentialComp.ACRE) {
                    input = sanitizeInputLandSizeAcAfterSf(values.land_size);
                  } else if (e.target.value === PropertyResidentialComp.SF) {
                    input = sanitizeInputLandSizeAcAfterSF(values.land_size);
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
          <Grid container spacing={3} className="mt-[10px] items-end">
            <Grid
              className="relative pt-4"
              item
              xs={
                values.topography === AmenitisResidentialComp.TYPE_MY_OWN
                  ? 3
                  : 6
              }
            >
              <SelectTextField
                label={
                  <span className="text-customGray">
                    {PropertyResidentialComp.TOPOGRAPHY}
                  </span>
                }
                name={PropertyResidentialComp.TOPOGRAPHY_NAME}
                options={topographyOptions}
                onChange={(e) => {
                  setFieldValue(
                    PropertyResidentialComp.TOPOGRAPHY_NAME,
                    e.target.value
                  );
                  setFieldValue(PropertyResidentialComp.TOPOGRAPHY_CUSTOM, '');
                }}
                value={values.topography}
              />
            </Grid>
            {values.topography === AmenitisResidentialComp.TYPE_MY_OWN ? (
              <Grid item xs={3} className="relative pt-4">
                <StyledField
                  label={
                    <span className="relative top-[-6px]">
                      {PropertyResidentialComp.OTHER_TOPOGRAPHY}
                    </span>
                  }
                  name={PropertyResidentialComp.TOPOGRAPHY_CUSTOM}
                />
              </Grid>
            ) : null}
            <Grid
              className="relative pt-4"
              item
              xs={
                values.lot_shape === AmenitisResidentialComp.TYPE_MY_OWN ? 3 : 6
              }
            >
              <SelectTextField
                label={
                  <span className="text-customGray">
                    {PropertyResidentialComp.LOT_SHAPE}
                  </span>
                }
                name={PropertyResidentialComp.LOT_SHAPE_NAME}
                options={lotshapeOptions}
                onChange={(e) => {
                  setFieldValue(
                    PropertyResidentialComp.LOT_SHAPE_NAME,
                    e.target.value
                  );
                  setFieldValue(PropertyResidentialComp.LOT_SHAPE_CUSTOM, '');
                }}
                value={values.lot_shape}
              />
            </Grid>
            {values.lot_shape === AmenitisResidentialComp.TYPE_MY_OWN ? (
              <Grid item xs={3} className="relative pt-4">
                <StyledField
                  label={
                    <span className="relative top-[-6px]">
                      {PropertyResidentialComp.OTHER_LOT_SHAPE}
                    </span>
                  }
                  name={PropertyResidentialComp.LOT_SHAPE_CUSTOM}
                />
              </Grid>
            ) : null}
          </Grid>
          <Grid container spacing={3} className="mt-[10px] items-end">
            <Grid
              className="relative pt-4"
              item
              xs={
                values.frontage === AmenitisResidentialComp.TYPE_MY_OWN ? 3 : 6
              }
            >
              <SelectTextField
                label={
                  <span className="text-customGray">
                    {PropertyResidentialComp.FRONTAGE}
                  </span>
                }
                name={PropertyResidentialComp.FRONTAGE_NAME}
                options={frontageOptions}
                onChange={(e) => {
                  setFieldValue(
                    PropertyResidentialComp.FRONTAGE_NAME,
                    e.target.value
                  );
                  setFieldValue(PropertyResidentialComp.FRONTAGE_CUSTOM, '');
                }}
                value={values.frontage}
              />
            </Grid>
            {values.frontage === AmenitisResidentialComp.TYPE_MY_OWN ? (
              <Grid item xs={3} className="relative pt-4">
                <StyledField
                  label={
                    <span className="relative top-[-6px]">
                      {PropertyResidentialComp.OTHER_FRONTAGE}
                    </span>
                  }
                  name={PropertyResidentialComp.FRONTAGE_CUSTOM}
                />
              </Grid>
            ) : null}
            <Grid
              item
              xs={
                values.condition === AmenitisResidentialComp.TYPE_MY_OWN ? 3 : 6
              }
              className="relative pt-4"
            >
              <SelectTextField
                label={
                  <span className="text-customGray">
                    {PropertyResidentialComp.CONDITION}
                    <span className="text-red-500"> *</span>
                  </span>
                }
                name={PropertyResidentialComp.CONDITION_NAME}
                options={conditionOptions}
                onChange={(e) => {
                  setFieldValue(
                    PropertyResidentialComp.CONDITION_NAME,
                    e.target.value
                  );
                  setFieldValue(PropertyResidentialComp.CONDITION_CUSTOM, '');
                }}
                value={values.condition}
              />
              {setDataRequited && errors && !values.condition && (
                <div className="text-red-500 text-[11px] absolute">
                  {errors?.condition as any}
                </div>
              )}
            </Grid>
            {values.condition === AmenitisResidentialComp.TYPE_MY_OWN ? (
              <Grid item xs={3} className="relative pt-4">
                <StyledField
                  label={
                    <span className="relative top-[-6px]">
                      {PropertyResidentialComp.OTHER_CONDITION}
                    </span>
                  }
                  name={PropertyResidentialComp.CONDITION_CUSTOM}
                />
              </Grid>
            ) : null}
          </Grid>
          <Grid container spacing={3} className="mt-[10px] items-end">
            <Grid item xs={6} className="relative pt-4">
              <StyledField
                label={PropertyResidentialComp.BUILT_YEAR}
                name={PropertyResidentialComp.YEAR_BUILT}
              />
            </Grid>
            <Grid item xs={6} className="relative pt-4">
              <StyledField
                label={PropertyResidentialComp.REMODELED_YEAR}
                name={PropertyResidentialComp.YEAR_REMODELED}
              />
            </Grid>
          </Grid>
          <Grid container spacing={3} className="mt-[10px] items-end">
            <Grid
              className="relative pt-4"
              item
              xs={
                values.basement === AmenitisResidentialComp.TYPE_MY_OWN ? 3 : 6
              }
            >
              <SelectTextField
                label={
                  <span className="text-customGray">
                    {PropertyResidentialComp.BASEMENT}
                  </span>
                }
                name={PropertyResidentialComp.BASEMENT_NAME}
                options={BasementOptions}
                onChange={(e) => {
                  setFieldValue(
                    PropertyResidentialComp.BASEMENT_NAME,
                    e.target.value
                  );
                  setFieldValue(PropertyResidentialComp.BASEMENT_CUSTOM, '');
                }}
                value={values.basement}
              />
            </Grid>
            {values.basement === AmenitisResidentialComp.TYPE_MY_OWN ? (
              <Grid item xs={3} className="relative pt-4">
                <StyledField
                  label={
                    <span className="relative top-[-6px]">
                      {PropertyResidentialComp.OTHER_BASEMENT}
                    </span>
                  }
                  name={PropertyResidentialComp.BASEMENT_CUSTOM}
                />
              </Grid>
            ) : null}
            <Grid
              className="relative pt-4"
              item
              xs={
                values.utilities_select === AmenitisResidentialComp.TYPE_MY_OWN
                  ? 3
                  : 6
              }
            >
              <SelectTextField
                label={
                  <span className="text-customGray">
                    {PropertyResidentialComp.UTILITIES}
                  </span>
                }
                name={PropertyResidentialComp.UTILITIES_SELECT_NAME}
                options={utilitiesOptions}
                onChange={(e) => {
                  setFieldValue(
                    PropertyResidentialComp.UTILITIES_SELECT_NAME,
                    e.target.value
                  );
                  setFieldValue(
                    PropertyResidentialComp.UTILITIES_SELECT_CUSTOM,
                    ''
                  );
                }}
                value={values.utilities_select}
              />
            </Grid>
            {values.utilities_select === AmenitisResidentialComp.TYPE_MY_OWN ? (
              <Grid item xs={3} className="relative pt-4">
                <StyledField
                  label={
                    <span className="relative top-[-6px]">
                      {PropertyResidentialComp.OTHER_UTILITIES}
                    </span>
                  }
                  name={PropertyResidentialComp.UTILITIES_SELECT_CUSTOM}
                />
              </Grid>
            ) : null}
          </Grid>
          <Grid container spacing={2} className="mt-[10px] items-end">
            <Grid item xs={12} className="relative pt-4">
              <StyledField
                name={PropertyResidentialComp.ZONING_TYPE}
                label={PropertyResidentialComp.ZONING_TYPE_LABEL}
                maxLength={30}
              />
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
