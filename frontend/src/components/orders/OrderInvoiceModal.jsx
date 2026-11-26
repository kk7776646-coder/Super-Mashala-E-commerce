import React, { useState, useRef } from 'react';
import { X, Printer, Download, Copy, CheckCircle2, ShieldCheck, FileText } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { BRAND_ASSETS } from '../../constants/productImages';
import { useOrders } from '../../context/OrderContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const OrderInvoiceModal = ({ order, onClose }) => {
  const { recordInvoicePrint } = useOrders();
  const [isDuplicate, setIsDuplicate] = useState(
    (order?.invoicePrintCount && order.invoicePrintCount > 1) || false
  );
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const invoiceRef = useRef(null);

  if (!order) return null;

  const invoiceNumber = `INV-${order.id}`;
  const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  // Action 1: Print Original Invoice
  const handlePrintOriginal = () => {
    setIsDuplicate(false);
    recordInvoicePrint(order.id);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  // Action 2: Print Duplicate Invoice
  const handlePrintDuplicate = () => {
    setIsDuplicate(true);
    recordInvoicePrint(order.id);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  // Action 3: Download Real PDF
  const handleDownloadPdf = async () => {
    if (!invoiceRef.current) return;
    setIsGeneratingPdf(true);

    try {
      const element = invoiceRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`SuperMashala_Invoice_${order.id}${isDuplicate ? '_DUPLICATE' : ''}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
      
      <div className="relative bg-white text-gray-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-gray-300 overflow-hidden my-6 print:border-none print:shadow-none print:m-0 print:max-w-none">
        
        {/* ACTION TOOLBAR (Hidden in Print) */}
        <div className="bg-brand-surface border-b border-brand-border/80 px-6 py-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-brand-secondary uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-brand-primary" />
              Invoice Controls
            </span>
            {isDuplicate && (
              <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase px-2 py-0.5 rounded border border-amber-300">
                Duplicate Mode Active
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            
            {/* Button 1: Download Real PDF */}
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-3 py-1.5 bg-white border border-gray-300 hover:border-brand-primary text-gray-800 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-brand-primary" />
              <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>

            {/* Button 2: Print Invoice */}
            <button
              onClick={handlePrintOriginal}
              className="px-3.5 py-1.5 bg-brand-primary text-white text-xs font-bold rounded-lg flex items-center gap-1.5 hover:bg-brand-primary-light transition-all shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>

            {/* Button 3: Print Duplicate Invoice */}
            <button
              onClick={handlePrintDuplicate}
              className="px-3.5 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 hover:bg-amber-700 transition-all shadow-xs"
              title="Prints identical invoice explicitly stamped DUPLICATE COPY"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Print Duplicate Copy</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-bold flex items-center gap-1 transition-colors ml-1"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </button>

          </div>
        </div>

        {/* INVOICE DOCUMENT CANVAS (Formatted for A4 Standard Print & PDF) */}
        <div 
          id="invoice-document"
          ref={invoiceRef}
          className="p-8 sm:p-10 space-y-6 bg-white relative"
        >
          {/* Prominent Duplicate Watermark if in Duplicate mode */}
          {isDuplicate && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
              <span className="text-gray-200 font-sans font-black text-6xl sm:text-7xl uppercase tracking-widest rotate-[-30deg] border-4 border-gray-200 px-6 py-2 rounded-2xl opacity-60">
                DUPLICATE COPY
              </span>
            </div>
          )}

          {/* Header Bar */}
          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b-2 border-brand-primary">
            
            {/* Left: Brand Identity */}
            <div className="space-y-1">
              <BrandLogo variant="invoice" size="lg" />
              <p className="text-xs text-gray-600 pt-1 font-medium">
                Wholesale Spices &amp; Dry Fruits Distribution<br />
                ulhasnager-05, Thane, Mumbai, Maharashtra, pin code 421005<br />
                Wholesale Helpline: <strong>+91 9527898176</strong>
              </p>
            </div>

            {/* Right: Invoice Metadata */}
            <div className="text-left sm:text-right space-y-1">
              {isDuplicate ? (
                <span className="inline-block px-3 py-1 bg-red-100 text-red-800 border border-red-300 font-sans text-xs font-black uppercase tracking-wider rounded">
                  DUPLICATE TAX INVOICE
                </span>
              ) : (
                <span className="inline-block px-3 py-1 bg-brand-cream text-brand-primary border border-brand-border font-sans text-xs font-bold uppercase tracking-wider rounded">
                  WHOLESALE TAX INVOICE
                </span>
              )}

              <p className="font-mono text-xs font-bold text-gray-900 pt-1">
                Invoice No: <strong>{invoiceNumber}</strong>
              </p>
              <p className="font-mono text-xs text-gray-600">
                Order ID: #{order.id}
              </p>
              <p className="text-xs text-gray-600">
                Date: {invoiceDate}
              </p>
              <p className="text-xs font-bold text-brand-primary">
                Status: {order.status}
              </p>
            </div>

          </div>

          {/* Billed To / Shopkeeper Destination */}
          <div className="relative z-10 bg-gray-50 p-4 rounded-xl border border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                Billed To (Retail Store):
              </span>
              <p className="font-sans font-bold text-gray-900 text-sm">
                {order.shopName || order.customerName}
              </p>
              <p className="text-gray-700">Proprietor: {order.customerName}</p>
              <p className="text-gray-700">Phone: {order.contactNumber || '9527898176'}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                Delivery Destination:
              </span>
              <p className="text-gray-800 leading-relaxed font-medium">
                {order.deliveryAddress || 'ulhasnager-05, Thane, Mumbai, Maharashtra, pin code 421005'}
              </p>
              <p className="text-gray-600 text-[11px] mt-1">
                Supply: Direct Owner Local Delivery
              </p>
            </div>
          </div>

          {/* Itemized Products Table */}
          <div className="relative z-10 overflow-x-auto">
            <table className="w-full text-left text-xs border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-brand-primary text-white text-[11px] uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3 text-center">Packaging / Pieces</th>
                  <th className="py-2.5 px-3 text-center">Packets</th>
                  <th className="py-2.5 px-3 text-right">Packet Rate</th>
                  <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-xs">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/60">
                    <td className="py-2.5 px-3 font-semibold text-gray-900">
                      {item.name}
                    </td>
                    <td className="py-2.5 px-3 text-center font-medium text-gray-700">
                      {item.piecesPerPacket ? `${item.piecesPerPacket} Pieces/Pkt` : (item.packetWeight || 'Standard Packet')}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-gray-900">
                      {item.quantity} {item.quantity === 1 ? 'Packet' : 'Packets'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-gray-700">
                      ₹{Number(item.price || 0).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-900">
                      ₹{Number(item.itemTotal || (item.price * item.quantity) || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Payment Breakdown */}
          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
            
            <div className="text-xs space-y-1 text-gray-600 max-w-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-800">
                  Payment Method: {order.paymentMethod || 'Cash on Delivery'}
                </span>
                {order.paymentStatus === 'PAID' && (
                  <span className="bg-emerald-100 text-emerald-800 font-black text-[9px] px-1.5 py-0.5 rounded uppercase">
                    PAID
                  </span>
                )}
              </div>
              {order.transactionId && (
                <div className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Bank UTR: <strong>{order.transactionId}</strong> (Verified)
                </div>
              )}
              <p className="text-[11px] text-gray-500 leading-relaxed pt-1">
                Terms: Fixed wholesale pricing. Strictly no Udhaar or outstanding credit. Only Cash and UPI accepted.
              </p>
            </div>

            <div className="w-full sm:w-64 space-y-1.5 text-xs text-right">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold">₹{Number(order.subtotal ?? order.totalAmount ?? 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Local Store Delivery:</span>
                <span className="font-mono font-semibold">
                  {Number(order.deliveryFee || 0) === 0 ? <strong className="text-green-700">FREE</strong> : `₹${Number(order.deliveryFee).toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-brand-primary border-t-2 border-gray-300 pt-2">
                <span>Final Payable Amount:</span>
                <span className="font-sans text-xl font-black font-mono">
                  ₹{Number(order.totalAmount || 0).toFixed(2)}
                </span>
              </div>
            </div>

          </div>

          {/* Signatures */}
          <div className="relative z-10 pt-8 border-t border-gray-200 flex justify-between items-end text-xs text-gray-600">
            <div>
              <p className="font-semibold text-gray-800">Shopkeeper Receiver Signature</p>
              <div className="w-36 border-b border-gray-400 mt-6" />
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-900">For SUPER MASHALA &amp; DRY FRUITS</p>
              <p className="text-[11px] text-gray-500">Authorized Signatory / Depot</p>
              <div className="w-44 border-b border-gray-400 mt-6 ml-auto" />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
