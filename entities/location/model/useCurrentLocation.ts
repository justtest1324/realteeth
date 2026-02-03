import { useState, useEffect, useCallback } from "react";
import type { GeolocationState } from "../types";

export function useCurrentLocation(): GeolocationState & { retry: () => void } {
  const [state, setState] = useState<GeolocationState>({
    status: "idle",
    coords: null,
    error: null,
  });

  const fetchLocation = useCallback(() => {
    // Check if geolocation is supported
    if (typeof window === "undefined" || !navigator.geolocation) {
      setState({
        status: "error",
        coords: null,
        error: "위치 서비스를 지원하지 않는 브라우저입니다",
      });
      return;
    }

    setState({
      status: "loading",
      coords: null,
      error: null,
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          status: "success",
          coords: {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          },
          error: null,
        });
      },
      (error) => {
        let errorMessage = "알 수 없는 오류가 발생했습니다";

        switch (error.code) {
          case 1: // PERMISSION_DENIED
            errorMessage = "위치 권한이 거부되었습니다";
            break;
          case 2: // POSITION_UNAVAILABLE
            errorMessage = "위치 정보를 사용할 수 없습니다";
            break;
          case 3: // TIMEOUT
            errorMessage = "위치 요청 시간이 초과되었습니다";
            break;
        }

        setState({
          status: "error",
          coords: null,
          error: errorMessage,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  useEffect(() => {
    queueMicrotask(() => fetchLocation());
  }, [fetchLocation]);

  return {
    ...state,
    retry: fetchLocation,
  };
}
