"use client";
import { useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, ShoppingBag, Star, Image as ImageIcon, MessageSquare, LogOut, Menu, X } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const closeMenu = () => setIsMobileOpen(false);

  const handleSignOut = () => {
    if (!confirm("Are you sure you want to sign out?")) return;
    document.cookie = "admin_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    localStorage.removeItem('admin_auth');
    localStorage.clear(); 
    window.location.href = '/'; 
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex font-sans">
      
      {/* MOBILE TOP NAVIGATION BAR */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 text-white flex items-center justify-between px-6 z-50 border-b border-slate-800">
        <div className="text-xl font-serif font-bold tracking-widest">LUXE & CO.</div>
        <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="text-white hover:text-amber-500 transition">
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE DARK OVERLAY */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" onClick={closeMenu} />
      )}

      {/* SIDEBAR - CLEANED FOR E-COMMERCE */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-slate-900 text-white flex flex-col z-50 transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:flex
      `}>
        <div className="p-6 border-b border-slate-800 hidden md:block">
          <div className="text-2xl font-serif font-bold tracking-widest">LUXE & CO.</div>
          <p className="text-xs text-amber-500 uppercase tracking-widest mt-1">Admin Portal</p>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar mt-16 md:mt-0">
          <Link onClick={closeMenu} href="/admin" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-sm transition">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link onClick={closeMenu} href="/admin/signature" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-sm transition">
            <Star size={20} /> Premium Collection
          </Link>
          <Link onClick={closeMenu} href="/admin/products" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-sm transition">
            <ShoppingBag size={20} /> Main Catalog
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={handleSignOut} className="flex items-center gap-3 px-4 py-3 w-full text-left text-slate-400 hover:text-white hover:text-red-400 transition">
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-24 md:pt-8 overflow-y-auto w-full text-slate-900">
        {children}
      </main>
    </div>
  );
}