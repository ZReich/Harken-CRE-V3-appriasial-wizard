import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { TextField } from '@mui/material';
import { useMutate, RequestType } from '@/hook/useMutate';

interface EditableExhibitNameProps {
  initialValue: string;
  rowId: string | number;
  evaluationId: string | number;
  onUpdate?: () => void;
}

const EditableExhibitName = ({
  initialValue,
  rowId,
  evaluationId,
  onUpdate,
}: EditableExhibitNameProps) => {
  const [value, setValue] = useState(initialValue);

  const { mutate } = useMutate<any, any>({
    queryKey: `evaluations/update-exhibit/${evaluationId}`,
    endPoint: `evaluations/update-exhibit/${evaluationId}`,
    requestType: RequestType.PATCH,
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (value !== initialValue && value.trim() !== '') {
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
  }, [value, initialValue, rowId, evaluationId, mutate, onUpdate]);

  return (
    <TextField
      value={value}
      onChange={(e) => setValue(e.target.value)}
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

export default EditableExhibitName;
