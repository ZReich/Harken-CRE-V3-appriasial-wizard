import { Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import Sidebar from './Sidebar';
import CommonButton from '@/components/elements/button/Button';
import { compsView } from '../comps-view/compsViewEnum';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Icons } from '@/components/icons';
import React from 'react';

const UpdateComp = () => {
  const navigate = useNavigate();

  const { id, appraisalId, type, salesId, check } = useParams();

  console.log(appraisalId, 'appraisalIdappraisalId');
  const location = window.location.href;
  const locations = useLocation();
  const propertyId = locations.state?.propertyId;
  const approachId = locations.state?.approachId;
  const rawFilters = locations.state?.filters;
  const currentBounds = locations.state?.bounds;
  const selectedIds = locations.state?.selectedIds || [];

  const mapZoom = locations.state?.zoom;
  const segments = location.split('/');
  const value = segments[segments.length - 1];
  const filters = rawFilters;

  // Listen for browser back button and call handleAppraisalNavigate
  React.useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      console.log(event);
      handleAppraisalNavigate();
    };
    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  const handleAppraisalNavigate = () => {
    if (locations.pathname.includes('evaluation/update-comps')) {
      navigate(`/evaluation/sales-approach?id=${appraisalId}&salesId=${value}`);
      return;
    }
    if (locations.pathname.includes('evaluation/update-cost-comps')) {
      localStorage.setItem('activeType', 'building_with_land');
      navigate(`/evaluation/cost-approach?id=${appraisalId}&costId=${value}`);
      return;
    }
    if (locations.pathname.includes('evaluation/update-cap-comps')) {
      navigate(`/evaluation/cap-approach?id=${appraisalId}&capId=${value}`);
      return;
    }
    if (locations.pathname.includes('evaluation/update-multi-family-comps')) {
      navigate(
        `/evaluation/multi-family-approach?id=${appraisalId}&evaluationId=${value}`
      );
      return;
    }

    if (locations.pathname.includes('evaluation/update-lease-comps')) {
      navigate(`/evaluation/lease-approach?id=${appraisalId}&leaseId=${value}`);
      return;
    }

    if (type === 'sales' && appraisalId && value) {
      navigate(`/sales-approach?id=${appraisalId}&salesId=${value}`);
    } else if (type === 'lease' && appraisalId && value) {
      navigate(`/lease-approach?id=${appraisalId}&leaseId=${value}`);
    } else if (type === 'cost' && appraisalId && value) {
      navigate(`/cost-approach?id=${appraisalId}&costId=${value}`);
    } else if (type === 'cap' && appraisalId && value) {
      navigate(`/cap-approach?id=${appraisalId}&captId=${value}`);
    }
  };
  return (
    <>
      <div>
        <div className="xl:px-8 px-5">
          <div className="h-[80px] w-[100%] flex items-center justify-between map-header-sticky">
            <div>
              <Typography
                variant="h5"
                component="h5"
                className="text-xl font-bold"
              >
                UPDATE COMP | OVERVIEW
              </Typography>
            </div>

            <div className="flex gap-10">
              <div className="flex items-center">
                <ErrorOutlineIcon className="pr-[10px]" />
                <span style={{ fontFamily: 'montserrat-normal' }}>
                  Lets get started! Enter some general information for this
                  Comp.
                </span>
              </div>

              <div className="py-4 flex flex-col gap-14">
                <div className="flex justify-end gap-1">
                  {appraisalId && (
                    <CommonButton
                      variant="contained"
                      className="text-xs"
                      color="primary"
                      onClick={handleAppraisalNavigate}
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
                      onClick={() => {
                        if (propertyId && approachId) {
                          navigate(
                            `/filter-lease-comps?id=${propertyId}&approachId=${approachId}`
                          );
                        } else if (
                          type === 'sales' &&
                          (localStorage.getItem('activeType') ===
                            'building_with_land' ||
                            localStorage.getItem('activeType') === 'land_only')
                        ) {
                          navigate(
                            `/sales-approach?id=${appraisalId}&salesId=${salesId}`
                          );
                        } else if (
                          localStorage.getItem('activeType') === 'land_only'
                        ) {
                          navigate('/land_comps', {
                            state: {
                              typeView: check,
                              compFilters: filters,
                              currentBounds: currentBounds,
                              mapZoom: mapZoom,
                              zoom: mapZoom,
                              selectedIds: selectedIds,
                            },
                          });
                        } else {
                          navigate('/comps', {
                            state: {
                              typeView: check,
                              compFilters: filters,
                              currentBounds: currentBounds,
                              mapZoom: mapZoom,
                              zoom: mapZoom,
                              selectedIds: selectedIds,
                            },
                          });
                        }
                      }}
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

                  {!appraisalId && (
                    <CommonButton
                      variant="contained"
                      className="text-xs"
                      color="primary"
                      onClick={() =>
                        navigate(`/comps-view/${id}/${'sales'}`, {
                          state: {
                            typeView: check,
                            filters: filters,
                            bounds: currentBounds,
                            zoom: mapZoom,
                            mapZoom: mapZoom,
                            selectedIds: selectedIds,
                          },
                        })
                      }
                      style={{
                        borderRadius: '0 10px 0 0 ',
                        textTransform: 'capitalize',
                        width: '97px',
                        height: '36px',
                      }}
                    >
                      View
                    </CommonButton>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="w-full h-[1px] bg-[#80808057]"></div>
          <Sidebar />
        </div>
      </div>
    </>
  );
};
export default UpdateComp;
