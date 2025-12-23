import { useMemo } from 'react';
import type { WizardState, ReportPage, ContentBlock, TOCEntry } from '../../../types';
// Constants imported for potential future use
// import { BASE_REPORT_SECTIONS, APPROACH_SECTIONS, CLOSING_SECTIONS } from '../constants';

interface UseReportBuilderResult {
  pages: ReportPage[];
  toc: TOCEntry[];
  totalPages: number;
  sectionPageMap: Record<string, number>;
}

/**
 * Hook that assembles report pages from wizard state
 * Handles section visibility, page ordering, and TOC generation
 */
export function useReportBuilder(wizardState: WizardState): UseReportBuilderResult {
  return useMemo(() => {
    const pages: ReportPage[] = [];
    const tocEntries: TOCEntry[] = [];
    const sectionPageMap: Record<string, number> = {};
    let currentPageNumber = 1;

    // Helper to add a page and track page number
    const addPage = (page: Omit<ReportPage, 'pageNumber'>): void => {
      pages.push({ ...page, pageNumber: currentPageNumber } as ReportPage);
      currentPageNumber++;
    };

    // Helper to add TOC entry
    const addTocEntry = (id: string, title: string, level: number = 1): void => {
      sectionPageMap[id] = currentPageNumber;
      tocEntries.push({
        id,
        title,
        pageNumber: currentPageNumber,
        level,
      });
    };

    // =================================================================
    // 1. COVER PAGE
    // =================================================================
    addPage({
      id: 'cover-page',
      layout: 'cover',
      sectionId: 'cover',
      title: 'Cover Page',
      content: buildCoverContent(wizardState),
    });

    // =================================================================
    // 2. LETTER OF TRANSMITTAL
    // =================================================================
    addTocEntry('letter', 'Letter of Transmittal');
    addPage({
      id: 'letter-page',
      layout: 'letter',
      sectionId: 'letter',
      title: 'Letter of Transmittal',
      content: buildLetterContent(wizardState),
    });

    // =================================================================
    // 3. TABLE OF CONTENTS (placeholder - populated after all pages)
    // =================================================================
    addPage({
      id: 'toc-page',
      layout: 'toc',
      sectionId: 'toc',
      title: 'Table of Contents',
      content: [],
    });

    // =================================================================
    // 4. SUMMARY OF APPRAISAL
    // =================================================================
    addTocEntry('executive-summary', 'Summary of Appraisal');
    const summaryPages = buildSummaryPages(wizardState);
    summaryPages.forEach((content, i) => {
      addPage({
        id: `summary-page-${i}`,
        layout: 'summary-table',
        sectionId: 'executive-summary',
        title: i === 0 ? 'Summary of Appraisal' : undefined,
        content,
      });
    });

    // =================================================================
    // 5. PURPOSE, USE & USERS
    // =================================================================
    addTocEntry('purpose', 'Purpose of Appraisal');
    addPage({
      id: 'purpose-page',
      layout: 'narrative',
      sectionId: 'purpose',
      title: 'Purpose of Appraisal',
      content: buildPurposeContent(wizardState),
    });

    // =================================================================
    // 6. EXTRAORDINARY ASSUMPTIONS (if any)
    // =================================================================
    if (hasExtraordinaryAssumptions(wizardState)) {
      addTocEntry('assumptions-extra', 'Extraordinary Assumptions', 2);
      addPage({
        id: 'assumptions-extra-page',
        layout: 'narrative',
        sectionId: 'assumptions-extra',
        title: 'Extraordinary Assumptions',
        content: buildAssumptionsContent(wizardState),
      });
    }

    // =================================================================
    // 7. GENERAL AREA ANALYSIS
    // =================================================================
    addTocEntry('area-analysis', 'General Area Analysis');
    addPage({
      id: 'area-analysis-page',
      layout: 'narrative',
      sectionId: 'area-analysis',
      title: 'General Area Analysis',
      content: buildAreaAnalysisContent(wizardState),
    });

    // =================================================================
    // 8. NEIGHBORHOOD ANALYSIS
    // =================================================================
    addTocEntry('neighborhood', 'Neighborhood Analysis');
    addPage({
      id: 'neighborhood-page',
      layout: 'narrative',
      sectionId: 'neighborhood',
      title: 'Neighborhood Analysis',
      content: buildNeighborhoodContent(wizardState),
    });

    // =================================================================
    // 9. SITE ANALYSIS
    // =================================================================
    addTocEntry('site-analysis', 'Site Analysis');
    const sitePages = buildSiteAnalysisPages(wizardState);
    sitePages.forEach((content, i) => {
      addPage({
        id: `site-analysis-page-${i}`,
        layout: 'narrative',
        sectionId: 'site-analysis',
        title: i === 0 ? 'Site Analysis' : undefined,
        content,
      });
    });

    // =================================================================
    // 10. IMPROVEMENT ANALYSIS (if not land)
    // =================================================================
    if (wizardState.propertyType !== 'land') {
      addTocEntry('improvement-analysis', 'Improvement Analysis');
      const improvementPages = buildImprovementPages(wizardState);
      improvementPages.forEach((content, i) => {
        addPage({
          id: `improvement-page-${i}`,
          layout: 'narrative',
          sectionId: 'improvement-analysis',
          title: i === 0 ? 'Improvement Analysis' : undefined,
          content,
        });
      });
    }

    // =================================================================
    // 11. TAXES
    // =================================================================
    addTocEntry('taxes', 'Tax Analysis');
    addPage({
      id: 'taxes-page',
      layout: 'summary-table',
      sectionId: 'taxes',
      title: 'Tax Analysis',
      content: buildTaxesContent(wizardState),
    });

    // =================================================================
    // 12. PROPERTY OWNERSHIP
    // =================================================================
    addTocEntry('ownership', 'Property Ownership');
    addPage({
      id: 'ownership-page',
      layout: 'narrative',
      sectionId: 'ownership',
      title: 'Property Ownership',
      content: buildOwnershipContent(wizardState),
    });

    // =================================================================
    // 13. HIGHEST AND BEST USE
    // =================================================================
    addTocEntry('highest-best-use', 'Highest and Best Use');
    addPage({
      id: 'hbu-page-1',
      layout: 'narrative',
      sectionId: 'highest-best-use',
      title: 'Highest and Best Use',
      content: buildHBUContent(wizardState, 'as-vacant'),
    });
    addPage({
      id: 'hbu-page-2',
      layout: 'narrative',
      sectionId: 'highest-best-use',
      content: buildHBUContent(wizardState, 'as-improved'),
    });

    // =================================================================
    // 14-16. VALUATION APPROACHES (per scenario)
    // =================================================================
    wizardState.scenarios.forEach(scenario => {
      const scenarioPrefix = wizardState.scenarios.length > 1 
        ? `${scenario.name} - ` 
        : '';

      // Cost Approach
      if (scenario.approaches.includes('Cost Approach')) {
        addTocEntry(`cost-${scenario.id}`, `${scenarioPrefix}Cost Approach`);
        const costPages = buildCostApproachPages(wizardState, scenario.id);
        costPages.forEach((content, i) => {
          addPage({
            id: `cost-page-${scenario.id}-${i}`,
            layout: i === 0 ? 'narrative' : 'analysis-grid',
            sectionId: `cost-${scenario.id}`,
            title: i === 0 ? `${scenarioPrefix}Cost Approach` : undefined,
            content,
          });
        });
      }

      // Sales Comparison
      if (scenario.approaches.includes('Sales Comparison')) {
        addTocEntry(`sales-${scenario.id}`, `${scenarioPrefix}Sales Comparison Approach`);
        const salesPages = buildSalesComparisonPages(wizardState, scenario.id);
        salesPages.forEach((content, i) => {
          addPage({
            id: `sales-page-${scenario.id}-${i}`,
            layout: i === 0 ? 'narrative' : 'analysis-grid',
            sectionId: `sales-${scenario.id}`,
            title: i === 0 ? `${scenarioPrefix}Sales Comparison Approach` : undefined,
            content,
          });
        });
      }

      // Income Approach
      if (scenario.approaches.includes('Income Approach')) {
        addTocEntry(`income-${scenario.id}`, `${scenarioPrefix}Income Approach`);
        const incomePages = buildIncomeApproachPages(wizardState, scenario.id);
        incomePages.forEach((content, i) => {
          addPage({
            id: `income-page-${scenario.id}-${i}`,
            layout: i === 0 ? 'narrative' : 'analysis-grid',
            sectionId: `income-${scenario.id}`,
            title: i === 0 ? `${scenarioPrefix}Income Approach` : undefined,
            content,
          });
        });
      }
    });

    // =================================================================
    // 17. RECONCILIATION
    // =================================================================
    addTocEntry('reconciliation', 'Reconciliation');
    const reconPages = buildReconciliationPages(wizardState);
    reconPages.forEach((content, i) => {
      addPage({
        id: `recon-page-${i}`,
        layout: 'narrative',
        sectionId: 'reconciliation',
        title: i === 0 ? 'Reconciliation' : undefined,
        content,
      });
    });

    // =================================================================
    // 18. CERTIFICATION
    // =================================================================
    addTocEntry('certification', 'Certification');
    addPage({
      id: 'certification-page',
      layout: 'letter',
      sectionId: 'certification',
      title: 'Certification',
      content: buildCertificationContent(wizardState),
    });

    // =================================================================
    // 19. APPRAISER QUALIFICATIONS
    // =================================================================
    addTocEntry('qualifications', 'Appraiser Qualifications');
    addPage({
      id: 'qualifications-page',
      layout: 'narrative',
      sectionId: 'qualifications',
      title: 'Appraiser Qualifications',
      content: buildQualificationsContent(wizardState),
    });

    // =================================================================
    // 20. ASSUMPTIONS & LIMITING CONDITIONS
    // =================================================================
    addTocEntry('limiting-conditions', 'Assumptions & Limiting Conditions');
    const limitingPages = buildLimitingConditionsPages(wizardState);
    limitingPages.forEach((content, i) => {
      addPage({
        id: `limiting-page-${i}`,
        layout: 'narrative',
        sectionId: 'limiting-conditions',
        title: i === 0 ? 'Assumptions & Limiting Conditions' : undefined,
        content,
      });
    });

    // =================================================================
    // 21. ADDENDA
    // =================================================================
    addTocEntry('addenda', 'Addenda');
    addPage({
      id: 'addenda-header-page',
      layout: 'addenda-header',
      sectionId: 'addenda',
      title: 'ADDENDA',
      content: [],
    });

    // Photo pages
    const photoPages = buildPhotoPages(wizardState);
    photoPages.forEach((page, i) => {
      if (i === 0) {
        addTocEntry('photos', 'Subject Property Photos', 2);
      }
      addPage({
        id: `photo-page-${i}`,
        layout: page.layout || 'photo-grid-6',
        sectionId: 'photos',
        title: page.title,
        content: page.content || [],
        photos: page.photos,
        showAttribution: page.showAttribution,
      });
    });

    // Map pages
    addTocEntry('maps', 'Maps', 2);
    addPage({
      id: 'location-map-page',
      layout: 'map-page',
      sectionId: 'maps',
      title: 'Location Map',
      content: [],
    });

    // Comp detail pages (if any)
    // ... additional addenda items

    return {
      pages,
      toc: tocEntries,
      totalPages: currentPageNumber - 1,
      sectionPageMap,
    };
  }, [wizardState]);
}

// =================================================================
// CONTENT BUILDER FUNCTIONS
// =================================================================

function buildCoverContent(state: WizardState): ContentBlock[] {
  return [{
    id: 'cover-content',
    type: 'heading',
    content: {
      propertyName: state.subjectData.propertyName || 'Subject Property',
      address: formatAddress(state.subjectData.address),
      reportDate: state.subjectData.reportDate,
      effectiveDate: state.subjectData.effectiveDate,
      propertyType: state.propertyType,
    },
    canSplit: false,
    keepWithNext: false,
    keepWithPrevious: false,
    minLinesIfSplit: 0,
  }];
}

function buildLetterContent(state: WizardState): ContentBlock[] {
  // Get final value from reconciliation
  const finalValue = state.reconciliationData?.scenarioReconciliations?.[0]
    ? calculateFinalValue(state)
    : 0;

  return [{
    id: 'letter-content',
    type: 'paragraph',
    content: {
      clientName: 'Valued Client', // Would come from client data
      propertyAddress: formatAddress(state.subjectData.address),
      effectiveDate: state.subjectData.effectiveDate,
      finalValue,
      exposurePeriod: state.reconciliationData?.exposurePeriod || 12,
      marketingTime: state.reconciliationData?.marketingTime || 12,
    },
    canSplit: true,
    keepWithNext: false,
    keepWithPrevious: false,
    minLinesIfSplit: 3,
  }];
}

function buildSummaryPages(state: WizardState): ContentBlock[][] {
  // Build key-value pairs for summary table
  const summaryData = {
    propertyName: state.subjectData.propertyName,
    address: formatAddress(state.subjectData.address),
    propertyType: state.propertyType,
    propertySubtype: state.propertySubtype,
    taxId: state.subjectData.taxId,
    legalDescription: state.subjectData.legalDescription,
    siteArea: `${state.subjectData.siteArea} ${state.subjectData.siteAreaUnit}`,
    zoningClass: state.subjectData.zoningClass,
    effectiveDate: state.subjectData.effectiveDate,
    inspectionDate: state.subjectData.inspectionDate,
    // Add approach values
    scenarios: state.scenarios.map(s => ({
      name: s.name,
      approaches: s.approaches,
    })),
  };

  return [[{
    id: 'summary-content',
    type: 'table',
    content: summaryData,
    canSplit: true,
    keepWithNext: false,
    keepWithPrevious: false,
    minLinesIfSplit: 5,
  }]];
}

function buildPurposeContent(state: WizardState): ContentBlock[] {
  return [{
    id: 'purpose-content',
    type: 'paragraph',
    content: {
      purpose: state.subjectData.appraisalPurpose || 'To estimate market value',
      intendedUsers: state.subjectData.intendedUsers || 'Client and lender',
      propertyInterest: state.subjectData.propertyInterest || 'Fee Simple',
    },
    canSplit: true,
    keepWithNext: false,
    keepWithPrevious: false,
    minLinesIfSplit: 3,
  }];
}

function hasExtraordinaryAssumptions(_state: WizardState): boolean {
  // Check if there are any extraordinary assumptions configured
  return false; // Placeholder
}

function buildAssumptionsContent(_state: WizardState): ContentBlock[] {
  return [{
    id: 'assumptions-content',
    type: 'list',
    content: [],
    canSplit: true,
    keepWithNext: false,
    keepWithPrevious: false,
    minLinesIfSplit: 2,
  }];
}

function buildAreaAnalysisContent(state: WizardState): ContentBlock[] {
  return [{
    id: 'area-analysis-content',
    type: 'paragraph',
    content: {
      areaDescription: state.subjectData.areaDescription || '',
    },
    canSplit: true,
    keepWithNext: false,
    keepWithPrevious: false,
    minLinesIfSplit: 3,
  }];
}

function buildNeighborhoodContent(state: WizardState): ContentBlock[] {
  return [{
    id: 'neighborhood-content',
    type: 'paragraph',
    content: {
      boundaries: state.subjectData.neighborhoodBoundaries || '',
      characteristics: state.subjectData.neighborhoodCharacteristics || '',
      location: state.subjectData.specificLocation || '',
    },
    canSplit: true,
    keepWithNext: false,
    keepWithPrevious: false,
    minLinesIfSplit: 3,
  }];
}

function buildSiteAnalysisPages(state: WizardState): ContentBlock[][] {
  return [[{
    id: 'site-analysis-content',
    type: 'table',
    content: {
      siteArea: state.subjectData.siteArea,
      siteAreaUnit: state.subjectData.siteAreaUnit,
      shape: state.subjectData.shape,
      frontage: state.subjectData.frontage,
      topography: state.subjectData.topography,
      utilities: state.subjectData.utilities,
      floodZone: state.subjectData.floodZone,
      environmental: state.subjectData.environmental,
      easements: state.subjectData.easements,
      zoningClass: state.subjectData.zoningClass,
      zoningDescription: state.subjectData.zoningDescription,
    },
    canSplit: true,
    keepWithNext: false,
    keepWithPrevious: false,
    minLinesIfSplit: 5,
  }]];
}

function buildImprovementPages(state: WizardState): ContentBlock[][] {
  const pages: ContentBlock[][] = [];
  
  // Build improvement content from inventory
  const { improvementsInventory } = state;
  
  improvementsInventory.parcels.forEach(parcel => {
    parcel.buildings.forEach(building => {
      pages.push([{
        id: `building-${building.id}`,
        type: 'table',
        content: {
          name: building.name,
          yearBuilt: building.yearBuilt,
          constructionType: building.constructionType,
          constructionQuality: building.constructionQuality,
          condition: building.condition,
          areas: building.areas,
          exteriorFeatures: building.exteriorFeatures,
          mechanicalSystems: building.mechanicalSystems,
        },
        canSplit: true,
        keepWithNext: false,
        keepWithPrevious: false,
        minLinesIfSplit: 5,
      }]);
    });
  });

  return pages.length > 0 ? pages : [[{
    id: 'no-improvements',
    type: 'paragraph',
    content: { text: 'No improvements on site.' },
    canSplit: false,
    keepWithNext: false,
    keepWithPrevious: false,
    minLinesIfSplit: 0,
  }]];
}

function buildTaxesContent(state: WizardState): ContentBlock[] {
  return [{
    id: 'taxes-content',
    type: 'table',
    content: {
      taxId: state.subjectData.taxId,
      // Additional tax data would come from extracted documents
    },
    canSplit: false,
    keepWithNext: false,
    keepWithPrevious: false,
    minLinesIfSplit: 0,
  }];
}

function buildOwnershipContent(state: WizardState): ContentBlock[] {
  return [{
    id: 'ownership-content',
    type: 'table',
    content: {
      owners: state.owners,
      lastSaleDate: state.subjectData.lastSaleDate,
      lastSalePrice: state.subjectData.lastSalePrice,
      transactionHistory: state.subjectData.transactionHistory,
    },
    canSplit: true,
    keepWithNext: false,
    keepWithPrevious: false,
    minLinesIfSplit: 3,
  }];
}

function buildHBUContent(_state: WizardState, type: 'as-vacant' | 'as-improved'): ContentBlock[] {
  return [{
    id: `hbu-${type}-content`,
    type: 'paragraph',
    content: {
      type,
      analysis: '', // HBU analysis text
    },
    canSplit: true,
    keepWithNext: false,
    keepWithPrevious: false,
    minLinesIfSplit: 3,
  }];
}

function buildCostApproachPages(_state: WizardState, scenarioId: number): ContentBlock[][] {
  return [[{
    id: `cost-approach-${scenarioId}`,
    type: 'table',
    content: {
      scenarioId,
      // Cost approach data
    },
    canSplit: true,
    keepWithNext: false,
    keepWithPrevious: false,
    minLinesIfSplit: 5,
  }]];
}

function buildSalesComparisonPages(_state: WizardState, scenarioId: number): ContentBlock[][] {
  return [[{
    id: `sales-comparison-${scenarioId}`,
    type: 'table',
    content: {
      scenarioId,
      // Sales comparison data
    },
    canSplit: true,
    keepWithNext: false,
    keepWithPrevious: false,
    minLinesIfSplit: 5,
  }]];
}

function buildIncomeApproachPages(state: WizardState, scenarioId: number): ContentBlock[][] {
  const incomeData = state.incomeApproachData;
  
  return [[{
    id: `income-approach-${scenarioId}`,
    type: 'table',
    content: {
      scenarioId,
      incomeData,
    },
    canSplit: true,
    keepWithNext: false,
    keepWithPrevious: false,
    minLinesIfSplit: 5,
  }]];
}

function buildReconciliationPages(state: WizardState): ContentBlock[][] {
  return [[{
    id: 'reconciliation-content',
    type: 'paragraph',
    content: {
      reconciliationData: state.reconciliationData,
      scenarios: state.scenarios,
      conclusions: state.analysisConclusions,
    },
    canSplit: true,
    keepWithNext: false,
    keepWithPrevious: false,
    minLinesIfSplit: 3,
  }]];
}

function buildCertificationContent(state: WizardState): ContentBlock[] {
  return [{
    id: 'certification-content',
    type: 'paragraph',
    content: {
      certifications: state.reconciliationData?.certifications || [],
      licenseNumber: state.subjectData.licenseNumber,
      licenseState: state.subjectData.licenseState,
    },
    canSplit: false,
    keepWithNext: false,
    keepWithPrevious: false,
    minLinesIfSplit: 0,
  }];
}

function buildQualificationsContent(_state: WizardState): ContentBlock[] {
  return [{
    id: 'qualifications-content',
    type: 'paragraph',
    content: {
      // Appraiser qualification data
    },
    canSplit: true,
    keepWithNext: false,
    keepWithPrevious: false,
    minLinesIfSplit: 3,
  }];
}

function buildLimitingConditionsPages(_state: WizardState): ContentBlock[][] {
  // Standard limiting conditions boilerplate
  return [[{
    id: 'limiting-conditions-content',
    type: 'list',
    content: {
      conditions: [
        'The appraiser assumes no responsibility for matters legal in nature...',
        'The appraiser has made no survey of the property...',
        // More conditions...
      ],
    },
    canSplit: true,
    keepWithNext: false,
    keepWithPrevious: false,
    minLinesIfSplit: 2,
  }]];
}

function buildPhotoPages(_state: WizardState): Partial<ReportPage>[] {
  // This would use the photos from state.reportConfig if available
  // For now, return empty array
  return [];
}

// =================================================================
// HELPER FUNCTIONS
// =================================================================

function formatAddress(address: WizardState['subjectData']['address']): string {
  const parts = [
    address.street,
    address.city,
    address.state,
    address.zip,
  ].filter(Boolean);
  return parts.join(', ');
}

function calculateFinalValue(state: WizardState): number {
  // Calculate weighted value from reconciliation
  const recon = state.reconciliationData?.scenarioReconciliations?.[0];
  if (!recon) return 0;

  let totalValue = 0;
  let totalWeight = 0;

  Object.entries(recon.weights).forEach(([approach, weight]) => {
    const conclusion = state.analysisConclusions.conclusions.find(
      c => c.approach === approach && c.scenarioId === recon.scenarioId
    );
    if (conclusion?.valueConclusion && weight > 0) {
      totalValue += conclusion.valueConclusion * (weight / 100);
      totalWeight += weight;
    }
  });

  return totalWeight > 0 ? Math.round(totalValue) : 0;
}

export default useReportBuilder;

