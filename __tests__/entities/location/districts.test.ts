import { describe, it, expect } from 'vitest';
import { loadDistricts } from '@/entities/location/lib/districts';

describe('loadDistricts', () => {
  it('should load korea_districts.json data', () => {
    const districts = loadDistricts();
    expect(districts).toBeInstanceOf(Array);
    expect(districts.length).toBeGreaterThan(0);
  });

  it('should return array of strings', () => {
    const districts = loadDistricts();
    expect(districts.every((d) => typeof d === 'string')).toBe(true);
  });

  it('should contain expected format (city-gu-dong)', () => {
    const districts = loadDistricts();
    const hasExpectedFormat = districts.some((d) => d.includes('-'));
    expect(hasExpectedFormat).toBe(true);
  });

  it('should include Seoul districts', () => {
    const districts = loadDistricts();
    const hasSeoul = districts.some((d) => d.includes('서울특별시'));
    expect(hasSeoul).toBe(true);
  });
});
