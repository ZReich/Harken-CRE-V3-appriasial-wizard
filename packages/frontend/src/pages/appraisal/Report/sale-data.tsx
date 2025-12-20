import { useGet } from '@/hook/useGet';
import { useSearchParams } from 'react-router-dom';

export default function SaleTable({ approachId }: any) {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  const { data } = useGet<any>({
    queryKey: `sale-approach-${approachId}`,
    endPoint: `appraisals/sale-approach-html?appraisalId=${id}&appraisalApproachId=${approachId}`,
  });

  return (
    <>
      <div className="">
        <div
          className="pb-2 previewWrapper"
          dangerouslySetInnerHTML={{ __html: data?.data?.data }}
        />
      </div>
    </>
  );
}
