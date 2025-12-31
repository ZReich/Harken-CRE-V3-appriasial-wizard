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
import { Close } from '@mui/icons-material';
import { Icons } from '@/components/icons';
import axios from 'axios';
import SalesCompsForm from './sales-table-comps';
import { UploadCompsModalProps } from '@/pages/comps/Listing/comps-table-interfaces';
import { toast } from 'react-toastify';

const UploadSalesCompsModal = ({
  open,
  onClose,
  setCompsModalOpen,
  setCompsData,
  compsData,
  compsLength,
}: UploadCompsModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [estimatedTime] = useState(null);
  const [openCompsModal] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };
  // File upload function
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file before uploading.');
      return;
    }
    if (!selectedFile) return;

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
      const response = await axios.post('comps/pdf-extraction', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response?.data?.data?.statusCode === 200) {
        // console.log('response', response);
        uploadCompleted = true; // Stop progress simulation
        clearInterval(progressInterval);
        setUploadProgress(100);

        setTimeout(() => {
          // console.log('response2', response.data.data.data.properties);

          setIsUploading(false);
          setCompsData(response?.data?.data?.data?.properties); // Store response data
          onClose(); // Close UploadCompsModal
          setCompsModalOpen(true); // Open CompsForm
        }, 500);
      } else {
        console.error('⚠️ Unexpected response format:', response);
      }
    } catch (error) {
      uploadCompleted = true; // Stop simulation on failure
      clearInterval(progressInterval);

      // console.error('Upload failed:', error);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          height: '70vh', // Adjust height dynamically
          maxHeight: '80vh', // Prevent it from exceeding viewport
        },
      }}
    >
      {openCompsModal && (
        <SalesCompsForm
          open={openCompsModal} // Ensure this is a boolean
          compsData={compsData}
          compsLength={compsLength}
          onClose={onClose} // Define this function in the parent
          passCompsData={compsData}
        />
      )}

      <Box sx={{ backgroundColor: '#e0f7fa' }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 'bold', color: '#007ea7' }}
          >
            UPLOAD COMPS
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </DialogTitle>
      </Box>
      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: 200,
        }}
      >
        <input
          type="file"
          accept=".pdf"
          style={{ display: 'none' }}
          id="file-upload"
          onChange={handleFileChange}
        />

        <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              padding: 3,
              width: '100%',
              textAlign: 'center',
              cursor: 'pointer',
            }}
          >
            <Icons.AddCircleIcon
              className="text-[#0DA1C7] text-3xl"
              style={{ fontSize: '50px' }}
            />{' '}
            <Typography variant="body1" color="textSecondary">
              {selectedFile ? selectedFile.name : 'Choose pdf file'}
            </Typography>
          </Box>
        </label>
        {isUploading && (
          <Box sx={{ width: '80%', mt: 2 }}>
            <LinearProgress variant="determinate" value={uploadProgress} />
            <Typography align="center" sx={{ mt: 1 }}>
              {uploadProgress}%{' '}
              {estimatedTime !== null ? `- ${estimatedTime}s left` : ''}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        <Button
          variant="contained"
          onClick={handleUpload}
          sx={{
            backgroundColor: isUploading ? 'gray' : 'rgb(13, 161, 199)',
            '&:hover': {
              backgroundColor: isUploading ? 'gray' : 'rgb(10, 140, 180)',
            },
          }}
          disabled={isUploading} // Disable button while uploading
        >
          {isUploading ? 'UPLOADING...' : 'UPLOAD'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UploadSalesCompsModal;
