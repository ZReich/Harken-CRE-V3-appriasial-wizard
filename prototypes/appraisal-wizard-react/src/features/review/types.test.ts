import { describe, it, expect } from 'vitest';
import {
  SCENARIO_COLORS,
  type ReportSection,
  type ComparableCardData,
  type ComparableCardsPageData,
  type ScenarioGroup,
  type ScenarioType,
  type ComparableMapData,
  type LeaseAbstractionPageData,
  type DCFProjectionPageData,
} from './types';

describe('ReportSection Types', () => {
  describe('ReportSection interface', () => {
    it('should allow creating a basic report section', () => {
      const section: ReportSection = {
        id: 'test-section',
        label: 'Test Section',
        type: 'narrative',
        enabled: true,
        expanded: false,
        fields: [],
      };
      
      expect(section.id).toBe('test-section');
      expect(section.type).toBe('narrative');
      expect(section.enabled).toBe(true);
    });

    it('should support scenario-aware properties', () => {
      const section: ReportSection = {
        id: 'sales-comparison-as-is',
        label: 'Sales Comparison Approach',
        type: 'analysis-grid',
        enabled: true,
        expanded: true,
        fields: [],
        scenarioId: 1,
        scenarioName: 'As Is',
        scenarioColor: 'blue',
      };
      
      expect(section.scenarioId).toBe(1);
      expect(section.scenarioName).toBe('As Is');
      expect(section.scenarioColor).toBe('blue');
    });

    it('should support comparable-specific properties', () => {
      const section: ReportSection = {
        id: 'comp-1',
        label: 'Comparable Sale 1',
        type: 'comparable-cards',
        enabled: true,
        expanded: false,
        fields: [],
        comparableId: 'sale-001',
        comparableType: 'improved',
        parentSectionId: 'sales-comparison',
      };
      
      expect(section.comparableId).toBe('sale-001');
      expect(section.comparableType).toBe('improved');
      expect(section.parentSectionId).toBe('sales-comparison');
    });

    it('should support lease abstraction properties', () => {
      const section: ReportSection = {
        id: 'lease-starbucks',
        label: 'Lease: Starbucks',
        type: 'lease-abstraction',
        enabled: true,
        expanded: false,
        fields: [],
        leaseId: 'lease-001',
        scenarioId: 1,
      };
      
      expect(section.leaseId).toBe('lease-001');
      expect(section.type).toBe('lease-abstraction');
    });

    it('should support map properties', () => {
      const section: ReportSection = {
        id: 'sales-map',
        label: 'Sales Comparison Location Map',
        type: 'comparable-map',
        enabled: true,
        expanded: false,
        fields: [],
        mapImageUrl: 'data:image/png;base64,abc123',
        scenarioId: 1,
      };
      
      expect(section.mapImageUrl).toBe('data:image/png;base64,abc123');
      expect(section.type).toBe('comparable-map');
    });

    it('should support scenario header properties', () => {
      const section: ReportSection = {
        id: 'as-is-header',
        label: 'AS IS VALUATION',
        type: 'section',
        enabled: true,
        expanded: true,
        fields: [],
        isScenarioHeader: true,
        scenarioId: 1,
        scenarioName: 'As Is',
        scenarioColor: 'blue',
      };
      
      expect(section.isScenarioHeader).toBe(true);
      expect(section.scenarioColor).toBe('blue');
    });

    it('should support all new section types', () => {
      const types: ReportSection['type'][] = [
        'comparable-cards',
        'comparable-detail',
        'comparable-map',
        'lease-abstraction',
        'dcf-projection',
        'zoning-exhibit',
        'environmental-exhibit',
        'scenario-reconciliation',
      ];
      
      types.forEach(type => {
        const section: ReportSection = {
          id: `test-${type}`,
          label: `Test ${type}`,
          type,
          enabled: true,
          expanded: false,
          fields: [],
        };
        expect(section.type).toBe(type);
      });
    });
  });
});

describe('Scenario Types', () => {
  describe('SCENARIO_COLORS', () => {
    it('should map As Is to blue', () => {
      expect(SCENARIO_COLORS['As Is']).toBe('blue');
    });

    it('should map As Completed to green', () => {
      expect(SCENARIO_COLORS['As Completed']).toBe('green');
    });

    it('should map As Stabilized to purple', () => {
      expect(SCENARIO_COLORS['As Stabilized']).toBe('purple');
    });
  });

  describe('ScenarioGroup interface', () => {
    it('should allow creating a scenario group with sections', () => {
      const group: ScenarioGroup = {
        id: 1,
        name: 'As Is',
        color: 'blue',
        sections: [
          {
            id: 'land-valuation',
            label: 'Land Valuation',
            type: 'analysis-grid',
            enabled: true,
            expanded: false,
            fields: [],
          },
        ],
      };
      
      expect(group.id).toBe(1);
      expect(group.name).toBe('As Is');
      expect(group.color).toBe('blue');
      expect(group.sections).toHaveLength(1);
    });
  });
});

describe('ComparableCardData Types', () => {
  describe('ComparableCardData interface', () => {
    it('should allow creating a land comparable card', () => {
      const card: ComparableCardData = {
        id: 'land-001',
        type: 'land',
        address: '123 Main St',
        cityStateZip: 'Billings, MT 59101',
        saleDate: '2024-06-15',
        salePrice: 500000,
        pricePerUnit: 5.75,
        unitLabel: 'SF',
        size: 86957,
        sizeLabel: 'SF',
      };
      
      expect(card.type).toBe('land');
      expect(card.pricePerUnit).toBe(5.75);
    });

    it('should allow creating an improved sale card', () => {
      const card: ComparableCardData = {
        id: 'sale-001',
        type: 'improved',
        address: '456 Commercial Blvd',
        photoUrl: 'https://example.com/photo.jpg',
        saleDate: '2024-03-20',
        salePrice: 4500000,
        pricePerUnit: 185,
        unitLabel: 'SF',
        size: 24324,
        sizeLabel: 'SF',
        yearBuilt: 2018,
        propertyType: 'Retail - Strip Center',
        narrative: 'Well-maintained retail center with national credit tenants.',
        netAdjustment: -0.01,
        adjustedValue: 4455000,
      };
      
      expect(card.type).toBe('improved');
      expect(card.narrative).toBeDefined();
      expect(card.netAdjustment).toBe(-0.01);
    });

    it('should allow creating a rent comparable card', () => {
      const card: ComparableCardData = {
        id: 'rent-001',
        type: 'rent',
        address: '789 Business Park Dr',
        pricePerUnit: 18.50,
        unitLabel: 'SF/Year NNN',
        size: 5500,
        sizeLabel: 'SF',
        yearBuilt: 2015,
        propertyType: 'Office - Class B',
      };
      
      expect(card.type).toBe('rent');
      expect(card.unitLabel).toBe('SF/Year NNN');
    });
  });

  describe('ComparableCardsPageData interface', () => {
    it('should group comparables by approach type', () => {
      const pageData: ComparableCardsPageData = {
        approachType: 'sales',
        scenarioId: 1,
        scenarioName: 'As Is',
        comparables: [
          { id: 'sale-001', type: 'improved', address: '123 Main St' },
          { id: 'sale-002', type: 'improved', address: '456 Oak Ave' },
          { id: 'sale-003', type: 'improved', address: '789 Pine Rd' },
        ],
      };
      
      expect(pageData.approachType).toBe('sales');
      expect(pageData.comparables).toHaveLength(3);
    });
  });
});

describe('ComparableMapData Types', () => {
  it('should allow creating map data with pins', () => {
    const mapData: ComparableMapData = {
      approachType: 'sales',
      scenarioId: 1,
      imageUrl: 'data:image/png;base64,abc123',
      subjectPin: {
        lat: 45.7833,
        lng: -108.5007,
        address: '6168 Rosemary Rd, Billings, MT',
      },
      comparablePins: [
        { id: 'comp-1', number: 1, lat: 45.7850, lng: -108.5100, address: '2712 46th St W' },
        { id: 'comp-2', number: 2, lat: 45.6900, lng: -110.3600, address: '61 Antelope Flats' },
      ],
    };
    
    expect(mapData.subjectPin.address).toContain('Billings');
    expect(mapData.comparablePins).toHaveLength(2);
    expect(mapData.comparablePins[0].number).toBe(1);
  });
});

describe('LeaseAbstractionPageData Types', () => {
  it('should allow creating complete lease data', () => {
    const lease: LeaseAbstractionPageData = {
      leaseId: 'lease-001',
      tenantName: 'Starbucks',
      tenantLegalName: 'Starbucks Coffee Company',
      tenantType: 'national',
      suiteNumber: 'Suite 100',
      leasedSqFt: 2500,
      leaseType: 'NNN',
      leaseStartDate: '2022-01-01',
      leaseEndDate: '2032-12-31',
      currentBaseRent: 62500,
      rentPerSf: 25,
      escalations: [
        { type: 'fixed', rate: 3, effectiveDate: '2023-01-01' },
      ],
      options: [
        { type: 'renewal', terms: '2 x 5-year options at market rate' },
      ],
      notes: 'National credit tenant with strong sales performance.',
    };
    
    expect(lease.tenantType).toBe('national');
    expect(lease.escalations).toHaveLength(1);
    expect(lease.options).toHaveLength(1);
  });

  it('should allow minimal lease data', () => {
    const lease: LeaseAbstractionPageData = {
      leaseId: 'lease-002',
      tenantName: 'Local Business',
      leasedSqFt: 1000,
      leaseType: 'Gross',
      leaseStartDate: '2024-01-01',
      leaseEndDate: '2026-12-31',
      currentBaseRent: 24000,
    };
    
    expect(lease.tenantLegalName).toBeUndefined();
    expect(lease.escalations).toBeUndefined();
  });
});

describe('DCFProjectionPageData Types', () => {
  it('should allow creating DCF projection data', () => {
    const dcf: DCFProjectionPageData = {
      scenarioId: 1,
      scenarioName: 'As Is',
      holdingPeriod: 10,
      discountRate: 8.5,
      terminalCapRate: 7.0,
      annualGrowthRate: 3.0,
      yearlyProjections: [
        { year: 1, noi: 500000, pvFactor: 0.9217, pvCashFlow: 460850 },
        { year: 2, noi: 515000, pvFactor: 0.8495, pvCashFlow: 437493 },
        { year: 3, noi: 530450, pvFactor: 0.7829, pvCashFlow: 415327 },
      ],
      reversionValue: 8500000,
      pvReversion: 3892142,
      totalPresentValue: 5205812,
    };
    
    expect(dcf.holdingPeriod).toBe(10);
    expect(dcf.yearlyProjections).toHaveLength(3);
    expect(dcf.totalPresentValue).toBeGreaterThan(0);
  });
});
