import React from 'react';
import { Phone, Mail, MapPin, Sparkles, Shield, Heart, Lock } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

export const Footer = ({ onNavigate, onOpenAdminLogin }) => {
  return (
    <footer id="contact-section" className="bg-brand-secondary text-brand-cream border-t border-brand-gold/30 pt-16 pb-8 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          
          {/* Col 1 & 2: Brand Identity */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo variant="footer" size="lg" />

            <p className="text-xs sm:text-sm text-brand-cream/80 leading-relaxed max-w-sm font-normal">
              Direct B2B wholesale ordering platform for retail grocery shopkeepers. Hand-prepared, freshly stone-milled spices and premium dry fruits supplied personally to your shop counter.
            </p>

            <div className="flex items-center gap-2 pt-1 text-xs text-brand-gold font-medium">
              <Sparkles className="w-4 h-4 text-brand-gold" />
              <span>Strictly Cash &amp; UPI • Transparent Fixed Rates</span>
            </div>
          </div>

          {/* Col 3: Product Categories */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold text-brand-gold uppercase tracking-wider">
              Product Categories
            </h4>
            <ul className="space-y-2 text-xs text-brand-cream/80">
              <li>
                <button onClick={() => onNavigate('masala')} className="hover:text-brand-gold transition-colors">
                  Pure Masala Powder
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('products')} className="hover:text-brand-gold transition-colors">
                  Whole Spices (Khada Masala)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('masala')} className="hover:text-brand-gold transition-colors">
                  Royal Blended Masala
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('dry-fruits')} className="hover:text-brand-gold transition-colors">
                  Dry Fruits (Badam, Kaju, Pista)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('products')} className="hover:text-brand-gold transition-colors">
                  Specialty Pantry Selections
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Quick Navigation & Discreet Admin Access */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold text-brand-gold uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-brand-cream/80">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-brand-gold transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('products')} className="hover:text-brand-gold transition-colors">
                  All Wholesale Products
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('story')} className="hover:text-brand-gold transition-colors">
                  About Our Brand
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-brand-gold transition-colors">
                  Customer Support
                </button>
              </li>
              <li className="pt-2">
                {/* Discreet Admin Login Link strictly placed in footer for owner only */}
                <button 
                  onClick={onOpenAdminLogin} 
                  className="text-brand-cream/40 hover:text-brand-gold transition-colors flex items-center gap-1.5 text-[11px]"
                  title="Owner &amp; Admin Only"
                >
                  <Lock className="w-3 h-3 text-brand-gold/60" />
                  <span>Admin Login (Owner Only)</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: Wholesale Contact */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold text-brand-gold uppercase tracking-wider">
              Shopkeeper Helpdesk
            </h4>
            <ul className="space-y-2.5 text-xs text-brand-cream/80">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-gold flex-shrink-0" />
                <a href="tel:9527898176" className="hover:text-brand-gold transition-colors font-bold text-brand-cream">
                  +91 9527898176
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-gold flex-shrink-0 mt-0.5" />
                <span>
                  Wholesale Packaging Center,<br />
                  ulhasnager-05, Thane, Mumbai, Maharashtra, pin code 421005
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-gold flex-shrink-0" />
                <span>orders@supermashala.com</span>
              </li>
              <li className="pt-2 text-[11px] text-brand-cream/60">
                Operating Hours: 8:00 AM – 8:00 PM (Mon - Sat)
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-brand-border/20 flex flex-col sm:flex-row items-center justify-between text-xs text-brand-cream/60 gap-4">
          <p>© {new Date().getFullYear()} SUPER MASHALA &amp; DRY FRUITS. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <button 
              onClick={onOpenAdminLogin}
              className="text-[11px] text-brand-cream/30 hover:text-brand-cream/70 transition-colors"
            >
              Management Portal
            </button>
            <span>•</span>
            <p className="flex items-center gap-1">
              <span>Packed fresh with</span>
              <Heart className="w-3.5 h-3.5 text-brand-gold fill-brand-gold" />
              <span>in India</span>
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
};
