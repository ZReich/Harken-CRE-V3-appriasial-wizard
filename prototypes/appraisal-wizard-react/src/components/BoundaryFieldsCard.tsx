/**
 * BoundaryFieldsCard Component
 * 
 * Displays property boundary information with directional fields and
 * an optional map preview showing property boundaries.
 */

import React, { useState } from 'react';
import { 
  Map, 
  Navigation,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import EnhancedTextArea from './EnhancedTextArea';

interface BoundaryFieldsCardProps {
  /** Boundary descriptions by direction */
  northBoundary: string;
  onNorthBoundaryChange: (value: string) => void;
  southBoundary: string;
  onSouthBoundaryChange: (value: string) => void;
  eastBoundary: string;
  onEastBoundaryChange: (value: string) => void;
  westBoundary: string;
  onWestBoundaryChange: (value: string) => void;
  
  /** Optional: property coordinates for map display */
  latitude?: number;
  longitude?: number;
  
  /** Optional: cadastral/parcel data source indicator */
  dataSource?: 'cadastral' | 'manual' | 'cotality' | null;
  
  /** Optional: parcel ID from cadastral data */
  parcelId?: string;
  
  /** Optional: callback when user requests boundary data refresh */
  onRefreshBoundaries?: () => void;
  isRefreshing?: boolean;
}

/**
 * Direction indicator button
 */
function DirectionIndicator({ 
  direction, 
  icon: Icon, 
  isActive,
  onClick,
}: { 
  direction: string; 
  icon: React.ElementType; 
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-1.5 rounded-full transition-all ${
        isActive
          ? 'bg-[#0da1c7] text-white'
          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
      }`}
      title={`Edit ${direction} boundary`}
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
}

export function BoundaryFieldsCard({
  northBoundary,
  onNorthBoundaryChange,
  southBoundary,
  onSouthBoundaryChange,
  eastBoundary,
  onEastBoundaryChange,
  westBoundary,
  onWestBoundaryChange,
  latitude,
  longitude,
  dataSource,
  parcelId,
  onRefreshBoundaries,
  isRefreshing = false,
}: BoundaryFieldsCardProps) {
  const [activeDirection, setActiveDirection] = useState<'north' | 'south' | 'east' | 'west'>('north');
  const [showMapPreview, setShowMapPreview] = useState(false);
  
  const hasCoordinates = latitude !== undefined && longitude !== undefined;
  
  // Get the current boundary value based on direction
  const getBoundaryValue = () => {
    switch (activeDirection) {
      case 'north': return northBoundary;
      case 'south': return southBoundary;
      case 'east': return eastBoundary;
      case 'west': return westBoundary;
    }
  };
  
  // Set the boundary value based on direction
  const setBoundaryValue = (value: string) => {
    switch (activeDirection) {
      case 'north': onNorthBoundaryChange(value); break;
      case 'south': onSouthBoundaryChange(value); break;
      case 'east': onEastBoundaryChange(value); break;
      case 'west': onWestBoundaryChange(value); break;
    }
  };
  
  // Get placeholder text
  const getPlaceholder = () => {
    const examples: Record<string, string> = {
      north: 'e.g., Bordered by South 27th Street West to the north',
      south: 'e.g., South boundary is defined by the railroad right-of-way',
      east: 'e.g., Eastern edge abuts adjacent commercial parcels',
      west: 'e.g., Western boundary follows Higgins Avenue',
    };
    return examples[activeDirection];
  };
  
  // Data source indicator
  const getDataSourceBadge = () => {
    if (!dataSource) return null;
    
    const badges: Record<string, { label: string; color: string }> = {
      cadastral: { label: 'Cadastral Data', color: 'bg-purple-100 text-purple-700' },
      cotality: { label: 'Cotality', color: 'bg-blue-100 text-blue-700' },
      manual: { label: 'Manual Entry', color: 'bg-gray-100 text-gray-600' },
    };
    
    const badge = badges[dataSource];
    return (
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };
  
  // Count filled boundaries
  const filledCount = [northBoundary, southBoundary, eastBoundary, westBoundary].filter(b => b.trim()).length;
  
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Map className="w-5 h-5 text-[#0da1c7]" />
          <h3 className="text-lg font-bold text-[#1c3643]">Property Boundaries</h3>
          {getDataSourceBadge()}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Progress indicator */}
          <span className="text-xs text-slate-500">
            {filledCount}/4 defined
          </span>
          
          {/* Refresh button (if data source available) */}
          {onRefreshBoundaries && (
            <button
              onClick={onRefreshBoundaries}
              disabled={isRefreshing}
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#0da1c7] hover:bg-slate-100 transition-colors disabled:opacity-50"
              title="Refresh boundary data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
          
          {/* Map preview toggle */}
          {hasCoordinates && (
            <button
              onClick={() => setShowMapPreview(!showMapPreview)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                showMapPreview
                  ? 'bg-[#0da1c7] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              {showMapPreview ? 'Hide Map' : 'Show Map'}
            </button>
          )}
        </div>
      </div>
      
      {/* Directional compass navigation */}
      <div className="flex justify-center mb-6">
        <div className="relative w-24 h-24">
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Navigation className="w-8 h-8 text-slate-200" />
          </div>
          
          {/* Direction buttons */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2">
            <DirectionIndicator
              direction="North"
              icon={ArrowUp}
              isActive={activeDirection === 'north'}
              onClick={() => setActiveDirection('north')}
            />
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
            <DirectionIndicator
              direction="South"
              icon={ArrowDown}
              isActive={activeDirection === 'south'}
              onClick={() => setActiveDirection('south')}
            />
          </div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2">
            <DirectionIndicator
              direction="West"
              icon={ArrowLeft}
              isActive={activeDirection === 'west'}
              onClick={() => setActiveDirection('west')}
            />
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2">
            <DirectionIndicator
              direction="East"
              icon={ArrowRight}
              isActive={activeDirection === 'east'}
              onClick={() => setActiveDirection('east')}
            />
          </div>
        </div>
      </div>
      
      {/* Active boundary input */}
      <div className="mb-4">
        <EnhancedTextArea
          id={`boundary_${activeDirection}`}
          label={`${activeDirection.charAt(0).toUpperCase() + activeDirection.slice(1)} Boundary`}
          value={getBoundaryValue()}
          onChange={setBoundaryValue}
          placeholder={getPlaceholder()}
          rows={3}
          sectionContext="property_boundaries"
          helperText="Describe what borders the property on this side."
        />
      </div>
      
      {/* Quick summary of all boundaries */}
      <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-lg text-xs">
        <div className={`flex items-center gap-1.5 ${northBoundary ? 'text-slate-700' : 'text-slate-400'}`}>
          <ArrowUp className="w-3 h-3" />
          <span className="truncate">{northBoundary || 'North: Not defined'}</span>
        </div>
        <div className={`flex items-center gap-1.5 ${southBoundary ? 'text-slate-700' : 'text-slate-400'}`}>
          <ArrowDown className="w-3 h-3" />
          <span className="truncate">{southBoundary || 'South: Not defined'}</span>
        </div>
        <div className={`flex items-center gap-1.5 ${eastBoundary ? 'text-slate-700' : 'text-slate-400'}`}>
          <ArrowRight className="w-3 h-3" />
          <span className="truncate">{eastBoundary || 'East: Not defined'}</span>
        </div>
        <div className={`flex items-center gap-1.5 ${westBoundary ? 'text-slate-700' : 'text-slate-400'}`}>
          <ArrowLeft className="w-3 h-3" />
          <span className="truncate">{westBoundary || 'West: Not defined'}</span>
        </div>
      </div>
      
      {/* Map Preview */}
      {showMapPreview && hasCoordinates && (
        <div className="mt-4 rounded-lg overflow-hidden border border-slate-200">
          <div className="bg-slate-100 h-48 flex items-center justify-center relative">
            {/* Static map placeholder - in production, use actual map API */}
            <img
              src={`https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static/${longitude},${latitude},16,0/400x200@2x?access_token=pk.placeholder`}
              alt="Property location"
              className="w-full h-full object-cover"
              onError={(e) => {
                // If map fails to load, show placeholder
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            {/* Fallback placeholder */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100/90">
              <Map className="w-12 h-12 text-slate-300 mb-2" />
              <p className="text-xs text-slate-400">Map Preview</p>
              <p className="text-[10px] text-slate-400 mt-1">
                {latitude?.toFixed(6)}, {longitude?.toFixed(6)}
              </p>
            </div>
          </div>
          <div className="px-3 py-2 bg-slate-50 text-[10px] text-slate-500 flex items-center gap-1">
            {dataSource === 'cadastral' && parcelId ? (
              <>
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-green-700">Cadastral data connected</span>
                <span className="text-slate-400 ml-1">• Parcel: {parcelId}</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3" />
                Boundary overlay will display when Cadastral data is available
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default BoundaryFieldsCard;
