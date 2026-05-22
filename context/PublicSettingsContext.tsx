'use client';

import {
  createContext,
  useContext,
  type ReactNode,
} from 'react';

import type { PublicSettings } from '@/types/public-settings';

interface PublicSettingsContextValue {
  settings: PublicSettings;
}

const PublicSettingsContext =
  createContext<PublicSettingsContextValue | null>(null);

export function PublicSettingsProvider({
  children,
  settings,
}: {
  children: ReactNode;
  settings: PublicSettings;
}) {
  return (
    <PublicSettingsContext.Provider value={{ settings }}>
      {children}
    </PublicSettingsContext.Provider>
  );
}

export function usePublicSettings() {
  const context = useContext(PublicSettingsContext);

  if (!context) {
    throw new Error(
      'usePublicSettings deve ser usado dentro de PublicSettingsProvider'
    );
  }

  return context;
}
