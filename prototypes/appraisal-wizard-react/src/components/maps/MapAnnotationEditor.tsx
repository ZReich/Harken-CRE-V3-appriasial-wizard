/**
 * MapAnnotationEditor.tsx
 * Overlay component for editing map annotations in Report Preview.
 * Provides a toolbar and annotation rendering on top of map images.
 */

import React, { useState, useCallback } from 'react';
import { Edit2, X, Check } from 'lucide-react';
import { MapAnnotationToolbar } from './MapAnnotationToolbar';
import { MapCallout, CalloutPreview } from './MapCallout';
import { BoundaryDisplay } from './MapBoundaryDrawer';
import { useMapAnnotations, DEFAULT_ANNOTATION_STYLE } from './useMapAnnotations';
import type { MapAnnotation } from '../../types';

interface MapAnnotationEditorProps {
  /** Initial annotations */
  annotations: MapAnnotation[];
  /** Callback when annotations change */
  onAnnotationsChange: (annotations: MapAnnotation[]) => void;
  /** Map image URL or element */
  mapImageUrl?: string;
  /** Whether editing is enabled */
  isEditable?: boolean;
  /** Container width */
  width?: number | string;
  /** Container height */
  height?: number | string;
  /** Class name for container */
  className?: string;
}

export function MapAnnotationEditor({
  annotations: initialAnnotations,
  onAnnotationsChange,
  mapImageUrl,
  isEditable = true,
  width = '100%',
  height = 400,
  className = '',
}: MapAnnotationEditorProps) {
  const [isEditMode, setIsEditMode] = useState(false);

  const {
    annotations,
    activeTool,
    selectedAnnotationId,
    setActiveTool,
    setSelectedAnnotation,
    addAnnotation,
    updateAnnotation,
    removeAnnotation,
    clearAnnotations,
    undoLastAnnotation,
  } = useMapAnnotations({
    initialAnnotations,
    onChange: onAnnotationsChange,
  });

  // Handle click on map to add annotation
  const handleMapClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditMode) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert pixel to percentage for responsive positioning
    const posX = (x / rect.width) * 100;
    const posY = (y / rect.height) * 100;

    if (activeTool === 'callout') {
      const newAnnotation = addAnnotation({
        type: 'callout',
        content: 'New Label',
        position: { lat: posY, lng: posX }, // Using lat/lng for percentage position
        style: DEFAULT_ANNOTATION_STYLE,
      });
      setSelectedAnnotation(newAnnotation.id);
      setActiveTool('select');
    }
  }, [isEditMode, activeTool, addAnnotation, setSelectedAnnotation, setActiveTool]);

  // Handle toggling edit mode
  const handleToggleEdit = () => {
    if (isEditMode) {
      // Exiting edit mode
      setSelectedAnnotation(null);
      setActiveTool('select');
    }
    setIsEditMode(!isEditMode);
  };

  // Render annotations as positioned elements
  const renderAnnotations = () => {
    return annotations.map((annotation) => {
      const isSelected = selectedAnnotationId === annotation.id;

      // For callouts - position using percentage
      if (annotation.type === 'callout') {
        const style = {
          left: `${annotation.position.lng}%`,
          top: `${annotation.position.lat}%`,
          transform: 'translate(-50%, -100%)',
        };

        return (
          <div
            key={annotation.id}
            className={`absolute cursor-pointer transition-all ${isSelected ? 'z-10' : ''}`}
            style={style}
            onClick={(e) => {
              e.stopPropagation();
              if (isEditMode) {
                setSelectedAnnotation(annotation.id);
              }
            }}
          >
            <CalloutPreview
              content={annotation.content || ''}
              style={annotation.style}
              className={isSelected ? 'ring-2 ring-white ring-offset-2' : ''}
            />
            {/* Delete button when selected */}
            {isSelected && isEditMode && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeAnnotation(annotation.id);
                }}
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        );
      }

      return null;
    });
  };

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Map Image */}
      {mapImageUrl && (
        <img
          src={mapImageUrl}
          alt="Map"
          className="w-full h-full object-cover"
        />
      )}

      {/* Annotation Layer */}
      <div
        className="absolute inset-0"
        onClick={handleMapClick}
      >
        {renderAnnotations()}
      </div>

      {/* Edit Toggle Button */}
      {isEditable && (
        <button
          onClick={handleToggleEdit}
          className={`
            absolute top-3 right-3 p-2 rounded-lg shadow-lg transition-all z-20
            ${isEditMode
              ? 'bg-harken-blue text-white'
              : 'bg-white/90 dark:bg-elevation-2/90 text-harken-gray hover:text-harken-blue dark:text-slate-400 dark:hover:text-cyan-400'
            }
          `}
          title={isEditMode ? 'Exit edit mode' : 'Edit annotations'}
        >
          {isEditMode ? <Check className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
        </button>
      )}

      {/* Toolbar - shows when in edit mode */}
      {isEditMode && (
        <div className="absolute top-3 left-3 z-20">
          <MapAnnotationToolbar
            activeTool={activeTool}
            onToolChange={setActiveTool}
            onUndo={undoLastAnnotation}
            onClear={clearAnnotations}
            hasAnnotations={annotations.length > 0}
            canUndo={annotations.length > 0}
            compact
          />
        </div>
      )}

      {/* Edit mode indicator */}
      {isEditMode && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-harken-blue text-white text-xs font-medium shadow-lg z-20">
          Click map to add callout • Click annotation to select • Click{' '}
          <Check className="w-3 h-3 inline" /> to save
        </div>
      )}
    </div>
  );
}

export default MapAnnotationEditor;
