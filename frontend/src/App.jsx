import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OrderProvider } from './context/OrderContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { Toast } from './components/common/Toast';
import { WhatsAppButton } from './components/common/WhatsAppButton';
import { HeroSection } from './components/home/HeroSection';
import { CategorySection } from './components/home/CategorySection';
import { BestSellersSection } from './components/home/BestSellersSection';
import { FeatureRibbon } from './components/home/FeatureRibbon';
import { PackagingSampleSection } from './components/home/PackagingSampleSection';
import { BrandStorySection } from './components/home/BrandStorySection';
import { CartDrawer } from './components/cart/CartDrawer';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { AuthModal } from './components/auth/AuthModal';
import { AdminLoginModal } from './components/auth/AdminLoginModal';
import { OrderHistoryModal } from './components/orders/OrderHistoryModal';
import { QuickViewModal } from './components/home/QuickViewModal';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ChevronUp } from 'lucide-react';

function SuperMashalaApp() {
  const { adminUser } = useAuth();
  const [activeSection, setActiveSection] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const isAnyModalOpen = isAuthOpen || isAdminLoginOpen || isAdminDashboardOpen || isCheckoutOpen || isOrdersOpen || Boolean(quickViewProduct);

  // Lock body & document scroll when any full modal or admin dashboard is open
  useEffect(() => {
    if (isAnyModalOpen) {
      const scrollY = window.scrollY;
      const prevPosition = document.body.style.position;
      const prevTop = document.body.style.top;
      const prevWidth = document.body.style.width;
      const prevOverflow = document.body.style.overflow;
      const prevHtmlOverflow = document.documentElement.style.overflow;

      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      return () => {
        document.body.style.position = prevPosition;
        document.body.style.top = prevTop;
        document.body.style.width = prevWidth;
        document.body.style.overflow = prevOverflow;
        document.documentElement.style.overflow = prevHtmlOverflow;
        window.scrollTo(0, scrollY);
      };
    }
  }, [isAnyModalOpen]);

  // Scroll tracking & Scroll-Spy for active navigation button
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (isAnyModalOpen) return;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (isAnyModalOpen) {
            ticking = false;
            return;
          }
          const scrollY = window.scrollY;
          setShowBackToTop(scrollY > 400);

          const docHeight = document.documentElement.scrollHeight;
          const windowHeight = window.innerHeight;

          // Reached or near the bottom of the page -> Contact
          if (windowHeight + scrollY >= docHeight - 120) {
            setActiveSection('contact');
            ticking = false;
            return;
          }

          // Top of the page -> Home
          if (scrollY < 200) {
            setActiveSection('home');
            ticking = false;
            return;
          }

          // Check sections by position relative to header check-line
          const viewportCheckLine = 150; // Below header line

          const contactEl = document.getElementById('contact-section');
          const storyEl = document.getElementById('story-section');
          const productsEl = document.getElementById('products-section');

          if (contactEl && contactEl.getBoundingClientRect().top <= viewportCheckLine) {
            setActiveSection('contact');
          } else if (storyEl && storyEl.getBoundingClientRect().top <= viewportCheckLine) {
            setActiveSection('story');
          } else if (productsEl && productsEl.getBoundingClientRect().top <= viewportCheckLine) {
            if (selectedCategory === 'cat_masala_powder') {
              setActiveSection('masala');
            } else if (selectedCategory === 'cat_dry_fruits') {
              setActiveSection('dry-fruits');
            } else {
              setActiveSection('products');
            }
          } else {
            setActiveSection('home');
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [selectedCategory]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (sectionId) => {
    setActiveSection(sectionId);
    if (sectionId === 'home') {
      scrollToTop();
      setSelectedCategory(null);
    } else if (sectionId === 'products') {
      setSelectedCategory(null);
      const el = document.getElementById('products-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (sectionId === 'masala') {
      setSelectedCategory('cat_masala_powder');
      const el = document.getElementById('products-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (sectionId === 'dry-fruits') {
      setSelectedCategory('cat_dry_fruits');
      const el = document.getElementById('products-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (sectionId === 'story') {
      const el = document.getElementById('story-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (sectionId === 'contact') {
      const el = document.getElementById('contact-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    const el = document.getElementById('products-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-cream text-brand-text font-sans antialiased selection:bg-brand-gold/30">
      
      {/* Sticky Navbar (Single horizontal line for links, zero wrapping) */}
      <Navbar
        onNavigate={handleNavigate}
        activeSection={activeSection}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* 3. Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection
          onShopNow={() => handleNavigate('products')}
          onExploreProducts={() => handleNavigate('products')}
        />

        {/* Shop By Category Section */}
        <CategorySection
          onSelectCategory={handleCategorySelect}
          selectedCategory={selectedCategory}
        />

        {/* Best Selling Products Catalog */}
        <BestSellersSection
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onQuickView={(p) => setQuickViewProduct(p)}
        />

        {/* Why Choose Super Mashala Feature Ribbon */}
        <FeatureRibbon />

        {/* Dedicated "How Your Order Is Packed" Section */}
        <PackagingSampleSection
          onShopNow={() => handleNavigate('products')}
        />

        {/* Authentic Brand Story & Customer Benefits */}
        <BrandStorySection
          onShopNow={() => handleNavigate('products')}
        />
      </main>

      {/* 4. Footer with Discreet Admin Login Link */}
      <Footer
        onNavigate={handleNavigate}
        onOpenAdminLogin={() => {
          if (adminUser) {
            setIsAdminDashboardOpen(true);
          } else {
            setIsAdminLoginOpen(true);
          }
        }}
      />

      {/* 5. Modals & Drawers */}
      <CartDrawer
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderPlacedSuccess={() => setIsOrdersOpen(true)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* Separate Secure Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onAdminSuccess={() => {
          setIsAdminLoginOpen(false);
          setIsAdminDashboardOpen(true);
        }}
      />

      <OrderHistoryModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        onBrowseProducts={() => handleNavigate('products')}
      />

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      {/* Protected Admin Dashboard */}
      {isAdminDashboardOpen && adminUser && (
        <AdminDashboard
          onClose={() => setIsAdminDashboardOpen(false)}
        />
      )}

      {/* Official WhatsApp Floating Button in Bottom-Left Corner */}
      <WhatsAppButton />

      {/* Back to Top Button in Bottom-Right Corner (Only visible on main storefront when scrolled, never inside modals) */}
      {!isAnyModalOpen && showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-30 p-3 rounded-full bg-brand-primary text-brand-cream border border-brand-gold shadow-premium hover:bg-brand-primary-light transition-all hover:scale-110 active:scale-95"
          aria-label="Back to top"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}

      {/* Shopping Toast Notification */}
      <Toast />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <OrderProvider>
        <CartProvider>
          <SuperMashalaApp />
        </CartProvider>
      </OrderProvider>
    </AuthProvider>
  );
}
