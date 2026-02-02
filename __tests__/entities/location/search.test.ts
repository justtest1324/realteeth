import { describe, it, expect } from 'vitest';
import { searchDistricts } from '@/entities/location/lib/search';

describe('searchDistricts', () => {
  const mockDistricts = [
    '서울특별시',
    '서울특별시-종로구',
    '서울특별시-종로구-청운동',
    '서울특별시-강남구',
    '서울특별시-강남구-역삼동',
    '부산광역시',
    '부산광역시-해운대구',
    '부산광역시-해운대구-우동',
    '경기도-수원시',
    '경기도-수원시-팔달구',
  ];

  it('should return empty array for empty string query', () => {
    const result = searchDistricts('', mockDistricts);
    expect(result).toEqual([]);
  });

  it('should filter districts by partial match (case insensitive for ASCII)', () => {
    const result = searchDistricts('서울', mockDistricts);
    expect(result).toEqual([
      '서울특별시',
      '서울특별시-종로구',
      '서울특별시-종로구-청운동',
      '서울특별시-강남구',
      '서울특별시-강남구-역삼동',
    ]);
  });

  it('should filter districts by exact match', () => {
    const result = searchDistricts('종로구', mockDistricts);
    expect(result).toEqual([
      '서울특별시-종로구',
      '서울특별시-종로구-청운동',
    ]);
  });

  it('should filter districts by dong name', () => {
    const result = searchDistricts('역삼동', mockDistricts);
    expect(result).toEqual(['서울특별시-강남구-역삼동']);
  });

  it('should return empty array when no matches found', () => {
    const result = searchDistricts('제주도', mockDistricts);
    expect(result).toEqual([]);
  });

  it('should limit results to max 20 items', () => {
    const manyDistricts = Array.from({ length: 50 }, (_, i) => `서울특별시-구${i}`);
    const result = searchDistricts('서울', manyDistricts);
    expect(result.length).toBeLessThanOrEqual(20);
  });

  it('should handle multiple character matching', () => {
    const result = searchDistricts('강남구-역삼', mockDistricts);
    expect(result).toEqual(['서울특별시-강남구-역삼동']);
  });

  it('should be case insensitive for ASCII characters', () => {
    const mixedDistricts = ['Seoul-Gangnam', 'BUSAN-Haeundae', 'Gyeonggi-Suwon'];
    const result = searchDistricts('seoul', mixedDistricts);
    expect(result).toEqual(['Seoul-Gangnam']);
  });

  it('should trim whitespace from query', () => {
    const result = searchDistricts('  종로구  ', mockDistricts);
    expect(result).toEqual([
      '서울특별시-종로구',
      '서울특별시-종로구-청운동',
    ]);
  });
});
