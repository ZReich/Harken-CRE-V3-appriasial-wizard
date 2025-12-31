import DatePickerComp from '@/components/date-picker';
import { HarkenHr } from '@/components/harken-hr';
import StyledField from '@/components/styles/StyleFieldEditComp';
import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import SellerBuyer from './SellerBuyer';
// import StarIcon from '@mui/icons-material/Star';
import SelectTextField from '@/components/styles/select-input';
import TextAreaField from '@/components/styles/textarea';
import { ResidentialComponentHeaderEnum } from '@/pages/residential/enum/ResidentialEnum';
import { formatDate } from '@/utils/date-format';
import {
  formatPercentageInput,
  handleInputChange,
  sanitizeInputDollarSignComps,
  // sanitizeInputPercentage,
  sanitizeInputDollarSignComps1,
} from '@/utils/sanitize';
import { useFormikContext } from 'formik';
import moment from 'moment';
import { ChangeEvent, useEffect } from 'react';
import { CreateCompsEnum } from '../enum/CompsEnum';
import { saleStatusOptions } from './SelectOption';

export const Transaction = ({
  passBoolean,
  setDataRequited,
  passDataT,
  newlyCreatedComp,
}: any) => {
  const { handleChange, values, setFieldValue, errors } =
    useFormikContext<any>();
  console.log('transactiobn', newlyCreatedComp);

  useEffect(() => {
    if (passDataT && passDataT.id) {
      const formattedSalePrice = parseFloat(
        passDataT.sale_price
      ).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      setFieldValue(
        'sale_price',
        passDataT.sale_price !== null ? '$' + formattedSalePrice : ''
      );
      setFieldValue('sale_status', passDataT.sale_status);
      const formattedNetOperatingExpense = parseFloat(
        passDataT.net_operating_income
      ).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      setFieldValue(
        'net_operating_income',
        passDataT.net_operating_income !== null
          ? '$' + formattedNetOperatingExpense
          : ''
      );
      setFieldValue('cap_rate', passDataT.cap_rate);
      const formattedTotalOperatingExpense = parseFloat(
        passDataT.total_operating_expense
      ).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      setFieldValue(
        'total_operating_expense',
        passDataT.total_operating_expense !== null
          ? '$' + formattedTotalOperatingExpense
          : ''
      );
      const formattedOperatingExpense = parseFloat(
        passDataT.operating_expense_psf
      ).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      setFieldValue(
        'operating_expense_psf',
        passDataT.operating_expense_psf !== 0
          ? '$' + formattedOperatingExpense
          : ''
      );
      const formattedListPrice = parseFloat(
        passDataT.list_price
      ).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      setFieldValue(
        'list_price',
        passDataT.list_price !== null ? '$' + formattedListPrice : ''
      );

      const formattedTotalConcessions = parseFloat(
        passDataT.total_concessions
      ).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      setFieldValue(
        'total_concessions',
        passDataT.total_concessions !== null
          ? '$' + formattedTotalConcessions
          : ''
      );

      setFieldValue('financing', passDataT.financing);
      setFieldValue('marketing_time', passDataT.marketing_time);
      const fomatedEstimatedLandValue = parseFloat(
        passDataT.est_land_value
      ).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      setFieldValue(
        'est_land_value',
        passDataT.est_land_value !== null ? '$' + fomatedEstimatedLandValue : ''
      );

      const formattedTotalEstimatedBuilding = parseFloat(
        passDataT.est_building_value
      ).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      setFieldValue(
        'est_building_value',
        passDataT.est_building_value !== null
          ? '$' + formattedTotalEstimatedBuilding
          : ''
      );
      setFieldValue('concessions', passDataT.concessions);
      setFieldValue('date_sold', formatDate(passDataT.date_sold));
      setFieldValue('date_list', passDataT.date_list);
    }
  }, [passDataT]);

  const dateListStr = values.date_list;
  const dateSoldStr = values.date_sold;
  const dateList: any = new Date(dateListStr);
  const dateSold: any = new Date(dateSoldStr);
  const differenceInMs: any = values.date_list !== null && dateSold - dateList;
  const differenceInDays = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));

  useEffect(() => {
    setFieldValue('days_on_market', differenceInDays);
  }, [differenceInDays]);

  const handleSaleStatus = (e: ChangeEvent<HTMLInputElement>) => {
    setFieldValue('sale_status', e.target.value);
  };

  const passData = (event: any) => {
    passBoolean(event);
  };

  return (
    <>
      <div style={{ fontFamily: 'montserrat-normal' }}>
        <Typography variant="h6" component="h5" className="text-lg font-bold">
          {ResidentialComponentHeaderEnum.TRANSACTION}
        </Typography>
        <div className="mt-[6px]">
          <Grid className="mt-2 items-end" container spacing={3}>
            <Grid item xs={6} xl={3} className="relative pt-2">
              <StyledField
                onKeyDown={(e: React.KeyboardEvent) => {
                  const event = e as React.KeyboardEvent<HTMLInputElement>;
                  const isBack = e.code === 'Backspace';
                  if (isBack) {
                    const inputElement = event.currentTarget;
                    const { selectionStart, selectionEnd } = inputElement;
                    const input = values.sale_price
                      .toString()
                      .replace(/[^\d]/g, ''); // remove any non-digit characters
                    if (
                      selectionStart === 0 &&
                      selectionEnd === inputElement.value.length
                    ) {
                      handleInputChange(handleChange, 'sale_price', '');
                      event.preventDefault();
                    } else if (input.length > 0) {
                      const newValue = input.slice(0, -1); // Remove last digit
                      const shiftedValue = parseInt(newValue, 10) / 100; // Shift decimal left by 1
                      handleInputChange(
                        handleChange,
                        'sale_price',
                        `$${shiftedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      );
                      event.preventDefault();
                    }
                  }
                }}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const input = sanitizeInputDollarSignComps1(e.target.value);
                  handleInputChange(handleChange, 'sale_price', input);
                }}
                value={values.sale_price}
                label={
                  <span className="relative">
                    {CreateCompsEnum.SALE_PRICE}
                    <span className="text-red-500 text-xs">*</span>
                  </span>
                }
                name="sale_price"
              />
              {setDataRequited && errors && !values?.sale_price && (
                <div className="text-red-500 text-[11px] absolute">
                  This field is required
                </div>
              )}
            </Grid>
            <Grid
              item
              xs={6}
              xl={3}
              className="pt-2 relative common-label-wrapper"
            >
              <DatePickerComp
                name="date_sold"
                style={{ width: '100%' }}
                label={
                  <span className="text-base">
                    {CreateCompsEnum.DATE_SOLD}
                    <span className="text-red-500">*</span>
                  </span>
                }
                value={
                  values.date_sold != null || values.date_sold != ''
                    ? moment(values.date_sold, [
                      moment.ISO_8601,
                      'MM/DD/YYYY',
                      'YYYY-MM-DD',
                      'YYYY-MM-DD HH:mm:ss',
                      'x', // Unix ms timestamp
                      'X', // Unix s timestamp
                    ])
                    : null
                }
                // value={values.close_date ? moment(values.close_date, 'MM/DD/YYYY') : null}
                onChange={(value: Date | null) => {
                  if (value) {
                    const formattedDate = moment(value).format('MM/DD/YYYY');
                    handleChange({
                      target: {
                        name: 'date_sold',
                        value: formattedDate,
                      },
                    });
                  } else {
                    handleChange({
                      target: {
                        name: 'date_sold',
                        value: null,
                      },
                    });
                  }
                }}
              />

              {setDataRequited && errors && !values.date_sold && (
                <div className="text-red-500 text-[11px] absolute">
                  This field is Required
                </div>
              )}
            </Grid>
            <Grid
              item
              xs={6}
              xl={3}
              className="pt-2 relative selectFixedHeight"
            >
              <SelectTextField
                style={{ fontSize: '22px' }}
                label={
                  <span className="text-customGray text-base relative top-[-1px]">
                    Sale Status
                  </span>
                }
                defaultValue={values.sale_status}
                value={values.sale_status}
                onChange={handleSaleStatus}
                options={saleStatusOptions}
                name="sale_status"
              ></SelectTextField>
            </Grid>
            <Grid item xs={6} xl={3} className="pt-2 relative">
              <StyledField
                label="List Price"
                name="list_price"
                onKeyDown={(e: React.KeyboardEvent) => {
                  const event = e as React.KeyboardEvent<HTMLInputElement>;
                  const isBack = e.code === 'Backspace';
                  if (isBack) {
                    const inputElement = event.currentTarget;
                    const { selectionStart, selectionEnd } = inputElement;
                    const input = values.list_price
                      .toString()
                      .replace(/[^\d]/g, ''); // remove any non-digit characters

                    if (
                      selectionStart === 0 &&
                      selectionEnd === inputElement.value.length
                    ) {
                      handleInputChange(handleChange, 'list_price', '');
                      event.preventDefault();
                    } else if (input.length > 0) {
                      const newValue = input.slice(0, -1); // Remove last digit
                      const shiftedValue = parseInt(newValue, 10) / 100; // Shift decimal left by 2
                      handleInputChange(
                        handleChange,
                        'list_price',
                        `$${shiftedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      );
                      event.preventDefault();
                    }
                  }
                }}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const input = sanitizeInputDollarSignComps1(e.target.value);
                  handleInputChange(handleChange, 'list_price', input);
                }}
                value={values.list_price || '$0.00'} // Display $0.00 if input is empty
              />
            </Grid>
          </Grid>
          {localStorage.getItem('activeType') === 'building_with_land' ? (
            <Grid container spacing={3} className="mt-2 items-end">
              <Grid item xs={6} xl={3} className="pt-2">
                <StyledField
                  label="CAP Rate"
                  name="cap_rate"
                  onKeyDown={(e: React.KeyboardEvent) => {
                    const event = e as React.KeyboardEvent<HTMLInputElement>;
                    const isBack = e.code === 'Backspace';

                    const { selectionStart, selectionEnd }: any = e.target;
                    const inputValue = values?.cap_rate?.toString() || '';

                    if (isBack) {
                      if (
                        selectionStart === 0 &&
                        selectionEnd >= inputValue.length
                      ) {
                        handleInputChange(handleChange, 'cap_rate', '');
                        event.preventDefault();
                      } else {
                        const inpArr = Array.from(inputValue);
                        inpArr.pop();
                        handleInputChange(
                          handleChange,
                          'cap_rate',
                          inpArr.join('')
                        );
                        event.preventDefault();
                      }
                    }
                  }}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const input = e.target.value;

                    const sanitizedInput = input.replace(/[%|,]/g, '');

                    if (/^\d*\.?\d{0,2}$/.test(sanitizedInput)) {
                      handleInputChange(
                        handleChange,
                        'cap_rate',
                        sanitizedInput
                      );
                    }
                  }}
                  // value={sanitizeInputPercentage(values.cap_rate)}
                  value={
                    values.cap_rate
                      ? formatPercentageInput(values.cap_rate)
                      : ''
                  }
                />
              </Grid>
              <Grid item xs={6} xl={3} className="pt-2">
                <StyledField
                  label="Total Operating Expense"
                  name="total_operating_expense"
                  onKeyDown={(e: React.KeyboardEvent) => {
                    const event = e as React.KeyboardEvent<HTMLInputElement>;
                    const isBack = e.code === 'Backspace';
                    if (isBack) {
                      const inputElement = event.currentTarget;
                      const { selectionStart, selectionEnd } = inputElement;
                      const input = values.total_operating_expense
                        .toString()
                        .replace(/[^\d]/g, ''); // Remove non-digit characters

                      if (
                        selectionStart === 0 &&
                        selectionEnd === inputElement.value.length
                      ) {
                        handleInputChange(
                          handleChange,
                          'total_operating_expense',
                          ''
                        );
                        event.preventDefault();
                      } else if (input.length > 0) {
                        const newValue = input.slice(0, -1); // Remove last digit
                        const shiftedValue = parseInt(newValue, 10) / 100; // Shift decimal left by 2
                        handleInputChange(
                          handleChange,
                          'total_operating_expense',
                          `$${shiftedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        );
                        event.preventDefault();
                      }
                    }
                  }}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const input = sanitizeInputDollarSignComps1(e.target.value);
                    handleInputChange(
                      handleChange,
                      'total_operating_expense',
                      input
                    );
                  }}
                  value={values.total_operating_expense || '$0.00'} // Show $0.00 when input is empty
                  placeholder="$0.00" // Optional: add a placeholder for better visibility
                />
              </Grid>
              <Grid item xs={6} xl={3} className="pt-2">
                <StyledField
                  label="Operating Expense(PSF)"
                  name="operating_expense_psf"
                  onKeyDown={(e: React.KeyboardEvent) => {
                    const event = e as React.KeyboardEvent<HTMLInputElement>;
                    const isBack = e.code === 'Backspace';
                    if (isBack) {
                      const inputElement = event.currentTarget;
                      const { selectionStart, selectionEnd } = inputElement;
                      const input = values.operating_expense_psf
                        .toString()
                        .replace(/[^\d]/g, ''); // Remove any non-digit characters

                      if (
                        selectionStart === 0 &&
                        selectionEnd === inputElement.value.length
                      ) {
                        handleInputChange(
                          handleChange,
                          'operating_expense_psf',
                          ''
                        );
                        event.preventDefault();
                      } else if (input.length > 0) {
                        const newValue = input.slice(0, -1); // Remove last digit
                        const shiftedValue = parseInt(newValue, 10) / 100; // Shift decimal left by 2
                        handleInputChange(
                          handleChange,
                          'operating_expense_psf',
                          `$${shiftedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        );
                        event.preventDefault();
                      }
                    }
                  }}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const input = sanitizeInputDollarSignComps1(e.target.value);
                    handleInputChange(
                      handleChange,
                      'operating_expense_psf',
                      input
                    );
                  }}
                  value={
                    values.operating_expense_psf === '$NaN'
                      ? '$0.00'
                      : values.operating_expense_psf || '$0.00'
                  }
                  placeholder="$0.00"
                />
              </Grid>
              <Grid item xs={6} xl={3} className="pt-2">
                <StyledField
                  label="Net Operating Income(NOI)"
                  name="net_operating_income"
                  onKeyDown={(e: React.KeyboardEvent) => {
                    const event = e as React.KeyboardEvent<HTMLInputElement>;
                    const isBack = e.code === 'Backspace';
                    if (isBack) {
                      const inputElement = event.currentTarget;
                      const { selectionStart, selectionEnd } = inputElement;
                      const input = values.net_operating_income
                        .toString()
                        .replace(/[^\d]/g, ''); // remove any non-digit characters
                      if (
                        selectionStart === 0 &&
                        selectionEnd === inputElement.value.length
                      ) {
                        handleInputChange(
                          handleChange,
                          'net_operating_income',
                          ''
                        );
                        event.preventDefault();
                      } else if (input.length > 0) {
                        const newValue = input.slice(0, -1); // Remove last digit
                        const shiftedValue = parseInt(newValue, 10) / 100; // Shift decimal left by 1
                        handleInputChange(
                          handleChange,
                          'net_operating_income',
                          `$${shiftedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        );
                        event.preventDefault();
                      }
                    }
                  }}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const input = sanitizeInputDollarSignComps1(e.target.value);
                    handleInputChange(
                      handleChange,
                      'net_operating_income',
                      input
                    );
                  }}
                  value={values.net_operating_income || '$0.00'}
                  placeholder="$0.00"
                />
              </Grid>
            </Grid>
          ) : null}

          <Grid container spacing={3} className="mt-2 items-end">
            <Grid item xs={6} xl={3} className="pt-2 common-label-wrapper">
              <DatePickerComp
                label={<p className="text-base">List Date</p>}
                name="date_list"
                style={{ width: '100%' }}
                value={
                  values.date_list != null || values.date_list != ''
                    ? moment(values.date_list, [
                      moment.ISO_8601,
                      'MM/DD/YYYY',
                      'YYYY-MM-DD',
                      'YYYY-MM-DD HH:mm:ss',
                      'x', // Unix ms timestamp
                      'X', // Unix s timestamp
                    ])
                    : null
                }
                // value={values.close_date ? moment(values.close_date, 'MM/DD/YYYY') : null}
                onChange={(value: Date | null) => {
                  if (value) {
                    const formattedDate = moment(value).format('MM/DD/YYYY');
                    handleChange({
                      target: {
                        name: 'date_list',
                        value: formattedDate,
                      },
                    });
                  } else {
                    handleChange({
                      target: {
                        name: 'date_list',
                        value: null,
                      },
                    });
                  }
                }}
              />
            </Grid>
            <Grid item xs={6} xl={3} className="pt-2">
              <StyledField
                label="Days on Market"
                name="days_on_market"
                value={
                  differenceInDays || differenceInDays == 0
                    ? differenceInDays
                    : ''
                }
                style={{
                  color: differenceInDays ? 'gray' : '',
                  borderBottomWidth: '1px',
                }}
                disabled
              />
            </Grid>
            <Grid item xs={6} xl={3} className="pt-2">
              <StyledField
                label="Total Concessions"
                name="total_concessions"
                onKeyDown={(e: React.KeyboardEvent) => {
                  const event = e as React.KeyboardEvent<HTMLInputElement>;
                  const isBack = e.code === 'Backspace';

                  if (isBack) {
                    const inputElement = event.currentTarget;
                    const { selectionStart, selectionEnd } = inputElement;

                    // Sanitize the input to only include digits
                    const input = values.total_concessions
                      .toString()
                      .replace(/[^\d]/g, '');

                    if (
                      selectionStart === 0 &&
                      selectionEnd === inputElement.value.length
                    ) {
                      // If entire input is selected, clear the field
                      handleInputChange(handleChange, 'total_concessions', '');
                      event.preventDefault();
                    } else if (input.length > 0) {
                      // Remove last digit
                      const newValue = input.slice(0, -1);
                      const shiftedValue = parseInt(newValue, 10) / 100; // Shift decimal left by 2

                      handleInputChange(
                        handleChange,
                        'total_concessions',
                        `$${shiftedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      );
                      event.preventDefault();
                    }
                  }
                }}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const input = sanitizeInputDollarSignComps(e.target.value);
                  handleInputChange(handleChange, 'total_concessions', input);
                }}
                value={values.total_concessions || '$0.00'} // Show $0.00 when input is empty
                placeholder="$0.00" // Optional: add a placeholder for better visibility
              />
            </Grid>
            <Grid item xs={6} xl={3} className="pt-2">
              <StyledField label="Financing" name="financing" />
            </Grid>
          </Grid>
          <Grid container spacing={3} className="mt-2 items-end">
            <Grid item xs={4} className="pt-2">
              <StyledField label="Marketing Time" name="marketing_time" />
            </Grid>
            <Grid item xs={4} className="pt-2">
              <StyledField
                label="Estimated Land Value"
                name="est_land_value"
                onKeyDown={(e: React.KeyboardEvent) => {
                  const event = e as React.KeyboardEvent<HTMLInputElement>;
                  const isBack = e.code === 'Backspace';
                  if (isBack) {
                    const inputElement = event.currentTarget;
                    const { selectionStart, selectionEnd } = inputElement;
                    const input = values.est_land_value
                      .toString()
                      .replace(/[^\d]/g, ''); // Remove any non-digit characters

                    if (
                      selectionStart === 0 &&
                      selectionEnd === inputElement.value.length
                    ) {
                      handleInputChange(handleChange, 'est_land_value', '');
                      event.preventDefault();
                    } else if (input.length > 0) {
                      const newValue = input.slice(0, -1); // Remove last digit
                      const shiftedValue = parseInt(newValue, 10) / 100; // Shift decimal left by 2
                      handleInputChange(
                        handleChange,
                        'est_land_value',
                        `$${shiftedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      );
                      event.preventDefault();
                    }
                  }
                }}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const input = sanitizeInputDollarSignComps1(e.target.value);
                  handleInputChange(handleChange, 'est_land_value', input);
                }}
                value={values.est_land_value || '$0.00'} // Show $0.00 when input is empty
                placeholder="$0.00" // Optional: add a placeholder for better visibility
              />
            </Grid>
            <Grid item xs={4} className="pt-2">
              <StyledField
                label="Building Residual"
                name="est_building_value"
                onKeyDown={(e: React.KeyboardEvent) => {
                  const event = e as React.KeyboardEvent<HTMLInputElement>;
                  const isBack = e.code === 'Backspace';
                  if (isBack) {
                    const inputElement = event.currentTarget;
                    const { selectionStart, selectionEnd } = inputElement;
                    const input = values.est_building_value
                      .toString()
                      .replace(/[^\d]/g, ''); // Remove any non-digit characters

                    if (
                      selectionStart === 0 &&
                      selectionEnd === inputElement.value.length
                    ) {
                      handleInputChange(handleChange, 'est_building_value', '');
                      event.preventDefault();
                    } else if (input.length > 0) {
                      const newValue = input.slice(0, -1); // Remove last digit
                      const shiftedValue = parseInt(newValue, 10) / 100; // Shift decimal left by 2
                      handleInputChange(
                        handleChange,
                        'est_building_value',
                        `$${shiftedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      );
                      event.preventDefault();
                    }
                  }
                }}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const input = sanitizeInputDollarSignComps1(e.target.value);
                  handleInputChange(handleChange, 'est_building_value', input);
                }}
                value={values.est_building_value || '$0.00'} // Show $0.00 when input is empty
                placeholder="$0.00" // Optional: add a placeholder for better visibility
              />
            </Grid>
          </Grid>
          <Grid container spacing={2} className="mt-2 items-end">
            <Grid item xs={12} className="pt-2">
              <TextAreaField name="concessions" label="Sales Notes" />
            </Grid>
          </Grid>
        </div>
        <div>
          <HarkenHr />
          <div className="pb-[40px]">
            <SellerBuyer
              passDataT={passDataT}
              passData={passData}
              newlyCreatedComp={newlyCreatedComp}
            />
          </div>
        </div>
      </div>
    </>
  );
};
