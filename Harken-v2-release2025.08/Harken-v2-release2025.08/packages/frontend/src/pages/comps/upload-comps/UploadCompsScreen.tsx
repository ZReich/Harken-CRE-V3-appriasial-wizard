import { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import CompsTable from './CompsTable';
import UploadModal from './UploadModal';
import { Comp } from '../Listing/comps-table-interfaces';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const UploadCompsScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [compsData, setCompsData] = useState<Comp[] | null>(null);
  const [uploadCompsStatus, setUploadCompsStatus] = useState(false);
  const [uploadStatuses, setUploadStatuses] = useState<{
    [key: number]: string;
  }>({});
  const [actionStates, setActionStates] = useState<{ [key: number]: string }>(
    {}
  );
  console.log(uploadCompsStatus);
  const [tableKey, setTableKey] = useState(0);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedComps, setSelectedComps] = useState<number[]>([]);

  const isSalesUpload = location.pathname.includes('/upload-comps-sales');

  // Navigate to /comps after all comps are saved (non-sales upload)
  useEffect(() => {
    if (!isSalesUpload && compsData && compsData.length > 0) {
      const allProcessed = compsData.every(
        (_, idx) =>
          uploadStatuses[idx] === 'Completed' ||
          uploadStatuses[idx] === 'Skipped'
      );
      const hasErrors = Object.values(uploadStatuses).some(
        (status) =>
          status &&
          status !== 'Completed' &&
          status !== 'Skipped' &&
          status !== 'Pending'
      );

      if (allProcessed && !hasErrors) {
        const activeType = localStorage.getItem('activeType');
        if (activeType === 'land_only') {
          navigate('/land_comps');
        } else {
          navigate('/comps');
        }
      }
    }
  }, [uploadStatuses, compsData, isSalesUpload, navigate]);

  const handleUploadSuccess = (data: Comp[]) => {
    setCompsData(data);
    setUploadStatuses({});
    setTableKey((prev) => prev + 1);
  };

  const handleBackToComps = () => {
    if (isSalesUpload) {
      navigate(-1); // Go back to previous page
    } else {
      navigate('/comps');
    }
  };

  const handleCompSelection = (compIds: number[]) => {
    setSelectedComps(compIds);
  };

  const handleLinkSelectedComps = async () => {
    // Get updated formik values from CompsTable
    const saveButton = document.querySelector(
      '[data-save-button]'
    ) as HTMLButtonElement;
    if (saveButton) {
      saveButton.click();
      return;
    }

    try {
      setUploadCompsStatus(true);
      const linkedCompIds = [];
      let hasErrors = false;

      // Process each comp individually with status updates
      for (let i = 0; i < (compsData?.length || 0); i++) {
        const comp = compsData?.[i];
        const isSelected = selectedComps.includes(i);

        const compPayload = {
          comp_type: localStorage.getItem('activeType'),
          type:
            localStorage.getItem('checkType') === 'leasesCheckbox'
              ? 'lease'
              : 'sale',
          ...comp,
          ai_generated: 1,
          link: isSelected,
        };

        try {
          const response = await axios.post(
            `comps/save-extracted-comp`,
            compPayload,
            {
              headers: { 'Content-Type': 'application/json' },
            }
          );

          if (response.data?.data?.statusCode === 200) {
            setUploadStatuses((prev) => ({ ...prev, [i]: 'Completed' }));
            if (isSelected) {
              const compId = response.data?.data?.data?.compId;
              if (compId) {
                linkedCompIds.push(compId);
              }
            }
          } else {
            hasErrors = true;
            const message = response.data?.data?.message || 'Error occurred';
            setUploadStatuses((prev) => ({ ...prev, [i]: message }));
          }
        } catch (error: any) {
          hasErrors = true;
          if (error.response?.data?.data?.statusCode === 400) {
            const message =
              error.response.data.data.message || 'Error occurred';
            setUploadStatuses((prev) => ({ ...prev, [i]: message }));
          } else {
            setUploadStatuses((prev) => ({ ...prev, [i]: 'Failed to save' }));
          }
        }
      }

      if (hasErrors) {
        toast.error(
          'Some comps failed to save. Please check the status column for details.'
        );
        return;
      }

      toast.success(
        `Successfully processed ${compsData?.length || 0} comp(s). ${linkedCompIds.length} comp(s) linked.`
      );

      // Fetch full comp data for linked comps
      if (linkedCompIds.length > 0) {
        try {
          // const getCompsResponse = await axios.post(
          //   'evaluations/get-selected-comps/',
          //   { compIds: linkedCompIds },
          //   { headers: { 'Content-Type': 'application/json' } }
          // );

          // const linkedComps = getCompsResponse.data?.data || [];
          navigate(-1);
        } catch (error) {
          console.error('Error fetching selected comps:', error);
          navigate(-1);
        }
      } else {
        // Navigate back even if no comps were linked
        navigate(-1);
      }
    } catch (error: any) {
      if (error.response) {
        const { status, data } = error.response;
        if (status === 400) {
          const errorMessage =
            data?.data?.message || data?.error || 'Invalid data provided.';
          toast.error(errorMessage);
        } else {
          toast.error(`Error ${status}: Failed to save comps.`);
        }
      } else {
        toast.error(
          'Network error. Please check your connection and try again.'
        );
      }
    }
  };

  const handleNewUpload = () => {
    setUploadModalOpen(true);
  };
  const isSaveButtonEnabled = () => {
    // Check each row individually
    const hasUnresolvedErrors = Object.entries(uploadStatuses).some(
      ([index, status]) => {
        const idx = parseInt(index);
        const actionValue = actionStates[idx];
        const hasActionSelected = actionValue && actionValue !== '';

        // For error statuses that need action, check if action is selected
        if (
          status?.includes('already exist') ||
          status?.includes('invalid address') ||
          status?.includes('Address validation failed')
        ) {
          return !hasActionSelected;
        }

        // Block for Required field missing
        return status === 'Missing Required Fields';
      }
    );

    const result = !hasUnresolvedErrors;

    return result;
  };
  return (
    <Box className="min-h-screen bg-gray-50">
      <Box className="bg-white shadow-sm border-b">
        <Box className="max-w-8xl mx-auto px-4 py-4">
          <Box className="flex items-center justify-between">
            <Box className="flex items-center gap-4">
              {compsData && (
                <Button
                  variant="outlined"
                  onClick={handleNewUpload}
                  sx={{
                    borderColor: '#0DA1C7',
                    color: '#0DA1C7',
                    '&:hover': {
                      borderColor: '#0DA1C7',
                      backgroundColor: 'rgba(13, 161, 199, 0.04)',
                    },
                  }}
                >
                  Upload New File
                </Button>
              )}
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#1a1a1a',
                }}
              >
                Import Comps
              </Typography>
            </Box>
            <Box className="flex items-center gap-3">
              {compsData && !isSalesUpload && (
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: '#0DA1C7',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#0891b2',
                    },
                  }}
                  onClick={() => {
                    const saveButton = document.querySelector(
                      '[data-save-button]'
                    ) as HTMLButtonElement;
                    if (saveButton) {
                      console.log('🔧 Clicking save button');
                      saveButton.click();
                    } else {
                      console.error('🔧 Save button not found');
                    }
                  }}
                  disabled={!isSaveButtonEnabled()}
                >
                  SAVE
                </Button>
              )}
              {compsData && isSalesUpload && (
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: '#0DA1C7',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#0891b2',
                    },
                  }}
                  onClick={handleLinkSelectedComps}
                >
                  SAVE
                </Button>
              )}
              <Button
                onClick={handleBackToComps}
                variant="outlined"
                sx={{
                  backgroundColor: '#0DA1C7',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#0891b2',
                  },
                }}
              >
                BACK
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box className="max-w-8xl mx-auto px-4" sx={{ py: 2 }}>
        {!compsData ? (
          <Box className="bg-white rounded-lg shadow-sm p-8">
            <Box className="max-w-2xl mx-auto text-center">
              <Typography
                variant="h6"
                component="h2"
                className="mb-6"
                sx={{ color: '#007ea7', fontWeight: 'bold' }}
              >
                No data uploaded yet
              </Typography>
              <Button
                variant="contained"
                onClick={handleNewUpload}
                sx={{
                  backgroundColor: '#0DA1C7',
                  color: 'white',
                  padding: '12px 32px',
                  fontSize: '16px',
                  fontWeight: '600',
                  borderRadius: '8px',
                  '&:hover': {
                    backgroundColor: '#0891b2',
                  },
                }}
              >
                Import PDF File
              </Button>
            </Box>
          </Box>
        ) : (
          <Box
            className="bg-white rounded-lg shadow-sm"
            sx={{ height: 'calc(100vh - 120px)' }}
          >
            <Box className="p-2 border-b">
              <Typography
                variant="h6"
                sx={{
                  color: '#007ea7',
                  fontWeight: 'bold',
                  fontSize: '16px',
                }}
              >
                Comps Data
              </Typography>
            </Box>
            <CompsTable
              key={`comps-table-${tableKey}`}
              compsData={compsData || []}
              setUploadCompsStatus={setUploadCompsStatus}
              hideSaveButton={true}
              uploadStatuses={uploadStatuses}
              setUploadStatuses={setUploadStatuses}
              showCheckboxes={isSalesUpload}
              onCompSelection={handleCompSelection}
              maxSelection={4}
              selectedCompsFromParent={selectedComps}
              actionStates={actionStates}
              setActionStates={setActionStates}
            />
          </Box>
        )}
      </Box>

      <UploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </Box>
  );
};

export default UploadCompsScreen;
