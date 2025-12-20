import { Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ResidentialUpdateSidebar from './Sidebar';
import CommonButton from '@/components/elements/button/Button';
import { compsView } from '@/pages/comps/comps-view/compsViewEnum';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Icons } from '@/components/icons';
import { ResidentialComponentHeaderEnum } from '../enum/ResidentialEnum';
const ResidentialUpdateComp = () => {
  const navigate = useNavigate();
  const { id, appraisalId } = useParams();
  const location = window.location.href;
  const segments = location.split('/');
  const value = segments[segments.length - 1];
  const locations = useLocation();
  const handleEvaluationNavigate = () => {
    if (locations.pathname.includes('/residential/evaluation/update-cost-comps')) {
      navigate(`/residential/evaluation/cost-approach?id=${appraisalId}&costId=${value}`);
      return;
    }
    if (locations.pathname.includes('/residential/update-sales-comps')) {
      navigate(`/residential/sales-approach?id=${appraisalId}&salesId=${value}`);
      return;
    }

  }
  return (
    <>
      <div>
        <div className="xl:px-12 px-5">
          <div className="h-[80px] w-[100%] flex items-center justify-between map-header-sticky">
            <div>
              <Typography
                variant="h5"
                component="h5"
                className="text-xl font-bold"
              >
                {ResidentialComponentHeaderEnum.UPDATE_COMP_OVERVIEW}
              </Typography>
            </div>
            <div className="flex gap-10">
              <div className="flex items-center">
                <ErrorOutlineIcon className="pr-[10px]" />
                <span style={{ fontFamily: 'montserrat-normal' }}>
                  {ResidentialComponentHeaderEnum.GENERAL_INFORMATION}
                </span>
              </div>

              <div className="py-4 flex flex-col gap-14">
                <div className="flex justify-end gap-1">
                  {appraisalId && (
                    <CommonButton
                      variant="contained"
                      className="text-xs"
                      color="primary"
                      onClick={handleEvaluationNavigate}
                      style={{
                        borderRadius: '0 0 0 10px',
                        textTransform: 'capitalize',
                        width: '166px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <Icons.BackIcon style={{ color: 'white' }} />
                      {compsView.BACK_TO_APPRAISAL}
                    </CommonButton>
                  )}
                  {!appraisalId && (
                    <CommonButton
                      variant="contained"
                      className="text-xs"
                      color="primary"
                      onClick={() => navigate('/res_comps')}
                      style={{
                        borderRadius: '0 0 0 10px',
                        textTransform: 'capitalize',
                        width: '97px',
                        height: '36px',
                      }}
                    >
                      {compsView.BACK_TO_COMPS}
                    </CommonButton>
                  )}
                  {
                    !appraisalId && (
                      <CommonButton
                        variant="contained"
                        className="text-xs"
                        color="primary"
                        onClick={() => navigate(`/res-comps-view/${id}`)}
                        style={{
                          borderRadius: '0 10px 0 0 ',
                          textTransform: 'capitalize',
                          width: '97px',
                          height: '36px',
                        }}
                      >
                        {compsView.VIEW}
                      </CommonButton>
                    )
                  }


                </div>
              </div>
            </div>
          </div>
          <div className="w-full h-[1px] bg-[#80808057]"></div>
          <ResidentialUpdateSidebar />
        </div>
      </div>
    </>
  );
};
export default ResidentialUpdateComp;
