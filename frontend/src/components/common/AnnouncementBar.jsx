import React from 'react';
import { Phone, ShieldCheck, Sparkles, Truck } from 'lucide-react';

export const AnnouncementBar = () => {
  return (
    <div className="bg-brand-secondary text-brand-cream/90 text-xs py-2 px-4 border-b border-brand-gold/20 select-none">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        
        {/* Left: Wholesale highlights */}
        <div className="flex items-center gap-3 text-center sm:text-left">
          <span className="flex items-center gap-1.5 text-brand-gold font-bold">
            <Sparkles className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
            B2B Wholesale Ordering Platform
          </span>
          <span className="hidden md:inline text-brand-cream/30">|</span>
          <span className="hidden md:inline text-brand-cream/80 font-medium">
            Freshly Packed Spices &amp; Premium Dry Fruits for Retail Shops
          </span>
          <span className="hidden lg:inline text-brand-cream/30">|</span>
          <span className="hidden lg:flex items-center gap-1 text-brand-cream/90 font-medium">
            <Truck className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
            Direct Owner Delivery in Ulhasnagar, Thane, Mumbai &amp; Regional Markets
          </span>
        </div>

        {/* Right: Contact only - strictly zero admin clutter */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-brand-cream/70 text-[11px]">
            Fixed Rates • Cash &amp; UPI
          </span>
          <span className="hidden sm:inline text-brand-cream/30">•</span>
          <a 
            href="tel:9527898176" 
            className="flex items-center gap-1.5 text-brand-cream hover:text-brand-gold transition-colors font-bold tracking-wide"
          >
            <Phone className="w-3.5 h-3.5 text-brand-gold" />
            <span>Order Helpline: <strong>9527898176</strong></span>
          </a>
        </div>

      </div>
    </div>
  );
};
