import { useGet } from '@/hook/useGet';
import { useSearchParams } from 'react-router-dom';

export default function LeaseTable({ approachId }: any) {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  const { data } = useGet<any>({
    queryKey: `lease-approach-${approachId}`,
    endPoint: `appraisals/lease-approach-html?appraisalId=${id}&appraisalApproachId=${approachId}`,
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
