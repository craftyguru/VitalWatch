import { useState, useEffect, useCallback } from 'react';

interface GeolocationData {
  lat: number;
  lng: number;
  accuracy?: number;
  address?: string;
}

interface GeolocationError {
  code: number;
  message: string;
}

export function useGeolocation() {
  const [location, setLocation] = useState<GeolocationData | null>(null);
  const [error, setError] = useState<GeolocationError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  const getCurrentPosition = useCallback(async (highAccuracy: boolean = false): Promise<GeolocationData | null> => {
    if (!navigator.geolocation) {
      const error = { code: 0, message: "Geolocation is not supported by this browser" };
      setError(error);
      return null;
    }

    setIsLoading(true);
    setError(null);

    return new Promise((resolve) => {
      const options: PositionOptions = {
        enableHighAccuracy: highAccuracy,
        timeout: highAccuracy ? 15000 : 10000,
        maximumAge: highAccuracy ? 0 : 300000, // 5 minutes for regular, fresh for high accuracy
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const locationData: GeolocationData = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };

          // Try to get address using reverse geocoding
          try {
            const address = await reverseGeocode(locationData.lat, locationData.lng);
            locationData.address = address;
          } catch (geocodeError) {
            console.warn('Reverse geocoding failed:', geocodeError);
          }

          setLocation(locationData);
          setIsLoading(false);
          resolve(locationData);
        },
        (error) => {
          const errorData = {
            code: error.code,
            message: getGeolocationErrorMessage(error.code),
          };
          setError(errorData);
          setIsLoading(false);
          resolve(null);
        },
        options
      );
    });
  }, []);

  const startWatching = useCallback((highAccuracy: boolean = false) => {
    if (!navigator.geolocation || isWatching) return;

    const options: PositionOptions = {
      enableHighAccuracy: highAccuracy,
      timeout: 10000,
      maximumAge: 60000, // 1 minute
    };

    const id = navigator.geolocation.watchPosition(
      async (position) => {
        const locationData: GeolocationData = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };

        try {
          const address = await reverseGeocode(locationData.lat, locationData.lng);
          locationData.address = address;
        } catch (geocodeError) {
          console.warn('Reverse geocoding failed:', geocodeError);
        }

        setLocation(locationData);
        setError(null);
      },
      (error) => {
        const errorData = {
          code: error.code,
          message: getGeolocationErrorMessage(error.code),
        };
        setError(errorData);
      },
      options
    );

    setWatchId(id);
    setIsWatching(true);
  }, [isWatching]);

  const stopWatching = useCallback(() => {
    if (watchId !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setIsWatching(false);
    }
  }, [watchId]);

  // Clean up watch on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return {
    location,
    error,
    isLoading,
    isWatching,
    getCurrentPosition,
    startWatching,
    stopWatching,
  };
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    // Using a free geocoding service (you might want to use Google Maps API or similar in production)
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    );
    
    if (!response.ok) {
      throw new Error('Geocoding service unavailable');
    }
    
    const data = await response.json();
    
    const parts = [];
    if (data.locality) parts.push(data.locality);
    if (data.principalSubdivision) parts.push(data.principalSubdivision);
    if (data.countryName) parts.push(data.countryName);
    
    return parts.length > 0 ? parts.join(', ') : `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch (error) {
    // Fallback to coordinates
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

function getGeolocationErrorMessage(code: number): string {
  switch (code) {
    case 1:
      return "Location access denied by user";
    case 2:
      return "Location information unavailable";
    case 3:
      return "Location request timed out";
    default:
      return "Unknown location error";
  }
}
