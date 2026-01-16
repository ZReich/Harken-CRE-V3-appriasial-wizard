/**
 * PropertyComponentPanel Tests
 * Tests for land allocation UI, county_records option, excess land fields, and improvements toggle
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PropertyComponentPanel } from './PropertyComponentPanel';
import type { PropertyComponent } from '../types';

// Mock the context provider
vi.mock('../context/WizardContext', () => ({
  useWizard: () => ({
    state: {
      subjectData: { siteArea: '10' },
    },
  }),
}));

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onSave: vi.fn(),
  editingComponent: null,
  existingComponentCount: 0,
};

describe('PropertyComponentPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('County Records SF Source Option', () => {
    it('should display County Records as an option for SF source', () => {
      render(<PropertyComponentPanel {...defaultProps} />);
      
      // Select a category and property type first to see the size allocation section
      const commercialButton = screen.getByText('Commercial');
      fireEvent.click(commercialButton);
      
      // Click a property type
      const retailButton = screen.getByText(/Retail/);
      fireEvent.click(retailButton);
      
      // Check that County Records option exists
      expect(screen.getByText('County Records')).toBeInTheDocument();
    });

    it('should allow selecting County Records as SF source', () => {
      render(<PropertyComponentPanel {...defaultProps} />);
      
      // Select a category and property type
      fireEvent.click(screen.getByText('Commercial'));
      fireEvent.click(screen.getByText(/Retail/));
      
      // Click County Records button
      const countyRecordsBtn = screen.getByText('County Records');
      fireEvent.click(countyRecordsBtn);
      
      // Verify it's selected (should have the selected styling)
      expect(countyRecordsBtn).toHaveClass('border-harken-blue');
    });
  });

  describe('Land Allocation UI', () => {
    it('should display Land Allocation section when category is selected', () => {
      render(<PropertyComponentPanel {...defaultProps} />);
      
      // Select a category and property type
      fireEvent.click(screen.getByText('Commercial'));
      fireEvent.click(screen.getByText(/Retail/));
      
      // Land Allocation section should be visible
      expect(screen.getByText('Land Allocation')).toBeInTheDocument();
    });

    it('should toggle land allocation fields when toggle is clicked', () => {
      render(<PropertyComponentPanel {...defaultProps} />);
      
      // Select a category and property type
      fireEvent.click(screen.getByText('Commercial'));
      fireEvent.click(screen.getByText(/Retail/));
      
      // Initially, land allocation details should be hidden
      expect(screen.queryByText('Allocated Acres')).not.toBeInTheDocument();
      
      // Find and click the Land Allocation toggle
      const toggles = screen.getAllByRole('button');
      const landAllocationToggle = toggles.find(btn => 
        btn.className.includes('rounded-full') && btn.closest('div')?.textContent?.includes('Land Allocation')
      );
      
      if (landAllocationToggle) {
        fireEvent.click(landAllocationToggle);
        
        // After toggle, land allocation fields should be visible
        expect(screen.getByText('Allocated Acres')).toBeInTheDocument();
        expect(screen.getByText('Allocated SF')).toBeInTheDocument();
        expect(screen.getByText('Allocation Method')).toBeInTheDocument();
      }
    });

    it('should auto-calculate SF when acres is entered', async () => {
      render(<PropertyComponentPanel {...defaultProps} />);
      
      // Select a category and property type
      fireEvent.click(screen.getByText('Commercial'));
      fireEvent.click(screen.getByText(/Retail/));
      
      // Enable land allocation toggle
      const toggles = screen.getAllByRole('button');
      const landAllocationToggle = toggles.find(btn => 
        btn.className.includes('rounded-full') && btn.closest('div')?.textContent?.includes('Land Allocation')
      );
      
      if (landAllocationToggle) {
        fireEvent.click(landAllocationToggle);
        
        // Enter acres value
        const acresInput = screen.getByPlaceholderText('e.g., 1.5');
        fireEvent.change(acresInput, { target: { value: '1' } });
        
        // SF should be auto-calculated (1 acre = 43560 SF)
        const sfInput = screen.getByPlaceholderText('e.g., 65,340');
        await waitFor(() => {
          expect(sfInput).toHaveValue(43560);
        });
      }
    });
  });

  describe('Excess Land Fields', () => {
    it('should show excess land fields when land classification is excess', () => {
      render(<PropertyComponentPanel {...defaultProps} />);
      
      // Select land category
      fireEvent.click(screen.getByText('Land'));
      
      // Select vacant land type
      const landTypes = screen.getAllByRole('button');
      const vacantLand = landTypes.find(btn => btn.textContent?.includes('Vacant'));
      if (vacantLand) fireEvent.click(vacantLand);
      
      // Enable land allocation
      const toggles = screen.getAllByRole('button');
      const landAllocationToggle = toggles.find(btn => 
        btn.className.includes('rounded-full') && btn.closest('div')?.textContent?.includes('Land Allocation')
      );
      if (landAllocationToggle) fireEvent.click(landAllocationToggle);
      
      // Select Excess Land classification
      const excessLandBtn = screen.getByText('Excess Land');
      fireEvent.click(excessLandBtn);
      
      // Should show excess land specific fields
      expect(screen.getByText('Excess Land Details (can be sold separately)')).toBeInTheDocument();
      expect(screen.getByText('Access Type')).toBeInTheDocument();
      expect(screen.getByText('Separate Access')).toBeInTheDocument();
      expect(screen.getByText('Has Utilities')).toBeInTheDocument();
      expect(screen.getByText('Has Legal Access')).toBeInTheDocument();
    });

    it('should not show excess land fields for standard classification', () => {
      render(<PropertyComponentPanel {...defaultProps} />);
      
      // Select commercial category
      fireEvent.click(screen.getByText('Commercial'));
      fireEvent.click(screen.getByText(/Retail/));
      
      // Enable land allocation
      const toggles = screen.getAllByRole('button');
      const landAllocationToggle = toggles.find(btn => 
        btn.className.includes('rounded-full') && btn.closest('div')?.textContent?.includes('Land Allocation')
      );
      if (landAllocationToggle) fireEvent.click(landAllocationToggle);
      
      // Standard classification should be selected by default
      expect(screen.queryByText('Excess Land Details (can be sold separately)')).not.toBeInTheDocument();
    });
  });

  describe('Include Detailed Improvements Toggle', () => {
    it('should display improvements toggle', () => {
      render(<PropertyComponentPanel {...defaultProps} />);
      
      // Select a category and property type
      fireEvent.click(screen.getByText('Commercial'));
      fireEvent.click(screen.getByText(/Retail/));
      
      // Should show the improvements toggle
      expect(screen.getByText('Include detailed improvements')).toBeInTheDocument();
    });

    it('should default to true for first (primary) component', () => {
      render(<PropertyComponentPanel {...defaultProps} existingComponentCount={0} />);
      
      // Select a category and property type
      fireEvent.click(screen.getByText('Commercial'));
      fireEvent.click(screen.getByText(/Retail/));
      
      // The description for enabled state should be shown
      expect(screen.getByText(/Full improvement descriptions/)).toBeInTheDocument();
    });

    it('should default to false for subsequent components', () => {
      render(<PropertyComponentPanel {...defaultProps} existingComponentCount={1} />);
      
      // Select a category and property type
      fireEvent.click(screen.getByText('Commercial'));
      fireEvent.click(screen.getByText(/Retail/));
      
      // The description for disabled state should be shown
      expect(screen.getByText(/Skip to analysis sections/)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should include land allocation in saved component when enabled', () => {
      const onSave = vi.fn();
      render(<PropertyComponentPanel {...defaultProps} onSave={onSave} />);
      
      // Fill out required fields
      const nameInput = screen.getByPlaceholderText(/Component name/i);
      fireEvent.change(nameInput, { target: { value: 'Test Warehouse' } });
      
      fireEvent.click(screen.getByText('Commercial'));
      fireEvent.click(screen.getByText(/Warehouse/));
      
      // Enable land allocation
      const toggles = screen.getAllByRole('button');
      const landAllocationToggle = toggles.find(btn => 
        btn.className.includes('rounded-full') && btn.closest('div')?.textContent?.includes('Land Allocation')
      );
      if (landAllocationToggle) {
        fireEvent.click(landAllocationToggle);
        
        // Enter land values
        const acresInput = screen.getByPlaceholderText('e.g., 1.5');
        fireEvent.change(acresInput, { target: { value: '2.5' } });
      }
      
      // Save the component
      const saveBtn = screen.getByText('Add Component');
      fireEvent.click(saveBtn);
      
      // Verify onSave was called with land allocation
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Warehouse',
          landAllocation: expect.objectContaining({
            acres: 2.5,
          }),
        })
      );
    });

    it('should not include land allocation when disabled', () => {
      const onSave = vi.fn();
      render(<PropertyComponentPanel {...defaultProps} onSave={onSave} />);
      
      // Fill out required fields
      const nameInput = screen.getByPlaceholderText(/Component name/i);
      fireEvent.change(nameInput, { target: { value: 'Test Retail' } });
      
      fireEvent.click(screen.getByText('Commercial'));
      fireEvent.click(screen.getByText(/Retail/));
      
      // Don't enable land allocation
      
      // Save the component
      const saveBtn = screen.getByText('Add Component');
      fireEvent.click(saveBtn);
      
      // Verify onSave was called without land allocation
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Retail',
          landAllocation: undefined,
        })
      );
    });
  });

  describe('Editing Existing Component', () => {
    it('should populate land allocation fields when editing', () => {
      const existingComponent: PropertyComponent = {
        id: 'comp_123',
        name: 'Existing Warehouse',
        category: 'commercial',
        propertyType: 'warehouse',
        msOccupancyCode: null,
        squareFootage: 50000,
        sfSource: 'county_records',
        landAllocation: {
          acres: 5.5,
          squareFeet: 239580,
          allocationMethod: 'county_records',
          shape: 'Rectangular',
          frontage: '200 feet',
        },
        landClassification: 'standard',
        isPrimary: true,
        sortOrder: 0,
        includeDetailedImprovements: true,
        analysisConfig: {
          salesApproach: true,
          incomeApproach: true,
          costApproach: false,
          analysisType: 'full',
        },
      };

      render(
        <PropertyComponentPanel 
          {...defaultProps} 
          editingComponent={existingComponent} 
        />
      );

      // Verify land allocation is populated
      expect(screen.getByText('Allocated Acres')).toBeInTheDocument();
      
      const acresInput = screen.getByPlaceholderText('e.g., 1.5');
      expect(acresInput).toHaveValue(5.5);
      
      const sfInput = screen.getByPlaceholderText('e.g., 65,340');
      expect(sfInput).toHaveValue(239580);
    });
  });
});
