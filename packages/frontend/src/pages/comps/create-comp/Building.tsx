import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import StyledField from '@/components/styles/StyleFieldEditComp';
import { HarkenHr } from '@/components/harken-hr';
// import ToggleButton from '@mui/material/ToggleButton';
// import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import React, { useEffect, useState } from 'react';
// import { Tooltip } from '@mui/material'; // Import Tooltip component
import { LandOnly } from './LandOnly';
import SelectTextField from '@/components/styles/select-input';
import { Icons } from '@/components/icons';
import { handleInputChange, sanitizeInput } from '@/utils/sanitize';
import StarIcon from '@mui/icons-material/Star';
import { FieldArray, useFormikContext } from 'formik';
import {
  conditionComps,
  parkingOption,
  propertyOptions,
  officeOptions,
  retailOptions,
  industrialOptions,
  multifamilyOptions,
  hospitalityOptions,
  specialOptions,
  residentialOptions,
  selectTypeOptions,
  AllSubPropertyJson,
} from './SelectOption';
import { CreateCompType } from '@/components/interface/create-comp-type';
import { MultiFamily } from './MultiFamily';
import TextAreaField from '@/components/styles/textarea';
import { ResidentialComponentHeaderEnum } from '@/pages/residential/enum/ResidentialEnum';
import {
  CreateCompsEnum,
  ListingEnum,
  BuildingDetailsEnum,
  // MenuOptionsEnum,
} from '../enum/CompsEnum';
import { AmenitisResidentialComp } from '@/pages/residential/enum/ResidentialEnum';
import InputField from '@/components/styles/InputFieldEditComps';
// import useGlobalCodeOptions from '@/pages/evaluation/globalCodes/global-codes-option';

export const Building = ({ getCompType, passData, setDataRequited }: any) => {
  // const { AllSubPropertyJson } = useGlobalCodeOptions();

  console.log(passData, 'passdataffdf');
  const [, setTypeMyOwn] = useState<string>('');
  const { handleChange, values, errors, setFieldValue } =
    useFormikContext<CreateCompType>();
  console.log(errors, 'errors2345');
  const [, setFounderOption] = useState<string>('');
  const [conditionOption, setConditionOption] = useState<string>('');
  const [parkingOptions, setParkingOption] = useState<string>('');

  getCompType(values.comp_type);

  const getValueOrTypeMyOwn = (value: any) => {
    const foundOption = AllSubPropertyJson.find(
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

  const getValueOrTypeMyOwn_condition = (value: any) => {
    const foundOption = conditionComps.find((option) => option.value === value);
    const founderOption = foundOption
      ? foundOption.value
      : AmenitisResidentialComp.TYPE_MY_OWN;
    setConditionOption(founderOption);
    return foundOption
      ? foundOption.value
      : AmenitisResidentialComp.TYPE_MY_OWN;
  };
  const getValueOrTypeMyOwn_parking = (value: any) => {
    if (value === '') {
      setParkingOption('');
      return '';
    } else {
      const foundOption = parkingOption.find(
        (option) => option.value === value
      );
      const founderOption = foundOption
        ? foundOption.value
        : AmenitisResidentialComp.TYPE_MY_OWN;
      setParkingOption(founderOption);
      return foundOption
        ? foundOption.value
        : AmenitisResidentialComp.TYPE_MY_OWN;
    }
  };
  useEffect(() => {
    if (passData.id) {
      if (passData && passData.gross_building_area) {
        if (passData.land_size || passData.land_size === 0) {
          setFieldValue(
            BuildingDetailsEnum.GROSS_BUILDING_AREA,
            passData.gross_building_area.toLocaleString()
          );
        } else {
          setFieldValue(BuildingDetailsEnum.GROSS_BUILDING_AREA, '');
        }
      } else {
        setFieldValue(BuildingDetailsEnum.GROSS_BUILDING_AREA, '');
      }

      if (passData && passData.net_building_area) {
        if (passData.land_size || passData.land_size === 0) {
          setFieldValue(
            BuildingDetailsEnum.NET_BUILDING_AREA,
            passData.net_building_area.toLocaleString()
          );
        } else {
          setFieldValue(BuildingDetailsEnum.NET_BUILDING_AREA, '');
        }
      } else {
        setFieldValue(BuildingDetailsEnum.NET_BUILDING_AREA, '');
      }
      setFieldValue(BuildingDetailsEnum.YEAR_BUILT, passData.year_built);
      setFieldValue(
        BuildingDetailsEnum.YEAR_REMODELED,
        passData.year_remodeled
      );
      setFieldValue(
        BuildingDetailsEnum.CONSTRUCTION_CLASS,
        passData.construction_class
      );
      setFieldValue(BuildingDetailsEnum.STORIES, passData.stories);

      setFieldValue(BuildingDetailsEnum.EFFECTIVE_AGE, passData.effective_age);
      setFieldValue(
        BuildingDetailsEnum.BUILDING_COMMENTS,
        passData.building_comments
      );
      setFieldValue(
        BuildingDetailsEnum.CONDITION,
        getValueOrTypeMyOwn_condition(passData.condition)
      );
      setFieldValue(BuildingDetailsEnum.CONDITION_CUSTOM, passData.condition);
      setFieldValue(
        BuildingDetailsEnum.PARKING,
        getValueOrTypeMyOwn_parking(passData.parking)
      );
      setFieldValue(
        BuildingDetailsEnum.COMPARISON_BASIS,
        passData.comparison_basis
      );
      setFieldValue(BuildingDetailsEnum.PARKING_CUSTOM, passData.parking);
      setFieldValue(ListingEnum.COMP_TYPE, passData.comp_type);

      const propertyValues = AllSubPropertyJson.map((option) => option.value);
      const zonings =
        passData.zonings &&
        passData.zonings.map((ele: any) => {
          return {
            id: ele.id,
            sq_ft: ele.sq_ft?.toLocaleString(),
            sub_zone: getValueOrTypeMyOwn(ele.sub_zone),
            weight_sf: ele.weight_sf,
            unit: ele.unit?.toLocaleString(),
            zone: ele.zone,
            bed: ele.bed?.toLocaleString(),
            sub_zone_custom: propertyValues.includes(ele.sub_zone)
              ? ''
              : ele.sub_zone,
          };
        });
      setFieldValue('zonings', zonings);
    }
  }, [passData]);

  const handleInput = (e: any) => {
    const { name, value } = e.target;
    setFieldValue(name, value);
  };
  const options = [
    { value: 'SF', label: 'SF' },
    { value: 'Unit', label: 'Unit' },
    { value: 'Bed', label: 'Bed' },
  ];

  const getOptionsByZone = (zone: any) => {
    switch (zone) {
      case BuildingDetailsEnum.MULTIFAMILY:
        return multifamilyOptions;
      case BuildingDetailsEnum.RESIDENTIAL:
        return residentialOptions;
      case BuildingDetailsEnum.HOSPITALITY:
        return hospitalityOptions;
      case BuildingDetailsEnum.OFFICE:
        return officeOptions;
      case BuildingDetailsEnum.RETAIL:
        return retailOptions;
      case BuildingDetailsEnum.INDUSTRIAL:
        return industrialOptions;
      case BuildingDetailsEnum.SPECIAL:
        return specialOptions;
      default:
        return selectTypeOptions;
    }
  };

  const passComparisonBasisUnit = (v: any) => {
    if (
      values.comparison_basis === 'Unit' &&
      v.target.value === AmenitisResidentialComp.TYPE_MY_OWN
    ) {
      const property_units_zone = {
        beds: 0,
        baths: 0,
        sq_ft: 0,
        unit_count: 0,
        avg_monthly_rent: '',
      };
      setFieldValue('property_units', [
        ...values.property_units,
        property_units_zone,
      ]);
    }
  };

  useEffect(() => {
    if (values?.comparison_basis && values?.zonings && !passData.id) {
      const isUnit =
        values?.comparison_basis === 'Unit' &&
        values?.zonings?.some(
          (ele) => ele?.zone === BuildingDetailsEnum.MULTIFAMILY
        );
      if (isUnit) {
        const propertyUnits = {
          avg_monthly_rent: '',
          baths: '',
          beds: '',
          comp_id: '',
          created: '',
          evaluation_id: '',
          id: '',
          sq_ft: '',
          unit_count: '',
        };
        setFieldValue('property_units', [propertyUnits]);
      }
    }
  }, [values?.comparison_basis, values?.zonings]);
  // const truncateLength = 20;
  return (
    <>
      <div>
        <Typography
          variant="h6"
          component="h5"
          className="text-lg font-bold"
          sx={{ fontFamily: '"Montserrat", serif' }}
        >
          {ResidentialComponentHeaderEnum.BUILDING_DETAILS}
        </Typography>
        <div className="mt-1">
          <Grid container spacing={2} className="mt-3 items-end">
            {localStorage.getItem('activeType') === 'building_with_land' ? (
              <>
                <Grid item xs={6}>
                  <SelectTextField
                    options={options}
                    value={values.comparison_basis}
                    onChange={(v) =>
                      handleInput({
                        target: {
                          name: 'comparison_basis',
                          value: v.target.value,
                        },
                      })
                    }
                    name="comparison_basis"
                    label={
                      <span className="font-normal text-customGray">
                        {CreateCompsEnum.COMPARISON_BASIS}
                      </span>
                    }
                  ></SelectTextField>
                </Grid>
              </>
            ) : localStorage.getItem('activeType') === 'building_with_land' &&
              passData.comp_type === 'buiilding_with_land' ? (
              <>
                <Grid item xs={6}>
                  <SelectTextField
                    options={options}
                    value={values.comparison_basis}
                    onChange={(v) =>
                      handleInput({
                        target: {
                          name: 'comparison_basis',
                          value: v.target.value,
                        },
                      })
                    }
                    name="comparison_basis"
                    label={
                      <span className="font-normal text-customGray">
                        {CreateCompsEnum.COMPARISON_BASIS}
                      </span>
                    }
                  ></SelectTextField>
                </Grid>
              </>
            ) : (
              <Grid item xs={6} />
            )}
            <Grid
              item
              xs={6}
              sx={{ justifyContent: 'flex-end', display: 'flex' }}
            ></Grid>
          </Grid>

          {localStorage.getItem('activeType') === 'building_with_land' &&
          passData.length === 0 ? (
            <div>
              <div
                style={{
                  width: '100%',
                  border: '1px solid #eee',
                  backgroundColor: '#f5f5f5',
                  marginTop: '25px',
                  paddingBottom: '25px',
                }}
              >
                <Grid
                  container
                  columns={16}
                  className="mt-[10px] flex ml-0 gap-4 w-full"
                >
                  <FieldArray
                    name="zonings"
                    render={(arrayHelpers) => (
                      <>
                        <div className="flex flex-col pl-6 w-[calc(100%-60px)]">
                          {values.zonings && values.zonings.length > 0
                            ? values.zonings.map((zone: any, i: number) => {
                                return (
                                  <div className="flex xl:gap-6 gap-4 w-full items-end">
                                    <Grid
                                      item
                                      key={zone.zone}
                                      className="pt-[36px] pb-[0px] pr-[0px] relative flex-1 xl:max-w-full max-w-[120px] selectFixedHeight"
                                    >
                                      <SelectTextField
                                        value={values.zonings[i].zone}
                                        options={propertyOptions}
                                        onChange={(v) => {
                                          passComparisonBasisUnit(v);
                                          handleInput({
                                            target: {
                                              name: `zonings.${i}.zone`,
                                              value: v.target.value,
                                            },
                                          });
                                          handleInput({
                                            target: {
                                              name: `zonings.${i}.sub_zone`,
                                              value: '',
                                            },
                                          });
                                        }}
                                        name={`zonings.${i}.zone`}
                                        label={
                                          <span className="relative text-customGray">
                                            {CreateCompsEnum.PROPERTY_TYPE}{' '}
                                            <span className="text-red-500 text-base">
                                              *
                                            </span>
                                          </span>
                                        }
                                      />
                                      {setDataRequited &&
                                        values?.type === 'leases' &&
                                        values.zonings[i].zone === '' && (
                                          <div className="text-red-500 text-[11px] absolute">
                                            This field is required.
                                          </div>
                                        )}
                                      {setDataRequited &&
                                        values?.type === 'sales' &&
                                        values.zonings[i].zone === '' && (
                                          <div className="text-red-500 text-[11px] absolute">
                                            This field is required.
                                          </div>
                                        )}
                                      {/* {setDataRequited && errors && (
 <div className="text-red-500 text-sm absolute">
 {errors.zonings &&
 errors.zonings[i] &&
 typeof errors.zonings[i] ===
 'object' &&
 (errors.zonings[i] as any).zone}
 </div>
 )} */}
                                    </Grid>
                                    <Grid
                                      item
                                      className="pt-[36px] pb-[0px] pr-[0px] relative flex-1 xl:max-w-full max-w-[120px] selectFixedHeight"
                                    >
                                      {/* <Tooltip
 title={
 values.zonings[i].sub_zone.length >
 truncateLength
 ? values.zonings[i].sub_zone
 : ''
 }
 arrow
 > */}
                                      <div>
                                        <SelectTextField
                                          value={values.zonings[i].sub_zone}
                                          options={getOptionsByZone(zone.zone)}
                                          onChange={(v) => {
                                            setTypeMyOwn(v.target.value);
                                            handleInput({
                                              target: {
                                                name: `zonings[${i}].sub_zone`,
                                                value: v.target.value,
                                              },
                                            });
                                          }}
                                          name={`zonings[${i}].sub_zone`}
                                          label={
                                            <span className="relative text-customGray">
                                              {CreateCompsEnum.SUB_PROPERTY}
                                              <span className="text-red-500 text-base">
                                                *
                                              </span>
                                            </span>
                                          }
                                        />
                                      </div>
                                      {/* </Tooltip> */}
                                      {setDataRequited &&
                                        values?.type === 'leases' &&
                                        values.zonings[i].sub_zone === '' && (
                                          <div className="text-red-500 text-[11px] absolute">
                                            This field is required.
                                          </div>
                                        )}
                                      {setDataRequited &&
                                        values?.type === 'sales' &&
                                        values.zonings[i].sub_zone === '' && (
                                          <div className="text-red-500 text-[11px] absolute">
                                            This field is required.
                                          </div>
                                        )}
                                      {/* {setDataRequited && errors && (
 <div className="text-red-500 text-sm absolute">
 {errors.zonings &&
 errors.zonings[i] &&
 typeof errors.zonings[i] ===
 'object' &&
 (errors.zonings[i] as any).sub_zone}
 </div>
 )} */}
                                    </Grid>
                                    {zone?.sub_zone ===
                                    AmenitisResidentialComp.TYPE_MY_OWN ? (
                                      <Grid
                                        item
                                        className="pt-[36px] flex-1 "
                                        key={`zonings.${i}.sub_zone_custom`}
                                      >
                                        <StyledField
                                          label={
                                            <span className="relative">
                                              Other Sub Property Type
                                              <Icons.StarIcon className="absolute text-[6px] text-red-500 right-[-7px] top-[2.5px]" />
                                            </span>
                                          }
                                          name={`zonings.${i}.sub_zone_custom`}
                                          style={{
                                            background: '#f5f5f5',
                                            borderBottomWidth: '1px',
                                          }}
                                          type="text"
                                        />
                                      </Grid>
                                    ) : null}

                                    <Grid
                                      item
                                      className="pt-[36px] pb-[0px] pr-[0px] flex-1"
                                    >
                                      <InputField
                                        label={
                                          <span className="relative top-0.5">
                                            {CreateCompsEnum.SQ_FT}
                                            <span className="text-red-500 text-xs ">
                                              *
                                            </span>
                                          </span>
                                        }
                                        name={`zonings.${i}.sq_ft`}
                                        style={{
                                          background: '#f5f5f5',
                                          borderBottomWidth: '1px',
                                        }}
                                        onChange={(
                                          e: React.ChangeEvent<HTMLInputElement>
                                        ) => {
                                          const input = sanitizeInput(
                                            e.target.value
                                          );
                                          handleInputChange(
                                            handleChange,
                                            `zonings.${i}.sq_ft`,
                                            input
                                          );
                                        }}
                                        value={values.zonings[i].sq_ft}
                                        type="text"
                                      />
                                      {setDataRequited &&
                                        values?.type === 'leases' &&
                                        values.zonings[i].sq_ft === '' && (
                                          <div className="text-red-500 text-[11px] absolute">
                                            This field is required.
                                          </div>
                                        )}
                                      {setDataRequited &&
                                        values?.type === 'sales' &&
                                        values.zonings[i].sq_ft === '' && (
                                          <div className="text-red-500 text-[11px] absolute">
                                            This field is required.
                                          </div>
                                        )}
                                    </Grid>

                                    {values.comparison_basis === 'Unit' ? (
                                      <>
                                        <Grid
                                          item
                                          key={zone.zone}
                                          className="pt-[36px] pb-[0px] pr-[0px] flex-1"
                                        >
                                          <StyledField
                                            label={
                                              <span className="relative top-0.5">
                                                # of Units
                                              </span>
                                            }
                                            name={`zonings.${i}.unit`}
                                            style={{
                                              background: '#f5f5f5',
                                              borderBottomWidth: '1px',
                                            }}
                                            onChange={(
                                              e: React.ChangeEvent<HTMLInputElement>
                                            ) => {
                                              const input = sanitizeInput(
                                                e.target.value
                                              );
                                              handleInputChange(
                                                handleChange,
                                                `zonings.${i}.unit`,
                                                input
                                              );
                                            }}
                                            value={values.zonings[i].unit}
                                          />
                                          {/* {setDataRequited &&
                                          values.comparison_basis ===
                                          "Unit" &&
                                          values.zonings[i].unit === "" && (
                                            <div className="text-red-500 text-[11px] absolute">
                                              This field is required
                                            </div>
                                          )} */}
                                        </Grid>
                                      </>
                                    ) : values.comparison_basis === 'Bed' ? (
                                      <>
                                        <Grid
                                          item
                                          key={`zonings.${i}.bed`}
                                          className="pt-[36px] pb-[0px] pr-[0px] flex-1"
                                        >
                                          <StyledField
                                            label="# of Beds"
                                            name={`zonings.${i}.bed`}
                                            style={{ background: '#f5f5f5' }}
                                            onChange={(
                                              e: React.ChangeEvent<HTMLInputElement>
                                            ) => {
                                              const input = sanitizeInput(
                                                e.target.value
                                              );
                                              handleInputChange(
                                                handleChange,
                                                `zonings.${i}.bed`,
                                                input
                                              );
                                            }}
                                            value={values.zonings[i].bed}
                                          />
                                          {/* {setDataRequited &&
                                          values.comparison_basis === "Bed" &&
                                          values.zonings[i].bed === "" && (
                                            <div className="text-red-500 text-[11px] absolute">
                                              This field is required
                                            </div>
                                          )} */}
                                        </Grid>
                                      </>
                                    ) : null}
                                    {i ? (
                                      <Grid item className=" flex items-end">
                                        <div style={{ marginTop: '24px' }}>
                                          <Icons.RemoveCircleOutlineIcon
                                            onClick={() =>
                                              arrayHelpers.remove(i)
                                            }
                                            className="text-red-500 cursor-pointer"
                                          />
                                        </div>
                                      </Grid>
                                    ) : (
                                      <Grid item className="min-w-6" />
                                    )}
                                  </div>
                                );
                              })
                            : null}
                        </div>
                        <Grid className="flex items-end">
                          <div style={{ marginTop: '24px' }}>
                            <Icons.AddCircleOutlineIcon
                              onClick={() =>
                                arrayHelpers.insert(values.zonings.length, {
                                  zone: '',
                                  sub_zone: '',
                                  sq_ft: '',
                                  bed: '',
                                  unit: '',
                                  sub_zone_custom: '',
                                })
                              }
                              className="cursor-pointer text-customDeeperSkyBlue"
                            />
                          </div>
                        </Grid>
                      </>
                    )}
                  />
                </Grid>
              </div>

              {values?.comparison_basis === 'Unit' &&
                values?.zonings?.some(
                  (ele) => ele?.zone === BuildingDetailsEnum.MULTIFAMILY
                ) && <MultiFamily passData={passData} />}

              <Grid container spacing={3} className="mt-3 items-end">
                <Grid item xs={6} xl={3} className="pt-2">
                  <StyledField label="Built Year" name="year_built" />
                </Grid>
                <Grid item xs={6} xl={3} className="pt-2">
                  <StyledField label="Remodeled Year" name="year_remodeled" />
                </Grid>
                <Grid item xs={6} xl={3} className="pt-2">
                  <StyledField
                    label="Construction Class"
                    name="construction_class"
                  />
                </Grid>
                <Grid item xs={6} xl={3} className="pt-2">
                  <StyledField label="Stories" name="stories" />
                </Grid>
              </Grid>
              <Grid container spacing={3} className="mt-3 items-end">
                <Grid item xs={4} className="pt-2">
                  <StyledField
                    label="Gross Area"
                    name="gross_building_area"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const input = sanitizeInput(e.target.value);
                      handleInputChange(
                        handleChange,
                        'gross_building_area',
                        input
                      );
                    }}
                    value={values.gross_building_area}
                  />
                </Grid>
                <Grid item xs={4} className="pt-2">
                  <StyledField
                    label="Net Area"
                    name="net_building_area"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const input = sanitizeInput(e.target.value);
                      handleInputChange(
                        handleChange,
                        'net_building_area',
                        input
                      );
                    }}
                    value={values.net_building_area}
                  />
                </Grid>
                <Grid item xs={4} className="pt-2">
                  <StyledField label="Effective Age" name="effective_age" />
                </Grid>
              </Grid>
              <Grid container spacing={2} className="mt-3 items-end">
                <Grid item xs={12}>
                  <TextAreaField
                    label="Building Comments"
                    name="building_comments"
                    style={{ padding: '0px' }}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2} className="mt-3 items-end">
                {values.type === 'sales' ? (
                  <>
                    <Grid
                      item
                      xs={
                        values.condition === AmenitisResidentialComp.TYPE_MY_OWN
                          ? 3
                          : 6
                      }
                      className="relative selectFixedHeight"
                    >
                      <SelectTextField
                        value={values.condition}
                        onChange={(v: any) => {
                          const selectedValue = v.target.value;

                          // Reset condition_custom if the selected option is "Type My Own"
                          if (selectedValue === 'Type My Own') {
                            handleInput({
                              target: {
                                name: 'condition_custom',
                                value: '',
                              },
                            });
                          }

                          setConditionOption('');
                          handleInput({
                            target: {
                              name: 'condition',
                              value: selectedValue,
                            },
                          });
                        }}
                        options={conditionComps}
                        name="condition"
                        label={
                          <span>
                            {CreateCompsEnum.CONDITION}
                            <span className="text-red-500 text-base"> *</span>
                          </span>
                        }
                      />
                      {setDataRequited && errors && !values?.condition && (
                        <div className="text-red-500 text-[11px] pt-1 absolute">
                          This field is Required
                        </div>
                      )}
                    </Grid>
                    {values.condition === AmenitisResidentialComp.TYPE_MY_OWN ||
                    conditionOption === AmenitisResidentialComp.TYPE_MY_OWN ? (
                      <Grid item xs={3}>
                        <StyledField
                          label={
                            <span className='relative -top-1.5'>
                              Other Condition
                              <StarIcon className="absolute text-[6px] text-red-500 right-[-8px] top-[3.5px]" />
                            </span>
                          }
                          name="condition_custom"
                          value={
                            values?.condition_custom === ''
                              ? ''
                              : values?.condition_custom
                          }
                        />
                      </Grid>
                    ) : null}
                  </>
                ) : null}

                <Grid
                  item
                  xs={
                    values.parking === AmenitisResidentialComp.TYPE_MY_OWN ||
                    parkingOptions === AmenitisResidentialComp.TYPE_MY_OWN
                      ? 3
                      : 6
                  }
                >
                  <SelectTextField
                    onChange={(v) => {
                      handleInput({
                        target: { name: 'parking', value: v.target.value },
                      });
                      setFieldValue('parking_custom', '');
                      setParkingOption('');
                    }}
                    options={parkingOption}
                    value={values.parking}
                    label={
                      <span className="text-customGray text-base">Parking</span>
                    }
                    name="parking"
                  />
                </Grid>
                {values.parking === AmenitisResidentialComp.TYPE_MY_OWN ||
                parkingOptions === AmenitisResidentialComp.TYPE_MY_OWN ? (
                  <Grid item xs={3}>
                    <StyledField
                      label={<span className="relative -top-1.5">Other Parking</span>}
                      name="parking_custom"
                    />
                  </Grid>
                ) : null}
              </Grid>
            </div>
          ) : localStorage.getItem('activeType') === 'building_with_land' &&
            passData.comp_type === 'building_with_land' ? (
            <div>
              <div
                style={{
                  width: '100%',
                  border: '1px solid #eee',
                  backgroundColor: '#f5f5f5',
                  marginTop: '40px',
                  paddingBottom: '70px',
                }}
              >
                <Grid
                  container
                  spacing={2}
                  columns={16}
                  className="mt-[10px] px-2 w-full items-end"
                >
                  <FieldArray
                    name="zonings"
                    render={(arrayHelpers) => (
                      <>
                        {values.zonings && values.zonings.length > 0
                          ? values.zonings.map((zone: any, i: number) => {
                              return (
                                <>
                                  <Grid
                                    item
                                    xs={
                                      values.comparison_basis === 'SF' ? 4 : 3
                                    }
                                    key={zone.zone}
                                    className="pt-[36px] pb-[0px] pl-[24px] pr-[0px] relative selectFixedHeight"
                                  >
                                    <SelectTextField
                                      value={values.zonings[i].zone}
                                      options={propertyOptions}
                                      onChange={(v) => {
                                        passComparisonBasisUnit(v);
                                        handleInput({
                                          target: {
                                            name: `zonings.${i}.zone`,
                                            value: v.target.value,
                                          },
                                        });
                                        handleInput({
                                          target: {
                                            name: `zonings.${i}.sub_zone`,
                                            value: '',
                                          },
                                        });
                                      }}
                                      name={`zonings.${i}.zone`}
                                      label={
                                        <span className="relative text-customGray">
                                          {CreateCompsEnum.PROPERTY_TYPE}{' '}
                                          <span className="text-red-500 text-base">
                                            *
                                          </span>
                                        </span>
                                      }
                                    />
                                    {setDataRequited &&
                                      values?.type === 'leases' &&
                                      values.zonings[i].zone === '' && (
                                        <div className="text-red-500 text-[11px] absolute">
                                          This field is required.
                                        </div>
                                      )}
                                    {setDataRequited &&
                                      values?.type === 'sales' &&
                                      values.zonings[i].zone === '' && (
                                        <div className="text-red-500 text-[11px] absolute">
                                          This field is required.
                                        </div>
                                      )}
                                    {/* {setDataRequited && errors && (
 <div className="text-red-500 text-sm absolute">
 {errors.zonings &&
 errors.zonings[i] &&
 typeof errors.zonings[i] ===
 'object' &&
 (errors.zonings[i] as any).zone}
 </div>
 )} */}
                                  </Grid>
                                  <Grid
                                    item
                                    xs={
                                      values.zonings[i].sub_zone ===
                                      AmenitisResidentialComp.TYPE_MY_OWN
                                        ? 2
                                        : 4
                                    }
                                    className="pt-[36px] pb-[0px] pl-[24px] pr-[0px] relative selectFixedHeight"
                                  >
                                    {/* <Tooltip
 title={
 values.zonings[i].sub_zone.length >
 truncateLength
 ? values.zonings[i].sub_zone
 : ''
 }
 arrow
 > */}
                                    <div>
                                      <SelectTextField
                                        value={values.zonings[i].sub_zone}
                                        options={getOptionsByZone(zone.zone)}
                                        onChange={(v) => {
                                          setTypeMyOwn(v.target.value);
                                          handleInput({
                                            target: {
                                              name: `zonings[${i}].sub_zone`,
                                              value: v.target.value,
                                            },
                                          });
                                        }}
                                        name={`zonings[${i}].sub_zone`}
                                        label={
                                          <span className="relative text-customGray">
                                            {CreateCompsEnum.SUB_PROPERTY}
                                            <span className="text-red-500 text-base">
                                              *
                                            </span>
                                          </span>
                                        }
                                      />
                                    </div>
                                    {/* </Tooltip> */}
                                    {setDataRequited &&
                                      values?.type === 'leases' &&
                                      values.zonings[i].sub_zone === '' && (
                                        <div className="text-red-500 text-[11px] absolute">
                                          This field is required.
                                        </div>
                                      )}
                                    {setDataRequited &&
                                      values?.type === 'sales' &&
                                      values.zonings[i].sub_zone === '' && (
                                        <div className="text-red-500 text-[11px] absolute">
                                          This field is required.
                                        </div>
                                      )}
                                    {/* {setDataRequited && errors && (
 <div className="text-red-500 text-sm absolute">
 {errors.zonings &&
 errors.zonings[i] &&
 typeof errors.zonings[i] ===
 'object' &&
 (errors.zonings[i] as any).sub_zone}
 </div>
 )} */}
                                  </Grid>
                                  {zone?.sub_zone ===
                                  AmenitisResidentialComp.TYPE_MY_OWN ? (
                                    <Grid
                                      item
                                      xs={2}
                                      className="pt-[36px] selectFixedHeight"
                                      key={`zonings.${i}.sub_zone_custom`}
                                    >
                                      <StyledField
                                        label={
                                          <span className="relative">
                                            Other Sub Property Type
                                            <Icons.StarIcon className="absolute text-[6px] text-red-500 right-[-7px] top-[2.5px]" />
                                          </span>
                                        }
                                        name={`zonings.${i}.sub_zone_custom`}
                                        style={{
                                          background: '#f5f5f5',
                                          borderBottomWidth: '1px',
                                        }}
                                        type="text"
                                      />
                                    </Grid>
                                  ) : null}

                                  <Grid
                                    item
                                    xs={
                                      values.comparison_basis === 'SF' ? 4 : 2.8
                                    }
                                    className="pt-[36px] pb-[0px] pl-[24px] pr-[0px]"
                                  >
                                    <InputField
                                      label={
                                        <span className="relative top-0.5">
                                          {CreateCompsEnum.SQ_FT}
                                          <span className="text-red-500 text-xs">
                                            *
                                          </span>
                                        </span>
                                      }
                                      name={`zonings.${i}.sq_ft`}
                                      style={{
                                        background: '#f5f5f5',
                                        borderBottomWidth: '1px',
                                      }}
                                      onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>
                                      ) => {
                                        const input = sanitizeInput(
                                          e.target.value
                                        );
                                        handleInputChange(
                                          handleChange,
                                          `zonings.${i}.sq_ft`,
                                          input
                                        );
                                      }}
                                      value={values.zonings[i].sq_ft}
                                      type="text"
                                    />
                                    {setDataRequited &&
                                      values?.type === 'leases' &&
                                      values.zonings[i].sq_ft === '' && (
                                        <div className="text-red-500 text-[11px] absolute">
                                          This field is required.
                                        </div>
                                      )}
                                    {setDataRequited &&
                                      values?.type === 'sales' &&
                                      values.zonings[i].sq_ft === '' && (
                                        <div className="text-red-500 text-[11px] absolute">
                                          This field is required.
                                        </div>
                                      )}
                                  </Grid>

                                  {values.comparison_basis === 'Unit' ? (
                                    <>
                                      <Grid
                                        item
                                        xs={2.5}
                                        key={zone.zone}
                                        className="pt-[36px] pb-[0px] pl-[24px] pr-[0px]"
                                      >
                                        <StyledField
                                          label={
                                            <span className="relative top-0.5">
                                              # of Units
                                            </span>
                                          }
                                          name={`zonings.${i}.unit`}
                                          style={{
                                            background: '#f5f5f5',
                                            borderBottomWidth: '1px',
                                          }}
                                          onChange={(
                                            e: React.ChangeEvent<HTMLInputElement>
                                          ) => {
                                            const input = sanitizeInput(
                                              e.target.value
                                            );
                                            handleInputChange(
                                              handleChange,
                                              `zonings.${i}.unit`,
                                              input
                                            );
                                          }}
                                          value={values.zonings[i].unit}
                                        />
                                        {setDataRequited &&
                                          values.comparison_basis === 'Unit' &&
                                          values.zonings[i].unit === '' && (
                                            <div className="text-red-500 text-[11px] absolute">
                                              This field is required
                                            </div>
                                          )}
                                      </Grid>
                                    </>
                                  ) : values.comparison_basis === 'Bed' ? (
                                    <>
                                      <Grid
                                        item
                                        xs={2.5}
                                        key={`zonings.${i}.bed`}
                                        className="pt-[36px] pb-[0px] pl-[24px] pr-[0px]"
                                      >
                                        <StyledField
                                          label="# of Beds"
                                          name={`zonings.${i}.bed`}
                                          style={{ background: '#f5f5f5' }}
                                          onChange={(
                                            e: React.ChangeEvent<HTMLInputElement>
                                          ) => {
                                            const input = sanitizeInput(
                                              e.target.value
                                            );
                                            handleInputChange(
                                              handleChange,
                                              `zonings.${i}.bed`,
                                              input
                                            );
                                          }}
                                          value={values.zonings[i].bed}
                                        />
                                        {setDataRequited &&
                                          values.comparison_basis === 'Bed' &&
                                          values.zonings[i].bed === '' && (
                                            <div className="text-red-500 text-[11px] absolute">
                                              This field is required
                                            </div>
                                          )}
                                      </Grid>
                                    </>
                                  ) : null}
                                  {i ? (
                                    <Grid item xs={2}>
                                      <div style={{ marginTop: '24px' }}>
                                        <Icons.RemoveCircleOutlineIcon
                                          onClick={() => arrayHelpers.remove(i)}
                                          className="text-red-500 cursor-pointer"
                                        />
                                      </div>
                                    </Grid>
                                  ) : (
                                    <Grid item xs={1} />
                                  )}
                                </>
                              );
                            })
                          : null}

                        <Grid item xs={1}>
                          <div
                            style={{ marginTop: '24px', marginLeft: '-41px' }}
                          >
                            <Icons.AddCircleOutlineIcon
                              onClick={() =>
                                arrayHelpers.insert(values.zonings.length, {
                                  zone: '',
                                  sub_zone: '',
                                  sq_ft: '',
                                  bed: '',
                                  unit: '',
                                  sub_zone_custom: '',
                                })
                              }
                              className="cursor-pointer text-customDeeperSkyBlue"
                            />
                          </div>
                        </Grid>
                      </>
                    )}
                  />
                </Grid>
              </div>

              {values?.comparison_basis === 'Unit' &&
                values?.zonings?.some(
                  (ele) => ele?.zone === BuildingDetailsEnum.MULTIFAMILY
                ) && <MultiFamily passData={passData} />}

              <Grid container spacing={3} className="mt-[20px]">
                <Grid item xs={6} xl={3}>
                  <StyledField label="Built Year" name="year_built" />
                </Grid>
                <Grid item xs={6} xl={3}>
                  <StyledField label="Remodeled Year" name="year_remodeled" />
                </Grid>
                <Grid item xs={6} xl={3}>
                  <StyledField
                    label="Construction Class"
                    name="construction_class"
                  />
                </Grid>
                <Grid item xs={6} xl={3}>
                  <StyledField label="Stories" name="stories" />
                </Grid>
              </Grid>
              <Grid container spacing={3} className="mt-[20px]">
                <Grid item xs={4}>
                  <StyledField
                    label="Gross Area"
                    name="gross_building_area"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const input = sanitizeInput(e.target.value);
                      handleInputChange(
                        handleChange,
                        'gross_building_area',
                        input
                      );
                    }}
                    value={values.gross_building_area}
                  />
                </Grid>
                <Grid item xs={4}>
                  <StyledField
                    label="Net Area"
                    name="net_building_area"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const input = sanitizeInput(e.target.value);
                      handleInputChange(
                        handleChange,
                        'net_building_area',
                        input
                      );
                    }}
                    value={values.net_building_area}
                  />
                </Grid>
                <Grid item xs={4}>
                  <StyledField label="Effective Age" name="effective_age" />
                </Grid>
              </Grid>
              <Grid container spacing={2} className="mt-[20px]">
                <Grid item xs={12}>
                  <TextAreaField
                    label="Building Comments"
                    name="building_comments"
                    style={{ padding: '0px' }}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2} className="mt-[20px] items-end">
                {values.type === 'sales' ? (
                  <>
                    <Grid
                      item
                      xs={
                        values.condition === AmenitisResidentialComp.TYPE_MY_OWN
                          ? 3
                          : 6
                      }
                      className="relative selectFixedHeight"
                    >
                      <SelectTextField
                        value={values.condition}
                        onChange={(v: any) => {
                          const selectedValue = v.target.value;

                          // Reset condition_custom if the selected option is "Type My Own"
                          if (selectedValue === 'Type My Own') {
                            handleInput({
                              target: {
                                name: 'condition_custom',
                                value: '',
                              },
                            });
                          }

                          setConditionOption('');
                          handleInput({
                            target: {
                              name: 'condition',
                              value: selectedValue,
                            },
                          });
                        }}
                        options={conditionComps}
                        name="condition"
                        label={
                          <span>
                            {CreateCompsEnum.CONDITION}
                            <span className="text-red-500 text-base"> *</span>
                          </span>
                        }
                      />
                      {setDataRequited && errors && !values?.condition && (
                        <div className="text-red-500 text-[11px] pt-1 absolute">
                          This field is Required
                        </div>
                      )}
                    </Grid>
                    {values.condition === AmenitisResidentialComp.TYPE_MY_OWN ||
                    conditionOption === AmenitisResidentialComp.TYPE_MY_OWN ? (
                      <Grid item xs={3}>
                        <StyledField
                          label={
                            <span className="relative">
                              Other Condition
                              <StarIcon className="absolute text-[6px] text-red-500 right-[-8px] top-[3.5px]" />
                            </span>
                          }
                          name="condition_custom"
                          value={
                            values?.condition_custom === ''
                              ? ''
                              : values?.condition_custom
                          }
                        />
                      </Grid>
                    ) : null}
                  </>
                ) : null}

                <Grid className='selectFixedHeight'
                  item
                  xs={
                    values.parking === AmenitisResidentialComp.TYPE_MY_OWN ||
                    parkingOptions === AmenitisResidentialComp.TYPE_MY_OWN
                      ? 3
                      : 6
                  }
                >
                  <SelectTextField
                    onChange={(v) => {
                      handleInput({
                        target: { name: 'parking', value: v.target.value },
                      });
                      setFieldValue('parking_custom', '');
                      setParkingOption('');
                    }}
                    options={parkingOption}
                    value={values.parking}
                    label={
                      <span className="text-customGray text-base">Parking</span>
                    }
                    name="parking"
                  />
                </Grid>
                {values.parking === AmenitisResidentialComp.TYPE_MY_OWN ||
                parkingOptions === AmenitisResidentialComp.TYPE_MY_OWN ? (
                  <Grid item xs={3}>
                    <StyledField
                      label={
                        <span className="relative">Other Parking</span>
                      }
                      name="parking_custom"
                    />
                  </Grid>
                ) : null}
              </Grid>
            </div>
          ) : (
            <LandOnly passData={passData} setDataRequited={setDataRequited} />
          )}
        </div>
        <div>
          <HarkenHr />
        </div>
      </div>
    </>
  );
};
