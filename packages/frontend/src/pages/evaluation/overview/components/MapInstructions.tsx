import React from 'react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CommonButton from '@/components/elements/button/Button';
import { Icons } from '@/components/icons';
import { EvaluationEnum } from '../../set-up/evaluation-setup-enums';
import { Routes } from '../constants';

interface MapInstructionsProps {
  id: string | null;
  onSubmit: (e: React.FormEvent) => void;
}

const MapInstructions: React.FC<MapInstructionsProps> = ({ id, onSubmit }) => {
  const navigate = useNavigate();

  return (
    <div className="w-1/3 py-9 px-5 absolute bg-white top-[330px] right-4">
      <p className="font-bold pb-2 text-center">
        Select the boundaries of the property
      </p>
      <p className="text-center text-xs pb-4">
        Click on the map where you would like to place a point. Move your
        points to the boundaries of the property. When complete, press 'Save
        & Continue' to save the boundaries.
      </p>
      <div className="flex justify-center gap-3">
        <Button
          variant="contained"
          color="primary"
          size="small"
          className="appraisal-previous-button text-xs !p-0 text-white font-medium h-[40px]"
          onClick={() => navigate(`${Routes.PHOTO_SHEET}?id=${id}`)}
        >
          <Icons.ArrowBackIcon className="cursor-pointer text-sm" />
        </Button>
        <CommonButton
          type="submit"
          variant="contained"
          color="primary"
          size="small"
          onClick={onSubmit}
          style={{ width: '300px', fontSize: '14px' }}
        >
          {EvaluationEnum.SAVE_AND_CONTINUE}
          <Icons.ArrowForwardIcon className="cursor-pointer text-sm" />
        </CommonButton>
      </div>
    </div>
  );
};

export default MapInstructions;