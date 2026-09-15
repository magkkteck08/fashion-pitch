"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Plus, Trash2, Scissors } from 'lucide-react';
import Link from 'next/link';

export default function AdminSignatureStyles() {
  const [styles, setStyles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Wrapped in useState to prevent Vercel build crashes
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    fetchStyles();
  }, []);

  async function fetchStyles() {
    const { data } = await supabase.from('signature_products').select('*').order('created_at', { ascending: false });
    if (data) setStyles(data);
    setLoading(false);
  }

  async function deleteStyle(id: string) {
    if (!confirm("Are you sure you want to delete this signature style?")) return;
    await supabase.from('signature_products').delete().eq('id', id);
    fetchStyles();
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-serif text-slate-900 mb-2">Signature Styles</h1>
          <p className="text-slate-500">Manage your premium hair braiding services.</p>
        </div>
        <Link href="/admin/signature/add" className="bg-slate-900 text-white px-6 py-3 flex items-center gap-2 rounded-sm hover:bg-slate-800 transition">
          <Plus size={18} /> Add Style
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-sm">
        {/* Mobile scroll wrapper */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm tracking-widest uppercase text-slate-500">
                <th className="p-4 font-medium">Style</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading styles...</td></tr>
              ) : styles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500">
                    <Scissors className="mx-auto text-slate-300 mb-3" size={32} />
                    No signature styles found. Add one to get started.
                  </td>
                </tr>
              ) : (
                styles.map((style) => (
                  <tr key={style.id} className="hover:bg-slate-50 transition group">
                    <td className="p-4 flex items-center gap-4">
                      <img src={style.image_url || "https://placehold.co/100x125"} alt="" className="w-10 h-12 rounded-sm object-cover border border-slate-200" />
                      <span className="font-medium text-slate-900">{style.name}</span>
                    </td>
                    <td className="p-4 text-slate-600">{style.category}</td>
                    <td className="p-4 text-slate-600">₦{style.price?.toLocaleString()}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">{style.status}</span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => deleteStyle(style.id)} className="text-red-500 hover:text-red-700 p-2 bg-red-50 rounded-sm">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}