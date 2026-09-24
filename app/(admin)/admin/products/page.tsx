'use client';
import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminProductsPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [supabase]);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProducts(data);
    }
    setLoading(false);
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      setProducts(products.filter(p => p.id !== id));
    } else {
      alert("Failed to delete product.");
    }
  };

  if (loading) return <div className="p-6 text-xs font-bold uppercase tracking-widest text-slate-400">Loading Catalog...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white min-h-screen">
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">Main Catalog</h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Manage Standard Products</p>
        </div>
        <Link href="/admin/products/new" className="bg-slate-900 text-white px-6 py-3 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-amber-700 transition shadow-sm">
          + Add Product
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-900 text-[10px] uppercase tracking-widest text-slate-400 font-bold">
              <th className="pb-4 pr-4">PRODUCT</th>
              <th className="pb-4 px-4">CATEGORY</th>
              <th className="pb-4 px-4">PRICE</th>
              <th className="pb-4 px-4">STOCK</th>
              <th className="pb-4 px-4">STATUS</th>
              <th className="pb-4 pl-4 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {products.map((product) => (
              <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                <td className="py-4 pr-4 flex items-center gap-4">
                  <img src={product.image_url || 'https://placehold.co/100'} alt={product.name} className="w-12 h-12 rounded object-cover border border-slate-200" />
                  <span className="font-bold text-slate-900 uppercase">{product.name}</span>
                </td>
                <td className="py-4 px-4 text-slate-600">{product.category}</td>
                <td className="py-4 px-4 font-mono font-medium text-slate-900">
                  ₦{Number(product.price).toLocaleString()}
                </td>
                <td className="py-4 px-4 font-mono font-medium">
                  {/* Color code stock levels for easy reading */}
                  <span className={product.stock_count > 5 ? "text-slate-900" : product.stock_count > 0 ? "text-amber-600" : "text-red-600 font-bold"}>
                    {product.stock_count}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm ${product.stock_count > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {product.stock_count > 0 ? 'Active' : 'Out of Stock'}
                  </span>
                </td>
                <td className="py-4 pl-4 text-right">
                  <button onClick={() => deleteProduct(product.id)} className="text-red-400 hover:text-red-700 transition">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="text-center py-16 text-slate-400 text-sm font-medium">No products found in the database.</div>
        )}
      </div>

    </div>
  );
}