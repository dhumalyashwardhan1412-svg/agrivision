import { useState, useEffect } from 'react';

export interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
  requestLocation: () => void;
}

export const useGeolocation = (): GeolocationState => {
  const [latitude, setLatitude] = useState<number | null>(30.9010); // Default Punjab/Delhi region
  const [longitude, setLongitude] = useState<number | null>(75.8573);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLoading(false);
      },
      (err) => {
        console.warn('Geolocation access denied or unavailable, using fallback', err);
        setError('Location permission denied. Showing default region.');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  return { latitude, longitude, error, loading, requestLocation };
};
