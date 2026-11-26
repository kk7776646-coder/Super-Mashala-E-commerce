import React from 'react';
import { 
  Sparkles, 
  PackageCheck, 
  BadgePercent, 
  Truck, 
  ShieldCheck, 
  Scale 
} from 'lucide-react';

export const FeatureRibbon = () => {
  const features = [
    {
      icon: Sparkles,
      title: "Quality Products",
      desc: "Pure spices stone-ground with preserved natural essential oils."
    },
    {
      icon: PackageCheck,
      title: "Freshly Packed",
      desc: "Packed in small batches right before local delivery."
    },
    {
      icon: Scale,
      title: "Carefully Selected",
      desc: "Stemless chillies, Salem turmeric & bold almonds only."
    },
    {
      icon: Truck,
      title: "Reliable Local Delivery",
      desc: "Direct supply by business owner to your store shelf."
    },
    {
      icon: ShieldCheck,
      title: "Consistent Packaging",
      desc: "High barrier food-grade packets from 100g to 1kg."
    }
  ];

  return (
    <section className="py-14 bg-brand-surface border-y border-brand-border/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-gold mb-1">
            The Wholesale Advantage
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-secondary">
            Why Retailers Choose Super Mashala?
          </h2>
          <div className="w-12 h-0.5 bg-brand-gold mx-auto mt-2" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                className="bg-brand-card p-5 rounded-2xl border border-brand-border/80 shadow-xs hover:shadow-card-hover hover:border-brand-gold/60 transition-all duration-300 flex flex-col items-center text-center group"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-cream border border-brand-gold/40 flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-brand-cream transition-colors duration-300 mb-3.5 shadow-xs">
                  <Icon className="w-6 h-6 stroke-[1.8]" />
                </div>
                <h3 className="font-serif text-sm font-bold text-brand-secondary group-hover:text-brand-primary transition-colors mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-brand-muted leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
