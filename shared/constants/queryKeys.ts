export const queryKeys = {
  districts: ['districts'] as const,
  geocode: (districtId: string) => ['geocode', districtId] as const,
  weather: {
    current: (lat: number, lon: number) => ['weather', 'current', lat, lon] as const,
    forecast: (lat: number, lon: number) => ['weather', 'forecast', lat, lon] as const,
  },
} as const;
