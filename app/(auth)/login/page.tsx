"use client";
import { useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus, Loader2, Lock, Mail, User, ShieldCheck } from "lucide-react";
import Swal from "sweetalert2";

export default function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        if (password !== confirmPassword) {
          throw new Error("ລະຫັດຜ່ານບໍ່ກົງກັນ!");
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });

        if (error) throw error;

        if (data.session) {
          Swal.fire({ icon: 'success', title: 'ສະໝັກສຳເລັດ!', timer: 1500, showConfirmButton: false });
          // ✅ ໃຊ້ window.location ເພື່ອໃຫ້ Middleware ເຫັນ Cookie ໃໝ່ທັນທີ
          window.location.href = "/";
        } else {
          Swal.fire("ກວດສອບ Email", "ກະລຸນາຢືນຢັນໃນ Email ຂອງເຈົ້າກ່ອນ (ຫຼື ປິດ Confirm Email ໃນ Supabase)", "info");
        }

      } else {
        // 🔐 ສ່ວນການເຂົ້າສູ່ລະບົບ
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) throw error;

        if (data.session) {
          Swal.fire({
            icon: 'success',
            title: 'ເຂົ້າສູ່ລະບົບສຳເລັດ',
            timer: 1000,
            showConfirmButton: false
          }).then(() => {
            // ✅ ໃຊ້ window.location.href ແທນ router.push 
            // ເພື່ອແກ້ບັນຫາ "Login ແລ້ວບໍ່ໄປໃສ" ທີ່ເກີດຈາກ Middleware
            window.location.href = "/";
          });
        }
      }
    } catch (error: any) {
      let msg = error.message;
      if (msg === "Invalid login credentials") msg = "ອີເມລ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ";
      Swal.fire("ຜິດພາດ!", msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F7FF] flex items-center justify-center p-4 transition-colors duration-500">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl p-8 border border-sky-50 animate-in fade-in zoom-in duration-500">
        
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-tr from-sky-400 to-blue-600 rounded-[28px] mx-auto flex items-center justify-center text-white shadow-lg shadow-sky-200 mb-4 transition-transform hover:rotate-12">
            {isRegister ? <UserPlus size={40} /> : <LogIn size={40} />}
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            {isRegister ? "ສ້າງບັນຊີໃໝ່" : "ເຂົ້າສູ່ລະບົບ"}
          </h1>
          <p className="text-[10px] text-sky-400 font-bold uppercase tracking-[0.2em] mt-2">
            Thai-Lao Logistics System
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {isRegister && (
            <div className="relative animate-in slide-in-from-top-4 duration-300">
              <User className="absolute left-4 top-4 text-sky-400" size={20} />
              <input
                type="text"
                placeholder="ຊື່ ແລະ ນາມສະກຸນ"
                className="w-full bg-sky-50/50 p-4 pl-12 rounded-2xl border-2 border-transparent focus:border-sky-200 outline-none font-bold transition-all text-slate-700"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required={isRegister}
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-4 text-sky-400" size={20} />
            <input
              type="email"
              placeholder="ອີເມລ (Email)"
              className="w-full bg-sky-50/50 p-4 pl-12 rounded-2xl border-2 border-transparent focus:border-sky-200 outline-none font-bold transition-all text-slate-700"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-4 text-sky-400" size={20} />
            <input
              type="password"
              placeholder="ລະຫັດຜ່ານ"
              className="w-full bg-sky-50/50 p-4 pl-12 rounded-2xl border-2 border-transparent focus:border-sky-200 outline-none font-bold transition-all text-slate-700"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {isRegister && (
            <div className="relative animate-in slide-in-from-top-4 duration-500">
              <ShieldCheck className="absolute left-4 top-4 text-sky-400" size={20} />
              <input
                type="password"
                placeholder="ຢືນຢັນລະຫັດຜ່ານ"
                className="w-full bg-sky-50/50 p-4 pl-12 rounded-2xl border-2 border-transparent focus:border-sky-200 outline-none font-bold transition-all text-slate-700"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required={isRegister}
              />
            </div>
          )}

          <button
            disabled={loading}
            className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white p-4 rounded-2xl font-black shadow-lg shadow-sky-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : (isRegister ? "ລົງທະບຽນ" : "ເຂົ້າສູ່ລະບົບ")}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-50 text-center">
          <p className="text-sm font-bold text-slate-400">
            {isRegister ? "ມີບັນຊີແລ້ວແມ່ນບໍ່?" : "ຍັງບໍ່ມີບັນຊີແມ່ນບໍ່?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setFullName("");
                setConfirmPassword("");
              }}
              className="text-sky-500 hover:text-sky-600 font-black transition-colors ml-1"
            >
              {isRegister ? "ເຂົ້າສູ່ລະບົບ" : "ສະໝັກສະມາຊິກ"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}