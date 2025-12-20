import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Typography } from '@mui/material';
const ResidentialExhibitHeader = () => {
  return (
    <>
      <div>
        <div className="flex items-center justify-between h-[50px] w-[100%] xl:pl-[40px] border-0 border-b border-[#eee] border-solid xl:pr-[70px] px-[15px] map-header-sticky">
          <Typography
            variant="h1"
            component="h2"
            className="text-xl font-bold uppercase"
          >
            EXHIBITS
          </Typography>
          <div className="flex items-center">
            <ErrorOutlineIcon className="pr-[10px] w-[30px] h-[30px]" />
            <span className="text-xs">
              Add any additional exhibits that you would like to include in this
              document.
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
export default ResidentialExhibitHeader;
//
