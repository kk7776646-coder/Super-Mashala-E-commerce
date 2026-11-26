import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('sm_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('sm_cart', JSON.stringify(cart));
    } catch (err) {
      console.error("Cart save error:", err);
    }
  }, [cart]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  /**
   * Packet-based Add to Cart
   * Total = quantity × packetPrice (Strictly packets, never per-piece!)
   */
  const addToCart = (product, quantityOrVariant = 1, maybeQty = 1) => {
    let qty = 1;
    let packetPrice = Number(product.packetPrice ?? product.price ?? 0);
    let pieces = product.piecesPerPacket ?? null;
    let weight = product.packetWeight ?? null;
    let variantId = product.id;

    if (typeof quantityOrVariant === 'object' && quantityOrVariant !== null) {
      // Legacy variant compatibility
      variantId = quantityOrVariant.id || product.id;
      packetPrice = Number(quantityOrVariant.price || packetPrice);
      weight = quantityOrVariant.packetWeight || weight;
      qty = maybeQty;
    } else if (typeof quantityOrVariant === 'number') {
      qty = quantityOrVariant;
    }

    if (qty <= 0) return;
    const availableStock = Number(product.stock ?? product.stock_quantity ?? 100);

    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.productId === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = Math.min(availableStock, updated[existingIndex].quantity + qty);
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          itemTotal: newQty * packetPrice,
        };
        return updated;
      } else {
        const finalQty = Math.min(availableStock, qty);
        return [
          ...prev,
          {
            productId: product.id,
            variantId: variantId,
            name: product.name,
            image: product.image,
            categoryName: product.categoryName || 'Spices',
            packetPrice: packetPrice,
            price: packetPrice,
            piecesPerPacket: pieces,
            packetWeight: weight,
            packagingDisplay: pieces ? `${pieces} Pieces / Packet` : (weight || 'Standard Packet'),
            stock: availableStock,
            quantity: finalQty,
            itemTotal: finalQty * packetPrice,
          }
        ];
      }
    });

    showToast(`Added ${qty} × ${product.name} (₹${packetPrice}/packet) to cart`);
  };

  const updateQuantity = (identifier, delta) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.productId === identifier || item.variantId === identifier) {
          const maxStock = item.stock || 999;
          const newQty = Math.min(maxStock, item.quantity + delta);
          if (newQty <= 0) return null;
          return {
            ...item,
            quantity: newQty,
            itemTotal: newQty * item.price,
          };
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeFromCart = (identifier) => {
    setCart(prev => prev.filter(item => item.productId !== identifier && item.variantId !== identifier));
    showToast('Item removed from cart');
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.itemTotal, 0);
  // Free delivery for orders >= ₹1000, else ₹50 local store delivery
  const deliveryFee = subtotal >= 1000 || subtotal === 0 ? 0 : 50;
  const grandTotal = subtotal + deliveryFee;

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      isCartOpen,
      setIsCartOpen,
      toastMessage,
      showToast,
      totalItems,
      subtotal,
      deliveryFee,
      grandTotal,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
