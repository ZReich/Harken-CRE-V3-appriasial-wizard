import Grid from '@mui/material/Grid';
import StyledField from '@/components/styles/StyleFieldEditComp';
import SelectTextField from '@/components/styles/select-input';
import { conditionOptions, parkingOption } from './SelectOption';
import { handleInputChange, sanitizeInput } from '@/utils/sanitize';
import React, { ChangeEvent, useEffect } from 'react';
import { useFormikContext } from 'formik';
import { CreateCompType } from '@/components/interface/create-comp-type';
import { CreateCompsEnum } from '../enum/CompsEnum';
import { BuildingDetailsEnum } from '../enum/CompsEnum';
import { AmenitisResidentialComp } from '@/pages/residential/enum/ResidentialEnum';
import TextAreaField from '@/components/styles/textarea';

export const LandOnly = ({ passData, setDataRequited }: any) => {
  const { handleChange, values, setFieldValue, errors } =
    useFormikContext<CreateCompType>();

  const [parkingOptions, setParkingOptions] = React.useState('');
  const [conditionOption, setConditionOption] = React.useState<string>('');

  const handleSelectOptions = (e: ChangeEvent<HTMLInputElement>) => {
    setFieldValue('condition', e.target.value);
    setConditionOption('');
    const isConditionMatch = conditionOptions.some(
      (option) => option.value === passData.condition
    );
    if (isConditionMatch || passData.condition === '') {
      setFieldValue('condition_custom', '');
    }
  };
  const handleParkingOptions = (e: ChangeEvent<HTMLInputElement>) => {
    setParkingOptions(e.target.value);
    setFieldValue('parking', e.target.value);

    const isParkingMatch = parkingOption.some(
      (option) => option.value === passData.parking
    );

    if (isParkingMatch || passData.parking === '') {
      setFieldValue('parking_custom', '');
    }
  };

  const getValueOrTypeMyOwnParking = (value: any) => {
    if (value === '') {
      setParkingOptions('');
      return '';
    } else {
      const foundOption = parkingOption.find(
        (option) => option.value === value
      );
      const founderOption = foundOption
        ? foundOption.value
        : AmenitisResidentialComp.TYPE_MY_OWN;
      setParkingOptions(founderOption);
      return foundOption
        ? foundOption.value
        : AmenitisResidentialComp.TYPE_MY_OWN;
    }
  };

  const getValueOrTypeMyOwnCondition = (value: any) => {
    const foundOption = conditionOptions.find(
      (option) => option.value === value
    );
    const founderOption = foundOption
      ? foundOption.value
      : AmenitisResidentialComp.TYPE_MY_OWN;
    setConditionOption(founderOption);
    return foundOption
      ? foundOption.value
      : AmenitisResidentialComp.TYPE_MY_OWN;
  };

  useEffect(() => {
    if (passData.id) {
      setFieldValue('construction_class', passData.construction_class);

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

      setFieldValue('effective_age', passData.effective_age);
      setFieldValue(
        'condition',
        getValueOrTypeMyOwnCondition(passData.condition)
      );
      setFieldValue('condition_custom', passData.condition);
      setFieldValue('building_comments', passData.building_comments);
      setFieldValue('parking', getValueOrTypeMyOwnParking(passData.parking));
      setFieldValue('parking_custom', passData.parking);
      setFieldValue('stories', passData.stories);
    }
  }, [passData.id]);

  return (
    <>
      <div>
        <div>
          <Grid className="mt-[20px]" container spacing={3}>
            <Grid item xs={6}>
              <StyledField
                label="Construction Class"
                name="construction_class"
              />
            </Grid>
            <Grid item xs={6}>
              <StyledField label="Stories" name="stories" />
            </Grid>
          </Grid>
          <Grid container spacing={3} className="mt-[20px]">
            <Grid item xs={6}>
              <StyledField
                label="Gross Area"
                name="gross_building_area"
                type="text"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const input = sanitizeInput(e.target.value);
                  handleInputChange(handleChange, 'gross_building_area', input);
                }}
                value={values.gross_building_area}
              />
            </Grid>
            <Grid item xs={6}>
              <StyledField
                label="Net Area"
                name="net_building_area"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const input = sanitizeInput(e.target.value);
                  handleInputChange(handleChange, 'net_building_area', input);
                }}
                value={values.net_building_area}
              />
            </Grid>
          </Grid>
          <Grid container spacing={3} className="mt-[20px] items-end">
            <Grid item xs={6}>
              <StyledField label="Effective Age" name="effective_age" />
            </Grid>
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
                    label={
                      <span className="text-customGray">
                        {CreateCompsEnum.CONDITION}
                        <span className="text-red-500 text-base"> *</span>
                      </span>
                    }
                    name="condition"
                    value={values.condition}
                    options={conditionOptions}
                    onChange={handleSelectOptions}
                  ></SelectTextField>
                  {setDataRequited && errors && !values?.condition && (
                    <div className="text-red-500 text-[11px] pt-1 absolute">
                      This field is Required
                    </div>
                  )}
                </Grid>
                {values.condition === AmenitisResidentialComp.TYPE_MY_OWN ||
                conditionOption === AmenitisResidentialComp.TYPE_MY_OWN ? (
                  <>
                    <Grid item xs={3} className="">
                      <StyledField
                        label={
                          <span className="text-customGray">
                            Other Condition
                            <span className="text-red-500 text-[12px]"> *</span>
                          </span>
                        }
                        name="condition_custom"
                      />
                      {setDataRequited &&
                        errors &&
                        !values?.condition_custom && (
                          <div className="text-red-500 text-[11px] pt-1 absolute">
                            This field is Required
                          </div>
                        )}
                    </Grid>
                  </>
                ) : (
                  ''
                )}
              </>
            ) : null}
          </Grid>
          <Grid container spacing={3} className="mt-[20px]">
            <Grid item xs={12}>
              <TextAreaField
                label="Building Comments"
                name="building_comments"
                style={{ padding: '0px' }}
              />
            </Grid>
          </Grid>
          <Grid container spacing={3} className="mt-[20px]">
            <Grid item xs={parkingOptions === 'type_my_own' ? 3 : 6}>
              <SelectTextField
                label={
                  <span className="text-customGray">
                    {CreateCompsEnum.PARKING}
                  </span>
                }
                name="parking"
                // defaultValue="Select"
                value={values.parking}
                options={parkingOption}
                onChange={handleParkingOptions}
              ></SelectTextField>
            </Grid>
            {values.parking === AmenitisResidentialComp.TYPE_MY_OWN ||
            parkingOptions === AmenitisResidentialComp.TYPE_MY_OWN ? (
              <>
                <Grid item xs={3}>
                  <StyledField label="Other Parking" name="parking_custom" />
                </Grid>
              </>
            ) : (
              ''
            )}
          </Grid>
        </div>
      </div>
    </>
  );
};
