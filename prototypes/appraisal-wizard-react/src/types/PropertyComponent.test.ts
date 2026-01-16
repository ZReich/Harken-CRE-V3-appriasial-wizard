/**
 * PropertyComponent Type Validation Tests
 * Tests for the enhanced PropertyComponent interface with land allocation support
 */

import { describe, it, expect } from 'vitest';
import type {
  PropertyComponent,
  LandAllocation,
  MapAnnotation,
  MapAnnotationStyle,
  ReconciliationData,
  CombinedSaleDiscount,
  MultiFamilyUnitMix,
} from './index';

describe('PropertyComponent Types', () => {
  describe('LandAllocation', () => {
    it('should accept valid land allocation with all fields', () => {
      const landAllocation: LandAllocation = {
        acres: 2.5,
        squareFeet: 108900,
        allocationMethod: 'measured',
        shape: 'Rectangular',
        frontage: '200 feet on Main Street',
        accessType: 'separate',
        hasUtilities: true,
        hasLegalAccess: true,
        notes: 'Separate legal parcel',
      };

      expect(landAllocation.acres).toBe(2.5);
      expect(landAllocation.allocationMethod).toBe('measured');
      expect(landAllocation.accessType).toBe('separate');
    });

    it('should accept land allocation with county_records method', () => {
      const landAllocation: LandAllocation = {
        acres: 1.0,
        squareFeet: 43560,
        allocationMethod: 'county_records',
      };

      expect(landAllocation.allocationMethod).toBe('county_records');
    });

    it('should accept minimal land allocation', () => {
      const landAllocation: LandAllocation = {
        acres: null,
        squareFeet: null,
        allocationMethod: 'estimated',
      };

      expect(landAllocation.acres).toBeNull();
      expect(landAllocation.squareFeet).toBeNull();
    });
  });

  describe('PropertyComponent', () => {
    it('should accept valid PropertyComponent with land allocation', () => {
      const component: PropertyComponent = {
        id: 'comp_123',
        name: 'Industrial Warehouse',
        category: 'commercial',
        propertyType: 'industrial-warehouse',
        msOccupancyCode: 'warehouse-general',
        squareFootage: 50000,
        sfSource: 'measured',
        landAllocation: {
          acres: 5.5,
          squareFeet: 239580,
          allocationMethod: 'county_records',
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

      expect(component.landAllocation?.acres).toBe(5.5);
      expect(component.includeDetailedImprovements).toBe(true);
      expect(component.sfSource).toBe('measured');
    });

    it('should accept county_records as sfSource', () => {
      const component: PropertyComponent = {
        id: 'comp_456',
        name: 'Single Family Residence',
        category: 'residential',
        propertyType: 'single-family',
        msOccupancyCode: null,
        squareFootage: 1800,
        sfSource: 'county_records',
        landClassification: 'standard',
        isPrimary: false,
        sortOrder: 1,
        includeDetailedImprovements: false,
        analysisConfig: {
          salesApproach: true,
          incomeApproach: false,
          costApproach: false,
          analysisType: 'contributory',
        },
      };

      expect(component.sfSource).toBe('county_records');
      expect(component.includeDetailedImprovements).toBe(false);
    });

    it('should accept excess land with specific fields', () => {
      const component: PropertyComponent = {
        id: 'comp_789',
        name: 'Excess Land Parcel',
        category: 'land',
        propertyType: 'vacant-land',
        msOccupancyCode: null,
        squareFootage: null,
        sfSource: 'unknown',
        landAllocation: {
          acres: 10.0,
          squareFeet: 435600,
          allocationMethod: 'measured',
          accessType: 'separate',
          hasUtilities: true,
          hasLegalAccess: true,
          frontage: '500 feet on Highway 10',
        },
        landClassification: 'excess',
        isPrimary: false,
        sortOrder: 2,
        includeDetailedImprovements: false,
        analysisConfig: {
          salesApproach: true,
          incomeApproach: false,
          costApproach: false,
          analysisType: 'full',
        },
      };

      expect(component.landClassification).toBe('excess');
      expect(component.landAllocation?.accessType).toBe('separate');
      expect(component.landAllocation?.hasLegalAccess).toBe(true);
    });
  });

  describe('MultiFamilyUnitMix', () => {
    it('should accept county_records as sfSource', () => {
      const unitMix: MultiFamilyUnitMix = {
        unitType: '2br',
        count: 4,
        avgSF: 950,
        sfSource: 'county_records',
        bedrooms: 2,
        bathrooms: 1,
        avgRent: 1200,
      };

      expect(unitMix.sfSource).toBe('county_records');
    });
  });

  describe('MapAnnotation', () => {
    it('should accept callout annotation with label position', () => {
      const annotation: MapAnnotation = {
        id: 'anno_1',
        type: 'callout',
        content: 'Industrial Building',
        position: { lat: 45.123, lng: -111.456 },
        labelPosition: { lat: 45.125, lng: -111.460 },
        style: {
          backgroundColor: '#0da1c7',
          textColor: '#ffffff',
          fontSize: 'md',
        },
      };

      expect(annotation.type).toBe('callout');
      expect(annotation.labelPosition?.lat).toBe(45.125);
      expect(annotation.style?.backgroundColor).toBe('#0da1c7');
    });

    it('should accept boundary annotation with coordinates', () => {
      const annotation: MapAnnotation = {
        id: 'anno_2',
        type: 'boundary',
        position: { lat: 45.123, lng: -111.456 },
        coordinates: [
          { lat: 45.123, lng: -111.456 },
          { lat: 45.125, lng: -111.456 },
          { lat: 45.125, lng: -111.460 },
          { lat: 45.123, lng: -111.460 },
        ],
        style: {
          lineColor: '#0da1c7',
          lineWidth: 3,
        },
      };

      expect(annotation.type).toBe('boundary');
      expect(annotation.coordinates?.length).toBe(4);
    });

    it('should accept rectangle and polygon types', () => {
      const rectAnnotation: MapAnnotation = {
        id: 'anno_3',
        type: 'rectangle',
        position: { lat: 45.123, lng: -111.456 },
        coordinates: [
          { lat: 45.123, lng: -111.456 },
          { lat: 45.125, lng: -111.460 },
        ],
      };

      const polyAnnotation: MapAnnotation = {
        id: 'anno_4',
        type: 'polygon',
        position: { lat: 45.123, lng: -111.456 },
        coordinates: [
          { lat: 45.123, lng: -111.456 },
          { lat: 45.125, lng: -111.456 },
          { lat: 45.126, lng: -111.458 },
          { lat: 45.125, lng: -111.460 },
          { lat: 45.123, lng: -111.460 },
        ],
      };

      expect(rectAnnotation.type).toBe('rectangle');
      expect(polyAnnotation.type).toBe('polygon');
    });
  });

  describe('ReconciliationData', () => {
    it('should accept displayMode and combinedSaleDiscount', () => {
      const reconciliation: ReconciliationData = {
        scenarioReconciliations: [],
        exposurePeriod: 12,
        marketingTime: 6,
        exposureRationale: 'Based on market analysis',
        certifications: ['cert_1', 'cert_2'],
        displayMode: 'both',
        combinedSaleDiscount: {
          enabled: true,
          percentage: 10,
          rationale: 'Properties sold together typically trade at a discount due to limited buyer pool',
        },
      };

      expect(reconciliation.displayMode).toBe('both');
      expect(reconciliation.combinedSaleDiscount?.enabled).toBe(true);
      expect(reconciliation.combinedSaleDiscount?.percentage).toBe(10);
    });

    it('should accept reconciliation without discount', () => {
      const reconciliation: ReconciliationData = {
        scenarioReconciliations: [],
        exposurePeriod: 6,
        marketingTime: 3,
        exposureRationale: 'Standard exposure',
        certifications: [],
        displayMode: 'combined',
      };

      expect(reconciliation.displayMode).toBe('combined');
      expect(reconciliation.combinedSaleDiscount).toBeUndefined();
    });
  });

  describe('CombinedSaleDiscount', () => {
    it('should have required fields', () => {
      const discount: CombinedSaleDiscount = {
        enabled: true,
        percentage: 15,
        rationale: 'Mixed-use property with limited comparable sales',
      };

      expect(discount.enabled).toBe(true);
      expect(discount.percentage).toBe(15);
      expect(discount.rationale).toContain('Mixed-use');
    });
  });

  describe('MapAnnotationStyle', () => {
    it('should accept all style properties', () => {
      const style: MapAnnotationStyle = {
        backgroundColor: '#0da1c7',
        textColor: '#ffffff',
        lineColor: '#0da1c7',
        lineWidth: 2,
        fontSize: 'lg',
      };

      expect(style.backgroundColor).toBe('#0da1c7');
      expect(style.fontSize).toBe('lg');
    });

    it('should allow partial style', () => {
      const style: MapAnnotationStyle = {
        lineColor: '#0da1c7',
      };

      expect(style.lineColor).toBe('#0da1c7');
      expect(style.backgroundColor).toBeUndefined();
    });
  });
});

describe('Backward Compatibility', () => {
  it('should maintain backward compatibility with existing PropertyComponent usage', () => {
    // Simulating how existing code might create a PropertyComponent
    const legacyComponent: PropertyComponent = {
      id: 'legacy_comp',
      name: 'Legacy Component',
      category: 'commercial',
      propertyType: 'office',
      msOccupancyCode: 'office-general',
      squareFootage: 10000,
      sfSource: 'measured', // Old valid value still works
      landClassification: 'standard',
      isPrimary: true,
      sortOrder: 0,
      includeDetailedImprovements: true, // New required field - must be added
      analysisConfig: {
        salesApproach: true,
        incomeApproach: true,
        costApproach: false,
        analysisType: 'full',
      },
    };

    expect(legacyComponent.sfSource).toBe('measured');
    expect(legacyComponent.landAllocation).toBeUndefined(); // Optional field
  });
});
