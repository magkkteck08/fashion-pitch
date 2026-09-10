"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Plus, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  }

  async function deleteProduct(id: string) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    await supabase.from('products').delete().eq('id', id);
    fetchProducts();
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-serif text-slate-900 mb-2">Products</h1>
          <p className="text-slate-500">Manage your catalogue and inventory.</p>
        </div>
        <Link href="/admin/products/add" className="bg-slate-900 text-white px-6 py-3 flex items-center gap-2 rounded-sm hover:bg-slate-800 transition">
          <Plus size={18} /> Add Product
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-sm tracking-widest uppercase text-slate-500">
              <th className="p-4 font-medium">Product</th>
              <th className="p-4 font-medium">Category</th>
              <th className="p-4 font-medium">Price</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading products...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-slate-500">No products found. Add one to get started.</td></tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 transition group">
                  <td className="p-4 flex items-center gap-4">
                    <img src={product.image_url || "https://placehold.co/100x100"} alt="" className="w-12 h-12 rounded-sm object-cover border border-slate-200" />
                    <span className="font-medium text-slate-900">{product.name}</span>
                  </td>
                  <td className="p-4 text-slate-600">{product.category}</td>
                  <td className="p-4 text-slate-600">₦{product.price?.toLocaleString()}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">{product.status}</span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => deleteProduct(product.id)} className="text-red-500 hover:text-red-700 p-2 bg-red-50 rounded-sm">
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
  );
}