import { Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

import AppraisalMenu from '../set-up/appraisa-menu';
import CostImprovementSidebar from './CostImprovementSidebar';
import { useState } from 'react';
import { useGet } from '@/hook/useGet';
import { useSearchParams } from 'react-router-dom';

const CreateCostImprovement = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const costId = searchParams.get('costId');
  const [costName, setCostName] = useState('');
  useGet<any>({
    queryKey: `areaInfo`,
    endPoint: `appraisals/get/${id}`,
    config: {
      refetchOnWindowFocus: false,
      onSuccess(data: any) {
        const mapData = data?.data?.data?.appraisal_approaches;

        mapData &&
          mapData.map((item: any) => {
            if (item.id == costId) {
              setCostName(item.name);
            }
          });
      },
    },
  });
  return (
    <>
      <AppraisalMenu>
        <div className="flex items-center justify-between h-[50px] w-[100%] xl:pl-[40px] border-0 border-b border-[#eee] border-solid xl:pr-[70px] px-[15px] map-header-sticky">
          <div>
            <Typography
              variant="h1"
              component="h2"
              className="text-xl font-bold uppercase"
            >
              COST IMPROVEMENTS <span>({costName})</span>
            </Typography>
          </div>
          <div className=" flex items-center">
            <ErrorOutlineIcon className="pr-[10px]" />
            <span>Value of the improvements based on local market costs.</span>
          </div>
        </div>
        <div>
          <div className="flex flex-wrap space-x-1.5 xl:px-[60px] px-[15px]">
            {/* <div className="w-full h-[1px] bg-[#80808057]"></div> */}
            <CostImprovementSidebar />
          </div>
        </div>
      </AppraisalMenu>
    </>
  );
};
export default CreateCostImprovement;
