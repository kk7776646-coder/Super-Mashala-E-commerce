import React from 'react';
import { Package, CheckCircle2, ShieldCheck, Phone, Sparkles, Layers } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

/**
 * Super Mashala & Dry Fruits — "How Your Order Is Packed" Section
 * 
 * Demonstrates the authentic wholesale packet / hanging display card packaging:
 * - Simple real packaging appearance from actual photograph
 * - Official Super Mashala branding & helpline
 * - Zero imaginary luxury packaging or unsupported claims
 */
export const PackagingSampleSection = ({ onShopNow }) => {
  return (
    <section className="py-16 sm:py-20 bg-brand-surface/60 border-y border-brand-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-gold/15 text-brand-secondary text-xs font-bold uppercase tracking-wider mb-3">
            <Package className="w-3.5 h-3.5 text-brand-gold" />
            <span>Real Wholesale Packaging</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-secondary mb-3">
            How Your Order Is Packed
          </h2>

          <p className="text-sm sm:text-base text-brand-muted leading-relaxed font-normal">
            Your selected spices are carefully packed in individual packets before delivery.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center max-w-6xl mx-auto">
          
          {/* Left Column: Sample Packaging Photograph */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative group bg-white p-4 sm:p-5 rounded-3xl border-2 border-brand-border/80 shadow-premium w-full max-w-xl">
              
              {/* Badge Overlay */}
              <div className="absolute top-7 left-7 z-10 bg-brand-primary text-brand-cream text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow">
                Authentic Sample
              </div>

              {/* Real Packaging Photograph */}
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-stone-50 flex items-center justify-center p-2 border border-brand-border/40">
                <img
                  src="/assets/products/packaging/sample.png"
                  alt="Super Mashala Actual Product Packaging Sample"
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-102"
                />
              </div>

              {/* Caption */}
              <div className="pt-4 text-center">
                <span className="text-xs font-bold text-brand-secondary block">
                  Wholesale Retail Hanging Card &amp; Packet Range
                </span>
                <span className="text-[11px] text-brand-muted">
                  Authentic sealed pouches mounted on display cards for retail counters
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Packaging Details & Verification */}
          <div className="lg:col-span-6 space-y-6">
            
            <div className="space-y-2">
              <span className="text-xs font-bold text-brand-gold uppercase tracking-wider">
                Direct Packager Standard
              </span>
              <h3 className="font-serif text-2xl font-bold text-brand-secondary leading-snug">
                Clean, Counter-Ready Packaging for Retail Grocery Stores
              </h3>
              <p className="text-xs sm:text-sm text-brand-text/80 leading-relaxed">
                We personally prepare, weigh, and seal our products in transparent, food-grade pouches mounted on convenient hanging cards. Retail shopkeepers can hang them directly at counter displays for fast retail customer sales.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              
              <div className="bg-white p-4 rounded-xl border border-brand-border/70 shadow-xs space-y-1.5">
                <div className="flex items-center gap-2 text-brand-primary font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-brand-gold flex-shrink-0" />
                  <span>Transparent Visibility</span>
                </div>
                <p className="text-[11px] text-brand-muted leading-relaxed">
                  Clear pouches let you and your store customers inspect the natural texture, color, and aroma before purchase.
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-brand-border/70 shadow-xs space-y-1.5">
                <div className="flex items-center gap-2 text-brand-primary font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-brand-gold flex-shrink-0" />
                  <span>Hanging Card Header</span>
                </div>
                <p className="text-[11px] text-brand-muted leading-relaxed">
                  White cardboard top with punch slot designed to hang on standard retail store clips and wire racks.
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-brand-border/70 shadow-xs space-y-1.5">
                <div className="flex items-center gap-2 text-brand-primary font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-brand-gold flex-shrink-0" />
                  <span>Heat-Sealed Freshness</span>
                </div>
                <p className="text-[11px] text-brand-muted leading-relaxed">
                  Individually sealed portions protect against moisture, dust, and handling damage during market delivery.
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-brand-border/70 shadow-xs space-y-1.5">
                <div className="flex items-center gap-2 text-brand-primary font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-brand-gold flex-shrink-0" />
                  <span>Fixed Packet Rates</span>
                </div>
                <p className="text-[11px] text-brand-muted leading-relaxed">
                  Standard 10 or 12 pieces per wholesale packet sold at fixed wholesale rates with no hidden fees.
                </p>
              </div>

            </div>

            {/* Inquiry Helpline Callout */}
            <div className="bg-brand-primary/5 border border-brand-gold/30 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-primary text-brand-cream flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-brand-secondary">
                    Wholesale Packaging Helpline
                  </p>
                  <p className="text-[11px] text-brand-muted">
                    Call or WhatsApp for custom wholesale requirements: <strong>+91 9527898176</strong>
                  </p>
                </div>
              </div>

              {onShopNow && (
                <button
                  onClick={onShopNow}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand-primary text-brand-cream text-xs font-bold hover:bg-brand-primary-light transition-all shadow-xs flex-shrink-0"
                >
                  Browse Catalogue
                </button>
              )}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default PackagingSampleSection;
