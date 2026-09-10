"use client";
import { useState, useEffect } from 'react';
import { Plus, ShoppingBag, Calendar, ImageIcon, MessageSquare, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function AdminDashboard() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ products: 0, events: 0, gallery: 0, enquiries: 0 });
  const [recentEnquiries, setRecentEnquiries] = useState<any[]>([]);

  useEffect(() => {
    async function fetchDashboardMetrics() {
      // Fetch exact row counts efficiently
      const { count: pCount } = await supabase.from('products').select('id', { count: 'exact', head: true });
      const { count: eCount } = await supabase.from('events').select('id', { count: 'exact', head: true });
      const { count: gCount } = await supabase.from('gallery').select('id', { count: 'exact', head: true });
      
      // Fetch recent enquiries (handling potential errors if empty)
      const { data: enqData, count: enqCount, error: enqError } = await supabase
        .from('enquiries')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(3);

      setCounts({
        products: pCount || 0,
        events: eCount || 0,
        gallery: gCount || 0,
        enquiries: enqCount || 0
      });

      if (enqData && !enqError) setRecentEnquiries(enqData);
      setLoading(false);
    }
    
    fetchDashboardMetrics();
  }, []);

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <header className="mb-10">
        <h1 className="text-3xl font-serif text-slate-900 mb-2">GOOD MORNING, JUPILO 👋</h1>
        <p className="text-slate-500">Here's what's happening with your brand today.</p>
      </header>

      {/* Dynamic Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: "PRODUCTS", count: counts.products, icon: ShoppingBag },
          { label: "EVENTS", count: counts.events, icon: Calendar },
          { label: "GALLERY", count: counts.gallery, icon: ImageIcon },
          { label: "ENQUIRIES", count: counts.enquiries, icon: MessageSquare }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 border border-slate-200 rounded-sm shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <stat.icon className="text-amber-700" size={24} />
            </div>
            <p className="text-3xl font-serif text-slate-900">
              {loading ? <Loader2 size={24} className="animate-spin text-slate-300" /> : stat.count}
            </p>
            <p className="text-xs text-slate-500 tracking-widest uppercase mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Dynamic Recent Enquiries */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-sm p-6">
          <h2 className="text-lg font-serif mb-6">Recent Enquiries</h2>
          <div className="space-y-4">
            {loading ? (
              <div className="p-4 text-center text-slate-400"><Loader2 size={20} className="animate-spin mx-auto" /></div>
            ) : recentEnquiries.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-slate-100 rounded-sm text-slate-500">
                No recent enquiries yet.
              </div>
            ) : (
              recentEnquiries.map((enquiry) => (
                <div key={enquiry.id} className="flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-sm">
                  <div>
                    <p className="font-medium text-slate-900">{enquiry.name}</p>
                    <p className="text-sm text-slate-500 line-clamp-1">{enquiry.message}</p>
                  </div>
                  <span className="text-xs text-slate-400 ml-4 whitespace-nowrap">
                    {new Date(enquiry.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-900 text-white rounded-sm p-6">
          <h2 className="text-lg font-serif mb-6 text-amber-500">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/admin/products/add" className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 transition rounded-sm">
              <span>Add Product</span> <Plus size={18} />
            </Link>
            <Link href="/admin/events/add" className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 transition rounded-sm">
              <span>Add Event</span> <Plus size={18} />
            </Link>
            <Link href="/admin/gallery" className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 transition rounded-sm">
              <span>Upload Gallery</span> <Plus size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}