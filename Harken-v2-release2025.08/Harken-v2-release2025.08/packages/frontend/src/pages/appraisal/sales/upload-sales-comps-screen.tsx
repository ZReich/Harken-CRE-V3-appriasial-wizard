import { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

import { Comp } from '../../comps/Listing/comps-table-interfaces';
import { CompsTable, UploadModal } from '../../comps/upload-comps';
import NoLinkDialog from '../../../components/NoLinkDialog';

const AppraisalSalesUploadCompsScreen = () => {
  console.log('triggereddddd');
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const salesId = searchParams.get('salesId');

  // Get Formik values from location state
  const {
    operatingExpenses,
    salesCompQualitativeAdjustment,
    appraisalSpecificAdjustment,
  } = location.state || {};

  const [compsData, setCompsData] = useState<Comp[] | null>(null);
  const [uploadCompsStatus, setUploadCompsStatus] = useState(false);
  const [uploadStatuses, setUploadStatuses] = useState<{
    [key: number]: string;
  }>({});
  const [tableKey, setTableKey] = useState(0);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedComps, setSelectedComps] = useState<number[]>([]);
  const [actionStates, setActionStates] = useState<{ [key: number]: string }>(
    {}
  );
  const [rowLoaders, setRowLoaders] = useState<{ [key: number]: boolean }>({});
  const [showNoLinkDialog, setShowNoLinkDialog] = useState(false);
  const [pendingNavigate, setPendingNavigate] = useState(false);
  const [currentFormikValues, setCurrentFormikValues] = useState<Comp[] | null>(
    null
  );
  console.log(uploadCompsStatus, pendingNavigate);

  const handleUploadSuccess = (data: Comp[]) => {
    setCompsData(data);
    setUploadStatuses({});
    setTableKey((prev) => prev + 1);
  };

  const handleBackToComps = () => {
    navigate(-1);
  };

  const handleCompSelection = (compIds: number[]) => {
    setSelectedComps(compIds);
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

  const handleLinkSelectedComps = async () => {
    const updatedCompsData = currentFormikValues || compsData;

    if (!updatedCompsData) return;

    // Check if any comps are checked for linking
    if (selectedComps.length === 0) {
      setShowNoLinkDialog(true);
      return;
    }

    try {
      setUploadCompsStatus(true);
      const linkedCompIds = [];
      let hasErrors = false;
      const localStatuses: string[] = [];

      for (let i = 0; i < updatedCompsData.length; i++) {
        const comp = updatedCompsData[i];
        const isSelected = selectedComps.includes(i);
        const actionState = actionStates[i];
        const status = uploadStatuses[i];

        // Skip if comp is marked as Skip or Skipped
        if (actionState === 'Skip' || status === 'Skipped') {
          continue;
        }

        // Set loading state for this specific row
        setRowLoaders((prev) => ({ ...prev, [i]: true }));

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

        // Add action flags based on dropdown selection
        if (
          actionState === 'Upload as new' ||
          actionState === 'Upload as New'
        ) {
          (compPayload as any).new = true;
        } else if (
          actionState === 'Update existing' ||
          actionState === 'Update Existing'
        ) {
          (compPayload as any).update = true;
        } else if (
          actionState === 'Upload anyway' ||
          actionState === 'Upload Anyway'
        ) {
          (compPayload as any).uploadAnyway = true;
        } else if (actionState === 'Retry') {
          // For retry, we don't need special flags, just save normally
        }

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
            localStatuses[i] = 'Completed';
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
            localStatuses[i] = message;
          }

          // Clear row loader
          setRowLoaders((prev) => ({ ...prev, [i]: false }));
        } catch (error: any) {
          hasErrors = true;
          let message = 'Failed to save';
          if (error.response?.data?.data?.statusCode === 400) {
            message = error.response.data.data.message || message;
          }
          setUploadStatuses((prev) => ({ ...prev, [i]: message }));
          localStatuses[i] = message;

          // Clear row loader on error
          setRowLoaders((prev) => ({ ...prev, [i]: false }));
        }
      }

      if (hasErrors) {
        toast.error(
          'Some comps failed to save. Please check the status column for details.'
        );
        return;
      }

      // Check if all status are Completed and no comps selected
      const completedCount = localStatuses.filter(
        (v) => v === 'Completed'
      ).length;

      if (
        completedCount === updatedCompsData.length &&
        selectedComps.length === 0
      ) {
        setShowNoLinkDialog(true);
        setPendingNavigate(true);
        return;
      }

      toast.success(
        `Successfully processed ${updatedCompsData.length} comp(s). ${linkedCompIds.length} comp(s) linked.`
      );

      if (linkedCompIds.length > 0) {
        try {
          const getCompsResponse = await axios.post(
            'appraisals/get-selected-comps/',
            { compIds: linkedCompIds },
            { headers: { 'Content-Type': 'application/json' } }
          );

          const linkedComps = getCompsResponse.data?.data?.data || [];

          const updatedCompssales = linkedComps.map(
            ({ id, ...restComp }: any) => ({
              ...restComp,
              comp_id: id,
              expenses:
                operatingExpenses?.map((exp: any) => ({
                  ...exp,
                  adj_value: 0,
                  comparison_basis: 0,
                })) || [],
              quantitativeAdjustments:
                salesCompQualitativeAdjustment?.map((qa: any) => ({
                  ...qa,
                  adj_value: 'Similar',
                })) || [],
              adjusted_psf: restComp.price_square_foot,
            })
          );

          localStorage.setItem(
            'updatedCompssales',
            JSON.stringify(updatedCompssales)
          );
          navigate(`/sales-approach?id=${id}&salesId=${salesId}`, {
            state: { updatedCompssales },
          });
        } catch (error) {
          navigate(`/sales-approach?id=${id}&salesId=${salesId}`);
        }
      } else {
        navigate(`/sales-approach?id=${id}&salesId=${salesId}`);
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

  const onFormikValuesChange = (values: Comp[]) => {
    setCurrentFormikValues(values);
  };

  const handleNewUpload = () => {
    setUploadModalOpen(true);
  };

  const handleNoLinkDialogContinue = async () => {
    const updatedCompsData = currentFormikValues || compsData;

    if (updatedCompsData) {
      try {
        setUploadCompsStatus(true);

        for (let i = 0; i < updatedCompsData.length; i++) {
          const comp = updatedCompsData[i];
          const actionState = actionStates[i];
          const status = uploadStatuses[i];

          if (
            actionState === 'Skip' ||
            status === 'Skipped' ||
            status === 'Completed'
          ) {
            continue;
          }

          const compPayload = {
            comp_type: localStorage.getItem('activeType'),
            type:
              localStorage.getItem('checkType') === 'leasesCheckbox'
                ? 'lease'
                : 'sale',
            ...comp,
            ai_generated: 1,
            link: false,
          };

          if (
            actionState === 'Upload as new' ||
            actionState === 'Upload as New'
          ) {
            (compPayload as any).new = true;
          } else if (
            actionState === 'Update existing' ||
            actionState === 'Update Existing'
          ) {
            (compPayload as any).update = true;
          } else if (
            actionState === 'Upload anyway' ||
            actionState === 'Upload Anyway'
          ) {
            (compPayload as any).uploadAnyway = true;
          }

          await axios.post('comps/save-extracted-comp', compPayload, {
            headers: { 'Content-Type': 'application/json' },
          });
        }
      } catch (error) {
        console.error('Error saving comps:', error);
      } finally {
        setUploadCompsStatus(false);
      }
    }

    setShowNoLinkDialog(false);
    setPendingNavigate(false);
    navigate(`/sales-approach?id=${id}&salesId=${salesId}`);
  };

  const handleNoLinkDialogCancel = () => {
    setShowNoLinkDialog(false);
    setPendingNavigate(false);
  };

  return (
    <Box className="min-h-screen bg-gray-50">
      <NoLinkDialog
        open={showNoLinkDialog}
        onContinue={handleNoLinkDialogContinue}
        onCancel={handleNoLinkDialogCancel}
      />
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
                Import Sales Comps
              </Typography>
            </Box>
            <Box className="flex items-center gap-3">
              {compsData && (
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
                  disabled={!isSaveButtonEnabled()}
                >
                  {'SAVE'}
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
              showCheckboxes={true}
              onCompSelection={handleCompSelection}
              maxSelection={4}
              selectedCompsFromParent={selectedComps}
              actionStates={actionStates}
              setActionStates={setActionStates}
              onFormikValuesChange={onFormikValuesChange}
              locationState={{
                operatingExpenses,
                salesCompQualitativeAdjustment,
                appraisalSpecificAdjustment,
              }}
              rowLoaders={rowLoaders}
              setRowLoaders={setRowLoaders}
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

export default AppraisalSalesUploadCompsScreen;
