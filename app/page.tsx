"use client";

import React, { useState } from 'react';
import { ArrowRight, Scissors, MessageCircle, ChevronRight, ChevronLeft, Menu, Calendar, MapPin, Star, X, Plus, Minus } from 'lucide-react';

// --- SUB-COMPONENTS ---

const ProductCard = ({ item, onSelect }: { item: any, onSelect: (item: any) => void }) => {
  const [currentIdx, setCurrentIdx] = useState(0);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    setCurrentIdx((prev) => (prev + 1) % item.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev - 1 + item.images.length) % item.images.length);
  };

  return (
    <div className="group cursor-pointer" onClick={() => onSelect(item)}>
      <div className="relative aspect-[3/4] mb-4 overflow-hidden rounded-sm bg-slate-100 shadow-sm border border-slate-200/60">
        <img 
          src={item.images[currentIdx]} 
          alt={item.name} 
          className="w-full h-full object-cover transition duration-500" 
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://placehold.co/600x800/eeeeee/999999?text=Image+Missing";
          }}
        />
        
        <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-white text-black shadow-md z-10">
          <ChevronLeft size={18} />
        </button>
        <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-white text-black shadow-md z-10">
          <ChevronRight size={18} />
        </button>

        <div className="absolute bottom-3 right-3 bg-black/70 text-white text-[10px] uppercase tracking-wider px-2 py-1 rounded-full backdrop-blur-sm z-10">
          {currentIdx + 1} / {item.images.length}
        </div>
      </div>
      <h3 className="text-xl font-serif text-slate-900 group-hover:text-amber-700 transition">{item.name}</h3>
      <p className="text-amber-700 font-medium mb-4">{item.price}</p>
    </div>
  );
};

// --- MAIN PAGE ---

export default function JupiloFashionLanding() {
  const WHATSAPP_NUMBER = "2349073754047";
  
  // States
  const [material, setMaterial] = useState("Ankara");
  const [yards, setYards] = useState("");
  const [date, setDate] = useState("");
  const [studentName, setStudentName] = useState("");
  const [course, setCourse] = useState("Beginner Pattern Drafting");
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  
  // New States for FAQ & Newsletter
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [email, setEmail] = useState("");

  // Handlers
  const handleCustomOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const message = `Hello Jupilo! I have my own fabric and need a custom outfit.%0A%0A*Fabric Type:* ${material}%0A*Yards:* ${yards}%0A*Needed By:* ${date}%0A%0APlease let me know the process!`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  const handleAcademyEnrollment = (e: React.FormEvent) => {
    e.preventDefault();
    const message = `Hello Jupilo Academy!%0A%0AMy name is ${studentName}. I am interested in enrolling in the *${course}* program.%0A%0APlease send me the curriculum and fee structure.`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  const handleProductOrder = (itemName: string) => {
    const message = `Hi Jupilo! I am interested in ordering the *${itemName}* from your collection.`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Thanks for joining the Jupilo Inner Circle! (Prototype Form)");
    setEmail("");
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // --- DATA ARRAYS ---
  const asoEbiCollection = [
    { name: "Rich Aunty Bubu", price: "₦45,000", description: "Crafted from premium Mikado silk with hand-beaded lace detailing.", images: ["/aso-1a.jpg", "/aso-1b.jpg", "/aso-1c.jpg"] },
    { name: "Owambe Corset Gown", price: "₦85,000", description: "Signature structural corset gown with authentic waist-snatching boning.", images: ["/aso-2a.jpg", "/aso-2b.jpg", "/aso-2c.jpg"] },
    { name: "Luxury Lace Peplum", price: "₦65,000", description: "Intricate dry lace peplum top with a matching mermaid skirt.", images: ["/aso-3a.jpg", "/aso-3b.jpg", "/aso-3c.jpg"] },
  ];

  const mensCollection = [
    { name: "Bespoke Senator", price: "₦55,000", description: "A masterclass in men's tailoring. Two-piece Senator suit featuring invisible stitching.", images: ["/men-1a.jpg", "/men-1b.jpg", "/men-1c.jpg"] },
    { name: "Royal Agbada Set", price: "₦120,000", description: "Three-piece Agbada with heavy, hand-crafted embroidery.", images: ["/men-2a.jpg", "/men-2b.jpg", "/men-2c.jpg"] },
    { name: "Classic Kaftan", price: "₦40,000", description: "Minimalist kaftan made from breathable, high-grade cotton.", images: ["/men-3a.jpg", "/men-3b.jpg", "/men-3c.jpg"] },
  ];

  const readyToWear = [
    { name: "Ankara Shift Dress", price: "₦25,000", description: "Vibrant Ankara print shift dress perfect for casual outings or casual Fridays.", images: ["/rtw-1a.jpg", "/rtw-1b.jpg", "/rtw-1c.jpg"] },
    { name: "Adire Two-Piece", price: "₦35,000", description: "Comfortable and stylish Adire silk top and trouser set.", images: ["/rtw-2a.jpg", "/rtw-2b.jpg", "/rtw-2c.jpg"] },
    { name: "Crepe Midi Wrap", price: "₦30,000", description: "Elegant crepe wrap dress that cinches beautifully at the waist.", images: ["/rtw-3a.jpg", "/rtw-3b.jpg", "/rtw-3c.jpg"] },
  ];

  const bridalCollection = [
    { name: "White Wedding Ballgown", price: "₦350,000", description: "Breathtaking ballgown with a 5-meter train and Swarovski crystal detailing.", images: ["/bridal-1a.jpg", "/bridal-1b.jpg", "/bridal-1c.jpg"] },
    { name: "Traditional Edo Attire", price: "₦200,000", description: "Fully beaded Okuku and velvet wrapper set fit for a queen.", images: ["/bridal-2a.jpg", "/bridal-2b.jpg", "/bridal-2c.jpg"] },
    { name: "Reception Party Dress", price: "₦150,000", description: "Fringe and sequin mini-dress designed for maximum movement on the dance floor.", images: ["/bridal-3a.jpg", "/bridal-3b.jpg", "/bridal-3c.jpg"] },
  ];

  const theArchives = [
    "/archive-1.jpg", "/archive-2.jpg", "/archive-3.jpg", "/archive-4.jpg", 
    "/archive-5.jpg", "/archive-6.jpg", "/archive-7.jpg", "/archive-8.jpg"
  ];

  const faqs = [
    { q: "Do you source fabrics for custom bespoke orders?", a: "Yes, we offer premium fabric sourcing. If you don't have your own material, our style consultants will curate high-grade fabrics like Mikado silk, Swiss lace, and luxury cashmere for you to choose from." },
    { q: "How long does a custom outfit typically take?", a: "For standard bespoke and Aso-ebi orders, we require 2 to 4 weeks. Bridal wear and heavily beaded garments require 6 to 8 weeks. Express service is available for an additional fee." },
    { q: "Does the Jupilo Academy offer payment plans?", a: "Absolutely. We understand fashion education is an investment. We offer flexible 2-part and 3-part installment plans for our comprehensive 3-month and 4-month programs." },
    { q: "Can I order Ready-to-Wear if I'm not in Lagos?", a: "Yes! We offer nationwide delivery across Nigeria via trusted logistics partners, and DHL express shipping for our international clients in the UK, US, and Canada." }
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-900 font-sans selection:bg-amber-900 selection:text-white pb-20 md:pb-0">
      
      {/* --- MODAL OVERLAY --- */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-12">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer" onClick={() => setSelectedProduct(null)}></div>
          
          <div className="relative bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row shadow-2xl rounded-sm">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 z-10 bg-white text-black p-2 rounded-full shadow-md hover:bg-slate-100 transition">
              <X size={24} />
            </button>
            
            <div className="w-full md:w-1/2 h-[50vh] md:h-auto bg-slate-100">
              <img 
                src={selectedProduct.images[0]} 
                alt={selectedProduct.name} 
                className="w-full h-full object-cover" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://placehold.co/600x800/eeeeee/999999?text=Image+Missing";
                }}
              />
            </div>
            
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <h2 className="text-3xl md:text-5xl font-serif mb-2 text-slate-900">{selectedProduct.name}</h2>
              <p className="text-2xl text-amber-700 font-medium mb-6">{selectedProduct.price}</p>
              <div className="w-12 h-[1px] bg-amber-700 mb-6"></div>
              <p className="text-slate-600 mb-8 leading-relaxed text-lg">{selectedProduct.description}</p>
              
              <ul className="space-y-3 mb-10 text-slate-600">
                <li className="flex items-center gap-2"><Star size={16} className="text-amber-500" /> Custom Tailored to Your Measurements</li>
                <li className="flex items-center gap-2"><Star size={16} className="text-amber-500" /> Premium Fabric Sourcing Available</li>
                <li className="flex items-center gap-2"><Star size={16} className="text-amber-500" /> Nationwide Delivery</li>
              </ul>
              
              <button 
                onClick={() => handleProductOrder(selectedProduct.name)}
                className="w-full bg-slate-900 text-white py-4 flex items-center justify-center gap-2 text-lg hover:bg-slate-800 transition"
              >
                Secure this Look on WhatsApp <MessageCircle size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. HERO SECTION */}
      <section className="relative h-[90vh] w-full flex flex-col justify-end pb-20 px-6 md:px-16">
        <img 
          src="/hero.jpg" 
          alt="Jupilo Fashion Model" 
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/2000x1200/222222/666666?text=Hero+Image+Missing"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

        <nav className="absolute top-0 left-0 w-full p-6 flex justify-between items-center text-white z-10">
          <div className="text-3xl font-serif font-bold tracking-widest">JUPILO.</div>
          <div className="hidden md:flex gap-8 text-sm tracking-widest uppercase font-medium">
            <a href="#store" className="hover:text-amber-500 transition">Store</a>
            <a href="#archives" className="hover:text-amber-500 transition">Portfolio</a>
            <a href="#academy" className="hover:text-amber-500 transition">Academy</a>
          </div>
          <button className="md:hidden"><Menu size={28} /></button>
        </nav>

        <div className="relative z-10 text-white max-w-3xl">
          <p className="uppercase tracking-widest text-amber-500 font-medium mb-3 text-sm">Fashion House & Academy</p>
          <h1 className="text-5xl md:text-7xl font-serif leading-[1.1] mb-6">
            Masterpieces.<br />Worn and Taught.
          </h1>
          <p className="text-lg md:text-xl font-light mb-8 max-w-lg text-gray-200">
            Premium Aso-ebi, sharp Senator wear, and world-class fashion education in the heart of Nigeria.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="#store" className="bg-white text-black px-8 py-4 text-center font-medium uppercase tracking-wide text-sm hover:bg-slate-200 transition">
              Shop Collections
            </a>
            <a href="#academy" className="border border-white text-white px-8 py-4 text-center font-medium uppercase tracking-wide text-sm hover:bg-white/10 transition">
              Join the Academy
            </a>
          </div>
        </div>
      </section>

      {/* --- THE STOREFRONT --- */}
      <div id="store" className="py-24 space-y-32">
        <section className="px-6 md:px-16 max-w-7xl mx-auto">
          <div className="mb-12 border-b border-slate-200 pb-6 flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
              <h2 className="text-3xl md:text-5xl font-serif mb-3 text-slate-900">The Aso-Ebi Edit</h2>
              <p className="text-slate-500">Show-stopping pieces for Owambe weekends. Click to view details.</p>
            </div>
            <p className="text-sm font-medium tracking-widest text-amber-700 uppercase">01 / Collections</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {asoEbiCollection.map((item, i) => <ProductCard key={i} item={item} onSelect={setSelectedProduct} />)}
          </div>
        </section>

        <section className="px-6 md:px-16 max-w-7xl mx-auto">
          <div className="mb-12 border-b border-slate-200 pb-6 flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
              <h2 className="text-3xl md:text-5xl font-serif mb-3 text-slate-900">Men's Traditional</h2>
              <p className="text-slate-500">Crisp tailoring, structural perfection. Click to view details.</p>
            </div>
            <p className="text-sm font-medium tracking-widest text-amber-700 uppercase">02 / Collections</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {mensCollection.map((item, i) => <ProductCard key={i} item={item} onSelect={setSelectedProduct} />)}
          </div>
        </section>

        <section className="px-6 md:px-16 max-w-7xl mx-auto">
          <div className="mb-12 border-b border-slate-200 pb-6 flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
              <h2 className="text-3xl md:text-5xl font-serif mb-3 text-slate-900">Ready-To-Wear</h2>
              <p className="text-slate-500">Everyday elegance, available for immediate dispatch. Click to view details.</p>
            </div>
            <p className="text-sm font-medium tracking-widest text-amber-700 uppercase">03 / Collections</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {readyToWear.map((item, i) => <ProductCard key={i} item={item} onSelect={setSelectedProduct} />)}
          </div>
        </section>

        <section className="px-6 md:px-16 max-w-7xl mx-auto">
          <div className="mb-12 border-b border-slate-200 pb-6 flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
              <h2 className="text-3xl md:text-5xl font-serif mb-3 text-slate-900">The Bridal Suite</h2>
              <p className="text-slate-500">For the most important day of your life. Click to view details.</p>
            </div>
            <p className="text-sm font-medium tracking-widest text-amber-700 uppercase">04 / Collections</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {bridalCollection.map((item, i) => <ProductCard key={i} item={item} onSelect={setSelectedProduct} />)}
          </div>
        </section>
      </div>

      {/* THE ARCHIVES (GALLERY) */}
      <section id="archives" className="py-24 bg-white px-6 md:px-16 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-5xl font-serif mb-3 text-slate-900">The Jupilo Archives</h2>
              <p className="text-slate-500">A showcase of our past commissions and bespoke creations.</p>
            </div>
            <button 
              onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=Hi Jupilo, I want to book a bespoke consultation.`, '_blank')}
              className="hidden md:flex items-center gap-2 text-amber-700 font-medium uppercase tracking-widest text-sm border-b border-amber-700 pb-1 hover:text-amber-800 transition"
            >
              Book a Consultation <ArrowRight size={16} />
            </button>
          </div>

          <div className="columns-2 md:columns-4 gap-4 space-y-4">
            {theArchives.map((img, i) => (
              <div key={i} className="break-inside-avoid relative group cursor-pointer overflow-hidden rounded-sm">
                <img 
                  src={img} 
                  alt="Portfolio piece" 
                  className="w-full object-cover group-hover:scale-105 transition duration-700" 
                  onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/600x800/eeeeee/999999?text=Missing"; }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                  <Scissors className="text-white" size={32} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SPOTLIGHT EVENT SHOW */}
      <section id="spotlight" className="py-24 px-6 md:px-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-1/2">
            <p className="uppercase tracking-widest text-amber-500 text-sm font-medium mb-4">Spotlight Event</p>
            <h2 className="text-4xl md:text-5xl font-serif mb-6 leading-tight">Jupilo Summer Showcase 2026</h2>
            <p className="text-slate-300 font-light text-lg mb-8">
              Join us for an exclusive evening of high fashion, structural brilliance, and networking with Nigeria's top style connoisseurs. 
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4">
                <Calendar className="text-amber-500" size={24} />
                <div>
                  <p className="font-medium">Saturday, 15th November</p>
                  <p className="text-sm text-slate-400">Red Carpet starts at 4:00 PM</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <MapPin className="text-amber-500" size={24} />
                <div>
                  <p className="font-medium">The Jupilo Creative Hub</p>
                  <p className="text-sm text-slate-400">Lagos, Nigeria</p>
                </div>
              </div>
            </div>
            <button 
              onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=Hi Jupilo, I want to RSVP for the upcoming Fashion Showcase.`, '_blank')}
              className="bg-amber-700 text-white px-8 py-4 uppercase tracking-wide text-sm hover:bg-amber-800 transition"
            >
              RSVP via WhatsApp
            </button>
          </div>
          <div className="w-full md:w-1/2">
            <img 
              src="/event.jpg" 
              alt="Fashion Event" 
              className="w-full aspect-[4/3] object-cover rounded-sm grayscale hover:grayscale-0 transition duration-700" 
              onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/1200x900/222222/666666?text=Event+Image+Missing"; }}
            />
          </div>
        </div>
      </section>

      {/* ACADEMY ENROLLMENT FORM */}
      <section id="academy" className="py-24 px-6 md:px-16 bg-[#F3EFE9] border-y border-slate-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row-reverse gap-16 items-center">
          <div className="w-full md:w-5/12">
            <p className="uppercase tracking-widest text-amber-700 font-medium mb-3 text-sm">Jupilo Academy</p>
            <h2 className="text-3xl md:text-5xl font-serif mb-4 text-slate-900">Learn the Art.<br/>Master the Business.</h2>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Don't just admire our finishes—learn how to create them. Jupilo Academy offers intensive, hands-on training for aspiring designers who want to dominate the Nigerian fashion industry.
            </p>
            <ul className="space-y-3 text-slate-700 mb-8 font-medium">
              <li className="flex items-center gap-2"><Scissors size={18} className="text-amber-700"/> Modern Pattern Drafting</li>
              <li className="flex items-center gap-2"><Scissors size={18} className="text-amber-700"/> Advanced Corsetry & Bridal</li>
              <li className="flex items-center gap-2"><Scissors size={18} className="text-amber-700"/> Male Bespoke & Suit Making</li>
            </ul>
          </div>
          <div className="w-full md:w-7/12 bg-white p-8 md:p-12 shadow-xl border border-slate-100 rounded-sm">
            <h3 className="text-2xl font-serif mb-6 text-slate-900">Begin Your Journey</h3>
            <form onSubmit={handleAcademyEnrollment} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                <input type="text" required value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="E.g. Chioma Adebayo" className="w-full border-b border-slate-300 pb-3 focus:outline-none focus:border-amber-700 bg-transparent text-lg placeholder-slate-300 text-slate-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Program of Interest</label>
                <select value={course} onChange={(e) => setCourse(e.target.value)} className="w-full border-b border-slate-300 pb-3 focus:outline-none focus:border-amber-700 bg-transparent text-lg text-slate-800">
                  <option value="Beginner Pattern Drafting">Beginner Pattern Drafting (3 Months)</option>
                  <option value="Advanced Corsetry">Advanced Corsetry & Bridals (4 Months)</option>
                  <option value="Male Bespoke & Suits">Male Bespoke & Suits (3 Months)</option>
                  <option value="Fashion Business Mentorship">Fashion Business Mentorship (1 Month)</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white py-4 mt-4 flex items-center justify-center gap-2 text-lg hover:bg-slate-800 transition">
                Request Syllabus on WhatsApp <MessageCircle size={20} />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* TAILORING FORM (Have Your Fabric?) */}
      <section className="py-24 px-6 md:px-16 max-w-7xl mx-auto flex flex-col md:flex-row gap-16">
        <div className="w-full md:w-5/12">
          <h2 className="text-3xl md:text-5xl font-serif mb-4">Have Your Fabric?</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Got that exclusive Lace or premium Ankara? Tell us what you have, and when you need it ready. We'll handle the magic.
          </p>
          <img 
            src="/fabric.jpg" 
            alt="Fabrics" 
            className="w-full aspect-[4/3] object-cover rounded-sm hidden md:block" 
            onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/800x600/eeeeee/999999?text=Fabric+Image+Missing"; }}
          />
        </div>
        <div className="w-full md:w-7/12 bg-white p-8 md:p-12 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100 rounded-sm">
          <form onSubmit={handleCustomOrder} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Choose Cloth Option</label>
              <select value={material} onChange={(e) => setMaterial(e.target.value)} className="w-full border-b border-slate-300 pb-3 focus:outline-none focus:border-amber-700 bg-transparent text-lg text-slate-800">
                <option value="Ankara">Ankara</option>
                <option value="Lace">Lace (Dry, Cord, Swiss)</option>
                <option value="Senator">Senator Material</option>
                <option value="Adire">Adire / Kampala</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">How Many Yards?</label>
              <input type="number" required value={yards} onChange={(e) => setYards(e.target.value)} placeholder="e.g. 6" className="w-full border-b border-slate-300 pb-3 focus:outline-none focus:border-amber-700 bg-transparent text-lg placeholder-slate-300 text-slate-800" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">When do you need it ready?</label>
              <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full border-b border-slate-300 pb-3 focus:outline-none focus:border-amber-700 bg-transparent text-lg text-slate-800" />
            </div>
            <button type="submit" className="w-full bg-amber-700 text-white py-4 mt-4 flex items-center justify-center gap-2 text-lg hover:bg-amber-800 transition">
              Send Details to WhatsApp <MessageCircle size={20} />
            </button>
          </form>
        </div>
      </section>

      {/* --- NEW SECTION: CLIENT DIARIES (TESTIMONIALS) --- */}
      <section className="py-24 px-6 md:px-16 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-serif mb-12 text-center text-slate-900">Client Diaries</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#FDFBF7] p-8 border border-slate-200/60 rounded-sm">
              <div className="flex text-amber-500 mb-4">
                {[...Array(5)].map((_, idx) => <Star key={idx} size={16} fill="currentColor" />)}
              </div>
              <p className="text-slate-600 italic mb-6 leading-relaxed">"Jupilo made my reception dress and it was absolute perfection. No endless adjustment sessions needed. They truly understand the female form."</p>
              <p className="font-serif font-medium text-slate-900">- Mrs. Olamide T.</p>
              <p className="text-xs text-amber-700 uppercase tracking-widest mt-1">Bespoke Bridal Client</p>
            </div>
            
            <div className="bg-[#FDFBF7] p-8 border border-slate-200/60 rounded-sm">
              <div className="flex text-amber-500 mb-4">
                {[...Array(5)].map((_, idx) => <Star key={idx} size={16} fill="currentColor" />)}
              </div>
              <p className="text-slate-600 italic mb-6 leading-relaxed">"The sharpest Senator suit I own. The finishing on the inside is just as neat as the outside. It’s clear they take their craft seriously."</p>
              <p className="font-serif font-medium text-slate-900">- Chuks E.</p>
              <p className="text-xs text-amber-700 uppercase tracking-widest mt-1">Bespoke Menswear Client</p>
            </div>

            <div className="bg-[#FDFBF7] p-8 border border-slate-200/60 rounded-sm">
              <div className="flex text-amber-500 mb-4">
                {[...Array(5)].map((_, idx) => <Star key={idx} size={16} fill="currentColor" />)}
              </div>
              <p className="text-slate-600 italic mb-6 leading-relaxed">"I enrolled in the Corsetry & Bridal class at the Academy. In 4 months, I went from not knowing how to thread a sewing machine to drafting and making full bridal dresses. Best investment ever."</p>
              <p className="font-serif font-medium text-slate-900">- Aisha R.</p>
              <p className="text-xs text-amber-700 uppercase tracking-widest mt-1">Jupilo Academy Alumni</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- NEW SECTION: FAQ --- */}
      <section className="py-24 px-6 md:px-16 bg-[#FDFBF7]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-serif mb-3 text-slate-900">Frequently Asked Questions</h2>
            <p className="text-slate-500">Everything you need to know about ordering and the Academy.</p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-slate-200 bg-white rounded-sm overflow-hidden">
                <button 
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none hover:bg-slate-50 transition"
                >
                  <span className="font-serif font-medium text-lg text-slate-900">{faq.q}</span>
                  {openFaq === index ? <Minus size={20} className="text-amber-700" /> : <Plus size={20} className="text-slate-400" />}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6 text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- NEW SECTION: NEWSLETTER --- */}
      <section className="py-24 px-6 md:px-16 bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <Scissors className="mx-auto text-amber-500 mb-6" size={32} />
          <h2 className="text-3xl md:text-5xl font-serif mb-4">Join the Inner Circle</h2>
          <p className="text-slate-300 font-light text-lg mb-10 max-w-2xl mx-auto">
            Subscribe to receive exclusive access to our newest ready-to-wear drops, upcoming Academy intake dates, and premium styling tips.
          </p>
          
          <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row max-w-lg mx-auto gap-4">
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address" 
              className="flex-1 bg-transparent border border-slate-700 px-6 py-4 text-white focus:outline-none focus:border-amber-500 rounded-sm"
            />
            <button 
              type="submit" 
              className="bg-amber-700 text-white px-8 py-4 uppercase tracking-wide text-sm hover:bg-amber-800 transition rounded-sm whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-white py-16 px-6 text-center">
        <h3 className="text-3xl font-serif font-bold tracking-widest mb-6">JUPILO.</h3>
        <div className="flex justify-center space-x-8 mb-10">
          <a href="https://instagram.com/jupilo" target="_blank" rel="noreferrer" className="flex flex-col items-center gap-2 hover:text-amber-500 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
            </svg>
            <span className="text-xs tracking-widest uppercase">Instagram</span>
          </a>
          <a href="https://x.com/jupilo" target="_blank" rel="noreferrer" className="flex flex-col items-center gap-2 hover:text-amber-500 transition">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span className="text-xs tracking-widest uppercase">X (Twitter)</span>
          </a>
          <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-2 hover:text-amber-500 transition">
            <MessageCircle size={24} />
            <span className="text-xs tracking-widest uppercase">WhatsApp</span>
          </a>
        </div>
        <p className="text-slate-500 font-light text-sm uppercase tracking-widest">
          Fashion House • Academy • Custom Tailoring
        </p>
        <p className="text-slate-600 text-xs mt-8">© 2026 Jupilo. Crafted by Guv'nor Magkk.</p>
      </footer>
    </div>
  );
}