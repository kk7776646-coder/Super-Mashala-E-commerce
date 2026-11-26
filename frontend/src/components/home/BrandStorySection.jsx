import React from 'react';
import { Store, RefreshCw, IndianRupee, Truck, ShieldCheck, HeartHandshake } from 'lucide-react';
import { BRAND_ASSETS } from '../../constants/productImages';

export const BrandStorySection = ({ onShopNow }) => {
  return (
    <section id="story-section" className="py-20 bg-brand-cream overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Story Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: Authentic Visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-premium border-2 border-brand-gold/30">
              <img
                src={BRAND_ASSETS.aboutStory}
                alt="Super Mashala Packaging and Quality Process"
                className="w-full h-full object-cover aspect-[4/5]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-secondary/80 via-transparent to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 text-brand-cream">
                <span className="text-xs uppercase font-bold tracking-widest text-brand-gold block mb-1">
                  Local Packaging Craft
                </span>
                <p className="font-serif text-lg font-bold">
                  “From whole raw harvest to sealed shelf-ready packets.”
                </p>
                <p className="text-xs text-brand-cream/70 mt-1">
                  Hand-inspected, cleaned and freshly ground for regional shops.
                </p>
              </div>
            </div>

            {/* Decorative offset card */}
            <div className="absolute -bottom-6 -right-6 hidden sm:block bg-brand-card p-4 rounded-2xl border border-brand-gold/50 shadow-premium max-w-[200px]">
              <p className="font-serif text-2xl font-bold text-brand-primary">100%</p>
              <p className="text-xs font-semibold text-brand-secondary">Authentic Ingredients</p>
              <p className="text-[10px] text-brand-muted">No added starch or synthetic color</p>
            </div>
          </div>

          {/* Right: Authentic Narrative */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-gold">
                <HeartHandshake className="w-4 h-4 text-brand-gold" />
                <span>Our Roots &amp; Commitment</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-primary leading-tight">
                Authentic Spices, Personally Prepared for Local Retailers.
              </h2>
            </div>

            <p className="text-sm sm:text-base text-brand-text/90 leading-relaxed font-normal">
              <strong>SUPER MASHALA &amp; DRY FRUITS</strong> was born out of a genuine dedication to quality and craftsmanship. Rather than relying on industrial middlemen, I personally select, clean, roast, grind and package spices and dry fruits.
            </p>

            <p className="text-sm sm:text-base text-brand-text/90 leading-relaxed font-normal">
              For years, local retail shopkeepers have trusted our aroma, vibrant color and consistent freshness. With this digital platform, shopkeepers can easily browse fixed wholesale prices, select custom packet sizes (100g, 250g, 500g, 1kg), and place wholesale restock orders in seconds with direct local supply.
            </p>

            {/* Business Principles (Honest & Transparent) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-brand-card p-3.5 rounded-xl border border-brand-border flex items-start gap-3">
                <Store className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-brand-secondary">Built for Retail Shops</h4>
                  <p className="text-[11px] text-brand-muted">Standardized packet weights that sell fast on your grocery counter.</p>
                </div>
              </div>

              <div className="bg-brand-card p-3.5 rounded-xl border border-brand-border flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-brand-secondary">Zero Compromise on Purity</h4>
                  <p className="text-[11px] text-brand-muted">Pure Salem turmeric, authentic Byadgi chillies &amp; clean dry fruits.</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onShopNow}
                className="px-6 py-3 bg-brand-primary hover:bg-brand-primary-light text-brand-cream text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm"
              >
                Order For Your Store Today
              </button>
            </div>

          </div>

        </div>

        {/* 3.H Customer Benefits Section */}
        <div className="pt-10 border-t border-brand-border/60">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-gold mb-1">
              Shopkeeper Convenience
            </p>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-brand-secondary">
              Direct Benefits for Your Retail Business
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-brand-card p-6 rounded-2xl border border-brand-border/80 shadow-xs hover:border-brand-gold transition-colors">
              <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-4">
                <Store className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-base font-bold text-brand-secondary mb-1.5">
                Easy Online Ordering
              </h4>
              <p className="text-xs text-brand-muted leading-relaxed">
                Order anytime from your smartphone without waiting for sales agents to physically visit.
              </p>
            </div>

            <div className="bg-brand-card p-6 rounded-2xl border border-brand-border/80 shadow-xs hover:border-brand-gold transition-colors">
              <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-4">
                <RefreshCw className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-base font-bold text-brand-secondary mb-1.5">
                1-Click Repeat Orders
              </h4>
              <p className="text-xs text-brand-muted leading-relaxed">
                Reorder your weekly turmeric, chilli and almond supplies with a single click from order history.
              </p>
            </div>

            <div className="bg-brand-card p-6 rounded-2xl border border-brand-border/80 shadow-xs hover:border-brand-gold transition-colors">
              <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-4">
                <IndianRupee className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-base font-bold text-brand-secondary mb-1.5">
                Transparent Fixed Pricing
              </h4>
              <p className="text-xs text-brand-muted leading-relaxed">
                No hidden charges or price fluctuations. Clean, fixed wholesale rates with Cash and UPI.
              </p>
            </div>

            <div className="bg-brand-card p-6 rounded-2xl border border-brand-border/80 shadow-xs hover:border-brand-gold transition-colors">
              <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-4">
                <Truck className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-base font-bold text-brand-secondary mb-1.5">
                Direct Local Supply
              </h4>
              <p className="text-xs text-brand-muted leading-relaxed">
                Delivered personally by the business owner directly to your retail counter in Ulhasnagar, Thane, Mumbai &amp; surrounding areas.
              </p>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
