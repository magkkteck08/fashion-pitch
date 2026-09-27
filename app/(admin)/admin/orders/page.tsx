'use client';
import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Package, Eye, X, Clock, CheckCircle, Truck } from 'lucide-react';

export default function AdminOrdersPage() {
  const supabase = createClient();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [fulfillments, setFulfillments] = useState<any[]>([]);
  const [loadingFulfillments, setLoadingFulfillments] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [supabase]);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setOrders(data);
    setLoading(false);
  };

  const viewOrderDetails = async (order: any) => {
    setSelectedOrder(order);
    setLoadingFulfillments(true);

    const { data, error } = await supabase
      .from('order_fulfillments')
      .select(`
        *,
        verified_vendors ( vendor_name )
      `)
      .eq('order_id', order.id);

    if (!error && data) setFulfillments(data);
    setLoadingFulfillments(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    // 1. Update the Master Order Status
    const { error: orderError } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    
    if (!orderError) {
      // 2. Automatically update ALL related Vendor Fulfillments to match the new status
      await supabase.from('order_fulfillments').update({ status: newStatus }).eq('order_id', orderId);

      // 3. Update the UI state instantly
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
        setFulfillments(fulfillments.map(f => ({ ...f, status: newStatus })));
      }
    }
  };

  if (loading) return <div className="p-6 text-xs font-bold uppercase tracking-widest text-slate-400">Loading Orders...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto bg-slate-50 min-h-screen relative">
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">Order Management</h1>
        <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Track customer orders and vendor fulfillments</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
              <th className="py-4 px-6">Tracking Code</th>
              <th className="py-4 px-6">Customer</th>
              <th className="py-4 px-6">Total Amount</th>
              <th className="py-4 px-6">Date</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-slate-100 hover:bg-amber-50/50 transition">
                <td className="py-4 px-6 font-mono font-bold text-slate-900">{order.tracking_code}</td>
                <td className="py-4 px-6">
                  <p className="font-bold text-slate-900">{order.customer_name}</p>
                  <p className="text-[10px] text-slate-500">{order.customer_phone}</p>
                </td>
                <td className="py-4 px-6 font-medium text-amber-700">₦{Number(order.total_amount).toLocaleString()}</td>
                <td className="py-4 px-6 text-slate-500">{new Date(order.created_at).toLocaleDateString()}</td>
                <td className="py-4 px-6">
                  <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm ${
                    order.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                    order.status === 'payment_confirmed' ? 'bg-emerald-100 text-emerald-700' :
                    order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                    order.status === 'shipped' ? 'bg-indigo-100 text-indigo-700' : 
                    'bg-green-100 text-green-700'
                  }`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <button onClick={() => viewOrderDetails(order)} className="text-[10px] font-bold uppercase tracking-widest bg-slate-900 text-white px-4 py-2 rounded-sm hover:bg-amber-700 transition inline-flex items-center gap-2">
                    <Eye size={14} /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <div className="text-center py-16 text-slate-400 text-sm">No orders found.</div>}
      </div>

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}></div>
          <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-sm shadow-2xl flex flex-col">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
              <div>
                <h2 className="text-xl font-serif text-slate-900 flex items-center gap-3">
                  Order {selectedOrder.tracking_code}
                </h2>
                <p className="text-xs text-slate-500 mt-1">{new Date(selectedOrder.created_at).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-slate-200 rounded-full transition"><X size={20} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50 grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="md:col-span-1 space-y-6">
                <div className="bg-white p-5 border border-slate-200 rounded-sm shadow-sm">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 pb-2">Customer Details</h3>
                  <p className="font-bold text-slate-900 text-sm mb-1">{selectedOrder.customer_name}</p>
                  <p className="text-sm text-slate-600 mb-1">{selectedOrder.customer_phone}</p>
                  <p className="text-sm text-slate-600 mb-4">{selectedOrder.customer_email}</p>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Delivery Address</h4>
                  <p className="text-sm text-slate-700 leading-relaxed">{selectedOrder.delivery_address}</p>
                </div>

                <div className="bg-white p-5 border border-slate-200 rounded-sm shadow-sm">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 pb-2">Master Status</h3>
                  <select 
                    value={selectedOrder.status} 
                    onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                    className="w-full border border-slate-200 p-2 text-sm rounded-sm focus:border-amber-500 outline-none transition mb-4"
                  >
                    <option value="pending">Pending Payment</option>
                    <option value="payment_confirmed">Payment Confirmed</option>
                    <option value="processing">Processing Order</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                  <div className="flex justify-between items-center text-sm border-t border-slate-100 pt-3">
                    <span className="text-slate-500 font-bold">Grand Total</span>
                    <span className="text-amber-700 font-bold text-lg">₦{Number(selectedOrder.total_amount).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Vendor Fulfillments</h3>
                
                {loadingFulfillments ? (
                  <div className="p-8 text-center text-slate-400 text-xs uppercase tracking-widest">Loading Tickets...</div>
                ) : (
                  fulfillments.map((ticket) => (
                    <div key={ticket.id} className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
                      <div className="bg-slate-900 text-white px-5 py-3 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Package size={16} className="text-amber-500" />
                          <span className="text-xs font-bold uppercase tracking-widest">
                            {ticket.verified_vendors?.vendor_name || 'In-House Warehouse'}
                          </span>
                        </div>
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm ${
                          ticket.status === 'pending' ? 'bg-white/20 text-white' : 
                          ticket.status === 'payment_confirmed' ? 'bg-emerald-500 text-white' :
                          ticket.status === 'processing' ? 'bg-blue-500 text-white' :
                          ticket.status === 'shipped' ? 'bg-indigo-500 text-white' : 
                          'bg-green-500 text-white'
                        }`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="p-5">
                        <div className="space-y-3 mb-4">
                          {(ticket.items || []).map((item: any, idx: number) => (
                            <div key={idx} className="flex gap-4 items-center bg-slate-50 p-3 rounded-sm border border-slate-100">
                              <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-sm border border-slate-200" />
                              <div className="flex-1">
                                <p className="font-bold text-sm text-slate-900 line-clamp-1">{item.name}</p>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Color: {item.color} | Size: {item.size}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-bold text-slate-900">Qty: {item.quantity}</p>
                                <p className="text-xs text-amber-700 font-bold mt-1">₦{(item.price * item.quantity).toLocaleString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex justify-between items-center text-sm pt-4 border-t border-slate-100">
                          <span className="text-slate-500">Delivery Fee Allocated: ₦{Number(ticket.vendor_delivery_fee).toLocaleString()}</span>
                          <span className="font-bold text-slate-900">Vendor Subtotal: ₦{Number(ticket.vendor_subtotal).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}