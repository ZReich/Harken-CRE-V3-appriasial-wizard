import { Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ResidentialMenuOptions from '@/pages/evaluation/set-up/residential-menu-option';
import ResidentialCostImprovementForm from './residential-cost-improvement-form';
import { useState } from 'react';
import { useGet } from '@/hook/useGet';
import { useNavigate, useSearchParams } from 'react-router-dom';

const ResidentialCreateCostImprovement = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const id = searchParams.get('id');
  const costId = searchParams.get('costId');
  const [costName, setCostName] = useState('');
  const [buildingSize, setBuildingSize] = useState('');
  const [totalCostValuation, setTotalCostValuation] = useState<any>('');
  const [totalAdjustCost, setTotalAdjust] = useState<any>('');
  const [updateEvalCostWeightInParent, setUpdateEvalCostWeightInParent] =
    useState(0);
  const [totalWeightedValue, setTotalWeightedValue] = useState(0);

  // Callback function to receive building size from child component
  const handleBuildingSizeChange = (size: string) => {
    setBuildingSize(size);
  };
  const handleTotalCostValuationChange = (totalCostVal: any) => {
    setTotalCostValuation(totalCostVal);
  };
  const handleTotalAdjustedCostChange = (totalAdjustCost: any) => {
    setTotalAdjust(totalAdjustCost);
  };
  console.log('Building size in parent:', totalAdjustCost);
  useGet<any>({
    queryKey: `areaInfo`,
    endPoint: `res-evaluations/get/${id}`,
    config: {
      refetchOnWindowFocus: false,
      onSuccess(data: any) {
        const mapData = data?.data?.data?.res_evaluation_scenarios;

        if (mapData.length > 1) {
          mapData &&
            mapData.map((item: any) => {
              if (item.id == costId) {
                setCostName(item.name);
              }
            });
        }
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
    navigate(
      `/residential/evaluation/cost-comps-map?id=${id}&costId=${costId}`
    );
  };
  return (
    <>
      <ResidentialMenuOptions
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
            <ResidentialCostImprovementForm
              totalWeightedValue={totalWeightedValue}
              updateEvalCostWeightInParent={updateEvalCostWeightInParent}
              onBuildingSizeChange={handleBuildingSizeChange}
              onTotalCostValuationChange={handleTotalCostValuationChange}
              onTotalAdjustedCost={handleTotalAdjustedCostChange}
            />
          </div>
        </div>
      </ResidentialMenuOptions>
    </>
  );
};
export default ResidentialCreateCostImprovement;
