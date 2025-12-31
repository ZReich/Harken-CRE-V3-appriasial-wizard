import { useGet } from '@/hook/useGet';
import { useSearchParams } from 'react-router-dom';

export default function IncomeApproachTable({ approachId }: any) {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  const { data } = useGet<any>({
    queryKey: `/income-approach-html-${approachId}`,
    endPoint: `appraisals/income-approach-html?appraisalId=${id}&appraisalApproachId=${approachId}`,
  });

  return (
    <>
      <div className="">
        <div
          className="pt-2 previewWrapper"
          dangerouslySetInnerHTML={{ __html: data?.data?.data }}
        />
      </div>
    </>
  );
}
