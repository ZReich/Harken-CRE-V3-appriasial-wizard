import { useState } from 'react';
import { CustomToast } from './CustomToast';

type ToastSeverity = 'error' | 'warning' | 'info' | 'success';

export const useCustomToast = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<ToastSeverity>('error');
  const [lastMessage, setLastMessage] = useState('');

  const showToast = (
    newMessage: string,
    newSeverity: ToastSeverity = 'error'
  ) => {
    if (lastMessage !== newMessage) {
      setMessage(newMessage);
      setSeverity(newSeverity);
      setOpen(true);
      setLastMessage(newMessage);

      // Reset last message after a delay
      setTimeout(() => setLastMessage(''), 500);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const toastComponent = (
    <CustomToast
      open={open}
      message={message}
      severity={severity}
      onClose={handleClose}
    />
  );

  return {
    showToast,
    showError: (msg: string) => showToast(msg, 'error'),
    showSuccess: (msg: string) => showToast(msg, 'success'),
    showInfo: (msg: string) => showToast(msg, 'info'),
    showWarning: (msg: string) => showToast(msg, 'warning'),
    toastComponent,
  };
};
