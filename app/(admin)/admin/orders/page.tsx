'use client';
import React, { useEffect, useState, useRef } from 'react';
import { Eye, X, MapPin, Phone, Mail, Package, ShoppingBag } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function AdminOrdersPage() {
  const supabase = createClient();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Notification State
  const [showToast, setShowToast] = useState(false);
  const [newOrderData, setNewOrderData] = useState<any | null>(null);
  
  // THE BULLETPROOF TRACKERS
  const latestOrderId = useRef<string | null>(null);
  const isFirstLoad = useRef<boolean>(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      Notification.requestPermission();
    }

    let intervalId: NodeJS.Timeout;

    const fetchAndPollOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        
        // 1. Initial Page Load
        if (isFirstLoad.current) {
          latestOrderId.current = data[0].id;
          setOrders(data);
          setLoading(false);
          isFirstLoad.current = false;
          return;
        }

        // 2. Polling Check (Every 5 seconds)
        const newestOrder = data[0];

        // If the newest order in the DB doesn't match our saved ID, IT'S NEW!
        if (latestOrderId.current && newestOrder.id !== latestOrderId.current) {
          
          // Instantly update our tracker so we don't spam notifications
          latestOrderId.current = newestOrder.id;

          // Update the UI table safely
          setOrders((prev) => {
            if (prev.some(o => o.id === newestOrder.id)) return prev;
            return [newestOrder, ...prev];
          });

          // Trigger In-App Toast
          setNewOrderData(newestOrder);
          setShowToast(true);
          
          // Play Audio
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          audio.volume = 0.5;
          audio.play().catch(e => console.log('Audio blocked by browser', e));

          // Trigger OS Notification
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('🛍️ New Order Received!', {
              body: `${newestOrder.customer_name} ordered for ₦${newestOrder.total_amount?.toLocaleString()}`,
            });
          }

          setTimeout(() => setShowToast(false), 8000);
        } else {
          // If no new orders, just silently refresh the table in case statuses were updated elsewhere
          setOrders(data);
        }
      } else if (isFirstLoad.current) {
        // Handle empty database on first load
        setLoading(false);
        isFirstLoad.current = false;
      }
    };

    // Run once immediately, then loop every 5 seconds
    fetchAndPollOrders();
    intervalId = setInterval(fetchAndPollOrders, 5000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
    
    // CRITICAL FIX: Empty dependency array means this strictly sets up ONCE and never wipes its memory.
  }, []); 

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (!error) {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } else {
      alert("Failed to update status");
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'payment_confirmed': return 'bg-blue-100 text-blue-700';
      case 'processing': return 'bg-amber-100 text-amber-700';
      case 'in_transit': return 'bg-purple-100 text-purple-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (loading) return <div className="p-6 text-xs font-bold uppercase tracking-widest text-slate-400">Loading Orders...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white min-h-screen relative overflow-hidden">
      
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">Order Management</h1>
        <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Manage Fulfillments and Tracking</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-900 text-[10px] uppercase tracking-widest text-slate-900 font-bold">
              <th className="pb-4 pr-4">Order Details</th>
              <th className="pb-4 px-4">Customer</th>
              <th className="pb-4 px-4">Total Amount</th>
              <th className="pb-4 px-4">Current Status</th>
              <th className="pb-4 pl-4 text-right">Update Action</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                <td className="py-4 pr-4">
                  <div className="font-bold text-slate-900 line-clamp-1">{order.tracking_code || order.id.split('-')[0].toUpperCase()}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-mono">
                    ID: {order.id.substring(0, 8)}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="font-medium text-slate-900">{order.customer_name}</div>
                  <button 
                    onClick={() => setSelectedOrder(order)}
                    className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-amber-700 hover:text-slate-900 mt-1 transition"
                  >
                    <Eye size={12} /> View Details
                  </button>
                </td>
                <td className="py-4 px-4 font-mono font-medium text-slate-900">
                  ₦{Number(order.total_amount).toLocaleString()}
                </td>
                <td className="py-4 px-4">
                  <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm ${getStatusColor(order.status)}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-4 pl-4 text-right">
                  <select 
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    className="text-[10px] font-bold uppercase tracking-widest border border-slate-200 rounded p-2 text-slate-700 focus:outline-none focus:border-amber-700 bg-white cursor-pointer"
                  >
                    <option value="payment_confirmed">Payment Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="in_transit">In Transit</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="text-center py-16 text-slate-400 text-sm font-medium">No orders found in the database.</div>
        )}
      </div>

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
              <div>
                <h2 className="text-xl font-serif text-slate-900 font-bold">Order Details</h2>
                <p className="text-[10px] text-amber-700 uppercase tracking-widest font-mono mt-1">{selectedOrder.tracking_code}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-900 transition"><X size={20} /></button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Customer Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-slate-700">
                      <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-500 shrink-0"><ShoppingBag size={14}/></div>
                      <span className="font-bold">{selectedOrder.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-700">
                      <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-500 shrink-0"><Mail size={14}/></div>
                      <span>{selectedOrder.customer_email || 'No email provided'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-700">
                      <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-500 shrink-0"><Phone size={14}/></div>
                      <span>{selectedOrder.customer_phone || 'No phone provided'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Delivery Address</h3>
                  <div className="flex items-start gap-3 text-sm text-slate-700 bg-slate-50 p-4 rounded border border-slate-100">
                    <MapPin size={16} className="text-amber-700 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">{selectedOrder.delivery_address || 'No address provided'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                  <Package size={14} /> Purchased Items
                </h3>
                <div className="border border-slate-200 rounded-md overflow-hidden">
                  {(!selectedOrder.items || (Array.isArray(selectedOrder.items) && selectedOrder.items.length === 0)) ? (
                    <div className="p-4 text-center text-sm text-slate-500">No specific items logged for this order.</div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {(Array.isArray(selectedOrder.items) ? selectedOrder.items : JSON.parse(selectedOrder.items)).map((item: any, idx: number) => (
                        <div key={idx} className="flex gap-4 p-4 items-center bg-white">
                          {item.image && <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded border border-slate-200" />}
                          <div className="flex-1">
                            <p className="font-bold text-sm text-slate-900">{item.name}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                              Color: {item.color} | Size: {item.size}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm text-slate-900 font-mono">₦{Number(item.price).toLocaleString()}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="bg-slate-50 p-4 flex justify-between items-center border-t border-slate-200">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Grand Total</span>
                    <span className="text-lg font-bold text-amber-700 font-mono">₦{Number(selectedOrder.total_amount).toLocaleString()}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* IN-APP REALTIME NOTIFICATION TOAST */}
      <div className={`fixed bottom-6 right-6 z-50 transition-all duration-500 transform ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        {newOrderData && (
          <div className="bg-slate-900 border-l-4 border-amber-500 text-white p-4 rounded shadow-2xl flex items-start gap-4 min-w-[300px]">
            <div className="bg-amber-500/20 p-2 rounded text-amber-500 mt-1">
              <Package size={20} />
            </div>
            <div className="flex-1">
              <h4 className="text-[10px] uppercase tracking-widest font-bold text-amber-500 mb-1">New Order Received</h4>
              <p className="font-bold text-sm">{newOrderData.customer_name}</p>
              <p className="text-xs text-slate-400 font-mono mt-1">₦{Number(newOrderData.total_amount).toLocaleString()}</p>
              <button 
                onClick={() => { setSelectedOrder(newOrderData); setShowToast(false); }}
                className="mt-3 text-[10px] font-bold uppercase tracking-widest border border-slate-700 px-3 py-1.5 rounded hover:bg-slate-800 transition w-full"
              >
                View Details
              </button>
            </div>
            <button onClick={() => setShowToast(false)} className="text-slate-500 hover:text-white"><X size={16}/></button>
          </div>
        )}
      </div>

    </div>
  );
}