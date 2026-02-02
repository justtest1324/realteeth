'use client';

import Image from 'next/image';

interface WeatherIconProps {
  icon: string;
  size?: number;
  className?: string;
}

export function WeatherIcon({ icon, size = 50, className }: WeatherIconProps) {
  const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

  return (
    <Image
      src={iconUrl}
      alt="Weather icon"
      width={size}
      height={size}
      className={className}
      unoptimized
    />
  );
}
