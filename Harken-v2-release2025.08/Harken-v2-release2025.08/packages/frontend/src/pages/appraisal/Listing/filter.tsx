import { Formik, Form } from 'formik';
import { mapFilterValidation } from '@/utils/validation-Schema';
import { Box, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import StyledFieldFilter from '@/components/styles/styledFiledFilter';
import { CustomSelect } from '@/components/custom-select';
import { selectTypeJson } from '@/pages/comps/comp-form/fakeJson';
import CommonButton from '@/components/elements/button/Button';
import DatePickerComp from '@/components/date-picker';

import { usa_state } from '@/pages/comps/comp-form/fakeJson';
import { useGet } from '@/hook/useGet';
import MultipleSelectCheckmarks from '@/components/multi-select';
import { formatDate } from '@/utils/date-format';
import { filterAppraisalListInitialValues } from '@/pages/comps/Listing/filter-initial-values';
import { SelectChangeEvent } from '@mui/material/Select';
import crossImage from '../../../images/cross.png';
import { FilterComp } from './interface/appraisal-listing';
import moment from 'moment';
import { FilterListingEnum } from '@/pages/comps/enum/CompsEnum';
import { AppraisalListingEnum } from '../Enum/AppraisalEnum';
import SelectTextField from '@/components/styles/select-input';

interface MapFilterProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onApplyFilter: (filters: FilterComp) => void;
}

interface FormData {
  dateOfAnalysisFrom: any;
  dateOfAnalysisTo: any;
  compType: string;
  streetAddress: string;
  formUpdate: boolean;
  state: string;
}

interface City {
  city: string;
}

interface CityResponse {
  data: {
    data: {
      allCities: City[];
    };
  };
}

const MapFilterAppraisal: React.FC<MapFilterProps> = ({
  isOpen,
  setIsOpen,
  onApplyFilter,
}) => {
  const isButtonVisible = FilterListingEnum.MAP_SEARCH_FILTER;
  // const usaStateOptions = Object.entries(usa_state[0]).map(
  //   ([value, label]) => ({ value, label })
  // );
  const usaStateOptions = [
    { value: '', label: '--Select State--' },
    ...Object.entries(usa_state[0]).map(([value, label]) => ({ value, label })),
  ];

  const [state, setState] = useState('');
  const [compType, setSelectType] = useState('');
  const [selectedCities, setSelectedCities] = useState<any[]>([]);

  useEffect(() => {
    setSelectedCities([]);
  }, [state]);

  const handleCityChange = (selectedCities: City[]) => {
    const cityNames: string[] = selectedCities.map((cityObj) => cityObj.city);
    setSelectedCities(cityNames);
  };

  const handleSubmit = async (value: FormData | any) => {
    setIsOpen(false);

    const params: Omit<FilterComp, 'search'> = {
      dateOfAnalysisTo:
        value.dateOfAnalysisTo === 'NaN/NaN/NaN' ? '' : value.dateOfAnalysisTo,
      dateOfAnalysisFrom:
        value.dateOfAnalysisFrom === 'NaN/NaN/NaN'
          ? ''
          : value.dateOfAnalysisFrom,
      compType: compType,
      streetAddress: value.streetAddress,
      city: selectedCities,
      state: value.state,
    };
    onApplyFilter(params);
  };

  const { data } = useGet<CityResponse>({
    queryKey: `city/${state}`,
    endPoint: `comps/cities?state=${state}`,
    config: { enabled: Boolean(state), refetchOnWindowFocus: false },
  });

  const usaCity =
    (data && data.data && data.data.data && data.data.data.allCities) || [];

  const closeNav = () => {
    setIsOpen(false);
  };
  const clearFields = (resetForm: any) => {
    setSelectType('');
    setState('');
    resetForm();
  };

  return (
    <>
      <Box
        className={`element overlay z-50 backdrop-brightness-75 pb-10  justify-end items-end flex top-0 right-0 fixed overflow-x-hidden min-h-full transition-width duration-500 ${isOpen ? 'open' : ''}`}
      >
        <Box className="overlay-content rounded-lg max-w-[655px] w-full relative flex flex-col bg-white shadow-zinc-900">
          <Formik
            initialValues={filterAppraisalListInitialValues}
            validationSchema={mapFilterValidation}
            onSubmit={handleSubmit}
          >
            {({ handleChange, values, setFieldValue, resetForm }) => {
              return (
                <>
                  <Form>
                    <Box className="rounded relative flex items-center p-4 bg-[#E7F6FA]">
                      <Box className="advance-Filter text-customDeeperSkyBlue font-bold text-base">
                        {AppraisalListingEnum.ADVANCED_FILTER}
                      </Box>
                      <div className="flex items-center m-auto"></div>

                      <Box
                        onClick={closeNav}
                        className="cursor-pointer flex items-center"
                      >
                        <img
                          src={crossImage}
                          alt="crossImage"
                          className="h-[14px] w-[22px] px-1"
                        />
                      </Box>
                    </Box>

                    <div className="p-5" style={{ marginBottom: '200px' }}>
                      <div className="grid grid-cols-3 gap-5">
                        <Box className="text-left font-semibold col-span-3 text-sm">
                          {AppraisalListingEnum.SEARCH_TYPE}
                        </Box>
                        <div className="w-full">
                          <CustomSelect
                            label={AppraisalListingEnum.SELECT_TYPE}
                            options={selectTypeJson}
                            value={compType}
                            onChange={(e: SelectChangeEvent<string>) => {
                              setSelectType(e.target.value as string);
                              setFieldValue('compType', e.target.value);
                            }}
                          />
                        </div>
                        <Box className="text-left font-semibold col-span-3 text-sm">
                          {AppraisalListingEnum.LOCATION}
                        </Box>
                        <div className="w-full mt-1">
                          {/* <CustomSelect
                            label={AppraisalListingEnum.STATE}
                            options={usaStateOptions}
                            value={state}
                            onChange={(e: SelectChangeEvent<string>) => {
                              setState(e.target.value as string);
                              setFieldValue('state', e.target.value);
                            }}
                          /> */}
                          <SelectTextField
                            options={usaStateOptions}
                            label="State"
                            name="state"
                            defaultValue={state || ''} // Ensure `state` is used and defaults to '' for "Select All" placeholder
                            onChange={(e: SelectChangeEvent<string>) => {
                              const newValue = e.target.value as string;
                              setState(newValue); // Update local state
                              setFieldValue('state', newValue); // Update form field
                            }}
                          />
                        </div>
                        <div className="w-full">
                          <MultipleSelectCheckmarks
                            onChange={handleCityChange}
                            usaCity={usaCity}
                            label={''}
                            appraisalData={undefined}
                          />
                        </div>
                        <div className="w-full ">
                          <StyledFieldFilter
                            label={AppraisalListingEnum.STREET_ADDRESS}
                            name="streetAddress"
                            type="text"
                            onChange={(e: SelectChangeEvent<string>) => {
                              setFieldValue('streetAddress', e.target.value);
                            }}
                            value={values.streetAddress}
                          />
                        </div>
                        <Box className="text-left font-semibold col-span-3 text-sm py-3">
                          {AppraisalListingEnum.ADDITIONAL_CRITERIA}
                        </Box>
                        <DatePickerComp
                          label={
                            <p className="text-base">
                              {AppraisalListingEnum.SALE_DATE_START}
                            </p>
                          }
                          name="dateOfAnalysisFrom"
                          onChange={(value: Date | null) => {
                            if (value) {
                              const formattedDate = formatDate(value);
                              handleChange({
                                target: {
                                  name: 'dateOfAnalysisFrom',
                                  value: formattedDate,
                                },
                              });
                            }
                          }}
                          value={
                            values.dateOfAnalysisFrom
                              ? moment(values.dateOfAnalysisFrom)
                              : null
                          }
                        />
                        <DatePickerComp
                          label={
                            <p className="text-base">
                              {AppraisalListingEnum.SALE_DATE_END}
                            </p>
                          }
                          name="dateOfAnalysisTo"
                          onChange={(value: Date | null) => {
                            if (value) {
                              const formattedDate = formatDate(value);
                              handleChange({
                                target: {
                                  name: 'dateOfAnalysisTo',
                                  value: formattedDate,
                                },
                              });
                            }
                          }}
                          value={
                            values.dateOfAnalysisTo
                              ? moment(values.dateOfAnalysisTo)
                              : null
                          }
                        />
                      </div>
                      <Box className="mt-7 flex justify-between items-center">
                        <Box className="flex justify-end">
                          <Button
                            variant="outlined"
                            color="error"
                            className="p-2 px-3"
                            onClick={() => clearFields(resetForm)}
                          >
                            {AppraisalListingEnum.RESET}
                          </Button>
                        </Box>
                        <div>
                          <CommonButton
                            variant="contained"
                            type="submit"
                            isButtonVisible={isButtonVisible}
                          >
                            {FilterListingEnum.APPLY}
                          </CommonButton>
                        </div>
                      </Box>
                    </div>
                  </Form>
                </>
              );
            }}
          </Formik>
        </Box>
      </Box>
    </>
  );
};

export default MapFilterAppraisal;
