import React from 'react';
import { MapPin, Activity, Trash2 } from 'lucide-react';
import { Property } from '../types';

interface PropertyCardProps {
  property: Property;
  isSubject?: boolean;
  onDelete?: (propertyId: string) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, isSubject, onDelete }) => {
  return (
    <div 
      className={`flex flex-col h-full ${isSubject ? 'bg-blue-50' : 'bg-white'}`}
      style={{ backgroundColor: isSubject ? '#eff6ff' : '#ffffff' }}
    >
      <div className="relative h-20 w-full overflow-hidden group" style={{ backgroundColor: isSubject ? '#dbeafe' : '#f1f5f9' }}>
        <img 
          src={property.image} 
          alt={property.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
        />
        {isSubject && (
          <div className="absolute top-1.5 left-1.5 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
            SUBJECT
          </div>
        )}
        {!isSubject && property.status && (
          <div className="absolute top-1.5 right-1.5 bg-slate-900 text-white text-[10px] font-medium px-1.5 py-0.5 rounded shadow-sm">
            {property.status}
          </div>
        )}
        {/* Delete button overlay - appears on hover for non-subject properties */}
        {!isSubject && onDelete && (
          <button
            onClick={() => onDelete(property.id)}
            className="absolute top-1.5 left-1.5 p-1 rounded bg-white/80 hover:bg-red-100 text-slate-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
            title="Remove this comparable"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
      
      <div 
        className={`p-2 flex-1 flex flex-col gap-1 border-b border-r border-slate-200 ${isSubject ? 'bg-blue-50' : 'bg-white'}`}
        style={{ backgroundColor: isSubject ? '#eff6ff' : '#ffffff' }}
      >
        <h3 className="font-bold text-slate-800 text-xs leading-tight line-clamp-1" title={property.name}>
          {property.name}
        </h3>
        
        <div className="flex items-start gap-1 text-[10px] text-slate-500">
          <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5 text-blue-500" />
          <span className="line-clamp-1 leading-tight">{property.address}</span>
        </div>

        {!isSubject && property.distance && (
          <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-auto">
            <Activity className="w-3 h-3 text-emerald-500" />
            <span>{property.distance} away</span>
          </div>
        )}
      </div>
    </div>
  );
};

