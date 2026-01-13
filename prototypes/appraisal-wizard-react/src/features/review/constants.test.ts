import { describe, it, expect } from 'vitest';
import {
  createScenarioHeader,
  createScenarioSections,
  createLeaseAbstractionSections,
  LAND_VALUATION_TEMPLATE,
  SALES_COMPARISON_TEMPLATE,
  INCOME_APPROACH_TEMPLATE,
  COST_APPROACH_TEMPLATE,
  SCENARIO_RECONCILIATION_TEMPLATE,
  COMPARABLE_CARDS_PAGE_TEMPLATE,
  COMPARABLE_DETAIL_PAGE_TEMPLATE,
  COMPARABLE_MAP_PAGE_TEMPLATE,
  LEASE_ABSTRACTION_TEMPLATE,
  DCF_PROJECTION_TEMPLATE,
  ZONING_EXHIBIT_TEMPLATE,
  ENVIRONMENTAL_EXHIBIT_TEMPLATE,
  APPROACH_NAMES,
} from './constants';

describe('Scenario Section Generation', () => {
  describe('createScenarioHeader', () => {
    it('should create an As Is header with blue color', () => {
      const header = createScenarioHeader(1, 'As Is');
      
      expect(header.id).toBe('scenario-header-1');
      expect(header.label).toBe('AS IS VALUATION');
      expect(header.isScenarioHeader).toBe(true);
      expect(header.scenarioId).toBe(1);
      expect(header.scenarioName).toBe('As Is');
      expect(header.scenarioColor).toBe('blue');
    });

    it('should create an As Completed header with green color', () => {
      const header = createScenarioHeader(2, 'As Completed');
      
      expect(header.label).toBe('AS COMPLETED VALUATION');
      expect(header.scenarioColor).toBe('green');
    });

    it('should create an As Stabilized header with purple color', () => {
      const header = createScenarioHeader(3, 'As Stabilized');
      
      expect(header.label).toBe('AS STABILIZED VALUATION');
      expect(header.scenarioColor).toBe('purple');
    });
  });

  describe('createScenarioSections', () => {
    it('should create sections for a single approach', () => {
      const sections = createScenarioSections(1, 'As Is', [APPROACH_NAMES.SALES]);
      
      // Should have: header, sales grid, sales cards, sales map, reconciliation
      expect(sections.length).toBe(5);
      expect(sections[0].isScenarioHeader).toBe(true);
      expect(sections[1].id).toBe('sales-comparison-1');
      expect(sections[2].id).toBe('sales-cards-1');
      expect(sections[3].id).toBe('sales-map-1');
      expect(sections[4].id).toBe('reconciliation-1');
    });

    it('should create sections for all approaches', () => {
      const sections = createScenarioSections(1, 'As Is', [
        APPROACH_NAMES.LAND,
        APPROACH_NAMES.SALES,
        APPROACH_NAMES.INCOME,
        APPROACH_NAMES.COST,
      ]);
      
      // header + land(3) + sales(3) + income(4: grid, cards, map, dcf) + cost(1) + recon = 13
      expect(sections.length).toBe(13);
      
      // Verify all scenario sections have correct scenarioId
      sections.forEach(section => {
        expect(section.scenarioId).toBe(1);
      });
    });

    it('should include DCF projection under income approach', () => {
      const sections = createScenarioSections(1, 'As Is', [APPROACH_NAMES.INCOME]);
      
      const dcfSection = sections.find(s => s.id === 'dcf-1');
      expect(dcfSection).toBeDefined();
      expect(dcfSection?.type).toBe('dcf-projection');
      expect(dcfSection?.parentSectionId).toBe('income-approach-1');
    });

    it('should create location maps for each approach', () => {
      const sections = createScenarioSections(1, 'As Is', [
        APPROACH_NAMES.LAND,
        APPROACH_NAMES.SALES,
        APPROACH_NAMES.INCOME,
      ]);
      
      const mapSections = sections.filter(s => s.type === 'comparable-map');
      expect(mapSections.length).toBe(3);
      
      const landMap = mapSections.find(s => s.id === 'land-map-1');
      expect(landMap?.comparableType).toBe('land');
      
      const salesMap = mapSections.find(s => s.id === 'sales-map-1');
      expect(salesMap?.comparableType).toBe('improved');
      
      const rentMap = mapSections.find(s => s.id === 'rent-map-1');
      expect(rentMap?.comparableType).toBe('rent');
    });

    it('should assign correct parent section IDs', () => {
      const sections = createScenarioSections(2, 'As Completed', [APPROACH_NAMES.SALES]);
      
      const cardsSection = sections.find(s => s.id === 'sales-cards-2');
      expect(cardsSection?.parentSectionId).toBe('sales-comparison-2');
      
      const mapSection = sections.find(s => s.id === 'sales-map-2');
      expect(mapSection?.parentSectionId).toBe('sales-comparison-2');
    });

    it('should work with different scenario IDs', () => {
      const asIs = createScenarioSections(1, 'As Is', [APPROACH_NAMES.SALES]);
      const asCompleted = createScenarioSections(2, 'As Completed', [APPROACH_NAMES.SALES]);
      const asStabilized = createScenarioSections(3, 'As Stabilized', [APPROACH_NAMES.SALES]);
      
      expect(asIs[1].id).toBe('sales-comparison-1');
      expect(asCompleted[1].id).toBe('sales-comparison-2');
      expect(asStabilized[1].id).toBe('sales-comparison-3');
      
      expect(asIs[1].scenarioColor).toBe('blue');
      expect(asCompleted[1].scenarioColor).toBe('green');
      expect(asStabilized[1].scenarioColor).toBe('purple');
    });
  });

  describe('createLeaseAbstractionSections', () => {
    it('should create sections for each tenant', () => {
      const tenants = [
        { id: 'tenant-1', name: 'Starbucks' },
        { id: 'tenant-2', name: 'CVS Pharmacy' },
        { id: 'tenant-3', name: 'Local Business' },
      ];
      
      const sections = createLeaseAbstractionSections(tenants, 'income-approach-1');
      
      expect(sections.length).toBe(3);
      expect(sections[0].id).toBe('lease-tenant-1');
      expect(sections[0].label).toBe('Lease: Starbucks');
      expect(sections[0].leaseId).toBe('tenant-1');
      expect(sections[0].parentSectionId).toBe('income-approach-1');
      
      expect(sections[1].label).toBe('Lease: CVS Pharmacy');
      expect(sections[2].label).toBe('Lease: Local Business');
    });

    it('should return empty array for no tenants', () => {
      const sections = createLeaseAbstractionSections([], 'income-approach-1');
      expect(sections).toEqual([]);
    });
  });
});

describe('Template Constants', () => {
  describe('Approach Templates', () => {
    it('LAND_VALUATION_TEMPLATE should have correct structure', () => {
      expect(LAND_VALUATION_TEMPLATE.label).toBe('Land Valuation');
      expect(LAND_VALUATION_TEMPLATE.type).toBe('analysis-grid');
      expect(LAND_VALUATION_TEMPLATE.requiresApproach).toBe(APPROACH_NAMES.LAND);
      expect(LAND_VALUATION_TEMPLATE.fields.length).toBeGreaterThan(0);
    });

    it('SALES_COMPARISON_TEMPLATE should support inline photos', () => {
      expect(SALES_COMPARISON_TEMPLATE.allowInlinePhotos).toBe(true);
      expect(SALES_COMPARISON_TEMPLATE.photoSlots?.length).toBe(3);
    });

    it('INCOME_APPROACH_TEMPLATE should include DCF field', () => {
      const dcfField = INCOME_APPROACH_TEMPLATE.fields.find(f => f.id === 'income_dcf');
      expect(dcfField).toBeDefined();
    });

    it('COST_APPROACH_TEMPLATE should have depreciation field', () => {
      const depField = COST_APPROACH_TEMPLATE.fields.find(f => f.id === 'cost_depreciation');
      expect(depField).toBeDefined();
    });

    it('SCENARIO_RECONCILIATION_TEMPLATE should have weighting field', () => {
      expect(SCENARIO_RECONCILIATION_TEMPLATE.type).toBe('scenario-reconciliation');
      const weightsField = SCENARIO_RECONCILIATION_TEMPLATE.fields.find(f => f.id === 'recon_weights');
      expect(weightsField).toBeDefined();
    });
  });

  describe('Comparable Templates', () => {
    it('COMPARABLE_CARDS_PAGE_TEMPLATE should have card fields', () => {
      expect(COMPARABLE_CARDS_PAGE_TEMPLATE.type).toBe('comparable-cards');
      expect(COMPARABLE_CARDS_PAGE_TEMPLATE.fields.find(f => f.id === 'card_photo')).toBeDefined();
      expect(COMPARABLE_CARDS_PAGE_TEMPLATE.fields.find(f => f.id === 'card_metrics')).toBeDefined();
    });

    it('COMPARABLE_DETAIL_PAGE_TEMPLATE should support inline photos', () => {
      expect(COMPARABLE_DETAIL_PAGE_TEMPLATE.type).toBe('comparable-detail');
      expect(COMPARABLE_DETAIL_PAGE_TEMPLATE.allowInlinePhotos).toBe(true);
      expect(COMPARABLE_DETAIL_PAGE_TEMPLATE.photoSlots?.length).toBe(2);
    });

    it('COMPARABLE_MAP_PAGE_TEMPLATE should have map fields', () => {
      expect(COMPARABLE_MAP_PAGE_TEMPLATE.type).toBe('comparable-map');
      expect(COMPARABLE_MAP_PAGE_TEMPLATE.fields.find(f => f.id === 'map_image')).toBeDefined();
      expect(COMPARABLE_MAP_PAGE_TEMPLATE.fields.find(f => f.id === 'map_legend')).toBeDefined();
    });
  });

  describe('Lease & DCF Templates', () => {
    it('LEASE_ABSTRACTION_TEMPLATE should have all lease fields', () => {
      expect(LEASE_ABSTRACTION_TEMPLATE.type).toBe('lease-abstraction');
      expect(LEASE_ABSTRACTION_TEMPLATE.fields.find(f => f.id === 'lease_tenant')).toBeDefined();
      expect(LEASE_ABSTRACTION_TEMPLATE.fields.find(f => f.id === 'lease_rent')).toBeDefined();
      expect(LEASE_ABSTRACTION_TEMPLATE.fields.find(f => f.id === 'lease_escalations')).toBeDefined();
      expect(LEASE_ABSTRACTION_TEMPLATE.fields.find(f => f.id === 'lease_options')).toBeDefined();
    });

    it('DCF_PROJECTION_TEMPLATE should have DCF fields', () => {
      expect(DCF_PROJECTION_TEMPLATE.type).toBe('dcf-projection');
      expect(DCF_PROJECTION_TEMPLATE.fields.find(f => f.id === 'dcf_projections')).toBeDefined();
      expect(DCF_PROJECTION_TEMPLATE.fields.find(f => f.id === 'dcf_reversion')).toBeDefined();
      expect(DCF_PROJECTION_TEMPLATE.fields.find(f => f.id === 'dcf_sensitivity')).toBeDefined();
    });
  });

  describe('Exhibit Templates', () => {
    it('ZONING_EXHIBIT_TEMPLATE should have zoning fields', () => {
      expect(ZONING_EXHIBIT_TEMPLATE.type).toBe('zoning-exhibit');
      expect(ZONING_EXHIBIT_TEMPLATE.id).toBe('zoning-exhibit');
      expect(ZONING_EXHIBIT_TEMPLATE.fields.find(f => f.id === 'zoning_designation')).toBeDefined();
      expect(ZONING_EXHIBIT_TEMPLATE.fields.find(f => f.id === 'zoning_conformance')).toBeDefined();
    });

    it('ENVIRONMENTAL_EXHIBIT_TEMPLATE should have environmental fields', () => {
      expect(ENVIRONMENTAL_EXHIBIT_TEMPLATE.type).toBe('environmental-exhibit');
      expect(ENVIRONMENTAL_EXHIBIT_TEMPLATE.id).toBe('environmental-exhibit');
      expect(ENVIRONMENTAL_EXHIBIT_TEMPLATE.fields.find(f => f.id === 'env_flood')).toBeDefined();
      expect(ENVIRONMENTAL_EXHIBIT_TEMPLATE.fields.find(f => f.id === 'env_hazards')).toBeDefined();
    });
  });
});
