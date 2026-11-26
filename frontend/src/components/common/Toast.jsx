import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const Toast = () => {
  const { toastMessage } = useCart();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce duration-300">
      <div className="bg-brand-secondary text-brand-cream border border-brand-gold/50 shadow-premium px-4 py-3 rounded-xl flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-brand-gold flex-shrink-0" />
        <p className="text-sm font-medium">{toastMessage}</p>
      </div>
    </div>
  );
};
