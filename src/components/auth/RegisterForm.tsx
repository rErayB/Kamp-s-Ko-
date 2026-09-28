import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FieldType, GradeType } from '../../types';
import { UserPlus, ArrowLeft, AlertCircle, Building2, User, Mail, Phone, Lock, Target, Award } from 'lucide-react';

interface RegisterFormProps {
  onBackToLanding: () => void;
  onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onBackToLanding, onSwitchToLogin }) => {
  const { registerStudent, verifiedOrg, currentOrg } = useAuth();
  const activeOrg = currentOrg || verifiedOrg;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [grade, setGrade] = useState<GradeType>('12');
  const [field, setField] = useState<FieldType>('Sayısal');
  const [targetUniversity, setTargetUniversity] = useState('Boğaziçi Üniversitesi');
  const [targetDepartment, setTargetDepartment] = useState('Bilgisayar Mühendisliği');
  const [targetScore, setTargetScore] = useState<number>(485);
  const [targetRank, setTargetRank] = useState<number>(4500);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrg) {
      setErrorMsg('Geçerli bir kurum seçilmedi. Lütfen önce kurum kodunuzu girin.');
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg('Lütfen ad ve soyadınızı girin.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Şifreler birbiriyle uyuşmuyor.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      await registerStudent({
        email: email.trim(),
        password,
        name: `${firstName.trim()} ${lastName.trim()}`,
        phone: phone.trim(),
        organizationId: activeOrg.id,
        grade,
        field,
        targetUniversity,
        targetDepartment,
        targetScore,
        targetRank,
        dailyQuestionGoal: 150,
        weeklyStudyGoalHours: 35
      });
    } catch (err: any) {
      console.error('Registration error:', err);
      let msg = 'Kayıt oluşturulamadı. Lütfen bilgilerinizi kontrol edin.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'Bu e-posta zaten kayıtlı. Lütfen giriş yapın veya farklı bir e-posta kullanın.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Şifre çok zayıf. En az 6 karakter olmalıdır.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Geçerli bir e-posta adresi yazın.';
      } else if (err.code === 'auth/operation-not-allowed') {
        msg = 'Firebase Authentication üzerinde E-posta/Şifre sağlayıcısı etkinleştirilmelidir.';
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 sm:p-8 animate-in fade-in duration-200">
        
        {/* Back navigation */}
        <button
          onClick={onBackToLanding}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Ana Sayfaya Dön</span>
        </button>

        {/* Institution Info Badge */}
        {activeOrg ? (
          <div className="p-3 mb-6 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                Bağlanılacak Kurum
              </p>
              <p className="text-xs font-bold text-slate-900 truncate">
                {activeOrg.name} ({activeOrg.code})
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 mb-6 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
            Uyarı: Kurum kodu doğrulanmadı. Lütfen önce kurum kodunuzu girin.
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Öğrenci Kaydı</h2>
          <p className="text-xs text-slate-500 mt-1">
            YKS hedeflerinize ve alanınıza göre kişiselleştirilmiş koçluk hesabınızı oluşturun.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Ad & Soyad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Adınız *</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ahmet"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 text-sm outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Soyadınız *</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Demir"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 text-sm outline-none transition"
              />
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">E-Posta *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ahmet@example.com"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 text-sm outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Telefon</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0544 000 00 00"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 text-sm outline-none transition"
              />
            </div>
          </div>

          {/* Password & Confirm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Şifre (En az 6 hane) *</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 text-sm outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Şifre Tekrarı *</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 text-sm outline-none transition"
              />
            </div>
          </div>

          {/* Sınıf & Alan Seçimi (Çok Önemli - Senaryo 6) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Sınıf Düzeyi *</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value as GradeType)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:border-indigo-600 outline-none"
              >
                <option value="12">12. Sınıf (YKS Adayı)</option>
                <option value="Mezun">Mezun (YKS Hazırlık)</option>
                <option value="11">11. Sınıf</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-indigo-700 mb-1">
                YKS Alanı * (Denemeleri belirler)
              </label>
              <select
                value={field}
                onChange={(e) => setField(e.target.value as FieldType)}
                className="w-full px-3 py-2 rounded-lg border-2 border-indigo-400 bg-white text-sm font-semibold text-indigo-900 focus:border-indigo-600 outline-none"
              >
                <option value="Sayısal">Sayısal (Mat, Fiz, Kim, Biyo)</option>
                <option value="Eşit Ağırlık">Eşit Ağırlık (Mat, Edeb, Tar-1, Coğ-1)</option>
                <option value="Sözel">Sözel (Edeb, Tarih, Coğrafya, Felsefe)</option>
                <option value="Dil">Dil (YDT Yabancı Dil)</option>
              </select>
            </div>
          </div>

          {/* Hedef Üniversite & Bölüm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hedef Üniversite</label>
              <input
                type="text"
                value={targetUniversity}
                onChange={(e) => setTargetUniversity(e.target.value)}
                placeholder="Örn: ODTÜ, Boğaziçi, vb."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 text-sm outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hedef Bölüm</label>
              <input
                type="text"
                value={targetDepartment}
                onChange={(e) => setTargetDepartment(e.target.value)}
                placeholder="Örn: Tıp, Bilgisayar Müh., Hukuk"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 text-sm outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm transition shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-4"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Hesabımı Oluştur ve Kuruma Bağlan</span>
              </>
            )}
          </button>

        </form>

        <div className="mt-6 text-center text-xs text-slate-600">
          <span>Zaten bir hesabınız var mı? </span>
          <button
            onClick={onSwitchToLogin}
            className="font-bold text-indigo-600 hover:text-indigo-700 underline"
          >
            Giriş Yap
          </button>
        </div>

      </div>
    </div>
  );
};
