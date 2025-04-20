import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AppErrorState } from '../types';

interface ErrorContextType {
  error: AppErrorState;
  setError: (error: Partial<AppErrorState>) => void;
  clearError: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

interface ErrorProviderProps {
  children: ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [error, setErrorState] = useState<AppErrorState>({
    hasError: false,
    message: '',
  });

  const setError = (newError: Partial<AppErrorState>) => {
    setErrorState(prev => ({
      ...prev,
      ...newError,
      hasError: true,
    }));
    
    // Log error to console for debugging
    console.error('Application error:', newError.message);
  };

  const clearError = () => {
    setErrorState({
      hasError: false,
      message: '',
    });
  };

  return (
    <ErrorContext.Provider value={{ error, setError, clearError }}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useError = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
}; 