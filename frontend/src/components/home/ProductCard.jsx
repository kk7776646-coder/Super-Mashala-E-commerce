import React, { useState } from 'react';
import { ShoppingBag, Plus, Minus, Check, Info, PackageCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const ProductCard = ({ product, onQuickView, onBuyNow }) => {
  const { addToCart } = useCart();
  
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const price = Number(product.packetPrice ?? product.price ?? 0);
  const stock = Number(product.stock ?? product.stock_quantity ?? 100);
  const pieces = product.piecesPerPacket;
  const isOutOfStock = stock <= 0;

  const handleIncrement = () => {
    if (quantity < stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    setIsAdding(true);
    addToCart(product, quantity);
    setTimeout(() => {
      setIsAdding(false);
    }, 700);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    if (onBuyNow) {
      onBuyNow(product, quantity);
    }
  };

  const lineTotal = quantity * price;

  return (
    <div className="group bg-brand-card rounded-2xl border border-brand-border/80 p-4 sm:p-5 flex flex-col justify-between hover:shadow-card-hover hover:border-brand-primary/50 transition-all duration-300 relative select-none">
      
      {/* Top Category / Tag Line */}
      <div className="flex items-center justify-between w-full mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-brand-gold bg-brand-gold/10 px-2.5 py-0.5 rounded-md">
          {product.categoryName || 'Spices'}
        </span>

        {onQuickView && (
          <button
            onClick={() => onQuickView(product)}
            className="text-brand-muted hover:text-brand-primary p-1 rounded-full hover:bg-brand-surface transition-colors"
            title="View Details"
          >
            <Info className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Product Image - Actual Raw Spice (No Packets) */}
      <div 
        onClick={() => onQuickView && onQuickView(product)}
        className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#FAF5EB] p-2.5 cursor-pointer mb-3.5 flex items-center justify-center border border-brand-border/50"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-contain rounded-lg group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/assets/icons/spice-icon.svg";
          }}
        />
        
        {isOutOfStock && (
          <div className="absolute inset-0 bg-brand-secondary/75 backdrop-blur-xs flex items-center justify-center p-2 rounded-lg">
            <span className="bg-red-600 text-white font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Information - Ultra Readable Sans-Serif Typography */}
      <div className="space-y-3 flex-1 flex flex-col justify-between">
        
        {/* Name & Short Description */}
        <div>
          <h3 
            onClick={() => onQuickView && onQuickView(product)}
            className="font-sans text-base sm:text-lg font-bold text-gray-900 leading-snug group-hover:text-brand-primary transition-colors cursor-pointer"
          >
            {product.name}
          </h3>

          <p className="text-xs text-gray-600 line-clamp-1 mt-0.5">
            {product.shortDescription || 'Wholesale packet for retail store distribution.'}
          </p>
        </div>

        {/* Packet Configuration - ONLY when confirmed! */}
        <div className="flex items-center justify-between text-xs min-h-[26px]">
          {pieces ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 font-bold text-[11px] border border-amber-200">
              <PackageCheck className="w-3.5 h-3.5 text-amber-700" />
              <span>{pieces} Pieces / Packet</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 font-medium text-[11px] border border-stone-200">
              <span>Standard Packet</span>
            </span>
          )}

          {/* Stock Availability */}
          <div className="text-right">
            {isOutOfStock ? (
              <span className="text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded">
                Out of Stock
              </span>
            ) : stock <= 15 ? (
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                Only {stock} pkts left
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded">
                Stock: {stock} pkts
              </span>
            )}
          </div>
        </div>

        {/* Big Bold Fixed Wholesale Packet Price */}
        <div className="pt-2 border-t border-brand-border/70 flex items-baseline justify-between">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 block">
              Wholesale Rate
            </span>
            <div className="flex items-baseline gap-1">
              <span className="price-tag font-sans font-bold text-2xl text-brand-primary tracking-normal tabular-nums">
                ₹{price.toFixed(2)}
              </span>
              <span className="text-xs font-semibold text-gray-600">
                / Packet
              </span>
            </div>
          </div>

          {quantity > 1 && (
            <div className="text-right">
              <span className="text-[10px] text-gray-500 block">Order Subtotal</span>
              <span className="price-tag font-sans font-semibold text-xs text-brand-secondary tabular-nums">
                {quantity} × ₹{price} = ₹{lineTotal.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Quantity Controls & Add to Cart / Buy Now */}
        <div className="pt-1 space-y-2">
          <div className="flex items-center gap-1.5">
            
            {/* Stepper [ - ] 1 [ + ] */}
            <div className="flex items-center border border-gray-300 rounded-xl bg-white overflow-hidden shadow-xs">
              <button
                onClick={handleDecrement}
                disabled={quantity <= 1 || isOutOfStock}
                className="px-2 py-2 hover:bg-gray-100 text-gray-800 disabled:opacity-40 transition-colors cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center text-xs font-bold font-mono text-gray-900">
                {quantity}
              </span>
              <button
                onClick={handleIncrement}
                disabled={isOutOfStock || quantity >= stock}
                className="px-2 py-2 hover:bg-gray-100 text-gray-800 disabled:opacity-40 transition-colors cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* ADD TO CART Button */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`py-2 px-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer ${
                isOutOfStock
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : isAdding
                  ? 'bg-brand-success text-white'
                  : 'bg-white hover:bg-brand-cream text-brand-secondary border border-brand-border/80'
              }`}
              title="Add to wholesale cart"
            >
              {isAdding ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5 text-brand-gold-dark" />
                  <span>Cart</span>
                </>
              )}
            </button>

            {/* BUY NOW Button */}
            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className={`flex-1 py-2 px-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all shadow-sm cursor-pointer ${
                isOutOfStock
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-brand-primary text-white hover:bg-brand-primary-light active:scale-95'
              }`}
            >
              <span>Buy Now</span>
            </button>

          </div>
        </div>

      </div>

    </div>
  );
};
