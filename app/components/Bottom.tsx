"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, History, Plus } from 'lucide-react';

function NavItem({ href, icon, label, active }: { href: string, icon: any, label: string, active: boolean }) {
  return (
    <Link href={href} className={`group relative flex items-center justify-center w-14 h-14 rounded-2xl transition-all ${
      active ? 'bg-sky-50 text-sky-600' : 'text-slate-400 hover:bg-sky-50 hover:text-sky-400'
    }`}>
      {icon}
      <span className="absolute left-20 bg-slate-900 text-white text-[10px] px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity font-bold uppercase tracking-widest whitespace-nowrap shadow-xl">
        {label}
      </span>
    </Link>
  );
}
export default function Navbar() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* 📱 Mobile & Tablet Bottom Nav (ສະແດງສະເພາະໃນຈໍນ້ອຍ) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/80 backdrop-blur-xl border-t border-sky-50 px-6 py-3 pb-8">
        <div className="flex justify-around items-center relative">
          
          {/* Home */}
          <Link href="/" className={`flex flex-col items-center gap-1 transition-all ${
            isActive('/') ? 'text-sky-600' : 'text-slate-400'
          }`}>
            <LayoutDashboard size={24} strokeWidth={isActive('/') ? 2.5 : 2} />
            <span className="text-[10px] font-black uppercase tracking-tighter">ໜ້າຫຼັກ</span>
          </Link>

          {/* Floating Center Button (ສຳລັບມືຖື) */}
          <div className="relative -top-8">
            <Link href="/add">
              <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-sky-200 border-4 border-[#F0F7FF] active:scale-90 transition-transform">
                <Plus size={32} strokeWidth={3} />
              </div>
            </Link>
          </div>

          {/* History */}
          <Link href="/history" className={`flex flex-col items-center gap-1 transition-all ${
            isActive('/history') ? 'text-sky-600' : 'text-slate-400'
          }`}>
            <History size={24} strokeWidth={isActive('/history') ? 2.5 : 2} />
            <span className="text-[10px] font-black uppercase tracking-tighter">ປະຫວັດອໍເດີ້</span>
          </Link>
        </div>
      </nav>

      {/* 💻 Desktop Sidebar/Top Nav (ສະແດງສະເພາະໃນຈໍໃຫຍ່ md ຂຶ້ນໄປ) */}
      <nav className="hidden md:flex justify-evenly items-center  fixed bottom-0   w-full   bg-white/80 backdrop-blur-xl p-4 rounded-[32px] border border-sky-50 shadow-2xl z-50">
       <Link href="/" className={`flex flex-col items-center gap-1 transition-all ${
            isActive('/') ? 'text-sky-600' : 'text-slate-400'
          }`}>
            <LayoutDashboard size={24} strokeWidth={isActive('/') ? 2.5 : 2} />
            <span className="text-[10px] font-black uppercase tracking-tighter">ໜ້າຫຼັກ</span>
          </Link>
        
        <Link href="/add" className="w-16 h-16 bg-gradient-to-br from-sky-400 to-blue-600  text-white rounded-3xl flex  items-center justify-center shadow-xl shadow-sky-200 border-4 border-[#F0F7FF] hover:bg-sky-600 hover:-rotate-90 transition-all duration-300 relative -top-8">
          <Plus size={28} strokeWidth={3} />
        </Link>
         <Link href="/history" className={`flex flex-col items-center gap-1 transition-all ${
            isActive('/history') ? 'text-sky-600' : 'text-slate-400'
          }`}>
            <History size={24} strokeWidth={isActive('/history') ? 2.5 : 2} />
            <span className="text-[10px] font-black uppercase tracking-tighter">ປະຫວັດອໍເດີ້</span>
          </Link> 
      </nav>
    </>
  );
}

// Sub-component ສຳລັບ Desktop Item
