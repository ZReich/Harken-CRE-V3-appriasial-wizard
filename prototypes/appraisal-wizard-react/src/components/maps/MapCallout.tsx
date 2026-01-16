/**
 * MapCallout.tsx
 * Callout annotation component for maps.
 * Displays a rectangular label with text and an arrow connecting to an anchor point.
 * Uses Harken-blue (#0da1c7) color scheme.
 */

import React, { useState, useRef, useEffect } from 'react';
import { X, GripVertical } from 'lucide-react';
import type { MapAnnotation, MapAnnotationStyle } from '../../types';

interface MapCalloutProps {
  annotation: MapAnnotation;
  isSelected?: boolean;
  isEditing?: boolean;
  onSelect?: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<MapAnnotation>) => void;
  onDelete?: (id: string) => void;
  onPositionChange?: (id: string, position: { lat: number; lng: number }) => void;
  onLabelPositionChange?: (id: string, labelPosition: { lat: number; lng: number }) => void;
  // Map projection functions (to convert lat/lng to screen coordinates)
  latLngToPixel?: (lat: number, lng: number) => { x: number; y: number };
  pixelToLatLng?: (x: number, y: number) => { lat: number; lng: number };
}

const DEFAULT_STYLE: MapAnnotationStyle = {
  backgroundColor: '#0da1c7',
  textColor: '#ffffff',
  lineColor: '#0da1c7',
  lineWidth: 2,
  fontSize: 'md',
};

const FONT_SIZES = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export function MapCallout({
  annotation,
  isSelected = false,
  isEditing = false,
  onSelect,
  onUpdate,
  onDelete,
  onPositionChange,
  onLabelPositionChange,
  latLngToPixel,
  pixelToLatLng,
}: MapCalloutProps) {
  const [isEditingText, setIsEditingText] = useState(false);
  const [editText, setEditText] = useState(annotation.content || '');
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const calloutRef = useRef<HTMLDivElement>(null);

  const style = { ...DEFAULT_STYLE, ...annotation.style };
  const fontSizeClass = FONT_SIZES[style.fontSize || 'md'];

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingText && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingText]);

  // Handle double-click to edit text
  const handleDoubleClick = () => {
    if (onUpdate) {
      setIsEditingText(true);
      setEditText(annotation.content || '');
    }
  };

  // Handle text save
  const handleSaveText = () => {
    onUpdate?.(annotation.id, { content: editText });
    setIsEditingText(false);
  };

  // Handle key press in edit mode
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveText();
    } else if (e.key === 'Escape') {
      setIsEditingText(false);
      setEditText(annotation.content || '');
    }
  };

  // Calculate positions (using CSS positioning for now, can be enhanced with actual map projection)
  const labelPosition = annotation.labelPosition || annotation.position;

  return (
    <div className="relative">
      {/* Connector Line (SVG) - connects anchor to label */}
      {annotation.labelPosition && latLngToPixel && (
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{ overflow: 'visible' }}
        >
          <line
            x1={latLngToPixel(annotation.position.lat, annotation.position.lng).x}
            y1={latLngToPixel(annotation.position.lat, annotation.position.lng).y}
            x2={latLngToPixel(labelPosition.lat, labelPosition.lng).x}
            y2={latLngToPixel(labelPosition.lat, labelPosition.lng).y}
            stroke={style.lineColor}
            strokeWidth={style.lineWidth}
          />
        </svg>
      )}

      {/* Anchor Point (Arrow tip) */}
      <div
        className="absolute w-3 h-3 rounded-full cursor-move"
        style={{
          backgroundColor: style.lineColor,
          border: '2px solid white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }}
      />

      {/* Callout Label */}
      <div
        ref={calloutRef}
        onClick={() => onSelect?.(annotation.id)}
        onDoubleClick={handleDoubleClick}
        className={`
          absolute flex items-center gap-1 px-3 py-1.5 rounded-lg shadow-lg cursor-pointer
          transition-all duration-150
          ${isSelected ? 'ring-2 ring-white ring-offset-2' : ''}
          ${isDragging ? 'opacity-75 scale-105' : ''}
        `}
        style={{
          backgroundColor: style.backgroundColor,
          color: style.textColor,
          boxShadow: `0 4px 12px ${style.backgroundColor}40`,
        }}
      >
        {/* Drag Handle */}
        {isSelected && (
          <GripVertical
            className="w-3 h-3 opacity-60 cursor-grab"
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
          />
        )}

        {/* Content */}
        {isEditingText ? (
          <input
            ref={inputRef}
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleSaveText}
            onKeyDown={handleKeyDown}
            className={`bg-transparent border-none outline-none min-w-[80px] ${fontSizeClass} font-medium`}
            style={{ color: style.textColor }}
          />
        ) : (
          <span className={`${fontSizeClass} font-medium whitespace-nowrap`}>
            {annotation.content || 'Click to edit'}
          </span>
        )}

        {/* Delete Button */}
        {isSelected && onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(annotation.id);
            }}
            className="ml-1 p-0.5 rounded hover:bg-white/20 transition-colors"
            title="Delete callout"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Standalone callout preview for use in static contexts (like report preview)
 */
interface CalloutPreviewProps {
  content: string;
  style?: MapAnnotationStyle;
  className?: string;
}

export function CalloutPreview({ content, style = DEFAULT_STYLE, className = '' }: CalloutPreviewProps) {
  const fontSizeClass = FONT_SIZES[style.fontSize || 'md'];

  return (
    <div
      className={`inline-flex items-center px-3 py-1.5 rounded-lg shadow-lg ${className}`}
      style={{
        backgroundColor: style.backgroundColor,
        color: style.textColor,
        boxShadow: `0 4px 12px ${style.backgroundColor}40`,
      }}
    >
      <span className={`${fontSizeClass} font-medium whitespace-nowrap`}>
        {content}
      </span>
    </div>
  );
}

export default MapCallout;
