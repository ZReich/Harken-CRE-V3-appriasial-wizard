
import { Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ResidentialSidebar from './Sidebar';
import { ResidentialComponentHeaderEnum } from '../enum/ResidentialEnum';
const ResidentialCreateComp = () => {
  return (
    <>
      <div>
        <div className='xl:px-12 px-5'>
          <div className="h-[80px] w-[100%] flex items-center justify-between map-header-sticky">
            <div >
              <Typography
                variant="h5"
                component="h5"
                className="text-xl font-bold"
              >
                {ResidentialComponentHeaderEnum.HEADER}
              </Typography>
            </div>
            <div className=" flex items-center">
              <ErrorOutlineIcon className="pr-[10px]" />
              <span>
                {ResidentialComponentHeaderEnum.GENERAL_INFORMATION}
              </span>
            </div>
          </div>
          <div className="w-full h-[1px] bg-[#80808057]"></div>
          <ResidentialSidebar />
        </div>
      </div>
    </>
  );
};
export default ResidentialCreateComp;
