import Link from 'next/link';
import { LayoutDashboard, ShoppingBag, Calendar, Image as ImageIcon, MessageSquare, LogOut, Scissors, BookOpen } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex fixed h-full z-50">
        <div className="p-6 border-b border-slate-800">
          <div className="text-2xl font-serif font-bold tracking-widest">JUPILO.</div>
          <p className="text-xs text-amber-500 uppercase tracking-widest mt-1">Admin Portal</p>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-sm transition">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link href="/admin/products" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-sm transition">
            <ShoppingBag size={20} /> Products
          </Link>
          <Link href="/admin/events" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-sm transition">
            <Calendar size={20} /> Events
          </Link>
          <Link href="/admin/gallery" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-sm transition">
            <ImageIcon size={20} /> Gallery
          </Link>
          
          {/* NEW LINKS ALREADY WIRED UP */}
          <Link href="/admin/transformations" className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 bg-white/5 border-l-2 border-amber-500 rounded-sm transition">
            <Scissors size={20} className="text-amber-500" /> Showcases
          </Link>
          <Link href="/admin/academy" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-sm transition">
            <BookOpen size={20} /> Academy Leads
          </Link>

          <Link href="/admin/enquiries" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-sm transition">
            <MessageSquare size={20} /> Enquiries
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center gap-3 px-4 py-3 w-full text-left text-slate-400 hover:text-white hover:text-red-400 transition">
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}