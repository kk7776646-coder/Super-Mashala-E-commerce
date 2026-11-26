import React, { useState } from 'react';
import { X, ShoppingBag, Check, ShieldCheck, Sparkles, PackageCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const QuickViewModal = ({ product, onClose, onBuyNow }) => {
  if (!product) return null;

  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const price = Number(product.packetPrice ?? product.price ?? 0);
  const stock = Number(product.stock ?? product.stock_quantity ?? 100);
  const pieces = product.piecesPerPacket;
  const isOutOfStock = stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 700);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    onClose();
    if (onBuyNow) {
      onBuyNow(product, quantity);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-brand-secondary/70 backdrop-blur-xs transition-opacity" 
      />

      <div className="relative bg-brand-card w-full max-w-2xl rounded-2xl shadow-2xl border border-brand-border overflow-hidden z-10 my-8">
        
        {/* Header */}
        <div className="bg-brand-secondary text-brand-cream p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-gold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Product Specifications &amp; Packet Details</span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-brand-cream/70 hover:text-brand-cream hover:bg-brand-cream/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[75vh] overflow-y-auto">
          
          {/* Image */}
          <div className="space-y-3">
            <div className="aspect-square rounded-2xl overflow-hidden bg-[#FAF5EB] border border-brand-border/60 p-4 flex items-center justify-center">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/assets/icons/spice-icon.svg";
                }}
              />
            </div>
            
            <div className="p-3 bg-brand-cream rounded-xl border border-brand-border/60 text-[11px] text-brand-muted space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-brand-secondary">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-gold-dark" />
                <span>Super Mashala Purity Standard</span>
              </div>
              <p>Direct authentic supply to retail shop counters. 100% natural spices freshly packed.</p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold bg-brand-gold/10 px-2.5 py-0.5 rounded-full inline-block">
                {product.categoryName || 'Spices'}
              </span>

              <h3 className="font-serif text-2xl font-bold text-brand-secondary">
                {product.name}
              </h3>

              <p className="text-xs text-brand-text/90 leading-relaxed pt-1">
                {product.description || product.shortDescription || 'Wholesale spice packets for retail store counters.'}
              </p>
            </div>

            {/* Packet Specifications */}
            <div className="bg-brand-surface/60 p-4 rounded-xl border border-brand-border/60 space-y-2.5 text-xs">
              <div className="flex justify-between items-center border-b border-brand-border/40 pb-2">
                <span className="text-brand-muted">Selling Unit:</span>
                <span className="font-bold text-brand-secondary">Wholesale Packet</span>
              </div>

              {pieces && (
                <div className="flex justify-between items-center border-b border-brand-border/40 pb-2">
                  <span className="text-brand-muted">Packet Packaging:</span>
                  <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {pieces} Pieces / Packet
                  </span>
                </div>
              )}

              {product.packetWeight && (
                <div className="flex justify-between items-center border-b border-brand-border/40 pb-2">
                  <span className="text-brand-muted">Packet Weight:</span>
                  <span className="font-bold text-brand-secondary">{product.packetWeight}</span>
                </div>
              )}

              <div className="flex justify-between items-center border-b border-brand-border/40 pb-2">
                <span className="text-brand-muted">Available Stock:</span>
                <span className="font-bold font-mono text-brand-secondary">{stock} packets</span>
              </div>

              <div className="flex justify-between items-baseline pt-1">
                <span className="text-brand-muted font-semibold">Wholesale Rate:</span>
                <span className="price-tag font-sans font-bold text-2xl text-brand-primary tracking-normal tabular-nums">
                  ₹{price.toFixed(2)} <span className="text-xs font-normal text-gray-500">/ Packet</span>
                </span>
              </div>
            </div>

            {/* Add to Cart & Buy Now Footer */}
            <div className="pt-2 border-t border-brand-border flex items-center gap-2">
              <div className="flex items-center border border-brand-border rounded-xl bg-brand-surface p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="px-2.5 py-1 text-xs font-bold disabled:opacity-40 cursor-pointer"
                >
                  -
                </button>
                <span className="w-8 text-center text-xs font-mono font-bold">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                  disabled={quantity >= stock || isOutOfStock}
                  className="px-2.5 py-1 text-xs font-bold disabled:opacity-40 cursor-pointer"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="py-3 px-3.5 bg-white hover:bg-brand-cream text-brand-secondary border border-brand-border text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Added!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-brand-gold-dark" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="flex-1 py-3 bg-brand-primary hover:bg-brand-primary-light text-brand-cream text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <span>Buy Now (₹{(price * quantity).toFixed(2)})</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
