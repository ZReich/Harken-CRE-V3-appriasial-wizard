import React, { useEffect } from 'react';
import { FieldArray, useFormikContext } from 'formik';
import { Grid } from '@mui/material';
import StyledField from '@/components/styles/StyleFieldEditComp';
import {
  sanitizeInput,
  handleInputChange,
  formatPrice,
  
} from '@/utils/sanitize';
import { CreateCompType } from '@/components/interface/create-comp-type';
import { Icons } from '@/components/icons';

export const MultiFamily = ({ passData }: any) => {
  const { values, handleChange, setFieldValue } =
    useFormikContext<CreateCompType>();
  useEffect(() => {
    if (passData?.id) {
      const PropertUnits =
        passData?.property_units &&  passData?.property_units?.length>0 ?
        passData?.property_units?.map((ele: any) => {
          return {
            avg_monthly_rent: formatPrice(ele.avg_monthly_rent || 0),
            baths: ele.baths,
            beds: ele.beds,
            comp_id: ele.comp_id,           
            created: ele.created,
            evaluation_id: ele.evaluation_id,
            id: ele.id,
            sq_ft: ele.sq_ft,
            unit_count: ele.unit_count,
          };
        }):[
          {
            beds: 0,
            baths: 0,
            sq_ft: 0,
            unit_count: 0,
            avg_monthly_rent: 0,
          },
      ]
      setFieldValue('property_units', PropertUnits);
    }
  }, [passData.id]);


  return (
    <>
      <div
        style={{
          width: '100%',
          border: '1px solid #eee',
          backgroundColor: '#f5f5f5',
          marginTop: '40px',
          paddingBottom: '43px',
        }}
      >
        <Grid
          container
          spacing={2}
          columns={16}
          className="mt-[43px] px-5 xl:px-10 w-full"
        >
          <FieldArray
            name="property_units"
            render={(arrayHelpers) => (
              <>
                {values?.property_units && values.property_units?.length>0
                  ? values?.property_units?.map((zone: any, i: number) => {
                      return (
                        <>
                          <Grid
                            item
                            xs={2.5}
                            key={zone.zone}
                            className="pb-[31px] pl-[15px] xl:pl-[24px] pr-[0px] "
                          >
                            <StyledField
                              label={
                                <span className="relative text-customGray">
                                  Beds
                                </span>
                              }
                              name={`property_units.${i}.beds`}
                              style={{
                                background: '#f5f5f5',
                                borderBottomWidth: '1px',
                              }}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ) => {
                                const input = sanitizeInput(e.target.value);
                                handleInputChange(
                                  handleChange,
                                  `property_units.${i}.beds`,
                                  input
                                );
                              }}
                              value={values.property_units[i].beds}
                              type="text"
                            />
                          </Grid>
                          <Grid item xs={2.5}>
                            <StyledField
                              label={
                                <span className="relative text-customGray">
                                  Baths
                                </span>
                              }
                              name={`property_units.${i}.baths`}
                              style={{
                                background: '#f5f5f5',
                                borderBottomWidth: '1px',
                              }}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ) => {
                                const input = sanitizeInput(e.target.value);
                                handleInputChange(
                                  handleChange,
                                  `property_units.${i}.baths`,
                                  input
                                );
                              }}
                              value={values.property_units[i].baths}
                              type="text"
                            />
                          </Grid>
                          <Grid item xs={2.5}>
                            <StyledField
                              label={
                                <span className="relative text-customGray">
                                  SQ.FT.
                                </span>
                              }
                              name={`property_units.${i}.sq_ft`}
                              style={{
                                background: '#f5f5f5',
                                borderBottomWidth: '1px',
                              }}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ) => {
                                const input = sanitizeInput(e.target.value);
                                handleInputChange(
                                  handleChange,
                                  `property_units.${i}.sq_ft`,
                                  input
                                );
                              }}
                              value={values.property_units[i].sq_ft}
                              type="text"
                            />
                          </Grid>
                          <Grid item xs={2.5}>
                            <StyledField
                              label={
                                <span className="relative text-customGray">
                                  Unit Count
                                </span>
                              }
                              name={`property_units.${i}.unit_count`}
                              style={{
                                background: '#f5f5f5',
                                borderBottomWidth: '1px',
                              }}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ) => {
                                const input = sanitizeInput(e.target.value);
                                handleInputChange(
                                  handleChange,
                                  `property_units.${i}.unit_count`,
                                  input
                                );
                              }}
                              value={values.property_units[i].unit_count}
                              type="text"
                            />
                          </Grid>
                          <Grid item xs={3}>
                            <StyledField 
                              label={
                                <span className="relative text-customGray whitespace-nowrap">
                                  Average Monthly Rent
                                </span>
                              }
                              name={`property_units.${i}.avg_monthly_rent`}
                              style={{
                                background: '#f5f5f5',
                                borderBottomWidth: '1px',
                              }}
                              onKeyDown={(e: React.KeyboardEvent) => {
                                const event =
                                  e as React.KeyboardEvent<HTMLInputElement>;
                                const isBack = e.code === 'Backspace';

                                if (isBack) {
                                  const inputElement = event.currentTarget;
                                  const { selectionStart, selectionEnd } =
                                    inputElement;

                                  // Sanitize the input to only include digits
                                  const input = values.property_units[
                                    i
                                  ].avg_monthly_rent
                                    .toString()
                                    .replace(/[^\d]/g, '');

                                  if (
                                    selectionStart === 0 &&
                                    selectionEnd === inputElement.value.length
                                  ) {
                                    // If entire input is selected, clear the field
                                    handleInputChange(
                                      handleChange,
                                      `property_units.${i}.avg_monthly_rent`,
                                      ''
                                    );
                                    event.preventDefault();
                                  } else if (input.length > 0) {
                                    // Remove last digit
                                    const newValue = input.slice(0, -1);
                                    const shiftedValue =
                                      parseInt(newValue, 10) / 100; // Shift decimal left by 2

                                    handleInputChange(
                                      handleChange,
                                      `property_units.${i}.avg_monthly_rent`,
                                      `$${shiftedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                    );
                                    event.preventDefault();
                                  }
                                }
                              }}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ) => {
                                const inputValue = e.target.value;
                                // Sanitize input and remove non-digit characters
                                const sanitizedInput = inputValue.replace(
                                  /[^\d]/g,
                                  ''
                                );
                                const formattedValue = sanitizedInput
                                  ? `$${(parseInt(sanitizedInput, 10) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                  : '$0.00';

                                handleInputChange(
                                  handleChange,
                                  `property_units.${i}.avg_monthly_rent`,
                                  formattedValue
                                );
                              }}
                              value={
                                values.property_units[i].avg_monthly_rent
                              } // Show $0.00 when input is empty
                              type="text"
                            />
                          </Grid>

                          {i ? (
                            <Grid item xs={1}>
                              <div
                                onClick={() => arrayHelpers.remove(i)}
                                style={{ marginTop: '21px' }}
                              >
                                <Icons.RemoveCircleOutlineIcon className="text-red-500 cursor-pointer" />
                              </div>
                            </Grid>
                          ) : (
                            <Grid item xs={1} />
                          )}
                        </>
                      );
                    })
                  : null}

                <Grid item xs={2}>
                  <div
                    onClick={() =>
                      arrayHelpers.insert(values?.property_units?.length, {
                        beds: '',
                        baths: '',
                        sq_ft: '',
                        unit_count: '',
                        avg_monthly_rent: '',
                      })
                    }
                    style={{ marginTop: '21px' }}
                  >
                    <Icons.AddCircleOutlineIcon className="cursor-pointer text-customDeeperSkyBlue" />
                  </div>
                </Grid>
              </>
            )}
          />
        </Grid>
      </div>
    </>
  );
};
