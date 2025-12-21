import { Formik, Form } from 'formik';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGet } from '@/hook/useGet';
import EvaluationLandValuationApproach from './evaluation-land-valuation-approach';

const EvaluationLandValuationApproachForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const landId = searchParams.get('landId');

  const [initialTableData, setInitialTableData] = useState<any[]>([]);

  // Fetch evaluation data to pre-populate
  const { data: evaluationData } = useGet<any>({
    queryKey: `evaluations/get-${id}`,
    endPoint: `evaluations/get/${id}`,
    config: {
      enabled: Boolean(id),
      refetchOnWindowFocus: false,
    },
  });

  return (
    <Formik
      enableReinitialize
      initialValues={{
        tableData: initialTableData,
        operatingExpenses: [],
        landCompQualitativeAdjustment: [],
        appraisalSpecificAdjustment: [],
      }}
      onSubmit={() => {
        // Form submission is handled in the child component
      }}
    >
      {() => (
        <Form>
          <EvaluationLandValuationApproach />
        </Form>
      )}
    </Formik>
  );
};

export default EvaluationLandValuationApproachForm;
