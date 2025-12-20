import { Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import EvaluationMenuOptions from '../../set-up/evaluation-menu-options';
import EvauationCostImprovementForm from './evaluation-cost-improvement-form';
import { useState } from 'react';
import { useGet } from '@/hook/useGet';
import { useNavigate, useSearchParams } from 'react-router-dom';

const EvaluationCreateCostImprovement = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [buildingSize, setBuildingSize] = useState('');
  const [totalWeightedValue, setTotalWeightedValue] = useState(0);
  const [updateEvalCostWeightInParent, setUpdateEvalCostWeightInParent] =
    useState(0);
  const [totalCostValuation, setTotalCostValuation] = useState<any>('');
  const [totalAdjustCost, setTotalAdjust] = useState<any>('');
  const id = searchParams.get('id');
  const costId = searchParams.get('costId');
  const [costName, setCostName] = useState('');

  const handleBuildingSizeChange = (size: string) => {
    setBuildingSize(size);
  };
  const handleTotalCostValuationChange = (totalCostVal: any) => {
    setTotalCostValuation(totalCostVal);
  };
  const handleTotalAdjustedCostChange = (totalAdjustCost: any) => {
    setTotalAdjust(totalAdjustCost);
  };
  useGet<any>({
    queryKey: `areaInfo`,
    endPoint: `evaluations/get/${id}`,
    config: {
      refetchOnWindowFocus: false,
      onSuccess(data: any) {
        const mapData = data?.data?.data?.evaluation_approaches;

        mapData &&
          mapData.map((item: any) => {
            if (item.id == costId) {
              setCostName(item.name);
            }
          });
      },
    },
  });
  const handleNextClick = () => {
    // This will trigger the form submission
    document
      .querySelector('form')
      ?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
  };

  const handleBackClick = () => {
    navigate(`/evaluation/cost-comps-map?id=${id}&costId=${costId}`);
  };
  console.log(
    'totalCostValuation + totalAdjustCost',
    totalCostValuation,
    'sdsdf',
    totalAdjustCost
  );
  return (
    <>
      <EvaluationMenuOptions
        totalaveragedadjustedpsfCost={buildingSize}
        totalCostValuation={totalCostValuation}
        finalResultCost={totalCostValuation}
        onNextClick={handleNextClick}
        onBackClick={handleBackClick}
        onUpdateEvalCostWeightChange={(value: any) => {
          setUpdateEvalCostWeightInParent(value);
        }}
        onTotalWeightedChange={(value: any) => {
          setTotalWeightedValue(value);
        }}
      >
        <div className="flex items-center justify-between h-[50px] w-[100%] xl:pl-[40px] border-0 border-b border-[#eee] border-solid xl:pr-[70px] px-[15px] map-header-sticky">
          <div>
            <Typography
              variant="h1"
              component="h2"
              className="text-xl font-bold uppercase"
            >
              COST IMPROVEMENTS <span>{costName ? `(${costName})` : ''}</span>
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
            <EvauationCostImprovementForm
              onBuildingSizeChange={handleBuildingSizeChange}
              totalWeightedValue={totalWeightedValue}
              updateEvalCostWeightInParent={updateEvalCostWeightInParent}
              onTotalCostValuationChange={handleTotalCostValuationChange}
              onTotalAdjustedCost={handleTotalAdjustedCostChange}
            />
          </div>
        </div>
      </EvaluationMenuOptions>
    </>
  );
};
export default EvaluationCreateCostImprovement;
