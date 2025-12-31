import { Alert, Snackbar } from '@mui/material';

interface ToastProps {
  open: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info' | 'success';
  onClose: () => void;
}

export const CustomToast = ({ open, message, severity, onClose }: ToastProps) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{
          minWidth: '300px',
          '& .MuiAlert-message': {
            fontSize: '0.95rem'
          }
        }}
        elevation={6}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};