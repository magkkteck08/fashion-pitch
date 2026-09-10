"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import ImageUpload from '@/components/ImageUpload';
import { ArrowLeft, Loader2, X } from 'lucide-react';
import Link from 'next/link';

export default function AddProduct() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  
  // Explicit 3 slots to prevent state overwriting
  const [image1, setImage1] = useState<string>(''); // Main Cover
  const [image2, setImage2] = useState<string>(''); // Angle 1
  const [image3, setImage3] = useState<string>(''); // Angle 2
  
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', category: 'Ready-To-Wear', status: 'Available'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const additionalImages = [image2, image3].filter(Boolean); // Only saves slots that have URLs

    const newProduct = {
      name: formData.name, 
      slug: slug, 
      description: formData.description,
      price: parseFloat(formData.price) || 0,
      category: formData.category, 
      status: formData.status, 
      image_url: image1,
      additional_images: additionalImages 
    };

    const { error } = await supabase.from('products').insert([newProduct]);
    if (error) { 
      alert('Failed: ' + error.message); 
      setLoading(false); 
      return; 
    }
    router.push('/admin/products');
  };

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products" className="p-2 bg-white border rounded-full hover:bg-slate-50"><ArrowLeft size={20} /></Link>
        <h1 className="text-3xl font-serif">Add New Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-8 border rounded-sm shadow-sm space-y-6">
          <h2 className="text-lg font-serif border-b pb-2">Product Details</h2>
          <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border px-4 py-3 rounded-sm" placeholder="Product Name" />
          <textarea required rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full border px-4 py-3 rounded-sm" placeholder="Product description..." />
          <div className="grid grid-cols-2 gap-6">
            <input required type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full border px-4 py-3 rounded-sm" placeholder="Price (₦)" />
            <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full border px-4 py-3 rounded-sm bg-transparent">
              <option value="Ready-To-Wear">Ready-To-Wear</option>
              <option value="Bespoke">Bespoke</option>
              <option value="Bridal">Bridal</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>
        </div>

        <div className="bg-white p-8 border rounded-sm shadow-sm space-y-6">
          <h2 className="text-lg font-serif border-b pb-2">Product Images (Maximum 3)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Slot 1 */}
            <div>
              <label className="block text-xs font-medium mb-2 uppercase tracking-widest text-slate-500">1. Main Cover</label>
              <ImageUpload onUpload={setImage1} bucket="products" />
              {image1 && <div className="mt-2 relative"><img src={image1} className="w-full h-32 object-cover border rounded-sm" alt="Cover" /><button type="button" onClick={() => setImage1('')} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"><X size={12}/></button></div>}
            </div>
            {/* Slot 2 */}
            <div>
              <label className="block text-xs font-medium mb-2 uppercase tracking-widest text-slate-500">2. Side Angle</label>
              <ImageUpload onUpload={setImage2} bucket="products" />
              {image2 && <div className="mt-2 relative"><img src={image2} className="w-full h-32 object-cover border rounded-sm" alt="Angle 1" /><button type="button" onClick={() => setImage2('')} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"><X size={12}/></button></div>}
            </div>
            {/* Slot 3 */}
            <div>
              <label className="block text-xs font-medium mb-2 uppercase tracking-widest text-slate-500">3. Back/Detail</label>
              <ImageUpload onUpload={setImage3} bucket="products" />
              {image3 && <div className="mt-2 relative"><img src={image3} className="w-full h-32 object-cover border rounded-sm" alt="Angle 2" /><button type="button" onClick={() => setImage3('')} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"><X size={12}/></button></div>}
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-sm flex items-center justify-center gap-2 font-medium tracking-widest uppercase text-sm">
          {loading ? <Loader2 className="animate-spin" /> : 'Publish Product'}
        </button>
      </form>
    </div>
  );
}