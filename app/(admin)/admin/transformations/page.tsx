"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import ImageUpload from '@/components/ImageUpload';
import { Trash2, Loader2, X } from 'lucide-react';

export default function AdminTransformations() {
  const [transformations, setTransformations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const [title, setTitle] = useState('');
  const [beforeImage, setBeforeImage] = useState('');
  const [afterImage, setAfterImage] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    fetchTransformations();
  }, []);

  async function fetchTransformations() {
    const { data } = await supabase.from('transformations').select('*').order('created_at', { ascending: false });
    if (data) setTransformations(data);
    setLoading(false);
  }

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    if (!beforeImage || !afterImage || !title) return alert("Please fill all fields and upload both images.");
    
    setIsPublishing(true);
    const { error } = await supabase.from('transformations').insert([{ 
      title, before_image: beforeImage, after_image: afterImage 
    }]);
    
    if (error) {
      alert("Failed to save: " + error.message);
    } else {
      setTitle('');
      setBeforeImage('');
      setAfterImage('');
      fetchTransformations();
    }
    setIsPublishing(false);
  }

  async function deleteTransformation(id: string) {
    if (!confirm("Delete this transformation?")) return;
    await supabase.from('transformations').delete().eq('id', id);
    fetchTransformations();
  }

  return (
    <div className="max-w-5xl mx-auto pb-12 px-4 md:px-0">
      <div className="mb-10">
        <h1 className="text-3xl font-serif text-slate-900 mb-2">Transformations</h1>
        <p className="text-slate-500">Manage your "Vision to Finish" before-and-after showcases.</p>
      </div>

      <div className="bg-white p-8 border border-slate-200 rounded-sm shadow-sm mb-12">
        <h2 className="text-lg font-serif text-slate-900 mb-6 border-b pb-2">Add New Showcase</h2>
        <form onSubmit={handlePublish} className="space-y-6">
          <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border px-4 py-3 rounded-sm" placeholder="Title (e.g., The Velvet Corset Redesign)" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 border border-dashed border-slate-300 bg-slate-50 rounded-sm text-center">
              <label className="block text-[10px] font-medium mb-4 uppercase tracking-widest text-slate-500">1. Before (Sketch/Raw Fabric)</label>
              {beforeImage ? (
                <div className="relative aspect-[3/4]"><img src={beforeImage} className="w-full h-full object-cover rounded-sm" /><button type="button" onClick={() => setBeforeImage('')} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"><X size={14}/></button></div>
              ) : <ImageUpload onUpload={setBeforeImage} bucket="gallery" />}
            </div>
            
            <div className="p-4 border border-dashed border-slate-300 bg-slate-50 rounded-sm text-center">
              <label className="block text-[10px] font-medium mb-4 uppercase tracking-widest text-amber-700">2. After (Final Output)</label>
              {afterImage ? (
                <div className="relative aspect-[3/4]"><img src={afterImage} className="w-full h-full object-cover rounded-sm" /><button type="button" onClick={() => setAfterImage('')} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"><X size={14}/></button></div>
              ) : <ImageUpload onUpload={setAfterImage} bucket="gallery" />}
            </div>
          </div>

          <button type="submit" disabled={isPublishing} className="w-full bg-slate-900 text-white py-4 font-medium tracking-widest uppercase text-sm rounded-sm">
            {isPublishing ? 'Publishing...' : 'Publish Transformation'}
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-lg font-serif text-slate-900 mb-6 border-b border-slate-200 pb-2">Live Showcases</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {transformations.map((item) => (
            <div key={item.id} className="relative bg-white border border-slate-200 p-4 rounded-sm shadow-sm flex items-center justify-between">
              <div>
                <h3 className="font-serif text-slate-900 text-lg">{item.title}</h3>
                <p className="text-xs text-slate-500 uppercase tracking-widest">Active on homepage</p>
              </div>
              <button onClick={() => deleteTransformation(item.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition"><Trash2 size={18} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}