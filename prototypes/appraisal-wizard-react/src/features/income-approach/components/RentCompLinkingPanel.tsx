// src/features/income-approach/components/RentCompLinkingPanel.tsx
// Panel for linking rent comparables to income line items

import React, { useState, useMemo } from 'react';
import {
  X,
  Link2,
  Unlink,
  CheckCircle,
  Building,
  Home,
  MapPin,
  Calendar,
} from 'lucide-react';
import type { LineItem } from '../types';
import type { RentComp, RentCompMode } from '../rentTypes';

interface RentCompLinkingPanelProps {
  /** The income line item being linked */
  incomeItem: LineItem | null;
  /** Available rent comparables to link */
  rentComparables: RentComp[];
  /** Current rent comp mode */
  rentCompMode: RentCompMode;
  /** Callback when a comp is linked */
  onLink: (incomeItemId: string, rentCompId: string) => void;
  /** Callback when a comp is unlinked */
  onUnlink: (incomeItemId: string, rentCompId: string) => void;
  /** Callback to close the panel */
  onClose: () => void;
}

// Category icons
const CATEGORY_ICONS: Record<RentCompMode, React.ComponentType<{ className?: string }>> = {
  commercial: Building,
  residential: Home,
};

export function RentCompLinkingPanel({
  incomeItem,
  rentComparables,
  rentCompMode,
  onLink,
  onUnlink,
  onClose,
}: RentCompLinkingPanelProps) {
  const [filter, setFilter] = useState('');
  
  if (!incomeItem) return null;

  const linkedIds = incomeItem.linkedRentCompIds || [];
  const Icon = CATEGORY_ICONS[rentCompMode];

  // Filter comparables
  const filteredComps = useMemo(() => {
    if (!filter) return rentComparables;
    const lowerFilter = filter.toLowerCase();
    return rentComparables.filter(
      comp =>
        comp.address.toLowerCase().includes(lowerFilter) ||
        comp.cityStateZip.toLowerCase().includes(lowerFilter)
    );
  }, [rentComparables, filter]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-white dark:bg-elevation-1 shadow-2xl overflow-y-auto animate-slide-in-right">
        {/* Accent bar */}
        <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-harken-blue via-accent-teal-mint to-green-500" />

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white dark:bg-elevation-1 border-b border-light-border dark:border-harken-gray/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-harken-blue/10 dark:bg-cyan-500/20 flex items-center justify-center">
              <Link2 className="w-5 h-5 text-harken-blue dark:text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-harken-gray dark:text-slate-100">
                Link Rent Comparables
              </h2>
              <p className="text-xs text-harken-gray-med dark:text-slate-400">
                {incomeItem.name || 'Income Line'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-harken-gray-med hover:text-harken-gray dark:hover:text-slate-300 rounded-lg hover:bg-harken-gray-light/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Current income line summary */}
          <div className="bg-gradient-to-r from-harken-blue/5 to-accent-teal-mint/5 dark:from-cyan-500/10 dark:to-teal-500/10 rounded-xl p-4 border border-harken-blue/20 dark:border-cyan-500/30">
            <p className="text-sm font-medium text-harken-gray dark:text-slate-200 mb-2">
              Supporting Comparables for:
            </p>
            <p className="text-lg font-bold text-harken-dark dark:text-white">
              {incomeItem.name || 'Unnamed Income Line'}
            </p>
            <p className="text-sm text-harken-gray-med dark:text-slate-400 mt-1">
              {formatCurrency(incomeItem.amount)} / year
            </p>
          </div>

          {/* Linked count */}
          <div className="flex items-center gap-2">
            <CheckCircle className={`w-4 h-4 ${linkedIds.length > 0 ? 'text-green-500' : 'text-harken-gray-light'}`} />
            <span className="text-sm text-harken-gray dark:text-slate-300">
              {linkedIds.length} comparable{linkedIds.length !== 1 ? 's' : ''} linked
            </span>
          </div>

          {/* Search filter */}
          <div>
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search comparables by address..."
              className="w-full px-4 py-2.5 rounded-lg border border-light-border dark:border-harken-gray bg-white dark:bg-elevation-2 text-harken-gray dark:text-slate-100 placeholder:text-harken-gray-light focus:border-harken-blue focus:ring-2 focus:ring-harken-blue/20 outline-none transition-all"
            />
          </div>

          {/* Comparables list */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-harken-gray-med dark:text-slate-400 uppercase tracking-wide">
              Available Comparables ({filteredComps.length})
            </p>

            {filteredComps.length === 0 ? (
              <div className="text-center py-8 text-harken-gray-med dark:text-slate-400">
                <Icon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No rent comparables available</p>
                <p className="text-xs mt-1">Add comparables in the Rent Comps tab</p>
              </div>
            ) : (
              filteredComps.map((comp) => {
                const isLinked = linkedIds.includes(comp.id);
                
                return (
                  <div
                    key={comp.id}
                    className={`relative p-4 rounded-xl border transition-all ${
                      isLinked
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-500/30'
                        : 'bg-surface-1 dark:bg-elevation-2 border-light-border dark:border-harken-gray hover:border-harken-blue/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="w-3.5 h-3.5 text-harken-gray-med shrink-0" />
                          <p className="text-sm font-medium text-harken-gray dark:text-slate-200 truncate">
                            {comp.address}
                          </p>
                        </div>
                        <p className="text-xs text-harken-gray-med dark:text-slate-400 ml-5.5 truncate">
                          {comp.cityStateZip}
                        </p>
                        
                        <div className="flex items-center gap-4 mt-2 text-xs text-harken-gray-med dark:text-slate-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{comp.leaseDate}</span>
                          </div>
                          <div>
                            {rentCompMode === 'commercial' ? (
                              <span>
                                ${comp.nnnRentPerSf?.toFixed(2)}/SF NNN
                              </span>
                            ) : (
                              <span>
                                ${comp.rentPerUnit?.toLocaleString()}/unit
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (isLinked) {
                            onUnlink(incomeItem.id, comp.id);
                          } else {
                            onLink(incomeItem.id, comp.id);
                          }
                        }}
                        className={`shrink-0 p-2 rounded-lg transition-all ${
                          isLinked
                            ? 'bg-green-100 dark:bg-green-800/30 text-green-600 dark:text-green-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400'
                            : 'bg-harken-blue/10 dark:bg-cyan-500/20 text-harken-blue dark:text-cyan-400 hover:bg-harken-blue/20'
                        }`}
                        title={isLinked ? 'Unlink comparable' : 'Link comparable'}
                      >
                        {isLinked ? (
                          <Unlink className="w-4 h-4" />
                        ) : (
                          <Link2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {isLinked && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-between px-6 py-4 bg-white dark:bg-elevation-1 border-t border-light-border dark:border-harken-gray/50">
          <p className="text-sm text-harken-gray-med dark:text-slate-400">
            {linkedIds.length} linked
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-semibold rounded-lg bg-harken-blue hover:bg-harken-blue-hover text-white shadow-md transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default RentCompLinkingPanel;
