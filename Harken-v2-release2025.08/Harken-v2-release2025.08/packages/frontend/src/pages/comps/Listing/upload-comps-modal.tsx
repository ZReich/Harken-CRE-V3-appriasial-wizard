import { useEffect, useState } from 'react';
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
import CompsForm from './comps-table';
import { UploadCompsModalProps } from './comps-table-interfaces';
import { toast } from 'react-toastify';

const UploadCompsModal = ({
  open,
  onClose,
  setCompsModalOpen,
  setCompsData,
  compsData,
  setUploadCompsStatus,
}: UploadCompsModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [openCompsModal, setOpenCompsModal] = useState(false);

  const estimatedTime = null;

  // handlechange for file select
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

    setIsUploading(true);
    setUploadProgress(1);

    let progress = 1;
    const pausePoints = [5, 15, 30, 45, 60, 75, 85, 92];
    let currentPauseIndex = 0;
    const intervalSpeed = 120;
    let uploadCompleted = false; // Flag to stop simulation on response

    let progressInterval = setInterval(() => {
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

    /**
     * Initiates and manages the simulated progress of an upload process.
     */
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
        uploadCompleted = true;
        clearInterval(progressInterval);
        setUploadProgress(100);

        setTimeout(() => {
          setIsUploading(false);
          setCompsData(response?.data?.data?.data?.properties);
          onClose();
          setCompsModalOpen(true);
          setSelectedFile(null);
        }, 500);
      } else {
        console.error('Unexpected response format:', response);
        toast.error('Upload failed. Unexpected response format.');
      }
    } catch (error) {
      uploadCompleted = true;
      clearInterval(progressInterval);

      toast.error('Upload failed. Please try again.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  useEffect(() => {
    if (openCompsModal == false) {
      setSelectedFile(null);
    }
  }, [openCompsModal]);
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
        <CompsForm
          passCompsData={compsData}
          compsData={compsData}
          handleClose={() => {
            // setSelectedFile(null);
            setOpenCompsModal(false);
          }}
          onClose={() => {
            // setSelectedFile(null);
            setOpenCompsModal(false);
          }} //  Ensure onClose is passed
          open={openCompsModal} // Ensure open is passed
          setUploadCompsStatus={setUploadCompsStatus} // Pass setUploadCompsStatus
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
          <IconButton
            onClick={() => {
              setSelectedFile(null);
              onClose();
            }}
          >
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
          className="hidden"
          id="file-upload"
          onChange={handleFileChange}
        />

        <label htmlFor="file-upload" className="cursor-pointer">
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
            <Icons.AddCircleIcon className="text-[#0DA1C7] text-3xl text-[50px]" />

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

export default UploadCompsModal;
