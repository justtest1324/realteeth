import type { District } from '../types';

const MAX_RESULTS = 20;

/**
 * Search districts by query string
 * @param query - Search query (case insensitive for ASCII, trimmed)
 * @param districts - Array of district strings to search
 * @param maxResults - Maximum number of results to return (default: 20)
 * @returns Filtered array of districts matching the query
 */
export function searchDistricts(
  query: string,
  districts: District[],
  maxResults: number = MAX_RESULTS
): District[] {
  const trimmedQuery = query.trim();

  // Return empty array for empty query
  if (trimmedQuery === '') {
    return [];
  }

  // Case insensitive search
  const lowerQuery = trimmedQuery.toLowerCase();

  const results = districts.filter((district) =>
    district.toLowerCase().includes(lowerQuery)
  );

  // Limit results
  return results.slice(0, maxResults);
}
