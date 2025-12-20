import { Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { ResidentialComponentHeaderEnum } from '@/pages/residential/enum/ResidentialEnum';
import EvaluationOverviewForm from './overview-form';
import { OverviewEnum } from '@/pages/appraisal/overview/OverviewEnum';
import EvaluationMenuOptions from '../set-up/evaluation-menu-options';
export const EvaluationOverview = () => {
  return (
    <>
      <EvaluationMenuOptions>
        <div>
          <div className="flex items-center justify-between h-[50px] w-[100%] xl:pl-[40px] border-0 border-b border-[#eee] border-solid xl:pr-[70px] px-[15px] map-header-sticky">
            <Typography
              variant="h1"
              component="h2"
              className="text-xl font-bold"
            >
              {OverviewEnum.OVERVIEW}
            </Typography>
            <div className=" flex items-center">
              <ErrorOutlineIcon className="pr-[10px] w-[30px] h-[30px]" />
              <span className="text-xs">
                {ResidentialComponentHeaderEnum.GENERAL_INFORMATION_AP}
              </span>
            </div>
          </div>
          <div>
            <EvaluationOverviewForm />
          </div>
        </div>
      </EvaluationMenuOptions>
    </>
  );
};
