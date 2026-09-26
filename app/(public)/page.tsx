"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ImageIcon, Star, ShoppingCart, Trash2, Package } from 'lucide-react';
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

const ProductCard = ({ item }: { item: any }) => {
  const extraImages = parseSupabaseArray(item.additional_images);
  const totalImages = extraImages.length > 0 ? extraImages.length + 1 : 1;
  const isOutOfStock = item.stock_count === 0;

  return (
    <Link href={`/product/${item.id}`} className="group cursor-pointer flex flex-col h-full w-full relative z-10">
      <div className="relative aspect-square mb-3 overflow-hidden bg-slate-50 shadow-sm border border-slate-100 group-hover:shadow-2xl group-hover:shadow-amber-900/10 group-hover:border-amber-200 transition-all duration-500">
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
    </Link>
  );
};

export default function LuxePublicSite() {
  const supabase = createClient();
  
  const [products, setProducts] = useState<any[]>([]);
  const [premiumProducts, setPremiumProducts] = useState<any[]>([]);
  const [deliveryOptions, setDeliveryOptions] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]); 
  
  const [activeFilter, setActiveFilter] = useState('All');
  const filters = ['All', 'Bags', 'Shoes', 'Palm Wears', 'Cloth', 'Men', 'Women'];
  const [visibleMain, setVisibleMain] = useState(10);
  const [visiblePremium, setVisiblePremium] = useState(10);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [cart, setCart] = useState<any[]>([]);
  const [isCartLoaded, setIsCartLoaded] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
<<<<<<< HEAD
  
  const [orderSuccess, setOrderSuccess] = useState(false);
=======
  const [successOrder, setSuccessOrder] = useState<{ trackingCode: string } | null>(null);
>>>>>>> d149389248901ff9c4c9c58dc9bb650f8cc2c454
  const [orderTrackingNumber, setOrderTrackingNumber] = useState('');
  const [finalTotal, setFinalTotal] = useState(0); 
  
  const [checkoutForm, setCheckoutForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [selectedDelivery, setSelectedDelivery] = useState<any | null>(null);

  useEffect(() => {
    async function loadData() {
      const { data: prodData } = await supabase.from('products').select('*').limit(40);
      const { data: premiumData } = await supabase.from('signature_products' as any).select('*').limit(40);
      const { data: delData } = await supabase.from('delivery_options').select('*').order('fee', { ascending: true });
      const { data: vendorData } = await supabase.from('verified_vendors').select('*').eq('status', 'active'); 
      
      if (prodData) setProducts(prodData.map(p => ({ ...p, tableType: 'products' })));
      if (premiumData) setPremiumProducts(premiumData.map(p => ({ ...p, tableType: 'signature_products' })));
      if (delData && delData.length > 0) {
        setDeliveryOptions(delData);
        setSelectedDelivery(delData[0]); 
      }
      if (vendorData) setVendors(vendorData); 
    }
    loadData();

    const savedCart = localStorage.getItem('luxe_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
    setIsCartLoaded(true);
  }, [supabase]);

  useEffect(() => {
    if (isCartLoaded) localStorage.setItem('luxe_cart', JSON.stringify(cart));
  }, [cart, isCartLoaded]);

  const filteredProducts = activeFilter === 'All' 
    ? products 
    : products.filter(p => {
        let searchTarget = activeFilter.toLowerCase();
        if (searchTarget.endsWith('s') && searchTarget !== 'men' && searchTarget !== 'women') searchTarget = searchTarget.slice(0, -1);
        const cat = (p.category || '').toLowerCase();
        const tagsString = JSON.stringify(p.tags || []).toLowerCase();
        return cat.includes(searchTarget) || tagsString.includes(searchTarget);
      });

  const removeFromCart = (cartId: string) => setCart(cart.filter(c => c.cartId !== cartId));
  
  const updateQuantity = (cartId: string, amount: number) => {
    setCart(cart.map(c => {
      if (c.cartId === cartId) {
        const newQty = c.quantity + amount;
        if (newQty > c.maxStock) {
          alert(`Maximum stock reached. Only ${c.maxStock} available.`);
          return c;
        }
        return newQty > 0 ? { ...c, quantity: newQty } : c;
      }
      return c;
    }));
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const deliveryFee = selectedDelivery ? Number(selectedDelivery.fee) : 0;
  const grandTotal = cartTotal + deliveryFee;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || !selectedDelivery) return;
    setIsSubmittingOrder(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: checkoutForm.name,
          email: checkoutForm.email,
          phone: checkoutForm.phone,
          deliveryAddress: checkoutForm.address,
          items: cart,
          totalAmount: grandTotal
        })
      });

      const data = await response.json();

<<<<<<< HEAD
      if (data.success) {
        setFinalTotal(grandTotal); 
        setCart([]);
        localStorage.removeItem('luxe_cart');
        localStorage.setItem('luxe_new_order_signal', Date.now().toString());
        setOrderTrackingNumber(data.trackingCode);
        setOrderSuccess(true);
      } else {
        alert(`Error: ${data.error || 'Server did not provide an error message'}`);
        setIsSubmittingOrder(false);
=======
      if (response.ok && data.success) {
        // 1. Clear the cart data
        setCart([]);
        localStorage.removeItem('luxe_cart');
        
        // 2. Fire signal to Admin Tab
        localStorage.setItem('luxe_new_order_signal', Date.now().toString());
        
        // 3. TRIGGER CUSTOM LUXURY MODAL INSTEAD OF ALERT
        setSuccessOrder({ trackingCode: data.trackingCode });
>>>>>>> d149389248901ff9c4c9c58dc9bb650f8cc2c454
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong processing your order.");
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-slate-900 font-sans selection:bg-amber-900 selection:text-white">

      {/* --- COMBINED FIXED HEADER --- */}
      <header className="fixed top-0 left-0 w-full z-50 flex flex-col shadow-sm">
        <div className="bg-slate-900 text-amber-500 text-[9px] md:text-[10px] font-bold tracking-widest uppercase text-center py-2.5 px-4">
          Complimentary Global Shipping on Signature Orders over ₦250,000
        </div>
        
        <nav className="w-full bg-[#FFFFFF]/95 backdrop-blur-md border-b border-slate-100 relative">
          <div className="max-w-7xl mx-auto px-6 md:px-16 h-16 md:h-20 flex items-center justify-between">
            <div className="text-xl md:text-2xl font-serif font-bold tracking-widest text-slate-900">LUXE & CO.</div>
            
            <div className="hidden md:flex gap-8 text-[10px] font-bold tracking-widest uppercase text-slate-500">
              <a href="#premium" className="hover:text-amber-700 transition duration-300">Premium Line</a>
              <a href="#catalog" className="hover:text-amber-700 transition duration-300">Full Catalog</a>
              <a href="#testimonials" className="hover:text-amber-700 transition duration-300">Testimonials</a>
            </div>

            <div className="flex items-center gap-6">
              <button onClick={() => setIsCartOpen(true)} className="relative text-slate-900 hover:text-amber-700 transition">
                <ShoppingCart size={22} />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-600 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {cart.reduce((total, item) => total + item.quantity, 0)}
                  </span>
                )}
              </button>
              <button className="md:hidden text-slate-900 hover:text-amber-700 transition" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
          
          <div className={`md:hidden absolute top-[100%] left-0 w-full bg-white border-b border-slate-100 shadow-2xl overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-80 opacity-100 py-6' : 'max-h-0 opacity-0 py-0'}`}>
            <div className="flex flex-col px-6 gap-6 text-xs tracking-widest uppercase font-bold text-slate-600">
              <a href="#premium" onClick={() => setIsMobileMenuOpen(false)}>Premium Line</a>
              <a href="#catalog" onClick={() => setIsMobileMenuOpen(false)}>Full Catalog</a>
              <a href="#testimonials" onClick={() => setIsMobileMenuOpen(false)}>Testimonials</a>
            </div>
          </div>
        </nav>
      </header>

      {/* INVISIBLE SPACER */}
      <div className="h-[100px] md:h-[116px] w-full"></div>
      
      {/* CART SIDEBAR */}
      <div className={`fixed inset-0 z-[70] transition-opacity duration-300 ${isCartOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
        <div className={`absolute top-0 right-0 w-full md:w-[400px] h-full bg-white shadow-2xl flex flex-col transition-transform duration-300 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <h2 className="text-xl font-serif text-slate-900">Your Cart ({cart.reduce((a, b) => a + b.quantity, 0)})</h2>
            <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition"><X size={20} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {cart.length === 0 ? (
              <div className="text-center text-slate-400 mt-10 text-sm">Your cart is empty.</div>
            ) : (
              cart.map(item => (
                <div key={item.cartId} className="flex gap-4 items-center">
                  <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-sm border border-slate-200" />
                  <div className="flex-1">
                    <p className="font-bold text-sm text-slate-900 line-clamp-1">{item.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Color: {item.color} | Size: {item.size}</p>
                    <p className="text-amber-700 font-bold text-sm mt-2">₦{item.price.toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center border border-slate-200 rounded-sm">
                      <button onClick={() => updateQuantity(item.cartId, -1)} className="px-2 py-1 hover:bg-slate-100 text-slate-600">-</button>
                      <span className="px-2 text-xs font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.cartId, 1)} className="px-2 py-1 hover:bg-slate-100 text-slate-600">+</button>
                    </div>
                    <button onClick={() => removeFromCart(item.cartId)} className="text-red-500 hover:text-red-700 text-[10px] uppercase tracking-widest flex items-center gap-1"><Trash2 size={12}/> Remove</button>
                  </div>
                </div>
              ))
            )}
          </div>
          {cart.length > 0 && (
            <div className="p-6 border-t border-slate-100 bg-slate-50">
              <div className="flex justify-between items-center mb-6">
                <span className="text-slate-500 text-sm uppercase tracking-widest font-bold">Subtotal</span>
                <span className="text-xl font-serif text-slate-900">₦{cartTotal.toLocaleString()}</span>
              </div>
              <button onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }} className="w-full bg-slate-900 text-white py-4 font-bold uppercase tracking-widest text-[11px] rounded-sm hover:bg-amber-700 transition">
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CHECKOUT MODAL */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 md:p-12">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !orderSuccess && setIsCheckoutOpen(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
              <h2 className="text-2xl font-serif text-slate-900">Secure Checkout</h2>
              {!orderSuccess && <button onClick={() => setIsCheckoutOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition"><X size={20} /></button>}
            </div>
            
            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
              {orderSuccess ? (
                <div className="text-center py-8 animate-in fade-in zoom-in duration-500">
                  <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Package size={32} className="text-amber-700" />
                  </div>
                  <h3 className="text-3xl font-serif text-slate-900 mb-2">Order Secured.</h3>
                  <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
                    Your order has been recorded. To begin processing your shipment, please complete your payment via bank transfer.
                  </p>
                  
                  {/* TRACKING NUMBER */}
                  <div className="bg-slate-50 border border-slate-100 p-4 mb-6 inline-block w-full max-w-sm">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                      Official Tracking Code
                    </p>
                    <p className="text-2xl font-mono font-bold text-slate-900 tracking-wider">
                      {orderTrackingNumber}
                    </p>
                  </div>

                  {/* MANUAL BANK DETAILS */}
                  <div className="bg-amber-50 border border-amber-200 p-6 mb-8 text-left text-sm text-slate-800 rounded-sm mx-auto max-w-sm">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-800 mb-3 border-b border-amber-200 pb-2">Manual Bank Transfer</p>
                    <div className="space-y-3">
                      <p className="flex justify-between items-center"><span className="text-slate-500">Bank:</span> <strong className="text-right">Opay</strong></p>
                      <p className="flex justify-between items-center"><span className="text-slate-500">Account Name:</span> <strong className="text-right">Ayolola Muiz</strong></p>
                      <p className="flex justify-between items-center"><span className="text-slate-500">Account Number:</span> <strong className="text-lg tracking-wider">9073754047</strong></p>
                      <div className="mt-4 pt-3 border-t border-amber-200 flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Amount to Pay:</span> 
                        <strong className="text-xl text-amber-700">₦{finalTotal.toLocaleString()}</strong>
                      </div>
                    </div>
                  </div>
                  
                  {/* WHATSAPP CONFIRMATION BUTTON */}
                  <a
                    href={`https://wa.me/2349073754047?text=Hello LUXE! I just placed an order. My Tracking Number is ${orderTrackingNumber}. Here is my payment proof for ₦${finalTotal.toLocaleString()}.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#25D366] text-white text-xs font-bold uppercase tracking-widest py-4 rounded-sm hover:bg-[#128C7E] transition-colors duration-300 flex justify-center items-center mb-4 shadow-lg"
                  >
                    Send Payment Proof on WhatsApp
                  </a>

                  <button
                    onClick={() => {
                      setOrderSuccess(false);
                      setIsCheckoutOpen(false);
                      window.location.href = '/track'; 
                    }}
                    className="text-[10px] text-slate-500 uppercase tracking-widest font-bold hover:text-slate-900 transition-colors"
                  >
                    I will do this later (Go to Tracking)
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCheckoutSubmit} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Delivery Method</label>
                    <div className="grid grid-cols-1 gap-3">
                      {deliveryOptions.map(option => (
                        <label key={option.id} className={`flex items-center justify-between p-4 border rounded-sm cursor-pointer transition ${selectedDelivery?.id === option.id ? 'border-amber-700 bg-amber-50' : 'border-slate-200 hover:border-slate-300'}`}>
                          <div className="flex items-center gap-3">
                            <input type="radio" name="delivery" checked={selectedDelivery?.id === option.id} onChange={() => setSelectedDelivery(option)} className="text-amber-700 focus:ring-amber-700" />
                            <div>
                              <p className="font-bold text-sm text-slate-900">{option.name}</p>
                              <p className="text-[10px] text-slate-500 uppercase tracking-widest">{option.estimated_time}</p>
                            </div>
                          </div>
                          <span className="font-bold text-amber-700">₦{Number(option.fee).toLocaleString()}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Full Name</label>
                      <input required type="text" value={checkoutForm.name} onChange={(e) => setCheckoutForm({...checkoutForm, name: e.target.value})} className="w-full border border-slate-200 p-3 rounded-sm focus:border-amber-500 outline-none transition text-sm" placeholder="e.g. Jane Doe" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Phone Number</label>
                      <input required type="tel" value={checkoutForm.phone} onChange={(e) => setCheckoutForm({...checkoutForm, phone: e.target.value})} className="w-full border border-slate-200 p-3 rounded-sm focus:border-amber-500 outline-none transition text-sm" placeholder="e.g. 080..." />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Email Address</label>
                    <input required type="email" value={checkoutForm.email} onChange={(e) => setCheckoutForm({...checkoutForm, email: e.target.value})} className="w-full border border-slate-200 p-3 rounded-sm focus:border-amber-500 outline-none transition text-sm" placeholder="jane@example.com" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Full Delivery Address</label>
                    <textarea required rows={3} value={checkoutForm.address} onChange={(e) => setCheckoutForm({...checkoutForm, address: e.target.value})} className="w-full border border-slate-200 p-3 rounded-sm focus:border-amber-500 outline-none transition text-sm" placeholder="Street, City, State..." />
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-sm">
                    <div className="flex justify-between text-sm text-slate-600 mb-2"><span>Subtotal:</span> <span>₦{cartTotal.toLocaleString()}</span></div>
                    <div className="flex justify-between text-sm text-slate-600 mb-4 border-b border-slate-200 pb-4"><span>Delivery Fee:</span> <span>₦{deliveryFee.toLocaleString()}</span></div>
                    <div className="flex justify-between text-lg font-bold text-slate-900"><span>Grand Total:</span> <span className="text-amber-700">₦{grandTotal.toLocaleString()}</span></div>
                  </div>

                  <button type="submit" disabled={isSubmittingOrder} className="w-full bg-slate-900 text-white py-4 mt-4 uppercase tracking-widest text-[11px] font-bold rounded-sm hover:bg-amber-700 transition flex justify-center items-center gap-2">
                    {isSubmittingOrder ? 'Processing Order...' : `Complete Order • ₦${grandTotal.toLocaleString()}`}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

<<<<<<< HEAD
=======
      {/* PRODUCT DETAILS MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[50] flex items-center justify-center p-0 md:p-12">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer" onClick={() => setSelectedProduct(null)}></div>
          <div className="relative bg-white w-full h-full md:h-auto md:max-w-5xl md:max-h-[95vh] overflow-hidden flex flex-col md:flex-row shadow-2xl">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 z-50 bg-white/90 text-black p-2 rounded-full shadow-md backdrop-blur-md hover:bg-slate-100 transition"><X size={20} /></button>
            <div className="w-full md:w-1/2 h-[50vh] md:h-[85vh] bg-slate-50 relative group border-b md:border-b-0 md:border-r border-slate-200">
              <div ref={scrollRef} onScroll={(e) => setCurrentImageIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))} className="flex overflow-x-auto snap-x snap-mandatory h-full w-full custom-scrollbar scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {productImages.map((img, idx) => (
                  <div key={idx} className="min-w-full h-full snap-center relative shrink-0 flex items-center justify-center p-0 md:p-8">
                    <img src={img} className="w-full h-full object-cover md:rounded-sm shadow-sm" alt="Product Angle" />
                  </div>
                ))}
              </div>
              <div className="absolute bottom-4 right-4 bg-slate-900/80 text-white text-[10px] tracking-widest px-3 py-1.5 backdrop-blur-md">{currentImageIndex + 1} / {productImages.length}</div>
            </div>
            
            <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col h-[50vh] md:h-[85vh] overflow-y-auto">
              <div className="text-[10px] md:text-xs text-amber-700 uppercase tracking-widest mb-2 font-bold">{selectedProduct.category}</div>
              <h2 className="text-2xl md:text-4xl font-serif mb-2 text-slate-900 leading-tight">{selectedProduct.name}</h2>
              <p className="text-xl md:text-2xl text-amber-700 font-medium mb-6">₦{selectedProduct.price?.toLocaleString()}</p>
              <div className="w-full h-[1px] bg-slate-100 mb-6"></div>

              <div className="mb-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900 block mb-3">Color / Tone</span>
                <div className="flex flex-wrap gap-2">
                  {(parseSupabaseArray(selectedProduct.colors).length > 0 ? parseSupabaseArray(selectedProduct.colors) : ['Standard']).map((c: string) => (
                     <button key={c} onClick={() => setSelectedColor(c)} className={`px-4 py-2 text-[10px] md:text-xs tracking-wide uppercase transition border ${selectedColor === c ? 'border-amber-700 text-amber-800 bg-amber-50 font-bold' : 'border-slate-200 text-slate-600'}`}>{c}</button>
                  ))}
                </div>
              </div>
              
              <div className="mb-8">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900 block mb-3">Size / Fit</span>
                <div className="flex flex-wrap gap-2">
                  {(parseSupabaseArray(selectedProduct.sizes).length > 0 ? parseSupabaseArray(selectedProduct.sizes) : ['OS']).map((s: string) => (
                     <button key={s} onClick={() => setSelectedSize(s)} className={`px-4 py-2 text-[10px] md:text-xs tracking-wide uppercase transition border ${selectedSize === s ? 'border-amber-700 text-amber-800 bg-amber-50 font-bold' : 'border-slate-200 text-slate-600'}`}>{s}</button>
                  ))}
                </div>
              </div>
              
              <div className="mb-8 shrink-0 w-full">
                <button disabled={selectedProduct.stock_count === 0} onClick={addToCart} className={`w-full py-4 px-4 text-[11px] md:text-[12px] font-bold tracking-widest uppercase transition text-center shadow-lg rounded-sm ${selectedProduct.stock_count === 0 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-amber-700 hover:-translate-y-0.5'}`}>
                  {selectedProduct.stock_count === 0 ? 'Out of Stock' : 'Add to Cart'}
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

      {/* TOP NAVIGATION */}
      <nav className="sticky top-0 left-0 w-full z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-slate-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 md:px-16 h-16 md:h-20 flex items-center justify-between">
          <div className="text-xl md:text-2xl font-serif font-bold tracking-widest text-slate-900">LUXE & CO.</div>
          
          <div className="hidden md:flex gap-8 text-[10px] font-bold tracking-widest uppercase text-slate-500">
            <a href="#premium" className="hover:text-amber-700 transition duration-300">Premium Line</a>
            <a href="#catalog" className="hover:text-amber-700 transition duration-300">Full Catalog</a>
            <a href="#testimonials" className="hover:text-amber-700 transition duration-300">Testimonials</a>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => setIsCartOpen(true)} className="relative text-slate-900 hover:text-amber-700 transition">
              <ShoppingCart size={22} />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-600 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {cart.reduce((total, item) => total + item.quantity, 0)}
                </span>
              )}
            </button>
            <button className="md:hidden text-slate-900 hover:text-amber-700 transition" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        <div className={`md:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-100 shadow-2xl overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-80 opacity-100 py-6' : 'max-h-0 opacity-0 py-0'}`}>
          <div className="flex flex-col px-6 gap-6 text-xs tracking-widest uppercase font-bold text-slate-600">
            <a href="#premium" onClick={() => setIsMobileMenuOpen(false)}>Premium Line</a>
            <a href="#catalog" onClick={() => setIsMobileMenuOpen(false)}>Full Catalog</a>
            <a href="#testimonials" onClick={() => setIsMobileMenuOpen(false)}>Testimonials</a>
          </div>
        </div>
      </nav>

>>>>>>> d149389248901ff9c4c9c58dc9bb650f8cc2c454
      {/* HERO SECTION */}
      <section className="relative pt-8 md:pt-16 pb-12 md:pb-24 px-6 md:px-16 bg-[#FDFBF7] border-b border-slate-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-16">
          <div className="w-full md:w-1/2 relative z-10"><h1 className="text-4xl sm:text-5xl md:text-7xl font-serif leading-[1.1] mb-4 md:mb-6 text-slate-900">CROWNED IN <br />ELEGANCE.</h1>
            <p className="text-sm md:text-lg font-light mb-8 md:mb-10 max-w-md text-slate-600 leading-relaxed">Curated luxury fashion, premium apparel, and accessories for the modern, unapologetic individual.</p>
            <a href="#catalog" className="inline-block bg-slate-900 text-white px-8 md:px-10 py-3.5 md:py-4 text-center font-bold uppercase tracking-widest text-[10px] md:text-xs hover:bg-amber-700 transition shadow-xl rounded-sm">Shop Collection</a>
          </div>
          <div className="w-full md:w-1/2 aspect-square md:aspect-[4/3] bg-slate-200 relative overflow-hidden rounded-sm shadow-sm">
             <img src="/hero.jpg" alt="Luxe E-Commerce" className="absolute inset-0 w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/1200x800/eeeeee/999999?text=Hero+Image" }} />
          </div>
        </div>
      </section>

      {/* DYNAMIC FILTER BAR */}
      <div className="sticky top-[100px] md:top-[116px] z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 py-3 md:py-4 px-6 md:px-16 overflow-x-auto custom-scrollbar flex gap-2 md:gap-4 justify-start md:justify-center">
        {filters.map(filter => (
          <button key={filter} onClick={() => setActiveFilter(filter)} className={`px-4 py-2 text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap transition border rounded-sm ${activeFilter === filter ? 'border-amber-700 text-amber-800 bg-amber-50' : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>{filter}</button>
        ))}
      </div>

      {/* MAIN CATALOG */}
      <section id="catalog" className="relative py-16 md:py-24 px-6 md:px-16 bg-[#FFFFFF]">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-8 md:mb-12">
            <div>
              <h2 className="text-[10px] md:text-xs font-bold tracking-widest text-amber-700 uppercase mb-1 md:mb-2">New Arrivals</h2>
              <h3 className="text-2xl md:text-4xl font-serif text-slate-900">Main Catalog</h3>
            </div>
            <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">{filteredProducts.length} Total Items</div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {filteredProducts.length > 0 ? (
              filteredProducts.slice(0, visibleMain).map((item) => (
                <div key={item.id} className="w-full">
                  <ProductCard item={item} />
                </div>
              ))
            ) : (
              <div className="col-span-full w-full text-center text-slate-400 py-16 border border-dashed border-slate-200 text-xs md:text-sm">No items found for this category.</div>
            )}
          </div>

          {/* LOAD MORE BUTTON */}
          {filteredProducts.length > visibleMain && (
            <div className="mt-12 flex justify-center">
              <button 
                onClick={() => setVisibleMain(prev => prev + 10)} 
                className="border border-slate-900 text-slate-900 px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-900 hover:text-white transition"
              >
                Load More Products
              </button>
            </div>
          )}
        </div>
      </section>

      {/* PREMIUM COLLECTION */}
      <section id="premium" className="relative py-16 md:py-24 px-6 md:px-16 bg-[#FDFBF7] border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-8 md:mb-12">
            <div>
              <h2 className="text-[10px] md:text-xs font-bold tracking-widest text-amber-700 uppercase mb-1 md:mb-2">Exclusive Line</h2>
              <h3 className="text-2xl md:text-4xl font-serif text-slate-900">Premium Collection</h3>
            </div>
            <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">{premiumProducts.length} Total Items</div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {premiumProducts.length > 0 ? (
              premiumProducts.slice(0, visiblePremium).map((item) => (
                <div key={item.id} className="w-full">
                  <ProductCard item={item} />
                </div>
              ))
            ) : (
              <div className="col-span-full w-full text-center text-slate-400 py-16 border border-dashed border-slate-200 text-xs md:text-sm">Premium catalog is currently empty.</div>
            )}
          </div>

          {/* LOAD MORE BUTTON */}
          {premiumProducts.length > visiblePremium && (
            <div className="mt-12 flex justify-center">
              <button 
                onClick={() => setVisiblePremium(prev => prev + 10)} 
                className="border border-slate-900 text-slate-900 px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-900 hover:text-white transition"
              >
                Discover More Premium
              </button>
            </div>
          )}
        </div>
      </section>

      {/* BRAND WORLD / VERIFIED VENDORS */}
      {vendors.length > 0 && (
        <section className="relative py-20 px-6 md:px-16 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 to-slate-950 border-t border-slate-800 shadow-inner">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-[10px] md:text-xs font-bold tracking-widest text-amber-500 uppercase mb-3">The Brand World</h2>
            <h3 className="text-xl md:text-2xl font-serif text-white mb-10">Curated from Verified Global Vendors</h3>
            
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
              {vendors.map((vendor) => (
                <div key={vendor.id} className="group cursor-pointer">
                  <img 
                    src={vendor.logo_url} 
                    alt={vendor.vendor_name} 
                    className="h-10 md:h-14 object-contain transition duration-300 group-hover:scale-105"
                    title={vendor.vendor_name}
                  />
                </div>
              ))}
            </div>
            
            <p className="text-slate-400 text-[10px] uppercase tracking-widest mt-10">Every product is authenticated & guaranteed by LUXE & CO.</p>
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      <section id="testimonials" className="relative py-16 md:py-24 px-6 md:px-16 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-2xl md:text-4xl font-serif text-slate-900 text-center mb-10 md:mb-16">Client Testimonials</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Aisha T.", role: "Verified Buyer", text: "The quality of the premium bags is unmatched. It arrived exactly as pictured, beautifully packaged. I’ve never received so many compliments." },
              { name: "Sarah M.", role: "VIP Client", text: "LUXE & CO. completely elevated my wardrobe. The detailing on their signature pieces proves they care about true luxury." },
              { name: "Chika O.", role: "Verified Buyer", text: "Seamless ordering process and exceptional customer service. The material feels incredible. Definitely my new go-to store." }
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
          </div><div className="grid grid-cols-2 md:grid-cols-1 gap-8 md:gap-0">
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
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-[8px] md:text-[10px] uppercase tracking-widest text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} LUXE & CO. ALL RIGHTS RESERVED.</p>
          <p className="text-slate-600">CRAFTED BY <a href="/admin" className="hover:text-amber-500 transition font-bold">GUV'NOR MAGKK.</a></p>
        </div>
      </footer>
      {/* LUXURY SUCCESS MODAL */}
      {successOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Blurred dark backdrop */}
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>
          
          {/* Modal Card */}
          <div className="relative bg-white w-full max-w-md rounded-none shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
            {/* Top Accent Bar */}
            <div className="h-1.5 w-full bg-amber-700"></div>
            
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package size={32} className="text-amber-700" />
              </div>
              
              <h2 className="text-3xl font-serif text-slate-900 mb-2">Order Secured.</h2>
              <p className="text-sm text-slate-500 mb-8">
                Your luxury items are being prepared. You will receive an email confirmation shortly.
              </p>
              
              <div className="bg-slate-50 border border-slate-100 p-4 mb-8">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                  Official Tracking Code
                </p>
                <p className="text-xl font-mono font-bold text-slate-900 tracking-wider">
                  {successOrder.trackingCode}
                </p>
              </div>
              
              <button
                onClick={() => {
                  setSuccessOrder(null);
                  window.location.href = '/track'; // Proceed to tracking
                }}
                className="w-full bg-[#0B1120] text-white text-xs font-bold uppercase tracking-widest py-4 hover:bg-amber-700 transition-colors duration-300 flex justify-center items-center gap-2"
              >
                Track My Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
