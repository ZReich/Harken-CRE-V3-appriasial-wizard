import { Typography } from '@mui/material';
import { EvaluationSetUpEnum } from '../evaluation-setup-enums';

const EvaluationHeader = () => (
  <div className="flex items-center justify-between h-[50px] w-[100%] xl:pl-[40px] border-0 border-b border-[#eee] border-solid xl:pr-[70px] px-[15px] map-header-sticky">
    <Typography
      variant="h1"
      component="h2"
      className="text-xl font-bold uppercase"
    >
      {EvaluationSetUpEnum.EVALUATION_DETAILS}
    </Typography>
  </div>
);

export default EvaluationHeader;