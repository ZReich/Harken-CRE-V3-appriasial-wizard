import { Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import Sidebar from './Sidebar';
const CreateComp = () => {
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
                CREATE COMP | OVERVIEW
              </Typography>
            </div>
            <div className=" flex items-center">
              <ErrorOutlineIcon className="pr-[10px]" />
              <span >
                Lets get started! Enter some general information for this
                Comp.
              </span>
            </div>
          </div>
          <div className="w-full h-[1px] bg-[#80808057]"></div>
          <Sidebar />
        </div>
      </div>
    </>
  );
};
export default CreateComp;