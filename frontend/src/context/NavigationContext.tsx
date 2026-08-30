import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type NavigationTab =
  | 'dashboard'
  | 'pos'
  | 'customers'
  | 'products'
  | 'orders'
  | 'outbox'
  | 'users'
  | 'tenants';

interface NavigationContextType {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  navigateTo: (tab: NavigationTab | string) => void;
  isMobile: boolean;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navigateTo = useCallback((tab: NavigationTab | string) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <NavigationContext.Provider
      value={{
        currentTab,
        setCurrentTab,
        navigateTo,
        isMobile,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

