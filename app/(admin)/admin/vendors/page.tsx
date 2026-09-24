'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function VendorManager() {
  const [vendorName, setVendorName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [vendors, setVendors] = useState<any[]>([]);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    const { data } = await supabase.from('verified_vendors').select('*').order('created_at', { ascending: false });
    if (data) setVendors(data);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !vendorName) return alert('Please provide both a name and a logo.');
    
    setIsUploading(true);
    try {
      // 1. Upload image to the storage bucket
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('vendor_logos').upload(fileName, file);
      
      if (uploadError) throw uploadError;

      // 2. Get the public URL for the uploaded image
      const { data: { publicUrl } } = supabase.storage.from('vendor_logos').getPublicUrl(fileName);

      // 3. Save the vendor record in the database
      const { error: dbError } = await supabase.from('verified_vendors').insert([{
        vendor_name: vendorName,
        logo_url: publicUrl,
        status: 'active'
      }]);

      if (dbError) throw dbError;

      alert('Vendor successfully added!');
      setVendorName('');
      setFile(null);
      fetchVendors();
    } catch (error: any) {
      alert(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <h1 className="text-3xl font-serif text-slate-900 mb-8">Vendor Management</h1>
      
      <form onSubmit={handleUpload} className="bg-white p-6 border border-slate-200 rounded-lg shadow-sm mb-12">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6">Add New Verified Vendor</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Brand Name</label>
            <input 
              type="text" 
              value={vendorName} 
              onChange={(e) => setVendorName(e.target.value)} 
              className="w-full border border-slate-300 px-4 py-2 text-sm" 
              placeholder="e.g. Gucci, Zara" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Brand Logo (Image)</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)} 
              className="w-full border border-slate-300 px-4 py-2 text-sm" 
            />
          </div>
        </div>
        <button 
          type="submit" 
          disabled={isUploading}
          className="bg-slate-900 text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-amber-700 transition"
        >
          {isUploading ? 'Uploading...' : 'Add Vendor'}
        </button>
      </form>

      <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6">Active Vendors</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {vendors.map((vendor) => (
          <div key={vendor.id} className="border border-slate-200 p-4 flex flex-col items-center justify-center bg-slate-50 rounded">
            <img src={vendor.logo_url} alt={vendor.vendor_name} className="h-12 object-contain mb-4 grayscale" />
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">{vendor.vendor_name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}