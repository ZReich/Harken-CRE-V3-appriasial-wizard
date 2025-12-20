import { OverviewEnum } from '@/pages/appraisal/overview/OverviewEnum';
import { ResidentialComponentHeaderEnum } from '@/pages/residential/enum/ResidentialEnum';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Typography } from '@mui/material';
import ResidentialMenuOptions from '../../set-up/residential-menu-option';
import ResidentialOverviewForm from './residential-overview-form';
export const ResidentialOverview = () => {
  return (
    <>
      <ResidentialMenuOptions>
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
            <ResidentialOverviewForm />
          </div>
        </div>
      </ResidentialMenuOptions>
    </>
  );
};
