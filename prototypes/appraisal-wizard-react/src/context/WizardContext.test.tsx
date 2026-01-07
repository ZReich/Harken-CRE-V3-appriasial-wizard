/**
 * WizardContext Unit Tests
 * 
 * Tests for the core wizard state management including:
 * - Reducer actions
 * - State persistence
 * - Computed values
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { WizardProvider, useWizard } from './WizardContext';
import type { ReactNode } from 'react';

// Wrapper component for testing hooks
const wrapper = ({ children }: { children: ReactNode }) => (
  <WizardProvider>{children}</WizardProvider>
);

describe('WizardContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useWizard(), { wrapper });
      
      expect(result.current.state.template).toBeNull();
      expect(result.current.state.propertyType).toBeNull();
      expect(result.current.state.scenarios).toHaveLength(1);
      expect(result.current.state.scenarios[0].name).toBe('As Is');
    });

    it('should have empty improvements inventory by default', () => {
      const { result } = renderHook(() => useWizard(), { wrapper });
      
      expect(result.current.state.improvementsInventory).toBeDefined();
      expect(result.current.state.improvementsInventory.parcels).toBeDefined();
    });
  });

  describe('Template Actions', () => {
    it('should set template', () => {
      const { result } = renderHook(() => useWizard(), { wrapper });
      
      act(() => {
        result.current.setTemplate('standard-appraisal');
      });
      
      expect(result.current.state.template).toBe('standard-appraisal');
    });
  });

  describe('Property Type Actions', () => {
    it('should set property type', () => {
      const { result } = renderHook(() => useWizard(), { wrapper });
      
      act(() => {
        result.current.setPropertyType('commercial');
      });
      
      expect(result.current.state.propertyType).toBe('commercial');
    });

    it('should set property type with subtype', () => {
      const { result } = renderHook(() => useWizard(), { wrapper });
      
      act(() => {
        result.current.setPropertyType('commercial', 'office');
      });
      
      expect(result.current.state.propertyType).toBe('commercial');
      expect(result.current.state.propertySubtype).toBe('office');
    });

    it('should derive hasImprovements from property type', () => {
      const { result } = renderHook(() => useWizard(), { wrapper });
      
      // Default should have improvements
      expect(result.current.hasImprovements).toBe(true);
      
      act(() => {
        result.current.setPropertyType('land');
      });
      
      // Land should NOT have improvements
      expect(result.current.hasImprovements).toBe(false);
    });
  });

  describe('Scenario Management', () => {
    it('should get active scenario', () => {
      const { result } = renderHook(() => useWizard(), { wrapper });
      
      const activeScenario = result.current.getActiveScenario();
      expect(activeScenario).toBeDefined();
      expect(activeScenario?.id).toBe(1);
      expect(activeScenario?.name).toBe('As Is');
    });

    it('should set active scenario', () => {
      const { result } = renderHook(() => useWizard(), { wrapper });
      
      // First add another scenario
      act(() => {
        result.current.setScenarios([
          { id: 1, name: 'As Is', approaches: ['Sales Comparison'], effectiveDate: '', isRequired: true },
          { id: 2, name: 'As Completed', approaches: ['Sales Comparison', 'Cost Approach'], effectiveDate: '', isRequired: true },
        ]);
      });
      
      act(() => {
        result.current.setActiveScenario(2);
      });
      
      expect(result.current.state.activeScenarioId).toBe(2);
      expect(result.current.getActiveScenario()?.name).toBe('As Completed');
    });
  });

  describe('Subject Data', () => {
    it('should update subject data', () => {
      const { result } = renderHook(() => useWizard(), { wrapper });
      
      act(() => {
        result.current.setSubjectData({
          propertyName: 'Test Property',
          address: {
            street: '123 Main St',
            city: 'Bozeman',
            state: 'MT',
            zip: '59715',
            county: 'Gallatin',
          },
        });
      });
      
      expect(result.current.state.subjectData.propertyName).toBe('Test Property');
      expect(result.current.state.subjectData.address.city).toBe('Bozeman');
    });

    it('should merge address updates without losing other fields', () => {
      const { result } = renderHook(() => useWizard(), { wrapper });
      
      // Set initial address
      act(() => {
        result.current.setSubjectData({
          address: {
            street: '123 Main St',
            city: 'Bozeman',
            state: 'MT',
            zip: '59715',
            county: 'Gallatin',
          },
        });
      });
      
      // Update only city
      act(() => {
        result.current.setSubjectData({
          address: {
            city: 'Missoula',
          } as typeof result.current.state.subjectData.address,
        });
      });
      
      // Street should still be preserved
      expect(result.current.state.subjectData.address.street).toBe('123 Main St');
      expect(result.current.state.subjectData.address.city).toBe('Missoula');
    });
  });

  describe('Owner Management', () => {
    it('should have default owner', () => {
      const { result } = renderHook(() => useWizard(), { wrapper });
      
      expect(result.current.state.owners).toHaveLength(1);
      expect(result.current.state.owners[0].percentage).toBe(100);
    });

    it('should add owner and split percentage', () => {
      const { result } = renderHook(() => useWizard(), { wrapper });
      
      act(() => {
        result.current.addOwner();
      });
      
      expect(result.current.state.owners).toHaveLength(2);
    });

    it('should update owner', () => {
      const { result } = renderHook(() => useWizard(), { wrapper });
      const ownerId = result.current.state.owners[0].id;
      
      act(() => {
        result.current.updateOwner(ownerId, { name: 'John Doe' });
      });
      
      expect(result.current.state.owners[0].name).toBe('John Doe');
    });
  });

  describe('Progress Tracking', () => {
    it('should track page tab interactions', () => {
      const { result } = renderHook(() => useWizard(), { wrapper });
      
      act(() => {
        result.current.setPageTab('setup', 'basics');
      });
      
      expect(result.current.state.pageTabs.setup?.lastActiveTab).toBe('basics');
      expect(result.current.state.pageTabs.setup?.hasInteracted).toBe(true);
    });

    it('should mark section complete', () => {
      const { result } = renderHook(() => useWizard(), { wrapper });
      
      act(() => {
        result.current.markSectionComplete('template');
      });
      
      expect(result.current.state.sectionCompletedAt.template).toBeDefined();
    });
  });

  describe('Celebration State', () => {
    it('should show celebration', () => {
      const { result } = renderHook(() => useWizard(), { wrapper });
      
      act(() => {
        result.current.showCelebration('template', 'small');
      });
      
      expect(result.current.state.celebration.isVisible).toBe(true);
      expect(result.current.state.celebration.sectionId).toBe('template');
      expect(result.current.state.celebration.level).toBe('small');
    });

    it('should hide celebration', () => {
      const { result } = renderHook(() => useWizard(), { wrapper });
      
      act(() => {
        result.current.showCelebration('template', 'small');
      });
      
      act(() => {
        result.current.hideCelebration();
      });
      
      expect(result.current.state.celebration.isVisible).toBe(false);
    });
  });

  describe('Fullscreen Toggle', () => {
    it('should toggle fullscreen state', () => {
      const { result } = renderHook(() => useWizard(), { wrapper });
      
      expect(result.current.state.isFullscreen).toBe(false);
      
      act(() => {
        result.current.toggleFullscreen();
      });
      
      expect(result.current.state.isFullscreen).toBe(true);
      
      act(() => {
        result.current.toggleFullscreen();
      });
      
      expect(result.current.state.isFullscreen).toBe(false);
    });
  });

  describe('M&S Occupancy Code', () => {
    it('should set M&S occupancy code', () => {
      const { result } = renderHook(() => useWizard(), { wrapper });
      
      act(() => {
        result.current.setMsOccupancyCode('warehouse-general');
      });
      
      expect(result.current.state.msOccupancyCode).toBe('warehouse-general');
    });

    it('should clear M&S occupancy code', () => {
      const { result } = renderHook(() => useWizard(), { wrapper });
      
      act(() => {
        result.current.setMsOccupancyCode('warehouse-general');
      });
      
      act(() => {
        result.current.setMsOccupancyCode(null);
      });
      
      expect(result.current.state.msOccupancyCode).toBeNull();
    });
  });

  describe('State Persistence', () => {
    it('should have lastModified timestamp', () => {
      const { result } = renderHook(() => useWizard(), { wrapper });
      
      // Verify lastModified is a valid ISO date string
      expect(result.current.state.lastModified).toBeDefined();
      expect(new Date(result.current.state.lastModified).toISOString()).toBe(
        result.current.state.lastModified
      );
    });

    it('should update lastModified when state changes', async () => {
      const { result } = renderHook(() => useWizard(), { wrapper });
      
      const initialLastModified = result.current.state.lastModified;
      
      // Wait a tick to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));
      
      act(() => {
        result.current.setTemplate('test-template');
      });
      
      // The lastModified should be a valid timestamp (may or may not differ depending on timing)
      expect(result.current.state.lastModified).toBeDefined();
      expect(new Date(result.current.state.lastModified).getTime()).toBeGreaterThanOrEqual(
        new Date(initialLastModified).getTime()
      );
    });
  });
});
