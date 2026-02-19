"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  Plus,
  Clock,
  ArrowRight,
  User,
  Wallet,
  BarChart3,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  LogOut, // ເພີ່ມ Icon Logout
  LayoutDashboard
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [reports, setReports] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [filterType, setFilterType] = useState<"day" | "week" | "month" | "year">("day");
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) fetchData();
  }, [filterType, user]);

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/login");
    } else {
      setUser(session.user);
    }
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push("/login");
      router.refresh();
    }
  }

  async function fetchData() {
    setLoading(true);
    const { data, error } = await supabase
      .from("order_summary_view")
      .select("*")
      .order("order_date", { ascending: true });

    if (data) {
      setReports([...data].reverse());
      const grouped = data.reduce((acc: any, curr: any) => {
        const dateObj = new Date(curr.order_date);
        let label = "";
        if (filterType === "day") label = dateObj.toLocaleDateString("lo-LA", { day: "2-digit", month: "short" });
        else if (filterType === "week") {
          const first = dateObj.getDate() - dateObj.getDay() + (dateObj.getDay() === 0 ? -6 : 1);
          label = "W-" + new Date(dateObj.setDate(first)).toLocaleDateString("lo-LA", { day: "2-digit", month: "short" });
        }
        else if (filterType === "month") label = dateObj.toLocaleDateString("lo-LA", { month: "short", year: "2-digit" });
        else label = dateObj.getFullYear().toString();

        if (!acc[label]) acc[label] = { name: label, profit: 0 };
        acc[label].profit += Number(curr.total_net_profit_thb || 0);
        return acc;
      }, {});
      setChartData(Object.values(grouped));
    }
    setLoading(false);
  }

  const handleUpdateToPaid = async (orderId: string, totalAmount: number, customerName: string) => {
    const confirm = await Swal.fire({
      title: 'ຢືນຢັນການຈ່າຍ?',
      text: `ລູກຄ້າ "${customerName}" ຈ່າຍເງິນຄົບແລ້ວແມ່ນບໍ່?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'ຈ່າຍຄົບແລ້ວ',
      cancelButtonText: 'ຍົກເລີກ',
      confirmButtonColor: '#10b981',
    });

    if (confirm.isConfirmed) {
      try {
        const { error } = await supabase.from('orders').update({ paid_amount_thb: totalAmount }).eq('id', orderId);
        if (error) throw error;
        Swal.fire({ title: 'ສຳເລັດ!', icon: 'success', timer: 1000, showConfirmButton: false });
        fetchData();
      } catch (err: any) {
        Swal.fire('ຜິດພາດ!', err.message, 'error');
      }
    }
  };

  const totalRevenue = reports.reduce((acc, curr) => acc + (Number(curr.total_selling_thb) || 0), 0);
  const totalProfit = reports.reduce((acc, curr) => acc + (Number(curr.total_net_profit_thb) || 0), 0);
  const totalPaid = reports.reduce((acc, curr) => acc + (Number(curr.paid_amount_thb) || 0), 0);
  const totalToPay = reports.reduce((acc, curr) => acc + (Number(curr.total_to_pay_thb) || 0), 0);
  const totalPending = totalToPay - totalPaid;

  if (loading) return (
    <div className="fixed inset-0 bg-slate-50/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F0F7FF] pb-40 font-sans text-slate-900">
      <header className="px-6 py-5 flex justify-between items-center bg-white/70 border-b border-sky-50 sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Image src="/logo.jpg" alt="Logo" width={45} height={45} className="rounded-2xl border-2 border-sky-100 shadow-sm" />
          <div className="hidden sm:block">
            <h1 className="text-sm  text-gray-500 font-black uppercase tracking-tight">Thai - Laos Logistic Profit Management System</h1>
            <p className="text-[12px] text-gray-400 tracking-widest">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleLogout} className="p-2.5 bg-red-50 text-red-500 rounded-2xl border border-red-100 hover:bg-red-500 hover:text-white transition-all">
            <LogOut size={20} />
          </button>
          <Link href="/add" className="w-12 h-12 bg-gradient-to-br from-sky-400 to-blue-600 rounded-2xl flex items-center justify-center text-white active:scale-90 transition-all">
            <Plus size={24} strokeWidth={3} />
          </Link>
        </div>
      </header>

      <main className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
        {/* Chart Section */}
        <section className="bg-gradient-to-br from-sky-600 to-blue-700 p-6 md:p-10 rounded-[48px] shadow-2xl shadow-sky-200 relative overflow-hidden text-white border border-white/20">
          <div className="relative z-10">
            <div className="flex justify-between mb-6">
              <div>
                <p className="text-gray-300 text-[16px] ">ລວມກຳໄລທັງໝົດ</p>
                <h2 className="text-5xl font-black tracking-tighter mt-2">{totalProfit.toLocaleString()} <span className="text-xl opacity-50 italic font-medium">฿</span></h2>
              </div>
              <div className="flex bg-white/10 p-1 rounded-[20px] backdrop-blur-md self-start">
                {(["day", "week", "month", "year"] as const).map((type) => (
                  <button key={type} onClick={() => setFilterType(type)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${filterType === type ? "bg-white text-sky-600" : "text-sky-100"}`}>
                    {type === "day" ? "ວັນ" : type === "week" ? "ອາທິດ" : type === "month" ? "ເດືອນ" : "ປີ"}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[300px] w-full mt-4">
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
      <defs>
        {/* ປັບສີ Gradient ໃຫ້ເບິ່ງນຸ່ມນວນຂຶ້ນ */}
        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
        </linearGradient>
      </defs>
      
      {/* ເພີ່ມ XAxis ໃຫ້ເຫັນຊື່ເດືອນ ຫຼື ວັນທີ ແບບຈາງໆ */}
      <XAxis 
        dataKey="name" 
        axisLine={false} 
        tickLine={false} 
        tick={{ fill: '#94a3b8', fontSize: 12 }}
        dy={10}
      />
      
      {/* ປັບ Tooltip ໃຫ້ເປັນພາສາລາວ ແລະ ສວຍງາມ */}
     <Tooltip<number, string>
  contentStyle={{ 
    borderRadius: '16px', 
    border: 'none', 
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    padding: '12px' 
  }}
  // ✅ ໃຊ້ Optional Chaining (?.) ແລະ Nullish Coalescing (??) ເພື່ອປ້ອງກັນຄ່າ undefined
  formatter={(value) => [
    `${value?.toLocaleString() ?? 0} ບາດ`, 
    'ກຳໄລ'
  ]}
  labelStyle={{ fontWeight: 'bold', marginBottom: '4px', color: '#1e293b' }}
/>
      
      <Area 
        type="monotone" 
        dataKey="profit" 
        stroke="#3b82f6" 
        strokeWidth={3} 
        fillOpacity={1} 
        fill="url(#colorProfit)"
        // ເພີ່ມ Animation ໃຫ້ເບິ່ງ Smooth
        animationDuration={1500}
        dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
        activeDot={{ r: 6, strokeWidth: 0 }}
      />
    </AreaChart>
  </ResponsiveContainer>
</div>
          </div>
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "ຍອດຂາຍລວມ", val: totalRevenue, icon: <ArrowUpRight size={14} />, color: "text-sky-600" },
            { label: "ໜີ້ຄ້າງຈ່າຍ", val: totalPending, icon: <Wallet size={14} />, color: "text-red-500" },
            { label: "ຮັບເງິນແລ້ວ", val: totalPaid, icon: <LayoutDashboard size={14} />, color: "text-blue-700" },
            { label: "ຕົ້ນທຶນທັງໝົດ", val: totalToPay, icon: <BarChart3 size={14} />, color: "text-slate-400" },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[32px] border border-sky-100 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center text-sky-400 mb-2">{stat.icon}</div>
              <p className="text-[9px] font-black text-slate-400 uppercase">{stat.label}</p>
              <p className={`text-xl font-black ${stat.color}`}>{stat.val.toLocaleString()} ฿</p>
            </div>
          ))}
        </div>

        {/* Recent Transactions */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Transactions</h3>
            <Link href="/history" className="text-[10px] font-black text-sky-500 flex items-center gap-1 uppercase">View All <ArrowRight size={12} /></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.slice(0, 6).map((item) => {
              const pending = (Number(item.total_to_pay_thb) || 0) - (Number(item.paid_amount_thb) || 0);
              const isSettled = pending <= 0;
              return (
                <div key={item.order_id} className="bg-white p-5 rounded-[32px] border border-sky-50 flex items-center gap-4 group">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${isSettled ? 'bg-emerald-500' : 'bg-orange-500'}`}>
                    <User size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-slate-800 text-sm truncate uppercase">{item.customer_name || "ລູກຄ້າທົ່ວໄປ"}</h4>
                    <span className={`text-[9px] font-black ${isSettled ? 'text-emerald-500' : 'text-orange-500 animate-pulse'}`}>
                      {isSettled ? "ຈ່າຍແລ້ວ" : `ຄ້າງຈ່າຍ: ${pending.toLocaleString()} ฿`}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-lg font-black text-slate-800">{Number(item.total_net_profit_thb).toLocaleString()} ฿</p>
                    </div>
                    {!isSettled && (
                      <button onClick={() => handleUpdateToPaid(item.order_id, Number(item.total_to_pay_thb), item.customer_name)} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl active:scale-90 transition-all border border-emerald-100">
                        <CheckCircle2 size={20} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <Link href="/add" className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-tr from-sky-500 to-blue-600 rounded-[24px] flex items-center justify-center text-white shadow-2xl z-50 border-4 border-white hover:scale-110 active:scale-90 transition-all">
        <Plus size={32} strokeWidth={3} />
      </Link>
    </div>
  );
}