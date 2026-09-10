"use client";
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, MessageCircle, Menu, MapPin, Star, X, BookOpen, Loader2, CheckCircle, ChevronLeft, ChevronRight, ImageIcon, Plus, Minus } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

// HELPER FUNCTION: Forces Supabase array strings to become real arrays
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

// PRODUCT CARD COMPONENT (Now with gallery indicator)
const ProductCard = ({ item, onSelect }: { item: any, onSelect: (item: any) => void }) => {
  const extraImages = parseSupabaseArray(item.additional_images);
  const totalImages = extraImages.length > 0 ? extraImages.length + 1 : 1;

  return (
    <div className="group cursor-pointer flex flex-col h-full" onClick={() => onSelect(item)}>
      <div className="relative aspect-[3/4] mb-4 overflow-hidden rounded-sm bg-slate-100 shadow-sm border border-slate-200">
        <img
          src={item.image_url || "https://placehold.co/600x800/eeeeee/999999?text=No+Image"}
          alt={item.name}
          className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 bg-white/90 text-slate-900 text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
          {item.category}
        </div>
        {/* HOMEPAGE INDICATOR: Shows if product has multiple pics */}
        {totalImages > 1 && (
          <div className="absolute top-3 right-3 bg-black/70 text-white text-[10px] tracking-widest px-2 py-1 rounded-sm backdrop-blur-md flex items-center gap-1">
            <ImageIcon size={10} /> {totalImages}
          </div>
        )}
      </div>
      <h3 className="text-lg font-serif text-slate-900 group-hover:text-amber-700 transition">{item.name}</h3>
      <p className="text-amber-700 font-medium mb-4">₦{item.price?.toLocaleString()}</p>
      <div className="mt-auto">
        <button 
          onClick={(e) => { e.stopPropagation(); onSelect(item); }} 
          className="w-full border border-slate-900 py-2 flex items-center justify-center gap-2 hover:bg-slate-900 hover:text-white transition rounded-sm text-[11px] font-medium tracking-widest uppercase"
        >
          Order Now
        </button>
      </div>
    </div>
  );
};

// EVENT TEASER CARD COMPONENT
const EventCard = ({ ev, mounted }: { ev: any, mounted: boolean }) => {
  return (
    <Link href={`/events/${ev.slug}`} className="group border border-slate-700 rounded-sm flex flex-col md:flex-row overflow-hidden bg-slate-800/50 hover:border-amber-500 transition duration-300 h-full">
      <div className="w-full md:w-2/5 aspect-[4/3] md:aspect-auto relative overflow-hidden bg-black">
        <img src={ev.cover_image || "https://placehold.co/600x800"} alt={ev.title} className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-700" />
        <div className="absolute top-4 left-4 bg-black/80 text-white text-[10px] uppercase tracking-widest px-3 py-1 rounded-sm border border-slate-600 backdrop-blur-sm">
          {ev.status}
        </div>
      </div>
      <div className="w-full md:w-3/5 p-6 md:p-8 flex flex-col justify-center">
        <div className="flex items-center gap-5 mb-4 border-b border-slate-700 pb-5">
          <div className="text-center shrink-0">
            <p className="text-3xl md:text-4xl font-serif text-amber-500">{mounted && ev.event_date ? new Date(ev.event_date).getDate() : "--"}</p>
            <p className="text-[10px] tracking-widest uppercase text-slate-400 mt-1">{mounted && ev.event_date ? new Date(ev.event_date).toLocaleString('default', { month: 'short' }) : "TBA"}</p>
          </div>
          <div className="w-[1px] h-12 bg-slate-700"></div>
          <div>
            <h3 className="text-xl md:text-2xl font-serif leading-tight text-white group-hover:text-amber-400 transition line-clamp-2">{ev.title}</h3>
          </div>
        </div>
        <p className="text-slate-400 text-sm mb-6 line-clamp-2">{ev.description}</p>
        <div className="mt-auto flex items-center justify-between text-sm tracking-widest uppercase text-amber-500 font-medium">
          <span className="flex items-center gap-2"><MapPin size={14} /> {ev.location || "TBA"}</span>
          <span className="group-hover:translate-x-2 transition-transform">Read Recap →</span>
        </div>
      </div>
    </Link>
  );
};

export default function JupiloPublicSite() {
  const WHATSAPP_NUMBER = "2349073754047";
  const supabase = createClient();
  
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [academyCourses, setAcademyCourses] = useState<any[]>([]);
  const [visibleGalleryCount, setVisibleGalleryCount] = useState(8);
  const [transformations, setTransformations] = useState<any[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [academyForm, setAcademyForm] = useState({ name: '', email: '', contact: '', experience: 'Beginner' });
  const [academySubmitting, setAcademySubmitting] = useState(false);
  const [academySuccess, setAcademySuccess] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleAcademySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAcademySubmitting(true);
    
    // Insert into the new table we just created
    const { error } = await supabase
      .from('academy_leads')
      .insert([
        { 
          name: academyForm.name, 
          email: academyForm.email, 
          contact: academyForm.contact, 
          experience: academyForm.experience 
        }
      ]);

    if (!error) {
      setAcademySuccess(true);
      // Reset form
      setAcademyForm({ name: '', email: '', contact: '', experience: 'Beginner' });
    } else {
      console.error("Error submitting application:", error);
    }
    
    setAcademySubmitting(false);
  };
  
  // Product Modal States
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // NEW: State to control how many products show on the grid
  const [visibleCount, setVisibleCount] = useState(8);

  const [contactForm, setContactForm] = useState({ name: '', contact: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

 useEffect(() => {
    setMounted(true);
    async function loadData() {
      const { data: prodData } = await supabase.from('products').select('*');
      const { data: eventData } = await supabase.from('events').select('*').order('event_date', { ascending: true });
      const { data: galData } = await supabase.from('gallery').select('*').limit(12);
      const { data: acadData, error: acadError } = await supabase.from('academy').select('*').limit(3);
      
      // 'as any' bypasses the strict TypeScript error for the new table
      const { data: transData } = await supabase.from('transformations' as any).select('*').limit(2);
      
      if (prodData) setProducts(prodData);
      if (eventData) setEvents(eventData);
      if (galData) setGallery(galData);
      if (acadData && !acadError) setAcademyCourses(acadData);
      if (transData) setTransformations(transData);
    }
    loadData();
  }, []);

  const handleSelectProduct = (item: any) => {
    const extraImages = parseSupabaseArray(item.additional_images);
    setProductImages([item.image_url, ...extraImages].filter(Boolean));
    setCurrentImageIndex(0);
    setSelectedProduct(item);
  };

  // Scroll handler for updating the "1/3" counter when dragging/swiping
  const handleModalScroll = (e: React.UIEvent<HTMLDivElement>) => {
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

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { error } = await supabase.from('enquiries').insert([{ name: contactForm.name, contact: contactForm.contact, message: contactForm.message }]);
    setIsSubmitting(false);
    if (!error) {
      setSubmitSuccess(true);
      setContactForm({ name: '', contact: '', message: '' });
      setTimeout(() => setSubmitSuccess(false), 5000);
    } else {
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-900 font-sans selection:bg-amber-900 selection:text-white">
      
      {/* PRODUCT MODAL OVERLAY */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-12">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer" onClick={() => setSelectedProduct(null)}></div>
          <div className="relative bg-white w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl rounded-sm">
            
            <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 z-20 bg-white/50 text-black p-2 rounded-full shadow-md backdrop-blur-md hover:bg-white transition">
              <X size={20} />
            </button>
            
            {/* LEFT SIDE: Swipeable Image Gallery */}
            <div className="w-full md:w-1/2 h-[45vh] md:h-[80vh] bg-slate-100 relative group">
              <div 
                ref={scrollRef}
                onScroll={handleModalScroll}
                className="flex overflow-x-auto snap-x snap-mandatory h-full w-full custom-scrollbar scroll-smooth" 
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
              >
                {productImages.map((img, idx) => (
                  <div key={idx} className="min-w-full h-full snap-center relative shrink-0 flex items-center justify-center">
                    <img 
                      src={img} 
                      className="w-full h-full object-contain object-center" 
                      alt={`${selectedProduct.name} - Angle ${idx + 1}`} 
                    />
                  </div>
                ))}
              </div>

              {/* Desktop Left/Right Navigation Arrows */}
              {productImages.length > 1 && (
                <>
                  <button onClick={() => slideGallery('left')} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-black p-2 rounded-full shadow-md backdrop-blur-md transition opacity-0 group-hover:opacity-100 hidden md:block">
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={() => slideGallery('right')} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-black p-2 rounded-full shadow-md backdrop-blur-md transition opacity-0 group-hover:opacity-100 hidden md:block">
                    <ChevronRight size={20} />
                  </button>
                  <div className="absolute bottom-6 right-6 bg-black/60 text-white text-[10px] tracking-widest px-3 py-1.5 rounded-sm backdrop-blur-md pointer-events-none transition-all">
                    {currentImageIndex + 1} / {productImages.length}
                  </div>
                </>
              )}
            </div>
            
            {/* RIGHT SIDE: Details & Actions */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col h-[45vh] md:h-[80vh] overflow-y-auto">
              <div className="text-xs text-amber-700 uppercase tracking-widest mb-2">{selectedProduct.category}</div>
              <h2 className="text-3xl md:text-5xl font-serif mb-2 text-slate-900">{selectedProduct.name}</h2>
              <p className="text-2xl text-amber-700 font-medium mb-6">₦{selectedProduct.price?.toLocaleString()}</p>
              
              <div className="w-12 h-[1px] bg-amber-700 mb-6"></div>
              
              <p className="text-slate-600 mb-8 leading-relaxed text-sm md:text-base flex-1">
                {selectedProduct.description}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mt-auto pt-8 border-t border-slate-100 shrink-0">
                <button 
                  onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=Hi Jupilo, I want to order the ${selectedProduct.name} for ₦${selectedProduct.price?.toLocaleString()}.`, '_blank')}
                  className="flex-1 bg-slate-900 text-white py-4 px-2 text-[11px] font-medium tracking-widest uppercase rounded-sm hover:bg-slate-800 transition text-center"
                >
                  Order Now
                </button>
                <button 
                  onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=Hi Jupilo, I have an enquiry about the ${selectedProduct.name}.`, '_blank')}
                  className="flex-1 bg-transparent border border-slate-900 text-slate-900 py-4 px-2 text-[11px] font-medium tracking-widest uppercase rounded-sm hover:bg-slate-50 transition text-center"
                >
                  Make Enquiry
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="relative h-screen w-full flex flex-col justify-center px-6 md:px-16 overflow-hidden bg-black">
        {/* The Base Image - Enhanced with CSS filters to make it shine and pop! */}
        <img 
          src="/hero.jpg" 
          alt="Jupilo Fashion" 
          className="absolute inset-0 w-full h-full object-cover saturate-[1.25] brightness-110 contrast-[1.05]" 
          onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/2000x1200/222222/666666?text=Hero" }} 
        />
        
        {/* A smooth, invisible side-gradient. Darker on the left for text, fading completely clear on the right */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent h-32"></div>
        
        {/* NAVIGATION BAR */}
      {/* NAVIGATION BAR */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-slate-200 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 md:px-16 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div className="text-2xl font-serif font-bold tracking-widest text-slate-900">
            JUPILO.
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-8 text-[10px] font-medium tracking-widest uppercase text-slate-500">
            <a href="#collections" className="hover:text-amber-700 transition duration-300">Collections</a>
            <a href="#events" className="hover:text-amber-700 transition duration-300">Runway & Events</a>
            <a href="#academy" className="hover:text-amber-700 transition duration-300">Academy</a>
            <a href="#founder" className="hover:text-amber-700 transition duration-300">The Designer</a>
          </div>

          {/* Mobile Toggle Button */}
          <button 
            className="md:hidden text-slate-900 hover:text-amber-700 transition" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        <div 
          className={`md:hidden absolute top-20 left-0 w-full bg-white border-b border-slate-200 shadow-2xl overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'max-h-72 opacity-100 py-6' : 'max-h-0 opacity-0 py-0'
          }`}
        >
          <div className="flex flex-col px-6 gap-6 text-xs tracking-widest uppercase font-medium text-slate-600">
            <a href="#collections" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-amber-700">Collections</a>
            <a href="#events" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-amber-700">Runway & Events</a>
            <a href="#academy" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-amber-700">Academy</a>
            <a href="#founder" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-amber-700">The Designer</a>
          </div>
        </div>
      </nav>
        
        {/* Clean, box-free typography */}
        <div className="relative z-10 mt-20 max-w-2xl">
          <h1 className="text-5xl md:text-7xl font-serif leading-[1.1] mb-6 text-white drop-shadow-xl">
            WEAR YOUR <br />CONFIDENCE.
          </h1>
          <p className="text-base md:text-xl font-light mb-10 max-w-xl text-gray-100 drop-shadow-lg leading-relaxed">
            Contemporary fashion, thoughtfully designed and crafted for women who want to stand out.
          </p>
          
          <a 
            href="#collections" 
            className="inline-block bg-white text-black px-10 py-4 text-center font-medium uppercase tracking-widest text-xs hover:bg-slate-200 transition rounded-sm shadow-2xl"
          >
            Explore Collection
          </a>
        </div>
      </section>

      {/* ABOUT / FOUNDER SECTION */}
      <section id="founder" className="relative py-32 px-6 md:px-16 max-w-7xl mx-auto flex flex-col md:flex-row gap-16 md:gap-24 items-center bg-white overflow-hidden">
        
        {/* Decorative blurred blobs to make the glassmorphism visible */}
        <div className="absolute top-10 left-0 w-72 h-72 bg-amber-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
        <div className="absolute bottom-10 left-32 w-72 h-72 bg-slate-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>

        {/* Left Side: Glassmorphic Image Container */}
        <div className="w-full md:w-1/2 relative mt-8 md:mt-0 z-10">
          {/* The offset frame */}
          <div className="absolute top-6 -left-6 w-full h-full border border-amber-700/20 rounded-2xl hidden md:block"></div>
          
          {/* The Frosted Glass Frame */}
          <div className="relative w-full aspect-[4/5] p-3 md:p-5 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] group">
            <div className="relative w-full h-full overflow-hidden rounded-xl">
              <img 
                src="/founder.jpg" 
                alt="Jupilo - The Designer" 
                className="w-full h-full object-cover transition-transform duration-[2s] ease-in-out group-hover:scale-110" 
                onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/800x1000/eeeeee/999999?text=Founder+Image" }} 
              />
            </div>
          </div>
        </div>
        
        {/* Right Side: Premium Typography and Expanded Copy */}
        <div className="w-full md:w-1/2 flex flex-col justify-center z-10 relative">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-[1px] bg-amber-700"></div>
            <h2 className="text-xs font-medium tracking-widest text-amber-700 uppercase">The Designer</h2>
          </div>
          
          <h3 className="text-4xl md:text-6xl font-serif text-slate-900 leading-tight mb-8">Meet Jupilo.</h3>
          
          <div className="space-y-6 text-slate-600 text-base md:text-lg leading-relaxed font-light">
            <p>
              <span className="font-medium text-slate-900">Jupilo is more than a fashion label;</span> it is a celebration of structure, elegance, and unapologetic confidence.
            </p>
            <p>
              Starting the journey with a sheer passion for tailoring, Jupilo spent years mastering the delicate balance between rich traditional craftsmanship and contemporary global aesthetics. Every sketch is intentional. Every silhouette is engineered to flatter, empower, and command the room.
            </p>
            
            {/* Signature Quote */}
            <div className="pt-6 mt-6">
              <blockquote className="pl-6 border-l-2 border-amber-500 italic text-slate-800 font-serif text-xl md:text-2xl leading-relaxed">
                "My ultimate goal is not just to dress a woman, but to arm her for the world."
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* COLLECTIONS */}
      <section id="collections" className="py-24 px-6 md:px-16 max-w-7xl mx-auto bg-white border-y border-slate-100">
        <h2 className="text-3xl md:text-5xl font-serif text-slate-900 mb-12">Latest Collection</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {products.slice(0, visibleCount).map((item) => (
            <ProductCard key={item.id} item={item} onSelect={handleSelectProduct} />
          ))}
        </div>

        {/* LOAD MORE BUTTON */}
        {visibleCount < products.length && (
          <div className="mt-16 text-center">
            <button 
              onClick={() => setVisibleCount(prev => prev + 4)} 
              className="border border-slate-900 text-slate-900 px-10 py-4 uppercase tracking-widest text-sm font-medium hover:bg-slate-900 hover:text-white transition rounded-sm"
            >
              Load More
            </button>
          </div>
        )}
      </section>

      {/* EVENTS SECTION */}
      <section id="events" className="py-24 px-6 md:px-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-serif mb-4">WHERE FASHION COMES ALIVE.</h2>
            <p className="text-slate-400">Join us at our upcoming showcases, recaps, and masterclasses.</p>
          </div>
          
          {/* Changed to a single-column stack, capped at max-w-5xl so it looks cinematic but not overly stretched */}
          <div className="flex flex-col gap-8 max-w-5xl mx-auto">
            {events.length > 0 ? (
              events.map((ev) => <EventCard key={ev.id} ev={ev} mounted={mounted} />)
            ) : (
              <div className="text-center text-slate-500 py-24 border border-dashed border-slate-700 rounded-sm">
                Stay tuned for upcoming events.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ACADEMY SECTION */}
      <section id="academy" className="py-24 px-6 md:px-16 bg-[#F9F7F2]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
          
          {/* LEFT SIDE: Premium Visuals & Dynamic Details */}
          <div className="w-full lg:w-1/2">
            <div className="flex items-center gap-4 mb-6">
              <BookOpen className="text-amber-700" size={24} />
              <h2 className="text-xs font-medium tracking-widest text-amber-700 uppercase">Jupilo Academy</h2>
            </div>
            <h3 className="text-4xl md:text-5xl font-serif text-slate-900 leading-tight mb-8">Master the Art of Couture.</h3>
            
            {/* Hardcoded Premium Image */}
            <div className="relative w-full aspect-video md:aspect-[4/3] rounded-sm overflow-hidden shadow-lg mb-8">
              <img 
                src="/academy.jpg" 
                alt="Jupilo Fashion Academy" 
                className="w-full h-full object-cover" 
                onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/800x600/eeeeee/999999?text=Academy+Image" }} 
              />
            </div>

            {/* Dynamic Course Details (Pulls the first course from DB) */}
            {academyCourses.length > 0 ? (
              <div className="bg-white p-6 md:p-8 rounded-sm shadow-sm border border-slate-100">
                <h4 className="text-2xl font-serif text-slate-900 mb-3">{academyCourses[0].title}</h4>
                <p className="text-slate-600 mb-4 text-sm md:text-base leading-relaxed">{academyCourses[0].description}</p>
                <div className="flex gap-4 text-xs tracking-widest uppercase font-medium text-amber-700 mt-6 pt-6 border-t border-slate-100">
                  <span>Intake: Upcoming</span>
                </div>
              </div>
            ) : (
              <div className="bg-white p-6 md:p-8 rounded-sm shadow-sm border border-slate-100">
                <h4 className="text-2xl font-serif text-slate-900 mb-3">Masterclass Series</h4>
                <p className="text-slate-600 mb-4 text-sm leading-relaxed">Join our next cohort to learn structural design, pattern drafting, and the business of high-end fashion.</p>
              </div>
            )}
          </div>

          {/* RIGHT SIDE: The Application Form */}
          <div className="w-full lg:w-1/2 bg-white p-8 md:p-12 rounded-sm shadow-xl border border-slate-100 relative overflow-hidden">
             {/* Decorative subtle background corner */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50/50 rounded-bl-full -z-0"></div>
             
             <div className="relative z-10">
               <h4 className="text-3xl font-serif text-slate-900 mb-2">Secure Your Seat</h4>
               <p className="text-slate-500 text-sm mb-8">Spaces are strictly limited to ensure personalized mentorship.</p>
               
               {academySuccess ? (
                  <div className="text-center py-16">
                    <CheckCircle className="text-green-500 mx-auto mb-4" size={48} />
                    <h4 className="text-2xl font-serif mb-2">Application Received</h4>
                    <p className="text-slate-600 text-sm">We will review your details and message you on WhatsApp shortly.</p>
                  </div>
               ) : (
                  <form onSubmit={handleAcademySubmit} className="space-y-8">
                    <div>
                      <label className="block text-[10px] font-medium mb-2 uppercase tracking-widest text-slate-500">Full Name</label>
                      <input required type="text" value={academyForm.name} onChange={(e) => setAcademyForm({...academyForm, name: e.target.value})} className="w-full border-b border-slate-300 px-0 py-2 bg-transparent focus:border-amber-700 outline-none transition rounded-none" placeholder="Jane Doe" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-[10px] font-medium mb-2 uppercase tracking-widest text-slate-500">Email Address</label>
                        <input required type="email" value={academyForm.email} onChange={(e) => setAcademyForm({...academyForm, email: e.target.value})} className="w-full border-b border-slate-300 px-0 py-2 bg-transparent focus:border-amber-700 outline-none transition rounded-none" placeholder="jane@example.com" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium mb-2 uppercase tracking-widest text-slate-500">WhatsApp Number</label>
                        <input required type="tel" value={academyForm.contact} onChange={(e) => setAcademyForm({...academyForm, contact: e.target.value})} className="w-full border-b border-slate-300 px-0 py-2 bg-transparent focus:border-amber-700 outline-none transition rounded-none" placeholder="+234..." />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-medium mb-2 uppercase tracking-widest text-slate-500">Experience Level</label>
                      <select value={academyForm.experience} onChange={(e) => setAcademyForm({...academyForm, experience: e.target.value})} className="w-full border-b border-slate-300 px-0 py-2 bg-transparent focus:border-amber-700 outline-none transition rounded-none text-slate-700 pb-2 cursor-pointer">
                        <option value="Beginner">Beginner (No prior experience)</option>
                        <option value="Intermediate">Intermediate (Knows basic sewing)</option>
                        <option value="Advanced">Advanced (Looking to scale/refine)</option>
                      </select>
                    </div>

                    <button type="submit" disabled={academySubmitting} className="w-full bg-slate-900 text-white py-5 mt-4 uppercase tracking-widest text-sm font-medium hover:bg-amber-700 transition duration-300 rounded-sm">
                      {academySubmitting ? 'Submitting...' : 'Submit Application'}
                    </button>
                  </form>
               )}
             </div>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="py-24 px-6 md:px-16 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-serif mb-12 text-slate-900 text-center">Inside Jupilo</h2>
        
        {/* Masonry Grid (2 columns on mobile, 4 on desktop) */}
        <div className="columns-2 md:columns-4 gap-4 space-y-4">
          {gallery.slice(0, visibleGalleryCount).map((img, i) => (
            <div key={img.id || i} className="break-inside-avoid relative group cursor-pointer overflow-hidden rounded-sm mb-4">
              <img src={img.image_url} alt="Gallery image" className="w-full object-cover group-hover:scale-105 transition duration-700" />
            </div>
          ))}
        </div>

        {/* LOAD MORE BUTTON */}
        {visibleGalleryCount < gallery.length && (
          <div className="mt-16 text-center">
            <button 
              onClick={() => setVisibleGalleryCount(prev => prev + 4)} 
              className="border border-slate-900 text-slate-900 px-10 py-4 uppercase tracking-widest text-sm font-medium hover:bg-slate-900 hover:text-white transition rounded-sm"
            >
              Load More Photos
            </button>
          </div>
        )}
      </section>

      {/* BEFORE & AFTER */}
      <section className="py-24 px-6 md:px-16 bg-slate-900 text-white text-center">
        <h2 className="text-3xl md:text-5xl font-serif mb-4">FROM VISION TO FINISH.</h2>
        <p className="text-slate-400 mb-16 max-w-2xl mx-auto">Watch how raw fabric and sketches transform into structural masterpieces.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-7xl mx-auto">
          {transformations.length > 0 ? transformations.slice(0, 2).map((item) => (
            <div key={item.id} className="flex flex-col group cursor-pointer">
               {/* 50/50 Image Container */}
               <div className="flex w-full aspect-[4/3] rounded-sm overflow-hidden shadow-2xl mb-6 border border-slate-700 relative">
                  
                  {/* Before Side: Slightly desaturated until hovered for cinematic effect */}
                  <div className="w-1/2 relative border-r border-slate-800 overflow-hidden">
                    <img src={item.before_image} alt="Before" className="w-full h-full object-cover grayscale-[50%] opacity-80 transition duration-[1.5s] group-hover:scale-105 group-hover:grayscale-0 group-hover:opacity-100" />
                    <span className="absolute bottom-4 left-4 bg-black/80 px-3 py-1 text-[10px] uppercase tracking-widest rounded-sm backdrop-blur-sm">Before</span>
                  </div>
                  
                  {/* After Side */}
                  <div className="w-1/2 relative overflow-hidden bg-slate-800">
                    <img src={item.after_image} alt="After" className="w-full h-full object-cover transition duration-[1.5s] group-hover:scale-105" />
                    <span className="absolute bottom-4 right-4 bg-amber-700/90 px-3 py-1 text-[10px] uppercase tracking-widest rounded-sm backdrop-blur-sm shadow-lg text-white">After</span>
                  </div>
               </div>
               
               <h4 className="text-2xl font-serif text-amber-500 group-hover:text-white transition">{item.title}</h4>
            </div>
          )) : (
            <div className="col-span-2 text-slate-500 py-24 border border-dashed border-slate-700 rounded-sm tracking-widest text-sm uppercase">Upload transformations in the admin portal.</div>
          )}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-24 px-6 md:px-16 bg-[#F9F7F2] border-t border-slate-200">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-16">
          <div className="w-full md:w-1/2">
            <h3 className="text-4xl md:text-5xl font-serif text-slate-900 leading-tight mb-6">Let's create something extraordinary.</h3>
          </div>
          <div className="w-full md:w-1/2 bg-white p-8 rounded-sm shadow-xl border border-slate-100">
            {submitSuccess ? (
              <div className="text-center py-12"><CheckCircle className="text-green-500 mx-auto mb-4" size={48} /><h4 className="text-2xl font-serif">Message Sent</h4></div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <input required type="text" value={contactForm.name} onChange={(e) => setContactForm({...contactForm, name: e.target.value})} className="w-full border px-4 py-3 bg-slate-50 rounded-sm" placeholder="Full Name" />
                <input required type="text" value={contactForm.contact} onChange={(e) => setContactForm({...contactForm, contact: e.target.value})} className="w-full border px-4 py-3 bg-slate-50 rounded-sm" placeholder="Email or Phone" />
                <textarea required rows={4} value={contactForm.message} onChange={(e) => setContactForm({...contactForm, message: e.target.value})} className="w-full border px-4 py-3 bg-slate-50 rounded-sm" placeholder="How can we help?" />
                <button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 text-white py-4 uppercase tracking-widest text-sm">{isSubmitting ? 'Sending...' : 'Send Message'}</button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-6 md:px-16 bg-[#F9F7F2]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center mb-16">
            <h2 className="text-xs font-medium tracking-widest text-amber-700 uppercase mb-4">The Jupilo Experience</h2>
            <h3 className="text-3xl md:text-5xl font-serif text-slate-900">Word of Mouth.</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "Jupilo doesn't just make clothes; they architect confidence. My bespoke suit was the undisputed highlight of the gala.",
                name: "Elena R.",
                role: "Bespoke Client"
              },
              {
                quote: "The Academy completely shifted my understanding of garment structure. A true masterclass in contemporary couture.",
                name: "Sarah M.",
                role: "Academy Alumna"
              },
              {
                quote: "Unapologetic elegance. The attention to detail in the ready-to-wear collection rivals top-tier European luxury houses.",
                name: "Aisha T.",
                role: "Ready-To-Wear"
              }
            ].map((testimonial, i) => (
              <div key={i} className="bg-white p-8 md:p-10 rounded-sm shadow-sm border border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 text-amber-500 mb-6">
                    ★★★★★
                  </div>
                  <p className="text-slate-600 font-light leading-relaxed mb-8">"{testimonial.quote}"</p>
                </div>
                <div>
                  <h4 className="font-serif text-slate-900 text-lg">{testimonial.name}</h4>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-1">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

     {/* FAQ SECTION (Premium Accordion) */}
      <section className="py-24 px-6 md:px-16 bg-white">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-serif text-slate-900 text-center mb-16">Frequently Asked.</h3>
          
          <div className="border-t border-slate-200">
            {[
              {
                question: "How do I book a bespoke fitting?",
                answer: "Bespoke consultations are strictly by appointment. You can initiate a request via our Contact form or directly through our WhatsApp concierge."
              },
              {
                question: "Do you ship internationally?",
                answer: "Yes, Jupilo caters to a global clientele. International shipping timelines vary based on the specific garment and destination."
              },
              {
                question: "What are the Academy prerequisites?",
                answer: "We welcome both passionate beginners and intermediate tailors. The only prerequisite is a relentless dedication to the craft of structural fashion."
              },
              {
                question: "How long does a custom piece take?",
                answer: "Bespoke creations typically require 4 to 6 weeks, accommodating multiple rigorous fittings to ensure absolute structural perfection."
              }
            ].map((faq, index) => (
              <div key={index} className="border-b border-slate-200">
                <button 
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full py-6 flex justify-between items-center text-left focus:outline-none group"
                >
                  <h4 className={`text-sm font-medium tracking-widest uppercase transition-colors duration-300 ${openFaq === index ? 'text-amber-700' : 'text-slate-900 group-hover:text-amber-700'}`}>
                    {faq.question}
                  </h4>
                  <span className={`text-slate-400 transition-transform duration-500 ${openFaq === index ? 'rotate-180' : 'rotate-0'}`}>
                    {openFaq === index ? <Minus size={18} className="text-amber-700" /> : <Plus size={18} />}
                  </span>
                </button>
                
                <div 
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    openFaq === index ? 'max-h-40 opacity-100 pb-6' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="text-slate-600 font-light text-sm leading-relaxed pr-8 md:pr-12">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* FOOTER */}
      <footer className="bg-slate-900 text-white pt-20 pb-10 px-6 md:px-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-slate-800 pb-16 mb-10">
          <div className="md:col-span-2">
            <div className="text-3xl font-serif font-bold tracking-widest mb-6">JUPILO.</div>
            <p className="text-slate-400 font-light max-w-sm leading-relaxed">
              Contemporary fashion, thoughtfully designed and meticulously crafted for women who want to stand out.
            </p>
          </div>
          
          <div>
            <h4 className="text-xs font-medium tracking-widest uppercase text-slate-500 mb-6">Explore</h4>
            <ul className="space-y-4 text-sm font-light text-slate-300">
              <li><a href="#collections" className="hover:text-amber-500 transition">Collections</a></li>
              <li><a href="#events" className="hover:text-amber-500 transition">Runway & Events</a></li>
              <li><a href="#academy" className="hover:text-amber-500 transition">The Academy</a></li>
              <li><a href="#founder" className="hover:text-amber-500 transition">The Designer</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-medium tracking-widest uppercase text-slate-500 mb-6">Connect</h4>
            <ul className="space-y-4 text-sm font-light text-slate-300">
              <li><a href="#" className="hover:text-amber-500 transition">Instagram</a></li>
              <li><a href="#" className="hover:text-amber-500 transition">Twitter (X)</a></li>
              <li><a href="#" className="hover:text-amber-500 transition">WhatsApp Concierge</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-widest text-slate-500">
          <p>© {new Date().getFullYear()} JUPILO FASHION. ALL RIGHTS RESERVED.</p>
          
          {/* SECRET ADMIN DOOR - Boosted z-index to ensure it is clickable */}
          <p className="mt-4 md:mt-0 text-slate-600 relative z-50">
            CRAFTED BY{' '}
            <a href="/admin" className="hover:text-amber-500 transition duration-500 cursor-pointer font-bold">
              GUV'NOR MAGKK.
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}