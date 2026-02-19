"use client";
import { useEffect, useState } from 'react';
import { supabase } from "../../../lib/supabase";
import { 
  Search, Calendar, Filter, ArrowLeft,
  Wallet, Clock, User, ChevronRight
} from 'lucide-react';
import Link from 'next/link';

export default function HistoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getHistory() {
      setLoading(true);
      const { data } = await supabase
        .from('order_summary_view')
        .select('*')
        .order('order_date', { ascending: false });
      if (data) setItems(data);
      setLoading(false);
    }
    getHistory();
  }, []);

  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.order_id.toString().toLowerCase().includes(searchTerm.toLowerCase()) || 
      (item.customer_name && item.customer_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const itemMonth = new Date(item.order_date).getMonth() + 1; 
    const matchesMonth = selectedMonth === "all" || itemMonth.toString() === selectedMonth;
    
    return matchesSearch && matchesMonth;
  });

  if (loading) return (
    <div className="fixed inset-0 bg-slate-50/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center font-sans">
      <div className="w-16 h-16 border-4 border-sky-100 border-t-sky-500 rounded-full animate-spin"></div>
      <p className="mt-6 font-black text-sky-600 animate-pulse uppercase tracking-[0.3em] text-[10px]">ກຳລັງໂຫລດປະຫວັດບິນ...</p>
    </div>
  );

  return (
    <main className="p-6 max-w-3xl mx-auto pb-32 space-y-8 bg-[#F0F7FF] min-h-screen font-sans">
      
      {/* Header - Blue Theme */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-3 bg-white rounded-2xl shadow-sm border border-sky-100 text-sky-400 hover:bg-sky-500 hover:text-white transition-all">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">ປະຫວັດບິນ</h2>
            <p className="text-[10px] text-sky-400 font-bold uppercase tracking-widest italic font-sans">Track by customer & time</p>
          </div>
        </div>
      </div>

      {/* 🔍 Search & Filter - Soft Blue Styling */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-300 group-focus-within:text-sky-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="ຄົ້ນຫາ ຊື່ລູກຄ້າ ຫຼື ID ບິນ..." 
            className="w-full pl-12 pr-4 py-4 bg-white rounded-[24px] border border-sky-50 shadow-sm outline-none focus:ring-4 focus:ring-sky-100 transition-all text-sm font-bold text-slate-700 placeholder:text-slate-300"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <select 
            className="w-full pl-6 pr-10 py-4 bg-white rounded-[24px] border border-sky-50 shadow-sm outline-none appearance-none text-sm font-bold text-slate-600 cursor-pointer focus:ring-4 focus:ring-sky-100 transition-all"
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="all">ທຸກເດືອນ</option>
            {[...Array(12)].map((_, i) => (
              <option key={i+1} value={i+1}>ເດືອນ {i+1}</option>
            ))}
          </select>
          <Filter size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-sky-300 pointer-events-none" />
        </div>
      </div>

      {/* 📋 Lists of Orders */}
      <div className="space-y-4">
        {filteredItems.map((item) => {
          const pending = (Number(item.total_to_pay_thb) || 0) - (Number(item.paid_amount_thb) || 0);
          const isSettled = pending <= 0;
          
          const orderDate = new Date(item.order_date);
          const formattedDate = orderDate.toLocaleDateString('lo-LA');
          const formattedTime = orderDate.toLocaleTimeString('en-GB', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          });

          return (
            <div key={item.order_id} className="bg-white p-6 rounded-[40px] border border-sky-50 shadow-sm hover:shadow-xl hover:border-sky-100 transition-all group relative overflow-hidden">
              {/* Decorative side bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isSettled ? 'bg-emerald-400' : 'bg-orange-400'}`}></div>

              <div className="flex items-start justify-between mb-6">
                <div className="flex gap-4">
                  <div className="w-14 h-14 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-500 group-hover:bg-sky-600 group-hover:text-white transition-all shadow-inner">
                    <User size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-lg tracking-tight leading-none uppercase">
                      {item.customer_name || "ບໍ່ລະບຸຊື່"}
                    </h4>
                    
                    <div className="flex items-center gap-3 mt-2">
                       <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1 uppercase tracking-tighter">
                          <Calendar size={10} className="text-sky-500"/> {formattedDate}
                       </p>
                       <p className="text-[10px] text-sky-500 font-black flex items-center gap-1 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                          <Clock size={10} className="text-blue-500"/> {formattedTime}
                       </p>
                    </div>
                  </div>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${isSettled ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600 animate-pulse'}`}>
                  {isSettled ? 'ຈ່າຍແລ້ວ' : 'ຄ້າງຈ່າຍ'}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 py-6 border-y border-sky-50">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter italic font-sans">ສິນຄ້າ</p>
                  <p className="text-lg font-black text-slate-700 leading-none">{item.total_items} <span className="text-[10px] text-slate-300 uppercase">Item</span></p>
                </div>
                <div className="space-y-1 text-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter italic font-sans">ຄ່າຈ້າງໂອນ</p>
                  <p className="text-lg font-black text-sky-600 leading-none">{Number(item.transfer_fee_thb).toLocaleString()} ฿</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter italic font-sans">ກຳໄລສຸດທິ</p>
                  <p className={`text-xl font-black leading-none ${Number(item.total_net_profit_thb) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {Number(item.total_net_profit_thb).toLocaleString()} ฿
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-[10px] font-bold">
                 <div className="flex items-center gap-2 text-slate-400">
                    <Wallet size={12} className="text-sky-400"/> ໂອນແລ້ວ: <span className="text-slate-700">{Number(item.paid_amount_thb).toLocaleString()} ฿</span>
                 </div>
                 {!isSettled && (
                   <div className="text-orange-500 flex items-center gap-1">
                      ຄ້າງຈ່າຍ: <span className="text-orange-600 font-black">{pending.toLocaleString()} ฿</span>
                   </div>
                 )}
              </div>
            </div>
          )
        })}
        
        {filteredItems.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-sky-100">
             <div className="w-16 h-16 bg-sky-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={24} className="text-sky-200" />
             </div>
             <p className="text-sky-400 font-bold text-sm italic">ບໍ່ພົບຂໍ້ມູນການສັ່ງຊື້ໃນເງື່ອນໄຂນີ້...</p>
          </div>
        )}
      </div>

      {/* Footer hint */}
      <p className="text-center text-[10px] text-sky-300 font-bold uppercase tracking-[0.2em] pt-4">End of History</p>
    </main>
  );
}