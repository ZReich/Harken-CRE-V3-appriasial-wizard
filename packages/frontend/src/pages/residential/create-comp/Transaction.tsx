import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import StyledField from '@/components/styles/StyleFieldEditComp';
import { HarkenHr } from '@/components/harken-hr';
import DatePickerComp from '@/components/date-picker';
import StarIcon from '@mui/icons-material/Star';
import SelectTextField from '@/components/styles/select-input';
import { FormikErrors, useFormikContext } from 'formik';
import { useEffect, useState } from 'react';
import SellerBuyer from './SellerBuyer';
import { saleStatusOptions } from '@/pages/comps/create-comp/SelectOption';
import { formatDate } from '@/utils/date-format';
import {
  handleInputChange,
  sanitizeInputDollarSignComps,
} from '@/utils/sanitize';
import { ResidentialCreateComp } from '@/components/interface/residential-create-comp';
import moment from 'moment';
import {
  ResidentialComponentHeaderEnum,
  TransactionResidentialComp,
} from '../enum/ResidentialEnum';

export const Transaction = ({
  setDataRequited,
  passBoolean,
  updateData,
  newlyCreatedComp,
}: any) => {
  const { handleChange, values, setFieldValue, errors } =
    useFormikContext<ResidentialCreateComp>();
  const [datebool, setDatebool] = useState(false);
  useEffect(() => {
    if (updateData?.id) {
      const formattedSalePrice = parseFloat(
        updateData.sale_price
      ).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      setFieldValue(
        TransactionResidentialComp.SALE_PRICE_NAME,
        '$' + formattedSalePrice
      );
      setFieldValue(
        TransactionResidentialComp.DATE_SOLD_NAME,
        formatDate(updateData.date_sold)
      );
      setFieldValue(
        TransactionResidentialComp.SALE_STATUS_NAME,
        updateData.sale_status
      );
      const formattedListPrice = parseFloat(
        updateData.list_price
      ).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      setFieldValue(
        TransactionResidentialComp.LIST_PRICE_NAME,
        updateData.list_price !== null ? '$' + formattedListPrice : ''
      );
      setFieldValue(
        TransactionResidentialComp.DAYS_ON_MARKET_NAME,
        updateData.days_on_market
      );
      const formattedTotalConcessions = parseFloat(
        updateData.total_concessions
      ).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      setFieldValue(
        TransactionResidentialComp.TOTAL_CONCESSIONS_NAME,
        updateData.total_concessions !== null
          ? '$' + formattedTotalConcessions
          : ''
      );
      setFieldValue(TransactionResidentialComp.DATE_LIST, updateData.date_list);
    }
  }, [updateData]);

  const dateListStr: any = values.date_list;
  const dateSoldStr = values.date_sold;
  const dateList: any = new Date(dateListStr);
  const dateSold: any = new Date(dateSoldStr);
  const differenceInMs = dateSold - dateList;
  const differenceInDays = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));

  useEffect(() => {
    if (datebool) {
      setFieldValue(
        TransactionResidentialComp.DAYS_ON_MARKET_NAME,
        differenceInDays
      );
    }
  }, [differenceInDays]);

  const passData = (event: any) => {
    passBoolean(event);
  };

  return (
    <>
      <div style={{ fontFamily: 'montserrat-normal' }}>
        <Typography variant="h6" component="h5" className="text-lg font-bold">
          {ResidentialComponentHeaderEnum.TRANSACTION}
        </Typography>
        <Grid container spacing={2} className="mt-[25px] items-end">
          <Grid item xs={4} className="">
            <StyledField
              label={
                <span className="relative">
                  {TransactionResidentialComp.SALE_PRICE}
                  <StarIcon className="absolute text-[6px] text-red-500 right-[-8px] top-1" />
                </span>
              }
              name={TransactionResidentialComp.SALE_PRICE_NAME}
              onKeyDown={(e: React.KeyboardEvent) => {
                const isBack = e.code === 'Backspace';
                const event = e as React.KeyboardEvent<HTMLInputElement>;

                if (isBack) {
                  const inputElement = event.currentTarget;
                  const { selectionStart, selectionEnd }: any = inputElement;
                  if (
                    selectionStart === 0 &&
                    selectionEnd === inputElement.value.length
                  ) {
                    handleInputChange(
                      handleChange,
                      TransactionResidentialComp.SALE_PRICE,
                      ''
                    );
                    event.preventDefault();
                  } else {
                    const inputValue = values.sale_price.toString();
                    let newValue = inputValue;
                    if (selectionStart === selectionEnd) {
                      const beforeCursor = inputValue.slice(
                        0,
                        selectionStart - 1
                      );
                      const afterCursor = inputValue.slice(selectionStart);

                      newValue = beforeCursor + afterCursor;
                    }
                    newValue = sanitizeInputDollarSignComps(newValue);

                    handleInputChange(
                      handleChange,
                      TransactionResidentialComp.SALE_PRICE_NAME,
                      newValue || ''
                    );

                    event.preventDefault();
                  }
                }
              }}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const input = sanitizeInputDollarSignComps(e.target.value);
                handleInputChange(
                  handleChange,
                  TransactionResidentialComp.SALE_PRICE_NAME,
                  input
                );
              }}
              value={values.sale_price}
            />
          </Grid>

          <Grid item xs={4} className="pt-[8px] relative common-label-wrapper">
            <DatePickerComp
              label={
                <p className="text-base relative">
                  {TransactionResidentialComp.DATE_SOLD}
                  <span className="text-red-500"> *</span>
                </p>
              }
              name={TransactionResidentialComp.DATE_SOLD_NAME}
              value={moment(values.date_sold)}
              onChange={(value: Date | null) => {
                setDatebool(true);
                if (value) {
                  const formattedDate = formatDate(value);
                  handleChange({
                    target: {
                      name: TransactionResidentialComp.DATE_SOLD_NAME,
                      value: formattedDate,
                    },
                  });
                } else {
                  handleChange({
                    target: {
                      name: TransactionResidentialComp.DATE_SOLD_NAME,
                      value: '',
                    },
                  });
                }
              }}
            />

            {setDataRequited && errors && (
              <div className="text-red-500 text-[11px] absolute">
                {errors?.date_sold as FormikErrors<string>}
              </div>
            )}
          </Grid>
          <Grid item xs={4} className="selectFixedHeight">
            <SelectTextField
              label={
                <span className="text-customGray">
                  {TransactionResidentialComp.SALE_STATUS}
                </span>
              }
              name={TransactionResidentialComp.SALE_STATUS_NAME}
              options={saleStatusOptions}
              onChange={(e) =>
                setFieldValue(
                  TransactionResidentialComp.SALE_STATUS_NAME,
                  e.target.value
                )
              }
              value={values.sale_status}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2} className="mt-[20px] items-end">
          <Grid item xs={6}>
            <StyledField
              label={
                <span className="relative">
                  {TransactionResidentialComp.LIST_PRICE}
                </span>
              }
              name={TransactionResidentialComp.LIST_PRICE_NAME}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const input = sanitizeInputDollarSignComps(e.target.value);
                handleInputChange(
                  handleChange,
                  TransactionResidentialComp.LIST_PRICE_NAME,
                  input
                );
              }}
              value={values.list_price}
            />
          </Grid>
          <Grid
            item
            xs={6}
            className="pt-[12px] datepickerwrapper common-label-wrapper"
          >
            <DatePickerComp
              label={<p>{TransactionResidentialComp.LIST_DATE}</p>}
              name={TransactionResidentialComp.DATE_LIST}
              value={moment(values.date_list)}
              onChange={(value: Date | null) => {
                setDatebool(true);
                if (value) {
                  const formattedDate = formatDate(value);
                  handleChange({
                    target: {
                      name: TransactionResidentialComp.DATE_LIST,
                      value: formattedDate,
                    },
                  });
                } else {
                  handleChange({
                    target: {
                      name: TransactionResidentialComp.DATE_LIST,
                      value: '',
                    },
                  });
                }
              }}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2} className="mt-[20px] items-end">
          <Grid item xs={6}>
            <StyledField
              label={TransactionResidentialComp.DAYS_ON_MARKET}
              name={TransactionResidentialComp.DAYS_ON_MARKET_NAME}
              value={
                values.days_on_market || values.days_on_market == 0
                  ? values.days_on_market
                  : ''
              }
              style={{
                color: differenceInDays ? 'gray' : '',
                borderBottomWidth: '1px',
              }}
              disabled
            />
          </Grid>
          <Grid item xs={6}>
            <StyledField
              label={TransactionResidentialComp.TOTAL_CONCESSIONS}
              name={TransactionResidentialComp.TOTAL_CONCESSIONS_NAME}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const input = sanitizeInputDollarSignComps(e.target.value);
                handleInputChange(
                  handleChange,
                  TransactionResidentialComp.TOTAL_CONCESSIONS_NAME,
                  input
                );
              }}
              value={values.total_concessions}
            />
          </Grid>
        </Grid>
        <div>
          <HarkenHr />
          <div className="pb-[40px]">
            <SellerBuyer
              updateData={updateData}
              passData={passData}
              newlyCreatedComp={newlyCreatedComp}
            />
          </div>
        </div>
      </div>
    </>
  );
};
