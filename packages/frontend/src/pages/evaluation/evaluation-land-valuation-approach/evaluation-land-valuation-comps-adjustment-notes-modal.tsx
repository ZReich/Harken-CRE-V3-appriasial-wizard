import React, { useState, useEffect } from 'react';
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
import { useFormikContext } from 'formik';

interface EvaluationLandValuationCompAdjustmentNoteModalProps {
  open: boolean;
  onClose: () => void;
  item: any;
  index: number;
  onSave: () => void;
}

const EvaluationLandValuationCompAdjustmentNoteModal: React.FC<
  EvaluationLandValuationCompAdjustmentNoteModalProps
> = ({ open, onClose, item, index, onSave }) => {
  const { setValues } = useFormikContext<any>();
  const [noteValue, setNoteValue] = useState('');

  useEffect(() => {
    if (item?.adjustment_note) {
      setNoteValue(item.adjustment_note);
    } else {
      setNoteValue('');
    }
  }, [item]);

  const handleSave = () => {
    setValues((old: any) => {
      const updatedTableData = old.tableData.map((comp: any, idx: number) =>
        idx === index ? { ...comp, adjustment_note: noteValue } : comp
      );
      return { ...old, tableData: updatedTableData };
    });
    onSave();
    onClose();
  };

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
        <div>
          <span className="text-lg font-semibold">Comp Adjustment Notes</span>
          {item?.street_address && (
            <p className="text-sm text-gray-500 mt-1">
              {item.street_address}
              {item.city ? `, ${item.city}` : ''}
              {item.state ? `, ${item.state.toUpperCase()}` : ''}
            </p>
          )}
        </div>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <TextField
          multiline
          rows={8}
          fullWidth
          variant="outlined"
          placeholder="Enter notes about adjustments made to this comparable..."
          value={noteValue}
          onChange={(e) => setNoteValue(e.target.value)}
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

        {/* Quick Notes Suggestions */}
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-600 mb-2">Quick Notes:</p>
          <div className="flex flex-wrap gap-2">
            {[
              'Superior location',
              'Inferior access',
              'Similar topography',
              'Better utilities',
              'Smaller lot size',
              'Corner lot premium',
              'Zoning differences',
            ].map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
                onClick={() => {
                  setNoteValue((prev) =>
                    prev ? `${prev}\n• ${suggestion}` : `• ${suggestion}`
                  );
                }}
              >
                + {suggestion}
              </button>
            ))}
          </div>
        </div>
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
          onClick={handleSave}
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

export default EvaluationLandValuationCompAdjustmentNoteModal;

