import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Organization } from '../../types';
import { getAllOrgs, createOrg, updateOrg } from '../../services/orgService';
import {
  Building2,
  ShieldCheck,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Users,
  GraduationCap,
  Layers,
  ArrowRight,
  ExternalLink,
  Lock,
  Sparkles,
  Server
} from 'lucide-react';

export const SuperAdminDashboard: React.FC = () => {
  const { setDemoUser } = useAuth();

  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create Org Form
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formCity, setFormCity] = useState('İstanbul');
  const [formPhone, setFormPhone] = useState('0212 555 44 33');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formManagerName, setFormManagerName] = useState('');
  const [formManagerEmail, setFormManagerEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadOrgs = async () => {
    setLoading(true);
    try {
      const list = await getAllOrgs();
      setOrgs(list);
    } catch (e) {
      console.error('Error fetching organizations:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrgs();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formCode) {
      setErrorMsg('Kurum adı ve kurum kodu zorunludur.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      await createOrg({
        name: formName.trim(),
        code: formCode.trim().toUpperCase(),
        city: formCity.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim() || `info@${formCode.toLowerCase()}.com`,
        address: formAddress.trim() || `${formCity} Merkez`,
        managerName: formManagerName.trim() || 'Kurum Müdürü',
        managerEmail: formManagerEmail.trim() || `yonetim@${formCode.toLowerCase()}.com`,
        isActive: true
      });

      setShowCreateModal(false);
      setFormName('');
      setFormCode('');
      loadOrgs();
    } catch (err: any) {
      setErrorMsg(err.message || 'Kurum oluşturulamadı.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (org: Organization) => {
    try {
      await updateOrg(org.id, { isActive: !org.isActive });
      loadOrgs();
    } catch (e) {
      console.error('Error toggling status:', e);
    }
  };

  const filteredOrgs = orgs.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.code.toLowerCase().includes(search.toLowerCase()) ||
    o.city.toLowerCase().includes(search.toLowerCase())
  );

  const totalStudents = orgs.reduce((acc, o) => acc + (o.studentCount || 85), 0);
  const totalCoaches = orgs.reduce((acc, o) => acc + (o.coachCount || 6), 0);
  const activeOrgsCount = orgs.filter(o => o.isActive).length;

  return (
    <div className="space-y-6">
      
      {/* Super Admin Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-purple-950/15">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Super Admin Paneli</span>
              </span>
              <span className="text-xs text-purple-200">Global Sistem Yönetimi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-1 tracking-tight">
              Tüm Kurumlar & Lisans Yönetimi
            </h1>
            <p className="text-purple-200 text-xs sm:text-sm mt-1 max-w-xl">
              Platforma yeni eğitim kurumu ekleyin, kurum kodları oluşturun ve multi-tenant veri izolasyonunu denetleyin.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Kurum Oluştur</span>
          </button>
        </div>
      </div>

      {/* Global System Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Toplam Kurum</span>
            <Building2 className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-mono mt-2">{orgs.length}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">{activeOrgsCount} Aktif Kurum</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Kayıtlı Öğrenci</span>
            <GraduationCap className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-mono mt-2">{totalStudents.toLocaleString('tr-TR')}</p>
          <p className="text-[11px] text-slate-400 mt-1">Platform geneli aktif aday</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Toplam Koç & Öğretmen</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-mono mt-2">{totalCoaches}</p>
          <p className="text-[11px] text-slate-400 mt-1">Yetkili eğitimci</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Veritabanı Güvenliği</span>
            <Server className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xs font-bold text-slate-900 font-mono mt-2">Firestore Multi-Tenant</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Kural seviyesinde izole</p>
        </div>
      </div>

      {/* Organizations List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Kayıtlı Eğitim Kurumları</h2>
            <p className="text-xs text-slate-500">
              Her kurum kendi kurum koduyla öğrencilerini ve öğretmenlerini sisteme dahil eder.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Kurum adı veya kod ara..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Kurum Adı</th>
                <th className="py-3 px-3">Kurum Kodu</th>
                <th className="py-3 px-3">Şehir</th>
                <th className="py-3 px-4">Yönetici Bilgisi</th>
                <th className="py-3 px-3 text-center">Öğrenci Sayısı</th>
                <th className="py-3 px-3 text-center">Durum</th>
                <th className="py-3 px-4 text-right">Hızlı Giriş</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrgs.map((org) => (
                <tr key={org.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                        {org.name.charAt(0)}
                      </div>
                      <div>
                        <div>{org.name}</div>
                        <div className="text-[11px] font-normal text-slate-400">{org.address}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="font-mono font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 text-xs">
                      {org.code}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-slate-700">
                    {org.city}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{org.managerName || 'Mehmet Dinç'}</div>
                    <div className="text-[11px] text-slate-400">{org.managerEmail || org.email}</div>
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-700">
                    {org.studentCount || 120}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <button
                      onClick={() => handleToggleStatus(org)}
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full transition cursor-pointer ${
                        org.isActive
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                      }`}
                    >
                      {org.isActive ? 'Aktif' : 'Pasif'}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setDemoUser('org_admin', org.code)}
                      className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition inline-flex items-center gap-1"
                    >
                      <span>Yönetici Olarak Aç</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Organization (Senaryo 1-2 strictly implemented) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-base text-slate-900">Yeni Kurum Tanımla</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            {errorMsg && (
              <div className="p-3 mb-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Kurum Adı *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="Örn: Başarı VIP Eğitim"
                    className="w-full p-2 border rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Kurum Kodu * (Büyük Harf)</label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={e => setFormCode(e.target.value.toUpperCase())}
                    placeholder="Örn: BASARIVIP"
                    className="w-full p-2 border rounded-lg font-mono font-bold text-xs uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Şehir</label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={e => setFormCity(e.target.value)}
                    placeholder="Örn: Ankara"
                    className="w-full p-2 border rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Telefon</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    placeholder="0212 000 00 00"
                    className="w-full p-2 border rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Kurum E-Posta</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  placeholder="iletisim@kurum.com"
                  className="w-full p-2 border rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Adres</label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={e => setFormAddress(e.target.value)}
                  placeholder="Adres bilgisi"
                  className="w-full p-2 border rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="font-bold block mb-1">Kurum Yöneticisi Adı</label>
                  <input
                    type="text"
                    value={formManagerName}
                    onChange={e => setFormManagerName(e.target.value)}
                    placeholder="Örn: Hasan Yılmaz"
                    className="w-full p-2 border rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Yönetici E-Postası</label>
                  <input
                    type="email"
                    value={formManagerEmail}
                    onChange={e => setFormManagerEmail(e.target.value)}
                    placeholder="hasan@kurum.com"
                    className="w-full p-2 border rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-2 border rounded-xl font-semibold text-slate-700 hover:bg-slate-100"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition shadow-md shadow-purple-600/20 cursor-pointer disabled:opacity-60"
                >
                  {submitting ? 'Oluşturuluyor...' : 'Kurumu Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
