import React from 'react';
import { BRAND_ASSETS } from '../../constants/productImages';

/**
 * Super Mashala & Dry Fruits — Reusable Official Brand Logo Component
 * 
 * Displays the complete, authentic unified brand logo (with the upper spice bowls
 * and the lower brand name & banner seamlessly intact as designed).
 */
export const BrandLogo = ({
  variant = 'header',
  size = 'md',
  className = '',
  onClick,
  showBadge = false
}) => {
  let logoSrc = BRAND_ASSETS.logoPng || BRAND_ASSETS.logo;
  let defaultHeight = 'h-12 sm:h-14 lg:h-16';

  switch (variant) {
    case 'footer':
      logoSrc = BRAND_ASSETS.logoFooter || BRAND_ASSETS.logoPng;
      defaultHeight = 'h-16 sm:h-20';
      break;
    case 'invoice':
      logoSrc = BRAND_ASSETS.logoInvoice || BRAND_ASSETS.logoPng;
      defaultHeight = 'h-12 sm:h-14';
      break;
    case 'icon':
      logoSrc = BRAND_ASSETS.logoCompact || BRAND_ASSETS.logoPng;
      defaultHeight = 'h-9 sm:h-10 w-auto';
      break;
    case 'badge':
      logoSrc = BRAND_ASSETS.logoBadge || BRAND_ASSETS.logoPng;
      defaultHeight = 'h-20 sm:h-24';
      break;
    case 'header':
    default:
      logoSrc = BRAND_ASSETS.logoPng || BRAND_ASSETS.logo;
      defaultHeight = 'h-12 sm:h-14 lg:h-16';
      break;
  }

  // Size overrides
  if (size === 'sm') {
    defaultHeight = 'h-10 sm:h-11';
  } else if (size === 'lg') {
    defaultHeight = 'h-16 sm:h-20 lg:h-24';
  }

  return (
    <div 
      onClick={onClick}
      className={`inline-flex items-center select-none flex-shrink-0 ${onClick ? 'cursor-pointer group' : ''} ${className}`}
      title="SUPER MASHALA & DRY FRUITS — Authentic Wholesale Spices"
    >
      <img
        src={logoSrc}
        alt="SUPER MASHALA & DRY FRUITS"
        className={`${defaultHeight} w-auto object-contain transition-transform duration-200 filter drop-shadow-[0_1px_3px_rgba(53,27,20,0.16)] ${onClick ? 'group-hover:scale-105' : ''}`}
        loading="eager"
        decoding="async"
      />
    </div>
  );
};

export default BrandLogo;
