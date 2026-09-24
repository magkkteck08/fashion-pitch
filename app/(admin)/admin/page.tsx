'use client';
import React, { useEffect, useState } from 'react';
import { ShoppingBag, XCircle, Package, Plus } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

export default function AdminRootDashboard() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalAmountSold: 0,
    inventoryValue: 0,
    ordersReceived: 0,
    ordersCancelled: 0,
  });

  useEffect(() => {
    async function fetchDashboardData() {
      // 1. Fetch Orders
      const { data: orders } = await supabase.from('orders').select('total_amount, status');
      
      let sold = 0;
      let received = 0;
      let cancelled = 0;

      if (orders) {
        orders.forEach(order => {
          received += 1;
          
          if (order.status === 'cancelled') {
            cancelled += 1;
          } else {
            // Only add to Total Amount Sold if the order is NOT cancelled
            sold += Number(order.total_amount || 0);
          }
        });
      }

      // 2. Fetch Total Goods in Store (Price × Stock Count)
      // Now fetching both the price and the actual stock count for accurate valuation
      const { data: mainProducts } = await supabase.from('products').select('price, stock_count');
      const { data: premiumProducts } = await supabase.from('signature_products').select('price, stock_count');
      
      let inventoryTotal = 0;
      
      if (mainProducts) {
        mainProducts.forEach(p => {
          // Multiply price by the amount of stock currently held
          inventoryTotal += Number(p.price || 0) * Number(p.stock_count || 0);
        });
      }
      
      if (premiumProducts) {
        premiumProducts.forEach(p => {
          inventoryTotal += Number(p.price || 0) * Number(p.stock_count || 0);
        });
      }

      setMetrics({
        totalAmountSold: sold,
        inventoryValue: inventoryTotal,
        ordersReceived: received,
        ordersCancelled: cancelled
      });
      
      setLoading(false);
    }

    fetchDashboardData();
  }, [supabase]);

  if (loading) return <div className="p-6 text-xs font-bold uppercase tracking-widest text-slate-400">Loading Store Metrics...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-[85vh] mt-6 border border-slate-200">
      
      {/* Header & Quick Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">Store Overview</h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Live Database Metrics</p>
        </div>
        
        <div className="flex gap-3">
          <Link href="/admin/products?action=add" className="bg-white text-slate-900 border border-slate-200 px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest hover:border-slate-400 transition shadow-sm flex items-center gap-1">
            <Plus size={14} /> Main Catalog
          </Link>
          <Link href="/admin/signature?action=add" className="bg-slate-900 text-white px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-amber-700 transition shadow-sm flex items-center gap-1">
            <Plus size={14} /> Premium Line
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Box 1: Total Amount Sold */}
        <div className="bg-white p-6 border border-slate-200 rounded-lg shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center text-slate-900 font-bold text-lg">
              #
            </div>
            <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-1 rounded uppercase tracking-widest">Revenue</span>
          </div>
          <p className="text-xs text-slate-500 uppercase tracking-widest">Total Amount Sold</p>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">
            #{metrics.totalAmountSold.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
        </div>

        {/* Box 2: Total Goods in Store */}
        <div className="bg-slate-900 p-6 border border-slate-800 rounded-lg shadow-md text-white transition transform hover:-translate-y-1">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-slate-800 rounded flex items-center justify-center text-amber-500">
              <Package size={20} />
            </div>
          </div>
          <p className="text-xs text-slate-400 uppercase tracking-widest">Total Goods in Store</p>
          <h2 className="text-2xl font-bold text-white mt-1">
            #{metrics.inventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
        </div>

        {/* Box 3: Total Orders Received */}
        <div className="bg-white p-6 border border-slate-200 rounded-lg shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center text-slate-900">
              <ShoppingBag size={20} />
            </div>
          </div>
          <p className="text-xs text-slate-500 uppercase tracking-widest">Orders Received</p>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">{metrics.ordersReceived}</h2>
        </div>

        {/* Box 4: Total Orders Cancelled */}
        <div className="bg-white p-6 border border-slate-200 rounded-lg shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-red-50 rounded flex items-center justify-center text-red-600">
              <XCircle size={20} />
            </div>
          </div>
          <p className="text-xs text-slate-500 uppercase tracking-widest">Orders Cancelled</p>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">{metrics.ordersCancelled}</h2>
        </div>

      </div>
    </div>
  );
}