import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Box,
  LinearProgress,
} from '@mui/material';
import { Icons } from '@/components/icons';
import axios from 'axios';
import ResidentialAiCostCompsTable from './residential-cost-approach-ai-comp-table';
import { UploadCompsModalProps } from '@/pages/comps/Listing/comps-table-interfaces';
import { toast } from 'react-toastify';
import CommonButton from '@/components/elements/button/Button';

const ResidentialUploadCostCompsModal = ({
  open,
  onClose,
  setCompsData,
  compsData,
  compsLength,
}: UploadCompsModalProps) => {
  console.log('triggeredd');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  // const [estimatedTime] = useState(null);
  const [openCompsModal] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file before uploading.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(1);

    let progress = 1;
    const pausePoints = [5, 15, 30, 45, 60, 75, 85, 92];
    let currentPauseIndex = 0;
    const intervalSpeed = 120;
    let uploadCompleted = false; // Flag to stop simulation on response

    let progressInterval = setInterval(() => {
      if (uploadCompleted) return; // Stop simulation if API response is received

      if (progress < pausePoints[currentPauseIndex]) {
        progress += 2;
        setUploadProgress(progress);
      } else {
        clearInterval(progressInterval);
        setTimeout(() => {
          if (uploadCompleted) return;
          currentPauseIndex++;
          startProgress();
        }, [2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000][currentPauseIndex]);
      }
    }, intervalSpeed);

    const startProgress = () => {
      if (currentPauseIndex >= pausePoints.length || uploadCompleted) return;
      progressInterval = setInterval(() => {
        if (uploadCompleted) return;

        if (progress < pausePoints[currentPauseIndex]) {
          progress += 2;
          setUploadProgress(progress);
        } else {
          clearInterval(progressInterval);
          setTimeout(() => {
            if (uploadCompleted) return;
            currentPauseIndex++;
            startProgress();
          }, [2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000][currentPauseIndex]);
        }
      }, intervalSpeed);
    };

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('resComps/pdf-extraction', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response?.data?.data?.statusCode === 200) {
        // console.log('response', response);
        uploadCompleted = true; // Stop progress simulation
        clearInterval(progressInterval);
        setUploadProgress(100);

        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
          setSelectedFile(null);
          setCompsData(response?.data?.data?.data?.properties);
          onClose();
        }, 500);
      } else {
        uploadCompleted = true;
        clearInterval(progressInterval);
        toast.error('Upload failed. Unexpected response format.');
        setIsUploading(false);
        setUploadProgress(0);
      }
    } catch (error) {
      uploadCompleted = true;
      clearInterval(progressInterval);
      toast.error('Upload failed. Please try again.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setSelectedFile(null);
      setUploadProgress(0);
      onClose();
    }
  };

  return (
    <>
      {openCompsModal && (
        <ResidentialAiCostCompsTable
          open={openCompsModal}
          compsLength={compsLength}
          compsData={compsData}
          onClose={onClose}
          passCompsData={compsData}
        />
      )}

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            minHeight: '400px',
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: '#007ea7', fontWeight: 'bold' }}
            >
              Import PDF File
            </Typography>
            <IconButton onClick={handleClose} disabled={isUploading}>
              <Icons.CutICon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 2 }}>
          <input
            type="file"
            accept=".pdf"
            className="hidden"
            id="modal-file-upload"
            onChange={handleFileChange}
          />

          <label htmlFor="modal-file-upload" className="cursor-pointer">
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed #0DA1C7',
                borderRadius: '12px',
                padding: '32px 24px',
                backgroundColor: '#f8fdff',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: '#f0fbff',
                  borderColor: '#0891b2',
                },
              }}
            >
              <Icons.AddCircleIcon
                sx={{
                  fontSize: '48px',
                  color: '#0DA1C7',
                  marginBottom: '12px',
                }}
              />
              <Typography
                variant="body1"
                sx={{
                  color: '#374151',
                  fontSize: '16px',
                  fontWeight: '500',
                  textAlign: 'center',
                }}
              >
                {selectedFile ? selectedFile.name : 'Choose PDF file'}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#6b7280',
                  fontSize: '14px',
                  marginTop: '8px',
                }}
              >
                PDF files only
              </Typography>
            </Box>
          </label>

          {isUploading && (
            <Box sx={{ width: '100%', mt: 3 }}>
              <LinearProgress
                variant="determinate"
                value={uploadProgress}
                sx={{
                  height: '8px',
                  borderRadius: '4px',
                  backgroundColor: '#e5e7eb',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#0DA1C7',
                  },
                }}
              />
              <Typography
                align="center"
                sx={{
                  mt: 1,
                  color: '#374151',
                  fontSize: '14px',
                }}
              >
                {uploadProgress}%
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <CommonButton
            onClick={handleClose}
            disabled={isUploading}
            variant="contained"
            color="primary"
            style={{
              width: 150,
              height: 34,
              borderRadius: 4,
              marginTop: 2,
              backgroundColor: 'rgba(221, 221, 221, 1)',
              color: 'rgba(90, 90, 90, 1)',
            }}
          >
            Cancel
          </CommonButton>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={isUploading || !selectedFile}
            style={{
              width: 150,
              height: 34,
              borderRadius: 4,
              marginTop: 2,
              color: 'white',
            }}
            sx={{
              backgroundColor: isUploading ? '#9ca3af' : '#0DA1C7',
              color: 'white',
              '&:hover': {
                backgroundColor: isUploading ? '#9ca3af' : '#0891b2',
              },
              '&:disabled': {
                backgroundColor: '#9ca3af',
                color: 'white',
              },
            }}
          >
            {isUploading ? 'UPLOADING...' : 'UPLOAD'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ResidentialUploadCostCompsModal;
