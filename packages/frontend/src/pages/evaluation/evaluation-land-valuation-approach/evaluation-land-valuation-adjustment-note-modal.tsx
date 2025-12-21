import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface EvaluationLandValuationAdjustmentNoteModalProps {
  open: boolean;
  onClose: () => void;
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  title?: string;
}

const EvaluationLandValuationAdjustmentNoteModal: React.FC<
  EvaluationLandValuationAdjustmentNoteModalProps
> = ({ open, onClose, value, onChange, onSave, title = 'Adjustment Notes' }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '8px',
          maxHeight: '80vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #e0e0e0',
          pb: 2,
        }}
      >
        <span className="text-lg font-semibold">{title}</span>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <TextField
          multiline
          rows={10}
          fullWidth
          variant="outlined"
          placeholder="Enter notes about the land valuation approach..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#d5d5d5',
              },
              '&:hover fieldset': {
                borderColor: '#0DA1C7',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#0DA1C7',
              },
            },
          }}
        />
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            color: '#666',
            borderColor: '#d5d5d5',
            '&:hover': {
              borderColor: '#999',
              backgroundColor: '#f5f5f5',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onSave}
          variant="contained"
          sx={{
            backgroundColor: '#0DA1C7',
            '&:hover': {
              backgroundColor: '#0b8fb0',
            },
          }}
        >
          Save Notes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EvaluationLandValuationAdjustmentNoteModal;

