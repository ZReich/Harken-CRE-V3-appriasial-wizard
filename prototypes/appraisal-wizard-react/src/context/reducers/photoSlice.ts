// src/context/reducers/photoSlice.ts
// Handles all photo-related actions (staging, cover, report photos)

import type { WizardState, WizardAction } from '../../types';

/**
 * Handles photo-related actions.
 * Returns the updated state if handled, or null if not a photo action.
 */
export function handlePhotoAction(
  state: WizardState,
  action: WizardAction
): WizardState | null {
  switch (action.type) {
    case 'ADD_STAGING_PHOTOS':
      return {
        ...state,
        stagingPhotos: [...state.stagingPhotos, ...action.payload],
      };

    case 'UPDATE_STAGING_PHOTO':
      return {
        ...state,
        stagingPhotos: state.stagingPhotos.map(photo =>
          photo.id === action.payload.id
            ? { ...photo, ...action.payload.updates }
            : photo
        ),
      };

    case 'REMOVE_STAGING_PHOTO':
      return {
        ...state,
        stagingPhotos: state.stagingPhotos.filter(photo => photo.id !== action.payload),
      };

    case 'CLEAR_STAGING_PHOTOS':
      return {
        ...state,
        stagingPhotos: [],
      };

    case 'ASSIGN_STAGING_PHOTO':
      return {
        ...state,
        stagingPhotos: state.stagingPhotos.map(photo =>
          photo.id === action.payload.photoId
            ? { ...photo, assignedSlot: action.payload.slotId }
            : photo
        ),
      };

    case 'SET_COVER_PHOTO':
      return {
        ...state,
        coverPhoto: action.payload,
      };

    case 'REMOVE_COVER_PHOTO':
      return {
        ...state,
        coverPhoto: undefined,
      };

    case 'SET_REPORT_PHOTOS':
      return {
        ...state,
        reportPhotos: action.payload,
      };

    default:
      return null;
  }
}
