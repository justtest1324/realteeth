import koreaDistricts from '../../../korea_districts.json';
import type { District } from '../types';

/**
 * Load Korea districts data from JSON file
 * @returns Array of district strings
 */
export function loadDistricts(): District[] {
  return koreaDistricts as District[];
}
