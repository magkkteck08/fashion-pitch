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

  const getProgressWidth = () => {
    switch(orderStatus) {
      case 'pending': return 'w-[10%]';
      case 'payment_confirmed': return 'w-[33%]';
      case 'processing': return 'w-[66%]';
      case 'in_transit': return 'w-[90%]';
      case 'completed': return 'w-full';
      default: return 'w-0';
    }
  };

  // Emojis added directly to the phrases here
  const getStatusMessage = () => {
    switch(orderStatus) {
      case 'pending': return '⏳ Your order has been recorded. We are awaiting/verifying your manual payment via WhatsApp.';
      case 'payment_confirmed': return '💳 We have received your payment. Your order will begin processing shortly.';
      case 'processing': return '📦 Your items are being packed and prepared for shipment.';
      case 'in_transit': return '🚚 Your package has left our facility and is on its way to you.';
      case 'completed': return '✨ Your package has been delivered successfully. Enjoy your luxury items!';
      case 'cancelled': return '❌ This order has been cancelled.';
      default: return 'Order is pending confirmation.';
    }
  };

  return (
    <div className="min-h-[70vh] bg-slate-50 flex flex-col items-center py-10 md:py-20 px-4">
      <div className="max-w-2xl w-full space-y-6 md:space-y-8">
        
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900">Track Your Order</h1>
          <p className="text-xs md:text-sm text-slate-500">Enter your order number (e.g., ORD-10E6CD) or tracking code.</p>
        </div>

        {/* Stacked form for mobile, side-by-side for desktop */}
        <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-2 max-w-xl mx-auto w-full">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
              placeholder="e.g. ORD-10E6CD"
              className="w-full pl-11 pr-4 py-3 md:py-4 bg-white border border-slate-200 rounded-md focus:outline-none focus:border-slate-900 font-mono text-sm uppercase shadow-sm"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading || !trackingCode}
            className="bg-slate-900 text-white px-8 py-3 md:py-4 rounded-md font-bold uppercase tracking-widest text-xs hover:bg-amber-700 transition disabled:opacity-50 shadow-md w-full md:w-auto"
          >
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>

        {error && <p className="text-red-500 text-xs md:text-sm text-center font-bold animate-in fade-in">{error}</p>}

        {orderStatus && (
          <div className="bg-white border border-slate-200 rounded-lg p-4 md:p-8 shadow-sm mt-4 md:mt-8 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-xs md:text-sm font-bold text-slate-900 mb-8 md:mb-12 border-b border-slate-100 pb-3 md:pb-4 text-center md:text-left">
              Status for <span className="text-amber-700 font-mono">{trackingCode}</span>
            </h3>

            {orderStatus === 'cancelled' ? (
              <div className="text-center py-6 md:py-8">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <span className="text-xl md:text-2xl font-bold">X</span>
                </div>
                <h4 className="text-base md:text-lg font-bold text-slate-900 uppercase tracking-widest">Order Cancelled</h4>
              </div>
            ) : (
              <div className="relative flex justify-between items-center w-full max-w-lg mx-auto">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 -z-10"></div>
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-amber-700 transition-all duration-1000 ease-out -z-10 ${getProgressWidth()}`}></div>

                {/* Step 1: Payment Confirmed */}
                <div className="flex flex-col items-center gap-2 md:gap-3 bg-white px-1 md:px-2">
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-500 ${orderStatus === 'payment_confirmed' || orderStatus === 'processing' || orderStatus === 'in_transit' || orderStatus === 'completed' ? 'border-amber-700 bg-amber-700 text-white' : 'border-slate-200 bg-white text-slate-300'}`}>
                    <CreditCard className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <span className="text-[7px] md:text-[10px] uppercase font-bold text-slate-600 tracking-wider md:tracking-widest text-center w-16 md:w-20 leading-tight md:leading-normal">Payment Verified</span>
                </div>

                {/* Step 2: Processing */}
                <div className="flex flex-col items-center gap-2 md:gap-3 bg-white px-1 md:px-2">
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-500 ${orderStatus === 'processing' || orderStatus === 'in_transit' || orderStatus === 'completed' ? 'border-amber-700 bg-amber-700 text-white' : 'border-slate-200 bg-white text-slate-300'}`}>
                    <Package className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <span className="text-[7px] md:text-[10px] uppercase font-bold text-slate-600 tracking-wider md:tracking-widest text-center w-16 md:w-20 leading-tight md:leading-normal">Processing</span>
                </div>

                {/* Step 3: In Transit */}
                <div className="flex flex-col items-center gap-2 md:gap-3 bg-white px-1 md:px-2">
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-500 ${orderStatus === 'in_transit' || orderStatus === 'completed' ? 'border-amber-700 bg-amber-700 text-white' : 'border-slate-200 bg-white text-slate-300'}`}>
                    <Truck className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <span className="text-[7px] md:text-[10px] uppercase font-bold text-slate-600 tracking-wider md:tracking-widest text-center w-16 md:w-20 leading-tight md:leading-normal">In Transit</span>
                </div>

                {/* Step 4: Completed */}
                <div className="flex flex-col items-center gap-2 md:gap-3 bg-white px-1 md:px-2">
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-500 ${orderStatus === 'completed' ? 'border-amber-700 bg-amber-700 text-white' : 'border-slate-200 bg-white text-slate-300'}`}>
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <span className="text-[7px] md:text-[10px] uppercase font-bold text-slate-600 tracking-wider md:tracking-widest text-center w-16 md:w-20 leading-tight md:leading-normal">Completed</span>
                </div>
              </div>
            )}

            <div className="mt-8 md:mt-12 bg-slate-50 p-3 md:p-4 rounded-md flex items-start gap-2 md:gap-3">
              <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs md:text-sm font-medium text-slate-900">Latest Update</p>
                <p className="text-[11px] md:text-xs text-slate-500 mt-1 leading-relaxed">{getStatusMessage()}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}