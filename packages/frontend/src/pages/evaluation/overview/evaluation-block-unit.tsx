import React from 'react';
import { FieldArray, useFormikContext } from 'formik';
import { Grid } from '@mui/material';
import StyledField from '@/components/styles/StyleFieldEditComp';
import {
  sanitizeInput,
  handleInputChange,
  sanitizeInputDollarSign,
} from '@/utils/sanitize';
import { CreateCompType } from '@/components/interface/create-comp-type';
import { Icons } from '@/components/icons';

export const EvaluatiohnBlockSectionUnit = () => {
  const { values, handleChange } = useFormikContext<CreateCompType>();

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
          className="mt-[43px] px-10 w-full"
        >
          <FieldArray
            name="property_units"
            render={(arrayHelpers) => (
              <>
                {values.property_units && values.property_units.length > 0
                  ? values.property_units.map((zone: any, i: number) => {
                      return (
                        <>
                          <Grid
                            item
                            xs={2.5}
                            key={zone.zone}
                            className="pb-[31px] pl-[15px] xl:pl-[24px] pr-[0px] "
                          >
                            <StyledField
                              label="Beds"
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
                              label="Baths"
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
                              label="SQ.FT."
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
                              label="Unit Count"
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
                          <Grid item xs={2.5}>
                            <StyledField
                              label={
                                <span className="relative text-customGray">
                                  Average Monthly Rent
                                </span>
                              }
                              name={`property_units.${i}.avg_monthly_rent`}
                              style={{
                                background: '#f5f5f5',
                                borderBottomWidth: '1px',
                              }}
                              onKeyDown={(e: React.KeyboardEvent) => {
                                const isBack = e.code === 'Backspace';
                                if (isBack) {
                                  const input = values.property_units[
                                    i
                                  ].avg_monthly_rent
                                    .toString()
                                    .replace(/[^\d]/g, ''); // Remove non-digit characters

                                  if (input.length > 0) {
                                    const newValue = input.slice(0, -1); // Remove last digit
                                    const shiftedValue =
                                      parseInt(newValue, 10) / 100; // Shift decimal left by 2
                                    handleInputChange(
                                      handleChange,
                                      `property_units.${i}.avg_monthly_rent`,
                                      `$${shiftedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                    );
                                  }
                                }
                              }}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ) => {
                                const input = sanitizeInputDollarSign(
                                  e.target.value
                                );
                                // Sanitize input and format as currency
                                const sanitizedValue = input.replace(
                                  /[^\d]/g,
                                  ''
                                );
                                const formattedValue = sanitizedValue
                                  ? `$${(parseInt(sanitizedValue, 10) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                  : '';

                                handleInputChange(
                                  handleChange,
                                  `property_units.${i}.avg_monthly_rent`,
                                  formattedValue
                                );
                              }}
                              value={
                                values.property_units[i].avg_monthly_rent ||
                                '$0.00'
                              } // Show $0.00 when input is empty
                              type="text"
                              placeholder="$0.00" // Optional: add a placeholder for better visibility
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
                      arrayHelpers.insert(values.property_units.length, {
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
