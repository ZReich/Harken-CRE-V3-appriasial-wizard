import { Icons } from '@/components/icons';
import StyledField from '@/components/styles/StyleFieldEditComp';
import SelectTextField from '@/components/styles/select-input';
import { BuildingWithLandEnum } from '@/pages/appraisal/overview/OverviewEnum';
import {
  hospitalityOptions,
  industrialOptions,
  multifamilyOptions,
  officeOptions,
  propertyOptions,
  residentialOptions,
  retailOptions,
  selectTypeOptions,
  specialOptions,
} from '@/pages/comps/create-comp/SelectOption';
import {
  BuildingDetailsEnum,
  CreateCompsEnum,
} from '@/pages/comps/enum/CompsEnum';
import {
  handleInputChange,
  sanitizeInput,
  sanitizeInputPercentage,
} from '@/utils/sanitize';
import { Grid } from '@mui/material';
import { FieldArray, useFormikContext } from 'formik';
// import { BuildingWithLandEnum } from './OverviewEnum';
// import { MultiFamily } from './MultiFamily';
import { AmenitisResidentialComp } from '@/pages/residential/enum/ResidentialEnum';
import { useState } from 'react';

export const EvaluationLandOnlyProperty = ({
  passRequired,
  setDataRequited,
  hasMultiFamilyApproach,
}: any) => {
  const {
    values,
    setFieldValue,
    errors,
    handleChange,
    touched,
    // setTouched,
  }: {
    values: any;
    setFieldValue: any;
    errors: any;
    handleChange: any;
    setTouched: any;
    touched: any;
  } = useFormikContext();
  const handleInput = (e: any) => {
    const { name, value } = e.target;
    setFieldValue(name, value);
  };

  // const setTouchedValues = ({
  //   name = '',
  //   subName = '',
  //   type = '',
  //   index = 0,
  // }: {
  //   name: string;
  //   type: string;
  //   subName: string;
  //   index: number;
  // }) => {
  //   if (Array.isArray(type)) {
  //     values?.[name]?.forEach((item: any, i: number) => {
  //       for (const key in item) {
  //         if (key == subName && i == index) {
  //           return setTouched({
  //             [name]: [
  //               {
  //                 [subName]: true,
  //               },
  //             ],
  //           });
  //         }
  //       }
  //     });
  //   } else {
  //     return setTouched({
  //       [name]: true,
  //     });
  //   }
  // };

  const getOptions = (zoneType: any) => {
    switch (zoneType) {
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
  const [, setTypeMyOwn] = useState<string>('');
  return (
    <>
      <div>
        <div
          style={{
            width: '100%',
            border: '1px solid #eee',
            backgroundColor: '#f5f5f5',
            marginTop: '25px',
            paddingBottom: '15px',
          }}
        >
          <Grid
            container
            spacing={2}
            className="mt-[10px] px-4 w-full m-0 gap-2 flex flex-nowrap"
          >
            <FieldArray
              name={BuildingWithLandEnum.ZONINGS}
              render={(arrayHelpers) => (
                <>
                  <Grid item className="p-0 flex flex-col w-full">
                    {values.zonings && values.zonings.length > 0
                      ? values.zonings.map((zone: any, i: any) => {
                          return (
                            <>
                              <Grid
                                container
                                className="flex gap-2 lg:gap-6 flex-nowrap items-end"
                              >
                                <Grid
                                  item
                                  key={zone.zone}
                                  className="pt-2.5 pb-[0px] pr-[0px] flex-1 lg:max-w-full max-w-[90px] selectFixedHeight"
                                >
                                  <SelectTextField
                                    value={values.zonings[i].zone}
                                    options={propertyOptions}
                                    onChange={(v) => {
                                      passComparisonBasisUnit(v);
                                      handleInput({
                                        target: {
                                          // name: `${BuildingWithLandEnum.ZONINGS}.${i}.${BuildingWithLandEnum.ZONE}`,
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
                                    // name={`${BuildingWithLandEnum.ZONINGS}.${i}.${BuildingWithLandEnum.ZONE}`}
                                    label={
                                      <span className="relative text-customGray">
                                        {CreateCompsEnum.PROPERTY_TYPE}{' '}
                                        <span className="text-red-500 text-base">
                                          *
                                        </span>
                                      </span>
                                    }
                                  />
                                  {setDataRequited && errors && (
                                    <div className="text-red-500  text-[11px] absolute">
                                      {errors.zonings &&
                                        errors.zonings[i] &&
                                        typeof errors.zonings[i] === 'object' &&
                                        (errors.zonings[i] as any).zone}
                                    </div>
                                  )}

                                  <div className="text-red-500  text-[11px] absolute">
                                    {touched?.[
                                      `${BuildingWithLandEnum.ZONINGS}`
                                    ]?.[i]?.[`${BuildingWithLandEnum.ZONE}`] &&
                                      errors?.zonings?.[i]?.zone}
                                  </div>
                                </Grid>

                                <Grid
                                  item
                                  className="pt-2.5 pb-[0px] pr-[0px] relative flex-1 lg:max-w-full max-w-[90px] selectFixedHeight"
                                >
                                  <SelectTextField
                                    value={values.zonings[i].sub_zone}
                                    options={getOptions(zone.zone)}
                                    onChange={(v) => {
                                      setTypeMyOwn(v.target.value);
                                      // setTouchedValues({
                                      //   name: `${BuildingWithLandEnum.SUB_ZONE}`,
                                      //   subName: `${BuildingWithLandEnum.ZONINGS}`,
                                      //   type: 'Array',
                                      //   index: i,
                                      // });
                                      handleInput({
                                        target: {
                                          // name: `${BuildingWithLandEnum.ZONINGS}.${i}.${BuildingWithLandEnum.SUB_ZONE}`,
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
                                          {/* {' '} */}*
                                        </span>
                                      </span>
                                    }
                                  />
                                  <div className="text-red-500  text-[11px] absolute">
                                    {touched?.[
                                      `${BuildingWithLandEnum.ZONINGS}`
                                    ]?.[i]?.[
                                      `${BuildingWithLandEnum.SUB_ZONE}`
                                    ] && errors?.zonings?.[i]?.sub_zone}
                                  </div>
                                </Grid>
                                {zone?.sub_zone ===
                                AmenitisResidentialComp.TYPE_MY_OWN ? (
                                  <Grid
                                    item
                                    className="pt-2.5 relative flex-1"
                                    key={`zonings.${i}.sub_zone_custom`}
                                  >
                                    <StyledField
                                      label="Other Sub Property Type"
                                      name={`zonings.${i}.sub_zone_custom`}
                                      style={{
                                        backgroundColor: '#f5f5f5',
                                        borderBottomWidth: '1px',
                                      }}
                                      type="text"
                                      value={
                                        values.zonings[i].sub_zone_custom || ''
                                      }
                                    />
                                    {zone?.sub_zone === 'Type My Own' &&
                                    zone?.sub_zone_custom === '' ? (
                                      <div className="text-red-500 text-[11px] absolute top-[100%]">
                                        This field is required.
                                      </div>
                                    ) : null}
                                  </Grid>
                                ) : null}

                                <Grid
                                  item
                                  className="pt-2.5 pb-[0px] pr-[0px] flex-1"
                                >
                                  <StyledField
                                    name={`${BuildingWithLandEnum.ZONINGS}[${i}].${BuildingWithLandEnum.SQ_FT_NAME}`}
                                    label={
                                      <span className="relative text-customGray">
                                        {BuildingWithLandEnum.SQ_FT}
                                        <span className="text-red-500 text-xs absolute !right-[-7px]">
                                          *
                                        </span>
                                      </span>
                                    }
                                    style={{
                                      backgroundColor: '#f5f5f5',
                                      borderBottomWidth: '1px',
                                    }}
                                    onChange={(
                                      e: React.ChangeEvent<HTMLInputElement>
                                    ) => {
                                      const input = sanitizeInput(
                                        e.target.value
                                      );

                                      // Store value in localStorage
                                      localStorage.setItem(
                                        'buildingSize',
                                        input
                                      );

                                      handleInputChange(
                                        handleChange,
                                        `${BuildingWithLandEnum.ZONINGS}.${i}.${BuildingWithLandEnum.SQ_FT_NAME}`,
                                        input
                                      );
                                    }}
                                  />
                                </Grid>
                                {values.comparison_basis === 'Unit' ||
                                hasMultiFamilyApproach === 1 ? (
                                  <>
                                    <Grid
                                      item
                                      key={zone.zone}
                                      className="pt-[28px] pb-[0px] pr-[0px] flex-1"
                                    >
                                      <StyledField
                                        label={
                                          <span className="relative text-customGray">
                                            # of Units
                                            <span className="text-red-500 text-xs">
                                              *
                                            </span>
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
                                      {passRequired &&
                                        values.comparison_basis === 'Unit' &&
                                        values.zonings[i].unit === '' && (
                                          <div className="text-red-500  text-[11px] absolute">
                                            This field is required
                                          </div>
                                        )}
                                    </Grid>
                                  </>
                                ) : values.comparison_basis === 'Bed' ? (
                                  <>
                                    <Grid
                                      item
                                      key={zone.zone}
                                      className="pt-[28px] pb-[0px] pr-[0px] flex-1"
                                    >
                                      <StyledField
                                        label={
                                          <span className="text-customGray">
                                            # of Beds
                                            <span className="text-red-500 text-xs">
                                              {' '}
                                              *
                                            </span>
                                          </span>
                                        }
                                        name={`zonings.${i}.bed`}
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
                                            `zonings.${i}.bed`,
                                            input
                                          );
                                        }}
                                        value={values.zonings[i].bed}
                                      />
                                      {passRequired &&
                                        values.comparison_basis === 'Bed' &&
                                        values.zonings[i].bed === '' && (
                                          <div className="text-red-500  text-[11px] test absolute">
                                            This field is required
                                          </div>
                                        )}
                                    </Grid>
                                  </>
                                ) : null}
                                <Grid
                                  item
                                  className="pt-2.5 pb-[0px] pr-[0px] flex-1"
                                >
                                  <StyledField
                                    name={`${BuildingWithLandEnum.ZONINGS}[${i}].${BuildingWithLandEnum.WEIGHT_SF}`}
                                    label={
                                      <span className="relative text-customGray">
                                        {BuildingWithLandEnum.SF_WEIGHTING}
                                        <span className="text-red-500 text-xs absolute !right-[-7px]">
                                          {' '}
                                          *
                                        </span>
                                      </span>
                                    }
                                    style={{
                                      backgroundColor: '#f5f5f5',
                                      borderBottomWidth: '1px',
                                    }}
                                    onKeyDown={(e: React.KeyboardEvent) => {
                                      const isBack = e.code === 'Backspace';
                                      const event =
                                        e as React.KeyboardEvent<HTMLInputElement>;
                                      if (isBack) {
                                        const inputElement =
                                          event.currentTarget;
                                        const { selectionStart, selectionEnd } =
                                          inputElement;
                                        if (
                                          selectionStart === 0 &&
                                          selectionEnd ===
                                            inputElement.value.length
                                        ) {
                                          handleInputChange(
                                            handleChange,
                                            `${BuildingWithLandEnum.ZONINGS}[${i}].${BuildingWithLandEnum.WEIGHT_SF}`,
                                            ''
                                          );
                                          event.preventDefault();
                                        } else {
                                          const input =
                                            values.zonings[
                                              i
                                            ].weight_sf.toString();
                                          const inpArr = Array.from(input);
                                          inpArr.pop();
                                          handleInputChange(
                                            handleChange,
                                            `${BuildingWithLandEnum.ZONINGS}[${i}].${BuildingWithLandEnum.WEIGHT_SF}`,
                                            inpArr.join('')
                                          );
                                        }
                                      }
                                    }}
                                    onChange={(
                                      e: React.ChangeEvent<HTMLInputElement>
                                    ) => {
                                      const input = e.target.value;
                                      handleInputChange(
                                        handleChange,
                                        `${BuildingWithLandEnum.ZONINGS}.${i}.${BuildingWithLandEnum.WEIGHT_SF}`,
                                        input.replace(/%/g, '')
                                      );
                                    }}
                                    value={sanitizeInputPercentage(
                                      values.zonings[i].weight_sf
                                    )}
                                  />
                                </Grid>
                                {i ? (
                                  <Grid item className="flex items-end">
                                    <div
                                      onClick={() => arrayHelpers.remove(i)}
                                      style={{ marginTop: '38px' }}
                                    >
                                      <Icons.RemoveCircleOutlineIcon className="text-red-500 cursor-pointer" />
                                    </div>
                                  </Grid>
                                ) : (
                                  <Grid item className="min-w-[24px]" />
                                )}
                              </Grid>
                            </>
                          );
                        })
                      : null}
                  </Grid>
                  <Grid item className="flex items-end p-0">
                    <div
                      onClick={() =>
                        arrayHelpers.insert(values.zonings.length, {
                          id: '',
                          zone: '',
                          sub_zone: '',
                          sq_ft: '',
                          bed: '',
                          unit: '',
                          weight_sf: '100',
                          sub_zone_custom: '',
                        })
                      }
                      style={{ marginTop: '24px' }}
                    >
                      <Icons.AddCircleOutlineIcon className="cursor-pointer text-customDeeperSkyBlue" />
                    </div>
                  </Grid>
                </>
              )}
            />
          </Grid>

          <div className="mt-4 ps-[32px]">
            <p className="text-sm text-black font-bold inline">
              <span className="text-customDeeperSkyBlue">Note:</span>{' '}
              <span className="font-bold text-black bold text-xs">
                Weightings are only used for the Sales Comparison Approach when
                the Comparison Basis is SF.
              </span>
            </p>
          </div>
        </div>
        {/* {values.comparison_basis === 'Unit' &&
          values.zonings.some(
            (ele: { zone: BuildingDetailsEnum }) =>
              ele.zone === BuildingDetailsEnum.MULTIFAMILY
          ) && <MultiFamily />} */}
      </div>
    </>
  );
};
