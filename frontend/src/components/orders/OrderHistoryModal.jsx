import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  Package, 
  Repeat, 
  Printer, 
  Calendar,
  Receipt,
  Download,
  Copy,
  ShoppingBag
} from 'lucide-react';
import { useOrders } from '../../context/OrderContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { OrderInvoiceModal } from './OrderInvoiceModal';

export const OrderHistoryModal = ({ isOpen, onClose, onBrowseProducts }) => {
  const { orders } = useOrders();
  const { addToCart, setIsCartOpen } = useCart();
  const { user } = useAuth();

  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  if (!isOpen) return null;

  // Filter orders for the logged in shopkeeper (or show all if admin)
  const customerOrders = user
    ? orders.filter(o => o.customerId === user.id || o.contactNumber === user.mobileNumber)
    : orders;

  const statusSteps = ['Order Placed', 'Confirmed', 'Packing', 'Out for Delivery', 'Delivered'];

  const getStatusIndex = (currentStatus) => {
    return statusSteps.indexOf(currentStatus);
  };

  const handle1ClickReorder = (order) => {
    order.items.forEach(item => {
      addToCart(
        { id: item.productId, name: item.name, image: item.image, categoryName: 'Reordered' },
        { id: item.variantId, packetWeight: item.packetWeight, price: item.price, stock: 50 },
        item.quantity
      );
    });
    onClose();
    setIsCartOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-brand-secondary/65 backdrop-blur-xs transition-opacity" 
      />

      <div className="relative bg-brand-card w-full max-w-3xl rounded-2xl shadow-2xl border border-brand-border overflow-hidden z-10 my-8">
        
        {/* Header */}
        <div className="bg-brand-secondary text-brand-cream p-5 sm:p-6 relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-brand-gold text-xs font-bold uppercase tracking-wider mb-1">
              <Clock className="w-4 h-4" />
              <span>Store Ledger</span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-brand-cream">
              My Wholesale Orders
            </h3>
            <p className="text-xs text-brand-cream/80 mt-0.5">
              {user ? `Store: ${user.shopName || user.fullName}` : 'Order Tracking & Wholesale Invoices'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-brand-cream/70 hover:text-brand-cream hover:bg-brand-cream/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Orders List Body with Proper Empty State */}
        <div className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto space-y-4">
          {customerOrders.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-brand-surface flex items-center justify-center text-brand-gold mx-auto">
                <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <h4 className="font-sans text-lg font-bold text-gray-900">
                  No Orders Yet
                </h4>
                <p className="text-xs text-gray-600 max-w-sm mx-auto leading-relaxed">
                  You haven't placed any wholesale spice orders yet. Add products to your cart and place an order to see your delivery progress and invoices here.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  if (onBrowseProducts) onBrowseProducts();
                }}
                className="px-6 py-2.5 bg-brand-primary text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-brand-primary-light transition-all shadow-sm"
              >
                Browse Wholesale Products
              </button>
            </div>
          ) : (
            customerOrders.map((order) => {
              const currentStepIdx = getStatusIndex(order.status);
              const isDelivered = order.status === 'Delivered';
              const isCancelled = order.status === 'Cancelled';

              return (
                <div
                  key={order.id}
                  className="bg-brand-cream/40 rounded-xl border border-brand-border/80 p-4 sm:p-5 space-y-4 hover:border-brand-primary/50 transition-colors"
                >
                  {/* Top Row: ID, Date, Amount, Status Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-border/60 pb-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-brand-primary">
                          #{order.id}
                        </span>
                        <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-700">
                        Payment: <strong>{order.paymentMethod}</strong> ({order.paymentStatus})
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-auto">
                      <div className="text-right">
                        <span className="text-[10px] text-gray-500 block">Total Amount</span>
                        <span className="font-sans font-black text-base text-brand-primary">
                          ₹{order.totalAmount.toFixed(2)}
                        </span>
                      </div>

                      <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                        isDelivered 
                          ? 'bg-green-100 text-green-800' 
                          : isCancelled
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Status Progress Timeline */}
                  {!isCancelled && (
                    <div className="pt-1">
                      <div className="relative flex items-center justify-between">
                        {statusSteps.map((step, idx) => {
                          const isDone = idx <= currentStepIdx;
                          const isCurrent = idx === currentStepIdx;

                          return (
                            <div key={step} className="flex-1 flex flex-col items-center relative">
                              {/* Connector line */}
                              {idx < statusSteps.length - 1 && (
                                <div className={`absolute top-2.5 left-1/2 w-full h-0.5 z-0 ${
                                  idx < currentStepIdx ? 'bg-brand-primary' : 'bg-gray-200'
                                }`} />
                              )}
                              {/* Dot */}
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center z-10 text-[10px] font-bold ${
                                isDone 
                                  ? 'bg-brand-primary text-white shadow-xs' 
                                  : 'bg-gray-200 text-gray-500'
                              }`}>
                                {isDone ? '✓' : idx + 1}
                              </div>
                              <span className={`text-[10px] text-center mt-1 font-medium ${
                                isCurrent ? 'text-brand-primary font-bold' : 'text-gray-500'
                              }`}>
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Ordered Items List */}
                  <div className="bg-white p-3 rounded-lg border border-brand-border/60 divide-y divide-gray-100 text-xs">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="py-1.5 first:pt-0 last:pb-0 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
                          <span className="font-semibold text-gray-900">
                            {item.name}
                          </span>
                          <span className="text-brand-gold bg-brand-gold/10 px-1.5 rounded text-[10px] font-bold">
                            {item.packetWeight}
                          </span>
                        </div>
                        <span className="text-gray-600 font-mono">
                          {item.quantity} pkts × ₹{item.price} = <strong>₹{item.itemTotal}</strong>
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Actions: View Invoice & 1-Click Reorder */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <button
                      onClick={() => setSelectedInvoiceOrder(order)}
                      className="px-3.5 py-1.5 text-xs font-bold text-gray-800 bg-white hover:bg-gray-50 rounded-lg flex items-center gap-1.5 transition-colors border border-gray-300 shadow-xs"
                    >
                      <Receipt className="w-3.5 h-3.5 text-brand-primary" />
                      <span>View &amp; Print Invoice</span>
                    </button>

                    <button
                      onClick={() => handle1ClickReorder(order)}
                      className="px-4 py-2 text-xs font-bold text-white bg-brand-primary hover:bg-brand-primary-light rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      <Repeat className="w-3.5 h-3.5 text-brand-gold" />
                      <span>1-Click Reorder</span>
                    </button>
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Invoice modal child */}
      {selectedInvoiceOrder && (
        <OrderInvoiceModal
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}
    </div>
  );
};
