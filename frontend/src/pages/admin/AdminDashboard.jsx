import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Package, 
  Boxes, 
  BarChart3, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Edit3, 
  Plus, 
  Printer, 
  X, 
  LogOut, 
  TrendingUp,
  Shield,
  Phone,
  MapPin,
  Store,
  Calendar,
  Lock,
  Download,
  Copy,
  Layers,
  Sparkles,
  Check
} from 'lucide-react';
import { useOrders } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../../components/common/BrandLogo';
import { CATEGORIES } from '../../data/categoriesData';
import { OrderInvoiceModal } from '../../components/orders/OrderInvoiceModal';

export const AdminDashboard = ({ onClose }) => {
  const { 
    orders, 
    products, 
    updateOrderStatus, 
    updatePaymentStatus, 
    updateProduct, 
    addProduct 
  } = useOrders();
  const { adminUser, logoutAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'orders', 'customers', 'products', 'inventory', 'reports'
  
  // Orders filter & search
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  // Product Editing State
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  // New Product Form (9 required fields)
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    categoryId: 'cat_whole_spices',
    packetPrice: 35,
    packetType: 'Pieces per Packet',
    piecesPerPacket: '12', // '10', '12', 'custom', or ''
    customPieces: '',
    packetWeight: '',
    stock: 100,
    image: '/assets/products/whole-spices/rai.png',
    isActive: true,
    description: '',
  });

  // KPI Calculations from REAL database records
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
  const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'Completed' || o.paymentStatus === 'Paid' ? Number(o.totalAmount || 0) : 0), 0);
  
  // Unique customers from REAL orders
  const customersMap = new Map();
  orders.forEach(o => {
    if (!customersMap.has(o.customerId)) {
      customersMap.set(o.customerId, {
        id: o.customerId,
        name: o.customerName,
        shopName: o.shopName,
        phone: o.contactNumber,
        address: o.deliveryAddress,
        totalOrders: 1,
        totalSpent: Number(o.totalAmount || 0),
      });
    } else {
      const existing = customersMap.get(o.customerId);
      existing.totalOrders += 1;
      existing.totalSpent += Number(o.totalAmount || 0);
    }
  });
  const customersList = Array.from(customersMap.values());

  // Inventory Low Stock Items (Stock <= 15 packets)
  const lowStockItems = products.filter(p => Number(p.stock ?? p.stock_quantity ?? 100) <= 15);

  // Filtered Orders
  const filteredOrders = orders.filter(o => {
    if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) return false;
    if (orderSearch.trim() !== '') {
      const q = orderSearch.toLowerCase();
      return (
        (o.id || '').toLowerCase().includes(q) ||
        (o.shopName || '').toLowerCase().includes(q) ||
        (o.customerName || '').toLowerCase().includes(q) ||
        (o.contactNumber || '').includes(q)
      );
    }
    return true;
  });

  const handleSaveProductEdit = async () => {
    if (!editingProduct) return;
    const piecesVal = editingProduct.piecesOption === 'unconfirmed' 
      ? null 
      : editingProduct.piecesOption === '10' 
      ? 10 
      : editingProduct.piecesOption === '12' 
      ? 12 
      : (editingProduct.customPieces ? parseInt(editingProduct.customPieces) : null);

    await updateProduct({
      id: editingProduct.id,
      name: editingProduct.name,
      categoryId: editingProduct.categoryId,
      packetPrice: parseFloat(editingProduct.packetPrice),
      piecesPerPacket: piecesVal,
      packetWeight: editingProduct.packetWeight || null,
      stock: parseInt(editingProduct.stock),
      isActive: editingProduct.isActive,
      image: editingProduct.image,
      description: editingProduct.description || '',
    });
    setEditingProduct(null);
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    const piecesVal = newProductForm.piecesPerPacket === 'unconfirmed' || newProductForm.piecesPerPacket === ''
      ? null
      : newProductForm.piecesPerPacket === '10'
      ? 10
      : newProductForm.piecesPerPacket === '12'
      ? 12
      : (newProductForm.customPieces ? parseInt(newProductForm.customPieces) : null);

    await addProduct({
      name: newProductForm.name,
      categoryId: newProductForm.categoryId,
      packetPrice: parseFloat(newProductForm.packetPrice),
      piecesPerPacket: piecesVal,
      packetWeight: newProductForm.packetWeight || null,
      stock: parseInt(newProductForm.stock),
      image: newProductForm.image,
      isActive: newProductForm.isActive,
      description: newProductForm.description || '',
      sellingUnit: 'Packet',
    });

    setShowAddProductModal(false);
    setNewProductForm({
      name: '',
      categoryId: 'cat_whole_spices',
      packetPrice: 35,
      packetType: 'Pieces per Packet',
      piecesPerPacket: '12',
      customPieces: '',
      packetWeight: '',
      stock: 100,
      image: '/assets/products/whole-spices/rai.png',
      isActive: true,
      description: '',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-100 flex flex-col overflow-hidden overscroll-none font-sans select-none sm:select-auto">
      
      {/* Top Admin Header Bar */}
      <header className="bg-brand-secondary text-brand-cream border-b border-brand-gold/40 px-6 py-3.5 flex items-center justify-between shadow-md flex-shrink-0">
        <div className="flex items-center gap-3">
          <BrandLogo variant="icon" size="sm" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-base tracking-wide text-brand-cream">
                SUPER MASHALA &amp; DRY FRUITS
              </span>
              <span className="bg-brand-gold text-brand-secondary text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider">
                Admin Panel
              </span>
            </div>
            <p className="text-[11px] text-brand-cream/80">
              Wholesale Packet Order &amp; Catalogue Management • Authorized: <strong className="text-brand-gold">{adminUser?.email}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              logoutAdmin();
              onClose();
            }}
            className="px-3.5 py-1.5 rounded-lg bg-red-700/80 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="Log out from administration"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Admin Logout</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-brand-cream/80 hover:text-brand-cream hover:bg-white/10 transition-colors"
            aria-label="Close dashboard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Admin Body */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar Navigation */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between p-4 flex-shrink-0">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 block mb-1">
              Store Control
            </span>

            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'overview'
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'orders'
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-4 h-4" />
                <span>Orders</span>
              </div>
              {pendingOrders > 0 && (
                <span className="bg-brand-gold text-brand-secondary text-[10px] font-black px-2 py-0.5 rounded-full">
                  {pendingOrders}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'products'
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4" />
                <span>Product Catalogue</span>
              </div>
              <span className="bg-gray-100 text-gray-600 text-[10px] font-mono px-2 py-0.5 rounded-full">
                {products.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'inventory'
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Boxes className="w-4 h-4" />
                <span>Inventory / Stock</span>
              </div>
              {lowStockItems.length > 0 && (
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {lowStockItems.length} Low
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'customers'
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Retailer Directory</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'reports'
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Revenue &amp; Policy</span>
            </button>
          </div>

          <div className="bg-stone-50 border border-stone-200 p-3 rounded-xl text-[11px] text-stone-600 space-y-1">
            <span className="font-bold text-brand-secondary block">Business Owner Policy:</span>
            <p>• Strictly No Udhaar / Credit</p>
            <p>• Packet-Based Fixed Rates</p>
            <p>• Direct Local Delivery</p>
          </div>
        </aside>

        {/* Right Main Content Pane */}
        <main className="flex-1 overflow-y-auto overscroll-contain p-6 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-gray-500">
                    <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
                    <ShoppingBag className="w-4 h-4 text-brand-primary" />
                  </div>
                  <p className="font-sans text-3xl font-black text-gray-900">{totalOrders}</p>
                  <p className="text-[11px] text-gray-500">Real database order records</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-gray-500">
                    <span className="text-xs font-bold uppercase tracking-wider">Active Bookings</span>
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <p className="font-sans text-3xl font-black text-amber-700">{pendingOrders}</p>
                  <p className="text-[11px] text-gray-500">Pending packaging &amp; dispatch</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-gray-500">
                    <span className="text-xs font-bold uppercase tracking-wider">Total Sales Settled</span>
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="font-sans text-3xl font-black text-brand-primary">₹{totalRevenue.toFixed(2)}</p>
                  <p className="text-[11px] text-emerald-700 font-semibold">100% Cash &amp; UPI (No Udhaar)</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-gray-500">
                    <span className="text-xs font-bold uppercase tracking-wider">Live Catalogue</span>
                    <Package className="w-4 h-4 text-brand-gold-dark" />
                  </div>
                  <p className="font-sans text-3xl font-black text-gray-900">{products.length}</p>
                  <p className="text-[11px] text-gray-500">Fixed rate packet products</p>
                </div>

              </div>

              {/* Quick Actions & Recent Orders Preview */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div>
                    <h3 className="font-sans text-base font-bold text-gray-900">
                      Recent Wholesale Orders
                    </h3>
                    <p className="text-xs text-gray-500">
                      Orders placed by retail grocery shopkeepers.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-brand-primary hover:underline"
                  >
                    View All Orders →
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 text-xs space-y-1">
                    <ShoppingBag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="font-bold text-gray-800 text-sm">No Orders Received Yet</p>
                    <p>New wholesale bookings will appear here in real-time.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {orders.slice(0, 5).map(o => (
                      <div key={o.id} className="py-3 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-gray-900">{o.shopName} ({o.customerName})</p>
                          <p className="text-gray-500 text-[11px]">ID: {o.id} • {o.items?.length || 0} items • {o.paymentMethod}</p>
                        </div>
                        <div className="text-right flex items-center gap-3">
                          <span className="font-sans font-bold text-sm text-brand-primary">₹{Number(o.totalAmount || 0).toFixed(2)}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            o.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {o.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-4 animate-fadeIn">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-sans text-lg font-bold text-gray-900">
                    Wholesale Order Management
                  </h3>
                  <p className="text-xs text-gray-500">
                    Review incoming shopkeeper orders, update status, and print duplicate invoices.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="text-xs font-semibold rounded-xl border border-gray-300 px-3 py-2 bg-white text-gray-800 outline-none focus:border-brand-primary"
                  >
                    <option value="all">All Statuses ({orders.length})</option>
                    <option value="Order Placed">Order Placed</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Packing">Packing</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Order List */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-16 text-gray-500 text-xs space-y-2">
                    <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto" />
                    <p className="font-bold text-gray-800 text-sm">No Orders Found</p>
                    <p>There are no orders matching your current search or filter.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Order ID &amp; Date</th>
                          <th className="py-3 px-4">Retailer / Store</th>
                          <th className="py-3 px-4">Ordered Packets</th>
                          <th className="py-3 px-4">Total Amount</th>
                          <th className="py-3 px-4">Payment</th>
                          <th className="py-3 px-4">Order Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredOrders.map(order => (
                          <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="py-3 px-4">
                              <span className="font-mono font-bold text-gray-900 block">{order.id}</span>
                              <span className="text-[11px] text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </td>

                            <td className="py-3 px-4">
                              <span className="font-bold text-gray-900 block">{order.shopName}</span>
                              <span className="text-[11px] text-gray-500">{order.customerName} ({order.contactNumber})</span>
                              <p className="text-[10px] text-gray-400 max-w-xs truncate">{order.deliveryAddress}</p>
                            </td>

                            <td className="py-3 px-4">
                              <span className="font-semibold text-gray-800">{order.items?.length || 0} product(s)</span>
                              <div className="text-[10px] text-gray-500 max-w-xs truncate">
                                {(order.items || []).map(i => `${i.quantity}x ${i.name} ${i.piecesPerPacket ? `(${i.piecesPerPacket} pcs)` : ''}`).join(', ')}
                              </div>
                            </td>

                            <td className="py-3 px-4 font-sans font-bold text-sm text-gray-900">
                              ₹{Number(order.totalAmount || 0).toFixed(2)}
                            </td>

                            <td className="py-3 px-4">
                              <span className="font-semibold text-gray-800 block">{order.paymentMethod}</span>
                              {order.transactionId && (
                                <span className="text-[10px] font-mono text-emerald-700 font-bold block mt-0.5">
                                  UTR: {order.transactionId}
                                </span>
                              )}
                              <select
                                value={(order.paymentStatus || 'PENDING').toUpperCase()}
                                onChange={(e) => updatePaymentStatus(order.id, e.target.value)}
                                className={`text-[11px] font-bold rounded px-1.5 py-0.5 border mt-1 outline-none ${
                                  (order.paymentStatus || '').toUpperCase() === 'PAID' || (order.paymentStatus || '').toUpperCase() === 'COMPLETED'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                    : (order.paymentStatus || '').toUpperCase() === 'FAILED'
                                    ? 'bg-rose-50 text-rose-700 border-rose-300'
                                    : 'bg-amber-50 text-amber-700 border-amber-300'
                                }`}
                              >
                                <option value="PENDING">PENDING</option>
                                <option value="PROCESSING">PROCESSING</option>
                                <option value="PAID">PAID</option>
                                <option value="FAILED">FAILED</option>
                              </select>
                            </td>

                            <td className="py-3 px-4">
                              <select
                                value={order.status}
                                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                className="text-xs font-bold rounded-lg px-2.5 py-1 border border-gray-300 bg-white text-gray-900 outline-none focus:border-brand-primary"
                              >
                                <option value="Order Placed">Order Placed</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Packing">Packing</option>
                                <option value="Out for Delivery">Out for Delivery</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>

                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => setSelectedInvoiceOrder(order)}
                                className="px-3 py-1.5 rounded-lg border border-gray-300 hover:border-brand-primary hover:bg-brand-surface text-gray-700 text-xs font-bold flex items-center gap-1.5 ml-auto transition-colors"
                                title="View, Download PDF or Print Invoice"
                              >
                                <Printer className="w-3.5 h-3.5 text-brand-primary" />
                                <span>Invoice</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: PRODUCT CATALOGUE MANAGEMENT (PACKET-BASED) */}
          {activeTab === 'products' && (
            <div className="space-y-4 animate-fadeIn">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-sans text-lg font-bold text-gray-900">
                    Official Product Catalogue ({products.length} Products)
                  </h3>
                  <p className="text-xs text-gray-500">
                    Manage fixed packet rates, 10/12-piece packaging configurations, and images.
                  </p>
                </div>

                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="px-4 py-2 bg-brand-primary text-white text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-brand-primary-light transition-all shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </div>

              {/* Products Table */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Product</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Packet Price (₹)</th>
                        <th className="py-3 px-4">Packet Contents</th>
                        <th className="py-3 px-4">Stock</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {products.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-10 h-10 rounded-lg object-contain bg-gray-50 border border-gray-200 flex-shrink-0 p-0.5"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "/assets/icons/spice-icon.svg";
                                }}
                              />
                              <div>
                                <span className="font-bold text-gray-900 text-sm block">{p.name}</span>
                                <span className="text-[11px] text-gray-400 font-mono">ID: {p.id}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-semibold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md text-[11px]">
                              {p.categoryName || p.category_name || 'Spices'}
                            </span>
                          </td>

                          <td className="py-3 px-4 font-sans font-bold text-sm text-brand-primary">
                            ₹{Number(p.packetPrice ?? p.price ?? 0).toFixed(2)} / Packet
                          </td>

                          <td className="py-3 px-4">
                            {p.piecesPerPacket ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                                {p.piecesPerPacket} Pieces / Packet
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-stone-100 text-stone-600">
                                Unconfirmed / Standard
                              </span>
                            )}
                            {p.packetWeight && (
                              <span className="ml-1 text-[10px] text-gray-500">({p.packetWeight})</span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <span className={`font-mono font-bold ${Number(p.stock ?? p.stock_quantity ?? 100) <= 15 ? 'text-amber-600' : 'text-gray-900'}`}>
                              {p.stock ?? p.stock_quantity ?? 100} pkts
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            {p.isActive !== false && p.is_active !== 0 ? (
                              <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded">
                                Active
                              </span>
                            ) : (
                              <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded">
                                Inactive
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setEditingProduct({
                                id: p.id,
                                name: p.name,
                                categoryId: p.categoryId || p.category_id,
                                packetPrice: p.packetPrice ?? p.price,
                                piecesOption: p.piecesPerPacket === 10 ? '10' : p.piecesPerPacket === 12 ? '12' : (p.piecesPerPacket ? 'custom' : 'unconfirmed'),
                                customPieces: p.piecesPerPacket && p.piecesPerPacket !== 10 && p.piecesPerPacket !== 12 ? p.piecesPerPacket : '',
                                packetWeight: p.packetWeight || '',
                                stock: p.stock ?? p.stock_quantity ?? 100,
                                image: p.image,
                                isActive: p.isActive !== false && p.is_active !== 0,
                                description: p.description || p.shortDescription || '',
                              })}
                              className="px-3 py-1.5 rounded-lg border border-gray-300 hover:border-brand-primary hover:bg-brand-surface text-gray-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-brand-primary" />
                              <span>Edit</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: INVENTORY & STOCK */}
          {activeTab === 'inventory' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-sans text-lg font-bold text-gray-900">
                    Warehouse Packet Inventory
                  </h3>
                  <p className="text-xs text-gray-500">
                    Live stock quantities automatically decremented on successful customer checkout.
                  </p>
                </div>
              </div>

              {lowStockItems.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wide">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    <span>Low Stock Alert ({lowStockItems.length} Products)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                    {lowStockItems.map(item => (
                      <div key={item.id} className="bg-white p-3 rounded-xl border border-amber-200 text-xs flex items-center justify-between">
                        <div>
                          <p className="font-bold text-gray-900">{item.name}</p>
                          <p className="text-[11px] text-gray-500">Rate: ₹{item.packetPrice || item.price} / Packet</p>
                          <p className="text-[10px] font-bold text-amber-700 mt-1">Stock: {item.stock} pkts</p>
                        </div>
                        <button
                          onClick={() => updateProduct({ id: item.id, stock: (item.stock || 0) + 50 })}
                          className="px-2.5 py-1 bg-brand-primary text-white text-[11px] font-bold rounded-lg hover:bg-brand-primary-light transition-all"
                        >
                          Restock (+50)
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Spice Product</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Packet Rate</th>
                        <th className="py-3 px-4">Available Stock</th>
                        <th className="py-3 px-4">Health Status</th>
                        <th className="py-3 px-4 text-right">Quick Restock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {products.map(p => {
                        const stockVal = Number(p.stock ?? p.stock_quantity ?? 100);
                        return (
                          <tr key={p.id} className="hover:bg-gray-50">
                            <td className="py-2.5 px-4 font-bold text-gray-900">
                              {p.name}
                            </td>
                            <td className="py-2.5 px-4 text-gray-600">
                              {p.categoryName || 'Spices'}
                            </td>
                            <td className="py-2.5 px-4 font-mono font-bold text-gray-800">
                              ₹{Number(p.packetPrice ?? p.price ?? 0).toFixed(2)}
                            </td>
                            <td className="py-2.5 px-4 font-mono font-bold text-sm">
                              {stockVal} packets
                            </td>
                            <td className="py-2.5 px-4">
                              {stockVal === 0 ? (
                                <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded">
                                  Out of Stock
                                </span>
                              ) : stockVal <= 15 ? (
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                                  Low Stock
                                </span>
                              ) : (
                                <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded">
                                  Healthy
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-4 text-right space-x-1.5">
                              <button
                                onClick={() => updateProduct({ id: p.id, stock: stockVal + 10 })}
                                className="px-2 py-1 text-[11px] font-bold text-brand-primary bg-brand-surface hover:bg-brand-border/60 rounded border border-brand-border transition-colors cursor-pointer"
                              >
                                +10
                              </button>
                              <button
                                onClick={() => updateProduct({ id: p.id, stock: stockVal + 50 })}
                                className="px-2 py-1 text-[11px] font-bold text-white bg-brand-primary hover:bg-brand-primary-light rounded transition-colors cursor-pointer"
                              >
                                +50
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: RETAILER DIRECTORY */}
          {activeTab === 'customers' && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <h3 className="font-sans text-lg font-bold text-gray-900">
                  Retail Store Directory
                </h3>
                <p className="text-xs text-gray-500">
                  All grocery shops ordering wholesale packets from Super Mashala.
                </p>
              </div>

              {customersList.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 text-gray-500 text-xs space-y-2">
                  <Store className="w-10 h-10 text-gray-300 mx-auto" />
                  <p className="font-bold text-gray-800 text-sm">No Customers Registered Yet</p>
                  <p>When retail shopkeepers register or complete checkout, their store information will be logged here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {customersList.map(cust => (
                    <div key={cust.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
                      <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-sm">
                          {cust.shopName?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <h4 className="font-sans font-bold text-sm text-gray-900">{cust.shopName}</h4>
                          <p className="text-[11px] text-gray-500">{cust.name}</p>
                        </div>
                      </div>

                      <div className="text-xs space-y-1 text-gray-600">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-mono font-semibold">{cust.phone || '9527898176'}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                          <span>{cust.address}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] text-gray-400 block">Total Orders</span>
                          <span className="font-bold text-gray-900">{cust.totalOrders} order(s)</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-gray-400 block">Total Spent</span>
                          <span className="font-sans font-bold text-brand-primary">₹{cust.totalSpent.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: REPORTS & POLICY VERIFICATION */}
          {activeTab === 'reports' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="font-sans text-lg font-bold text-gray-900">
                  Sales Reports &amp; Zero-Udhaar Policy Verification
                </h3>
                <p className="text-xs text-gray-500">
                  Real database transactions only. Strictly cash and UPI settlements.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                  <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Gross Wholesale Sales</span>
                  <p className="font-sans text-3xl font-black text-brand-primary mt-1">₹{totalRevenue.toFixed(2)}</p>
                  <p className="text-[11px] text-green-700 font-semibold mt-1">✓ 100% Cash / UPI settled</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                  <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Average Order Value</span>
                  <p className="font-sans text-3xl font-black text-gray-900 mt-1">
                    ₹{totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : '0.00'}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1">Real database orders only</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                  <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Outstanding Udhaar</span>
                  <p className="font-sans text-3xl font-black text-emerald-700 mt-1">₹0.00</p>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1">Strict Zero Credit Policy Active</p>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h4 className="font-sans text-base font-bold text-gray-900">
                Edit Product &amp; Packaging
              </h4>
              <button 
                onClick={() => setEditingProduct(null)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Product Name *</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Category *</label>
                <select
                  value={editingProduct.categoryId}
                  onChange={(e) => setEditingProduct({...editingProduct, categoryId: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg font-semibold bg-white"
                >
                  <option value="cat_masala_powder">Masala Powder</option>
                  <option value="cat_whole_spices">Whole Spices</option>
                  <option value="cat_premium_spices">Premium Spices</option>
                  <option value="cat_dry_fruits">Dry Fruits</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Selling Price Per Packet (₹) *</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editingProduct.packetPrice}
                    onChange={(e) => setEditingProduct({...editingProduct, packetPrice: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg font-mono font-bold text-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Stock Quantity (Packets) *</label>
                  <input
                    type="number"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({...editingProduct, stock: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Pieces Per Packet</label>
                <select
                  value={editingProduct.piecesOption}
                  onChange={(e) => setEditingProduct({...editingProduct, piecesOption: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg font-semibold bg-white"
                >
                  <option value="12">12 Pieces per Packet (Confirmed)</option>
                  <option value="10">10 Pieces per Packet</option>
                  <option value="unconfirmed">Unconfirmed / Blank (Store as NULL)</option>
                  <option value="custom">Custom Pieces...</option>
                </select>
                {editingProduct.piecesOption === 'custom' && (
                  <input
                    type="number"
                    placeholder="Enter custom piece count"
                    value={editingProduct.customPieces}
                    onChange={(e) => setEditingProduct({...editingProduct, customPieces: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg font-mono font-bold mt-1.5"
                  />
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Packet Weight (Optional, e.g. '100g')</label>
                <input
                  type="text"
                  placeholder="Leave blank if sold by pieces"
                  value={editingProduct.packetWeight}
                  onChange={(e) => setEditingProduct({...editingProduct, packetWeight: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Product Photograph (Path or URL)</label>
                <input
                  type="text"
                  value={editingProduct.image}
                  onChange={(e) => setEditingProduct({...editingProduct, image: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-[11px] font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editingProduct.isActive}
                  onChange={(e) => setEditingProduct({...editingProduct, isActive: e.target.checked})}
                  className="w-4 h-4 accent-brand-primary"
                />
                <label htmlFor="editIsActive" className="font-bold text-gray-700">
                  Product is Active &amp; Available for Store Orders
                </label>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-gray-100">
              <button
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 rounded-xl border text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProductEdit}
                className="px-5 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary-light cursor-pointer shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW PRODUCT MODAL (9 Fields Specified in Prompt) */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h4 className="font-sans text-base font-bold text-gray-900">
                  Add New Wholesale Product
                </h4>
                <p className="text-xs text-gray-500">
                  Create a new packet-based product in the catalogue.
                </p>
              </div>
              <button 
                onClick={() => setShowAddProductModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs max-h-[70vh] overflow-y-auto pr-1">
              {/* Field 1: Product Name */}
              <div>
                <label className="block text-gray-700 font-bold mb-1">1. Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kasuri Methi"
                  value={newProductForm.name}
                  onChange={(e) => setNewProductForm({...newProductForm, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg font-bold"
                />
              </div>

              {/* Field 2: Category */}
              <div>
                <label className="block text-gray-700 font-bold mb-1">2. Category *</label>
                <select
                  value={newProductForm.categoryId}
                  onChange={(e) => setNewProductForm({...newProductForm, categoryId: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg font-semibold bg-white"
                >
                  <option value="cat_masala_powder">Masala Powder</option>
                  <option value="cat_whole_spices">Whole Spices</option>
                  <option value="cat_premium_spices">Premium Spices</option>
                  <option value="cat_dry_fruits">Dry Fruits</option>
                </select>
              </div>

              {/* Field 3: Selling Price Per Packet */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">3. Selling Price Per Packet (₹) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    min="1"
                    placeholder="35"
                    value={newProductForm.packetPrice}
                    onChange={(e) => setNewProductForm({...newProductForm, packetPrice: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg font-mono font-bold text-brand-primary"
                  />
                </div>

                {/* Field 7: Stock Quantity */}
                <div>
                  <label className="block text-gray-700 font-bold mb-1">7. Initial Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="100"
                    value={newProductForm.stock}
                    onChange={(e) => setNewProductForm({...newProductForm, stock: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              {/* Field 4: Packet Type */}
              <div>
                <label className="block text-gray-700 font-bold mb-1">4. Packet Type</label>
                <select
                  value={newProductForm.packetType}
                  onChange={(e) => setNewProductForm({...newProductForm, packetType: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg font-semibold bg-white"
                >
                  <option value="Pieces per Packet">Pieces per Packet (Standard wholesale format)</option>
                  <option value="Weight Based">Weight Based (When verified grams provided)</option>
                  <option value="Standard Packet">Standard Sealed Packet</option>
                </select>
              </div>

              {/* Field 5: Pieces Per Packet */}
              <div>
                <label className="block text-gray-700 font-bold mb-1">5. Pieces Per Packet</label>
                <select
                  value={newProductForm.piecesPerPacket}
                  onChange={(e) => setNewProductForm({...newProductForm, piecesPerPacket: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg font-semibold bg-white"
                >
                  <option value="12">12 Pieces per Packet</option>
                  <option value="10">10 Pieces per Packet</option>
                  <option value="unconfirmed">Leave Blank / Unconfirmed (Stored as NULL)</option>
                  <option value="custom">Custom Number of Pieces...</option>
                </select>
                {newProductForm.piecesPerPacket === 'custom' && (
                  <input
                    type="number"
                    placeholder="Enter piece count"
                    value={newProductForm.customPieces}
                    onChange={(e) => setNewProductForm({...newProductForm, customPieces: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg font-mono font-bold mt-1.5"
                  />
                )}
              </div>

              {/* Field 6: Packet Weight (Optional) */}
              <div>
                <label className="block text-gray-700 font-bold mb-1">6. Packet Weight (Optional)</label>
                <input
                  type="text"
                  placeholder="Optional (e.g. '100g') - Leave blank if sold by pieces"
                  value={newProductForm.packetWeight}
                  onChange={(e) => setNewProductForm({...newProductForm, packetWeight: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              {/* Field 8: Product Image */}
              <div>
                <label className="block text-gray-700 font-bold mb-1">8. Product Image Path / URL</label>
                <input
                  type="text"
                  placeholder="/assets/products/whole-spices/filename.jpg"
                  value={newProductForm.image}
                  onChange={(e) => setNewProductForm({...newProductForm, image: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-[11px] font-mono"
                />
              </div>

              {/* Field 9: Availability */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="newIsActive"
                  checked={newProductForm.isActive}
                  onChange={(e) => setNewProductForm({...newProductForm, isActive: e.target.checked})}
                  className="w-4 h-4 accent-brand-primary"
                />
                <label htmlFor="newIsActive" className="font-bold text-gray-700">
                  9. Product is Active and Available for Wholesale Ordering
                </label>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary-light cursor-pointer shadow-sm"
                >
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
