'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, MessageSquare, ShoppingBag, Star, Truck, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

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
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-[#0B1120] text-slate-300 flex flex-col justify-between">
        <div>
          <div className="p-6">
            <h1 className="text-xl font-serif font-bold text-white tracking-widest">LUXE ADMIN</h1>
            <p className="text-[9px] uppercase tracking-widest text-slate-500 mt-1">Management Portal</p>
          </div>
          <nav className="mt-6 flex flex-col gap-1 px-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
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
        
        {/* Footer Link */}
        <div className="p-4 border-t border-slate-800">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-md text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <ArrowLeft size={16} />
            Back to Store
          </Link>
        </div>
      </div>

      {/* Main Content Viewport */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}