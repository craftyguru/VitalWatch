import { createContext, useContext, useState, ReactNode } from 'react';

interface IncognitoContextType {
  incognitoMode: boolean;
  setIncognitoMode: (value: boolean) => void;
}

const IncognitoContext = createContext<IncognitoContextType | undefined>(undefined);

export function IncognitoProvider({ children }: { children: ReactNode }) {
  const [incognitoMode, setIncognitoMode] = useState(false);
  
  return (
    <IncognitoContext.Provider value={{ incognitoMode, setIncognitoMode }}>
      {children}
    </IncognitoContext.Provider>
  );
}

export function useIncognito() {
  const context = useContext(IncognitoContext);
  if (context === undefined) {
    throw new Error('useIncognito must be used within an IncognitoProvider');
  }
  return context;
}