import { useState, useEffect } from 'react';
import { useAuthStore } from './authStore';

export function useHydratedAuthStore() {
  const isHydrated = useAuthStore(state => state.isHydrated);
  const [hydrated, setHydrated] = useState(isHydrated);

  useEffect(() => {
    if (isHydrated) {
      setHydrated(true);
      return;
    }
    const unsub = useAuthStore.subscribe(
      (state) => state.isHydrated,
      (value) => {
        if (value) {
          setHydrated(true);
          unsub();
        }
      }
    );
    return () => unsub();
  }, [isHydrated]);

  return hydrated;
}
