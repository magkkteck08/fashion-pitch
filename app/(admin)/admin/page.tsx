"use client";
import { useState, useEffect } from 'react';
import { Plus, ShoppingBag, Star, AlertTriangle, PackageX, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function AdminDashboard() {
  const [supabase] = useState(() => createClient());
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  
  const [counts, setCounts] = useState({ signature: 0, products: 0, outOfStock: 0 });
  const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([]);

  useEffect(() => {
    setIsMounted(true);

    async function fetchDashboardMetrics() {
      // 1. Fetch total counts
      const { count: sCount } = await supabase.from('signature_products').select('id', { count: 'exact', head: true });
      const { count: pCount } = await supabase.from('products').select('id', { count: 'exact', head: true });
      
      // 2. Fetch Low Stock & Out of Stock items from BOTH tables
      const { data: lowStockProducts } = await supabase.from('products').select('*').lte('stock_count', 2);
      const { data: lowStockSignature } = await supabase.from('signature_products').select('*').lte('stock_count', 2);
      
      const combinedAlerts = [...(lowStockProducts || []), ...(lowStockSignature || [])];
      
      // Sort so Out of Stock (0) shows at the top
      combinedAlerts.sort((a, b) => a.stock_count - b.stock_count);
      
      const outOfStockCount = combinedAlerts.filter(item => item.stock_count === 0).length;

      setCounts({
        signature: sCount || 0,
        products: pCount || 0,
        outOfStock: outOfStockCount
      });

      setLowStockAlerts(combinedAlerts);
      setLoading(false);
    }
    
    fetchDashboardMetrics();
  }, [supabase]);

  if (!isMounted) return null;

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <header className="mb-10">
        <h1 className="text-3xl font-serif text-slate-900 mb-2">STORE DASHBOARD</h1>
        <p className="text-slate-500">Live inventory and e-commerce metrics for LUXE & CO.</p>
      </header>

      {/* E-Commerce Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 border border-slate-200 rounded-sm shadow-sm flex items-center justify-between hover:border-amber-500 transition-colors">
          <div>
            <p className="text-xs text-slate-500 tracking-widest uppercase mb-1">Total Handbags</p>
            <p className="text-3xl font-serif text-slate-900">{loading ? <Loader2 size={24} className="animate-spin text-slate-300" /> : counts.products}</p>
          </div>
          <ShoppingBag className="text-amber-700 opacity-20" size={48} />
        </div>
        
        <div className="bg-white p-6 border border-slate-200 rounded-sm shadow-sm flex items-center justify-between hover:border-amber-500 transition-colors">
          <div>
            <p className="text-xs text-slate-500 tracking-widest uppercase mb-1">Premium Hair</p>
            <p className="text-3xl font-serif text-slate-900">{loading ? <Loader2 size={24} className="animate-spin text-slate-300" /> : counts.signature}</p>
          </div>
          <Star className="text-amber-700 opacity-20" size={48} />
        </div>

        <div className="bg-red-50 p-6 border border-red-200 rounded-sm shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-red-600 tracking-widest uppercase mb-1 font-bold">Sold Out Items</p>
            <p className="text-3xl font-serif text-red-700">{loading ? <Loader2 size={24} className="animate-spin text-red-300" /> : counts.outOfStock}</p>
          </div>
          <PackageX className="text-red-700 opacity-20" size={48} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Inventory Alerts Widget */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="text-amber-500" size={24} />
            <h2 className="text-lg font-serif text-slate-900">Inventory Alerts</h2>
          </div>
          
          <div className="space-y-4">
            {loading ? (
              <div className="p-4 text-center text-slate-400"><Loader2 size={20} className="animate-spin mx-auto" /></div>
            ) : lowStockAlerts.length === 0 ? (
              <div className="p-8 text-center bg-green-50 border border-green-100 rounded-sm text-green-700">
                All products are fully stocked!
              </div>
            ) : (
              lowStockAlerts.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-sm">
                  <div className="flex items-center gap-4">
                    <img src={item.image_url || "https://placehold.co/100x100"} alt="" className="w-12 h-12 rounded-sm object-cover border border-slate-200" />
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                      <p className="text-xs text-slate-500 uppercase tracking-widest">{item.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {item.stock_count === 0 ? (
                      <span className="px-3 py-1 bg-red-100 text-red-800 text-[10px] font-bold tracking-widest uppercase rounded-sm">Sold Out</span>
                    ) : (
                      <span className="px-3 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold tracking-widest uppercase rounded-sm">Only {item.stock_count} Left</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* E-Commerce Quick Actions */}
        <div className="bg-slate-900 text-white rounded-sm p-6">
          <h2 className="text-lg font-serif mb-6 text-amber-500">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/admin/products/add" className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 transition rounded-sm">
              <span className="text-sm font-bold tracking-widest uppercase">Add Catalog Item</span> <Plus size={18} />
            </Link>
            <Link href="/admin/signature/add" className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 transition rounded-sm">
              <span className="text-sm font-bold tracking-widest uppercase">Add Premium Item</span> <Plus size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}