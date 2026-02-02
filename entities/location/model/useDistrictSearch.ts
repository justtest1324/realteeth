import { useMemo, useState } from 'react';
import { loadDistricts } from '../lib/districts';
import { searchDistricts } from '../lib/search';
import type { District } from '../types';

/**
 * Hook for district search functionality
 * Combines district loading and search logic
 */
export function useDistrictSearch() {
  const [query, setQuery] = useState('');

  // Load districts once
  const districts = useMemo<District[]>(() => loadDistricts(), []);

  // Search results based on current query
  const results = useMemo<District[]>(
    () => searchDistricts(query, districts),
    [query, districts]
  );

  return {
    query,
    setQuery,
    results,
    districts,
  };
}
