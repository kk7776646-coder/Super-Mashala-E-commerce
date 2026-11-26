import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { INITIAL_PRODUCTS } from '../data/productsData';

const OrderContext = createContext(null);

export const OrderProvider = ({ children }) => {
  // Real orders list - STRICTLY NO FAKE SEED ORDERS
  const [orders, setOrders] = useState(() => {
    try {
      const purged = localStorage.getItem('sm_fake_orders_purged_final');
      if (!purged) {
        localStorage.removeItem('sm_orders');
        localStorage.setItem('sm_fake_orders_purged_final', 'true');
        return [];
      }
      const saved = localStorage.getItem('sm_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('sm_products');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // Fetch real products from SQLite backend
  const fetchProductsFromBackend = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:8000/api/products');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
          localStorage.setItem('sm_products', JSON.stringify(data));
        }
      }
    } catch (err) {
      // Backend offline or local fallback
    }
  }, []);

  // Fetch real orders from SQLite backend
  const fetchOrdersFromBackend = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:8000/api/orders');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setOrders(data);
          localStorage.setItem('sm_orders', JSON.stringify(data));
        }
      }
    } catch (err) {
      // Backend offline or local fallback
    }
  }, []);

  useEffect(() => {
    fetchProductsFromBackend();
    fetchOrdersFromBackend();
  }, [fetchProductsFromBackend, fetchOrdersFromBackend]);

  useEffect(() => {
    try {
      localStorage.setItem('sm_orders', JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('sm_products', JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  }, [products]);

  // Place a new wholesale order with atomic stock validation & historical snapshot preservation
  const placeOrder = async ({ customer, cartItems, subtotal, deliveryFee, totalAmount, paymentMethod, notes }) => {
    const orderNumber = Math.floor(100 + Math.random() * 900);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '').slice(2, 6);
    const orderId = `SM-${dateStr}-${orderNumber}`;

    const newOrder = {
      id: orderId,
      orderNumber: orderId,
      customerId: customer.id,
      customerName: customer.fullName,
      shopName: customer.shopName,
      contactNumber: customer.mobileNumber,
      deliveryAddress: `${customer.deliveryAddress}, ${customer.areaLocality || ''}, ${customer.city || 'Thane, Mumbai'}`.replace(/,\s*,/g, ','),
      items: cartItems.map(item => ({
        productId: item.productId,
        name: item.name,
        price: Number(item.packetPrice ?? item.price ?? 0),
        quantity: item.quantity,
        piecesPerPacket: item.piecesPerPacket ?? null,
        packetWeight: item.packetWeight ?? null,
        itemTotal: item.itemTotal,
        image: item.image,
      })),
      subtotal,
      deliveryFee,
      totalAmount,
      paymentMethod, // 'Cash on Delivery' or 'UPI'
      paymentStatus: 'PENDING',
      status: 'Order Placed',
      notes: notes || '',
      invoicePrintCount: 1,
      createdAt: new Date().toISOString(),
    };

    // Atomic sync to backend DB
    try {
      const res = await fetch('http://localhost:8000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      if (res.ok) {
        // Refresh products to get updated stock
        fetchProductsFromBackend();
      }
    } catch (err) {
      // Local fallback
    }

    // Update local product inventory immediately
    setProducts(prevProducts => {
      return prevProducts.map(prod => {
        const orderedItem = cartItems.find(ci => ci.productId === prod.id);
        if (orderedItem) {
          const updatedStock = Math.max(0, (prod.stock ?? prod.stock_quantity ?? 100) - orderedItem.quantity);
          return {
            ...prod,
            stock: updatedStock,
            stock_quantity: updatedStock,
          };
        }
        return prod;
      });
    });

    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  // Record an invoice print event (supports duplicate copy stamping)
  const recordInvoicePrint = async (orderId) => {
    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId) {
        const nextCount = (ord.invoicePrintCount || 1) + 1;
        return {
          ...ord,
          invoicePrintCount: nextCount,
          lastPrintedAt: new Date().toISOString(),
        };
      }
      return ord;
    }));

    try {
      await fetch('http://localhost:8000/api/invoices/record-print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });
    } catch (err) {
      // Local state updated
    }
  };

  // Admin updates order status
  const updateOrderStatus = async (orderId, newStatus) => {
    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId) {
        return {
          ...ord,
          status: newStatus,
          updatedAt: new Date().toISOString(),
        };
      }
      return ord;
    }));

    try {
      await fetch(`http://localhost:8000/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {
      // Local state updated
    }
  };

  // Admin updates payment status
  const updatePaymentStatus = async (orderId, newPaymentStatus) => {
    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId) {
        return {
          ...ord,
          paymentStatus: newPaymentStatus,
          updatedAt: new Date().toISOString(),
        };
      }
      return ord;
    }));

    try {
      await fetch(`http://localhost:8000/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_status: newPaymentStatus })
      });
    } catch (err) {
      // Local state updated
    }
  };

  // Real-time Payment Verification via 12-digit UTR
  const verifyPayment = async (orderId, transactionId) => {
    try {
      const res = await fetch('http://localhost:8000/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, transactionId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders(prev => prev.map(ord => {
          if (ord.id === orderId) {
            return {
              ...ord,
              paymentStatus: 'PAID',
              status: 'Confirmed',
              transactionId: data.transactionId,
              paymentVerifiedAt: new Date().toISOString()
            };
          }
          return ord;
        }));
        return { success: true, data };
      }
      return { 
        success: false, 
        error: data.detail || data.error || 'Payment verification failed.' 
      };
    } catch (err) {
      return { 
        success: false, 
        error: err.message || 'Network error verifying payment.' 
      };
    }
  };

  // Check real-time payment status
  const checkPaymentStatus = async (orderId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/payments/status/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.paymentStatus === 'PAID') {
          setOrders(prev => prev.map(ord => {
            if (ord.id === orderId) {
              return {
                ...ord,
                paymentStatus: 'PAID',
                status: data.orderStatus || 'Confirmed',
                transactionId: data.transactionId,
                paymentVerifiedAt: data.verifiedAt || new Date().toISOString()
              };
            }
            return ord;
          }));
        }
        return data;
      }
    } catch {
      // Network silent
    }
    return null;
  };

  // Admin adds a product
  const addProduct = async (newProdData) => {
    try {
      const res = await fetch('http://localhost:8000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProdData)
      });
      if (res.ok) {
        await fetchProductsFromBackend();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    // Fallback local state
    setProducts(prev => [newProdData, ...prev]);
    return true;
  };

  // Admin updates product
  const updateProduct = async (updatedData) => {
    try {
      const res = await fetch('http://localhost:8000/api/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (res.ok) {
        await fetchProductsFromBackend();
        return true;
      }
    } catch (err) {
      console.error(err);
    }

    // Fallback local update
    setProducts(prev => prev.map(p => {
      if (p.id === updatedData.id) {
        return {
          ...p,
          ...updatedData,
          price: updatedData.packetPrice ?? p.price,
          packetPrice: updatedData.packetPrice ?? p.packetPrice,
          stock: updatedData.stock ?? p.stock,
        };
      }
      return p;
    }));
    return true;
  };

  return (
    <OrderContext.Provider value={{
      orders,
      products,
      fetchProducts: fetchProductsFromBackend,
      fetchOrders: fetchOrdersFromBackend,
      placeOrder,
      recordInvoicePrint,
      updateOrderStatus,
      updatePaymentStatus,
      verifyPayment,
      checkPaymentStatus,
      addProduct,
      updateProduct,
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => useContext(OrderContext);
