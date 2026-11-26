import React, { useState, useMemo } from 'react';
import { ProductCard } from './ProductCard';
import { useOrders } from '../../context/OrderContext';
import { Sparkles, Phone, MessageCircle } from 'lucide-react';

export const BestSellersSection = ({ 
  selectedCategory, 
  onSelectCategory,
  searchQuery,
  onQuickView,
  onBuyNow
}) => {
  const { products } = useOrders();
  const [activeTab, setActiveTab] = useState('all');

  // Filter products based on search, category and tab
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Must be active
      if (product.isActive === false || product.is_active === 0) return false;

      // Search query filter
      if (searchQuery && searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = (product.name || '').toLowerCase().includes(q);
        const matchesCategory = (product.categoryName || '').toLowerCase().includes(q);
        const matchesDesc = (product.shortDescription || '').toLowerCase().includes(q);
        if (!matchesName && !matchesCategory && !matchesDesc) return false;
      }

      // Category filter (from Category section clicks or tab clicks)
      const currentCat = selectedCategory || (activeTab !== 'all' ? activeTab : null);
      if (currentCat && product.categoryId !== currentCat && product.category_id !== currentCat) {
        return false;
      }

      return true;
    });
  }, [products, selectedCategory, searchQuery, activeTab]);

  const isDryFruitsSelected = selectedCategory === 'cat_dry_fruits' || activeTab === 'cat_dry_fruits';

  const masalaCount = products.filter(p => p.categoryId === 'cat_masala_powder' || p.category_id === 'cat_masala_powder').length;
  const wholeCount = products.filter(p => p.categoryId === 'cat_whole_spices' || p.category_id === 'cat_whole_spices').length;
  const premiumCount = products.filter(p => p.categoryId === 'cat_premium_spices' || p.category_id === 'cat_premium_spices').length;

  return (
    <section id="products-section" className="py-16 bg-brand-cream/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-brand-border/80 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand-gold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Official Wholesale Packet Catalogue</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-primary">
              Wholesale Spices &amp; Dry Fruits
            </h2>
            <p className="text-xs text-brand-muted mt-1">
              Fixed packet rates for retail shopkeepers. Owner-managed local delivery.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => { setActiveTab('all'); onSelectCategory(null); }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === 'all' && !selectedCategory
                  ? 'bg-brand-primary text-brand-cream shadow-xs'
                  : 'bg-brand-card text-brand-text border border-brand-border hover:border-brand-gold'
              }`}
            >
              All Products ({products.length})
            </button>

            <button
              onClick={() => { setActiveTab('cat_masala_powder'); onSelectCategory('cat_masala_powder'); }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                (selectedCategory === 'cat_masala_powder' || activeTab === 'cat_masala_powder')
                  ? 'bg-brand-primary text-brand-cream shadow-xs'
                  : 'bg-brand-card text-brand-text border border-brand-border hover:border-brand-gold'
              }`}
            >
              Masala Powder ({masalaCount})
            </button>

            <button
              onClick={() => { setActiveTab('cat_whole_spices'); onSelectCategory('cat_whole_spices'); }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                (selectedCategory === 'cat_whole_spices' || activeTab === 'cat_whole_spices')
                  ? 'bg-brand-primary text-brand-cream shadow-xs'
                  : 'bg-brand-card text-brand-text border border-brand-border hover:border-brand-gold'
              }`}
            >
              Whole Spices ({wholeCount})
            </button>

            <button
              onClick={() => { setActiveTab('cat_premium_spices'); onSelectCategory('cat_premium_spices'); }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                (selectedCategory === 'cat_premium_spices' || activeTab === 'cat_premium_spices')
                  ? 'bg-brand-primary text-brand-cream shadow-xs'
                  : 'bg-brand-card text-brand-text border border-brand-border hover:border-brand-gold'
              }`}
            >
              Premium Spices ({premiumCount})
            </button>

            <button
              onClick={() => { setActiveTab('cat_dry_fruits'); onSelectCategory('cat_dry_fruits'); }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                (selectedCategory === 'cat_dry_fruits' || activeTab === 'cat_dry_fruits')
                  ? 'bg-brand-primary text-brand-cream shadow-xs'
                  : 'bg-brand-card text-brand-text border border-brand-border hover:border-brand-gold'
              }`}
            >
              Dry Fruits
            </button>
          </div>
        </div>

        {/* Search status notification */}
        {searchQuery && (
          <div className="mb-6 bg-brand-surface p-3 rounded-xl border border-brand-border text-xs flex items-center justify-between">
            <span>
              Searching for "<strong>{searchQuery}</strong>" — {filteredProducts.length} product(s) found.
            </span>
          </div>
        )}

        {/* Product Grid or Special Clean Empty State for Dry Fruits */}
        {isDryFruitsSelected ? (
          <div className="text-center py-16 bg-brand-card rounded-2xl border border-brand-border p-8 max-w-xl mx-auto space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-brand-gold/15 text-brand-gold-dark flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-2xl font-bold text-brand-secondary">
                Dry Fruits Wholesale Catalogue
              </h3>
              <p className="text-xs text-brand-muted leading-relaxed max-w-md mx-auto">
                Our dry fruits wholesale catalogue is currently being prepared with verified packet rates. No unconfirmed prices are displayed.
              </p>
            </div>
            <p className="text-xs font-semibold text-brand-secondary">
              For custom dry fruits wholesale inquiries, please call or WhatsApp the business owner directly:
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href="https://wa.me/919527898176?text=Hello%20Super%20Mashala%2C%20I%20want%20to%20inquire%20about%20wholesale%20dry%20fruits."
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-[#25D366] text-white text-xs font-bold rounded-xl flex items-center gap-2 hover:bg-[#20ba59] transition-all shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp 9527898176</span>
              </a>
              <a
                href="tel:9527898176"
                className="px-5 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-xl flex items-center gap-2 hover:bg-brand-primary-light transition-all shadow-sm"
              >
                <Phone className="w-4 h-4" />
                <span>Call 9527898176</span>
              </a>
            </div>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-7">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onQuickView={onQuickView} 
                onBuyNow={onBuyNow}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-brand-card rounded-2xl border border-dashed border-brand-border p-8">
            <p className="font-serif text-xl font-bold text-brand-secondary">No products matched your search.</p>
            <p className="text-xs text-brand-muted mt-1">Try searching for Rai, Garam Masala, Jira, Elaichi, or clear your filters.</p>
            <button
              onClick={() => { setActiveTab('all'); onSelectCategory(null); }}
              className="mt-4 px-4 py-2 bg-brand-primary text-brand-cream text-xs font-bold rounded-lg cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
