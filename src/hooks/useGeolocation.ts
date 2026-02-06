import { useState, useCallback } from 'react';

interface GeolocationState {
  lat: number | null;
  lng: number | null;
  error: string | null;
  isLoading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    lat: null,
    lng: null,
    error: null,
    isLoading: false,
  });

  const getCurrentPosition = useCallback((): Promise<{ lat: number; lng: number }> => {
    const resolveMessage = (error: unknown) => {
      const name = typeof error === 'object' && error ? (error as { name?: string }).name : undefined;
      const message = typeof error === 'object' && error ? (error as { message?: string }).message : undefined;
      const code = typeof error === 'object' && error ? (error as { code?: number }).code : undefined;

      if (name === 'AbortError' || (message && /abort/i.test(message))) {
        return 'Location request was interrupted. Please try again.';
      }

      if (typeof code === 'number') {
        switch (code) {
          case 1:
            return 'Location permission denied';
          case 2:
            return 'Location unavailable';
          case 3:
            return 'Location request timed out';
        }
      }

      return 'Unable to get location';
    };

    const shouldRetry = (error: unknown) => {
      const name = typeof error === 'object' && error ? (error as { name?: string }).name : undefined;
      const message = typeof error === 'object' && error ? (error as { message?: string }).message : undefined;
      return name === 'AbortError' || (message && /abort/i.test(message));
    };

    const attempt = (options: PositionOptions) =>
      new Promise<GeolocationPosition>((resolve, reject) => {
        try {
          navigator.geolocation.getCurrentPosition(resolve, reject, options);
        } catch (error) {
          reject(error);
        }
      });

    return new Promise(async (resolve, reject) => {
      if (!navigator.geolocation) {
        const errorMessage = 'Geolocation is not supported by this browser';
        setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
        reject(new Error(errorMessage));
        return;
      }

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const baseOptions: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      };

      try {
        const position = await attempt(baseOptions);
        const { latitude: lat, longitude: lng } = position.coords;
        setState({ lat, lng, error: null, isLoading: false });
        resolve({ lat, lng });
      } catch (error) {
        if (shouldRetry(error)) {
          try {
            const retryPosition = await attempt({
              enableHighAccuracy: false,
              timeout: 15000,
              maximumAge: 60000,
            });
            const { latitude: lat, longitude: lng } = retryPosition.coords;
            setState({ lat, lng, error: null, isLoading: false });
            resolve({ lat, lng });
            return;
          } catch (retryError) {
            const errorMessage = resolveMessage(retryError);
            setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
            reject(new Error(errorMessage));
            return;
          }
        }

        const errorMessage = resolveMessage(error);
        setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
        reject(new Error(errorMessage));
      }
    });
  }, []);

  return {
    ...state,
    getCurrentPosition,
  };
}
