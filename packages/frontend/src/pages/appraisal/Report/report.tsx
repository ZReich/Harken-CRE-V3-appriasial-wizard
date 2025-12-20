import { Grid } from '@mui/material';
import SelectTextField from '@/components/styles/select-input';
import { useState, useEffect } from 'react';
import { useGet } from '@/hook/useGet';
import { templateTypeOptions } from '@/pages/comps/create-comp/SelectOption';
import AppraisalMenu from '../set-up/appraisa-menu';
import { useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import { useMutate, RequestType } from '@/hook/useMutate';

import CommonButton from '@/components/elements/button/Button';
import axios from 'axios';
import { AppraisalEnum } from '../set-up/setUpEnum';
import { Icons } from '@/components/icons';

const AppraisalReport = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  const [tempTypeOptions, setTempTypeOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [chooseTemplate, setChooseTemplate] = useState<string>('');
  const [bool, setBool] = useState(false);
  const [selectedOption, setSelectedOption] = useState('select');
  const [errorMessage, setErrorMessage] = useState('');
  const [secondDropdownError, setSecondDropdownError] = useState('');

  const { data } = useGet<any>({
    queryKey: `areaInfo`,
    endPoint: `/template/dropdown-list/`,
    config: { refetchOnWindowFocus: false },
  });

  useEffect(() => {
    if (selectedOption) {
      if (
        data &&
        data.data &&
        Array.isArray(data.data.data) &&
        data.data.data.length > 0
      ) {
        const options = data.data.data.map(
          (template: { id: number; name: string }) => ({
            value: template.id.toString(),
            label: template.name,
          })
        );

        setTempTypeOptions(options);
      }
    }
  }, [data, selectedOption]);

  const mutation = useMutate<any, any>({
    queryKey: 'template/create',
    endPoint: 'template/create',
    requestType: RequestType.POST,
  });

  const mutationLink = useMutate<any, any>({
    queryKey: `appraisals/link-template`,
    endPoint: 'appraisals/link-template',
    requestType: RequestType.POST,
  });

  const createTemplate = async () => {
    if (selectedOption === 'select') {
      setErrorMessage('Please select a valid option.');
      return;
    }

    setErrorMessage('');

    if (selectedOption === 'create') {
      if (!chooseTemplate) {
        setSecondDropdownError('Please select an option first.');
        return;
      }

      setSecondDropdownError('');
      const params = {
        appraisal_id: Number(id),
        template_id: Number(chooseTemplate),
      };

      try {
        const res = await mutationLink.mutateAsync(params);
        setBool(true);
        const template_id = res?.data?.data?.id;
        navigate(`/report-template?id=${id}&template_id=${template_id}`);
      } catch (error) {
        setErrorMessage('Template already exists for this appraisal id');
      }
    } else if (selectedOption === 'scratch') {
      const sendData = async () => {
        const data = {
          appraisal_id: id,
          parent_id: null,
        };

        try {
          const response = await mutation.mutateAsync(data);
          const template_id = response?.data?.data?.id;
          const id_am = id;
          sessionStorage.setItem('hasSaleType', 'true');
          sessionStorage.setItem('hasIncomeApproch', 'true');
          sessionStorage.setItem('hasCostApproch', 'true');
          navigate(`/report-template?id=${id}&template_id=${template_id}`, {
            state: { id_am },
          });
        } catch (error) {
          setErrorMessage('Template already exists for this appraisal id');
        }
      };

      sendData();
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        await axios.get(`/template/report-template/${id}`);
      } catch (error) {
        console.error('Error fetching template data', error);
      }
    };

    if (bool) {
      fetchData();
    }
  }, [bool, id]);

  return (
    <>
      <AppraisalMenu>
        <div className="text-xl py-5 xl:pl-9 pl-1 font-bold mx-5">REPORT</div>

        <Grid container spacing={3}>
          <Grid item xs={5}>
            <div className="xl:pl-[89px] pl-[30px] pt-[70px]">
              <p className="pb-6 text-customGray">
                Here are some steps you can follow while adding Sections and
                Sub-sections:
              </p>
              <ol className="custom-ordered-list pl-4 text-customBlue text-base font-medium">
                <li className="py-4">
                  Click on the <b>"+"</b> Icon to create the new section for the
                  template.
                </li>
                <li className="py-4">
                  Once the Section is created, you can add multiple components
                  like Sub-section, Text area, Images, Maps & Approaches for the
                  particular section.
                </li>
                <li className="py-4">
                  Add the further Sections from the left side bar.
                </li>
                <li className="py-4">
                  You can delete the entire Section as well as Sub-sections by
                  clicking on the <b>Cross</b> or <b>Delete</b> icon.
                </li>
              </ol>
            </div>
          </Grid>
          <Grid item xs={1}></Grid>
          <Grid item xs={4} className="mt-[60px]">
            <SelectTextField
              options={templateTypeOptions}
              name="comparison_basis"
              value={selectedOption}
              onChange={(event) => {
                setSelectedOption(event.target.value);
                setErrorMessage('');
              }}
              label={
                <span className="font-normal text-customGray">
                  How do you want to add template?
                </span>
              }
            />
            {errorMessage && (
              <p style={{ color: 'red', marginTop: '8px' }}>{errorMessage}</p>
            )}

            {selectedOption === 'create' && (
              <div className="mt-9">
                <SelectTextField
                  options={tempTypeOptions}
                  name="comparison"
                  value={chooseTemplate}
                  onChange={(event) => {
                    setChooseTemplate(event.target.value);
                    setSecondDropdownError(''); // Clear the error message when an option is selected
                  }}
                  label={
                    <span className="font-normal text-customGray">
                      Choose Template
                    </span>
                  }
                />
                {secondDropdownError && (
                  <p style={{ color: 'red', marginTop: '8px' }}>
                    {secondDropdownError}
                  </p>
                )}
              </div>
            )}
            <div className="flex justify-center mt-3">
              <CommonButton
                variant="contained"
                color="primary"
                className="bg-customBlue"
                style={{
                  fontSize: '14px',
                  width: '300px',
                }}
                onClick={createTemplate}
              >
                {AppraisalEnum.SAVE_AND_CONTINUE}
                <Icons.ArrowForwardIcon className="cursor-pointer text-sm" />
              </CommonButton>
            </div>
          </Grid>
          <Grid item xs={2}></Grid>
        </Grid>
      </AppraisalMenu>
    </>
  );
};

export default AppraisalReport;
