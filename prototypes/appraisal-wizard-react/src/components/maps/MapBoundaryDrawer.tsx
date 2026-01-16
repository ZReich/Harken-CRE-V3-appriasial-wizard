/**
 * MapBoundaryDrawer.tsx
 * Component for drawing boundaries, lines, and shapes on maps.
 * Uses Harken-blue (#0da1c7) color scheme.
 */

import React, { useState, useCallback } from 'react';
import type { MapAnnotation, MapAnnotationStyle } from '../../types';

interface Point {
  lat: number;
  lng: number;
}

interface MapBoundaryDrawerProps {
  isDrawing: boolean;
  drawingType: 'line' | 'boundary' | 'polygon' | null;
  currentPoints: Point[];
  onPointAdd: (point: Point) => void;
  onComplete: () => void;
  onCancel: () => void;
  style?: MapAnnotationStyle;
  // Map projection functions
  latLngToPixel?: (lat: number, lng: number) => { x: number; y: number };
  pixelToLatLng?: (x: number, y: number) => { lat: number; lng: number };
}

const DEFAULT_STYLE: MapAnnotationStyle = {
  lineColor: '#0da1c7',
  lineWidth: 3,
  backgroundColor: '#0da1c720', // 20% opacity for fill
  textColor: '#ffffff',
};

export function MapBoundaryDrawer({
  isDrawing,
  drawingType,
  currentPoints,
  onPointAdd,
  onComplete,
  onCancel,
  style = DEFAULT_STYLE,
  latLngToPixel,
  pixelToLatLng,
}: MapBoundaryDrawerProps) {
  if (!isDrawing || !drawingType || !latLngToPixel) {
    return null;
  }

  // Convert points to pixel coordinates
  const pixelPoints = currentPoints.map((p) => latLngToPixel(p.lat, p.lng));

  // Generate SVG path
  const generatePath = () => {
    if (pixelPoints.length === 0) return '';

    const pathParts = pixelPoints.map((p, i) =>
      i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`
    );

    // Close path for polygons/boundaries
    if (drawingType !== 'line' && pixelPoints.length > 2) {
      pathParts.push('Z');
    }

    return pathParts.join(' ');
  };

  // Check if we can close the shape (click near first point)
  const canClose = drawingType !== 'line' && pixelPoints.length > 2;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* SVG for drawing */}
      <svg className="w-full h-full" style={{ overflow: 'visible' }}>
        {/* Drawing path */}
        <path
          d={generatePath()}
          fill={drawingType !== 'line' ? style.backgroundColor : 'none'}
          stroke={style.lineColor}
          strokeWidth={style.lineWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={drawingType === 'line' ? 'none' : '5,5'}
        />

        {/* Points */}
        {pixelPoints.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r={index === 0 && canClose ? 8 : 5}
              fill={style.lineColor}
              stroke="white"
              strokeWidth={2}
              className={index === 0 && canClose ? 'cursor-pointer' : ''}
            />
            {/* First point highlight when can close */}
            {index === 0 && canClose && (
              <circle
                cx={point.x}
                cy={point.y}
                r={12}
                fill="none"
                stroke={style.lineColor}
                strokeWidth={2}
                strokeDasharray="3,3"
                className="animate-pulse"
              />
            )}
          </g>
        ))}
      </svg>

      {/* Instructions overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-harken-dark/80 text-white text-sm">
        {pixelPoints.length === 0 ? (
          <span>Click to start drawing</span>
        ) : drawingType === 'line' ? (
          <span>
            Click to add points • <kbd className="px-1.5 py-0.5 rounded bg-white/20">Enter</kbd> to complete • <kbd className="px-1.5 py-0.5 rounded bg-white/20">Esc</kbd> to cancel
          </span>
        ) : (
          <span>
            Click to add points {canClose && '• Click first point to close'} • <kbd className="px-1.5 py-0.5 rounded bg-white/20">Esc</kbd> to cancel
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Rendered boundary/polygon for display (non-interactive)
 */
interface BoundaryDisplayProps {
  annotation: MapAnnotation;
  isSelected?: boolean;
  onClick?: (id: string) => void;
  latLngToPixel?: (lat: number, lng: number) => { x: number; y: number };
}

export function BoundaryDisplay({
  annotation,
  isSelected = false,
  onClick,
  latLngToPixel,
}: BoundaryDisplayProps) {
  if (!latLngToPixel || !annotation.coordinates || annotation.coordinates.length === 0) {
    return null;
  }

  const style: MapAnnotationStyle = {
    lineColor: '#0da1c7',
    lineWidth: 3,
    backgroundColor: '#0da1c720',
    ...annotation.style,
  };

  // Convert points to pixel coordinates
  const pixelPoints = annotation.coordinates.map((p) => latLngToPixel(p.lat, p.lng));

  // Generate SVG path
  const generatePath = () => {
    const pathParts = pixelPoints.map((p, i) =>
      i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`
    );

    // Close path for polygons/boundaries
    if (annotation.type !== 'line') {
      pathParts.push('Z');
    }

    return pathParts.join(' ');
  };

  return (
    <svg className="absolute inset-0 pointer-events-none" style={{ overflow: 'visible' }}>
      <path
        d={generatePath()}
        fill={annotation.type !== 'line' ? style.backgroundColor : 'none'}
        stroke={style.lineColor}
        strokeWidth={isSelected ? (style.lineWidth || 3) + 1 : style.lineWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={onClick ? 'pointer-events-auto cursor-pointer' : ''}
        onClick={() => onClick?.(annotation.id)}
      />
      
      {/* Selection indicator */}
      {isSelected && (
        <>
          {pixelPoints.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r={6}
              fill={style.lineColor}
              stroke="white"
              strokeWidth={2}
            />
          ))}
        </>
      )}
    </svg>
  );
}

export default MapBoundaryDrawer;
