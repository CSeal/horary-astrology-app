// src/hooks/useLocation.ts
// expo-location wrapper hook.
// Returns location state and a function to request/refresh location.

import { useState, useEffect } from 'react';
import { locationService, type LocationResult } from '../services/locationService';

interface UseLocationReturn {
  location: LocationResult | null;
  permissionStatus: 'granted' | 'denied' | 'undetermined' | 'loading';
  requestLocation: () => Promise<void>;
}

export function useLocation(): UseLocationReturn {
  const [location, setLocation] = useState<LocationResult | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<
    'granted' | 'denied' | 'undetermined' | 'loading'
  >('loading');

  async function requestLocation() {
    setPermissionStatus('loading');
    const status = await locationService.getPermissionStatus();

    if (status === 'undetermined') {
      const granted = await locationService.requestPermission();
      if (!granted) {
        setPermissionStatus('denied');
        return;
      }
    } else if (status === 'denied') {
      setPermissionStatus('denied');
      return;
    }

    try {
      const result = await locationService.getCurrentLocation();
      setLocation(result);
      setPermissionStatus('granted');
    } catch {
      setPermissionStatus('denied');
    }
  }

  useEffect(() => {
    requestLocation();
  }, []);

  return { location, permissionStatus, requestLocation };
}
