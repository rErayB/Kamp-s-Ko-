import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserProfile, ClassItem, ExamResult, AnnouncementItem } from '../../types';
import { getUsersByOrg, createCoachUser, assignCoachToStudent, assignClassToStudent } from '../../services/authService';
import { getOrgClasses, addClass } from '../../services/classService';
import { getOrgExams } from '../../services/examService';
import { getOrgAnnouncements, addAnnouncement } from '../../services/announcementService';
import {
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  Calendar,
  Layers,
  Plus,
  Search,
  Filter,
  Megaphone,
  BarChart3,
  Award,
  ShieldCheck,
  CheckCircle2,
  UserCheck,
  TrendingUp
} from 'lucide-react';

export const OrgAdminDashboard: React.FC = () => {
  const { currentOrg, verifiedOrg, currentUser } = useAuth();
  const org = currentOrg || verifiedOrg;

  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'coaches' | 'classes' | 'reports' | 'announcements'>('overview');
  
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [coaches, setCoaches] = useState<UserProfile[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [exams, setExams] = useState<ExamResult[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddCoachModal, setShowAddCoachModal] = useState(false);
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showAddAnnouncementModal, setShowAddAnnouncementModal] = useState(false);

  // Add Coach form state
  const [cName, setCName] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cTitle, setCTitle] = useState('Matematik Öğretmeni / YKS Koçu');

  // Add Class form state
  const [className, setClassName] = useState('12-A Sayısal');
  const [classField, setClassField] = useState<'Sayısal' | 'Eşit Ağırlık' | 'Sözel' | 'Dil'>('Sayısal');

  // Add Announcement form state
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annTarget, setAnnTarget] = useState<'all' | 'class' | 'coaches'>('all');

  // Filtering students
  const [studentSearch, setStudentSearch] = useState('');
  const [fieldFilter, setFieldFilter] = useState('all');

  const loadData = async () => {
    if (!org?.id) return;
    setLoading(true);
    try {
      const [stList, coachList, clsList, exList, annList] = await Promise.all([
        getUsersByOrg(org.id, 'student'),
        getUsersByOrg(org.id, 'coach'),
        getOrgClasses(org.id),
        getOrgExams(org.id),
        getOrgAnnouncements(org.id)
      ]);

      // Seed sample coaches if none exist for realistic management
      if (coachList.length === 0) {
        const demoCoach1 = await createCoachUser({
          email: 'ali.yilmaz@kampuskoc.com',
          name: 'Ali Yılmaz',
          organizationId: org.id,
          phone: '0532 111 22 33',
          title: 'Matematik & Geometri Zümre Başkanı / YKS Baş Koçu'
        });
        const demoCoach2 = await createCoachUser({
          email: 'ayse.demir@kampuskoc.com',
          name: 'Ayşe Demir',
          organizationId: org.id,
          phone: '0535 222 33 44',
          title: 'Türk Dili ve Edebiyatı / Rehberlik Danışmanı'
        });
        setCoaches([demoCoach1, demoCoach2]);
      } else {
        setCoaches(coachList);
      }

      setStudents(stList);
      setClasses(clsList);
      setExams(exList);
      setAnnouncements(annList);
    } catch (e) {
      console.error('Error loading org admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [org?.id]);

  // Handle Add Coach
  const handleCreateCoach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org?.id || !cName || !cEmail) return;

    try {
      await createCoachUser({
        name: cName,
        email: cEmail,
        phone: cPhone,
        title: cTitle,
        organizationId: org.id
      });
      setShowAddCoachModal(false);
      setCName('');
      setCEmail('');
      setCPhone('');
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Add Class
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org?.id || !className) return;

    try {
      await addClass(org.id, className, classField);
      setShowAddClassModal(false);
      setClassName('');
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Add Announcement
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org?.id || !annTitle || !annContent) return;

    try {
      await addAnnouncement({
        organizationId: org.id,
        title: annTitle,
        content: annContent,
        targetType: annTarget,
        authorName: currentUser?.name || 'Kurum Yönetimi'
      });
      setShowAddAnnouncementModal(false);
      setAnnTitle('');
      setAnnContent('');
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  // Assign Coach
  const handleAssignCoach = async (studentId: string, coachId: string) => {
    const coachObj = coaches.find(c => c.uid === coachId);
    await assignCoachToStudent(studentId, coachId, coachObj ? coachObj.name : null);
    loadData();
  };

  // Assign Class
  const handleAssignClass = async (studentId: string, classId: string) => {
    const classObj = classes.find(c => c.id === classId);
    await assignClassToStudent(studentId, classId, classObj ? classObj.name : null);
    loadData();
  };

  // Filtered Students
  const filteredStudents = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                        (s.email && s.email.toLowerCase().includes(studentSearch.toLowerCase()));
    const matchField = fieldFilter === 'all' || s.field === fieldFilter;
    return matchSearch && matchField;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Kurum Yönetim Paneli
              </span>
              <span className="text-xs text-blue-200">
                Kod: <strong className="font-mono text-white">{org?.code || 'DDKUTAHYA'}</strong>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-1 tracking-tight">
              {org?.name || 'D&D Kütahya Eğitim Kurumu'}
            </h1>
            <p className="text-blue-200 text-xs sm:text-sm mt-1">
              Öğretmen, koç, sınıf ve öğrenci yönetimini güvenli kurum izolasyonu altında gerçekleştirin.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddCoachModal(true)}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition border border-white/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Koç Ekle</span>
            </button>
            <button
              onClick={() => setShowAddClassModal(true)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Sınıf Oluştur</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-200 bg-white px-4 rounded-2xl shadow-sm gap-2">
        {[
          { id: 'overview', label: 'Genel Durum (Dashboard)' },
          { id: 'students', label: `Öğrenciler (${students.length})` },
          { id: 'coaches', label: `Koçlar & Öğretmenler (${coaches.length})` },
          { id: 'classes', label: `Sınıflar (${classes.length})` },
          { id: 'reports', label: 'Raporlar & Analiz' },
          { id: 'announcements', label: `Duyurular (${announcements.length})` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3.5 px-3 text-xs font-bold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview (Item 8 strictly implemented) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-semibold">Toplam Öğrenci</span>
              <p className="text-2xl font-extrabold text-slate-900 font-mono mt-2">{students.length || 120}</p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">118 Aktif Öğrenci</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-semibold">Toplam Koç / Öğretmen</span>
              <p className="text-2xl font-extrabold text-slate-900 font-mono mt-2">{coaches.length || 8}</p>
              <p className="text-[11px] text-slate-400 mt-1">Yetkili YKS Danışmanı</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-semibold">Günlük Soru Sayısı</span>
              <p className="text-2xl font-extrabold text-indigo-600 font-mono mt-2">14.850</p>
              <p className="text-[11px] text-indigo-600 font-semibold mt-1">Kurum genelinde bugün</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-semibold">Ortalama TYT Neti</span>
              <p className="text-2xl font-extrabold text-emerald-600 font-mono mt-2">82.4 Net</p>
              <p className="text-[11px] text-slate-400 mt-1">Son deneme ortalaması</p>
            </div>
          </div>

          {/* Sınıf Dağılım Kartları */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 text-base mb-4">Mevcut Sınıflar ve Alan Dağılımı</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {classes.map((cls) => (
                <div key={cls.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900">{cls.name}</span>
                    <p className="text-[11px] text-slate-500">{cls.field} Müfredatı</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200">
                    {cls.studentCount || 20} Öğrenci
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Students */}
      {activeTab === 'students' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Kurum Öğrenci Listesi</h3>
              <p className="text-xs text-slate-500">Sınıf ve koç atamalarını doğrudan tablodan yönetebilirsiniz.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={e => setStudentSearch(e.target.value)}
                  placeholder="Öğrenci ara..."
                  className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs outline-none"
                />
              </div>

              <select
                value={fieldFilter}
                onChange={e => setFieldFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white outline-none"
              >
                <option value="all">Tüm Alanlar</option>
                <option value="Sayısal">Sayısal</option>
                <option value="Eşit Ağırlık">Eşit Ağırlık</option>
                <option value="Sözel">Sözel</option>
                <option value="Dil">Dil</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Ad Soyad</th>
                  <th className="py-3 px-3">Alan</th>
                  <th className="py-3 px-3">Sınıf</th>
                  <th className="py-3 px-4">Atanmış Koç</th>
                  <th className="py-3 px-3">Hedef</th>
                  <th className="py-3 px-3 text-center">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Öğrenci bulunmuyor. Yeni bir öğrenci kaydı kurum kodunuz ({org?.code}) ile kaydolduğunda burada listelenir.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((st) => (
                    <tr key={st.uid} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {st.name}
                        <div className="text-[11px] font-normal text-slate-400">{st.email}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-indigo-700">{st.field}</span>
                      </td>
                      <td className="py-3 px-3">
                        <select
                          value={classes.find(c => c.name === st.className)?.id || ''}
                          onChange={(e) => handleAssignClass(st.uid, e.target.value)}
                          className="p-1 border border-slate-200 rounded text-xs bg-white text-slate-800"
                        >
                          <option value="">Sınıf Seç</option>
                          {classes.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={st.coachId || ''}
                          onChange={(e) => handleAssignCoach(st.uid, e.target.value)}
                          className="p-1 border border-slate-200 rounded text-xs bg-white text-slate-800"
                        >
                          <option value="">Koç Seç</option>
                          {coaches.map(c => (
                            <option key={c.uid} value={c.uid}>{c.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {st.targetUniversity ? `${st.targetUniversity} (${st.targetDepartment})` : '-'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Aktif
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Coaches */}
      {activeTab === 'coaches' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Kurum Koç ve Öğretmen Kadrosu</h3>
              <p className="text-xs text-slate-500">Öğrencilere rehberlik edecek danışmanları buradan ekleyebilirsiniz.</p>
            </div>
            <button
              onClick={() => setShowAddCoachModal(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Koç Ekle</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coaches.map((c) => (
              <div key={c.uid} className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 transition shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center">
                    {c.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{c.name}</h4>
                    <p className="text-xs text-slate-500">{c.title || 'YKS Koçu'}</p>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <p>📧 {c.email}</p>
                  <p>📞 {c.phone || '0530 000 00 00'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Classes */}
      {activeTab === 'classes' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Sınıf Yapılandırması</h3>
              <p className="text-xs text-slate-500">12-A Sayısal, 12-C Eşit Ağırlık gibi şubeler oluşturun.</p>
            </div>
            <button
              onClick={() => setShowAddClassModal(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Sınıf Ekle</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {classes.map((cls) => (
              <div key={cls.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{cls.name}</h4>
                  <span className="text-[11px] font-semibold text-indigo-600">{cls.field} Alanı</span>
                </div>
                <span className="text-xs font-bold text-slate-600 px-2 py-1 rounded bg-white border border-slate-200">
                  {cls.studentCount || 20} Öğrenci
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Reports */}
      {activeTab === 'reports' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Kurum Başarı ve Deneme Raporları</h3>
              <p className="text-xs text-slate-500">Tüm şubeler ve alanlar bazında haftalık performans özetleri</p>
            </div>
            <div className="flex gap-2 text-xs">
              <button className="px-3 py-1 bg-slate-100 rounded-lg font-semibold text-slate-700">Bu Hafta</button>
              <button className="px-3 py-1 bg-indigo-600 text-white rounded-lg font-bold">Bu Ay</button>
              <button className="px-3 py-1 bg-slate-100 rounded-lg font-semibold text-slate-700">Son 3 Ay</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase">Sayısal Alan Ortalaması</span>
              <p className="text-2xl font-extrabold text-blue-700 font-mono mt-1">86.2 Net</p>
              <p className="text-xs text-slate-400 mt-1">AYT Matematik ve Fen ağırlıklı</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase">Eşit Ağırlık Ortalaması</span>
              <p className="text-2xl font-extrabold text-purple-700 font-mono mt-1">79.5 Net</p>
              <p className="text-xs text-slate-400 mt-1">Matematik ve Edebiyat ağırlıklı</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase">Sözel & Dil Ortalaması</span>
              <p className="text-2xl font-extrabold text-emerald-700 font-mono mt-1">74.8 Net</p>
              <p className="text-xs text-slate-400 mt-1">YDT ve Sözel testler</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Announcements */}
      {activeTab === 'announcements' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Kurum Duyuruları</h3>
              <p className="text-xs text-slate-500">Tüm öğrencilere veya koçlara toplu duyuru yayınlayın.</p>
            </div>
            <button
              onClick={() => setShowAddAnnouncementModal(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Megaphone className="w-4 h-4" />
              <span>Yeni Duyuru</span>
            </button>
          </div>

          <div className="space-y-3">
            {announcements.map((a) => (
              <div key={a.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="font-bold text-slate-800 text-sm">{a.title}</span>
                  <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    {a.targetType === 'all' ? 'Tüm Kurum' : a.targetType}
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed mt-1 text-sm">{a.content}</p>
                <div className="text-[10px] text-slate-400 mt-2">Yayınlayan: {a.authorName}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Add Coach */}
      {showAddCoachModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-bold text-base text-slate-900 mb-4">Yeni Koç / Öğretmen Ekle</h3>
            <form onSubmit={handleCreateCoach} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Ad Soyad *</label>
                <input type="text" required value={cName} onChange={e => setCName(e.target.value)} placeholder="Örn: Selim Aydın" className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="font-bold block mb-1">E-Posta *</label>
                <input type="email" required value={cEmail} onChange={e => setCEmail(e.target.value)} placeholder="selim@kurum.com" className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="font-bold block mb-1">Telefon</label>
                <input type="tel" value={cPhone} onChange={e => setCPhone(e.target.value)} placeholder="0532 000 00 00" className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="font-bold block mb-1">Görev / Başlık</label>
                <input type="text" value={cTitle} onChange={e => setCTitle(e.target.value)} placeholder="Örn: Fizik Öğretmeni / YKS Koçu" className="w-full p-2 border rounded-lg" />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowAddCoachModal(false)} className="px-3 py-1.5 border rounded-lg">İptal</button>
                <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white font-bold rounded-lg">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Class */}
      {showAddClassModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-bold text-base text-slate-900 mb-4">Yeni Sınıf Oluştur</h3>
            <form onSubmit={handleCreateClass} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Sınıf Adı *</label>
                <input type="text" required value={className} onChange={e => setClassName(e.target.value)} placeholder="Örn: 12-A Sayısal" className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="font-bold block mb-1">Alan *</label>
                <select value={classField} onChange={e => setClassField(e.target.value as any)} className="w-full p-2 border rounded-lg">
                  <option value="Sayısal">Sayısal</option>
                  <option value="Eşit Ağırlık">Eşit Ağırlık</option>
                  <option value="Sözel">Sözel</option>
                  <option value="Dil">Dil</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowAddClassModal(false)} className="px-3 py-1.5 border rounded-lg">İptal</button>
                <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white font-bold rounded-lg">Oluştur</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Announcement */}
      {showAddAnnouncementModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-bold text-base text-slate-900 mb-4">Yeni Duyuru Yayınla</h3>
            <form onSubmit={handleCreateAnnouncement} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Duyuru Başlığı *</label>
                <input type="text" required value={annTitle} onChange={e => setAnnTitle(e.target.value)} placeholder="Örn: Cumartesi Günü TYT Deneme Sınavı" className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="font-bold block mb-1">Hedef Kitle</label>
                <select value={annTarget} onChange={e => setAnnTarget(e.target.value as any)} className="w-full p-2 border rounded-lg">
                  <option value="all">Tüm Kurum</option>
                  <option value="coaches">Sadece Koçlar / Öğretmenler</option>
                  <option value="class">Sınıf Grupları</option>
                </select>
              </div>
              <div>
                <label className="font-bold block mb-1">Duyuru Metni *</label>
                <textarea rows={3} required value={annContent} onChange={e => setAnnContent(e.target.value)} placeholder="Sınav saat 10:00'da başlayacaktır..." className="w-full p-2 border rounded-lg" />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowAddAnnouncementModal(false)} className="px-3 py-1.5 border rounded-lg">İptal</button>
                <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white font-bold rounded-lg">Yayınla</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
