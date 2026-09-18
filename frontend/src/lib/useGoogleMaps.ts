import { useState, useEffect } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

export type GoogleMapsStatus = 'loading' | 'loaded' | 'error' | 'missing-key';

let loaderPromise: Promise<typeof google> | null = null;
let isOptionsConfigured = false;

function loadGoogleMapsApi(): Promise<typeof google> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('SSR_NOT_SUPPORTED'));
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google);
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();
  if (!apiKey) {
    return Promise.reject(new Error('MISSING_API_KEY'));
  }

  if (!loaderPromise) {
    loaderPromise = (async () => {
      if (!isOptionsConfigured) {
        setOptions({
          key: apiKey,
          v: 'weekly',
        });
        isOptionsConfigured = true;
      }
      await importLibrary('maps');
      return window.google;
    })().catch((err) => {
      loaderPromise = null;
      throw err;
    });
  }

  return loaderPromise;
}

export function useGoogleMaps() {
  const [status, setStatus] = useState<GoogleMapsStatus>(() => {
    if (typeof window === 'undefined') return 'loading';
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();
    if (!key) return 'missing-key';
    if (window.google?.maps) return 'loaded';
    return 'loading';
  });

  useEffect(() => {
    let isMounted = true;
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();

    if (!key) {
      setStatus('missing-key');
      return;
    }

    if (window.google?.maps) {
      setStatus('loaded');
      return;
    }

    setStatus('loading');

    loadGoogleMapsApi()
      .then(() => {
        if (isMounted) {
          setStatus('loaded');
        }
      })
      .catch((err) => {
        if (isMounted) {
          if (err?.message === 'MISSING_API_KEY') {
            setStatus('missing-key');
          } else {
            console.error('Failed to load Google Maps script', err);
            setStatus('error');
          }
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    isLoaded: status === 'loaded',
    status,
  };
}
