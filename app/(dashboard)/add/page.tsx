"use client";
import { useState } from 'react';
import { supabase } from "../../../lib/supabase";
import { useRouter } from 'next/navigation';
import { 
  Plus, Trash2, Save, ArrowLeft, Loader2, 
  CreditCard, Send, User, AlertCircle 
} from 'lucide-react';
import Link from 'next/link';
import Swal from 'sweetalert2';

export default function AddOrderGroup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [orderHeader, setOrderHeader] = useState({
    customer_name: '',
    order_date: new Date().toISOString().split('T')[0],
    total_shipping_thb: 0,
    paid_amount_thb: 0,
    transfer_fee_thb: 0,
  });

  const [items, setItems] = useState([{ product_name: 'ສິນຄ້າຕາມບິນ', price_thb: 0, selling_price_thb: 0 }]);

  const addNewItem = () => setItems([...items, { product_name: 'ສິນຄ້າຕາມບິນ', price_thb: 0, selling_price_thb: 0 }]);
  const removeItem = (index: number) => items.length > 1 && setItems(items.filter((_, i) => i !== index));
  
  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items] as any;
    newItems[index][field] = value;
    setItems(newItems);
  };

  const totalProductCost = items.reduce((acc, item) => acc + item.price_thb, 0);
  const totalCostThb = totalProductCost + orderHeader.total_shipping_thb + orderHeader.transfer_fee_thb;
  const totalSellingPrice = items.reduce((acc, item) => acc + item.selling_price_thb, 0);
  const totalNetProfitThb = totalSellingPrice - totalCostThb;
  const pendingAmount = totalCostThb - orderHeader.paid_amount_thb;

  // 🛑 Logic ກວດສອບຂໍ້ມູນ: ຫ້າມຕົ້ນທຶນ ຫຼື ລາຄາຂາຍ ເປັນ 0
  const isInvalid = items.some(item => item.price_thb <= 0 || item.selling_price_thb <= 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isInvalid) {
      Swal.fire({
        title: 'ຂໍ້ມູນບໍ່ຄົບຖ້ວນ',
        text: 'ກະລຸນາປ້ອນ ຕົ້ນທຶນ ແລະ ລາຄາຂາຍ ໃຫ້ຖືກຕ້ອງກ່ອນບັນທຶກ',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
      return;
    }

    setLoading(true);
    const finalCustomerName = orderHeader.customer_name.trim() === "" ? "ລູກຄ້າທົ່ວໄປ" : orderHeader.customer_name;

    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_name: finalCustomerName,
          order_date: new Date(orderHeader.order_date).toISOString(),
          total_shipping_thb: orderHeader.total_shipping_thb,
          paid_amount_thb: orderHeader.paid_amount_thb,
          transfer_fee_thb: orderHeader.transfer_fee_thb,
          exchange_rate: 1, 
        }])
        .select().single();

      if (orderError) throw orderError;

      const itemsWithId = items.map(item => ({
        product_name: item.product_name,
        price_thb: item.price_thb,
        selling_price_thb: item.selling_price_thb,
        order_id: orderData.id,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(itemsWithId);
      if (itemsError) throw itemsError;

      await Swal.fire({
        title: 'ບັນທຶກສຳເລັດ!',
        text: `ຂໍ້ມູນບິນຂອງ ${finalCustomerName} ຖືກເກັບແລ້ວ`,
        icon: 'success',
        confirmButtonColor: '#0ea5e9'
      });

      router.push('/');
      router.refresh();
    } catch (err: any) {
      Swal.fire('ຜິດພາດ!', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-4 max-w-2xl mx-auto pb-44 bg-[#F0F7FF] min-h-screen font-sans">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="p-2.5 bg-white rounded-2xl border border-sky-100 shadow-sm text-sky-400 hover:bg-sky-500 hover:text-white transition-all">
          <ArrowLeft size={24}/>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">ສ້າງບິນໃໝ່</h1>
          <p className="text-[10px] text-sky-400 font-bold uppercase tracking-widest italic">Quick Billing Mode</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Info */}
        <div className="bg-white p-6 rounded-[32px] border border-sky-50 shadow-sm space-y-5">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase ml-1 flex items-center gap-2">
                <User size={14} className="text-sky-500" /> ຊື່ລູກຄ້າ
              </label>
              <input 
                type="text" 
                placeholder="ປ້ອນຊື່ ຫຼື ປະຫວ່າງໄວ້ເພື່ອໃຊ້ 'ລູກຄ້າທົ່ວໄປ'..." 
                className="w-full bg-sky-50/50 p-4 rounded-2xl border-2 border-transparent outline-none font-bold text-slate-800 focus:border-sky-200 focus:bg-white transition-all"
                value={orderHeader.customer_name}
                onChange={e => setOrderHeader({...orderHeader, customer_name: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase ml-1">ວັນທີບິນ</label>
                  <input type="date" value={orderHeader.order_date} className="w-full bg-sky-50/50 p-4 rounded-2xl border-none font-bold text-slate-600 outline-none" onChange={e => setOrderHeader({...orderHeader, order_date: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase ml-1">ຄ່າສົ່ງຝັ່ງໄທ (฿)</label>
                  <input type="number" placeholder="0" className="w-full bg-sky-50/50 p-4 rounded-2xl border-none font-bold text-sky-600 outline-none" onChange={e => setOrderHeader({...orderHeader, total_shipping_thb: Number(e.target.value)})} />
                </div>
            </div>
        </div>

        {/* Financial Summary Card */}
        <div className="bg-gradient-to-br from-sky-600 to-blue-700 p-8 rounded-[40px] text-white shadow-xl shadow-sky-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="grid grid-cols-2 gap-6 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-sky-200 uppercase tracking-widest flex items-center gap-2">
                <CreditCard size={14}/> ຄ່າຈ້າງໂອນ
              </label>
              <input 
                type="number" 
                placeholder="0" 
                className="w-full bg-white/10 p-4 rounded-2xl border border-white/20 outline-none font-black text-2xl text-white focus:border-white transition-all"
                onChange={e => setOrderHeader({...orderHeader, transfer_fee_thb: Number(e.target.value)})} 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-sky-200 uppercase tracking-widest flex items-center gap-2">
                <Save size={14}/> ໂອນແລ້ວ
              </label>
              <input 
                type="number" 
                placeholder="0" 
                className="w-full bg-white/10 p-4 rounded-2xl border border-white/20 outline-none font-black text-2xl text-white focus:border-white transition-all"
                onChange={e => setOrderHeader({...orderHeader, paid_amount_thb: Number(e.target.value)})} 
              />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-end">
             <div>
               <p className="text-[10px] text-sky-200/70 font-bold uppercase">ຄ້າງຈ່າຍ</p>
               <p className={`text-2xl font-black ${pendingAmount > 0 ? 'text-orange-300' : 'text-emerald-300'}`}>
                 {pendingAmount.toLocaleString()} ฿
               </p>
             </div>
             <div className="text-right">
               <p className="text-[10px] text-sky-200/70 font-bold uppercase">ຕົ້ນທຶນລວມ</p>
               <p className="text-sm font-bold text-white">{totalCostThb.toLocaleString()} ฿</p>
             </div>
          </div>
        </div>

        {/* Price Entry Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">ລາຍການຄິດໄລ່</h2>
            <button type="button" onClick={addNewItem} className="text-sky-500 font-bold text-[11px] flex items-center gap-1 bg-sky-50 px-3 py-1.5 rounded-full hover:bg-sky-100 transition-colors">
              <Plus size={14}/> ເພີ່ມລາຍການ
            </button>
          </div>

          {items.map((item, index) => (
            <div key={index} className="bg-white p-5 rounded-[28px] border border-sky-50 shadow-sm relative animate-in fade-in zoom-in-95">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase block mb-1 tracking-widest ml-1">ຕົ້ນທຶນ (฿)</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    className={`w-full p-4 rounded-2xl font-black outline-none text-xl transition-all ${item.price_thb <= 0 ? 'bg-red-50 text-red-500 ring-2 ring-red-100' : 'bg-slate-50 text-slate-700'}`} 
                    onChange={e => updateItem(index, 'price_thb', Number(e.target.value))} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-sky-400 uppercase block mb-1 tracking-widest ml-1">ລາຄາລວມສົ່ງ (฿)</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    className={`w-full p-4 rounded-2xl font-black outline-none text-xl transition-all ${item.selling_price_thb <= 0 ? 'bg-red-50 text-red-500 ring-2 ring-red-100' : 'bg-sky-50 text-sky-600'}`} 
                    onChange={e => updateItem(index, 'selling_price_thb', Number(e.target.value))} 
                  />
                </div>
              </div>
              
              {items.length > 1 && (
                <button 
                  type="button" 
                  onClick={() => removeItem(index)} 
                  className="absolute -top-2 -right-2 bg-white text-red-400 p-2 rounded-full shadow-md border border-red-50 hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 size={14}/>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Floating Bottom Bar */}
<div className="relative  z-40">
          <div className="bg-white/90 backdrop-blur-2xl p-4 rounded-[32px] shadow-2xl border border-white flex items-center gap-4">
             <div className="flex-1 px-4 border-r border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ກຳໄລບິນນີ້</p>
                <p className={`text-2xl font-black ${totalNetProfitThb >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {totalNetProfitThb.toLocaleString()} ฿
                </p>
             </div>
             <button 
                type="submit" 
                disabled={loading || isInvalid} 
                className={`h-16 px-8 rounded-[24px] font-black flex items-center gap-3 transition-all ${
                  isInvalid 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                  : 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-200 active:scale-95'
                }`}
             >
                {loading ? <Loader2 className="animate-spin" /> : (isInvalid ? <AlertCircle size={20}/> : <Save size={24} />)}
                {loading ? "Saving..." : (isInvalid ? "ຂໍ້ມູນບໍ່ຄົບ" : "ບັນທຶກບິນ")}
             </button>
          </div>
        </div>
      </form>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-sky-900/40 backdrop-blur-sm z-[100] flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
            <p className="mt-4 font-bold text-white uppercase tracking-widest text-[10px]">Processing Transaction...</p>
        </div>
      )}
    </main>
  );
}