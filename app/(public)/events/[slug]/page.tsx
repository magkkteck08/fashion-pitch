"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { ArrowLeft, MapPin, Calendar, ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';

// HELPER: Forces Postgres string arrays to become real JS arrays
const parseSupabaseArray = (data: any) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'string') {
    if (data.startsWith('[') && data.endsWith(']')) {
      try { return JSON.parse(data); } catch (e) { return []; }
    }
    if (data.startsWith('{') && data.endsWith('}')) {
      return data.slice(1, -1).split(',').map(s => s.replace(/^"|"$/g, '').trim()).filter(Boolean);
    }
  }
  return [];
};

export default function EventPage() {
  const { slug } = useParams();
  const router = useRouter();
  const supabase = createClient();
  
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchEvent() {
      const { data } = await supabase.from('events').select('*').eq('slug', slug).single();
      if (data) setEvent(data);
      setLoading(false);
    }
    fetchEvent();
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] text-slate-500 tracking-widest uppercase text-sm">Loading Event...</div>;
  if (!event) return <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] text-slate-500">Event not found.</div>;

  // Process images
  const parsedRecap = parseSupabaseArray(event.recap_images);
  const images = [event.cover_image, ...parsedRecap].filter(Boolean);

  // Scroll handler for updating the counter
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.clientWidth;
    setCurrentImageIndex(Math.round(scrollLeft / width));
  };

  // Button handler for desktop arrow clicks
  const slideGallery = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth : clientWidth;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-900 font-sans selection:bg-amber-900 selection:text-white pb-24">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full p-6 flex justify-between items-center z-50 mix-blend-difference text-white">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm tracking-widest uppercase hover:text-amber-500 transition">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="text-xl font-serif font-bold tracking-widest">JUPILO.</div>
      </nav>

      {/* HORIZONTAL GALLERY: Side-by-side with object-contain */}
      <div className="relative w-full h-[60vh] md:h-[80vh] bg-slate-900 group">
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory h-full w-full custom-scrollbar scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {images.map((img, idx) => (
            <div key={idx} className="min-w-full h-full snap-center relative shrink-0 flex items-center justify-center p-4">
              <img 
                src={img} 
                alt={`${event.title} - Photo ${idx + 1}`} 
                className="w-full h-full object-contain object-center" 
              />
            </div>
          ))}
        </div>

        {/* Desktop Left/Right Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button onClick={() => slideGallery('left')} className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-md transition opacity-0 group-hover:opacity-100 hidden md:block">
              <ChevronLeft size={24} />
            </button>
            <button onClick={() => slideGallery('right')} className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-md transition opacity-0 group-hover:opacity-100 hidden md:block">
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Floating Badges & Image Counter */}
        <div className="absolute bottom-6 left-6 bg-black/60 text-white text-xs uppercase tracking-widest px-4 py-2 rounded-sm backdrop-blur-md">
          {event.status}
        </div>
        
        {images.length > 1 && (
          <div className="absolute bottom-6 right-6 bg-black/60 text-white text-xs tracking-widest px-4 py-2 rounded-sm flex items-center gap-2 backdrop-blur-md">
            <ImageIcon size={14} className="text-amber-500" /> {currentImageIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Details & Typography */}
      <div className="max-w-3xl mx-auto px-6 pt-16">
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-6xl font-serif text-slate-900 leading-tight mb-6">{event.title}</h1>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm tracking-widest uppercase text-amber-700 font-medium">
            <span className="flex items-center gap-2"><Calendar size={16} /> {event.event_date ? new Date(event.event_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "TBA"}</span>
            <span className="flex items-center gap-2"><MapPin size={16} /> {event.location || "TBA"}</span>
          </div>
        </div>

        <div className="w-16 h-[1px] bg-slate-300 mx-auto mb-10"></div>

        <div className="prose prose-lg prose-slate max-w-none prose-p:leading-relaxed prose-p:mb-6 text-slate-600">
          <p className="font-medium text-xl text-slate-800 mb-8 text-center">{event.description}</p>
          {event.recap_text && (
            <div className="whitespace-pre-wrap">{event.recap_text}</div>
          )}
        </div>

        {event.status !== 'Past' && (
          <div className="mt-16 text-center border-t border-slate-200 pt-12">
            <button 
              onClick={() => window.open(`https://wa.me/2349073754047?text=Hi Jupilo, I want to RSVP for ${event.title}.`, '_blank')} 
              className="bg-slate-900 text-white px-10 py-4 uppercase tracking-widest text-sm hover:bg-slate-800 transition rounded-sm w-full md:w-auto"
            >
              RSVP / Secure Seat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}