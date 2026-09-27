'use client';
import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Search, Package, Clock, Truck, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function OrderTracking() {
  const supabase = createClient();
  const [trackingCode, setTrackingCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [fulfillments, setFulfillments] = useState<any[]>([]);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingCode.trim()) return;
    
    setLoading(true);
    setError('');
    setOrder(null);
    setFulfillments([]);

    const { data: orderData, error: orderErr } = await supabase
      .from('orders')
      .select('*')
      .ilike('tracking_code', trackingCode.trim())
      .single();

    if (orderErr || !orderData) {
      setError("We couldn't find an order with that tracking code. Please double-check and try again.");
      setLoading(false);
      return;
    }

    setOrder(orderData);

    const { data: fulfillmentData } = await supabase
      .from('order_fulfillments')
      .select('*, verified_vendors(vendor_name)')
      .eq('order_id', orderData.id);

    if (fulfillmentData) {
      setFulfillments(fulfillmentData);
    }

    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Clock className="text-amber-500" size={24} />;
      case 'payment_confirmed': return <CheckCircle className="text-emerald-500" size={24} />;
      case 'processing': return <Package className="text-blue-500" size={24} />;
      case 'shipped': return <Truck className="text-indigo-500" size={24} />;
      case 'delivered': return <CheckCircle className="text-green-500" size={24} />;
      default: return <Clock className="text-slate-400" size={24} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center pt-24 pb-16 px-6">
      <div className="w-full max-w-2xl mb-8">
        <Link href="/" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-amber-700 transition flex items-center gap-2 mb-8">
          <ArrowRight className="rotate-180" size={14} /> Back to Store
        </Link>
        <h1 className="text-3xl md:text-5xl font-serif text-slate-900 mb-4 text-center">Track Your Order</h1>
        <p className="text-slate-500 text-sm text-center mb-10 max-w-md mx-auto">Enter the tracking code provided on your checkout receipt or confirmation message to view your shipment status.</p>

        <form onSubmit={handleTrack} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
              placeholder="e.g. ORD-1A2B3C" 
              className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-sm shadow-sm focus:border-amber-500 outline-none transition text-slate-900 font-mono font-bold tracking-wider uppercase"
            />
          </div>
          <button type="submit" disabled={loading} className="bg-slate-900 text-white px-8 py-4 rounded-sm font-bold uppercase tracking-widest text-xs hover:bg-amber-700 transition disabled:bg-slate-300">
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-sm mt-6 text-sm text-center border border-red-100">
            {error}
          </div>
        )}
      </div>

      {order && (
        <div className="w-full max-w-2xl bg-white border border-slate-200 shadow-xl rounded-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-8 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Order Confirmed For</p>
              <h2 className="text-xl font-bold text-slate-900">{order.customer_name}</h2>
              <p className="text-sm text-slate-500 mt-1">{order.delivery_address}</p>
            </div>
            <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-sm border border-slate-200 shadow-sm">
              {getStatusIcon(order.status)}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Master Status</p>
                <p className="font-bold text-slate-900 capitalize text-lg">{order.status.replace('_', ' ')}</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6">Fulfillment Packages</h3>
            
            {fulfillments.length === 0 ? (
              <p className="text-sm text-slate-500 italic">Order details are still processing. Check back soon.</p>
            ) : (
              <div className="space-y-6">
                {fulfillments.map((ticket, idx) => (
                  <div key={ticket.id} className="border border-slate-100 rounded-sm p-6 relative">
                    <div className="absolute -top-3 left-6 bg-white px-2 text-[10px] font-bold uppercase tracking-widest text-amber-700">
                      Package {idx + 1} • {ticket.verified_vendors?.vendor_name || 'MAGKK In-House'}
                    </div>
                    
                    <div className="flex justify-between items-center mb-6">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm ${
                        ticket.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                        ticket.status === 'payment_confirmed' ? 'bg-emerald-100 text-emerald-700' :
                        ticket.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                        ticket.status === 'shipped' ? 'bg-indigo-100 text-indigo-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="space-y-4">
                      {(ticket.items || []).map((item: any, itemIdx: number) => (
                        <div key={itemIdx} className="flex gap-4 items-center">
                          <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-sm border border-slate-200" />
                          <div>
                            <p className="font-bold text-sm text-slate-900 line-clamp-1">{item.name} (x{item.quantity})</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Color: {item.color} | Size: {item.size}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}