import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Typography } from '@mui/material';
import { useRef, useState } from 'react';
import ResidentialMenuOptions from '../../set-up/residential-menu-option';
import ResidentialEvaluationIncomeApprochForm from './residential-evaluation-income-form';
import { ResidentialIncomeApproachEnum } from './residential-incom-approach-enum';
const ResidentialEvaluationCreatIncomeApproch = () => {
  const [indicatedCapRateFromChild, setIndicatedCapRateFromChild] = useState(0);
  const [totalWeightedValue, setTotalWeightedValue] = useState(0);

  const [indicatedSfAnnualFromChild, setIndicatedSfAnnualFromChild] =
    useState(0);
  const [updateEvalWeightInParent, setUpdateEvalWeightInParent] =
    useState<any>(0);

  const handleNextClick = () => {

    if (incomeFormRef.current?.onNextClick) {
      incomeFormRef.current.onNextClick();
    } else {
      console.warn('onNextClick is not defined on incomeFormRef');
    }
  };

  const handleBackClick = () => {
    if (incomeFormRef.current?.onBackClick) {
      incomeFormRef.current.onBackClick();
    } else {
      console.warn('onNextClick is not defined on incomeFormRef');
    }
  };
  const incomeFormRef = useRef<any>(null);
  const [matchedApproch, setMatchedApproch] = useState('');
  const matchName = (event: any) => {
    setMatchedApproch(event);
  };
  return (
    <>
      <ResidentialMenuOptions
        onNextClick={handleNextClick}
        onBackClick={handleBackClick}
        indicatedCapRate={indicatedCapRateFromChild}
        indicatedSfAnnualRate={indicatedSfAnnualFromChild}
        onUpdateEvalWeightChange={(value: any) => {
          setUpdateEvalWeightInParent(value);
        }}
        onTotalWeightedChange={(value: any) => {
          setTotalWeightedValue(value);
        }}
      >
        <div>
          <div className="flex items-center justify-between h-[50px] w-[100%] xl:pl-[40px] border-0 border-b border-[#eee] border-solid xl:pr-[70px] px-[15px] map-header-sticky">
            <Typography
              variant="h1"
              component="h2"
              className="text-xl font-bold uppercase"
            >
              {ResidentialIncomeApproachEnum.INCOME_APPROACH}{matchedApproch ? ` (${matchedApproch})` : ''}
            </Typography>
            <div className="flex items-center">
              <ErrorOutlineIcon className="pr-[10px] w-[30px] h-[30px]" />
              <span className="text-xs">
                {ResidentialIncomeApproachEnum.INFORMATION}
              </span>
            </div>
          </div>
        </div>
        {/* <div> */}
        <div className="p-5 xl:px-14 px-4 ">
          <ResidentialEvaluationIncomeApprochForm
            totalWeightedValue={totalWeightedValue}
            ref={incomeFormRef}
            matchName={matchName}
            onIndicatedCapRateChange={setIndicatedCapRateFromChild}
            onIndicatedPsfAnnualRateChange={setIndicatedSfAnnualFromChild}
            evalWeights={updateEvalWeightInParent}
          />
        </div>
      </ResidentialMenuOptions>
    </>
  );
};
export default ResidentialEvaluationCreatIncomeApproch;
