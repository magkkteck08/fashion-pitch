"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import ImageUpload from '@/components/ImageUpload';
import { Trash2, Loader2, X, UploadCloud } from 'lucide-react';

export default function AdminGallery() {
  const [gallery, setGallery] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // BATCH UPLOAD STATE: Array of 8 empty slots
  const [batchSlots, setBatchSlots] = useState<string[]>(Array(8).fill(''));
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    fetchGallery();
  }, []);

  async function fetchGallery() {
    const { data } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
    if (data) setGallery(data);
    setLoading(false);
  }

  // Handle uploading into a specific slot in our batch
  const handleSlotUpload = (url: string, index: number) => {
    setBatchSlots(prev => {
      const newSlots = [...prev];
      newSlots[index] = url;
      return newSlots;
    });
  };

  // Remove an image from a slot before publishing
  const clearSlot = (index: number) => {
    setBatchSlots(prev => {
      const newSlots = [...prev];
      newSlots[index] = '';
      return newSlots;
    });
  };

  // PUBLISH THE ENTIRE BATCH AT ONCE
  async function publishBatch() {
    // Filter out the empty slots, only keep the ones with images
    const imagesToPublish = batchSlots.filter(Boolean);
    
    if (imagesToPublish.length === 0) {
      alert("Please upload at least one image to publish.");
      return;
    }

    setIsPublishing(true);

    // Format for Supabase bulk insert
    const insertData = imagesToPublish.map(url => ({
      image_url: url,
      category: 'Portfolio'
    }));

    const { error } = await supabase.from('gallery').insert(insertData);
    
    if (error) {
      alert("Failed to publish batch: " + error.message);
    } else {
      // Success! Clear the slots and refresh the live grid
      setBatchSlots(Array(8).fill(''));
      fetchGallery();
    }
    
    setIsPublishing(false);
  }

  async function deleteImage(id: string) {
    if (!confirm("Are you sure you want to delete this image?")) return;
    await supabase.from('gallery').delete().eq('id', id);
    fetchGallery();
  }

  // Count how many images are currently ready in the batch
  const readyCount = batchSlots.filter(Boolean).length;

  return (
    <div className="max-w-5xl mx-auto pb-12 px-4 md:px-0">
      <div className="mb-10">
        <h1 className="text-3xl font-serif text-slate-900 mb-2">Gallery Management</h1>
        <p className="text-slate-500">Upload photos of your clients, runway shows, and behind-the-scenes work.</p>
      </div>

      {/* BATCH UPLOAD SECTION */}
      <div className="bg-white p-6 md:p-8 border border-slate-200 rounded-sm shadow-sm mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-serif text-slate-900">Batch Upload</h2>
            <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Fill up to 8 slots at once</p>
          </div>
          
          {/* Publish Button */}
          <button 
            onClick={publishBatch}
            disabled={isPublishing || readyCount === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-sm text-sm tracking-widest uppercase font-medium transition ${
              readyCount > 0 
                ? 'bg-amber-700 text-white hover:bg-slate-900' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isPublishing ? <Loader2 className="animate-spin" size={16} /> : <UploadCloud size={16} />}
            {isPublishing ? 'Publishing...' : `Publish Batch (${readyCount})`}
          </button>
        </div>

        {/* 8 Upload Slots Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {batchSlots.map((slotUrl, index) => (
            <div key={index} className="relative aspect-[4/5] bg-slate-50 border border-dashed border-slate-300 rounded-sm flex flex-col items-center justify-center p-2">
              {slotUrl ? (
                // Slot is filled
                <>
                  <img src={slotUrl} alt={`Slot ${index + 1}`} className="w-full h-full object-cover rounded-sm shadow-sm" />
                  <button 
                    onClick={() => clearSlot(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md hover:bg-red-600 transition"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                // Slot is empty
                <div className="w-full h-full flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest mb-2 font-medium">Slot {index + 1}</span>
                  <div className="w-full px-2">
                    <ImageUpload onUpload={(url) => handleSlotUpload(url, index)} bucket="gallery" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* LIVE GALLERY GRID */}
      <div>
        <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-2">
          <h2 className="text-lg font-serif text-slate-900">Current Live Images</h2>
          <span className="text-xs text-slate-500 uppercase tracking-widest">{gallery.length} Photos total</span>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-amber-700" size={32} /></div>
        ) : gallery.length === 0 ? (
          <div className="text-center py-12 bg-white border border-slate-200 rounded-sm text-slate-500">
            Your gallery is currently empty. Upload images using the batch uploader above.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {gallery.map((img) => (
              <div key={img.id} className="group relative aspect-[4/5] rounded-sm overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
                <img src={img.image_url} alt="Gallery item" className="w-full h-full object-cover" />
                
                {/* Hover Overlay with Delete Button */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                  <button 
                    onClick={() => deleteImage(img.id)} 
                    className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition shadow-lg scale-90 group-hover:scale-100"
                    title="Delete Image"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}