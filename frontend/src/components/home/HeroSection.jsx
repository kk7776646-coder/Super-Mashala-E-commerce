import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Truck, Award, Check } from 'lucide-react';
import { BRAND_ASSETS } from '../../constants/productImages';

export const HeroSection = ({ onShopNow, onExploreProducts }) => {
  return (
    <section id="home-section" className="relative bg-brand-secondary text-brand-cream overflow-hidden">
      {/* Background spice image with warm darkening vignette */}
      <div className="absolute inset-0 z-0">
        <img
          src={BRAND_ASSETS.heroBanner}
          alt="Authentic Indian Spices & Dry Fruits"
          className="w-full h-full object-cover object-center opacity-30 scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-secondary via-brand-secondary/90 to-brand-secondary/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-secondary via-transparent to-brand-secondary/40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headline & Value Proposition */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-gold/15 border border-brand-gold/40 text-brand-gold text-xs font-semibold tracking-wide backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
              <span>B2B Direct Wholesale Distribution for Retailers</span>
            </div>

            <div className="space-y-4">
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-brand-cream leading-[1.12]">
                Every Spice <br className="hidden sm:block" />
                <span className="italic font-normal text-brand-gold">
                  Has a Story.
                </span>
              </h1>
              
              <p className="text-base sm:text-lg text-brand-cream/80 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Carefully packed spices &amp; premium dry fruits for every store. We personally prepare, stone-mill and package pure Indian spices with fixed wholesale pricing for grocery retail shopkeepers.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onShopNow}
                className="w-full sm:w-auto px-8 py-4 bg-brand-primary hover:bg-brand-primary-light text-brand-cream text-sm font-bold tracking-wider uppercase rounded-xl shadow-premium border border-brand-gold/40 flex items-center justify-center gap-2 group transition-all"
              >
                <span>Shop Best Sellers</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-brand-gold" />
              </button>

              <button
                onClick={onExploreProducts}
                className="w-full sm:w-auto px-8 py-4 bg-brand-card/10 hover:bg-brand-card/20 text-brand-cream text-sm font-semibold tracking-wide rounded-xl border border-brand-cream/30 hover:border-brand-gold transition-all flex items-center justify-center"
              >
                <span>Explore Full Catalog</span>
              </button>
            </div>

            {/* Quick trust checklist */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-brand-cream/90 font-medium">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>Zero Udhaar / Fixed Rates</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>Direct Owner Delivery</span>
              </div>
              <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                <div className="w-4 h-4 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>100g to 1kg Packets</span>
              </div>
            </div>

          </div>

          {/* Right Column: Visual Product Showcase like Spice Story Hero */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-md">
              {/* Decorative gold backdrop glow */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-brand-gold/30 via-brand-primary/40 to-transparent blur-2xl opacity-60" />
              
              <div className="relative rounded-2xl bg-brand-secondary/80 border border-brand-gold/40 p-5 shadow-2xl backdrop-blur-md space-y-4">
                
                <div className="flex items-center border-b border-brand-border/20 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-gold animate-pulse" />
                    <span className="text-xs font-semibold text-brand-gold tracking-wide uppercase">
                      Featured Wholesale Lot
                    </span>
                  </div>
                </div>

                <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-brand-card">
                  <img
                    src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=85"
                    alt="Spices and Dry Fruits Assortment"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 right-2 bg-brand-secondary/90 backdrop-blur-md p-2.5 rounded-lg border border-brand-gold/30 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-brand-cream">Pure Salem Turmeric &amp; Shahi Blend</p>
                      <p className="text-[10px] text-brand-gold">Stone-Milled • Natural Essential Oils</p>
                    </div>
                    <span className="text-xs font-extrabold text-brand-gold font-mono">
                      From ₹26 / pkt
                    </span>
                  </div>
                </div>

                {/* 3 mini highlights */}
                <div className="grid grid-cols-3 gap-2 text-center text-[11px] pt-1">
                  <div className="bg-brand-card/5 p-2 rounded-lg border border-brand-border/10">
                    <p className="font-bold text-brand-gold">100%</p>
                    <p className="text-brand-cream/70 text-[10px]">Pure Ingredients</p>
                  </div>
                  <div className="bg-brand-card/5 p-2 rounded-lg border border-brand-border/10">
                    <p className="font-bold text-brand-gold">4 Sizes</p>
                    <p className="text-brand-cream/70 text-[10px]">100g to 1kg</p>
                  </div>
                  <div className="bg-brand-card/5 p-2 rounded-lg border border-brand-border/10">
                    <p className="font-bold text-brand-gold">Fast</p>
                    <p className="text-brand-cream/70 text-[10px]">Local Dispatch</p>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Trust Ribbon inspired by Spice Story */}
      <div className="relative z-10 border-t border-brand-border/15 bg-brand-secondary/95 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            
            <div className="flex items-center justify-center gap-2.5">
              <Award className="w-5 h-5 text-brand-gold flex-shrink-0" />
              <div className="text-left">
                <p className="text-xs font-bold text-brand-cream">Small Batch Quality</p>
                <p className="text-[10px] text-brand-cream/60">Crafted with care</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-brand-gold flex-shrink-0" />
              <div className="text-left">
                <p className="text-xs font-bold text-brand-cream">Pure &amp; No Additives</p>
                <p className="text-[10px] text-brand-cream/60">Zero artificial colors</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2.5">
              <Truck className="w-5 h-5 text-brand-gold flex-shrink-0" />
              <div className="text-left">
                <p className="text-xs font-bold text-brand-cream">Direct Local Supply</p>
                <p className="text-[10px] text-brand-cream/60">Owner delivery to store</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2.5">
              <Sparkles className="w-5 h-5 text-brand-gold flex-shrink-0" />
              <div className="text-left">
                <p className="text-xs font-bold text-brand-cream">Fixed Wholesale Rates</p>
                <p className="text-[10px] text-brand-cream/60">Transparent pricing</p>
              </div>
            </div>

          </div>
        </div>
      </div>

    </section>
  );
};
