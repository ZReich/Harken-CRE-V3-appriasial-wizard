// src/types/compsTypes.ts
import { Dispatch, SetStateAction } from 'react';

export interface CompsFormProps {
  handleClose?: any;
  onClose: () => void;
  open: boolean;
  compsData?: any;
  passCompsData?: any;
  compsLength?: any;
  setUploadCompsStatus?: any;
}

export interface CompRow {
  [key: string]: string | number | boolean | null;
}
// src/types/compsTypes.ts

export type RowType = {
  id: string | number;
  condition?: string;
  [key: string]: string | number | boolean | undefined;
};

export type CompsFormValues = {
  comps: RowType[];
};
export interface Comp {
  condition?: string;
  condition_custom?: string;
  parking?: string;
  parking_custom?: string;
  [key: string]: string | number | boolean | undefined;
}
export interface UploadCompsModalProps {
  open: boolean;
  onClose: () => void;
  setCompsModalOpen: Dispatch<SetStateAction<boolean>>;
  compsLength?: any; // Ensure this is a number
  setCompsData: Dispatch<SetStateAction<Comp[] | null>>; // Ensure this allows null
  compsData?: Comp[] | null; // Ensure compsData can be null
  setUploadCompsStatus?: any;
}

export interface SalesCompsFormProps {
  handleClose: () => void;
  onClose: () => void;
  open: boolean;
  compsData: Comp[]; // Assuming compsData is an array of comparison objects
  passCompsData: (data: Comp[]) => void; // Function to pass updated comps data
}
export interface UploadSalesCompsModalProps {
  open: boolean;
  onClose: () => void;
  setCompsModalOpen: Dispatch<SetStateAction<boolean>>;
  setCompsData: Dispatch<SetStateAction<Comp[] | null>>; // Allow null and array
  compsData: Comp[] | null; // Ensure compsData can be null
}
export interface CreateClientModalProps {
  open: boolean;
  onClose: () => void;
  handleCloseModal: () => void;
  GetData: () => Promise<void>; // Define GetData function type
}
export interface EvaluationCreateClientModalProps {
  open: boolean;
  onClose: () => void;
  handleCloseModal: () => void;
  GetData: () => Promise<void>; // Define GetData function type
}
