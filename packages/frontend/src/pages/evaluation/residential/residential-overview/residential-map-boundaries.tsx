import CommonButton from '@/components/elements/button/Button';
import { Icons } from '@/components/icons';
import StyledField from '@/components/styles/StyleFieldEditComp';
import SelectTextField from '@/components/styles/select-input';
import { MapBoundariesEnum } from '@/pages/appraisal/overview/OverviewEnum';
import { AppraisalTrafficCountOptions } from '@/pages/appraisal/overview/SelectOption';
import { handleInputChange, sanitizeInputLandSize } from '@/utils/sanitize';
import { Button, Grid, Typography } from '@mui/material';
import { useFormikContext } from 'formik';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { EvaluationEnum } from '../../set-up/evaluation-setup-enums';
import { useEffect, useState } from 'react';

export const ResidentialMapBoundaries = ({ setValidationSchema }: any) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const { values, setFieldValue, handleChange, isValid, setTouched } =
    useFormikContext<any>();
  const setValidation = () => {
    if (!isValid) {
      toast.error(
        'There are required fields to be filled.Check them before you proceed.'
      );
    }
  };

  return (
    <div
      style={{
        width: '100%',
        marginTop: '10px',
        paddingBottom: '70px',
        marginBottom: '52px',
      }}
    >
      <Typography
        variant="h1"
        component="h2"
        className="text-lg font-bold mt-4"
      >
        {MapBoundariesEnum.MAP_BOUNDARIES}
      </Typography>
      <p className="mt-1 p-0 text-sm">
        <strong className="text font-bold">
          {MapBoundariesEnum.TRAFFIC_COUNTS}
        </strong>
        {MapBoundariesEnum.TRAFFIC_COUNTS_PARAGARAPH}
      </p>
      <Grid container spacing={3} className="mt-2 items-end">
        <Grid item xs={3} className='pt-2'>
          <StyledField
            name={MapBoundariesEnum.TRAFFIC_STREET_ADDRESS}
            label={MapBoundariesEnum.STREET_ADDRESS}
          />
        </Grid>
        <Grid className='pt-2 selectFixedHeight'
          item
          xs={values.traffic_count === MapBoundariesEnum.INPUT_VALUE ? 6 : 9}
        >
          <SelectTextField
            label={MapBoundariesEnum.TRAFFIC_COUNT_ADT}
            name={MapBoundariesEnum.TRAFFIC_COUNT}
            options={AppraisalTrafficCountOptions}
            onChange={(e) =>
              setFieldValue(MapBoundariesEnum.TRAFFIC_COUNT, e.target.value)
            }
            value={values.traffic_count}
          />
        </Grid>
        {values.traffic_count === MapBoundariesEnum.INPUT_VALUE ? (
          <Grid item xs={3} className='pt-2'>
            <StyledField
              label={MapBoundariesEnum.TRAFFIC_COUNT_ADT_VALUE}
              name={MapBoundariesEnum.TRAFFIC_INPUT}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const input = sanitizeInputLandSize(e.target.value);
                handleInputChange(
                  handleChange,
                  MapBoundariesEnum.TRAFFIC_INPUT,
                  input
                );
              }}
              value={values.traffic_input}
            />
          </Grid>
        ) : null}
      </Grid>
      <div className="flex gap-3 justify-center items-center fixed inset-x-0 bottom-0 bg-white py-5 z-10">
        <Button
          variant="contained"
          color="primary"
          size="small"
          className="appraisal-previous-button text-xs !p-0 text-white font-medium h-[40px]"
          onClick={() => navigate(`/update-evaluation/residential-set-up?id=${id}`)}
        >
          <Icons.ArrowBackIcon className="cursor-pointer text-sm" />
        </Button>
        <CommonButton
          variant="contained"
          color="primary"
          type="submit"
          onClick={() => {
            // submitForm();
            setValidationSchema(true);
            setValidation();
            setTouched(true as any);
          }}
          style={{
            fontSize: '14px',
            width: '300px',
          }}
        >
          {EvaluationEnum.SAVE_AND_CONTINUE}
          <Icons.ArrowForwardIcon className="cursor-pointer text-sm" />
        </CommonButton>
        {showScrollTop && (
          <Button
            id="backToTop"
            color='primary'
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{ fontSize: '24px', cursor: 'pointer', border: 'none', padding: '0px' }}
          >
            ↑
          </Button>
        )}
      </div>
    </div>
  );
};
