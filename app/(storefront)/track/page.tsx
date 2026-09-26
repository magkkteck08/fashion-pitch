'use client';
import React, { useState } from 'react';
import { Search, Package, Truck, CheckCircle, CreditCard, MapPin } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function OrderTracking() {
  const supabase = createClient();
  const [trackingCode, setTrackingCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingCode.trim()) return;
    
    setLoading(true);
    setError(null);
    setOrderStatus(null);
    
    const cleanInput = trackingCode.trim().toUpperCase();

    try {
      // 1. Simply query the tracking_code column directly!
      const { data, error: dbError } = await supabase
        .from('orders')
        .select('status')
        .eq('tracking_code', cleanInput)
        .single();
      
      if (dbError || !data) {
        setError('Order number not found. Please check and try again.');
      } else {
        setOrderStatus(data.status);
      }
    } catch (err) {
      setError('Could not fetch order details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to determine how far the progress bar should fill
  const getProgressWidth = () => {
    switch(orderStatus) {
      case 'pending': return 'w-[10%]'; // Shows a little movement while waiting for payment
      case 'payment_confirmed': return 'w-[33%]';
      case 'processing': return 'w-[66%]';
      case 'in_transit': return 'w-[90%]';
      case 'completed': return 'w-full';
      default: return 'w-0';
    }
  };

  const getStatusMessage = () => {
    switch(orderStatus) {
      case 'pending': return 'Your order has been recorded. We are awaiting/verifying your manual payment via WhatsApp.';
      case 'payment_confirmed': return 'We have received your payment. Your order will begin processing shortly.';
      case 'processing': return 'Your items are being packed and prepared for shipment.';
      case 'in_transit': return 'Your package has left our facility and is on its way to you.';
      case 'completed': return 'Your package has been delivered successfully. Enjoy your luxury items!';
      case 'cancelled': return 'This order has been cancelled.';
      default: return 'Order is pending confirmation.';
    }
  };

  return (
    <div className="min-h-[70vh] bg-slate-50 flex flex-col items-center py-20 px-4">
      <div className="max-w-2xl w-full space-y-8">
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-serif font-bold text-slate-900">Track Your Order</h1>
          <p className="text-sm text-slate-500">Enter your order number (e.g., ORD-10E6CD) or tracking code.</p>
        </div>

        <form onSubmit={handleTrack} className="flex gap-2 max-w-xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
              placeholder="e.g. ORD-10E6CD"
              className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-md focus:outline-none focus:border-slate-900 font-mono text-sm uppercase shadow-sm"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading || !trackingCode}
            className="bg-slate-900 text-white px-8 py-4 rounded-md font-bold uppercase tracking-widest text-xs hover:bg-amber-700 transition disabled:opacity-50 shadow-md"
          >
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>

        {error && <p className="text-red-500 text-sm text-center font-bold animate-in fade-in">{error}</p>}

        {orderStatus && (
          <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-sm mt-8 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-sm font-bold text-slate-900 mb-12 border-b border-slate-100 pb-4">
              Status for <span className="text-amber-700 font-mono">{trackingCode}</span>
            </h3>

            {orderStatus === 'cancelled' ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">X</span>
                </div>
                <h4 className="text-lg font-bold text-slate-900 uppercase tracking-widest">Order Cancelled</h4>
              </div>
            ) : (
              <div className="relative flex justify-between items-center w-full max-w-lg mx-auto">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 -z-10"></div>
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-amber-700 transition-all duration-1000 ease-out -z-10 ${getProgressWidth()}`}></div>

                {/* Step 1: Payment Confirmed */}
                <div className="flex flex-col items-center gap-3 bg-white px-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-500 ${orderStatus === 'payment_confirmed' || orderStatus === 'processing' || orderStatus === 'in_transit' || orderStatus === 'completed' ? 'border-amber-700 bg-amber-700 text-white' : 'border-slate-200 bg-white text-slate-300'}`}>
                    <CreditCard size={18} />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-600 tracking-widest text-center w-20">Payment Verified</span>
                </div>

                {/* Step 2: Processing */}
                <div className="flex flex-col items-center gap-3 bg-white px-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-500 ${orderStatus === 'processing' || orderStatus === 'in_transit' || orderStatus === 'completed' ? 'border-amber-700 bg-amber-700 text-white' : 'border-slate-200 bg-white text-slate-300'}`}>
                    <Package size={18} />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-600 tracking-widest text-center w-20">Processing</span>
                </div>

                {/* Step 3: In Transit */}
                <div className="flex flex-col items-center gap-3 bg-white px-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-500 ${orderStatus === 'in_transit' || orderStatus === 'completed' ? 'border-amber-700 bg-amber-700 text-white' : 'border-slate-200 bg-white text-slate-300'}`}>
                    <Truck size={18} />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-600 tracking-widest text-center w-20">In Transit</span>
                </div>

                {/* Step 4: Completed */}
                <div className="flex flex-col items-center gap-3 bg-white px-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-500 ${orderStatus === 'completed' ? 'border-amber-700 bg-amber-700 text-white' : 'border-slate-200 bg-white text-slate-300'}`}>
                    <CheckCircle size={18} />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-600 tracking-widest text-center w-20">Completed</span>
                </div>
              </div>
            )}

            <div className="mt-12 bg-slate-50 p-4 rounded-md flex items-start gap-3">
              <MapPin size={16} className="text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-900">Latest Update</p>
                <p className="text-xs text-slate-500 mt-1">{getStatusMessage()}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}