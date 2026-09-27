import { useContext } from 'react';
import { CommerceContext, CommerceContextType } from '../context/CommerceContext';

export const useCommerce = (): CommerceContextType => {
  const context = useContext(CommerceContext);
  if (!context) {
    throw new Error('useCommerce must be used within a CommerceProvider');
  }
  return context;
};

