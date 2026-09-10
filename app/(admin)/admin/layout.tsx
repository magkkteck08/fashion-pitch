"use client";
import { useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, ShoppingBag, Calendar, Image as ImageIcon, MessageSquare, LogOut, Scissors, BookOpen, Menu, X } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Helper to close menu when a link is clicked on mobile
  const closeMenu = () => setIsMobileOpen(false);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex font-sans">
      
      {/* MOBILE TOP NAVIGATION BAR */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 text-white flex items-center justify-between px-6 z-50 border-b border-slate-800">
        <div className="text-xl font-serif font-bold tracking-widest">JUPILO.</div>
        <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="text-white hover:text-amber-500 transition">
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE DARK OVERLAY */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={closeMenu}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-slate-900 text-white flex flex-col z-50 transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:flex
      `}>
        <div className="p-6 border-b border-slate-800 hidden md:block">
          <div className="text-2xl font-serif font-bold tracking-widest">JUPILO.</div>
          <p className="text-xs text-amber-500 uppercase tracking-widest mt-1">Admin Portal</p>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar mt-16 md:mt-0">
          <Link onClick={closeMenu} href="/admin" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-sm transition">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link onClick={closeMenu} href="/admin/products" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-sm transition">
            <ShoppingBag size={20} /> Products
          </Link>
          <Link onClick={closeMenu} href="/admin/events" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-sm transition">
            <Calendar size={20} /> Events
          </Link>
          <Link onClick={closeMenu} href="/admin/gallery" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-sm transition">
            <ImageIcon size={20} /> Gallery
          </Link>
          <Link onClick={closeMenu} href="/admin/transformations" className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 bg-white/5 border-l-2 border-amber-500 rounded-sm transition">
            <Scissors size={20} className="text-amber-500" /> Showcases
          </Link>
          <Link onClick={closeMenu} href="/admin/academy" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-sm transition">
            <BookOpen size={20} /> Academy Leads
          </Link>
          <Link onClick={closeMenu} href="/admin/enquiries" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-sm transition">
            <MessageSquare size={20} /> Enquiries
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center gap-3 px-4 py-3 w-full text-left text-slate-400 hover:text-white hover:text-red-400 transition">
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-24 md:pt-8 overflow-y-auto w-full">
        {children}
      </main>
    </div>
  );
}