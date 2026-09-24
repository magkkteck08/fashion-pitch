'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Package, MessageSquare, ShoppingBag, 
  Star, Truck, ShieldCheck, ArrowLeft, Menu, X 
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Orders', href: '/admin/orders', icon: Package },
    { name: 'Live Chat', href: '/admin/chat', icon: MessageSquare },
    { name: 'Main Catalog', href: '/admin/products', icon: ShoppingBag },
    { name: 'Premium Line', href: '/admin/signature', icon: Star },
    { name: 'Delivery Zones', href: '/admin/delivery', icon: Truck },
    { name: 'Brand Vendors', href: '/admin/vendors', icon: ShieldCheck },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans w-full">
      
      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0B1120] text-slate-300 flex flex-col justify-between transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="p-6 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-serif font-bold text-white tracking-widest">LUXE ADMIN</h1>
              <p className="text-[9px] uppercase tracking-widest text-slate-500 mt-1">Management Portal</p>
            </div>
            <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>
          <nav className="mt-2 flex flex-col gap-1 px-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md text-xs font-bold uppercase tracking-widest transition ${
                    isActive ? 'bg-amber-700 text-white' : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon size={16} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="p-4 border-t border-slate-800">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-md text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <ArrowLeft size={16} /> Back to Store
          </Link>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <div className="md:hidden bg-[#0B1120] p-4 flex items-center gap-4 text-white shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className="text-slate-300 hover:text-white">
            <Menu size={24} />
          </button>
          <h1 className="text-sm font-serif font-bold tracking-widest uppercase">Luxe Admin</h1>
        </div>
        <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
