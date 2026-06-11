// Sector/Subsector helpers for filtering announcements by sector mapping
import sectorMapping from '../../sector_subsector_mapping.json';

// Type for the JSON structure: { "Sector": { "Subsector": ["Company1", ...] } }
export type SectorMapping = Record<string, Record<string, string[]>>;

const typedMapping = sectorMapping as SectorMapping;

/**
 * Returns sorted list of all sector names from the mapping
 */
export function getSectorNames(): string[] {
  return Object.keys(typedMapping).sort();
}

/**
 * Returns sorted list of subsector names for a given sector
 */
export function getSubsectorNames(sector: string): string[] {
  const subsectors = typedMapping[sector];
  if (!subsectors) return [];
  return Object.keys(subsectors).sort();
}

/**
 * Normalize a company name for fuzzy matching.
 * Strips suffixes like Ltd., Limited, Corp, etc., removes punctuation, lowercases.
 */
function normalizeCompanyName(name: string): string {
  return name
    .replace(/\b(Ltd\.?|Limited|Corp\.?|Corporation|Co\.?|Company)\b/gi, '')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Build a Set of normalized company names that belong to a given sector,
 * optionally narrowed to a specific subsector.
 * If subsector is 'All' or empty, includes all subsectors.
 */
export function getSectorCompanySet(sector: string, subsector?: string): Set<string> {
  const matchingSet = new Set<string>();
  const sectorData = typedMapping[sector];
  if (!sectorData) return matchingSet;

  if (subsector && subsector !== 'All') {
    // Only include companies from the specific subsector
    const companies = sectorData[subsector];
    if (companies) {
      for (const company of companies) {
        matchingSet.add(normalizeCompanyName(company));
      }
    }
  } else {
    // Include companies from all subsectors within this sector
    for (const companies of Object.values(sectorData)) {
      for (const company of companies) {
        matchingSet.add(normalizeCompanyName(company));
      }
    }
  }

  return matchingSet;
}

/**
 * Check if a DB company_name matches any company in the normalized set.
 * Uses normalized comparison to handle mismatches like "Bharti Airtel Ltd" vs "Bharti Airtel Ltd."
 */
export function isCompanyInSectorSet(dbCompanyName: string, companySet: Set<string>): boolean {
  return companySet.has(normalizeCompanyName(dbCompanyName));
}

/**
 * Get all company names (un-normalized) for a sector/subsector, useful for search keywords.
 */
export function getSectorCompanyNames(sector: string, subsector?: string): string[] {
  const sectorData = typedMapping[sector];
  if (!sectorData) return [];

  if (subsector && subsector !== 'All') {
    return sectorData[subsector] || [];
  }

  const allCompanies: string[] = [];
  for (const companies of Object.values(sectorData)) {
    allCompanies.push(...companies);
  }
  return allCompanies;
}
