import { HarkenHr } from '@/components/harken-hr';
import StyledField from '@/components/styles/StyleFieldEditComp';
import { Grid, Typography } from '@mui/material';
import DatePickerComp from '@/components/date-picker';
import { useFormikContext } from 'formik';
import moment from 'moment';
// import { formatDate } from '@/utils/date-format';
import { AnalysisEnum } from '@/pages/appraisal/overview/OverviewEnum';

export const EvaluationAnalysis = () => {
  const { values, handleChange } = useFormikContext<any>();

  return (
    <>
      <div>
        <Typography
          variant="h1"
          component="h2"
          className="text-lg font-bold mt-5"
        >
          {AnalysisEnum.ANALYSIS}
        </Typography>
        <Grid container spacing={3} className="mt-2 items-end">
          <Grid item xs={6} xl={3} className="common-label-wrapper pt-2">
            <DatePickerComp
              label={AnalysisEnum.DATE_OF_INSPECTION}
              name={AnalysisEnum.DATE_OF_ANALYSIS}
              // value={
              //   values.date_of_analysis
              //     ? moment(values.date_of_analysis)
              //     : moment()
              // }
            value={values.date_of_analysis ? moment(values.date_of_analysis, [
              moment.ISO_8601,
              'MM/DD/YYYY',
              'YYYY-MM-DD',
              'YYYY-MM-DD HH:mm:ss',
              'x', // Unix ms timestamp
              'X', // Unix s timestamp
            ]) : null}
              
              onChange={(value: Date | null) => {
                if (value) {
                  const formattedDate = moment(value).format('MM/DD/YYYY');
                  handleChange({
                    target: {
                      name: AnalysisEnum.DATE_OF_ANALYSIS,
                      value: formattedDate,
                    },
                  });
                }
              }}
            />
          </Grid>
          <Grid item xs={6} xl={3} className="common-label-wrapper pt-2">
            <DatePickerComp
              label={AnalysisEnum.EFFECTIVE_DATE}
              name={AnalysisEnum.EFFECTIVE_DATE_NAME}
              // value={
              //   values.effective_date ? moment(values.effective_date) : moment()
              // }
              value={values.effective_date ? moment(values.effective_date, [
                moment.ISO_8601,
                'MM/DD/YYYY',
                'YYYY-MM-DD',
                'YYYY-MM-DD HH:mm:ss',
                'x', // Unix ms timestamp
                'X', // Unix s timestamp
              ]) : null}
              onChange={(value: Date | null) => {
                if (value) {
                  const formattedDate = moment(value).format('MM/DD/YYYY');
                  handleChange({
                    target: {
                      name: AnalysisEnum.EFFECTIVE_DATE_NAME,
                      value: formattedDate,
                    },
                  });
                }
              }}
            />
          </Grid>
          <Grid item xs={6} xl={3} className="mt-[-11px] pt-2">
            <StyledField
              label={AnalysisEnum.INSPECTOR_NAME}
              name={AnalysisEnum.INSPECTOR_NAME_NAME}
            />
          </Grid>
          <Grid item xs={6} xl={3} className="common-label-wrapper pt-2">
            <DatePickerComp
              label={AnalysisEnum.REPORT_DATE}
              name={AnalysisEnum.REPORT_DATE_NAME}
              // value={values.report_date ? moment(values.report_date) : moment()}
               value={values.report_date ? moment(values.report_date, [
                moment.ISO_8601,
                'MM/DD/YYYY',
                'YYYY-MM-DD',
                'YYYY-MM-DD HH:mm:ss',
                'x', // Unix ms timestamp
                'X', // Unix s timestamp
              ]) : null}
              onChange={(value: Date | null) => {
                if (value) {
                  const formattedDate = moment(value).format('MM/DD/YYYY');
                  handleChange({
                    target: {
                      name: AnalysisEnum.REPORT_DATE_NAME,
                      value: formattedDate,
                    },
                  });
                }
              }}
            />
          </Grid>
        </Grid>
        <HarkenHr />
      </div>
    </>
  );
};
