/**
 * MapGeneratorPanel Component
 * 
 * Provides one-click generation of subject property maps including:
 * - Aerial View
 * - Location Map
 * - Vicinity Map
 * - Flood Map (placeholder for FEMA integration)
 * - Zoning Map (placeholder)
 * 
 * Used in the Site Details tab of SubjectDataPage.
 */

import { useState, useCallback } from 'react';
import { 
  Map, 
  Satellite, 
  MapPin, 
  Navigation, 
  Waves, 
  Building2, 
  RefreshCw,
  Check,
  X,
  Loader2,
  ChevronDown,
  ChevronUp,
  Trash2,
  Download,
  Eye
} from 'lucide-react';
import { useWizard } from '../context/WizardContext';
import { 
  generateSubjectMap, 
  generateAllSubjectMaps 
} from '../services/mapGenerationService';
import { 
  getFloodZone, 
  generateFloodMapUrl,
  getFloodZoneColor,
  type FloodZoneResult 
} from '../services/femaFloodService';
import type { MapData, MapType } from '../types';

// =================================================================
// TYPES
// =================================================================

interface MapGeneratorPanelProps {
  /** Subject property coordinates */
  coordinates?: {
    lat: number;
    lng: number;
  };
  /** Subject property address */
  address?: string;
  /** Subject property name */
  propertyName?: string;
  /** Callback when maps are generated */
  onMapsGenerated?: (maps: MapData[]) => void;
  /** Additional CSS classes */
  className?: string;
}

interface MapTypeConfig {
  type: 'aerial' | 'location' | 'vicinity' | 'flood' | 'zoning';
  label: string;
  description: string;
  icon: typeof Map;
  color: string;
  implemented: boolean;
}

// =================================================================
// CONSTANTS
// =================================================================

const MAP_TYPE_CONFIGS: MapTypeConfig[] = [
  {
    type: 'aerial',
    label: 'Aerial View',
    description: 'Satellite view of the property',
    icon: Satellite,
    color: '#0284c7',
    implemented: true,
  },
  {
    type: 'location',
    label: 'Location Map',
    description: 'Street map showing property location',
    icon: MapPin,
    color: '#dc2626',
    implemented: true,
  },
  {
    type: 'vicinity',
    label: 'Vicinity Map',
    description: 'Broader area context view',
    icon: Navigation,
    color: '#7c3aed',
    implemented: true,
  },
  {
    type: 'flood',
    label: 'Flood Map',
    description: 'FEMA flood zone lookup',
    icon: Waves,
    color: '#0891b2',
    implemented: true,
  },
  {
    type: 'zoning',
    label: 'Zoning Map',
    description: 'Zoning classification overlay',
    icon: Building2,
    color: '#ea580c',
    implemented: false,
  },
];

// =================================================================
// COMPONENT
// =================================================================

export function MapGeneratorPanel({
  coordinates,
  address,
  propertyName,
  onMapsGenerated,
  className = '',
}: MapGeneratorPanelProps) {
  const { 
    addSubjectMap, 
    removeSubjectMap, 
    getSubjectMaps,
    getSubjectMapsByType,
    setSubjectData,
  } = useWizard();

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingType, setGeneratingType] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [previewMap, setPreviewMap] = useState<MapData | null>(null);
  const [floodZoneData, setFloodZoneData] = useState<FloodZoneResult | null>(null);

  const hasCoordinates = coordinates?.lat !== undefined && coordinates?.lng !== undefined;
  const generatedMaps = getSubjectMaps();

  // Generate a single map type
  const handleGenerateMap = useCallback(async (type: 'aerial' | 'location' | 'vicinity' | 'flood') => {
    if (!hasCoordinates || !coordinates) return;

    setGeneratingType(type);
    
    try {
      // Handle flood map separately - uses FEMA API
      if (type === 'flood') {
        const floodResult = await getFloodZone(coordinates.lat, coordinates.lng);
        
        if (floodResult) {
          setFloodZoneData(floodResult);
          
          // Update wizard state with flood zone data
          setSubjectData({
            femaZone: floodResult.floodZone,
            femaMapPanel: floodResult.panelNumber,
            femaMapDate: floodResult.effectiveDate,
            floodInsuranceRequired: floodResult.insuranceRequired ? 'Yes' : 'No',
          });
          
          // Create a map entry for the flood map
          const floodMap: MapData = {
            id: `map_flood_${Date.now()}`,
            type: 'flood',
            title: `Flood Zone: ${floodResult.floodZone}`,
            description: floodResult.zoneDescription,
            source: 'generated',
            center: { lat: coordinates.lat, lng: coordinates.lng },
            zoom: 15,
            mapType: 'roadmap',
            markers: [{
              id: 'subject',
              lat: coordinates.lat,
              lng: coordinates.lng,
              label: 'Subject Property',
              type: 'subject',
              color: getFloodZoneColor(floodResult.floodZone),
            }],
            imageUrl: floodResult.mapImageUrl,
            reportSections: ['flood-zone', 'site-analysis', 'addenda'],
            capturedAt: new Date().toISOString(),
          };
          
          addSubjectMap(floodMap);
          onMapsGenerated?.([floodMap]);
        }
      } else {
        // Standard map generation
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const map = generateSubjectMap(
          coordinates.lat,
          coordinates.lng,
          type,
          { propertyName, address }
        );
        
        addSubjectMap(map);
        onMapsGenerated?.([map]);
      }
    } catch (error) {
      console.error(`Failed to generate ${type} map:`, error);
      // Show error to user
      alert(`Failed to generate ${type} map: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setGeneratingType(null);
    }
  }, [coordinates, hasCoordinates, propertyName, address, addSubjectMap, onMapsGenerated, setSubjectData]);

  // Generate all maps at once
  const handleGenerateAllMaps = useCallback(async () => {
    if (!hasCoordinates || !coordinates) return;

    setIsGenerating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const maps = generateAllSubjectMaps(
        coordinates.lat,
        coordinates.lng,
        { propertyName, address }
      );
      
      maps.forEach(map => addSubjectMap(map));
      onMapsGenerated?.(maps);
    } catch (error) {
      console.error('Failed to generate maps:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [coordinates, hasCoordinates, propertyName, address, addSubjectMap, onMapsGenerated]);

  // Check if a map type has been generated
  const isMapGenerated = (type: MapType): boolean => {
    return getSubjectMapsByType(type).length > 0;
  };

  // Handle delete map
  const handleDeleteMap = (mapId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeSubjectMap(mapId);
    if (previewMap?.id === mapId) {
      setPreviewMap(null);
    }
  };

  // No coordinates state
  if (!hasCoordinates) {
    return (
      <div className={`bg-slate-50 rounded-xl border border-slate-200 p-6 ${className}`}>
        <div className="text-center text-slate-400">
          <Map className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium text-slate-600">Property Location Required</p>
          <p className="text-sm mt-1">
            Enter the property address above to generate maps
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-slate-200 overflow-hidden ${className}`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors border-b border-slate-200"
      >
        <div className="flex items-center gap-2">
          <Map className="w-5 h-5 text-[#0da1c7]" />
          <span className="font-semibold text-slate-700">Map Generator</span>
          {generatedMaps.length > 0 && (
            <span className="px-2 py-0.5 bg-[#0da1c7] text-white text-xs rounded-full">
              {generatedMaps.length} generated
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {isExpanded && (
        <div className="p-4">
          {/* Quick Actions */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-500">
              Generate maps for your report with one click
            </p>
            <button
              onClick={handleGenerateAllMaps}
              disabled={isGenerating}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#0da1c7] text-white text-sm font-medium rounded-lg hover:bg-[#0b8eaf] transition-colors disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Generate All
                </>
              )}
            </button>
          </div>

          {/* Map Type Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
            {MAP_TYPE_CONFIGS.map(config => {
              const Icon = config.icon;
              const generated = isMapGenerated(config.type);
              const isLoading = generatingType === config.type;
              const disabled = !config.implemented || isLoading || isGenerating;

              return (
                <button
                  key={config.type}
                  onClick={() => config.implemented && handleGenerateMap(config.type as 'aerial' | 'location' | 'vicinity' | 'flood')}
                  disabled={disabled}
                  className={`
                    relative flex flex-col items-center p-3 rounded-lg border-2 transition-all
                    ${generated 
                      ? 'border-green-300 bg-green-50' 
                      : disabled 
                        ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed' 
                        : 'border-slate-200 hover:border-[#0da1c7] hover:bg-[#0da1c7]/5 cursor-pointer'
                    }
                  `}
                  title={!config.implemented ? 'Coming soon' : config.description}
                >
                  {/* Status indicator */}
                  {generated && (
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  {isLoading && (
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#0da1c7] rounded-full flex items-center justify-center">
                      <Loader2 className="w-3 h-3 text-white animate-spin" />
                    </div>
                  )}

                  <Icon 
                    className="w-6 h-6 mb-1.5" 
                    style={{ color: generated ? '#16a34a' : config.color }}
                  />
                  <span className="text-xs font-medium text-slate-700 text-center">
                    {config.label}
                  </span>
                  {!config.implemented && (
                    <span className="text-[10px] text-slate-400 mt-0.5">Coming soon</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Flood Zone Info Card */}
          {floodZoneData && (
            <div className="border border-slate-200 rounded-lg p-4 bg-gradient-to-r from-cyan-50 to-blue-50">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: getFloodZoneColor(floodZoneData.floodZone) + '20' }}
                  >
                    <Waves 
                      className="w-5 h-5" 
                      style={{ color: getFloodZoneColor(floodZoneData.floodZone) }}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">
                        Zone {floodZoneData.floodZone}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        floodZoneData.insuranceRequired 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {floodZoneData.insuranceRequired ? 'Insurance Required' : 'Insurance Optional'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-0.5">
                      {floodZoneData.zoneDescription}
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-200">
                <div>
                  <span className="text-xs text-slate-500">Panel Number</span>
                  <p className="text-sm font-medium text-slate-700">{floodZoneData.panelNumber}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Effective Date</span>
                  <p className="text-sm font-medium text-slate-700">{floodZoneData.effectiveDate}</p>
                </div>
              </div>
            </div>
          )}

          {/* Generated Maps Gallery */}
          {generatedMaps.length > 0 && (
            <div className="border-t border-slate-200 pt-4">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">
                Generated Maps ({generatedMaps.length})
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {generatedMaps.map(map => (
                  <div 
                    key={map.id}
                    className={`
                      relative group rounded-lg overflow-hidden border-2 cursor-pointer transition-all
                      ${previewMap?.id === map.id 
                        ? 'border-[#0da1c7] ring-2 ring-[#0da1c7]/20' 
                        : 'border-slate-200 hover:border-slate-300'
                      }
                    `}
                    onClick={() => setPreviewMap(previewMap?.id === map.id ? null : map)}
                  >
                    {/* Thumbnail */}
                    {map.imageUrl ? (
                      <img 
                        src={map.imageUrl} 
                        alt={map.title}
                        className="w-full h-20 object-cover"
                      />
                    ) : (
                      <div className="w-full h-20 bg-slate-100 flex items-center justify-center">
                        <Map className="w-6 h-6 text-slate-300" />
                      </div>
                    )}
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-2 flex items-center justify-between">
                        <span className="text-xs font-medium text-white truncate">
                          {map.title}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewMap(map);
                            }}
                            className="p-1 bg-white/20 rounded hover:bg-white/40 transition-colors"
                            title="Preview"
                          >
                            <Eye className="w-3 h-3 text-white" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteMap(map.id, e)}
                            className="p-1 bg-red-500/80 rounded hover:bg-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview Modal */}
          {previewMap && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full mx-4 overflow-hidden">
                {/* Preview Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-2">
                    <Map className="w-5 h-5 text-[#0da1c7]" />
                    <span className="font-semibold text-slate-700">{previewMap.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {previewMap.imageUrl && (
                      <a
                        href={previewMap.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-2 py-1 text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Open
                      </a>
                    )}
                    <button
                      onClick={() => setPreviewMap(null)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                {/* Preview Image */}
                <div className="relative" style={{ height: '450px' }}>
                  {previewMap.imageUrl ? (
                    <img 
                      src={previewMap.imageUrl} 
                      alt={previewMap.title}
                      className="w-full h-full object-contain bg-slate-100"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                      <Map className="w-16 h-16 text-slate-300" />
                    </div>
                  )}
                </div>

                {/* Preview Footer */}
                <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 text-sm text-slate-500">
                  <div className="flex items-center justify-between">
                    <span>
                      Center: {previewMap.center.lat.toFixed(6)}, {previewMap.center.lng.toFixed(6)}
                    </span>
                    <span>
                      Zoom: {previewMap.zoom} | Type: {previewMap.mapType}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MapGeneratorPanel;
