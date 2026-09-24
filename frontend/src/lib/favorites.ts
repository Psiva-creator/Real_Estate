'use client';

import { useState, useEffect, useCallback } from 'react';

const FAVORITES_STORAGE_KEY = 'trh_saved_properties';
const FAVORITES_EVENT = 'trh-favorites-changed';

/**
 * Read saved property IDs from localStorage safely
 */
export function getSavedPropertyIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((id): id is string => typeof id === 'string' && id.trim().length > 0);
    }
  } catch {
    // Ignore JSON parsing or storage read errors
  }
  return [];
}

/**
 * Dispatch an update event to synchronize components across the app
 */
function notifyFavoritesChanged(savedIds: string[]) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(FAVORITES_EVENT, { detail: { savedIds } }));
  }
}

/**
 * Check if a property is saved
 */
export function isPropertySaved(id: string): boolean {
  if (!id) return false;
  const current = getSavedPropertyIds();
  return current.includes(id);
}

/**
 * Toggle save state of a property ID
 */
export function toggleSavedProperty(id: string): { isSaved: boolean; savedIds: string[] } {
  if (!id || typeof window === 'undefined') {
    return { isSaved: false, savedIds: [] };
  }

  try {
    const current = getSavedPropertyIds();
    const index = current.indexOf(id);
    let next: string[];
    let isSaved: boolean;

    if (index > -1) {
      next = current.filter((item) => item !== id);
      isSaved = false;
    } else {
      next = [...current, id];
      isSaved = true;
    }

    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
    notifyFavoritesChanged(next);
    return { isSaved, savedIds: next };
  } catch (err) {
    console.error('Failed to update saved properties in localStorage:', err);
    return { isSaved: false, savedIds: getSavedPropertyIds() };
  }
}

/**
 * React hook to observe and toggle saved/favorited properties
 */
export function useFavorites() {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize from localStorage on mount (prevents SSR hydration mismatch)
    const initial = getSavedPropertyIds();
    setSavedIds(initial);
    setIsReady(true);

    const handleLocalChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ savedIds?: string[] }>;
      if (customEvent.detail?.savedIds) {
        setSavedIds(customEvent.detail.savedIds);
      } else {
        setSavedIds(getSavedPropertyIds());
      }
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === FAVORITES_STORAGE_KEY) {
        setSavedIds(getSavedPropertyIds());
      }
    };

    window.addEventListener(FAVORITES_EVENT, handleLocalChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener(FAVORITES_EVENT, handleLocalChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const isSaved = useCallback(
    (id: string): boolean => {
      if (!isReady || !id) return false;
      return savedIds.includes(id);
    },
    [isReady, savedIds]
  );

  const toggleSave = useCallback((id: string) => {
    if (!id) return;
    toggleSavedProperty(id);
  }, []);

  return {
    savedIds,
    savedCount: savedIds.length,
    isSaved,
    toggleSave,
    isReady,
  };
}
