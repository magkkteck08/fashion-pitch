"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import ImageUpload from '@/components/ImageUpload';
import { ArrowLeft, Loader2, X } from 'lucide-react';
import Link from 'next/link';

export default function AddEvent() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  
  // Explicit 5 slots for Events
  const [image1, setImage1] = useState<string>(''); // Main Poster/Cover
  const [image2, setImage2] = useState<string>(''); // Recap 1
  const [image3, setImage3] = useState<string>(''); // Recap 2
  const [image4, setImage4] = useState<string>(''); // Recap 3
  const [image5, setImage5] = useState<string>(''); // Recap 4
  
  const [formData, setFormData] = useState({
    title: '', description: '', event_date: '', location: '', status: 'Upcoming', recap_text: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Generate a simple URL slug from the event title
    const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    // Combine recap slots that actually have URLs
    const recapImages = [image2, image3, image4, image5].filter(Boolean); 

    const newEvent = {
      title: formData.title, 
      slug: slug, 
      description: formData.description,
      event_date: formData.event_date || null,
      location: formData.location, 
      status: formData.status, 
      recap_text: formData.recap_text,
      cover_image: image1,
      recap_images: recapImages 
    };

    const { error } = await supabase.from('events').insert([newEvent]);
    if (error) { 
      alert('Failed: ' + error.message); 
      setLoading(false); 
      return; 
    }
    router.push('/admin/events');
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 px-4 md:px-0">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/events" className="p-2 bg-white border rounded-full hover:bg-slate-50"><ArrowLeft size={20} /></Link>
        <h1 className="text-3xl font-serif">Add New Event</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Event Details */}
        <div className="bg-white p-6 md:p-8 border rounded-sm shadow-sm space-y-6">
          <h2 className="text-lg font-serif border-b pb-2">Event Details</h2>
          <input required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full border px-4 py-3 rounded-sm" placeholder="Event Title (e.g. Lagos Fashion Week)" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input type="date" value={formData.event_date} onChange={(e) => setFormData({...formData, event_date: e.target.value})} className="w-full border px-4 py-3 rounded-sm" />
            <input required type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full border px-4 py-3 rounded-sm" placeholder="Location (e.g. Eko Hotel)" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full border px-4 py-3 rounded-sm bg-transparent">
              <option value="Upcoming">Upcoming</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Past">Past</option>
            </select>
            <input required type="text" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full border px-4 py-3 rounded-sm" placeholder="Short teaser (1 sentence)..." />
          </div>

          <textarea rows={6} value={formData.recap_text} onChange={(e) => setFormData({...formData, recap_text: e.target.value})} className="w-full border px-4 py-3 rounded-sm" placeholder="Full Event Recap Story / Details (Optional)..." />
        </div>

        {/* Media Uploads - 5 Slots */}
        <div className="bg-white p-6 md:p-8 border rounded-sm shadow-sm space-y-6">
          <h2 className="text-lg font-serif border-b pb-2">Event Images (Maximum 5)</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Slot 1 */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-[10px] font-medium mb-2 uppercase tracking-widest text-amber-700">1. Main Poster</label>
              <ImageUpload onUpload={setImage1} bucket="events" />
              {image1 && <div className="mt-2 relative"><img src={image1} className="w-full h-24 object-cover border rounded-sm" alt="Cover" /><button type="button" onClick={() => setImage1('')} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"><X size={10}/></button></div>}
            </div>
            {/* Slot 2 */}
            <div>
              <label className="block text-[10px] font-medium mb-2 uppercase tracking-widest text-slate-500">2. Recap Photo</label>
              <ImageUpload onUpload={setImage2} bucket="events" />
              {image2 && <div className="mt-2 relative"><img src={image2} className="w-full h-24 object-cover border rounded-sm" alt="Recap 1" /><button type="button" onClick={() => setImage2('')} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"><X size={10}/></button></div>}
            </div>
            {/* Slot 3 */}
            <div>
              <label className="block text-[10px] font-medium mb-2 uppercase tracking-widest text-slate-500">3. Recap Photo</label>
              <ImageUpload onUpload={setImage3} bucket="events" />
              {image3 && <div className="mt-2 relative"><img src={image3} className="w-full h-24 object-cover border rounded-sm" alt="Recap 2" /><button type="button" onClick={() => setImage3('')} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"><X size={10}/></button></div>}
            </div>
            {/* Slot 4 */}
            <div>
              <label className="block text-[10px] font-medium mb-2 uppercase tracking-widest text-slate-500">4. Recap Photo</label>
              <ImageUpload onUpload={setImage4} bucket="events" />
              {image4 && <div className="mt-2 relative"><img src={image4} className="w-full h-24 object-cover border rounded-sm" alt="Recap 3" /><button type="button" onClick={() => setImage4('')} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"><X size={10}/></button></div>}
            </div>
            {/* Slot 5 */}
            <div>
              <label className="block text-[10px] font-medium mb-2 uppercase tracking-widest text-slate-500">5. Recap Photo</label>
              <ImageUpload onUpload={setImage5} bucket="events" />
              {image5 && <div className="mt-2 relative"><img src={image5} className="w-full h-24 object-cover border rounded-sm" alt="Recap 4" /><button type="button" onClick={() => setImage5('')} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"><X size={10}/></button></div>}
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-sm flex items-center justify-center gap-2 font-medium tracking-widest uppercase text-sm">
          {loading ? <Loader2 className="animate-spin" /> : 'Publish Event'}
        </button>
      </form>
    </div>
  );
}