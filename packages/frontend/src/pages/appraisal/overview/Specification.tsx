import SelectTextField from '@/components/styles/select-input';
import { Grid, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { LandOnlyProperty } from './LandOnlyProperty';
import StyledField from '@/components/styles/StyleFieldEditComp';
import { HarkenHr } from '@/components/harken-hr';
import TextEditor from '@/components/styles/text-editor';
import {
  AppraisalADAOptions,
  AppraisalAnalysisTypeOptions,
  AppraisalBasementTypeOptions,
  AppraisalComparisionBasisOption,
  AppraisalConstructionTypeOptions,
  AppraisalFoundationTypeOptions,
  AppraisalMostLikelyOwnerUserOptions,
  AppraisalParkingTypeOptions,
  AppraisalPropertyClassOptions,
} from './SelectOption';
import {
  conditionOptionsOverView,
  frontageOptions,
  landTypeOptions,
  lotshapeOptions,
  sizeTypeOptions,
  topographyOptions,
  utilitiesOptions,
} from '@/pages/comps/create-comp/SelectOption';
import { toast } from 'react-toastify';
import { useFormikContext } from 'formik';
import { PropertyResidentialComp } from '@/pages/residential/enum/ResidentialEnum';
import {
  handleInputChange,
  sanitizeInputLandSize,
  sanitizeInputLandSizeAc,
  sanitizeInputLandSizeAcAfterSF,
  sanitizeInputLandSizeAppraisal,
  sanitizeInputLandSizeAcToSF,
  sanitizeHundredChar,
  sanitizeTwoHundredChar,
  sanitizeFourtyFiveChar,
} from '@/utils/sanitize';
import { AmenitiesEnum, SpecificationEnum, OverviewEnum } from './OverviewEnum';
// import StyledFieldFt from '@/components/styles/styleFieldFt';
import IncludedUtilities from '@/pages/comps/create-comp/IncludedUtilities';
import { sanitizeInput } from '@/utils/sanitize';
import { useSearchParams } from 'react-router-dom';
import { useGet } from '@/hook/useGet';
export const Specification = ({
  getCompType,
  updateData,
  passRequired,
}: any) => {
  const { values, setFieldValue, handleChange, touched, errors } =
    useFormikContext<any>();
  console.log(errors, 'errorrrs');
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [, setIsDisabled] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [isDisabledComparison, setIsDisabledComparison] = useState(false);
  getCompType(values.comp_type);

  const handleComparisonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (
      responseMessage ===
      'This value cannot be changed after comps have been linked to the appraisal'
    ) {
      toast.error(
        'This value cannot be changed after comps have been linked to the appraisal'
      );
      return; // Prevent value update
    }
    setFieldValue(SpecificationEnum.COMPARISION_BASIS_NAME, e.target.value);
  };

  // const activeToggle = 'rounded-[20px] bg-[#0da1c7] text-white';
  const { data } = useGet<any>({
    queryKey: 'appraisals/check-linked-comps/',
    endPoint: `appraisals/check-linked-comps/${id}`,
    config: {},
  });
  useEffect(() => {
    if (data) {
      setResponseMessage(data?.data?.message);
    }
  }, [data]);

  useEffect(() => {
    if (updateData?.appraisal_approaches) {
      const hasIncome = updateData.appraisal_approaches.some(
        (elem: { type: string }) => elem.type === SpecificationEnum.COST
      );
      setIsDisabled(hasIncome);
    }

    if (updateData?.appraisal_type === OverviewEnum.MULTI_FAMILY) {
      setIsDisabledComparison(true);
    }
  }, [updateData?.appraisal_approaches]);

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

  return (
    <>
      <div>
        <Typography
          variant="h1"
          component="h2"
          className="text-lg font-bold mt-5"
        >
          {SpecificationEnum.SPECIFICATIONS}
        </Typography>
        <Grid container spacing={3} className="mt-2 items-end">
          {localStorage.getItem('activeType') === 'building_with_land' ? (
            <Grid item xs={6} className='pt-2'>
              <SelectTextField
                label={SpecificationEnum.COMPARISION_BASIS}
                name={SpecificationEnum.COMPARISION_BASIS_NAME}
                options={AppraisalComparisionBasisOption}
                onChange={handleComparisonChange}
                disabled={isDisabledComparison}
                value={values.comparison_basis}
              />
            </Grid>
          ) : (
            <Grid item xs={6} className='pt-2'>
              <SelectTextField
                label={SpecificationEnum.ANALYSIS_TYPE}
                name={SpecificationEnum.ANALYSIS_TYPE_NAME}
                value={values.analysis_type}
                onChange={(e: React.ChangeEvent<{ value: unknown }>) => {
                  setFieldValue(
                    SpecificationEnum.ANALYSIS_TYPE_NAME,
                    e.target.value
                  );
                  // handleSizeType(e);
                  let input;
                  if (e.target.value === '$/Acre') {
                    input = sanitizeInputLandSizeAppraisal(
                      values?.land_size === null ? '' : values?.land_size
                    );
                  } else if (e.target.value === '$/SF') {
                    input = sanitizeInputLandSizeAcAfterSF(
                      values?.land_size === null ? '' : values?.land_size
                    );
                  } else {
                    input = '';
                  }
                  handleInputChange(
                    handleChange,
                    SpecificationEnum.LAND_SIZE,
                    input
                  );
                }}
                options={AppraisalAnalysisTypeOptions}
                // defaultValue={values.analysis_type}
              />
            </Grid>
          )}
        </Grid>
        {localStorage.getItem('activeType') === 'building_with_land' ? (
          <LandOnlyProperty passRequired={passRequired} />
        ) : null}
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
                  {/* {errors.land_type && (touched?.land_type as any)} */}
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
                  {localStorage.getItem('activeType') === 'land_only' && (
                    <span className="text-red-500"> *</span>
                  )}
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
                handleInputChange(
                  handleChange,
                  PropertyResidentialComp.LAND_SIZE_NAME,
                  input
                );
              }}
            />
          </Grid>
          <Grid item xs={2.5}>
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
          <Grid className='pt-2'
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
          <Grid className='pt-2'
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
          <Grid className='pt-2'
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
          <Grid item xs={values.frontage === AmenitiesEnum.TYPE_MY_OWN ? 3 : 6} className='pt-2'>
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
          <Grid item xs={3} className="utilities pt--2">
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
        {updateData?.appraisal_type === OverviewEnum.MULTI_FAMILY ? (
          <Grid container spacing={2} className="mt-2 items-end">
            <Grid item xs={6} className='pt-2'>
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
            </Grid>
            <Grid item xs={6} className='pt-2'>
              <IncludedUtilities passData="appraisal" />
            </Grid>
          </Grid>
        ) : null}

        {updateData?.appraisal_type === OverviewEnum.MULTI_FAMILY ? (
          <p></p>
        ) : null}

        <Grid container spacing={3} className="mt-2 items-end">
          <Grid item xs={12} className='pt-2'>
            <label className="text-customGray text-xs">
              {SpecificationEnum.PROPERTY_SUMMARY}
            </label>
            <div className="customTexteditor">
              <TextEditor
                name={SpecificationEnum.SUMMARY} // Formik field name
                editorContent={values.summary} // Initial value from Formik
                editorData={(content: string) =>
                  setFieldValue(SpecificationEnum.SUMMARY, content)
                } // Update Formik when content changes
                style={{
                  width: '100%',
                  background: '#fff',
                  borderBottomWidth: '1px',
                }}
              />
            </div>
          </Grid>
        </Grid>
        <Grid container spacing={3} className="mt-2 items-end">
          <Grid className='pt-2'
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
          <Grid className='pt-2'
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
        {localStorage.getItem('activeType') === 'building_with_land' ? (
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
        ) : null}
        {localStorage.getItem('activeType') === 'building_with_land' ? (
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
        ) : null}
        {localStorage.getItem('activeType') === 'building_with_land' ? (
          <Grid container spacing={3} className="mt-2 items-end">
            <Grid className='pt-2'
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
        ) : null}
        {localStorage.getItem('activeType') === 'building_with_land' ? (
          <Grid container spacing={3} className="mt-2 items-end">
            <Grid className='pt-2'
              item
              xs={values.foundation === AmenitiesEnum.TYPE_MY_OWN ? 3 : 6}
            >
              <SelectTextField
                label={SpecificationEnum.FOUNDATION}
                name={SpecificationEnum.FOUNDATION_NAME}
                options={AppraisalFoundationTypeOptions}
                onChange={(e) =>
                  setFieldValue(
                    SpecificationEnum.FOUNDATION_NAME,
                    e.target.value
                  )
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
            <Grid className='pt-2'
              item
              xs={values.parking === AmenitiesEnum.TYPE_MY_OWN ? 3 : 6}
            >
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
        ) : null}
        {localStorage.getItem('activeType') === 'building_with_land' ? (
          <Grid container spacing={3} className="mt-2 items-end">
            <Grid className='pt-2'
              item
              xs={values.basement === AmenitiesEnum.TYPE_MY_OWN ? 3 : 6}
            >
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
            <Grid className='pt-2'
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
        ) : null}

        <HarkenHr />
      </div>
    </>
  );
};
