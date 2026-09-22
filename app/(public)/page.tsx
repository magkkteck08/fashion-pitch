"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ImageIcon, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

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

// LIGHTWEIGHT MARKDOWN PARSER FOR DESCRIPTIONS
const FormattedDescription = ({ text }: { text: string }) => {
  if (!text) return null;
  
  return (
    <div className="text-slate-600 text-sm leading-relaxed space-y-3">
      {text.split('\n').map((line, i) => {
        if (line.trim().startsWith('- ')) {
          return <li key={i} className="ml-4 list-disc marker:text-amber-500 pl-1">{line.substring(2)}</li>;
        }
        
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={i}>
            {parts.map((part, j) => 
              part.startsWith('**') && part.endsWith('**') 
                ? <strong key={j} className="font-bold text-slate-900">{part.slice(2, -2)}</strong> 
                : part
            )}
          </p>
        );
      })}
    </div>
  );
};

const ProductCard = ({ item, onSelect }: { item: any, onSelect: (item: any) => void }) => {
  const extraImages = parseSupabaseArray(item.additional_images);
  const totalImages = extraImages.length > 0 ? extraImages.length + 1 : 1;
  const isOutOfStock = item.stock_count === 0;

  return (
    <div className="group cursor-pointer flex flex-col h-full w-full relative z-10" onClick={() => onSelect(item)}>
      <div className="relative aspect-square mb-3 overflow-hidden bg-slate-100 shadow-sm border border-slate-200">
        <img src={item.image_url || "https://placehold.co/800x800"} alt={item.name} loading="lazy" className={`w-full h-full object-cover transition duration-700 ${isOutOfStock ? 'grayscale opacity-70' : 'group-hover:scale-105'}`} />
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-slate-900 text-[8px] md:text-[9px] uppercase tracking-widest px-2.5 py-1 shadow-sm border border-slate-100">{item.category}</div>
        {totalImages > 1 && (<div className="absolute top-3 right-3 bg-black/70 text-white text-[9px] tracking-widest px-2 py-1 backdrop-blur-md flex items-center gap-1"><ImageIcon size={10} /> {totalImages}</div>)}
        {isOutOfStock && (<div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center"><span className="bg-red-600 text-white px-4 py-2 text-[10px] font-bold tracking-widest uppercase shadow-xl">Out of Stock</span></div>)}
      </div>
      <h3 className="text-sm md:text-base font-serif text-slate-900 group-hover:text-amber-700 transition line-clamp-1">{item.name}</h3>
      <p className="text-amber-700 font-medium text-xs md:text-sm mb-4">₦{item.price?.toLocaleString()}</p>
      <div className="mt-auto">
        <button className={`w-full border py-2.5 flex items-center justify-center transition text-[9px] md:text-[10px] font-bold tracking-widest uppercase ${isOutOfStock ? 'border-slate-300 text-slate-400 bg-slate-50 cursor-not-allowed' : 'border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white'}`}>
          {isOutOfStock ? 'Sold Out' : 'View Details'}
        </button>
      </div>
    </div>
  );
};

export default function LuxePublicSite() {
  const WHATSAPP_NUMBER = "2349073754047";
  const supabase = createClient();
  
  const [products, setProducts] = useState<any[]>([]);
  const [premiumProducts, setPremiumProducts] = useState<any[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const filters = ['All', 'Bags', 'Shoes', 'Palm Wears', 'Cloth', 'Men', 'Women'];

  useEffect(() => {
    async function loadData() {
      const { data: prodData } = await supabase.from('products').select('*').limit(40);
      const { data: premiumData } = await supabase.from('signature_products' as any).select('*').limit(40);
      
      if (prodData) setProducts(prodData);
      if (premiumData) setPremiumProducts(premiumData);
    }
    loadData();
  }, [supabase]);

  const filteredProducts = activeFilter === 'All' 
    ? products 
    : products.filter(p => {
        let searchTarget = activeFilter.toLowerCase();
        if (searchTarget.endsWith('s') && searchTarget !== 'men' && searchTarget !== 'women') searchTarget = searchTarget.slice(0, -1);
        const cat = (p.category || '').toLowerCase();
        const tagsString = JSON.stringify(p.tags || []).toLowerCase();
        return cat.includes(searchTarget) || tagsString.includes(searchTarget);
      });

  const handleSelectProduct = (item: any) => {
    const extraImages = parseSupabaseArray(item.additional_images);
    setProductImages([item.image_url, ...extraImages].filter(Boolean));
    setCurrentImageIndex(0);
    
    const availableColors = parseSupabaseArray(item.colors);
    const availableSizes = parseSupabaseArray(item.sizes);
    setSelectedColor(availableColors.length > 0 ? availableColors[0] : 'Standard');
    setSelectedSize(availableSizes.length > 0 ? availableSizes[0] : 'OS');
    
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

  // WhatsApp Order Formatter
  const handleCheckout = () => {
    if (!selectedProduct) return;
    const message = `Hello LUXE & CO., I would like to place an order for:%0A%0A*Item:* ${selectedProduct.name}%0A*Color:* ${selectedColor}%0A*Size:* ${selectedSize}%0A*Price:* ₦${selectedProduct.price?.toLocaleString()}%0A%0APlease let me know the payment details.`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  const modalColors = selectedProduct ? (parseSupabaseArray(selectedProduct.colors).length > 0 ? parseSupabaseArray(selectedProduct.colors) : ['Standard']) : [];
  const modalSizes = selectedProduct ? (parseSupabaseArray(selectedProduct.sizes).length > 0 ? parseSupabaseArray(selectedProduct.sizes) : ['OS']) : [];

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-slate-900 font-sans selection:bg-amber-900 selection:text-white overflow-x-hidden">
      
      {/* PRODUCT MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 md:p-12">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer" onClick={() => setSelectedProduct(null)}></div>
          <div className="relative bg-white w-full h-full md:h-auto md:max-w-5xl md:max-h-[95vh] overflow-hidden flex flex-col md:flex-row shadow-2xl">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 z-50 bg-white/90 text-black p-2 rounded-full shadow-md backdrop-blur-md hover:bg-slate-100 transition"><X size={20} /></button>
            <div className="w-full md:w-1/2 h-[50vh] md:h-[85vh] bg-slate-50 relative group border-b md:border-b-0 md:border-r border-slate-200">
              <div ref={scrollRef} onScroll={handleModalScroll} className="flex overflow-x-auto snap-x snap-mandatory h-full w-full custom-scrollbar scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
                {productImages.map((img, idx) => (
                  <div key={idx} className="min-w-full h-full snap-center relative shrink-0 flex items-center justify-center p-0 md:p-8">
                    <img src={img} className="w-full h-full object-cover md:rounded-sm shadow-sm" alt={`${selectedProduct.name} - Angle ${idx + 1}`} />
                  </div>
                ))}
              </div>
              {productImages.length > 1 && (
                <>
                  <button onClick={() => slideGallery('left')} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black p-2 rounded-full shadow-md backdrop-blur-md transition opacity-0 group-hover:opacity-100 hidden md:block"><ChevronLeft size={20} /></button>
                  <button onClick={() => slideGallery('right')} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black p-2 rounded-full shadow-md backdrop-blur-md transition opacity-0 group-hover:opacity-100 hidden md:block"><ChevronRight size={20} /></button>
                  <div className="absolute bottom-4 right-4 bg-slate-900/80 text-white text-[10px] tracking-widest px-3 py-1.5 backdrop-blur-md pointer-events-none">
                    {currentImageIndex + 1} / {productImages.length}
                  </div>
                </>
              )}
            </div>
            
            <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col h-[50vh] md:h-[85vh] overflow-y-auto">
              <div className="text-[10px] md:text-xs text-amber-700 uppercase tracking-widest mb-2 font-bold">{selectedProduct.category}</div>
              <h2 className="text-2xl md:text-4xl font-serif mb-2 text-slate-900 leading-tight">{selectedProduct.name}</h2>
              <p className="text-xl md:text-2xl text-amber-700 font-medium mb-6">₦{selectedProduct.price?.toLocaleString()}</p>
              <div className="w-full h-[1px] bg-slate-100 mb-6"></div>

              <div className="mb-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900 block mb-3">Color / Tone</span>
                <div className="flex flex-wrap gap-2">
                  {modalColors.map((c: string) => (
                     <button key={c} onClick={() => setSelectedColor(c)} className={`px-4 py-2 text-[10px] md:text-xs tracking-wide uppercase transition border ${selectedColor === c ? 'border-amber-700 text-amber-800 bg-amber-50 font-bold' : 'border-slate-200 text-slate-600 hover:border-slate-400'}`}>{c}</button>
                  ))}
                </div>
              </div>
              
              <div className="mb-8">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900 block mb-3">Size / Fit</span>
                <div className="flex flex-wrap gap-2">
                  {modalSizes.map((s: string) => (
                     <button key={s} onClick={() => setSelectedSize(s)} className={`px-4 py-2 text-[10px] md:text-xs tracking-wide uppercase transition border ${selectedSize === s ? 'border-amber-700 text-amber-800 bg-amber-50 font-bold' : 'border-slate-200 text-slate-600 hover:border-slate-400'}`}>{s}</button>
                  ))}
                </div>
              </div>
              
              {/* SINGLE ADD TO CART / CHECKOUT BUTTON */}
              <div className="mb-8 shrink-0 w-full">
                <button 
                  disabled={selectedProduct.stock_count === 0} 
                  onClick={handleCheckout} 
                  className={`w-full py-4 px-4 text-[11px] md:text-[12px] font-bold tracking-widest uppercase transition text-center shadow-lg rounded-sm ${selectedProduct.stock_count === 0 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800 hover:-translate-y-0.5'}`}
                >
                  {selectedProduct.stock_count === 0 ? 'Out of Stock' : 'Add to Cart & Checkout'}
                </button>
              </div>

              <div className="w-full h-[1px] bg-slate-100 mb-6"></div>

              <div className="pb-8">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900 block mb-4">Product Details</span>
                <FormattedDescription text={selectedProduct.description} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NAVIGATION BAR */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-slate-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 md:px-16 h-16 md:h-20 flex items-center justify-between">
          <div className="text-xl md:text-2xl font-serif font-bold tracking-widest text-slate-900">LUXE & CO.</div>
          <div className="hidden md:flex gap-8 text-[10px] font-bold tracking-widest uppercase text-slate-500">
            <a href="#premium" className="hover:text-amber-700 transition duration-300">Premium Line</a>
            <a href="#catalog" className="hover:text-amber-700 transition duration-300">Full Catalog</a>
            <a href="#testimonials" className="hover:text-amber-700 transition duration-300">Testimonials</a>
          </div>
          <button className="md:hidden text-slate-900 hover:text-amber-700 transition" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        <div className={`md:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-100 shadow-2xl overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-80 opacity-100 py-6' : 'max-h-0 opacity-0 py-0'}`}>
          <div className="flex flex-col px-6 gap-6 text-xs tracking-widest uppercase font-bold text-slate-600">
            <a href="#premium" onClick={() => setIsMobileMenuOpen(false)}>Premium Line</a>
            <a href="#catalog" onClick={() => setIsMobileMenuOpen(false)}>Full Catalog</a>
            <a href="#testimonials" onClick={() => setIsMobileMenuOpen(false)}>Testimonials</a>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-24 pb-12 md:pt-32 md:pb-24 px-6 md:px-16 bg-[#FDFBF7] border-b border-slate-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-16">
          <div className="w-full md:w-1/2 relative z-10">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif leading-[1.1] mb-4 md:mb-6 text-slate-900">CROWNED IN <br />ELEGANCE.</h1>
            <p className="text-sm md:text-lg font-light mb-8 md:mb-10 max-w-md text-slate-600 leading-relaxed">Curated luxury fashion, premium apparel, and accessories for the modern, unapologetic individual.</p>
            <a href="#catalog" className="inline-block bg-slate-900 text-white px-8 md:px-10 py-3.5 md:py-4 text-center font-bold uppercase tracking-widest text-[10px] md:text-xs hover:bg-amber-700 transition shadow-xl rounded-sm">Shop Collection</a>
          </div>
          <div className="w-full md:w-1/2 aspect-square md:aspect-[4/3] bg-slate-200 relative overflow-hidden rounded-sm shadow-sm">
             <img src="/hero.jpg" alt="Luxe E-Commerce" className="absolute inset-0 w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/1200x800/eeeeee/999999?text=Hero+Image" }} />
          </div>
        </div>
      </section>

      {/* FILTER BAR */}
      <div className="sticky top-16 md:top-20 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 py-3 md:py-4 px-6 md:px-16 overflow-x-auto custom-scrollbar flex gap-2 md:gap-4 justify-start md:justify-center">
        {filters.map(filter => (
          <button key={filter} onClick={() => setActiveFilter(filter)} className={`px-4 py-2 text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap transition border rounded-sm ${activeFilter === filter ? 'border-amber-700 text-amber-800 bg-amber-50' : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>
            {filter}
          </button>
        ))}
      </div>

      {/* CATALOG SECTION */}
      <section id="catalog" className="relative py-16 md:py-24 px-6 md:px-16 bg-[#FFFFFF]">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-8 md:mb-12">
            <div>
              <h2 className="text-[10px] md:text-xs font-bold tracking-widest text-amber-700 uppercase mb-1 md:mb-2">New Arrivals</h2>
              <h3 className="text-2xl md:text-4xl font-serif text-slate-900">Main Catalog</h3>
            </div>
            <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">{filteredProducts.length} Items • Swipe</div>
          </div>
          <div className="flex flex-nowrap gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory custom-scrollbar pb-6 -mx-6 px-6 md:mx-0 md:px-0">
            {filteredProducts.length > 0 ? (
              filteredProducts.slice(0, 10).map((item) => (
                <div key={item.id} className="snap-start shrink-0 w-[65vw] md:w-[280px]"><ProductCard item={item} onSelect={handleSelectProduct} /></div>
              ))
            ) : (
              <div className="w-full text-center text-slate-400 py-16 border border-dashed border-slate-200 text-xs md:text-sm">No items found for this category.</div>
            )}
          </div>
        </div>
      </section>

      {/* PREMIUM COLLECTION SECTION */}
      <section id="premium" className="relative py-16 md:py-24 px-6 md:px-16 bg-[#FDFBF7] border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-8 md:mb-12">
            <div>
              <h2 className="text-[10px] md:text-xs font-bold tracking-widest text-amber-700 uppercase mb-1 md:mb-2">Exclusive Line</h2>
              <h3 className="text-2xl md:text-4xl font-serif text-slate-900">Premium Collection</h3>
            </div>
            <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">{premiumProducts.slice(0, 10).length} Items • Swipe</div>
          </div>
          <div className="flex flex-nowrap gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory custom-scrollbar pb-6 -mx-6 px-6 md:mx-0 md:px-0">
            {premiumProducts.length > 0 ? (
              premiumProducts.slice(0, 10).map((item) => (
                <div key={item.id} className="snap-start shrink-0 w-[65vw] md:w-[280px]"><ProductCard item={item} onSelect={handleSelectProduct} /></div>
              ))
            ) : (
              <div className="w-full text-center text-slate-400 py-16 border border-dashed border-slate-200 text-xs md:text-sm">Premium catalog is currently empty.</div>
            )}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section id="testimonials" className="relative py-16 md:py-24 px-6 md:px-16 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-2xl md:text-4xl font-serif text-slate-900 text-center mb-10 md:mb-16">Client Testimonials</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Aisha T.",
                role: "Verified Buyer",
                text: "The quality of the premium bags is unmatched. It arrived exactly as pictured, beautifully packaged. I’ve never received so many compliments."
              },
              {
                name: "Sarah M.",
                role: "VIP Client",
                text: "LUXE & CO. completely elevated my wardrobe. The detailing on their signature pieces proves they care about true luxury."
              },
              {
                name: "Chika O.",
                role: "Verified Buyer",
                text: "Seamless ordering process and exceptional customer service via WhatsApp. The material feels incredible. Definitely my new go-to store."
              }
            ].map((testimonial, i) => (
              <div key={i} className="bg-[#FDFBF7] p-8 border border-slate-100 rounded-sm shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 text-amber-500 mb-6">
                    {[...Array(5)].map((_, idx) => <Star key={idx} size={16} fill="currentColor" />)}
                  </div>
                  <p className="text-slate-600 leading-relaxed text-sm italic mb-8">"{testimonial.text}"</p>
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-xs uppercase tracking-widest">{testimonial.name}</p>
                  <p className="text-[10px] text-amber-700 uppercase tracking-widest">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* FOOTER */}
      <footer className="bg-slate-900 text-white pt-16 pb-8 px-6 md:px-16 border-t-4 border-amber-700">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 border-b border-slate-800 pb-10 mb-8">
          <div className="md:col-span-2">
            <div className="text-2xl md:text-3xl font-serif font-bold tracking-widest mb-4">LUXE & CO.</div>
            <p className="text-slate-400 font-light text-sm max-w-sm leading-relaxed">Premium fashion and lifestyle curated for the modern, unapologetic individual. Fast shipping, global delivery.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-1 gap-8 md:gap-0">
            <div>
              <h4 className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-4">Shop</h4>
              <ul className="space-y-3 text-xs font-light text-slate-300">
                <li><a href="#catalog" className="hover:text-amber-500 transition">All Products</a></li>
                <li><a href="#premium" className="hover:text-amber-500 transition">Premium Line</a></li>
              </ul>
            </div>
            <div className="md:mt-8">
              <h4 className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-4">Support</h4>
              <ul className="space-y-3 text-xs font-light text-slate-300">
                <li><a href="#" className="hover:text-amber-500 transition">Shipping & Returns</a></li>
                <li><a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" className="hover:text-amber-500 transition">WhatsApp Support</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-[8px] md:text-[10px] uppercase tracking-widest text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} LUXE & CO. ALL RIGHTS RESERVED.</p>
          <p className="text-slate-600">CRAFTED BY <a href="/admin" className="hover:text-amber-500 transition font-bold">GUV'NOR MAGKK.</a></p>
        </div>
      </footer>
    </div>
  );
}