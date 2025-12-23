import type { ReportPhoto, ReportPage, PhotoGridLayoutType, PhotoCategory } from '../../../types';

interface PhotoPageGeneratorOptions {
  photosPerPage6?: number;
  photosPerPage4?: number;
  includeAttribution?: boolean;
  defaultPhotographer?: string;
}

/**
 * Group photos by category
 */
export function groupPhotosByCategory(photos: ReportPhoto[]): Record<PhotoCategory, ReportPhoto[]> {
  const grouped: Record<PhotoCategory, ReportPhoto[]> = {
    aerial: [],
    exterior: [],
    interior: [],
    site: [],
    street: [],
    neighborhood: [],
    comparable: [],
  };

  photos.forEach(photo => {
    if (grouped[photo.category]) {
      grouped[photo.category].push(photo);
    }
  });

  // Sort each category by sortOrder
  Object.keys(grouped).forEach(category => {
    grouped[category as PhotoCategory].sort((a, b) => a.sortOrder - b.sortOrder);
  });

  return grouped;
}

/**
 * Split photos into chunks for page layout
 */
function chunkPhotos(photos: ReportPhoto[], size: number): ReportPhoto[][] {
  const chunks: ReportPhoto[][] = [];
  for (let i = 0; i < photos.length; i += size) {
    chunks.push(photos.slice(i, i + size));
  }
  return chunks;
}


/**
 * Generate photo pages from a collection of photos
 */
export function generatePhotoPages(
  photos: ReportPhoto[],
  options: PhotoPageGeneratorOptions = {}
): Partial<ReportPage>[] {
  const {
    photosPerPage6 = 6,
    photosPerPage4 = 4,
    includeAttribution = true,
  } = options;

  const pages: Partial<ReportPage>[] = [];
  const grouped = groupPhotosByCategory(photos);

  // 1. Aerial page (single full-page photo)
  if (grouped.aerial.length > 0) {
    pages.push({
      layout: 'photo-single',
      sectionId: 'photos',
      title: 'Aerial View of Subject Property',
      photos: [grouped.aerial[0]],
    });
  }

  // 2. Exterior photos (6 per page)
  if (grouped.exterior.length > 0) {
    const exteriorChunks = chunkPhotos(grouped.exterior, photosPerPage6);
    exteriorChunks.forEach((chunk, index) => {
      const isLastChunk = index === exteriorChunks.length - 1;
      pages.push({
        layout: 'photo-grid-6',
        sectionId: 'photos',
        title: 'Subject Property Photos',
        photos: chunk,
        showAttribution: includeAttribution && isLastChunk,
      });
    });
  }

  // 3. Interior photos (6 per page)
  if (grouped.interior.length > 0) {
    const interiorChunks = chunkPhotos(grouped.interior, photosPerPage6);
    interiorChunks.forEach((chunk, index) => {
      const isLastChunk = index === interiorChunks.length - 1;
      pages.push({
        layout: 'photo-grid-6',
        sectionId: 'photos',
        title: 'Subject Property Photos',
        photos: chunk,
        showAttribution: includeAttribution && isLastChunk && grouped.site.length === 0,
      });
    });
  }

  // 4. Site/Yard photos (4 per page - larger format)
  if (grouped.site.length > 0 || grouped.street.length > 0) {
    const siteAndStreet = [...grouped.site, ...grouped.street];
    const siteChunks = chunkPhotos(siteAndStreet, photosPerPage4);
    siteChunks.forEach((chunk, index) => {
      const isLastChunk = index === siteChunks.length - 1;
      pages.push({
        layout: 'photo-grid-4',
        sectionId: 'photos',
        title: 'Subject Property Photos',
        photos: chunk,
        showAttribution: includeAttribution && isLastChunk && grouped.neighborhood.length === 0,
      });
    });
  }

  // 5. Neighborhood photos (if any)
  if (grouped.neighborhood.length > 0) {
    const neighborhoodChunks = chunkPhotos(grouped.neighborhood, photosPerPage4);
    neighborhoodChunks.forEach((chunk, index) => {
      const isLastChunk = index === neighborhoodChunks.length - 1;
      pages.push({
        layout: 'photo-grid-4',
        sectionId: 'photos',
        title: 'Neighborhood Photos',
        photos: chunk,
        showAttribution: includeAttribution && isLastChunk,
      });
    });
  }

  return pages;
}

/**
 * Generate comparable sale photo pages
 */
export function generateCompPhotoPages(
  photos: ReportPhoto[],
  options: { compNumber?: number } = {}
): Partial<ReportPage>[] {
  const pages: Partial<ReportPage>[] = [];
  const { compNumber } = options;

  if (photos.length === 0) return pages;

  // Group comparable photos in sets of 4
  const chunks = chunkPhotos(photos, 4);
  
  chunks.forEach((chunk) => {
    pages.push({
      layout: 'photo-grid-4',
      sectionId: compNumber ? `comp-${compNumber}` : 'comparable-photos',
      title: compNumber 
        ? `Comparable Sale ${compNumber} Photos` 
        : 'Comparable Sale Photos',
      photos: chunk,
    });
  });

  return pages;
}

/**
 * Auto-layout photos based on count and available space
 */
export function autoLayoutPhotos(
  photos: ReportPhoto[],
  maxPagesHint?: number
): { layout: PhotoGridLayoutType; photos: ReportPhoto[] }[] {
  const layouts: { layout: PhotoGridLayoutType; photos: ReportPhoto[] }[] = [];
  let remaining = [...photos];

  while (remaining.length > 0) {
    if (remaining.length >= 6) {
      layouts.push({ layout: 'grid-6', photos: remaining.splice(0, 6) });
    } else if (remaining.length >= 4) {
      layouts.push({ layout: 'grid-4', photos: remaining.splice(0, 4) });
    } else if (remaining.length >= 2) {
      layouts.push({ layout: 'grid-2', photos: remaining.splice(0, 2) });
    } else {
      layouts.push({ layout: 'single', photos: remaining.splice(0, 1) });
    }
  }

  // If maxPagesHint is provided, try to fit within that limit
  if (maxPagesHint && layouts.length > maxPagesHint) {
    // Try to consolidate by using larger grids
    // This is a simplification - a full implementation would be more sophisticated
    console.warn(`Photo layout exceeds ${maxPagesHint} pages, consider reducing photos`);
  }

  return layouts;
}

/**
 * Calculate estimated photo pages based on photo count
 */
export function estimatePhotoPageCount(photos: ReportPhoto[]): number {
  const grouped = groupPhotosByCategory(photos);
  
  let pageCount = 0;

  // Aerial (1 page if present)
  if (grouped.aerial.length > 0) pageCount += 1;

  // Exterior (6 per page)
  pageCount += Math.ceil(grouped.exterior.length / 6);

  // Interior (6 per page)
  pageCount += Math.ceil(grouped.interior.length / 6);

  // Site + Street (4 per page)
  const siteAndStreet = grouped.site.length + grouped.street.length;
  pageCount += Math.ceil(siteAndStreet / 4);

  // Neighborhood (4 per page)
  pageCount += Math.ceil(grouped.neighborhood.length / 4);

  return pageCount;
}

/**
 * Validate photo requirements
 */
export function validatePhotoRequirements(
  photos: ReportPhoto[],
  requirements?: { category: PhotoCategory; minCount: number; required: boolean }[]
): { valid: boolean; missing: string[]; warnings: string[] } {
  const grouped = groupPhotosByCategory(photos);
  const missing: string[] = [];
  const warnings: string[] = [];

  const defaultRequirements = [
    { category: 'aerial' as PhotoCategory, minCount: 1, required: true },
    { category: 'exterior' as PhotoCategory, minCount: 4, required: true },
    { category: 'street' as PhotoCategory, minCount: 2, required: true },
  ];

  const reqs = requirements || defaultRequirements;

  reqs.forEach(req => {
    const count = grouped[req.category].length;
    if (count < req.minCount) {
      const message = `${req.category}: ${count}/${req.minCount} photos`;
      if (req.required) {
        missing.push(message);
      } else {
        warnings.push(message);
      }
    }
  });

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

export default {
  groupPhotosByCategory,
  generatePhotoPages,
  generateCompPhotoPages,
  autoLayoutPhotos,
  estimatePhotoPageCount,
  validatePhotoRequirements,
};

