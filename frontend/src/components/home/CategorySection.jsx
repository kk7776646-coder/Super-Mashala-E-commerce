import React from 'react';
import { CATEGORIES } from '../../data/categoriesData';
import { ChevronRight } from 'lucide-react';

export const CategorySection = ({ onSelectCategory, selectedCategory }) => {
  return (
    <section className="py-14 bg-brand-cream border-b border-brand-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-gold mb-1.5">
            Carefully Curated Wholesale Range
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-primary">
            Shop by Category
          </h2>
          <div className="w-16 h-0.5 bg-brand-gold mx-auto mt-3" />
        </div>

        {/* Category Circular Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 justify-items-center max-w-4xl mx-auto">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className="group flex flex-col items-center text-center focus:outline-none w-full max-w-[180px]"
              >
                {/* Circular image with gold frame */}
                <div className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1.5 transition-all duration-300 ${
                  isSelected
                    ? 'ring-4 ring-brand-primary scale-105 shadow-premium'
                    : 'ring-2 ring-brand-gold/60 group-hover:ring-brand-primary group-hover:scale-105 group-hover:shadow-card-hover'
                }`}>
                  <div className="w-full h-full rounded-full overflow-hidden bg-brand-surface relative">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-115"
                    />
                    <div className="absolute inset-0 bg-brand-secondary/10 group-hover:bg-transparent transition-colors" />
                  </div>
                  
                  {/* Active selection dot */}
                  {isSelected && (
                    <span className="absolute bottom-1 right-2 w-4 h-4 rounded-full bg-brand-primary border-2 border-brand-cream" />
                  )}
                </div>

                {/* Category Name & Count */}
                <div className="mt-3.5 space-y-0.5">
                  <h3 className={`text-sm sm:text-base font-serif font-bold transition-colors ${
                    isSelected ? 'text-brand-primary underline decoration-brand-gold decoration-2' : 'text-brand-text group-hover:text-brand-primary'
                  }`}>
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-brand-muted font-medium">
                    {cat.itemCount}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick Clear Filter if selected */}
        {selectedCategory && (
          <div className="mt-8 text-center">
            <button
              onClick={() => onSelectCategory(null)}
              className="text-xs font-semibold text-brand-primary hover:text-brand-gold transition-colors inline-flex items-center gap-1 bg-brand-card px-4 py-1.5 rounded-full border border-brand-border"
            >
              Showing filtered category. <u>Show All Categories</u>
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
