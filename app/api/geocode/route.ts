import { NextRequest, NextResponse } from 'next/server';
import type { GeoLocation, GeocodingResponse, GeocodingErrorResponse } from '@/entities/location/types';
import { provinceRomanization, countyRomanization } from '@/entities/location/lib/romanization';

/**
 * Generate geocoding query variations from Korean district format
 * "대전광역시-서구-가수원동" -> ["가수원동, 서구, 대전광역시, KR", "서구, 대전광역시, KR", "대전광역시, KR", "Daejeon, KR"]
 */
function generateQueryVariations(district: string): string[] {
  const parts = district.split('-').filter(Boolean);
  const queries: string[] = [];

  // Try from most specific to least specific
  // Full address: "가수원동, 서구, 대전광역시, KR"
  queries.push([...parts.reverse(), 'KR'].join(', '));

  // Reset parts order
  parts.reverse();

  // Try without dong (just gu, city): "서구, 대전광역시, KR"
  if (parts.length >= 2) {
    queries.push([...parts.slice(0, -1).reverse(), 'KR'].join(', '));
  }

  // Try just city: "대전광역시, KR"
  if (parts.length >= 1) {
    queries.push(`${parts[0]}, KR`);
  }

  // Try romanized province name
  if (parts.length >= 1 && provinceRomanization[parts[0]]) {
    queries.push(`${provinceRomanization[parts[0]]}, KR`);
    queries.push(`${provinceRomanization[parts[0]]}, South Korea`);
  }

  // Try romanized county/city name with province
  if (parts.length >= 2 && countyRomanization[parts[1]]) {
    if (provinceRomanization[parts[0]]) {
      queries.push(`${countyRomanization[parts[1]]}, ${provinceRomanization[parts[0]]}, South Korea`);
    }
    queries.push(`${countyRomanization[parts[1]]}, South Korea`);
  }

  // Try direct Korean county/city name with "South Korea"
  if (parts.length >= 2) {
    queries.push(`${parts[1]}, South Korea`);
  }

  return queries;
}

async function tryGeocode(query: string, apiKey: string): Promise<GeocodingResponse | null> {
  const geocodingUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=1&appid=${apiKey}`;

  try {
    const response = await fetch(geocodingUrl);
    if (!response.ok) return null;

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    return data[0] as GeocodingResponse;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest): Promise<NextResponse<GeoLocation | GeocodingErrorResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { error: 'MISSING_QUERY' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    if (!apiKey) {
      console.error('OPENWEATHERMAP_API_KEY is not set');
      return NextResponse.json(
        { error: 'INTERNAL_ERROR' },
        { status: 500 }
      );
    }

    // Try query variations from most specific to least specific
    const queryVariations = generateQueryVariations(query);

    for (const variation of queryVariations) {
      const location = await tryGeocode(variation, apiKey);
      if (location) {
        return NextResponse.json({
          lat: location.lat,
          lon: location.lon,
          name: location.name,
        });
      }
    }

    // No results found for any variation
    return NextResponse.json(
      { error: 'NOT_FOUND' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Geocoding error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
