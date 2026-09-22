"use client";
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Trash2 } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';

export default function AddSignatureStyle() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    category: 'Bags',
    price: '',
    description: '',
    status: 'Active',
    stock_count: '10',
    image_url: '',
    additional_images: [] as string[],
    tags: [] as string[],
    colors: [] as string[],
    sizes: [] as string[]
  });

  const availableTags = ['Bags', 'Shoes', 'Palm Wears', 'Cloth', 'Men', 'Women'];
  const availableColors = ['Black', 'White', 'Brown', 'Red', 'Blue', 'Gold', 'Silver', 'Nude', 'Custom'];
  const availableSizes = ['Small', 'Medium', 'Large', 'OS (One Size)', 'Custom'];

  const toggleArrayItem = (field: 'tags' | 'colors' | 'sizes', value: string) => {
    setForm(prev => {
      const array = prev[field];
      return {
        ...prev,
        [field]: array.includes(value) ? array.filter(item => item !== value) : [...array, value]
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image_url) {
      alert("Please upload a cover image first.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('signature_products').insert([
      {
        name: form.name,
        category: form.category,
        price: parseFloat(form.price) || 0,
        description: form.description,
        status: form.status,
        stock_count: parseInt(form.stock_count) || 0,
        tags: form.tags,
        colors: form.colors,
        sizes: form.sizes,
        image_url: form.image_url,
        additional_images: form.additional_images
      }
    ]);

    setLoading(false);

    if (error) {
      alert(`Error saving item: ${error.message}`);
    } else {
      router.push('/admin/signature');
    }
  };

  const handleAddExtraImage = (url: string) => {
    setForm({ ...form, additional_images: [...form.additional_images, url] });
  };

  const handleRemoveExtraImage = (indexToRemove: number) => {
    setForm({
      ...form,
      additional_images: form.additional_images.filter((_, idx) => idx !== indexToRemove)
    });
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-10">
        <Link href="/admin/signature" className="p-2 bg-white border border-slate-200 rounded-sm hover:bg-slate-50 transition">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-serif text-slate-900 mb-1">Add Premium Item</h1>
          <p className="text-slate-500">Upload a new item to the Premium Collection.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
        <div className="p-8 grid grid-cols-1 lg:grid-cols-5 gap-10">
          
          <div className="lg:col-span-3 space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Item Name</label>
              <input required type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full border border-slate-200 p-3 rounded-sm focus:border-amber-500 outline-none transition" placeholder="e.g. Prada Lady Mini" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Category</label>
                <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} className="w-full border border-slate-200 p-3 rounded-sm focus:border-amber-500 outline-none transition bg-white">
                  <option value="Bags">Bags</option>
                  <option value="Shoes">Shoes</option>
                  <option value="Palm Wears">Palm Wears</option>
                  <option value="Cloth">Cloth</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Price (₦)</label>
                <input required type="number" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} className="w-full border border-slate-200 p-3 rounded-sm focus:border-amber-500 outline-none transition" placeholder="45000" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Stock Count</label>
                <input required type="number" value={form.stock_count} onChange={(e) => setForm({...form, stock_count: e.target.value})} className="w-full border border-slate-200 p-3 rounded-sm focus:border-amber-500 outline-none transition" placeholder="10" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Status</label>
              <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})} className="w-full border border-slate-200 p-3 rounded-sm focus:border-amber-500 outline-none transition bg-white">
                <option value="Active">Active (Visible to Clients)</option>
                <option value="Draft">Draft (Hidden)</option>
              </select>
            </div>

            {/* SELECTION WIDGETS */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Filter Tags</label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <button key={tag} type="button" onClick={() => toggleArrayItem('tags', tag)} className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-sm border transition ${form.tags.includes(tag) ? 'bg-amber-50 border-amber-700 text-amber-800' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'}`}>{tag}</button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Available Colors</label>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map(color => (
                    <button key={color} type="button" onClick={() => toggleArrayItem('colors', color)} className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-sm border transition ${form.colors.includes(color) ? 'bg-amber-50 border-amber-700 text-amber-800' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'}`}>{color}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Available Sizes</label>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map(size => (
                    <button key={size} type="button" onClick={() => toggleArrayItem('sizes', size)} className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-sm border transition ${form.sizes.includes(size) ? 'bg-amber-50 border-amber-700 text-amber-800' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'}`}>{size}</button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Description (Markdown Supported)</label>
              <textarea required rows={5} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full border border-slate-200 p-3 rounded-sm focus:border-amber-500 outline-none transition" placeholder="Use - for bullet points and **text** for bolding." />
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-6 border-l border-slate-100 lg:pl-10">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-900 mb-2">Cover Image (Square)</label>
              {form.image_url ? (
                <div className="relative aspect-square rounded-sm overflow-hidden border border-slate-200 group w-full max-w-[250px]">
                  <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button type="button" onClick={() => setForm({...form, image_url: ''})} className="bg-red-500 text-white px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-sm">
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-[250px] aspect-square">
                  <ImageUpload onUpload={(url) => setForm({...form, image_url: url})} bucket="products" />
                </div>
              )}
            </div>

            <div className="w-full h-[1px] bg-slate-100"></div>

            <div>
              <label className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-900 mb-3">
                <span>Additional Angles</span>
                <span className="text-amber-700 bg-amber-50 px-2 py-1 rounded-sm">{form.additional_images.length}/3</span>
              </label>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                {form.additional_images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-sm overflow-hidden border border-slate-200 group">
                    <img src={img} alt={`Angle ${idx + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button type="button" onClick={() => handleRemoveExtraImage(idx)} className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {form.additional_images.length < 3 && (
                <div className="aspect-square w-1/2">
                  <ImageUpload onUpload={handleAddExtraImage} bucket="products" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-6 border-t border-slate-200 flex justify-end">
          <button type="submit" disabled={loading} className="bg-slate-900 text-white px-8 py-3 rounded-sm font-bold uppercase tracking-widest text-xs hover:bg-amber-700 transition flex items-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {loading ? 'Saving Item...' : 'Save Premium Item'}
          </button>
        </div>
      </form>
    </div>
  );
}