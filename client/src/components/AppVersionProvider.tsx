import { createContext, useContext, useEffect, useState } from 'react';

interface VersionInfo {
  version: string;
  buildDate: string;
  environment: string;
  commitHash: string;
  isDevelopment: boolean;
}

const VersionContext = createContext<VersionInfo | null>(null);

export function useVersion() {
  const context = useContext(VersionContext);
  if (!context) {
    throw new Error('useVersion must be used within a VersionProvider');
  }
  return context;
}

interface VersionProviderProps {
  children: React.ReactNode;
}

export function VersionProvider({ children }: VersionProviderProps) {
  const [versionInfo, setVersionInfo] = useState<VersionInfo>({
    version: "2.4.1",
    buildDate: new Date().toISOString().split('T')[0],
    environment: import.meta.env.MODE || 'development',
    commitHash: "a7f3d92",
    isDevelopment: (import.meta.env.MODE || 'development') === 'development'
  });

  // In a real app, you could fetch this from an API endpoint
  useEffect(() => {
    const fetchVersionInfo = async () => {
      try {
        // This would be an API call in production
        // const response = await fetch('/api/version');
        // const data = await response.json();
        // setVersionInfo(data);
        
        // For now, we use static data with current timestamp
        setVersionInfo(prev => ({
          ...prev,
          buildDate: new Date().toISOString().split('T')[0]
        }));
      } catch (error) {
        console.warn('Could not fetch version info:', error);
      }
    };

    fetchVersionInfo();
  }, []);

  return (
    <VersionContext.Provider value={versionInfo}>
      {children}
    </VersionContext.Provider>
  );
}