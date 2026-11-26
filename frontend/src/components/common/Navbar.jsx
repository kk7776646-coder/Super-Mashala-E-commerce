import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  User, 
  Menu, 
  X, 
  Clock, 
  Store
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { BrandLogo } from './BrandLogo';

export const Navbar = ({ 
  onNavigate, 
  activeSection, 
  onOpenAuth, 
  onOpenOrders, 
  onSearchChange,
  searchQuery 
}) => {
  const { totalItems, setIsCartOpen } = useCart();
  const { user } = useAuth();
  const { orders } = useOrders();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);

  // Orders count for currently logged-in customer
  const customerOrdersCount = user
    ? orders.filter(o => o.customerId === user.id).length
    : 0;

  const handleNavClick = (sectionId) => {
    setMobileMenuOpen(false);
    onNavigate(sectionId);
  };

  return (
    <header className="sticky top-0 z-40 bg-brand-cream/98 backdrop-blur-md border-b border-brand-border/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 lg:h-22 gap-2 sm:gap-4 py-1.5">
          
          {/* Left: Professional Brand Logo */}
          <BrandLogo 
            variant="header" 
            onClick={() => handleNavClick('home')} 
          />

          {/* Center: Desktop Navigation Links (STRICTLY SINGLE HORIZONTAL LINE - ZERO WRAPPING) */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8 whitespace-nowrap flex-shrink-0">
            <button
              onClick={() => handleNavClick('home')}
              className={`text-sm font-semibold tracking-wide transition-colors relative py-1 whitespace-nowrap ${
                activeSection === 'home' 
                  ? 'text-brand-primary font-bold border-b-2 border-brand-gold' 
                  : 'text-brand-text hover:text-brand-primary'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('products')}
              className={`text-sm font-semibold tracking-wide transition-colors relative py-1 whitespace-nowrap ${
                activeSection === 'products' 
                  ? 'text-brand-primary font-bold border-b-2 border-brand-gold' 
                  : 'text-brand-text hover:text-brand-primary'
              }`}
            >
              All Products
            </button>
            <button
              onClick={() => handleNavClick('masala')}
              className={`text-sm font-semibold tracking-wide transition-colors relative py-1 whitespace-nowrap ${
                activeSection === 'masala' 
                  ? 'text-brand-primary font-bold border-b-2 border-brand-gold' 
                  : 'text-brand-text hover:text-brand-primary'
              }`}
            >
              Masala
            </button>
            <button
              onClick={() => handleNavClick('dry-fruits')}
              className={`text-sm font-semibold tracking-wide transition-colors relative py-1 whitespace-nowrap ${
                activeSection === 'dry-fruits' 
                  ? 'text-brand-primary font-bold border-b-2 border-brand-gold' 
                  : 'text-brand-text hover:text-brand-primary'
              }`}
            >
              Dry Fruits
            </button>
            <button
              onClick={() => handleNavClick('story')}
              className={`text-sm font-semibold tracking-wide transition-colors relative py-1 whitespace-nowrap ${
                activeSection === 'story' 
                  ? 'text-brand-primary font-bold border-b-2 border-brand-gold' 
                  : 'text-brand-text hover:text-brand-primary'
              }`}
            >
              About Us
            </button>
            <button
              onClick={() => handleNavClick('contact')}
              className={`text-sm font-semibold tracking-wide transition-colors relative py-1 whitespace-nowrap ${
                activeSection === 'contact' 
                  ? 'text-brand-primary font-bold border-b-2 border-brand-gold' 
                  : 'text-brand-text hover:text-brand-primary'
              }`}
            >
              Contact
            </button>
          </nav>

          {/* Right: Customer Actions (Search, Orders, Account, Cart) */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 flex-shrink-0">
            
            {/* Search Input / Icon */}
            <div className="relative">
              {showSearchInput ? (
                <div className="flex items-center bg-brand-card border border-brand-border rounded-full px-3 py-1.5 shadow-inner">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search turmeric, almonds..."
                    className="w-32 sm:w-44 bg-transparent text-xs text-brand-text outline-none"
                    autoFocus
                  />
                  <button 
                    onClick={() => { setShowSearchInput(false); onSearchChange(''); }}
                    className="text-brand-muted hover:text-brand-text ml-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSearchInput(true)}
                  aria-label="Search spices"
                  className="p-2 text-brand-text hover:text-brand-primary hover:bg-brand-surface rounded-full transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Customer Orders History Button */}
            {user && (
              <button
                onClick={onOpenOrders}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-brand-surface hover:bg-brand-border/60 text-brand-secondary transition-colors"
                title="View previous orders and reorder"
              >
                <Clock className="w-4 h-4 text-brand-gold-dark" />
                <span>My Orders</span>
                {customerOrdersCount > 0 && (
                  <span className="bg-brand-primary text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                    {customerOrdersCount}
                  </span>
                )}
              </button>
            )}

            {/* Shopkeeper Account Button */}
            <div className="relative">
              {user ? (
                <button
                  onClick={onOpenAuth}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-brand-card border border-brand-border hover:border-brand-gold transition-colors text-left"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-primary text-brand-cream flex items-center justify-center font-bold text-xs">
                    {user.shopName ? user.shopName.charAt(0) : (user.fullName ? user.fullName.charAt(0) : 'S')}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-xs font-bold text-brand-text leading-tight truncate max-w-[120px]">
                      {user.shopName || user.fullName}
                    </p>
                    <p className="text-[10px] text-brand-muted font-medium">
                      Retail Account
                    </p>
                  </div>
                </button>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="flex items-center gap-1.5 p-2 sm:px-3.5 sm:py-2 text-xs font-bold rounded-full border border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white transition-colors"
                  title="Shopkeeper Login"
                  aria-label="Shopkeeper Login"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Shop Login</span>
                </button>
              )}
            </div>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center justify-center p-2.5 bg-brand-primary text-brand-cream rounded-full hover:bg-brand-primary-light shadow-md transition-all group"
              aria-label="Open Cart"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-105 transition-transform" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-gold text-brand-secondary font-black text-xs w-5 h-5 rounded-full flex items-center justify-center shadow">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-brand-text hover:text-brand-primary rounded-lg"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-brand-border bg-brand-card px-4 pt-3 pb-6 space-y-3 animate-fadeIn">
          <div className="pb-2 border-b border-brand-border/40 flex items-center justify-between">
            <BrandLogo variant="header" size="sm" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-gold bg-brand-primary/5 px-2 py-0.5 rounded">
              Wholesale Store
            </span>
          </div>
          <div className="flex flex-col space-y-1">
            <button
              onClick={() => handleNavClick('home')}
              className={`text-left py-2.5 px-3 rounded-lg text-sm font-semibold transition-colors ${
                activeSection === 'home'
                  ? 'bg-brand-surface text-brand-primary font-bold'
                  : 'text-brand-text hover:bg-brand-surface'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('products')}
              className={`text-left py-2.5 px-3 rounded-lg text-sm font-semibold transition-colors ${
                activeSection === 'products'
                  ? 'bg-brand-surface text-brand-primary font-bold'
                  : 'text-brand-text hover:bg-brand-surface'
              }`}
            >
              All Products
            </button>
            <button
              onClick={() => handleNavClick('masala')}
              className={`text-left py-2.5 px-3 rounded-lg text-sm font-semibold transition-colors ${
                activeSection === 'masala'
                  ? 'bg-brand-surface text-brand-primary font-bold'
                  : 'text-brand-text hover:bg-brand-surface'
              }`}
            >
              Masala Spices
            </button>
            <button
              onClick={() => handleNavClick('dry-fruits')}
              className={`text-left py-2.5 px-3 rounded-lg text-sm font-semibold transition-colors ${
                activeSection === 'dry-fruits'
                  ? 'bg-brand-surface text-brand-primary font-bold'
                  : 'text-brand-text hover:bg-brand-surface'
              }`}
            >
              Dry Fruits
            </button>
            <button
              onClick={() => handleNavClick('story')}
              className={`text-left py-2.5 px-3 rounded-lg text-sm font-semibold transition-colors ${
                activeSection === 'story'
                  ? 'bg-brand-surface text-brand-primary font-bold'
                  : 'text-brand-text hover:bg-brand-surface'
              }`}
            >
              About Us
            </button>
            <button
              onClick={() => handleNavClick('contact')}
              className={`text-left py-2.5 px-3 rounded-lg text-sm font-semibold transition-colors ${
                activeSection === 'contact'
                  ? 'bg-brand-surface text-brand-primary font-bold'
                  : 'text-brand-text hover:bg-brand-surface'
              }`}
            >
              Contact &amp; Delivery
            </button>
          </div>

          <div className="pt-3 border-t border-brand-border/60 flex flex-col gap-2">
            {user && (
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenOrders(); }}
                className="flex items-center justify-between py-2.5 px-3 bg-brand-surface rounded-lg text-xs font-semibold text-brand-secondary"
              >
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-gold-dark" />
                  My Previous Orders
                </span>
                <span className="bg-brand-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {customerOrdersCount}
                </span>
              </button>
            )}

            <button
              onClick={() => { setMobileMenuOpen(false); onOpenAuth(); }}
              className="flex items-center gap-2 py-2.5 px-3 bg-brand-cream rounded-lg text-xs font-bold text-brand-text border border-brand-border"
            >
              <Store className="w-4 h-4 text-brand-gold" />
              <span>{user ? `Shop: ${user.shopName || user.fullName}` : 'Shopkeeper Login / Register'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
