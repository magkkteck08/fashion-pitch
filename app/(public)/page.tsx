"use client";
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, MessageCircle, Menu, MapPin, Star, X, BookOpen, Loader2, CheckCircle, ChevronLeft, ChevronRight, ImageIcon, Plus, Minus } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

// HELPER FUNCTION
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

// PRODUCT CARD (Reusable for both catalogs)
const ProductCard = ({ item, onSelect }: { item: any, onSelect: (item: any) => void }) => {
  const extraImages = parseSupabaseArray(item.additional_images);
  const totalImages = extraImages.length > 0 ? extraImages.length + 1 : 1;

  return (
    <div 
      className="group cursor-pointer flex flex-col h-full min-w-[80vw] sm:min-w-[45vw] md:min-w-0 snap-center relative z-10" 
      onClick={() => onSelect(item)}
    >
      <div className="relative aspect-[4/5] mb-4 overflow-hidden rounded-sm bg-slate-100 shadow-sm border border-slate-200">
        <img
          src={item.image_url || "https://placehold.co/800x1000/eeeeee/999999?text=No+Image"}
          alt={item.name}
          className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 bg-white/90 text-slate-900 text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
          {item.category}
        </div>
        {totalImages > 1 && (
          <div className="absolute top-3 right-3 bg-black/70 text-white text-[10px] tracking-widest px-2 py-1 rounded-sm backdrop-blur-md flex items-center gap-1">
            <ImageIcon size={10} /> {totalImages}
          </div>
        )}
      </div>
      <h3 className="text-lg font-serif text-slate-900 group-hover:text-amber-700 transition line-clamp-1">{item.name}</h3>
      <p className="text-amber-700 font-medium mb-4">₦{item.price?.toLocaleString()}</p>
      <div className="mt-auto">
        <button 
          onClick={(e) => { e.stopPropagation(); onSelect(item); }} 
          className="w-full border border-slate-900 py-3 flex items-center justify-center gap-2 hover:bg-slate-900 hover:text-white transition rounded-sm text-[11px] font-medium tracking-widest uppercase"
        >
          Book / Order Now
        </button>
      </div>
    </div>
  );
};

// EVENT CARD
const EventCard = ({ ev, mounted }: { ev: any, mounted: boolean }) => {
  return (
    <Link href={`/events/${ev.slug}`} className="group border border-slate-700 rounded-sm flex flex-col md:flex-row overflow-hidden bg-slate-800/50 hover:border-amber-500 transition duration-300 h-full relative z-10">
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
          <span className="group-hover:translate-x-2 transition-transform">Read Details →</span>
        </div>
      </div>
    </Link>
  );
};

export default function LuxePublicSite() {
  const WHATSAPP_NUMBER = "2349073754047";
  const supabase = createClient();
  
  const [mounted, setMounted] = useState(false);
  
  // SEPARATE STATES FOR TWO DIFFERENT PRODUCT LISTS
  const [signatureProducts, setSignatureProducts] = useState<any[]>([]);
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
  
  const [visibleSignatureCount, setVisibleSignatureCount] = useState(4);
  const [visibleCount, setVisibleCount] = useState(8);

  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [contactForm, setContactForm] = useState({ name: '', contact: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function loadData() {
      // 1. Fetch main catalog (e.g., Bags/Accessories)
      const { data: prodData } = await supabase.from('products').select('*');
      
      // 2. Fetch NEW signature collection (e.g., Premium Hair Styles)
      const { data: sigData } = await supabase.from('signature_products' as any).select('*');
      
      const { data: eventData } = await supabase.from('events').select('*').order('event_date', { ascending: true });
      const { data: galData } = await supabase.from('gallery').select('*').limit(16);
      const { data: acadData } = await supabase.from('academy').select('*').limit(3);
      const { data: transData } = await supabase.from('transformations' as any).select('*').limit(2);
      
      if (prodData) setProducts(prodData);
      if (sigData) setSignatureProducts(sigData);
      if (eventData) setEvents(eventData);
      if (galData) setGallery(galData);
      if (acadData) setAcademyCourses(acadData);
      if (transData) setTransformations(transData);
    }
    loadData();
  }, [supabase]);

  const handleSelectProduct = (item: any) => {
    const extraImages = parseSupabaseArray(item.additional_images);
    setProductImages([item.image_url, ...extraImages].filter(Boolean));
    setCurrentImageIndex(0);
    setSelectedProduct(item);
  };

  const handleModalScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.clientWidth;
    setCurrentImageIndex(Math.round(scrollLeft / width));
  };

  const slideGallery = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth : clientWidth;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleAcademySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAcademySubmitting(true);
    const { error } = await supabase.from('academy_leads').insert([
      { name: academyForm.name, email: academyForm.email, contact: academyForm.contact, experience: academyForm.experience }
    ]);
    if (!error) {
      setAcademySuccess(true);
      setAcademyForm({ name: '', email: '', contact: '', experience: 'Beginner' });
    }
    setAcademySubmitting(false);
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
            
            <div className="w-full md:w-1/2 h-[45vh] md:h-[80vh] bg-slate-100 relative group">
              <div 
                ref={scrollRef}
                onScroll={handleModalScroll}
                className="flex overflow-x-auto snap-x snap-mandatory h-full w-full custom-scrollbar scroll-smooth" 
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
              >
                {productImages.map((img, idx) => (
                  <div key={idx} className="min-w-full h-full snap-center relative shrink-0 flex items-center justify-center">
                    <img src={img} className="w-full h-full object-cover object-center" alt={`${selectedProduct.name} - Angle ${idx + 1}`} />
                  </div>
                ))}
              </div>

              {productImages.length > 1 && (
                <>
                  <button onClick={() => slideGallery('left')} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-black p-2 rounded-full shadow-md backdrop-blur-md transition opacity-0 group-hover:opacity-100 hidden md:block"><ChevronLeft size={20} /></button>
                  <button onClick={() => slideGallery('right')} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-black p-2 rounded-full shadow-md backdrop-blur-md transition opacity-0 group-hover:opacity-100 hidden md:block"><ChevronRight size={20} /></button>
                  <div className="absolute bottom-6 right-6 bg-black/60 text-white text-[10px] tracking-widest px-3 py-1.5 rounded-sm backdrop-blur-md pointer-events-none transition-all">
                    {currentImageIndex + 1} / {productImages.length}
                  </div>
                </>
              )}
            </div>
            
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
                  onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=Hi LUXE CO., I want to book/order the ${selectedProduct.name} for ₦${selectedProduct.price?.toLocaleString()}.`, '_blank')}
                  className="flex-1 bg-slate-900 text-white py-4 px-2 text-[11px] font-medium tracking-widest uppercase rounded-sm hover:bg-slate-800 transition text-center"
                >
                  Order / Book Now
                </button>
                <button 
                  onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=Hi LUXE CO., I have an enquiry about the ${selectedProduct.name}.`, '_blank')}
                  className="flex-1 bg-transparent border border-slate-900 text-slate-900 py-4 px-2 text-[11px] font-medium tracking-widest uppercase rounded-sm hover:bg-slate-50 transition text-center"
                >
                  Make Enquiry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. HERO SECTION */}
      <section className="relative h-screen w-full flex flex-col justify-center px-6 md:px-16 bg-black">
        <img 
          src="/hero.jpg" 
          alt="Luxe Hair & Fashion" 
          className="absolute inset-0 w-full h-full object-cover saturate-[1.1] brightness-[0.8] contrast-[1.1]" 
          onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/2000x1200/222222/666666?text=Hero" }} 
        />
        
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent h-32"></div>
        
        {/* NAVIGATION BAR */}
        <nav className="fixed top-0 left-0 w-full z-50 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-slate-200 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-6 md:px-16 h-20 flex items-center justify-between">
            <div className="text-2xl font-serif font-bold tracking-widest text-slate-900">LUXE & CO.</div>
            <div className="hidden md:flex gap-8 text-[10px] font-medium tracking-widest uppercase text-slate-500">
              <a href="#signature" className="hover:text-amber-700 transition duration-300">Signature Hair</a>
              <a href="#collections" className="hover:text-amber-700 transition duration-300">Handbags</a>
              <a href="#lookbook" className="hover:text-amber-700 transition duration-300">Past Work</a>
              <a href="#academy" className="hover:text-amber-700 transition duration-300">Academy</a>
            </div>
            <button className="md:hidden text-slate-900 hover:text-amber-700 transition" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          <div className={`md:hidden absolute top-20 left-0 w-full bg-white border-b border-slate-200 shadow-2xl overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-80 opacity-100 py-6' : 'max-h-0 opacity-0 py-0'}`}>
            <div className="flex flex-col px-6 gap-6 text-xs tracking-widest uppercase font-medium text-slate-600">
              <a href="#signature" onClick={() => setIsMobileMenuOpen(false)}>Signature Hair</a>
              <a href="#collections" onClick={() => setIsMobileMenuOpen(false)}>Handbags</a>
              <a href="#lookbook" onClick={() => setIsMobileMenuOpen(false)}>Past Work</a>
              <a href="#academy" onClick={() => setIsMobileMenuOpen(false)}>Academy</a>
            </div>
          </div>
        </nav>
        
        <div className="relative z-10 mt-20 max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-serif leading-[1.1] mb-6 text-white drop-shadow-xl">
            CROWNED IN <br />ELEGANCE.
          </h1>
          <p className="text-base md:text-xl font-light mb-10 max-w-xl text-gray-200 drop-shadow-lg leading-relaxed">
            Premium hair braiding, exceptional crown care, and curated luxury handbags for the unapologetic woman.
          </p>
          <a href="#signature" className="inline-block bg-white text-black px-10 py-4 text-center font-medium uppercase tracking-widest text-xs hover:bg-amber-50 transition rounded-sm shadow-2xl">
            Explore Offerings
          </a>
        </div>

        {/* DIVIDER: Hero to Signature */}
        <div className="absolute bottom-[-1px] left-0 w-full overflow-hidden leading-[0]">
          <svg className="relative block w-full h-[50px] md:h-[100px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118,137.9,114,207.2,104.9,245.8,99.8,284.1,89.5,321.39,56.44Z" className="fill-white"></path>
          </svg>
        </div>
      </section>

      {/* 2. SIGNATURE ARRIVALS (Database Table 1) */}
      <section id="signature" className="relative pt-20 pb-32 px-6 md:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12 relative z-10">
            <div>
              <h2 className="text-xs font-medium tracking-widest text-amber-700 uppercase mb-2">Premium Hair</h2>
              <h3 className="text-3xl md:text-5xl font-serif text-slate-900">Signature Styles</h3>
            </div>
            {/* Desktop Navigation Arrows */}
            <div className="hidden md:flex gap-2 text-slate-400">
              <button onClick={() => slideGallery('left')} className="p-2 border border-slate-200 rounded-full hover:bg-slate-50"><ChevronLeft size={20}/></button>
              <button onClick={() => slideGallery('right')} className="p-2 border border-slate-200 rounded-full hover:bg-slate-50"><ChevronRight size={20}/></button>
            </div>
          </div>
          
          <div className="flex md:grid md:grid-cols-4 gap-6 overflow-x-auto snap-x snap-mandatory custom-scrollbar pb-8 -mx-6 px-6 md:mx-0 md:px-0 relative z-10">
            {signatureProducts.length > 0 ? (
              signatureProducts.slice(0, visibleSignatureCount).map((item) => (
                <ProductCard key={item.id} item={item} onSelect={handleSelectProduct} />
              ))
            ) : (
              <div className="col-span-4 text-center text-slate-400 py-16 border border-dashed border-slate-200 rounded-sm">
                Upload signature styles in the admin portal.
              </div>
            )}
          </div>

          {/* ADDED: The Load More Button for Signature Styles */}
          {visibleSignatureCount < signatureProducts.length && (
            <div className="mt-8 text-center relative z-10">
              <button 
                onClick={() => setVisibleSignatureCount(prev => prev + 4)} 
                className="border border-slate-900 text-slate-900 px-10 py-4 uppercase tracking-widest text-sm font-medium hover:bg-slate-900 hover:text-white transition rounded-sm"
              >
                Load More Styles
              </button>
            </div>
          )}
        </div>

        {/* DIVIDER: Signature to Founder */}
        <div className="absolute bottom-[-1px] left-0 w-full overflow-hidden leading-[0]">
          <svg className="relative block w-full h-[40px] md:h-[80px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M1200 120L0 16.48 0 0 1200 0 1200 120z" className="fill-[#FDFBF7]"></path>
          </svg>
        </div>
      </section>

      {/* 3. ABOUT / FOUNDER SECTION */}
      <section id="founder" className="relative pt-24 pb-40 px-6 md:px-16 flex flex-col md:flex-row gap-16 md:gap-24 items-center bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 md:gap-24 items-center w-full">
          <div className="w-full md:w-1/2 relative mt-8 md:mt-0 z-10">
            <div className="absolute top-6 -left-6 w-full h-full border border-amber-700/20 rounded-sm hidden md:block"></div>
            <div className="relative w-full aspect-[4/5] p-3 md:p-5 rounded-sm bg-white border border-slate-100 shadow-xl group">
              <div className="relative w-full h-full overflow-hidden rounded-sm bg-slate-100">
                <img 
                  src="/founder.jpg" 
                  alt="The Stylist" 
                  className="w-full h-full object-cover transition-transform duration-[2s] ease-in-out group-hover:scale-110" 
                  onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/800x1000/eeeeee/999999?text=Stylist+Image" }} 
                />
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-1/2 flex flex-col justify-center z-10 relative">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-[1px] bg-amber-700"></div>
              <h2 className="text-xs font-medium tracking-widest text-amber-700 uppercase">The Visionary</h2>
            </div>
            
            <h3 className="text-4xl md:text-6xl font-serif text-slate-900 leading-tight mb-8">Meet The Stylist.</h3>
            
            <div className="space-y-6 text-slate-600 text-base md:text-lg leading-relaxed font-light">
              <p>
                <span className="font-medium text-slate-900">LUXE & CO. is more than a salon or a boutique;</span> it is a sanctuary for crown care and premium accessories.
              </p>
              <p>
                With years of mastering intricate braiding techniques and an impeccable eye for luxury accessories, we bridge the gap between traditional hair artistry and contemporary fashion. Every braid is protective, precise, and painless. Every handbag is hand-selected to elevate your presence.
              </p>
              
              <div className="pt-6 mt-6">
                <blockquote className="pl-6 border-l-2 border-amber-500 italic text-slate-800 font-serif text-xl md:text-2xl leading-relaxed">
                  "Your hair is your crown, and your accessories are your armor. We ensure both are flawless."
                </blockquote>
              </div>
            </div>
          </div>
        </div>

        {/* DIVIDER: Founder to Collections */}
        <div className="absolute bottom-[-1px] left-0 w-full overflow-hidden leading-[0]">
          <svg className="relative block w-full h-[40px] md:h-[80px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M1200 120L0 16.48 0 0 1200 0 1200 120z" className="fill-white"></path>
          </svg>
        </div>
      </section>

      {/* 4. FULL COLLECTIONS (Database Table 2) */}
      <section id="collections" className="relative pt-20 pb-40 px-6 md:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12 relative z-10">
            <div>
              <h2 className="text-xs font-medium tracking-widest text-amber-700 uppercase mb-2">Luxury Accessories</h2>
              <h2 className="text-3xl md:text-5xl font-serif text-slate-900">Handbags & More</h2>
            </div>
            <div className="hidden md:flex gap-2 text-slate-400">
              <button onClick={() => slideGallery('left')} className="p-2 border border-slate-200 rounded-full hover:bg-slate-50"><ChevronLeft size={20}/></button>
              <button onClick={() => slideGallery('right')} className="p-2 border border-slate-200 rounded-full hover:bg-slate-50"><ChevronRight size={20}/></button>
            </div>
          </div>
          
          <div className="flex md:grid md:grid-cols-4 gap-6 overflow-x-auto snap-x snap-mandatory custom-scrollbar pb-8 -mx-6 px-6 md:mx-0 md:px-0 relative z-10">
            {products.length > 0 ? (
              products.slice(0, visibleCount).map((item) => (
                <ProductCard key={item.id} item={item} onSelect={handleSelectProduct} />
              ))
            ) : (
              <div className="col-span-4 text-center text-slate-400 py-16 border border-dashed border-slate-200 rounded-sm">
                Upload catalog products in the admin portal.
              </div>
            )}
          </div>

          {visibleCount < products.length && (
            <div className="mt-8 text-center relative z-10">
              <button 
                onClick={() => setVisibleCount(prev => prev + 4)} 
                className="border border-slate-900 text-slate-900 px-10 py-4 uppercase tracking-widest text-sm font-medium hover:bg-slate-900 hover:text-white transition rounded-sm"
              >
                Load More
              </button>
            </div>
          )}
        </div>

        {/* DIVIDER: Collections to Transformations */}
        <div className="absolute bottom-[-1px] left-0 w-full overflow-hidden leading-[0]">
          <svg className="relative block w-full h-[60px] md:h-[120px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" className="fill-slate-900"></path>
          </svg>
        </div>
      </section>

      {/* 5. BEFORE & AFTER / TRANSFORMATIONS */}
      <section id="transformations" className="relative pt-24 pb-48 px-6 md:px-16 bg-slate-900 text-white text-center">
        <div className="relative z-10 max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-serif mb-4">THE TRANSFORMATION.</h2>
          <p className="text-slate-400 mb-16 max-w-2xl mx-auto">Witness the precision and artistry of our premium protective styles.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {transformations.length > 0 ? transformations.slice(0, 2).map((item) => (
              <div key={item.id} className="flex flex-col group cursor-pointer z-10">
                 <div className="flex w-full aspect-[4/5] md:aspect-[4/3] rounded-sm overflow-hidden shadow-2xl mb-6 border border-slate-700 relative">
                   <div className="w-1/2 relative border-r border-slate-800 overflow-hidden">
                     <img src={item.before_image} alt="Before" className="w-full h-full object-cover grayscale-[50%] opacity-80 transition duration-[1.5s] group-hover:scale-105 group-hover:grayscale-0 group-hover:opacity-100" />
                     <span className="absolute bottom-4 left-4 bg-black/80 px-3 py-1 text-[10px] uppercase tracking-widest rounded-sm backdrop-blur-sm">Before</span>
                   </div>
                   <div className="w-1/2 relative overflow-hidden bg-slate-800">
                     <img src={item.after_image} alt="After" className="w-full h-full object-cover transition duration-[1.5s] group-hover:scale-105" />
                     <span className="absolute bottom-4 right-4 bg-amber-700/90 px-3 py-1 text-[10px] uppercase tracking-widest rounded-sm backdrop-blur-sm shadow-lg text-white">After</span>
                   </div>
                 </div>
                 <h4 className="text-2xl font-serif text-amber-500 group-hover:text-white transition">{item.title}</h4>
              </div>
            )) : (
              <div className="col-span-2 text-slate-500 py-24 border border-dashed border-slate-700 rounded-sm tracking-widest text-sm uppercase z-10">Upload transformations in the admin portal.</div>
            )}
          </div>
        </div>

        {/* DIVIDER: Transformations to Lookbook */}
        <div className="absolute bottom-[-1px] left-0 w-full overflow-hidden leading-[0]">
          <svg className="relative block w-full h-[50px] md:h-[100px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V120H0Z" opacity=".25" className="fill-white"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V120H0Z" opacity=".5" className="fill-white"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V120H0Z" className="fill-white"></path>
          </svg>
        </div>
      </section>

      {/* 6. CLIENT LOOKBOOK (Gallery of Past Work) */}
      <section id="lookbook" className="relative pt-24 pb-40 px-6 md:px-16 bg-white">
        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-5xl font-serif mb-4 text-slate-900 text-center">Past Work</h2>
          <p className="text-slate-500 mb-12 text-center max-w-xl mx-auto">See our craftsmanship in the real world.</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {gallery.slice(0, visibleGalleryCount).map((img, i) => (
              <div key={img.id || i} className="relative group overflow-hidden rounded-sm aspect-[4/5] bg-slate-100">
                <img src={img.image_url} alt="Client Lookbook" className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                
                {/* MOBILE: Always visible at bottom. DESKTOP: Full overlay on hover. */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end md:items-center justify-center pb-6 md:pb-0 backdrop-blur-[0px] md:group-hover:backdrop-blur-[2px]">
                  <button 
                    onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=Hi LUXE CO., I want to book/enquire about a style I saw in your Lookbook.`, '_blank')}
                    className="bg-white text-slate-900 px-4 md:px-6 py-2.5 md:py-3 text-[9px] md:text-[10px] uppercase tracking-widest font-medium rounded-sm shadow-xl hover:bg-amber-50 transition transform translate-y-0 md:translate-y-4 group-hover:translate-y-0 duration-300"
                  >
                    Book This Look
                  </button>
                </div>
              </div>
            ))}
          </div>

          {visibleGalleryCount < gallery.length && (
            <div className="mt-16 text-center">
              <button 
                onClick={() => setVisibleGalleryCount(prev => prev + 4)} 
                className="border border-slate-900 text-slate-900 px-10 py-4 uppercase tracking-widest text-sm font-medium hover:bg-slate-900 hover:text-white transition rounded-sm"
              >
                Load More Styles
              </button>
            </div>
          )}
        </div>

        {/* DIVIDER: Lookbook to Events */}
        <div className="absolute bottom-[-1px] left-0 w-full overflow-hidden leading-[0]">
          <svg className="relative block w-full h-[40px] md:h-[80px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V120H0Z" className="fill-[#FDFBF7]"></path>
          </svg>
        </div>
      </section>

      {/* 7. EVENTS / POP-UPS SECTION */}
      <section id="events" className="relative pt-24 pb-40 px-6 md:px-16 bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-slate-900 mb-4">POP-UPS & MASTERCLASSES.</h2>
            <p className="text-slate-500">Join our exclusive styling events and bag collection launches.</p>
          </div>
          
          <div className="flex flex-col gap-8 max-w-5xl mx-auto">
            {events.length > 0 ? (
              events.map((ev) => <EventCard key={ev.id} ev={ev} mounted={mounted} />)
            ) : (
              <div className="text-center text-slate-400 py-24 border border-dashed border-slate-200 rounded-sm">
                Stay tuned for upcoming pop-up events.
              </div>
            )}
          </div>
        </div>

        {/* DIVIDER: Events to Academy */}
        <div className="absolute bottom-[-1px] left-0 w-full overflow-hidden leading-[0]">
          <svg className="relative block w-full h-[40px] md:h-[80px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
             <path d="M1200 120L0 16.48 0 0 1200 0 1200 120z" className="fill-[#F9F7F2]"></path>
          </svg>
        </div>
      </section>

      {/* 8. ACADEMY SECTION */}
      <section id="academy" className="relative pt-24 pb-40 px-6 md:px-16 bg-[#F9F7F2]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center relative z-10">
          <div className="w-full lg:w-1/2">
            <div className="flex items-center gap-4 mb-6">
              <BookOpen className="text-amber-700" size={24} />
              <h2 className="text-xs font-medium tracking-widest text-amber-700 uppercase">LUXE Academy</h2>
            </div>
            <h3 className="text-4xl md:text-5xl font-serif text-slate-900 leading-tight mb-8">Master the Art of Braiding.</h3>
            
            <div className="relative w-full aspect-video md:aspect-[4/3] rounded-sm overflow-hidden shadow-lg mb-8">
              <img src="/academy.jpg" alt="Braiding Academy" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/800x600/eeeeee/999999?text=Academy+Image" }} />
            </div>

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
                <h4 className="text-2xl font-serif text-slate-900 mb-3">Professional Braiding Masterclass</h4>
                <p className="text-slate-600 mb-4 text-sm leading-relaxed">Join our next cohort to learn precision parting, painless gripping techniques, and the business of premium hair care.</p>
              </div>
            )}
          </div>

          <div className="w-full lg:w-1/2 bg-white p-8 md:p-12 rounded-sm shadow-xl border border-slate-100 relative overflow-hidden">
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
                        <option value="Beginner">Beginner (No prior braiding experience)</option>
                        <option value="Intermediate">Intermediate (Knows basic styles)</option>
                        <option value="Advanced">Advanced (Looking to refine speed/technique)</option>
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

        {/* DIVIDER: Academy to FAQ */}
        <div className="absolute bottom-[-1px] left-0 w-full overflow-hidden leading-[0]">
          <svg className="relative block w-full h-[50px] md:h-[80px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118,137.9,114,207.2,104.9,245.8,99.8,284.1,89.5,321.39,56.44Z" className="fill-white"></path>
          </svg>
        </div>
      </section>

      {/* 9. FAQ SECTION */}
      <section className="relative pt-24 pb-40 px-6 md:px-16 bg-white">
        <div className="max-w-3xl mx-auto relative z-10">
          <h3 className="text-3xl md:text-4xl font-serif text-slate-900 text-center mb-16">Frequently Asked.</h3>
          
          <div className="border-t border-slate-200">
            {[
              {
                question: "How do I book a hair appointment?",
                answer: "Appointments are strictly by booking. You can initiate a request via our Contact form below or message our WhatsApp concierge directly with your desired style."
              },
              {
                question: "Do you ship handbags internationally?",
                answer: "Yes, we cater to a global clientele. Handbag shipping timelines vary based on the specific piece and your destination."
              },
              {
                question: "Is hair included in the braiding service?",
                answer: "Yes, premium extensions are included in most of our braiding packages to ensure the color match and texture meet our luxury standards. Please specify your color when booking."
              },
              {
                question: "How long do the braids typically last?",
                answer: "With our specialized techniques and proper at-home maintenance, our protective styles remain neat and secure for 4 to 6 weeks without causing tension to your edges."
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
                
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openFaq === index ? 'max-h-40 opacity-100 pb-6' : 'max-h-0 opacity-0'}`}>
                  <p className="text-slate-600 font-light text-sm leading-relaxed pr-8 md:pr-12">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DIVIDER: FAQ to Contact */}
        <div className="absolute bottom-[-1px] left-0 w-full overflow-hidden leading-[0]">
          <svg className="relative block w-full h-[40px] md:h-[80px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V120H0Z" className="fill-[#F9F7F2]"></path>
          </svg>
        </div>
      </section>

      {/* 10. CONTACT */}
      <section id="contact" className="relative pt-24 pb-48 px-6 md:px-16 bg-[#F9F7F2]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-16 relative z-10">
          <div className="w-full md:w-1/2">
            <h3 className="text-4xl md:text-5xl font-serif text-slate-900 leading-tight mb-6">Let's craft your look.</h3>
            <p className="text-slate-600 mb-8">Reach out to book an appointment, reserve a handbag, or inquire about masterclasses.</p>
          </div>
          <div className="w-full md:w-1/2 bg-white p-8 rounded-sm shadow-xl border border-slate-100">
            {submitSuccess ? (
              <div className="text-center py-12"><CheckCircle className="text-green-500 mx-auto mb-4" size={48} /><h4 className="text-2xl font-serif">Message Sent</h4></div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <input required type="text" value={contactForm.name} onChange={(e) => setContactForm({...contactForm, name: e.target.value})} className="w-full border px-4 py-3 bg-slate-50 rounded-sm" placeholder="Full Name" />
                <input required type="text" value={contactForm.contact} onChange={(e) => setContactForm({...contactForm, contact: e.target.value})} className="w-full border px-4 py-3 bg-slate-50 rounded-sm" placeholder="Email or Phone" />
                <textarea required rows={4} value={contactForm.message} onChange={(e) => setContactForm({...contactForm, message: e.target.value})} className="w-full border px-4 py-3 bg-slate-50 rounded-sm" placeholder="How can we help?" />
                <button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 text-white py-4 uppercase tracking-widest text-sm hover:bg-amber-700 transition">{isSubmitting ? 'Sending...' : 'Send Message'}</button>
              </form>
            )}
          </div>
        </div>

        {/* DIVIDER: Contact to Footer (Deep Sweeping Wave) */}
        <div className="absolute bottom-[-1px] left-0 w-full overflow-hidden leading-[0]">
          <svg className="relative block w-full h-[60px] md:h-[150px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" className="fill-slate-900"></path>
          </svg>
        </div>
      </section>
      
      {/* 11. FOOTER */}
      <footer className="bg-slate-900 text-white pt-10 pb-10 px-6 md:px-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-slate-800 pb-16 mb-10">
          <div className="md:col-span-2">
            <div className="text-3xl font-serif font-bold tracking-widest mb-6">LUXE & CO.</div>
            <p className="text-slate-400 font-light max-w-sm leading-relaxed">
              Flawless braiding, premium hair care, and meticulously curated luxury handbags for the unapologetic woman.
            </p>
          </div>
          
          <div>
            <h4 className="text-xs font-medium tracking-widest uppercase text-slate-500 mb-6">Explore</h4>
            <ul className="space-y-4 text-sm font-light text-slate-300">
              <li><a href="#signature" className="hover:text-amber-500 transition">Signature</a></li>
              <li><a href="#collections" className="hover:text-amber-500 transition">Full Catalog</a></li>
              <li><a href="#lookbook" className="hover:text-amber-500 transition">Client Lookbook</a></li>
              <li><a href="#academy" className="hover:text-amber-500 transition">The Academy</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-medium tracking-widest uppercase text-slate-500 mb-6">Connect</h4>
            <ul className="space-y-4 text-sm font-light text-slate-300">
              <li><a href="#" className="hover:text-amber-500 transition">Instagram</a></li>
              <li><a href="#" className="hover:text-amber-500 transition">TikTok</a></li>
              <li><a href="#" className="hover:text-amber-500 transition">WhatsApp Concierge</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-widest text-slate-500">
          <p>© {new Date().getFullYear()} LUXE HAIR & BAGS. ALL RIGHTS RESERVED.</p>
          
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