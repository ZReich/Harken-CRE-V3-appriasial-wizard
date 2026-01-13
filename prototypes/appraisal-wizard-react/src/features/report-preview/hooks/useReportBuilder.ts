import { useMemo } from 'react';
import type { WizardState, ReportPage, ContentBlock, TOCEntry } from '../../../types';
import { sampleAppraisalData } from '../../review/data/sampleAppraisalData';
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
 * 
 * @param wizardState - The wizard state containing all report data
 * @param sectionVisibility - Optional visibility overrides for sections (false = hidden)
 */
export function useReportBuilder(
  wizardState: WizardState,
  sectionVisibility?: Record<string, boolean>
): UseReportBuilderResult {
  return useMemo(() => {
    const pages: ReportPage[] = [];
    const tocEntries: TOCEntry[] = [];
    const sectionPageMap: Record<string, number> = {};
    let currentPageNumber = 1;

    // Helper to check if a section should be included
    const isSectionVisible = (sectionId: string): boolean => {
      // If no visibility overrides, everything is visible
      if (!sectionVisibility) return true;
      // If explicitly set to false, hide it
      if (sectionVisibility[sectionId] === false) return false;
      // Otherwise, visible by default
      return true;
    };

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
    // Build cover photo from wizard state if available
    const coverPhoto = wizardState.coverPhoto ? {
      id: wizardState.coverPhoto.id,
      url: wizardState.coverPhoto.preview,
      caption: wizardState.coverPhoto.caption || 'Subject Property',
      category: 'exterior' as const,
      sortOrder: 0,
    } : undefined;

    addPage({
      id: 'cover-page',
      layout: 'cover',
      sectionId: 'cover',
      title: 'Cover Page',
      content: buildCoverContent(wizardState),
      coverPhoto,
    });

    // =================================================================
    // 2. LETTER OF TRANSMITTAL
    // =================================================================
    if (isSectionVisible('letter')) {
      addTocEntry('letter', 'Letter of Transmittal');
      addPage({
        id: 'letter-page',
        layout: 'letter',
        sectionId: 'letter',
        title: 'Letter of Transmittal',
        content: buildLetterContent(wizardState),
      });
    }

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
    if (isSectionVisible('executive-summary')) {
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
    }

    // =================================================================
    // 5. INVESTMENT RISK ANALYSIS (Plan Part 10.9 - after Summary)
    // =================================================================
    // Only include if risk rating data is available
    if (isSectionVisible('risk-rating') && wizardState.riskRating) {
      addTocEntry('risk-rating', 'Investment Risk Analysis');
      addPage({
        id: 'risk-rating-page',
        layout: 'risk-rating',
        sectionId: 'risk-rating',
        title: 'Investment Risk Analysis',
        content: [{
          id: 'risk-rating-content',
          type: 'risk-rating',
          content: {
            riskRating: wizardState.riskRating,
          },
          canSplit: false,
          keepWithNext: false,
          keepWithPrevious: false,
          minLinesIfSplit: 0,
        }],
      });
    }

    // =================================================================
    // 6. PURPOSE, USE & USERS
    // =================================================================
    if (isSectionVisible('purpose')) {
      addTocEntry('purpose', 'Purpose of Appraisal');
      addPage({
        id: 'purpose-page',
        layout: 'narrative',
        sectionId: 'purpose',
        title: 'Purpose of Appraisal',
        content: buildPurposeContent(wizardState),
      });
    }

    // =================================================================
    // 6. EXTRAORDINARY ASSUMPTIONS (if any)
    // =================================================================
    if (isSectionVisible('assumptions-extra') && hasExtraordinaryAssumptions(wizardState)) {
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
    // 8. GENERAL AREA ANALYSIS
    // =================================================================
    if (isSectionVisible('area-analysis')) {
      addTocEntry('area-analysis', 'General Area Analysis');
      addPage({
        id: 'area-analysis-page',
        layout: 'narrative',
        sectionId: 'area-analysis',
        title: 'General Area Analysis',
        content: buildAreaAnalysisContent(wizardState),
      });
    }

    // =================================================================
    // 8.1 NEIGHBORHOOD DEMOGRAPHICS (Plan Part 6.1)
    // Split into 2 pages: Overview (map + highlights) and Detail (tables)
    // =================================================================
    if (isSectionVisible('demographics') && wizardState.demographicsData && wizardState.demographicsData.radiusAnalysis?.length > 0) {
      addTocEntry('demographics', 'Neighborhood Demographics', 2);
      
      // Page 1: Demographics Overview (large map + key highlights)
      addPage({
        id: 'demographics-overview-page',
        layout: 'demographics-overview',
        sectionId: 'demographics',
        title: 'Neighborhood Demographics',
        content: [{
          id: 'demographics-overview-content',
          type: 'demographics-overview',
          content: {
            demographics: wizardState.demographicsData,
            // Pass coordinates for static map generation
            latitude: wizardState.subjectData?.coordinates?.latitude,
            longitude: wizardState.subjectData?.coordinates?.longitude,
          },
          canSplit: false,
          keepWithNext: true,
          keepWithPrevious: false,
          minLinesIfSplit: 0,
        }],
      });
      
      // Page 2: Demographics Detail (data tables)
      addPage({
        id: 'demographics-detail-page',
        layout: 'demographics-detail',
        sectionId: 'demographics',
        title: 'Neighborhood Demographics - Detail',
        content: [{
          id: 'demographics-detail-content',
          type: 'demographics-detail',
          content: {
            demographics: wizardState.demographicsData,
          },
          canSplit: false,
          keepWithNext: false,
          keepWithPrevious: true,
          minLinesIfSplit: 0,
        }],
      });
    }

    // =================================================================
    // 8.2 ECONOMIC CONTEXT (Plan Part 6.1)
    // =================================================================
    if (isSectionVisible('economic-context') && wizardState.economicIndicators) {
      addTocEntry('economic-context', 'Economic Context', 2);
      addPage({
        id: 'economic-context-page',
        layout: 'economic-context',
        sectionId: 'economic-context',
        title: 'Economic Context',
        content: [{
          id: 'economic-content',
          type: 'economic',
          content: {
            economicIndicators: wizardState.economicIndicators,
            chartStyle: wizardState.economicChartStyle || 'gradient',
          },
          canSplit: false,
          keepWithNext: false,
          keepWithPrevious: false,
          minLinesIfSplit: 0,
        }],
      });
    }

    // =================================================================
    // 9. NEIGHBORHOOD ANALYSIS
    // =================================================================
    if (isSectionVisible('neighborhood')) {
      addTocEntry('neighborhood', 'Neighborhood Analysis');
      addPage({
        id: 'neighborhood-page',
        layout: 'narrative',
        sectionId: 'neighborhood',
        title: 'Neighborhood Analysis',
        content: buildNeighborhoodContent(wizardState),
      });
    }

    // =================================================================
    // 9. SITE ANALYSIS
    // =================================================================
    if (isSectionVisible('site-analysis')) {
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
    }

    // =================================================================
    // 10. IMPROVEMENT ANALYSIS (if not land)
    // =================================================================
    if (isSectionVisible('improvement-analysis') && wizardState.propertyType !== 'land') {
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
    if (isSectionVisible('taxes')) {
      addTocEntry('taxes', 'Tax Analysis');
      addPage({
        id: 'taxes-page',
        layout: 'summary-table',
        sectionId: 'taxes',
        title: 'Tax Analysis',
        content: buildTaxesContent(wizardState),
      });
    }

    // =================================================================
    // 12. PROPERTY OWNERSHIP
    // =================================================================
    if (isSectionVisible('ownership')) {
      addTocEntry('ownership', 'Property Ownership');
      addPage({
        id: 'ownership-page',
        layout: 'narrative',
        sectionId: 'ownership',
        title: 'Property Ownership',
        content: buildOwnershipContent(wizardState),
      });
    }

    // =================================================================
    // 13. HIGHEST AND BEST USE
    // =================================================================
    if (isSectionVisible('highest-best-use')) {
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
    }

    // =================================================================
    // 14. SWOT ANALYSIS (Plan Part 6.1)
    // =================================================================
    if (isSectionVisible('swot-analysis') && wizardState.swotAnalysis && (
      wizardState.swotAnalysis.strengths.length > 0 ||
      wizardState.swotAnalysis.weaknesses.length > 0 ||
      wizardState.swotAnalysis.opportunities.length > 0 ||
      wizardState.swotAnalysis.threats.length > 0
    )) {
      addTocEntry('swot-analysis', 'SWOT Analysis');
      addPage({
        id: 'swot-page',
        layout: 'swot',
        sectionId: 'swot-analysis',
        title: 'SWOT Analysis',
        content: [{
          id: 'swot-content',
          type: 'swot',
          content: {
            swotAnalysis: wizardState.swotAnalysis,
          },
          canSplit: false,
          keepWithNext: false,
          keepWithPrevious: false,
          minLinesIfSplit: 0,
        }],
      });
    }

    // =================================================================
    // 15-17. VALUATION APPROACHES (per scenario)
    // =================================================================
    wizardState.scenarios.forEach(scenario => {
      const scenarioPrefix = wizardState.scenarios.length > 1 
        ? `${scenario.name} - ` 
        : '';

      // Cost Approach
      if (isSectionVisible(`cost-${scenario.id}`) && scenario.approaches.includes('Cost Approach')) {
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
      if (isSectionVisible(`sales-${scenario.id}`) && scenario.approaches.includes('Sales Comparison')) {
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
      if (isSectionVisible(`income-${scenario.id}`) && scenario.approaches.includes('Income Approach')) {
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

      // Land Valuation
      if (isSectionVisible(`land-${scenario.id}`) && scenario.approaches.includes('Land Valuation')) {
        addTocEntry(`land-${scenario.id}`, `${scenarioPrefix}Land Valuation`);
        const landPages = buildLandValuationPages(wizardState, scenario.id);
        landPages.forEach((content, i) => {
          addPage({
            id: `land-page-${scenario.id}-${i}`,
            layout: i === 0 ? 'narrative' : 'analysis-grid',
            sectionId: `land-${scenario.id}`,
            title: i === 0 ? `${scenarioPrefix}Land Valuation` : undefined,
            content,
          });
        });
      }
    });

    // =================================================================
    // 17. RECONCILIATION
    // =================================================================
    if (isSectionVisible('reconciliation')) {
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
    }

    // =================================================================
    // 18. CERTIFICATION
    // =================================================================
    if (isSectionVisible('certification')) {
      addTocEntry('certification', 'Certification');
      addPage({
        id: 'certification-page',
        layout: 'letter',
        sectionId: 'certification',
        title: 'Certification',
        content: buildCertificationContent(wizardState),
      });
    }

    // =================================================================
    // 19. APPRAISER QUALIFICATIONS
    // =================================================================
    if (isSectionVisible('qualifications')) {
      addTocEntry('qualifications', 'Appraiser Qualifications');
      addPage({
        id: 'qualifications-page',
        layout: 'narrative',
        sectionId: 'qualifications',
        title: 'Appraiser Qualifications',
        content: buildQualificationsContent(wizardState),
      });
    }

    // =================================================================
    // 20. ASSUMPTIONS & LIMITING CONDITIONS
    // =================================================================
    if (isSectionVisible('limiting-conditions')) {
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
    }

    // =================================================================
    // 21. ADDENDA
    // =================================================================
    if (isSectionVisible('addenda')) {
      addTocEntry('addenda', 'Addenda');
      addPage({
        id: 'addenda-header-page',
        layout: 'addenda-header',
        sectionId: 'addenda',
        title: 'ADDENDA',
        content: [],
      });

      // Photo pages
      if (isSectionVisible('photos')) {
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
      }

      // Map pages
      if (isSectionVisible('maps')) {
        addTocEntry('maps', 'Maps', 2);
        addPage({
          id: 'location-map-page',
          layout: 'map-page',
          sectionId: 'maps',
          title: 'Location Map',
          content: [],
        });
      }

      // Comp detail pages (if any)
      // ... additional addenda items
    }

    return {
      pages,
      toc: tocEntries,
      totalPages: currentPageNumber - 1,
      sectionPageMap,
    };
  }, [wizardState, sectionVisibility]);
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
  // Calculate the final reconciled value
  const finalValue = calculateFinalValue(state);
  
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
    // Final value from reconciliation
    finalValue,
    finalValueFormatted: finalValue > 0 ? `$${finalValue.toLocaleString()}` : 'To be determined',
    // Add approach values
    scenarios: state.scenarios.map(s => {
      // Get concluded values for each approach in this scenario
      const approachValues: Record<string, number | null> = {};
      s.approaches.forEach(approach => {
        const conclusion = state.analysisConclusions.conclusions.find(
          c => c.scenarioId === s.id && c.approach === approach
        );
        approachValues[approach] = conclusion?.valueConclusion ?? null;
      });
      return {
        name: s.name,
        approaches: s.approaches,
        approachValues,
      };
    }),
    // Reconciliation weights
    reconciliationWeights: state.reconciliationData?.scenarioReconciliations?.[0]?.weights || {},
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
  // Format property status for display
  const formatPropertyStatus = (status?: string): string => {
    const statusMap: Record<string, string> = {
      'existing': 'Existing / Completed',
      'under_construction': 'Under Construction',
      'proposed': 'Proposed / Not Yet Started',
      'recently_completed': 'Recently Completed',
    };
    return status ? statusMap[status] || status : '';
  };

  // Format loan purpose for display
  const formatLoanPurpose = (purpose?: string): string => {
    const purposeMap: Record<string, string> = {
      'purchase': 'Purchase Financing',
      'refinance': 'Refinance',
      'construction': 'Construction Loan',
      'bridge': 'Bridge / Interim Financing',
      'internal': 'Internal / Portfolio Review',
    };
    return purpose ? purposeMap[purpose] || purpose : '';
  };

  // Format planned changes for display
  const formatPlannedChanges = (changes?: string): string => {
    const changesMap: Record<string, string> = {
      'none': 'No Planned Changes',
      'minor': 'Minor Repairs/Updates',
      'major': 'Major Renovation or Expansion',
      'change_of_use': 'Change of Use / Conversion',
    };
    return changes ? changesMap[changes] || changes : '';
  };

  // Format occupancy status for display
  const formatOccupancyStatus = (status?: string): string => {
    const statusMap: Record<string, string> = {
      'stabilized': 'Stabilized (>90% Occupied)',
      'lease_up': 'In Lease-Up Phase',
      'vacant': 'Vacant or Under-Occupied',
      'not_applicable': 'N/A (Owner-Occupied)',
    };
    return status ? statusMap[status] || status : '';
  };

  // Build content object, only including fields that have values
  const content: Record<string, string> = {
    'Purpose of Appraisal': state.subjectData.appraisalPurpose || 'To estimate market value',
    'Intended Users': state.subjectData.intendedUsers || 'Client and lender',
    'Property Interest Appraised': state.subjectData.propertyInterest || 'Fee Simple',
  };

  // Add assignment conditions if they have values
  if (state.subjectData.propertyStatus) {
    content['Property Status'] = formatPropertyStatus(state.subjectData.propertyStatus);
  }
  if (state.subjectData.loanPurpose) {
    content['Loan Purpose'] = formatLoanPurpose(state.subjectData.loanPurpose);
  }
  if (state.subjectData.plannedChanges && state.subjectData.plannedChanges !== 'none') {
    content['Planned Changes'] = formatPlannedChanges(state.subjectData.plannedChanges);
  }
  if (state.subjectData.occupancyStatus && state.subjectData.occupancyStatus !== 'not_applicable') {
    content['Occupancy Status'] = formatOccupancyStatus(state.subjectData.occupancyStatus);
  }

  return [{
    id: 'purpose-content',
    type: 'paragraph',
    content,
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
  // Use wizard data or fall back to sample data
  const sampleArea = sampleAppraisalData.areaAnalysis;
  const hasWizardData = state.subjectData.areaDescription && state.subjectData.areaDescription.length > 10;
  
  return [{
    id: 'area-analysis-content',
    type: 'paragraph',
    content: {
      text: hasWizardData 
        ? state.subjectData.areaDescription 
        : `${sampleArea.regional}\n\n${sampleArea.marketConditions}`,
    },
    canSplit: true,
    keepWithNext: false,
    keepWithPrevious: false,
    minLinesIfSplit: 3,
  }];
}

function buildNeighborhoodContent(state: WizardState): ContentBlock[] {
  // Use wizard data or fall back to sample data
  const sampleNeighborhood = sampleAppraisalData.areaAnalysis.neighborhood;
  const hasWizardData = (state.subjectData.neighborhoodBoundaries && state.subjectData.neighborhoodBoundaries.length > 10) ||
    (state.subjectData.neighborhoodCharacteristics && state.subjectData.neighborhoodCharacteristics.length > 10);
  
  return [{
    id: 'neighborhood-content',
    type: 'paragraph',
    content: hasWizardData ? {
      boundaries: state.subjectData.neighborhoodBoundaries || '',
      characteristics: state.subjectData.neighborhoodCharacteristics || '',
      location: state.subjectData.specificLocation || '',
    } : {
      text: sampleNeighborhood,
    },
    canSplit: true,
    keepWithNext: false,
    keepWithPrevious: false,
    minLinesIfSplit: 3,
  }];
}

function buildSiteAnalysisPages(state: WizardState): ContentBlock[][] {
  // Use wizard data or fall back to sample data
  const sampleSite = sampleAppraisalData.site;
  const sampleSiteDesc = sampleAppraisalData.siteDescription;
  const hasWizardData = state.subjectData.siteArea && state.subjectData.siteArea.length > 0;
  
  // Narrative content
  const narrativeBlock: ContentBlock = {
    id: 'site-narrative-content',
    type: 'paragraph',
    content: {
      text: state.subjectData.siteDescriptionNarrative || sampleSiteDesc.narrative,
    },
    canSplit: true,
    keepWithNext: true,
    keepWithPrevious: false,
    minLinesIfSplit: 3,
  };
  
  // Table content
  const tableBlock: ContentBlock = {
    id: 'site-analysis-content',
    type: 'table',
    content: hasWizardData ? {
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
    } : {
      'Site Area': `${sampleSite.landArea} ${sampleSite.landAreaUnit} (${sampleSite.landAreaSF.toLocaleString()} SF)`,
      'Shape': sampleSite.shape,
      'Frontage': sampleSite.frontage,
      'Topography': sampleSite.topography,
      'Zoning': `${sampleSite.zoning} - ${sampleSite.zoningDescription}`,
      'Flood Zone': sampleSite.floodZone,
      'Utilities': sampleSite.utilities.join(', '),
      'Access': sampleSite.access,
      'Easements': sampleSite.easements,
    },
    canSplit: true,
    keepWithNext: false,
    keepWithPrevious: false,
    minLinesIfSplit: 5,
  };
  
  return [[narrativeBlock, tableBlock]];
}

function buildImprovementPages(state: WizardState): ContentBlock[][] {
  const pages: ContentBlock[][] = [];
  
  // Build improvement content from inventory
  const { improvementsInventory } = state;
  const sampleImprovements = sampleAppraisalData.improvements;
  
  // Check if we have actual building data
  const hasBuildings = improvementsInventory.parcels.some(p => p.buildings.length > 0);
  
  if (hasBuildings) {
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
  } else {
    // Use sample data for improvements
    pages.push([{
      id: 'building-sample',
      type: 'table',
      content: {
        'Building Name': sampleAppraisalData.property.name,
        'Year Built': sampleImprovements.yearBuilt,
        'Effective Age': `${sampleImprovements.effectiveAge} years`,
        'Remaining Economic Life': `${sampleImprovements.remainingLife} years`,
        'Building Type': sampleImprovements.buildingType,
        'Construction': sampleImprovements.construction,
        'Gross Building Area': `${sampleImprovements.grossBuildingArea.toLocaleString()} SF`,
        'Office Area': `${sampleImprovements.officeArea.toLocaleString()} SF`,
        'Shop/Warehouse Area': `${sampleImprovements.shopArea.toLocaleString()} SF`,
        'Mezzanine Area': `${sampleImprovements.mezzanineArea.toLocaleString()} SF`,
        'Clear Height': `${sampleImprovements.clearHeight} feet`,
        'Overhead Doors': sampleImprovements.overheadDoors,
        'Quality': sampleImprovements.quality,
        'Condition': sampleImprovements.condition,
        'Site Coverage': `${sampleImprovements.siteCoverage}%`,
      },
      canSplit: true,
      keepWithNext: false,
      keepWithPrevious: false,
      minLinesIfSplit: 5,
    }]);
  }

  return pages;
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

function buildHBUContent(state: WizardState, type: 'as-vacant' | 'as-improved'): ContentBlock[] {
  const hbu = state.hbuAnalysis;
  const sampleHbu = sampleAppraisalData.hbu;
  
  // Check if wizard has HBU data
  const hasWizardData = type === 'as-vacant' 
    ? (hbu?.asVacant?.legallyPermissible && hbu.asVacant.legallyPermissible.length > 10)
    : (hbu?.asImproved?.conclusion && hbu.asImproved.conclusion.length > 10);
  
  // Get the appropriate analysis based on type
  let analysis = '';
  if (type === 'as-vacant') {
    if (hasWizardData && hbu?.asVacant) {
      const sections = [
        hbu.asVacant.legallyPermissible && `<b>Legally Permissible:</b> ${hbu.asVacant.legallyPermissible}`,
        hbu.asVacant.physicallyPossible && `<b>Physically Possible:</b> ${hbu.asVacant.physicallyPossible}`,
        hbu.asVacant.financiallyFeasible && `<b>Financially Feasible:</b> ${hbu.asVacant.financiallyFeasible}`,
        hbu.asVacant.maximallyProductive && `<b>Maximally Productive:</b> ${hbu.asVacant.maximallyProductive}`,
        hbu.asVacant.conclusion && `<b>Conclusion:</b> ${hbu.asVacant.conclusion}`,
      ].filter(Boolean);
      analysis = sections.join('\n\n');
    } else {
      // Use sample data
      analysis = `<b>Legally Permissible:</b> ${sampleHbu.asVacant.legallyPermissible}\n\n` +
        `<b>Physically Possible:</b> ${sampleHbu.asVacant.physicallyPossible}\n\n` +
        `<b>Financially Feasible:</b> ${sampleHbu.asVacant.financiallyFeasible}\n\n` +
        `<b>Maximally Productive:</b> ${sampleHbu.asVacant.maximallyProductive}\n\n` +
        `<b>Conclusion:</b> ${sampleHbu.asVacant.conclusion}`;
    }
  } else {
    if (hasWizardData && hbu?.asImproved) {
      analysis = hbu.asImproved.conclusion || '';
    } else {
      // Use sample data
      analysis = `${sampleHbu.asImproved.analysis}\n\n<b>Conclusion:</b> ${sampleHbu.asImproved.conclusion}`;
    }
  }

  return [{
    id: `hbu-${type}-content`,
    type: 'paragraph',
    content: {
      type,
      text: analysis,
    },
    canSplit: true,
    keepWithNext: false,
    keepWithPrevious: false,
    minLinesIfSplit: 3,
  }];
}

function buildCostApproachPages(state: WizardState, scenarioId: number): ContentBlock[][] {
  // Get building data from wizard or use sample data
  const primaryBuilding = state.improvementsInventory?.parcels?.[0]?.buildings?.[0];
  const costOverrides = state.costApproachBuildingCostData?.[scenarioId]?.[primaryBuilding?.id || ''];
  const sampleCost = sampleAppraisalData.costApproach;
  const sampleImprovements = sampleAppraisalData.improvements;
  
  // Check if we have actual wizard data
  const hasWizardData = primaryBuilding != null && costOverrides != null;
  
  // Calculate building size
  const buildingSize = primaryBuilding?.areas?.reduce((sum, a) => sum + (a.squareFootage || 0), 0)
    || sampleImprovements.grossBuildingArea;
  
  // Build cost approach data
  const costData = hasWizardData ? {
    landValue: state.landValuationData?.concludedLandValue || sampleCost.landValue,
    buildingSize,
    costPerSF: costOverrides?.baseCostPsf || sampleCost.costPerSF,
    replacementCostNew: (costOverrides?.baseCostPsf || sampleCost.costPerSF) * buildingSize,
    physicalDepreciation: costOverrides?.depreciationPhysical || 0,
    functionalObsolescence: costOverrides?.depreciationFunctional || 0,
    externalObsolescence: costOverrides?.depreciationExternal || 0,
    entrepreneurialIncentive: costOverrides?.entrepreneurialIncentive || 0,
    yearBuilt: primaryBuilding?.yearBuilt || sampleImprovements.yearBuilt,
    effectiveAge: costOverrides?.effectiveAge ?? sampleImprovements.effectiveAge,
    economicLife: costOverrides?.economicLife || sampleImprovements.remainingLife + (sampleImprovements.effectiveAge || 0),
    condition: primaryBuilding?.condition || sampleImprovements.condition,
  } : {
    landValue: sampleCost.landValue,
    buildingSize: sampleImprovements.grossBuildingArea,
    costPerSF: sampleCost.costPerSF,
    replacementCostNew: sampleCost.replacementCostNew,
    physicalDepreciation: sampleCost.physicalDepreciation,
    functionalObsolescence: sampleCost.functionalObsolescence,
    externalObsolescence: sampleCost.externalObsolescence,
    entrepreneurialIncentive: 0,
    yearBuilt: sampleImprovements.yearBuilt,
    effectiveAge: sampleImprovements.effectiveAge,
    economicLife: sampleImprovements.remainingLife + sampleImprovements.effectiveAge,
    condition: sampleImprovements.condition,
  };
  
  // Calculate depreciated value
  const totalDepreciation = (costData.physicalDepreciation || 0) + 
    (costData.functionalObsolescence || 0) + 
    (costData.externalObsolescence || 0);
  const depreciatedCost = costData.replacementCostNew * (1 - totalDepreciation / 100);
  const valueConclusion = costData.landValue + depreciatedCost + (costData.entrepreneurialIncentive || 0);
  
  return [[{
    id: `cost-approach-${scenarioId}`,
    type: 'table',
    content: {
      scenarioId,
      ...costData,
      totalDepreciation,
      depreciatedCost,
      valueConclusion: hasWizardData ? valueConclusion : sampleCost.valueConclusion,
      siteImprovements: state.siteImprovements || [],
      // Flag to indicate if using sample data
      usingSampleData: !hasWizardData,
    },
    canSplit: true,
    keepWithNext: false,
    keepWithPrevious: false,
    minLinesIfSplit: 5,
  }]];
}

function buildSalesComparisonPages(state: WizardState, scenarioId: number): ContentBlock[][] {
  const salesData = state.salesComparisonData;
  const hasWizardData = salesData?.properties && salesData.properties.length > 0;
  
  // Use wizard data if available, otherwise fall back to sample data
  const comparables = hasWizardData 
    ? salesData.properties 
    : sampleAppraisalData.comparables;
  
  // Transform sample comparables to grid format if using sample data
  const gridComparables = hasWizardData ? comparables : comparables.map(comp => ({
    id: comp.id,
    label: comp.name,
    data: {
      address: comp.address,
      salePrice: `$${comp.salePrice.toLocaleString()}`,
      pricePerSF: `$${comp.pricePerSF.toFixed(2)}/SF`,
      propertyRights: 'Fee Simple',
      financing: 'Cash/Conventional',
      conditionsOfSale: 'Arms Length',
      marketConditions: '0%',
      location: 'Similar',
      siteSize: 'Similar',
      buildingSize: `${comp.buildingSize.toLocaleString()} SF`,
      yearBuilt: String(comp.yearBuilt),
      condition: 'Good',
    },
    adjustments: comp.adjustments,
  }));
  
  // Subject data from wizard or sample
  const subjectBuilding = state.improvementsInventory?.parcels?.[0]?.buildings?.[0];
  const subjectData = {
    address: state.subjectData?.propertyName || sampleAppraisalData.property.name,
    salePrice: '-',
    pricePerSF: '-',
    propertyRights: 'Fee Simple',
    financing: '-',
    conditionsOfSale: '-',
    marketConditions: '-',
    location: 'Subject',
    siteSize: state.subjectData?.siteArea 
      ? `${state.subjectData.siteArea} ${state.subjectData.siteAreaUnit || 'acres'}`
      : `${sampleAppraisalData.site.landArea} acres`,
    buildingSize: subjectBuilding?.areas?.reduce((sum, a) => sum + (a.squareFootage || 0), 0)
      ? `${subjectBuilding.areas.reduce((sum, a) => sum + (a.squareFootage || 0), 0).toLocaleString()} SF`
      : `${sampleAppraisalData.improvements.grossBuildingArea.toLocaleString()} SF`,
    yearBuilt: String(subjectBuilding?.yearBuilt || sampleAppraisalData.improvements.yearBuilt),
    condition: subjectBuilding?.condition || sampleAppraisalData.improvements.condition,
  };
  
  // Value conclusion from wizard or sample
  const concludedValue = salesData?.concludedValue ?? sampleAppraisalData.valuation.salesComparisonValue;
  const buildingSize = subjectBuilding?.areas?.reduce((sum, a) => sum + (a.squareFootage || 0), 0) 
    || sampleAppraisalData.improvements.grossBuildingArea;
  const concludedValuePsf = salesData?.concludedValuePsf ?? (concludedValue / buildingSize);
  
  return [[{
    id: `sales-comparison-${scenarioId}`,
    type: 'table',
    content: {
      scenarioId,
      subject: subjectData,
      comparables: gridComparables,
      properties: salesData?.properties || [],
      values: salesData?.values || {},
      reconciliationText: salesData?.reconciliationText || sampleAppraisalData.salesComparison.methodology,
      analysisMode: salesData?.analysisMode || 'standard',
      concludedValue,
      concludedValuePsf,
      // Flag to indicate if using sample data (for UI indication)
      usingSampleData: !hasWizardData,
    },
    canSplit: true,
    keepWithNext: false,
    keepWithPrevious: false,
    minLinesIfSplit: 5,
  }]];
}

function buildIncomeApproachPages(state: WizardState, scenarioId: number): ContentBlock[][] {
  const incomeData = state.incomeApproachData;
  const hasWizardData = incomeData?.valuationData?.noi != null && incomeData.valuationData.noi > 0;
  
  // Use wizard data if available, otherwise fall back to sample data
  const sampleIncome = sampleAppraisalData.incomeApproach;
  
  // Build income grid data
  const incomeGridData = hasWizardData ? {
    pgi: incomeData?.incomeData?.totalPotentialIncome || 0,
    vacancy: incomeData?.incomeData?.vacancyLoss || 0,
    egi: incomeData?.incomeData?.effectiveGrossIncome || 0,
    expenses: {
      propertyTaxes: incomeData?.expenseData?.realEstateTaxes || 0,
      insurance: incomeData?.expenseData?.insurance || 0,
      utilities: incomeData?.expenseData?.utilities || 0,
      repairs: incomeData?.expenseData?.repairsMaintenance || 0,
      management: incomeData?.expenseData?.management || 0,
      reserves: incomeData?.expenseData?.reserves || 0,
    },
    totalExpenses: incomeData?.expenseData?.totalExpenses || 0,
    noi: incomeData?.valuationData?.noi || 0,
    capRate: incomeData?.valuationData?.capRate || 0,
    indicatedValue: incomeData?.valuationData?.indicatedValue || 0,
  } : {
    pgi: sampleIncome.potentialGrossIncome,
    vacancy: Math.round(sampleIncome.potentialGrossIncome * (sampleIncome.vacancyRate / 100)),
    egi: sampleIncome.effectiveGrossIncome,
    expenses: {
      propertyTaxes: Math.round(sampleIncome.operatingExpenses * 0.45),
      insurance: Math.round(sampleIncome.operatingExpenses * 0.17),
      utilities: Math.round(sampleIncome.operatingExpenses * 0.13),
      repairs: Math.round(sampleIncome.operatingExpenses * 0.25),
      management: Math.round(sampleIncome.effectiveGrossIncome * 0.05),
      reserves: Math.round(sampleIncome.operatingExpenses * 0.10),
    },
    totalExpenses: sampleIncome.operatingExpenses,
    noi: sampleIncome.netOperatingIncome,
    capRate: sampleIncome.capRate,
    indicatedValue: sampleIncome.valueConclusion,
  };
  
  // Extract lease abstractions from rental income for dedicated exhibit
  const leaseAbstractions = incomeData?.incomeData?.rentalIncome
    ?.filter(item => item.leaseAbstraction)
    ?.map(item => item.leaseAbstraction) || [];
  
  const pages: ContentBlock[][] = [[{
    id: `income-approach-${scenarioId}`,
    type: 'table',
    content: {
      scenarioId,
      incomeData,
      incomeGridData,
      methodology: sampleIncome.methodology,
      // Include narratives for PDF export
      rentCompNotes: incomeData?.rentCompNotes || '',
      expenseCompNotes: incomeData?.expenseCompNotes || '',
      // Flag to indicate if using sample data
      usingSampleData: !hasWizardData,
    },
    canSplit: true,
    keepWithNext: false,
    keepWithPrevious: false,
    minLinesIfSplit: 5,
  }]];
  
  // Add lease abstractions as a separate exhibit if any exist
  if (leaseAbstractions.length > 0) {
    pages.push([{
      id: `lease-abstractions-${scenarioId}`,
      type: 'table',
      content: {
        scenarioId,
        leaseAbstractions,
        sectionTitle: 'Lease Abstract Summary',
        // Summary statistics
        totalLeasedSf: leaseAbstractions.reduce((sum, la) => sum + (la?.leasedSqFt || 0), 0),
        totalAnnualRent: leaseAbstractions.reduce((sum, la) => sum + (la?.currentBaseRent || 0), 0),
        avgRentPerSf: leaseAbstractions.length > 0 
          ? leaseAbstractions.reduce((sum, la) => sum + (la?.currentBaseRent || 0), 0) / 
            leaseAbstractions.reduce((sum, la) => sum + (la?.leasedSqFt || 0), 0)
          : 0,
      },
      canSplit: true,
      keepWithNext: false,
      keepWithPrevious: false,
      minLinesIfSplit: 5,
    }]);
  }
  
  return pages;
}

function buildLandValuationPages(state: WizardState, _scenarioId: number): ContentBlock[][] {
  const landData = state.landValuationData;
  
  return [[{
    id: `land-valuation-${_scenarioId}`,
    type: 'table',
    content: {
      scenarioId: _scenarioId,
      landComps: landData?.landComps || [],
      subjectAcreage: landData?.subjectAcreage || 0,
      concludedPricePerAcre: landData?.concludedPricePerAcre ?? null,
      concludedLandValue: landData?.concludedLandValue ?? null,
      // Include narrative for PDF export
      reconciliationText: landData?.reconciliationText || '',
    },
    canSplit: true,
    keepWithNext: false,
    keepWithPrevious: false,
    minLinesIfSplit: 5,
  }]];
}

function buildReconciliationPages(state: WizardState): ContentBlock[][] {
  const sampleRecon = sampleAppraisalData.reconciliation;
  const sampleVal = sampleAppraisalData.valuation;
  const hasWizardData = state.reconciliationData?.scenarioReconciliations && 
    state.reconciliationData.scenarioReconciliations.length > 0;
  
  return [[{
    id: 'reconciliation-content',
    type: 'paragraph',
    content: hasWizardData ? {
      reconciliationData: state.reconciliationData,
      scenarios: state.scenarios,
      conclusions: state.analysisConclusions,
    } : {
      text: sampleRecon.narrative,
      valueIndications: {
        costApproach: { value: sampleVal.costApproachValue, weight: sampleRecon.costApproachWeight },
        salesComparison: { value: sampleVal.salesComparisonValue, weight: sampleRecon.salesComparisonWeight },
        incomeApproach: { value: sampleVal.incomeApproachValue, weight: sampleRecon.incomeApproachWeight },
      },
      finalValue: sampleVal.asIsValue,
      exposurePeriod: sampleVal.exposurePeriod,
      marketingTime: sampleVal.marketingTime,
    },
    canSplit: true,
    keepWithNext: false,
    keepWithPrevious: false,
    minLinesIfSplit: 3,
  }]];
}

function buildCertificationContent(state: WizardState): ContentBlock[] {
  // Format inspection type for display
  const formatInspectionType = (type?: string): string => {
    const typeMap: Record<string, string> = {
      'interior_exterior': 'Interior & Exterior Inspection',
      'exterior_only': 'Exterior Only Inspection',
      'desktop': 'Desktop / No Inspection',
    };
    return type ? typeMap[type] || type : 'Interior & Exterior Inspection';
  };

  // Build certification content with inspection details
  const content: Record<string, unknown> = {
    // Inspection Information
    'Inspection Type': formatInspectionType(state.subjectData.inspectionType),
    'Inspection Date': state.subjectData.inspectionDate || 'Not specified',
    'Personal Inspection': state.subjectData.personalInspection ? 'Yes' : 'No',
  };

  // Add inspector details if a different inspector performed the inspection
  if (!state.subjectData.personalInspection && state.subjectData.inspectorName) {
    content['Inspector Name'] = state.subjectData.inspectorName;
    if (state.subjectData.inspectorLicense) {
      content['Inspector License'] = state.subjectData.inspectorLicense;
    }
  }

  // License information
  content['License Number'] = state.subjectData.licenseNumber || 'Not specified';
  content['License State'] = state.subjectData.licenseState || 'Not specified';
  if (state.subjectData.licenseExpiration) {
    content['License Expiration'] = state.subjectData.licenseExpiration;
  }

  // Professional assistance disclosure (USPAP requirement)
  if (state.subjectData.appraisalAssistance) {
    content['Professional Assistance'] = state.subjectData.appraisalAssistance;
  }

  // Additional certifications
  if (state.subjectData.additionalCertifications) {
    content['Additional Certifications'] = state.subjectData.additionalCertifications;
  }

  // Standard certifications from reconciliation (if any)
  if (state.reconciliationData?.certifications && state.reconciliationData.certifications.length > 0) {
    content['Selected Certifications'] = state.reconciliationData.certifications;
  }

  return [{
    id: 'certification-content',
    type: 'paragraph',
    content,
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
  // Use sample data for assumptions and limiting conditions
  const sampleAssumptions = sampleAppraisalData.assumptions;
  const sampleLimitingConditions = sampleAppraisalData.limitingConditions;
  
  return [
    // Page 1: Assumptions
    [{
      id: 'assumptions-content',
      type: 'list',
      content: {
        title: 'General Assumptions',
        items: sampleAssumptions,
      },
      canSplit: true,
      keepWithNext: false,
      keepWithPrevious: false,
      minLinesIfSplit: 2,
    }],
    // Page 2: Limiting Conditions
    [{
      id: 'limiting-conditions-content',
      type: 'list',
      content: {
        title: 'Limiting Conditions',
        items: sampleLimitingConditions,
      },
      canSplit: true,
      keepWithNext: false,
      keepWithPrevious: false,
      minLinesIfSplit: 2,
    }],
  ];
}

function buildPhotoPages(state: WizardState): Partial<ReportPage>[] {
  const reportPhotos = state.reportPhotos;
  const stagingPhotos = state.stagingPhotos;
  const samplePhotos = sampleAppraisalData.photos;
  
  // Combine assigned photos from reportPhotos and any assigned staging photos
  const allPhotos: Array<{ id: string; url: string; caption: string; slotId: string }> = [];
  
  // Add photos from reportPhotos assignments
  if (reportPhotos?.assignments) {
    reportPhotos.assignments.forEach(photo => {
      allPhotos.push({
        id: photo.id,
        url: photo.url,
        caption: photo.caption,
        slotId: photo.slotId,
      });
    });
  }
  
  // Add assigned staging photos
  if (stagingPhotos) {
    stagingPhotos
      .filter(p => p.assignedSlot && p.preview)
      .forEach(photo => {
        // Don't add duplicates
        if (!allPhotos.some(p => p.slotId === photo.assignedSlot)) {
          allPhotos.push({
            id: photo.id,
            url: photo.preview,
            caption: photo.filename,
            slotId: photo.assignedSlot!,
          });
        }
      });
  }
  
  // Use sample photos if none available
  if (allPhotos.length === 0) {
    samplePhotos.forEach((photo, idx) => {
      allPhotos.push({
        id: photo.id,
        url: photo.url,
        caption: photo.caption,
        slotId: `sample-slot-${idx}`,
      });
    });
  }
  
  if (allPhotos.length === 0) {
    return [];
  }
  
  // Create photo grid pages (6 photos per page)
  const photosPerPage = 6;
  const pages: Partial<ReportPage>[] = [];
  
  for (let i = 0; i < allPhotos.length; i += photosPerPage) {
    const pagePhotos = allPhotos.slice(i, i + photosPerPage);
    pages.push({
      id: `photo-grid-${i / photosPerPage}`,
      layout: 'photo-grid-6',
      sectionId: 'photos',
      title: i === 0 ? 'Subject Property Photos' : undefined,
      photos: pagePhotos.map((p, idx) => ({
        id: p.id,
        url: p.url,
        caption: p.caption,
        category: 'exterior' as const,
        sortOrder: i + idx,
      })),
    });
  }
  
  return pages;
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

