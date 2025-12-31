import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { TextField } from '@mui/material';
import { useMutate, RequestType } from '@/hook/useMutate';

interface EditableAppraisalExhibitNameProps {
  initialValue: string;
  rowId: string | number;
  appraisalId: string | number;
  onUpdate?: () => void;
}

const EditableAppraisalExhibitName = ({
  initialValue,
  rowId,
  appraisalId,
  onUpdate,
}: EditableAppraisalExhibitNameProps) => {
  const [value, setValue] = useState(initialValue);

  const { mutate } = useMutate<any, any>({
    queryKey: `appraisals/update-exhibit/${appraisalId}`,
    endPoint: `appraisals/update-exhibit/${appraisalId}`,
    requestType: RequestType.PATCH,
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (value !== initialValue && value.trim()) {
        mutate(
          {
            fileId: rowId,
            fileName: value,
          },
          {
            onSuccess: (response: any) => {
              if (response?.data?.statusCode === 200) {
                toast.success('Saved successfully');
              }
            },
            onError: (error: any) => {
              toast.error(
                error?.response?.data?.message ||
                  'Failed to update exhibit name'
              );
            },
          }
        );
        onUpdate?.();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [value, initialValue, rowId, appraisalId, mutate, onUpdate]);

  return (
    <TextField
      value={value}
      onChange={(e) => {
        console.log('Input value:', e.target.value);
        setValue(e.target.value);
      }}
      onKeyDown={(e) => {
        console.log('Key pressed:', e.key, e.code);
        if (e.key === ' ') {
          e.stopPropagation();
        }
      }}
      variant="standard"
      fullWidth
      InputProps={{
        disableUnderline: false,
        style: { fontSize: 'inherit' },
      }}
      sx={{
        '& .MuiInput-underline:before': {
          borderBottomColor: 'transparent',
        },
        '& .MuiInput-underline:hover:before': {
          borderBottomColor: '#1976d2',
        },
        '& .MuiInput-underline:after': {
          borderBottomColor: '#1976d2',
        },
      }}
    />
  );
};

export default EditableAppraisalExhibitName;
