// src/hooks/useLocation.ts
// expo-location wrapper hook.
// Returns location state and a function to request/refresh location.

import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { locationService, type LocationResult } from '@/services/locationService';

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

  const requestLocation = useCallback(async () => {
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
  }, []);

  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!cancelled) await requestLocation();
    })();
    return () => { cancelled = true; };
  }, [requestLocation]);

  // Re-check location when app returns to foreground (e.g. user granted in Settings)
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (appState.current.match(/inactive|background/) && next === 'active') {
        void requestLocation();
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, [requestLocation]);

  return { location, permissionStatus, requestLocation };
}
