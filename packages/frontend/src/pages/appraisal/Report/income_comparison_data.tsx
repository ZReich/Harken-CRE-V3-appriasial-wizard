import { useGet } from '@/hook/useGet';
import { useSearchParams } from 'react-router-dom';
import { sanitizeHtml } from '@/utils/sanitizeHtml';

export default function IncomeComparisonTable() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  const { data } = useGet<any>({
    queryKey: `income-comparison-${id}`,
    endPoint: `appraisals/income-comparison-html?appraisalId=${id}`,
  });

  return (
    <>
      <div className="">
        <div
          className="pb-2 previewWrapper"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(data?.data?.data) }}
        />
      </div>
    </>
  );
}
