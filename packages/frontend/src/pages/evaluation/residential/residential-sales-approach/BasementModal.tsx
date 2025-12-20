import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';

interface BasementModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (finishedValue: string, unfinishedValue: string) => void;
  initialFinished?: string;
  initialUnfinished?: string;
}

const BasementModal: React.FC<BasementModalProps> = ({
  open,
  onClose,
  onSave,
  initialFinished = '',
  initialUnfinished = ''
}) => {
  const [finishedValue, setFinishedValue] = useState(initialFinished);
  const [unfinishedValue, setUnfinishedValue] = useState(initialUnfinished);

  const handleSave = () => {
    onSave(finishedValue, unfinishedValue);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Basement Details</DialogTitle>
      <DialogContent>
        <div className="mb-4 mt-2">
          <TextField
            label="Basement Finished"
            fullWidth
            value={finishedValue}
            onChange={(e) => setFinishedValue(e.target.value)}
            margin="dense"
          />
        </div>
        <div>
          <TextField
            label="Basement Unfinished"
            fullWidth
            value={unfinishedValue}
            onChange={(e) => setUnfinishedValue(e.target.value)}
            margin="dense"
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" className='cursor-pointer'>
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary" className='cursor-pointer'>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BasementModal;