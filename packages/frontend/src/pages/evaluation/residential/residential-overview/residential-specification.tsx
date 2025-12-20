import { HarkenHr } from '@/components/harken-hr';
import StyledField from '@/components/styles/StyleFieldEditComp';
import SelectTextField from '@/components/styles/select-input';
import TextEditor from '@/components/styles/text-editor';
import { Grid, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import {
  AmenitisResidentialComp,
  PropertyResidentialComp,
} from '@/pages/residential/enum/ResidentialEnum';
import {
  handleInputChange,
  sanitizeFourtyFiveChar,
  sanitizeHundredChar,
  sanitizeInput,
  sanitizeInputLandSize,
  sanitizeInputLandSizeAc,
  sanitizeInputLandSizeAcAfterSF,
  sanitizeInputLandSizeAcToSF,
  sanitizeInputLandSizeAppraisal,
  sanitizeSfWeightingInputPercentage,
} from '@/utils/sanitize';
import { FieldArray, useFormikContext } from 'formik';
import {
  AmenitiesEnum,
  OverviewEnum,
  SpecificationEnum,
} from '@/pages/appraisal/overview/OverviewEnum';
import { Icons } from '@/components/icons';
import {
  AppraisalADAOptions,
  AppraisalBasementTypeOptions,
  AppraisalConstructionTypeOptions,
  AppraisalFoundationTypeOptions,
  AppraisalMostLikelyOwnerUserOptions,
  AppraisalParkingTypeOptions,
  AppraisalPropertyClassOptions,
} from '@/pages/appraisal/overview/SelectOption';
import {
  AllSubPropertyJson,
  conditionOptionsOverView,
  frontageOptions,
  landTypeOptions,
  lotshapeOptions,
  residentialOptions,
  selectTypeOptions,
  sizeTypeOptions,
  topographyOptions,
  utilitiesOptions,
} from '@/pages/comps/create-comp/SelectOption';
import { PropertyOptions } from '@/pages/residential/create-comp/SelectOption';
export const ResidentialSpecification = ({
  getCompType,
  updateData,
  showValidationSchema,
}: any) => {
  const { values, setFieldValue, handleChange, touched, errors } =
    useFormikContext<any>();
  const [, setIsDisabled] = useState(false);
  const [, setIsDisabledComparison] = useState(false);
  getCompType(values.comp_type);
  useEffect(() => {
    if (updateData?.evaluation_approaches) {
      const hasIncome = updateData.evaluation_approaches.some(
        (elem: { type: string }) => elem.type === SpecificationEnum.COST
      );
      setIsDisabled(hasIncome);
    }

    if (updateData?.evaluation_type === OverviewEnum.MULTI_FAMILY) {
      setIsDisabledComparison(true);
    }
  }, [updateData?.evaluation_approaches]);
  useEffect(() => {
    if (values.analysis_type === '$/Acre' && values.comp_type === 'land_only') {
      setFieldValue(
        PropertyResidentialComp.LAND_DIMENSION_NAME,
        PropertyResidentialComp.ACRE
      );
    } else if (
      values.analysis_type === '$/SF' &&
      values.comp_type === 'land_only'
    ) {
      setFieldValue(
        PropertyResidentialComp.LAND_DIMENSION_NAME,
        PropertyResidentialComp.SF
      );
    }
  }, [values.analysis_type, setFieldValue]);

  const formatNumberWithCommas = (value: string) => {
    const sanitizedValue = value.replace(/[^0-9.]/g, '');
    const parts = sanitizedValue.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };
  console.log('cjhasjjhasd', values.comparison_basis);
  const getValueOrTypeMyOwn = (value: any) => {
    const foundOption = AllSubPropertyJson.find(
      (option) => option.value === value
    );
    return foundOption
      ? foundOption.value
      : AmenitisResidentialComp.TYPE_MY_OWN;
  };
  const handleInput = (e: any) => {
    const { name, value } = e.target;
    setFieldValue(name, value);
  };
  return (
    <>
      <div>
        <Typography
          variant="h1"
          component="h2"
          className="text-lg font-bold mt-6"
        >
          {SpecificationEnum.SPECIFICATIONS}
        </Typography>
        <div
          style={{
            width: '100%',
            border: '1px solid #eee',
            backgroundColor: '#f5f5f5',
            marginTop: '25px',
            paddingBottom: '20px',
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
                            className="pt-2 pb-[0px] pr-[0px] pl-0 relative selectFixedHeight"
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
                            {showValidationSchema && errors && Array.isArray(errors.zonings) && (
                              <div className="text-red-500 text-[11px] absolute">
                                {errors.zonings[i] &&
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
                            className="pt-2 pb-[0px] pl-[24px] pr-[0px] relative selectFixedHeight"
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
                            {showValidationSchema && errors && Array.isArray(errors.zonings) && (
                              <div className="text-red-500 text-[11px] absolute">
                                {errors.zonings[i] &&
                                  typeof errors.zonings[i] === 'object' &&
                                  (errors.zonings[i] as any).sub_zone}
                              </div>
                            )}
                          </Grid>
                          {values.zonings[i].sub_zone ===
                            AmenitisResidentialComp.TYPE_MY_OWN ? (
                            <Grid item xs={2} className="pt-2">
                              <StyledField
                                label={
                                  PropertyResidentialComp.RESIDENTIAL_PROPERTY_TYPE
                                }
                                name={`${PropertyResidentialComp.ZONINGS_NAME}[${i}].${PropertyResidentialComp.SUB_ZONE_CUSTOM}`}
                                style={{
                                  background: '#f5f5f5',
                                  borderBottomWidth: '1px',
                                }}
                                value={values.zonings[i].sub_zone_custom}
                              />
                            </Grid>
                          ) : null}

                          {i ? (
                            <Grid item xs={1.5} lg={0.5} className="gap-1">
                              <div
                                onClick={() => arrayHelpers.remove(i)}
                                style={{ marginTop: '30px' }}
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
                                    weight_sf: '100',
                                    total_sq_ft: '',
                                    id: '', // Keep the id unique
                                  })
                                }
                                style={{
                                  marginTop: '30px',
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
                          className="mt-5 px-10"
                        >
                          <Grid item xs={2.8} className='pl-0'>
                            <StyledField
                              style={{
                                background: '#f5f5f5',
                                borderBottomWidth: '1px',
                              }}
                              name={`${PropertyResidentialComp.ZONINGS_NAME}[${i}].${PropertyResidentialComp.GROSS_LIVING_SQ_FT}`}
                              label={
                                <span className="relative">
                                  {PropertyResidentialComp.GROSS_LIVING_AREA}
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
          <div className="mt-4 ps-[24px]">
            <p className="text-sm text-black font-bold inline">
              <span className="text-customDeeperSkyBlue">Note:</span>{' '}
              <span className="font-bold text-black bold text-xs">
                Weightings are only used for the Sales Comparison Approach when
                the Comparison Basis is SF.
              </span>
            </p>
          </div>
        </div>
        <Grid container spacing={3} className="mt-2 items-end">
          {localStorage.getItem('activeType') === 'land_only' ? (
            <Grid className='pt-2'
              item
              xs={values.land_type === AmenitiesEnum.TYPE_MY_OWN ? 2 : 3}
            >
              <SelectTextField
                label={
                  <span className="text-customGray">
                    {SpecificationEnum.LAND_TYPE}
                    <span className="text-red-500">*</span>
                  </span>
                }
                name={SpecificationEnum.LAND_TYPE_NAME}
                onChange={(e) =>
                  setFieldValue(
                    SpecificationEnum.LAND_TYPE_NAME,
                    e.target.value
                  )
                }
                options={landTypeOptions}
                value={values.land_type}
              />
              {errors && errors.land_type && touched?.land_type && (
                <div className="text-red-500 pt-1  text-[11px] absolute">
                  {errors.land_type as any}
                </div>
              )}
            </Grid>
          ) : null}

          {localStorage.getItem('activeType') === 'land_only' &&
            values.land_type === AmenitiesEnum.TYPE_MY_OWN ? (
            <Grid className='pt-2'
              item
              xs={values.land_type === AmenitiesEnum.TYPE_MY_OWN ? 2 : 0}
            >
              <StyledField
                label={SpecificationEnum.OTHER_LAND_TYPE}
                name={SpecificationEnum.LAND_TYPE_CUSTOM}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const input = sanitizeHundredChar(e.target.value);
                  handleInputChange(handleChange, 'land_type_custom', input);
                }}
                value={values.land_type_custom}
              />
            </Grid>
          ) : null}

          <Grid item xs={2.5} className='pt-2'>
            <StyledField
              label={
                <span className="text-customGray">
                  {SpecificationEnum.LOT_SIZE}
                  <span className="text-red-500"> *</span>
                </span>
              }
              name={SpecificationEnum.LAND_SIZE}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                let input;
                if (
                  values.analysis_type === '$/Acre' ||
                  values.land_dimension === 'ACRE'
                ) {
                  input = sanitizeInputLandSizeAc(e.target.value);
                  input = formatNumberWithCommas(input);
                } else {
                  input = sanitizeInputLandSize(e.target.value);
                }

                // ✅ Store value in localStorage
                localStorage.setItem('landSizeInput', input);

                handleInputChange(
                  handleChange,
                  PropertyResidentialComp.LAND_SIZE_NAME,
                  input
                );
              }}
            />
          </Grid>
          <Grid item xs={2.5} className='pt-2'>
            <SelectTextField
              label={
                <span className="relative text-customGray">
                  {SpecificationEnum.SIZE_TYPE}
                  {localStorage.getItem('activeType') === 'land_only' ? (
                    <span className="text-red-500 text-[16px]">*</span>
                  ) : null}
                </span>
              }
              name={SpecificationEnum.LAND_DIMENSION}
              value={values.land_dimension}
              onChange={(e: React.ChangeEvent<{ value: unknown }>) => {
                setFieldValue(
                  PropertyResidentialComp.LAND_DIMENSION_NAME,
                  e.target.value
                );
                let input;
                if (e.target.value === PropertyResidentialComp.ACRE) {
                  input = sanitizeInputLandSizeAppraisal(
                    values?.land_size === null ? '' : values?.land_size
                  );
                } else if (e.target.value === PropertyResidentialComp.SF) {
                  input = sanitizeInputLandSizeAcAfterSF(
                    values?.land_size === null ? '' : values?.land_size
                  );
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
              disabled={values.comp_type === 'land_only'}
              style={{ marginTop: '4px' }}
            />
            {errors && (
              <div className="tex-red-500 text-sm">
                {errors.land_dimension as any}
              </div>
            )}
          </Grid>
          <Grid className='pt-2'
            item
            xs={
              localStorage.getItem('activeType') === 'building_with_land'
                ? 7
                : 2.5
            }
          >
            <StyledField
              label={SpecificationEnum.HIGHEST_AND_BEST_USE}
              name={SpecificationEnum.HIGH_AND_BEST_USER}
            />
          </Grid>
        </Grid>
        <Grid container spacing={3} className="mt-2 items-end">
          <Grid className='pt-2 selectFixedHeight'
            item
            xs={
              values.most_likely_owner_user === AmenitiesEnum.TYPE_MY_OWN
                ? 3
                : 6
            }
          >
            <SelectTextField
              label={SpecificationEnum.MOST_LIKELY_OWNER_USER}
              name={SpecificationEnum.MOST_LIKELY_OWNER_USER_NAME}
              options={AppraisalMostLikelyOwnerUserOptions}
              onChange={(e) =>
                setFieldValue(
                  SpecificationEnum.MOST_LIKELY_OWNER_USER_NAME,
                  e.target.value
                )
              }
              value={values.most_likely_owner_user}
            />
          </Grid>
          {values.most_likely_owner_user === AmenitiesEnum.TYPE_MY_OWN ? (
            <Grid item xs={3} className="type-my-own pt-2">
              <StyledField
                label={SpecificationEnum.OTHER_MOST_LIKELY_OWNER_USER}
                name={SpecificationEnum.MOST_LIKELY_OWNER_USER_CUSTOM}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const input = sanitizeHundredChar(e.target.value);
                  handleInputChange(
                    handleChange,
                    'most_likely_owner_user_custom',
                    input
                  );
                }}
                value={values.most_likely_owner_user_custom}
              />
            </Grid>
          ) : null}
          <Grid className='pt-2 selectFixedHeight'
            item
            xs={values.topography === AmenitiesEnum.TYPE_MY_OWN ? 3 : 6}
          >
            <SelectTextField
              label={SpecificationEnum.TOPOGRAPHY}
              name={SpecificationEnum.TOPOGRAPHY_NAME}
              options={topographyOptions}
              onChange={(e) =>
                setFieldValue(SpecificationEnum.TOPOGRAPHY_NAME, e.target.value)
              }
              value={values.topography}
            />
          </Grid>
          {values.topography === AmenitiesEnum.TYPE_MY_OWN ? (
            <Grid item xs={3} className="topography pt-2">
              <StyledField
                label={SpecificationEnum.OTHER_TOPOGRAPHY}
                name={SpecificationEnum.TOPOGRAPHY_CUSTOM}
              />
            </Grid>
          ) : null}
        </Grid>
        <Grid container spacing={3} className="mt-2 items-end">
          <Grid className='pt-2 selectFixedHeight'
            item
            xs={values.lot_shape === AmenitiesEnum.TYPE_MY_OWN ? 3 : 6}
          >
            <SelectTextField
              label={SpecificationEnum.LOT_SHAPE}
              name={SpecificationEnum.LOT_SHAPE_NAME}
              options={lotshapeOptions}
              onChange={(e) =>
                setFieldValue(SpecificationEnum.LOT_SHAPE_NAME, e.target.value)
              }
              value={values.lot_shape}
            />
          </Grid>
          {values.lot_shape === AmenitiesEnum.TYPE_MY_OWN ? (
            <Grid item xs={3} className="type-my-own pt-2">
              <StyledField
                label={SpecificationEnum.OTHER_LOT_SHAPE}
                name={SpecificationEnum.LOT_SHAPE_CUSTOM}
              />
            </Grid>
          ) : null}
          <Grid item xs={values.frontage === AmenitiesEnum.TYPE_MY_OWN ? 3 : 6} className='pt-2 selectFixedHeight'>
            <SelectTextField
              label={SpecificationEnum.FRONTAGE}
              name={SpecificationEnum.FRONTAGE_NAME}
              options={frontageOptions}
              onChange={(e) =>
                setFieldValue(SpecificationEnum.FRONTAGE_NAME, e.target.value)
              }
              value={values.frontage}
            />
          </Grid>
          {values.frontage === AmenitiesEnum.TYPE_MY_OWN ? (
            <Grid item xs={3} className="fontage pt-2">
              <StyledField
                label={SpecificationEnum.OTHER_FRONTAGE}
                name={SpecificationEnum.FRONTAGE_CUSTOM}
              />
            </Grid>
          ) : null}
        </Grid>

        <Grid container spacing={3} className="mt-2 items-end">
          <Grid item xs={3} className="relative pt-2">
            <StyledField
              label={SpecificationEnum.LOT_FRONTAGE}
              name={SpecificationEnum.FRONT_FEET}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const input = sanitizeInputLandSize(e.target.value);
                handleInputChange(
                  handleChange,
                  SpecificationEnum.FRONT_FEET,
                  input
                );
              }}
              value={values.front_feet}
            />
            <p className="absolute bottom-0 right-0 text-customGray">ft.</p>
          </Grid>
          <Grid item xs={3} className="relative pt-2">
            <StyledField
              label={SpecificationEnum.LOT_DEPTH}
              name={SpecificationEnum.LOT_DEPTH_NAME}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const input = sanitizeInputLandSize(e.target.value);
                handleInputChange(
                  handleChange,
                  SpecificationEnum.LOT_DEPTH_NAME,
                  input
                );
              }}
              value={values.lot_depth}
            />
            <p className="absolute bottom-0 right-0 text-customGray">ft.</p>
          </Grid>
          <Grid item xs={3} className="utilities pt-2 selectFixedHeight">
            <SelectTextField
              label={SpecificationEnum.UTILITIES}
              name={SpecificationEnum.UTILITIES_SELECT}
              options={utilitiesOptions}
              onChange={(e) =>
                setFieldValue(
                  SpecificationEnum.UTILITIES_SELECT,
                  e.target.value
                )
              }
              value={values.utilities_select}
            />
          </Grid>
          {values.utilities_select === AmenitiesEnum.TYPE_MY_OWN ? (
            <Grid item xs={3} className='pt-2'>
              <StyledField
                label={SpecificationEnum.OTHER_UTILITIES}
                name={SpecificationEnum.UTILITIES_SELECT_CUSTOM}
              />
            </Grid>
          ) : null}
        </Grid>
        {updateData?.evaluation_type === OverviewEnum.MULTI_FAMILY ? (
          <p></p>
        ) : null}

        <Grid container spacing={3} className="mt-2 items-end">
          <Grid item xs={12} className='pt-2'>
            <label className="text-customGray text-xs">
              {SpecificationEnum.PROPERTY_SUMMARY}
            </label>
            <div className="customTexteditor">
              <TextEditor
                name={SpecificationEnum.SUMMARY}
                editorContent={values.summary}
                editorData={(content: string) =>
                  setFieldValue(SpecificationEnum.SUMMARY, content)
                }
                style={{
                  width: '100%',
                  background: '#fff',
                  borderBottomWidth: '1px',
                }}
              />
            </div>
          </Grid>
        </Grid>
        <Grid container spacing={3} className="mt-3 items-end">
          <Grid className='pt-2 selectFixedHeight'
            item
            xs={values.condition === AmenitiesEnum.TYPE_MY_OWN ? 3 : 6}
          >
            <SelectTextField
              label={SpecificationEnum.PROPERTY_CONDITION}
              name={SpecificationEnum.CONDITION}
              options={conditionOptionsOverView}
              onChange={(e) =>
                setFieldValue(SpecificationEnum.CONDITION, e.target.value)
              }
              value={values.condition}
            />
          </Grid>
          {values.condition === AmenitiesEnum.TYPE_MY_OWN ? (
            <Grid item xs={3} className="other-condition-type pt-2">
              <StyledField
                label={SpecificationEnum.OTHER_CONDITION_TYPE}
                name={SpecificationEnum.CONDITION_CUSTOM}
              />
            </Grid>
          ) : null}
          <Grid className='pt-2 selectFixedHeight'
            item
            xs={values.property_class === AmenitiesEnum.TYPE_MY_OWN ? 3 : 6}
          >
            <SelectTextField
              label={SpecificationEnum.PROPERTY_CLASS}
              name={SpecificationEnum.PROPERTY_CLASS_NAME}
              options={AppraisalPropertyClassOptions}
              onChange={(e) =>
                setFieldValue(
                  SpecificationEnum.PROPERTY_CLASS_NAME,
                  e.target.value
                )
              }
              value={values.property_class}
            />
          </Grid>
          {values.property_class === AmenitiesEnum.TYPE_MY_OWN ? (
            <Grid item xs={3} className="other-property-class pt-2">
              <StyledField
                label={SpecificationEnum.OTHER_PROPERTY_CLASS_TYPE}
                name={SpecificationEnum.PROPERTY_CLASS_CUSTOM}
              />
            </Grid>
          ) : null}
        </Grid>
        <Grid container spacing={3} className="mt-2 items-end">
          <Grid item xs={6} className='pt-2'>
            <StyledField
              label={SpecificationEnum.YEAR_BUILD}
              name={SpecificationEnum.YEAR_BUILT}
              value={values?.year_built}
              onChange={(e) =>
                setFieldValue(SpecificationEnum.YEAR_BUILT, e.target.value)
              }
            />
          </Grid>
          <Grid item xs={6} className='pt-2'>
            <StyledField
              label={SpecificationEnum.BASE_YEAR_REMODELED}
              name={SpecificationEnum.YEAR_REMODELED}
              value={values.year_remodeled}
            />
          </Grid>
        </Grid>
        <Grid container spacing={3} className="mt-2 items-end">
          <Grid item xs={6} className='pt-2'>
            <StyledField
              label={SpecificationEnum.STORIES}
              name={SpecificationEnum.NO_STORIES}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const input = sanitizeInputLandSize(e.target.value);
                handleInputChange(
                  handleChange,
                  SpecificationEnum.NO_STORIES,
                  input
                );
              }}
              value={values.no_stories}
            />
          </Grid>
          <Grid item xs={6} className="relative pt-2">
            <StyledField
              label={SpecificationEnum.CEILING_HEIGHT}
              name={SpecificationEnum.HEIGHT}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const input = sanitizeInput(e.target.value);
                handleInputChange(handleChange, 'height', input);
              }}
              value={values.height}
            />
            <p className="absolute bottom-0 right-0 text-customGray">ft.</p>
          </Grid>
        </Grid>
        <Grid container spacing={3} className="mt-2 items-end">
          <Grid className='pt-2 selectFixedHeight'
            item
            xs={
              values.main_structure_base === AmenitiesEnum.TYPE_MY_OWN ? 3 : 6
            }
          >
            <SelectTextField
              label={SpecificationEnum.STRUCTURE_CONSTRUCTION_TYPE}
              name={SpecificationEnum.MAIN_STRUCTURE_BASE}
              options={AppraisalConstructionTypeOptions}
              onChange={(e) =>
                setFieldValue(
                  SpecificationEnum.MAIN_STRUCTURE_BASE,
                  e.target.value
                )
              }
              value={values.main_structure_base}
            />
          </Grid>
          {values.main_structure_base === AmenitiesEnum.TYPE_MY_OWN ? (
            <Grid item xs={3} className="other-construction-type pt-2">
              <StyledField
                label={SpecificationEnum.OTHER_STRUCTURE_CONSTRUCTION_TYPE}
                name={SpecificationEnum.MAIN_STRUCTURE_BASE_CUSTOM}
              />
            </Grid>
          ) : null}
        </Grid>
        <Grid container spacing={3} className="mt-2 items-end">
          <Grid className='pt-2 selectFixedHeight'
            item
            xs={values.foundation === AmenitiesEnum.TYPE_MY_OWN ? 3 : 6}
          >
            <SelectTextField
              label={SpecificationEnum.FOUNDATION}
              name={SpecificationEnum.FOUNDATION_NAME}
              options={AppraisalFoundationTypeOptions}
              onChange={(e) =>
                setFieldValue(SpecificationEnum.FOUNDATION_NAME, e.target.value)
              }
              value={values.foundation}
            />
          </Grid>
          {values.foundation === AmenitiesEnum.TYPE_MY_OWN ? (
            <Grid item xs={3} className="other-foundation pt-2">
              <StyledField
                label={SpecificationEnum.OTHER_FOUNDATION}
                name={SpecificationEnum.FOUNDATION_CUSTOM}
              />
            </Grid>
          ) : null}
          <Grid item xs={values.parking === AmenitiesEnum.TYPE_MY_OWN ? 3 : 6} className='pt-2 selectFixedHeight'>
            <SelectTextField
              label={SpecificationEnum.PARKING}
              name={SpecificationEnum.PARKING_NAME}
              options={AppraisalParkingTypeOptions}
              onChange={(e) =>
                setFieldValue(SpecificationEnum.PARKING_NAME, e.target.value)
              }
              value={values.parking}
            />
          </Grid>
          {values.parking === AmenitiesEnum.TYPE_MY_OWN ? (
            <Grid item xs={3} className="other-parking pt-2">
              <StyledField
                label={SpecificationEnum.OTHER_PARKING}
                name={SpecificationEnum.PARKING_CUSTOM}
              />
            </Grid>
          ) : null}
        </Grid>
        <Grid container spacing={3} className="mt-2 items-end">
          <Grid item xs={values.basement === AmenitiesEnum.TYPE_MY_OWN ? 3 : 6} className='pt-2 selectFixedHeight'>
            <SelectTextField
              label={SpecificationEnum.BASEMENT}
              name={SpecificationEnum.BASEMENT_NAME}
              options={AppraisalBasementTypeOptions}
              onChange={(e) =>
                setFieldValue(SpecificationEnum.BASEMENT_NAME, e.target.value)
              }
              value={values.basement}
            />
          </Grid>
          {values.basement === AmenitiesEnum.TYPE_MY_OWN ? (
            <Grid item xs={3} className="other-basement pt-2">
              <StyledField
                label={SpecificationEnum.OTHER_BASEMENT}
                name={SpecificationEnum.BASEMENT_CUSTOM}
              />
            </Grid>
          ) : null}
          <Grid className='pt-2 selectFixedHeight'
            item
            xs={values.ada_compliance === AmenitiesEnum.TYPE_MY_OWN ? 3 : 6}
          >
            <SelectTextField
              label={SpecificationEnum.ADA_COMPLIANCE}
              name={SpecificationEnum.ADA_COMPLIANCE_NAME}
              options={AppraisalADAOptions}
              onChange={(e) =>
                setFieldValue(
                  SpecificationEnum.ADA_COMPLIANCE_NAME,
                  e.target.value
                )
              }
              value={values.ada_compliance}
            />
          </Grid>
          {values.ada_compliance === AmenitiesEnum.TYPE_MY_OWN ? (
            <Grid item xs={3} className="other-ada-compliance pt-2">
              <StyledField
                label={SpecificationEnum.OTHER_ADA_COMPLIANCE}
                name={SpecificationEnum.ADA_COMPLIANCE_CUSTOM}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const input = sanitizeFourtyFiveChar(e.target.value);
                  handleInputChange(
                    handleChange,
                    'ada_compliance_custom',
                    input
                  );
                }}
                value={values.ada_compliance_custom}
              />
            </Grid>
          ) : null}
        </Grid>

        <HarkenHr />
      </div>
    </>
  );
};
