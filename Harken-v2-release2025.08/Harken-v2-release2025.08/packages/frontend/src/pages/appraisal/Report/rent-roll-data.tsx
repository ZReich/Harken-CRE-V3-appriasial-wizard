import { useGet } from '@/hook/useGet';
import { useSearchParams } from 'react-router-dom';

export default function RentRoleTable({ approachId }: any) {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  console.log('RentRoleTable Params:', { appraisalId: id, approachId });

  const { data } = useGet<any>({
    queryKey: `rent-approach-${approachId}`,
    endPoint: `appraisals/rent-roll-html?appraisalId=${id}&appraisalApproachId=${approachId}`,
  });

  return (
    <div>
      <div
        className="pb-2 previewWrapper"
        dangerouslySetInnerHTML={{ __html: data?.data?.data }}
      />
    </div>
  );
}
