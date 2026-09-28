import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogIn, ArrowLeft, AlertCircle, Building2, Lock, Mail, ShieldAlert } from 'lucide-react';

interface LoginFormProps {
  onBackToLanding: () => void;
  onSwitchToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onBackToLanding, onSwitchToRegister }) => {
  const { login, verifiedOrg, currentOrg, setDemoUser } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const activeOrg = currentOrg || verifiedOrg;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Lütfen e-posta ve şifrenizi girin.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      await login(email, password);
    } catch (err: any) {
      console.error('Login error:', err);
      let msg = 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        msg = 'Hatalı e-posta veya şifre girdiniz.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Geçerli bir e-posta adresi yazın.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Çok fazla başarısız deneme yapıldı. Lütfen biraz bekleyip tekrar deneyin.';
      } else if (err.code === 'auth/network-request-failed') {
        msg = 'Ağ bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.';
      } else if (err.message) {
        msg = err.message;
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 sm:p-8 animate-in fade-in duration-200">
        
        {/* Back navigation */}
        <button
          onClick={onBackToLanding}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Ana Sayfaya Dön</span>
        </button>

        {/* Institution Info Badge */}
        {activeOrg && (
          <div className="p-3 mb-6 rounded-xl bg-indigo-50/80 border border-indigo-100 flex items-center gap-2.5">
            <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] uppercase font-bold text-indigo-800 tracking-wider">
                Giriş Yapılacak Kurum
              </p>
              <p className="text-xs font-semibold text-slate-800 truncate">
                {activeOrg.name} ({activeOrg.code})
              </p>
            </div>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Giriş Yap</h2>
          <p className="text-xs text-slate-500 mt-1">
            Kampüs Koç hesabınızla oturum açarak çalışmalarınıza devam edin.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              E-Posta Adresi
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@ogrenci.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 text-sm outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Şifre
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 text-sm outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm transition shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Oturum Aç</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Fill Buttons for Fast Evaluation */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <p className="text-[11px] font-semibold text-slate-500 mb-2 text-center uppercase tracking-wider">
            Veya Hızlı Test Profiliyle Giriş Yap:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setDemoUser('student', activeOrg?.code || 'DDKUTAHYA', 'Sayısal')}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-left truncate"
            >
              🎓 Öğrenci (Sayısal)
            </button>
            <button
              onClick={() => setDemoUser('coach', activeOrg?.code || 'DDKUTAHYA')}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-left truncate"
            >
              🧑‍🏫 YKS Koçu
            </button>
            <button
              onClick={() => setDemoUser('org_admin', activeOrg?.code || 'DDKUTAHYA')}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-left truncate"
            >
              🏢 Kurum Müdürü
            </button>
            <button
              onClick={() => setDemoUser('super_admin')}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 text-left truncate"
            >
              ⚡ Super Admin
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-600">
          <span>Henüz hesabınız yok mu? </span>
          <button
            onClick={onSwitchToRegister}
            className="font-bold text-indigo-600 hover:text-indigo-700 underline"
          >
            Öğrenci Hesabı Oluştur
          </button>
        </div>

      </div>
    </div>
  );
};
