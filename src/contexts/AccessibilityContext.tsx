import { createContext, useContext, useState, ReactNode } from 'react';

interface AccessibilityContextType {
  isAccessibilityMode: boolean;
  toggleAccessibilityMode: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType>({
  isAccessibilityMode: false,
  toggleAccessibilityMode: () => {},
});

export const useAccessibility = () => useContext(AccessibilityContext);

export const AccessibilityProvider = ({ children }: { children: ReactNode }) => {
  const [isAccessibilityMode, setIsAccessibilityMode] = useState(false);

  const toggleAccessibilityMode = () => {
    setIsAccessibilityMode(prev => !prev);
  };

  return (
    <AccessibilityContext.Provider value={{ isAccessibilityMode, toggleAccessibilityMode }}>
      {children}
    </AccessibilityContext.Provider>
  );
};
