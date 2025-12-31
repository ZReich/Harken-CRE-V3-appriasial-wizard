import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogActions,
  Typography,
  Box,
} from '@mui/material';
import CommonButton from '@/components/elements/button/Button';

interface NoLinkDialogProps {
  open: boolean;
  onContinue: () => void;
  onCancel: () => void;
}

const NoLinkDialog: React.FC<NoLinkDialogProps> = ({
  open,
  onContinue,
  onCancel,
}) => (
  <Dialog
    open={open}
    onClose={onCancel}
    PaperProps={{
      sx: {
        borderRadius: 3,
        minWidth: 340,
      },
    }}
  >
    <Box
      sx={{
        background: '#f0fafc',
        borderRadius: '10px 10px 0 0',
        px: 2.5,
        py: 1.5,
        mb: 2,
        display: 'flex',
        alignItems: 'center',
        minHeight: 48,
      }}
    >
      <Typography
        sx={{
          color: '#0DA1C7',
          fontWeight: 700,
          fontSize: '1.15rem',
          flex: 1,
        }}
      >
        No Comps Linked
      </Typography>
    </Box>
    <DialogContent>
      <DialogContentText
        className="text-sm font-medium"
        sx={{
          color: 'black',
          mb: 1.5,
        }}
      >
        You have requested that we upload these comps, but you have not checked
        any of them to be linked to the evaluation.
        <br />
        If that is intentional, click{' '}
        <b style={{ color: '#0DA1C7' }}>Continue</b>.<br />
        If you'd like to link any of these new comps to the evaluation you're
        working on, click <b style={{ color: '#0DA1C7' }}>Cancel</b> and select
        them in the "Link Comp" column.
      </DialogContentText>
    </DialogContent>
    <DialogActions sx={{ justifyContent: 'flex-end', pb: 2 }}>
      <CommonButton
        onClick={onCancel}
        variant="contained"
        color="primary"
        style={{
          width: 150,
          height: 34,
          borderRadius: 2,
          marginTop: 2,
          backgroundColor: 'rgba(221, 221, 221, 1)',
          color: 'rgba(90, 90, 90, 1)',
        }}
      >
        Cancel
      </CommonButton>
      <CommonButton
        onClick={onContinue}
        variant="contained"
        style={{
          width: 150,
          height: 34,
          borderRadius: 4,
          marginTop: 2,
          backgroundColor: '#0DA1C7',
          color: 'white',
        }}
        autoFocus
      >
        Continue
      </CommonButton>
    </DialogActions>
  </Dialog>
);

export default NoLinkDialog;
