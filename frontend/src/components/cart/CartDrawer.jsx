import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const CartDrawer = ({ onProceedToCheckout }) => {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    subtotal, 
    deliveryFee, 
    grandTotal,
    totalItems 
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-brand-secondary/60 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-brand-card shadow-2xl flex flex-col justify-between border-l border-brand-border">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-brand-border bg-brand-cream/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-primary text-brand-cream flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-brand-secondary">
                  Wholesale Cart
                </h3>
                <p className="text-[11px] text-brand-muted">
                  {totalItems} item{totalItems === 1 ? '' : 's'} selected
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-full hover:bg-brand-surface text-brand-muted hover:text-brand-text transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-brand-surface flex items-center justify-center text-brand-gold">
                  <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif text-base font-bold text-brand-secondary">
                    Your wholesale cart is empty
                  </h4>
                  <p className="text-xs text-brand-muted max-w-xs">
                    Select your desired masala spice powders or dry fruits with packet sizes to start your order.
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2.5 bg-brand-primary text-brand-cream text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-brand-primary-light transition-all shadow-xs"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.variantId}
                    className="p-3 bg-brand-cream/50 rounded-xl border border-brand-border/70 flex items-center gap-3 relative group"
                  >
                    {/* Item Image */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 rounded-lg object-contain flex-shrink-0 bg-white p-1 border border-brand-border/40"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/assets/icons/spice-icon.svg";
                      }}
                    />

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-brand-secondary truncate">
                        {item.name}
                      </h5>
                      <div className="flex items-center gap-2 mt-0.5">
                        {item.piecesPerPacket ? (
                          <span className="text-[10px] font-bold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            {item.piecesPerPacket} Pcs/Pkt
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-brand-gold bg-brand-gold/10 px-1.5 py-0.5 rounded">
                            Packet
                          </span>
                        )}
                        <span className="text-[11px] text-brand-muted font-mono">
                          ₹{Number(item.price || 0).toFixed(2)} / pkt
                        </span>
                      </div>
                      
                      {/* Controls */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-brand-border rounded-md bg-white">
                          <button
                            onClick={() => updateQuantity(item.productId || item.variantId, -1)}
                            className="p-1 hover:bg-brand-surface text-brand-text transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-mono font-bold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId || item.variantId, 1)}
                            className="p-1 hover:bg-brand-surface text-brand-text transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="font-serif font-bold text-xs text-brand-primary">
                          ₹{Number(item.itemTotal || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removeFromCart(item.productId || item.variantId)}
                      className="p-1.5 text-brand-muted hover:text-red-600 transition-colors self-start"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                <div className="text-right pt-1">
                  <button
                    onClick={clearCart}
                    className="text-[11px] text-brand-muted hover:text-red-600 transition-colors"
                  >
                    Clear wholesale cart
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer & Checkout Summary */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-brand-border bg-brand-cream/80 space-y-3.5">
              
              {/* Delivery threshold notice */}
              <div className="bg-brand-surface p-2.5 rounded-lg border border-brand-border flex items-center gap-2 text-xs">
                <Truck className="w-4 h-4 text-brand-primary flex-shrink-0" />
                {subtotal >= 1000 ? (
                  <span className="text-brand-success font-semibold">
                    ✓ You qualify for Free Local Store Delivery!
                  </span>
                ) : (
                  <span className="text-brand-muted">
                    Add <strong>₹{(1000 - subtotal).toFixed(2)}</strong> more for <strong>Free Local Delivery</strong> (₹50 otherwise).
                  </span>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-brand-text">
                  <span>Subtotal</span>
                  <span className="price-tag font-sans font-semibold tabular-nums">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-brand-text">
                  <span>Delivery Fee</span>
                  <span className="price-tag font-sans font-semibold tabular-nums">
                    {deliveryFee === 0 ? <strong className="text-brand-success">FREE</strong> : `₹${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-brand-primary border-t border-brand-border/80 pt-2">
                  <span>Estimated Total</span>
                  <span className="price-tag font-sans text-xl font-bold tabular-nums text-brand-primary">
                    ₹{grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Checkout Action */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 bg-brand-primary hover:bg-brand-primary-light text-brand-cream text-xs font-bold uppercase tracking-wider rounded-xl shadow-premium border border-brand-gold/40 flex items-center justify-center gap-2 group transition-all"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-brand-gold" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-brand-muted">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-gold" />
                <span>Strictly Cash on Delivery &amp; UPI • Zero Udhaar</span>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
