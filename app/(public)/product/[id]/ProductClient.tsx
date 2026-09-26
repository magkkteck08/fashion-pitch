'use client';
import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';

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

const FormattedDescription = ({ text }: { text: string }) => {
  if (!text) return null;
  return (
    <div className="text-slate-600 text-sm leading-relaxed space-y-3">
      {text.split('\n').map((line, i) => {
        if (line.trim().startsWith('- ')) return <li key={i} className="ml-4 list-disc marker:text-amber-500 pl-1">{line.substring(2)}</li>;
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={i}>
            {parts.map((part, j) => part.startsWith('**') && part.endsWith('**') ? <strong key={j} className="font-bold text-slate-900">{part.slice(2, -2)}</strong> : part)}
          </p>
        );
      })}
    </div>
  );
};

export default function ProductClient({ product }: { product: any }) {
  const extraImages = parseSupabaseArray(product.additional_images);
  const mainImage = product.image_url || product.image;
  const productImages = [mainImage, ...extraImages].filter(Boolean);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const availableColors = parseSupabaseArray(product.colors);
  const availableSizes = parseSupabaseArray(product.sizes);
  
  const [selectedColor, setSelectedColor] = useState(availableColors.length > 0 ? availableColors[0] : 'Standard');
  const [selectedSize, setSelectedSize] = useState(availableSizes.length > 0 ? availableSizes[0] : 'OS');
  const [isAdding, setIsAdding] = useState(false);

  // Added function to handle image switching via arrows
  const scrollImage = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      scrollRef.current.scrollBy({ 
        left: direction === 'left' ? -clientWidth : clientWidth, 
        behavior: 'smooth' 
      });
    }
  };

  const addToCart = () => {
    setIsAdding(true);
    const cartId = `${product.id}-${selectedColor}-${selectedSize}`;
    const savedCart = JSON.parse(localStorage.getItem('luxe_cart') || '[]');
    const existingItem = savedCart.find((c: any) => c.cartId === cartId);

    if (existingItem) {
      if (existingItem.quantity + 1 > product.stock_count) {
        alert(`Cannot add more. Only ${product.stock_count} available.`);
        setIsAdding(false);
        return;
      }
      existingItem.quantity += 1;
    } else {
      if (product.stock_count < 1) {
        alert("This item is out of stock.");
        setIsAdding(false);
        return;
      }
      savedCart.push({
        cartId,
        product_id: product.id,
        name: product.name,
        price: product.price,
        image: mainImage,
        color: selectedColor,
        size: selectedSize,
        quantity: 1,
        tableType: product.tableType,
        maxStock: product.stock_count
      });
    }

    localStorage.setItem('luxe_cart', JSON.stringify(savedCart));
    
    // Redirect back to store to open cart
    setTimeout(() => {
      window.location.href = '/';
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Mini Nav */}
      <nav className="w-full bg-white border-b border-slate-100 p-6 flex justify-between items-center">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft size={16} /> Store
        </Link>
        <div className="text-xl font-serif font-bold tracking-widest text-slate-900">LUXE & CO.</div>
        <div className="w-16"></div> {/* Spacer */}
      </nav>

      <div className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-12">
        <div className="bg-white w-full overflow-hidden flex flex-col md:flex-row shadow-2xl border border-slate-100">
          
          {/* Image Carousel */}
          <div className="w-full md:w-1/2 h-[50vh] md:h-[80vh] bg-slate-50 relative group border-b md:border-b-0 md:border-r border-slate-200">
            <div ref={scrollRef} onScroll={(e) => setCurrentImageIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))} className="flex overflow-x-auto snap-x snap-mandatory h-full w-full custom-scrollbar scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {productImages.map((img, idx) => (
                <div key={idx} className="min-w-full h-full snap-center relative shrink-0 flex items-center justify-center p-0 md:p-8">
                  <img src={img} className="w-full h-full object-cover md:rounded-sm shadow-sm" alt={`${product.name} Angle ${idx + 1}`} />
                </div>
              ))}
            </div>
            
            {/* NEW: Left/Right Navigation Arrows */}
            {productImages.length > 1 && (
              <>
                <button onClick={() => scrollImage('left')} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-md text-slate-800 hover:bg-slate-900 hover:text-white transition z-10 hidden md:block">
                  <ChevronLeft size={20} />
                </button>
                <button onClick={() => scrollImage('right')} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-md text-slate-800 hover:bg-slate-900 hover:text-white transition z-10 hidden md:block">
                  <ChevronRight size={20} />
                </button>
                
                <div className="absolute bottom-4 right-4 bg-slate-900/80 text-white text-[10px] tracking-widest px-3 py-1.5 backdrop-blur-md">
                  {currentImageIndex + 1} / {productImages.length}
                </div>
              </>
            )}
          </div>
          
          {/* Product Details */}
          <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col h-[50vh] md:h-[80vh] overflow-y-auto custom-scrollbar">
            <div className="text-[10px] md:text-xs text-amber-700 uppercase tracking-widest mb-2 font-bold">{product.category}</div>
            <h2 className="text-2xl md:text-4xl font-serif mb-2 text-slate-900 leading-tight">{product.name}</h2>
            <p className="text-xl md:text-2xl text-amber-700 font-medium mb-6">₦{product.price?.toLocaleString()}</p>
            
            {/* MOVED: Add to Cart Button is now at the top */}
            <div className="mb-6 shrink-0 w-full">
              <button disabled={product.stock_count === 0 || isAdding} onClick={addToCart} className={`w-full py-4 px-4 text-[11px] md:text-[12px] font-bold tracking-widest uppercase transition text-center flex items-center justify-center gap-2 shadow-lg rounded-sm ${product.stock_count === 0 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-amber-700 hover:-translate-y-0.5'}`}>
                <ShoppingCart size={16} /> 
                {product.stock_count === 0 ? 'Out of Stock' : isAdding ? 'Adding to Cart...' : 'Add to Cart'}
              </button>
            </div>

            <div className="w-full h-[1px] bg-slate-100 mb-6"></div>

            {/* Customizations */}
            <div className="mb-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900 block mb-3">Color / Tone</span>
              <div className="flex flex-wrap gap-2">
                {availableColors.length > 0 ? availableColors.map((c: string) => (
                  <button key={c} onClick={() => setSelectedColor(c)} className={`px-4 py-2 text-[10px] md:text-xs tracking-wide uppercase transition border ${selectedColor === c ? 'border-amber-700 text-amber-800 bg-amber-50 font-bold' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>{c}</button>
                )) : (
                  <span className="text-xs text-slate-500">Standard Edition</span>
                )}
              </div>
            </div>
            
            <div className="mb-8">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900 block mb-3">Size / Fit</span>
              <div className="flex flex-wrap gap-2">
                {availableSizes.length > 0 ? availableSizes.map((s: string) => (
                  <button key={s} onClick={() => setSelectedSize(s)} className={`px-4 py-2 text-[10px] md:text-xs tracking-wide uppercase transition border ${selectedSize === s ? 'border-amber-700 text-amber-800 bg-amber-50 font-bold' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>{s}</button>
                )) : (
                  <span className="text-xs text-slate-500">One Size (OS)</span>
                )}
              </div>
            </div>

            <div className="w-full h-[1px] bg-slate-100 mb-6"></div>
            <div className="pb-8">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900 block mb-4">Product Details</span>
              <FormattedDescription text={product.description} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}