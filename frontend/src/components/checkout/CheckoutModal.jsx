import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Store, 
  CreditCard, 
  QrCode, 
  Banknote, 
  CheckCircle2, 
  ShieldAlert, 
  ArrowRight,
  Package,
  Sparkles,
  FileText,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  Clock,
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { OrderInvoiceModal } from '../orders/OrderInvoiceModal';
import confetti from 'canvas-confetti';

export const CheckoutModal = ({ isOpen, onClose, onOrderPlacedSuccess, onOpenAuth }) => {
  const { cart, subtotal, deliveryFee, grandTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { placeOrder, verifyPayment, checkPaymentStatus } = useOrders();

  const [checkoutStep, setCheckoutStep] = useState('form'); // 'form' | 'upi_payment' | 'success'
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'Cash on Delivery' or 'UPI'
  const [notes, setNotes] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);

  // UPI verification states
  const [utrNumber, setUtrNumber] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('PENDING'); // PENDING, PROCESSING, PAID, FAILED
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  const [guestDetails, setGuestDetails] = useState({
    shopName: 'Ganesh Kirana Store',
    fullName: 'Ramesh Patil',
    mobileNumber: '',
    deliveryAddress: 'ulhasnager-05, Thane, Mumbai, PIN Code 421005'
  });

  const pollingRef = useRef(null);

  // Real-time status polling when on UPI screen
  useEffect(() => {
    if (checkoutStep === 'upi_payment' && activeOrder && paymentStatus !== 'PAID') {
      pollingRef.current = setInterval(async () => {
        if (checkPaymentStatus) {
          const res = await checkPaymentStatus(activeOrder.id);
          if (res && res.paymentStatus === 'PAID') {
            clearInterval(pollingRef.current);
            setPaymentStatus('PAID');
            const verifiedOrder = {
              ...activeOrder,
              paymentStatus: 'PAID',
              status: 'Confirmed',
              transactionId: res.transactionId || activeOrder.transactionId
            };
            setCompletedOrder(verifiedOrder);
            triggerConfetti();
            setTimeout(() => {
              setCheckoutStep('success');
            }, 1200);
          }
        }
      }, 2500);

      return () => {
        if (pollingRef.current) clearInterval(pollingRef.current);
      };
    }
  }, [checkoutStep, activeOrder, paymentStatus, checkPaymentStatus]);

  if (!isOpen) return null;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText('9527898176@okbizaxis');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleProceed = async () => {
    setVerifyError('');

    if (!user) {
      setVerifyError('Authentication required. Please log in before placing an order.');
      sessionStorage.setItem('pending_checkout', 'true');
      if (onOpenAuth) {
        onClose();
        onOpenAuth();
      }
      return;
    }

    setIsPlacing(true);

    const customerData = {
      id: user.id,
      shopName: user.shopName || 'Retail Kirana Store',
      fullName: user.fullName || 'Store Proprietor',
      mobileNumber: user.mobileNumber || '',
      deliveryAddress: user.deliveryAddress || 'ulhasnager-05, Thane, Mumbai, pin code 421005',
      areaLocality: user.areaLocality || 'Ulhasnagar-05',
      city: user.city || 'Thane, Mumbai',
      role: 'customer'
    };

    try {
      const order = await placeOrder({
        customer: customerData,
        cartItems: cart,
        subtotal,
        deliveryFee,
        totalAmount: grandTotal,
        paymentMethod,
        notes,
      });

      setIsPlacing(false);
      clearCart();

      if (paymentMethod === 'UPI') {
        setActiveOrder(order);
        setPaymentStatus('PENDING');
        setCheckoutStep('upi_payment');
      } else {
        // Cash on delivery
        setCompletedOrder(order);
        setCheckoutStep('success');
        triggerConfetti();
      }
    } catch (err) {
      console.error('Order placement error:', err);
      setIsPlacing(false);
      setVerifyError('Failed to initiate order. Please verify cart items and retry.');
    }
  };

  const handleVerifyUtr = async (e) => {
    e.preventDefault();
    if (!activeOrder) return;

    const cleanUtr = utrNumber.trim().replace(/[\s-]/g, '');
    if (!cleanUtr || cleanUtr.length !== 12 || !/^\d{12}$/.test(cleanUtr)) {
      setVerifyError('Please enter a valid 12-digit numeric Bank Reference / UTR Number.');
      return;
    }

    setIsVerifying(true);
    setVerifyError('');
    setPaymentStatus('PROCESSING');

    try {
      const result = await verifyPayment(activeOrder.id, cleanUtr);
      setIsVerifying(false);

      if (result.success) {
        setPaymentStatus('PAID');
        const updated = {
          ...activeOrder,
          paymentStatus: 'PAID',
          status: 'Confirmed',
          transactionId: cleanUtr
        };
        setActiveOrder(updated);
        setCompletedOrder(updated);
        triggerConfetti();

        // Transition to success screen
        setTimeout(() => {
          setCheckoutStep('success');
        }, 1200);
      } else {
        setPaymentStatus('FAILED');
        setVerifyError(result.error || 'Payment verification failed. Invalid or duplicate UTR.');
      }
    } catch (err) {
      setIsVerifying(false);
      setPaymentStatus('FAILED');
      setVerifyError(err.message || 'Error communicating with verification engine.');
    }
  };

  return (
    <>
      {!showInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Backdrop */}
          <div 
            onClick={() => !isPlacing && !isVerifying && onClose()}
            className="fixed inset-0 bg-brand-secondary/75 backdrop-blur-xs transition-opacity" 
          />

          <div className="relative bg-brand-card w-full max-w-2xl rounded-2xl shadow-2xl border border-brand-border overflow-hidden z-10 my-4 sm:my-8 animate-fadeIn">
          
          {/* Top Header */}
          <div className="bg-brand-secondary text-brand-cream p-5 sm:p-6 relative border-b border-brand-gold/30">
            {checkoutStep === 'form' && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-full text-brand-cream/70 hover:text-brand-cream hover:bg-brand-cream/10 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {checkoutStep === 'upi_payment' && (
              <button
                onClick={() => setCheckoutStep('form')}
                className="absolute top-4 left-4 p-1.5 rounded-full text-brand-cream/70 hover:text-brand-cream hover:bg-brand-cream/10 transition-colors flex items-center gap-1 text-xs"
                title="Back"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            )}

            <div className={`flex items-center gap-2 text-brand-gold text-xs font-bold uppercase tracking-wider mb-1 ${checkoutStep === 'upi_payment' ? 'sm:pl-12' : ''}`}>
              <Sparkles className="w-4 h-4" />
              <span>
                {checkoutStep === 'upi_payment' ? 'Real-Time UPI Payment Verification' : 'Official Wholesale Checkout'}
              </span>
            </div>

            <h3 className={`font-serif text-xl sm:text-2xl font-bold text-brand-cream ${checkoutStep === 'upi_payment' ? 'sm:pl-12' : ''}`}>
              {checkoutStep === 'success' && 'Wholesale Order Confirmed!'}
              {checkoutStep === 'upi_payment' && 'Scan & Pay — Anawar Store'}
              {checkoutStep === 'form' && 'Review & Confirm Wholesale Order'}
            </h3>

            <p className={`text-xs text-brand-cream/80 mt-1 ${checkoutStep === 'upi_payment' ? 'sm:pl-12' : ''}`}>
              {checkoutStep === 'success' && `Order ID: ${completedOrder?.id} • Verified Direct Wholesale Settlement`}
              {checkoutStep === 'upi_payment' && `Order: ${activeOrder?.id} • Total: ₹${Number(activeOrder?.totalAmount || grandTotal).toFixed(2)}`}
              {checkoutStep === 'form' && 'Direct wholesale supply. Strictly Cash or UPI payments.'}
            </p>
          </div>

          {/* ========================================================= */}
          {/* 1. UPI PAYMENT VERIFICATION SCREEN */}
          {/* ========================================================= */}
          {checkoutStep === 'upi_payment' && activeOrder && (
            <div className="p-4 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              
              {/* Payment Status Indicator Banner */}
              <div className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                paymentStatus === 'PAID'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : paymentStatus === 'PROCESSING'
                  ? 'bg-sky-50 border-sky-300 text-sky-900'
                  : paymentStatus === 'FAILED'
                  ? 'bg-rose-50 border-rose-300 text-rose-900'
                  : 'bg-amber-50/90 border-amber-300 text-amber-900'
              }`}>
                {paymentStatus === 'PAID' && (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 animate-bounce" />
                )}
                {paymentStatus === 'PROCESSING' && (
                  <Loader2 className="w-6 h-6 text-sky-600 animate-spin flex-shrink-0" />
                )}
                {paymentStatus === 'FAILED' && (
                  <AlertCircle className="w-6 h-6 text-rose-600 flex-shrink-0" />
                )}
                {paymentStatus === 'PENDING' && (
                  <div className="relative flex-shrink-0">
                    <Clock className="w-6 h-6 text-amber-600" />
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping" />
                  </div>
                )}

                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase tracking-wider text-[11px]">
                      Payment Status: <span className="font-black underline">{paymentStatus}</span>
                    </span>
                    <span className="text-[10px] bg-white/70 px-2 py-0.5 rounded-full font-mono font-semibold">
                      Live Polling Active
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] opacity-90">
                    {paymentStatus === 'PAID' && 'Payment verified successfully! Finalizing order confirmation...'}
                    {paymentStatus === 'PROCESSING' && 'Verifying 12-digit UTR with bank settlement ledger...'}
                    {paymentStatus === 'FAILED' && (verifyError || 'UTR validation failed. Please check your transaction reference.')}
                    {paymentStatus === 'PENDING' && 'Awaiting UPI payment. Scan the QR standee below to complete settlement.'}
                  </p>
                </div>
              </div>

              {/* QR Standee & UPI Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                
                {/* Left Column: Real QR Standee Image */}
                <div className="bg-brand-cream/60 border border-brand-gold/40 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-xs">
                  <div className="relative bg-white p-2 rounded-xl border border-brand-border/80 shadow-md max-w-[260px] w-full">
                    <img 
                      src="/assets/payment/anawar-store-gpay-qr.jpg" 
                      alt="Anawar Store Google Pay Business Standee"
                      className="w-full h-auto object-contain rounded-lg"
                      loading="eager"
                    />
                  </div>

                  <div className="mt-3 text-center">
                    <span className="text-[11px] font-bold text-brand-secondary block">
                      Google Pay Business Standee
                    </span>
                    <span className="text-[10px] text-brand-muted">
                      Official Merchant QR for Anawar Store
                    </span>
                  </div>
                </div>

                {/* Right Column: Instructions, VPA Copy & Total Amount */}
                <div className="space-y-3.5 flex flex-col justify-between">
                  
                  {/* Amount Payable Card */}
                  <div className="bg-brand-surface p-4 rounded-xl border border-brand-border space-y-1">
                    <span className="text-[11px] uppercase font-bold text-brand-muted block">
                      Total Payable Wholesale Amount
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-serif font-black text-brand-primary">
                        ₹{Number(activeOrder.totalAmount).toFixed(2)}
                      </span>
                      <span className="text-xs text-brand-success font-bold bg-brand-success/10 px-2 py-0.5 rounded-full">
                        Zero Surcharge
                      </span>
                    </div>
                    <p className="text-[10px] text-brand-muted pt-0.5">
                      Order Reference: <strong className="font-mono text-brand-secondary">{activeOrder.id}</strong>
                    </p>
                  </div>

                  {/* VPA / UPI ID Box with 1-Click Copy */}
                  <div className="bg-white p-3.5 rounded-xl border border-brand-border space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-brand-muted font-medium">Merchant UPI ID:</span>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="text-[11px] font-bold text-brand-primary hover:text-brand-primary-light flex items-center gap-1 transition-colors cursor-pointer bg-brand-primary/5 px-2 py-0.5 rounded-md"
                      >
                        {copiedUpi ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy UPI ID</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="bg-brand-surface/70 px-3 py-2 rounded-lg font-mono font-bold text-sm text-brand-secondary flex items-center justify-between select-all">
                      <span>9527898176@okbizaxis</span>
                    </div>

                    <div className="text-[10px] text-brand-muted space-y-0.5">
                      <div>Beneficiary: <strong className="text-brand-text">Anawar Store (Super Mashala)</strong></div>
                      <div>Phone: <strong className="text-brand-text">+91 95278 98176</strong></div>
                    </div>
                  </div>

                  {/* Step Instructions */}
                  <div className="bg-brand-cream/50 p-3 rounded-xl border border-brand-border/60 text-[11px] text-brand-text space-y-1.5">
                    <div className="font-bold text-brand-secondary text-xs flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-brand-primary" />
                      Payment Steps:
                    </div>
                    <ol className="list-decimal pl-4 space-y-1 text-brand-muted">
                      <li>Open GPay, PhonePe, Paytm, or BHIM.</li>
                      <li>Scan the QR code or send to <strong>9527898176@okbizaxis</strong>.</li>
                      <li>Enter exact amount: <strong>₹{Number(activeOrder.totalAmount).toFixed(2)}</strong>.</li>
                      <li>Copy the <strong>12-digit UPI Ref / UTR</strong> number and paste below.</li>
                    </ol>
                  </div>

                </div>

              </div>

              {/* UTR Input Form for Instant Verification */}
              <form onSubmit={handleVerifyUtr} className="bg-brand-surface p-4 sm:p-5 rounded-2xl border border-brand-gold/60 space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="utrInput" className="text-xs font-bold text-brand-secondary uppercase tracking-wide flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-brand-primary" />
                    Enter 12-Digit UPI Transaction ID / Bank UTR *
                  </label>
                  <span className="text-[10px] text-brand-muted font-mono">
                    {utrNumber.trim().length}/12 Digits
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    id="utrInput"
                    type="text"
                    inputMode="numeric"
                    maxLength={12}
                    value={utrNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                      setUtrNumber(val);
                      if (verifyError) setVerifyError('');
                    }}
                    placeholder="e.g. 432198765432"
                    className="flex-1 px-4 py-3 bg-white border border-brand-border rounded-xl text-base font-mono font-bold text-brand-secondary tracking-widest placeholder:tracking-normal placeholder:font-sans placeholder:text-xs placeholder:text-gray-400 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                    disabled={isVerifying || paymentStatus === 'PAID'}
                    required
                  />

                  <button
                    type="submit"
                    disabled={isVerifying || utrNumber.trim().length !== 12 || paymentStatus === 'PAID'}
                    className="px-6 py-3 bg-brand-primary hover:bg-brand-primary-light disabled:opacity-50 text-brand-cream text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-brand-gold" />
                        <span>Verifying...</span>
                      </>
                    ) : paymentStatus === 'PAID' ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Verified</span>
                      </>
                    ) : (
                      <>
                        <span>Verify Payment</span>
                        <ArrowRight className="w-4 h-4 text-brand-gold" />
                      </>
                    )}
                  </button>
                </div>

                {verifyError && (
                  <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                    <span>{verifyError}</span>
                  </div>
                )}

                <p className="text-[10px] text-brand-muted">
                  The UPI Reference Number (UTR) is printed on your payment success receipt in Google Pay, PhonePe, or Paytm. Idempotency protected — each UTR is uniquely validated.
                </p>
              </form>

            </div>
          )}

          {/* ========================================================= */}
          {/* 2. ORDER CONFIRMATION / SUCCESS SCREEN */}
          {/* ========================================================= */}
          {checkoutStep === 'success' && completedOrder && (
            <div className="p-6 sm:p-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-brand-success/15 text-brand-success flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-brand-gold uppercase tracking-widest">
                  {completedOrder.paymentStatus === 'PAID' ? 'Payment Verified & Booking Confirmed' : 'Booking Confirmed'}
                </span>
                <h4 className="font-serif text-2xl font-bold text-brand-secondary">
                  Thank You, {completedOrder.shopName}!
                </h4>
                <p className="text-xs text-brand-muted max-w-md mx-auto">
                  Your wholesale order <strong className="text-brand-primary">{completedOrder.id}</strong> has been secured in the Super Mashala dispatch ledger.
                </p>
              </div>

              {/* Order summary box */}
              <div className="bg-brand-surface p-4 rounded-xl border border-brand-border text-left space-y-2 text-xs">
                <div className="flex justify-between border-b border-brand-border/60 pb-2">
                  <span className="text-brand-muted">Store:</span>
                  <span className="font-bold text-brand-secondary">{completedOrder.shopName}</span>
                </div>
                <div className="flex justify-between border-b border-brand-border/60 pb-2">
                  <span className="text-brand-muted">Delivery Address:</span>
                  <span className="font-medium text-brand-secondary max-w-xs text-right">
                    {completedOrder.deliveryAddress}
                  </span>
                </div>
                <div className="flex justify-between border-b border-brand-border/60 pb-2">
                  <span className="text-brand-muted">Payment Mode:</span>
                  <div className="flex items-center gap-1.5 font-bold text-brand-secondary">
                    <span>{completedOrder.paymentMethod}</span>
                    {completedOrder.paymentStatus === 'PAID' && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        PAID
                      </span>
                    )}
                  </div>
                </div>

                {completedOrder.transactionId && (
                  <div className="flex justify-between border-b border-brand-border/60 pb-2 bg-emerald-50/60 p-2 rounded-lg">
                    <span className="text-emerald-900 font-semibold">Verified Bank UTR:</span>
                    <span className="font-mono font-bold text-emerald-800 select-all">
                      {completedOrder.transactionId}
                    </span>
                  </div>
                )}

                <div className="flex justify-between pt-1 text-sm font-bold text-brand-primary">
                  <span>Final Order Amount:</span>
                  <span className="price-tag font-sans font-bold text-base tabular-nums">
                    ₹{Number(completedOrder?.totalAmount ?? grandTotal ?? 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Helpline contact */}
              <div className="text-xs text-brand-muted">
                Direct dispatch assistance? Call or WhatsApp owner: <strong className="text-brand-secondary">+91 95278 98176</strong>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => setShowInvoice(true)}
                  className="px-6 py-3 bg-brand-gold hover:bg-brand-gold-dark text-brand-secondary text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  View &amp; Print Invoice
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOrderPlacedSuccess) onOrderPlacedSuccess();
                  }}
                  className="px-6 py-3 bg-brand-primary hover:bg-brand-primary-light text-brand-cream text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
                >
                  View in Order History
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. CHECKOUT DETAILS FORM */}
          {/* ========================================================= */}
          {checkoutStep === 'form' && (
            <div className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto space-y-6">
              
              {/* Step 1: Customer & Delivery Details */}
              <div className="bg-brand-surface p-4 rounded-xl border border-brand-border space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-brand-border/70">
                  <span className="text-xs font-bold text-brand-secondary flex items-center gap-1.5 uppercase tracking-wide">
                    <Store className="w-4 h-4 text-brand-primary" />
                    Retailer Delivery Destination
                  </span>
                  <span className="text-[10px] bg-brand-primary/10 text-brand-primary font-bold px-2 py-0.5 rounded-full">
                    {user ? 'Verified Shop' : 'Quick Retailer Order'}
                  </span>
                </div>

                {user ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-brand-muted block text-[11px]">Retail Store:</span>
                      <span className="font-bold text-brand-text">{user.shopName}</span>
                    </div>
                    <div>
                      <span className="text-brand-muted block text-[11px]">Proprietor / Contact:</span>
                      <span className="font-semibold text-brand-text">{user.fullName} ({user.mobileNumber || 'Mobile not provided'})</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-brand-muted block text-[11px]">Delivery Location:</span>
                      <span className="font-semibold text-brand-text">
                        {user.deliveryAddress}, {user.areaLocality}, {user.city}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50/90 border border-amber-300 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                      <ShieldAlert className="w-4 h-4 text-amber-700" />
                      <span>Customer Account Required to Complete Order</span>
                    </div>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Please log in or create an account to verify your delivery address, track orders, and complete your wholesale spice purchase.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        sessionStorage.setItem('pending_checkout', 'true');
                        onClose();
                        if (onOpenAuth) onOpenAuth();
                      }}
                      className="w-full py-2.5 bg-brand-primary hover:bg-brand-primary-light text-brand-cream font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      Log In / Create Account
                    </button>
                  </div>
                )}
              </div>

              {/* Step 2: Ordered Items Summary */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-brand-secondary uppercase tracking-wide flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-brand-gold-dark" />
                  Ordered Packets ({cart.length})
                </h4>

                <div className="bg-brand-card border border-brand-border rounded-xl divide-y divide-brand-border/60 max-h-48 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.variantId} className="p-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-8 h-8 rounded object-cover flex-shrink-0 bg-brand-cream"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/assets/icons/spice-icon.svg";
                          }}
                        />
                        <div className="truncate">
                          <p className="font-semibold text-brand-text truncate">{item.name}</p>
                          <p className="text-[10px] text-brand-muted">
                            {item.quantity} {item.quantity === 1 ? 'Packet' : 'Packets'} {item.piecesPerPacket ? `(${item.piecesPerPacket} Pcs/Pkt)` : ''} (@ ₹{item.price}/pkt)
                          </p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-brand-secondary ml-3 flex-shrink-0">
                        ₹{item.itemTotal.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 3: Payment Method (Cash & UPI Only - No Udhaar Rule) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-brand-secondary uppercase tracking-wide flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-brand-primary" />
                    Select Payment Method
                  </h4>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-amber-700" />
                    Strictly No Udhaar / Credit
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* UPI option (Primary Recommended) */}
                  <label 
                    onClick={() => setPaymentMethod('UPI')}
                    className={`p-3.5 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                      paymentMethod === 'UPI'
                        ? 'border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/20'
                        : 'border-brand-border bg-brand-cream/40 hover:bg-brand-surface'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_choice"
                      checked={paymentMethod === 'UPI'}
                      onChange={() => setPaymentMethod('UPI')}
                      className="mt-1 accent-brand-primary"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-xs text-brand-secondary">
                        <QrCode className="w-4 h-4 text-brand-primary" />
                        <span>UPI Payment / Standee QR</span>
                        <span className="text-[9px] bg-brand-gold/20 text-brand-gold-dark font-extrabold px-1.5 py-0.2 rounded">Fast</span>
                      </div>
                      <p className="text-[11px] text-brand-muted mt-0.5">
                        Scan Anawar Store Google Pay QR standee with any UPI app &amp; verify instantly.
                      </p>
                    </div>
                  </label>

                  {/* Cash on Delivery option */}
                  <label 
                    onClick={() => setPaymentMethod('Cash on Delivery')}
                    className={`p-3.5 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                      paymentMethod === 'Cash on Delivery'
                        ? 'border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/20'
                        : 'border-brand-border bg-brand-cream/40 hover:bg-brand-surface'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_choice"
                      checked={paymentMethod === 'Cash on Delivery'}
                      onChange={() => setPaymentMethod('Cash on Delivery')}
                      className="mt-1 accent-brand-primary"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-xs text-brand-secondary">
                        <Banknote className="w-4 h-4 text-brand-gold-dark" />
                        <span>Cash on Delivery</span>
                      </div>
                      <p className="text-[11px] text-brand-muted mt-0.5">
                        Pay exact cash to Md Anwar upon delivery of sealed packets at your counter.
                      </p>
                    </div>
                  </label>

                </div>

              </div>

              {/* Special Instructions / Notes */}
              <div>
                <label className="block text-[11px] font-semibold text-brand-text mb-1">
                  Order Delivery Instructions (Optional):
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Please deliver between 10 AM and 2 PM, or call before arrival."
                  rows={2}
                  className="w-full px-3 py-2 bg-brand-surface/70 border border-brand-border rounded-xl text-xs text-brand-text focus:outline-none focus:border-brand-primary focus:bg-white resize-none"
                />
              </div>

              {/* Price Breakdown & Confirmation */}
              <div className="border-t border-brand-border/80 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-brand-muted">
                  <span>Items Subtotal:</span>
                  <span className="font-mono font-semibold text-brand-text">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-brand-muted">
                  <span>Store Delivery:</span>
                  <span className="font-mono font-semibold text-brand-text">
                    {deliveryFee === 0 ? <span className="text-brand-success font-bold">FREE</span> : `₹${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-brand-primary border-t border-brand-border/60 pt-2">
                  <span>Grand Wholesale Total:</span>
                  <span className="price-tag font-sans text-xl font-bold tabular-nums text-brand-primary">
                    ₹{grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={user ? handleProceed : () => {
                  sessionStorage.setItem('pending_checkout', 'true');
                  onClose();
                  if (onOpenAuth) onOpenAuth();
                }}
                disabled={isPlacing || cart.length === 0}
                className="w-full py-4 bg-brand-primary hover:bg-brand-primary-light text-brand-cream text-xs font-bold uppercase tracking-wider rounded-xl shadow-premium border border-brand-gold/40 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {!user ? (
                  <>
                    <span>Log In to Place Order (₹{grandTotal.toFixed(2)})</span>
                    <ArrowRight className="w-4 h-4 text-brand-gold" />
                  </>
                ) : isPlacing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-brand-gold" />
                    <span>Processing Order...</span>
                  </>
                ) : paymentMethod === 'UPI' ? (
                  <>
                    <span>Proceed to UPI Payment (₹{grandTotal.toFixed(2)})</span>
                    <ArrowRight className="w-4 h-4 text-brand-gold" />
                  </>
                ) : (
                  <>
                    <span>Place Wholesale Order (₹{grandTotal.toFixed(2)})</span>
                    <ArrowRight className="w-4 h-4 text-brand-gold" />
                  </>
                )}
              </button>

            </div>
          )}

        </div>
      </div>
      )}

      {/* Embedded Invoice Modal for Immediate Viewing & Printing */}
      {showInvoice && completedOrder && (
        <OrderInvoiceModal
          order={completedOrder}
          onClose={() => setShowInvoice(false)}
        />
      )}
    </>
  );
};
