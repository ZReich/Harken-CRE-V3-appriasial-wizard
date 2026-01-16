/**
 * componentSlice Reducer Tests
 * Tests for property component actions including land allocation
 */

import { describe, it, expect } from 'vitest';
import { handleComponentAction } from './componentSlice';
import type { WizardState, PropertyComponent } from '../../types';

// Create a minimal test state
const createTestState = (overrides: Partial<WizardState> = {}): WizardState => ({
  template: null,
  propertyType: null,
  propertySubtype: null,
  msOccupancyCode: null,
  propertyComponents: [],
  activeComponentId: null,
  incomeApproachInstances: [],
  scenarioReconciliations: [],
  scenarios: [{ id: 1, name: 'As Is', approaches: ['Sales Comparison'], effectiveDate: '', isRequired: true }],
  activeScenarioId: 1,
  subjectData: {
    propertyName: '',
    address: { street: '', city: '', state: '', zip: '', county: '' },
    taxId: '',
    legalDescription: '',
    reportDate: '',
    inspectionDate: '',
    effectiveDate: '',
    lastSaleDate: '',
    lastSalePrice: '',
    transactionHistory: '',
    areaDescription: '',
    neighborhoodBoundaries: '',
    neighborhoodCharacteristics: '',
    specificLocation: '',
    siteArea: '10',
    siteAreaUnit: 'acres',
    shape: '',
    frontage: '',
    topography: '',
    environmental: '',
    easements: '',
    zoningClass: '',
    zoningDescription: '',
    zoningConforming: false,
    waterSource: '',
    waterProvider: '',
    sewerType: '',
    electricProvider: '',
    naturalGas: '',
    telecom: '',
    stormDrainage: '',
    stormDrainageNotes: '',
    fireHydrantDistance: '',
    approachType: '',
    accessQuality: '',
    visibility: '',
    truckAccess: '',
    pavingType: '',
    fencingType: '',
    yardStorage: '',
    landscaping: '',
    femaZone: '',
    femaMapPanel: '',
    femaMapDate: '',
    floodInsuranceRequired: '',
    siteDescriptionNarrative: '',
    appraisalPurpose: '',
    intendedUsers: '',
    propertyInterest: '',
    inspectorName: '',
    inspectorLicense: '',
    inspectionType: 'interior_exterior',
    personalInspection: true,
    certificationAcknowledged: false,
    licenseNumber: '',
    licenseState: '',
    licenseExpiration: '',
    additionalCertifications: '',
    appraisalAssistance: '',
    propertyStatus: undefined,
    occupancyStatus: undefined,
    plannedChanges: undefined,
    loanPurpose: undefined,
    coordinates: undefined,
    cadastralData: undefined,
  },
  improvementsInventory: { schemaVersion: 1, parcels: [] },
  siteImprovements: [],
  costApproachBuildingSelections: {},
  costApproachBuildingCostData: {},
  extractedData: {},
  uploadedDocuments: [],
  documentFieldSources: {},
  fieldSuggestions: {},
  acceptedFields: {},
  owners: [],
  incomeApproachData: null,
  analysisConclusions: { conclusions: [] },
  reconciliationData: null,
  stagingPhotos: [],
  subjectMaps: [],
  approachMaps: {},
  currentPage: 'template',
  subjectActiveTab: 'location',
  isFullscreen: false,
  pageTabs: {},
  sectionCompletedAt: {},
  scenarioCompletions: [],
  allScenariosCompletedAt: null,
  celebration: {
    isVisible: false,
    sectionId: null,
    scenarioId: null,
    level: 'none',
  },
  lastModified: new Date().toISOString(),
  ...overrides,
});

describe('componentSlice Reducer', () => {
  describe('ADD_PROPERTY_COMPONENT', () => {
    it('should add a component with land allocation', () => {
      const state = createTestState();
      
      const newComponent: PropertyComponent = {
        id: 'comp_1',
        name: 'Industrial Warehouse',
        category: 'commercial',
        propertyType: 'warehouse',
        msOccupancyCode: null,
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

      const result = handleComponentAction(state, {
        type: 'ADD_PROPERTY_COMPONENT',
        payload: newComponent,
      });

      expect(result).not.toBeNull();
      expect(result?.propertyComponents).toHaveLength(1);
      expect(result?.propertyComponents[0].landAllocation?.acres).toBe(5.5);
      expect(result?.propertyComponents[0].includeDetailedImprovements).toBe(true);
    });

    it('should add a component without land allocation', () => {
      const state = createTestState();
      
      const newComponent: PropertyComponent = {
        id: 'comp_2',
        name: 'Retail Space',
        category: 'commercial',
        propertyType: 'retail',
        msOccupancyCode: null,
        squareFootage: 10000,
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

      const result = handleComponentAction(state, {
        type: 'ADD_PROPERTY_COMPONENT',
        payload: newComponent,
      });

      expect(result).not.toBeNull();
      expect(result?.propertyComponents).toHaveLength(1);
      expect(result?.propertyComponents[0].landAllocation).toBeUndefined();
      expect(result?.propertyComponents[0].sfSource).toBe('county_records');
    });
  });

  describe('UPDATE_PROPERTY_COMPONENT', () => {
    it('should update land allocation on existing component', () => {
      const existingComponent: PropertyComponent = {
        id: 'comp_1',
        name: 'Warehouse',
        category: 'commercial',
        propertyType: 'warehouse',
        msOccupancyCode: null,
        squareFootage: 50000,
        sfSource: 'measured',
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

      const state = createTestState({ propertyComponents: [existingComponent] });

      const result = handleComponentAction(state, {
        type: 'UPDATE_PROPERTY_COMPONENT',
        payload: {
          id: 'comp_1',
          updates: {
            landAllocation: {
              acres: 3.0,
              squareFeet: 130680,
              allocationMethod: 'measured',
            },
          },
        },
      });

      expect(result).not.toBeNull();
      expect(result?.propertyComponents[0].landAllocation?.acres).toBe(3.0);
      expect(result?.propertyComponents[0].landAllocation?.allocationMethod).toBe('measured');
    });

    it('should update includeDetailedImprovements flag', () => {
      const existingComponent: PropertyComponent = {
        id: 'comp_1',
        name: 'Warehouse',
        category: 'commercial',
        propertyType: 'warehouse',
        msOccupancyCode: null,
        squareFootage: 50000,
        sfSource: 'measured',
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

      const state = createTestState({ propertyComponents: [existingComponent] });

      const result = handleComponentAction(state, {
        type: 'UPDATE_PROPERTY_COMPONENT',
        payload: {
          id: 'comp_1',
          updates: {
            includeDetailedImprovements: false,
          },
        },
      });

      expect(result).not.toBeNull();
      expect(result?.propertyComponents[0].includeDetailedImprovements).toBe(false);
    });

    it('should update excess land fields', () => {
      const existingComponent: PropertyComponent = {
        id: 'comp_1',
        name: 'Excess Land',
        category: 'land',
        propertyType: 'vacant-land',
        msOccupancyCode: null,
        squareFootage: null,
        sfSource: 'unknown',
        landClassification: 'excess',
        landAllocation: {
          acres: 10,
          squareFeet: 435600,
          allocationMethod: 'estimated',
        },
        isPrimary: false,
        sortOrder: 1,
        includeDetailedImprovements: false,
        analysisConfig: {
          salesApproach: true,
          incomeApproach: false,
          costApproach: false,
          analysisType: 'full',
        },
      };

      const state = createTestState({ propertyComponents: [existingComponent] });

      const result = handleComponentAction(state, {
        type: 'UPDATE_PROPERTY_COMPONENT',
        payload: {
          id: 'comp_1',
          updates: {
            landAllocation: {
              ...existingComponent.landAllocation!,
              accessType: 'separate',
              hasUtilities: true,
              hasLegalAccess: true,
            },
          },
        },
      });

      expect(result).not.toBeNull();
      expect(result?.propertyComponents[0].landAllocation?.accessType).toBe('separate');
      expect(result?.propertyComponents[0].landAllocation?.hasUtilities).toBe(true);
      expect(result?.propertyComponents[0].landAllocation?.hasLegalAccess).toBe(true);
    });
  });

  describe('REMOVE_PROPERTY_COMPONENT', () => {
    it('should remove component and its land allocation', () => {
      const components: PropertyComponent[] = [
        {
          id: 'comp_1',
          name: 'Warehouse',
          category: 'commercial',
          propertyType: 'warehouse',
          msOccupancyCode: null,
          squareFootage: 50000,
          sfSource: 'measured',
          landAllocation: {
            acres: 5.0,
            squareFeet: 217800,
            allocationMethod: 'measured',
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
        },
        {
          id: 'comp_2',
          name: 'Residence',
          category: 'residential',
          propertyType: 'single-family',
          msOccupancyCode: null,
          squareFootage: 1800,
          sfSource: 'county_records',
          landAllocation: {
            acres: 2.0,
            squareFeet: 87120,
            allocationMethod: 'estimated',
          },
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
        },
      ];

      const state = createTestState({ propertyComponents: components });

      const result = handleComponentAction(state, {
        type: 'REMOVE_PROPERTY_COMPONENT',
        payload: 'comp_1',
      });

      expect(result).not.toBeNull();
      expect(result?.propertyComponents).toHaveLength(1);
      expect(result?.propertyComponents[0].id).toBe('comp_2');
      // Total allocated land should now only be from comp_2
      expect(result?.propertyComponents[0].landAllocation?.acres).toBe(2.0);
    });
  });

  describe('REORDER_PROPERTY_COMPONENTS', () => {
    it('should reorder components while preserving land allocation', () => {
      const components: PropertyComponent[] = [
        {
          id: 'comp_1',
          name: 'Warehouse',
          category: 'commercial',
          propertyType: 'warehouse',
          msOccupancyCode: null,
          squareFootage: 50000,
          sfSource: 'measured',
          landAllocation: { acres: 5.0, squareFeet: 217800, allocationMethod: 'measured' },
          landClassification: 'standard',
          isPrimary: true,
          sortOrder: 0,
          includeDetailedImprovements: true,
          analysisConfig: { salesApproach: true, incomeApproach: true, costApproach: false, analysisType: 'full' },
        },
        {
          id: 'comp_2',
          name: 'Residence',
          category: 'residential',
          propertyType: 'single-family',
          msOccupancyCode: null,
          squareFootage: 1800,
          sfSource: 'county_records',
          landAllocation: { acres: 2.0, squareFeet: 87120, allocationMethod: 'estimated' },
          landClassification: 'standard',
          isPrimary: false,
          sortOrder: 1,
          includeDetailedImprovements: false,
          analysisConfig: { salesApproach: true, incomeApproach: false, costApproach: false, analysisType: 'contributory' },
        },
      ];

      const state = createTestState({ propertyComponents: components });

      // Reorder so comp_2 is first
      const result = handleComponentAction(state, {
        type: 'REORDER_PROPERTY_COMPONENTS',
        payload: ['comp_2', 'comp_1'],
      });

      expect(result).not.toBeNull();
      expect(result?.propertyComponents[0].id).toBe('comp_2');
      expect(result?.propertyComponents[0].isPrimary).toBe(true); // First is now primary
      expect(result?.propertyComponents[0].sortOrder).toBe(0);
      expect(result?.propertyComponents[0].landAllocation?.acres).toBe(2.0); // Land allocation preserved
      
      expect(result?.propertyComponents[1].id).toBe('comp_1');
      expect(result?.propertyComponents[1].isPrimary).toBe(false);
      expect(result?.propertyComponents[1].sortOrder).toBe(1);
      expect(result?.propertyComponents[1].landAllocation?.acres).toBe(5.0); // Land allocation preserved
    });
  });
});

describe('Land Allocation Sum Validation', () => {
  it('should calculate total allocated land correctly', () => {
    const components: PropertyComponent[] = [
      {
        id: 'comp_1',
        name: 'Warehouse',
        category: 'commercial',
        propertyType: 'warehouse',
        msOccupancyCode: null,
        squareFootage: 50000,
        sfSource: 'measured',
        landAllocation: { acres: 5.5, squareFeet: 239580, allocationMethod: 'measured' },
        landClassification: 'standard',
        isPrimary: true,
        sortOrder: 0,
        includeDetailedImprovements: true,
        analysisConfig: { salesApproach: true, incomeApproach: true, costApproach: false, analysisType: 'full' },
      },
      {
        id: 'comp_2',
        name: 'Residence 1',
        category: 'residential',
        propertyType: 'single-family',
        msOccupancyCode: null,
        squareFootage: 1800,
        sfSource: 'county_records',
        landAllocation: { acres: 1.5, squareFeet: 65340, allocationMethod: 'estimated' },
        landClassification: 'standard',
        isPrimary: false,
        sortOrder: 1,
        includeDetailedImprovements: false,
        analysisConfig: { salesApproach: true, incomeApproach: false, costApproach: false, analysisType: 'contributory' },
      },
      {
        id: 'comp_3',
        name: 'Excess Land',
        category: 'land',
        propertyType: 'vacant-land',
        msOccupancyCode: null,
        squareFootage: null,
        sfSource: 'unknown',
        landAllocation: { acres: 3.0, squareFeet: 130680, allocationMethod: 'measured', accessType: 'separate' },
        landClassification: 'excess',
        isPrimary: false,
        sortOrder: 2,
        includeDetailedImprovements: false,
        analysisConfig: { salesApproach: true, incomeApproach: false, costApproach: false, analysisType: 'full' },
      },
    ];

    // Calculate total allocated
    const totalAllocated = components.reduce((sum, comp) => 
      sum + (comp.landAllocation?.acres || 0), 0);

    expect(totalAllocated).toBe(10.0); // 5.5 + 1.5 + 3.0
  });

  it('should handle components without land allocation', () => {
    const components: PropertyComponent[] = [
      {
        id: 'comp_1',
        name: 'Warehouse',
        category: 'commercial',
        propertyType: 'warehouse',
        msOccupancyCode: null,
        squareFootage: 50000,
        sfSource: 'measured',
        landAllocation: { acres: 5.0, squareFeet: 217800, allocationMethod: 'measured' },
        landClassification: 'standard',
        isPrimary: true,
        sortOrder: 0,
        includeDetailedImprovements: true,
        analysisConfig: { salesApproach: true, incomeApproach: true, costApproach: false, analysisType: 'full' },
      },
      {
        id: 'comp_2',
        name: 'Mobile Home Pad',
        category: 'residential',
        propertyType: 'mobile-home',
        msOccupancyCode: null,
        squareFootage: 800,
        sfSource: 'estimated',
        // No land allocation
        landClassification: 'standard',
        isPrimary: false,
        sortOrder: 1,
        includeDetailedImprovements: false,
        analysisConfig: { salesApproach: false, incomeApproach: true, costApproach: false, analysisType: 'contributory' },
      },
    ];

    const totalAllocated = components.reduce((sum, comp) => 
      sum + (comp.landAllocation?.acres || 0), 0);

    expect(totalAllocated).toBe(5.0); // Only comp_1 has allocation
  });
});
