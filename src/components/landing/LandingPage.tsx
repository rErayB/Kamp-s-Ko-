import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Organization } from '../../types';
import {
  GraduationCap,
  Building2,
  Users,
  Target,
  BarChart3,
  CalendarCheck2,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  BookOpen,
  LineChart,
  Layers,
  ChevronRight,
  Clock,
  Award
} from 'lucide-react';

interface LandingPageProps {
  onProceedToAuth: (mode: 'login' | 'register') => void;
  onOpenSuperAdminModal?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onProceedToAuth, onOpenSuperAdminModal }) => {
  const { verifyOrgCode, verifiedOrg, clearVerifiedOrg, setDemoUser } = useAuth();
  
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successOrg, setSuccessOrg] = useState<Organization | null>(verifiedOrg);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!code.trim()) {
      setErrorMsg('Lütfen kurum kodunuzu girin.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const org = await verifyOrgCode(code);
      setSuccessOrg(org);
    } catch (err: any) {
      setErrorMsg(err.message || 'Kurum bulunamadı. Lütfen kurum kodunuzu kontrol edin.');
      setSuccessOrg(null);
    } finally {
      setLoading(false);
    }
  };

  const handleResetOrg = () => {
    clearVerifiedOrg();
    setSuccessOrg(null);
    setCode('');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Top Banner / Test Scenarios Fast Access */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Demo İpucu
            </span>
            <span>Test için hazır kurum kodları:</span>
            <button
              onClick={() => { setCode('DDKUTAHYA'); setErrorMsg(''); }}
              className="font-mono font-bold text-white bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded border border-slate-700 transition"
            >
              DDKUTAHYA
            </button>
            <button
              onClick={() => { setCode('ABCANKARA'); setErrorMsg(''); }}
              className="font-mono font-bold text-white bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded border border-slate-700 transition"
            >
              ABCANKARA
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDemoUser('super_admin')}
              className="text-purple-300 hover:text-white underline font-semibold transition"
            >
              Super Admin Paneline Git →
            </button>
          </div>
        </div>
      </div>

      {/* Hero & Verification Card Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-white via-indigo-50/30 to-slate-50 border-b border-slate-200 py-16 lg:py-24">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f01f_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f01f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Multi-Tenant Kurumsal YKS Öğrenci & Koçluk Platformu</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight sm:leading-tight">
            Öğrencilerinizin YKS Gelişimini <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-600">
              Tek Platformdan Yönetin.
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal">
            Eğitim kurumları, koçlar ve öğrenciler için özel tasarlanmış YKS yönetim sistemi.
            Kurum izolasyonu, dinamik alan bazlı TYT-AYT denemeleri ve çalışma programları.
          </p>

          {/* Verification Box (As strictly requested in items 3 & 4) */}
          <div className="mt-10 max-w-xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-6 sm:p-8 text-left transition-all">
              
              {!successOrg ? (
                // Step 1: Enter Institution Code
                <div>
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-2">
                    <Building2 className="w-4 h-4" />
                    <span>3. Aşama: İlk Açılış</span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-1">
                    Kurum Kodunuzu Girin
                  </h3>
                  <p className="text-xs text-slate-500 mb-6">
                    Bağlı olduğunuz okul veya dershanenin size verdiği kodu girerek kurumunuza bağlanın.
                  </p>

                  <form onSubmit={handleVerify} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Kurum Kodu
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={code}
                          onChange={(e) => {
                            setCode(e.target.value.toUpperCase());
                            setErrorMsg('');
                          }}
                          placeholder="Örn: DDKUTAHYA"
                          className="w-full px-4 py-3.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 font-mono font-bold tracking-wider text-slate-900 uppercase text-base placeholder:font-sans placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 outline-none transition"
                        />
                      </div>
                    </div>

                    {errorMsg && (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                        <div>
                          <p className="font-semibold">{errorMsg}</p>
                          <p className="text-[11px] text-red-600/80 mt-0.5">
                            İpucu: Varsayılan test kurum kodu olan <span className="font-mono font-bold">DDKUTAHYA</span> yazabilirsiniz.
                          </p>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm transition shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Sisteme Devam Et</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              ) : (
                // Step 2: Institution Verified Success State
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                          Kurum Doğrulandı
                        </span>
                        <button
                          onClick={handleResetOrg}
                          className="text-xs text-slate-500 hover:text-slate-800 underline font-medium"
                        >
                          Değiştir
                        </button>
                      </div>
                      <h4 className="font-extrabold text-base text-slate-900 mt-1 truncate">
                        {successOrg.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 mt-1">
                        <span>📍 {successOrg.city}</span>
                        {successOrg.code && <span className="font-mono font-semibold">Kod: {successOrg.code}</span>}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Bu kurum altında işlem yapabilmek için lütfen mevcut hesabınızla giriş yapın ya da yeni bir öğrenci kaydı oluşturun.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => onProceedToAuth('login')}
                      className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Giriş Yap</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onProceedToAuth('register')}
                      className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 text-indigo-700 font-semibold text-sm border-2 border-indigo-600/30 hover:border-indigo-600 transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Öğrenci Kaydı Oluştur</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs uppercase font-extrabold tracking-widest text-indigo-600">
            Platform Yetenekleri
          </h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            YKS Başarısı İçin Eksiksiz Dijital Altyapı
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Çoklu Kurum (Multi-Tenant)</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Her kurum tamamen bağımsız bir çalışma alanına sahiptir. Veriler Firebase Security Rules seviyesinde izole edilir, kurumlar birbirlerinin öğrencilerini veya verilerini göremez.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Dinamik Alan Bazlı Denemeler</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Sayısal, Eşit Ağırlık, Sözel ve Dil alanları için AYT dersleri dinamik yüklenir. Net formülü (Net = Doğru - Yanlış/4) otomatik hesaplanır ve filtrelenebilir grafiklerle sunulur.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
              <CalendarCheck2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Koçluk & Çalışma Programları</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Koçlar öğrencilere saat saat çalışma programı hazırlayabilir, eksik konulara özel görevler atayabilir ve gelişimlerini tek bir detaylı rapordan takip edebilir.
            </p>
          </div>

        </div>

        {/* Roles Breakdown */}
        <div className="mt-20 bg-slate-900 text-white rounded-3xl p-8 sm:p-12 overflow-hidden relative">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Roller & Yetkiler
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold mt-2 mb-4">
              4 Seviyeli Yetkilendirme Modeli
            </h3>
            <p className="text-slate-400 text-sm mb-8">
              Her rol kendi yetki seviyesine uygun ekran ve verilere erişir:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-purple-400 font-bold text-xs uppercase">Super Admin</span>
                <p className="text-sm font-semibold mt-1">Tüm Platform Yönetimi</p>
                <p className="text-xs text-slate-400 mt-1">Yeni kurum açma, kurum kodları oluşturma, sistem istatistikleri.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-blue-400 font-bold text-xs uppercase">Kurum Yöneticisi</span>
                <p className="text-sm font-semibold mt-1">Kurumsal Dashboard</p>
                <p className="text-xs text-slate-400 mt-1">Kendi okulunun öğrencileri, koçları, sınıfları ve toplu raporları.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-emerald-400 font-bold text-xs uppercase">YKS Koçu</span>
                <p className="text-sm font-semibold mt-1">Öğrenci Gelişim Takibi</p>
                <p className="text-xs text-slate-400 mt-1">Kendisine atanmış öğrencilere program yapma, görev atama, analiz.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-amber-400 font-bold text-xs uppercase">Öğrenci</span>
                <p className="text-sm font-semibold mt-1">Kişisel Başarı Merkezi</p>
                <p className="text-xs text-slate-400 mt-1">Kendi programı, çözülen sorular, deneme netleri, hedef takibi.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">Kampüs Koç</span>
            <span>•</span>
            <span>Profesyonel YKS Öğrenci ve Koçluk Yönetim Sistemi</span>
          </div>
          <div>
            <span>© {new Date().getFullYear()} Tüm Hakları Saklıdır.</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
