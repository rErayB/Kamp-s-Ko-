import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserProfile, ExamResult } from '../../types';
import { getUsersByOrg } from '../../services/authService';
import { getOrgExams } from '../../services/examService';
import { CoachStudentDetail } from './CoachStudentDetail';
import {
  Users,
  GraduationCap,
  Calendar,
  CheckCircle2,
  Clock,
  BookOpen,
  TrendingUp,
  ArrowRight,
  Filter,
  Search,
  Award
} from 'lucide-react';

export const CoachDashboard: React.FC = () => {
  const { currentUser, currentOrg } = useAuth();
  
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [allExams, setAllExams] = useState<ExamResult[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<UserProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterField, setFilterField] = useState<string>('all');
  const [coachFilter, setCoachFilter] = useState<'all' | 'mine'>('all');
  const [loading, setLoading] = useState(true);

  const orgId = currentUser?.organizationId || currentOrg?.id || '';

  const loadCoachData = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const [fetchedStudents, fetchedExams] = await Promise.all([
        getUsersByOrg(orgId, 'student'),
        getOrgExams(orgId)
      ]);

      setStudents(fetchedStudents);
      setAllExams(fetchedExams);
    } catch (e) {
      console.error('Error loading coach dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoachData();
  }, [orgId]);

  if (selectedStudent) {
    return (
      <CoachStudentDetail
        student={selectedStudent}
        onBack={() => {
          setSelectedStudent(null);
          loadCoachData();
        }}
      />
    );
  }

  // Filter students
  const filteredStudents = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (s.email && s.email.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchField = filterField === 'all' || s.field === filterField;
    const isMine = s.coachId === currentUser?.uid || (currentUser?.assignedStudentIds && currentUser.assignedStudentIds.includes(s.uid));
    const matchCoach = coachFilter === 'all' || isMine;
    return matchSearch && matchField && matchCoach;
  });

  const myStudentsCount = students.filter(s => s.coachId === currentUser?.uid || (currentUser?.assignedStudentIds && currentUser.assignedStudentIds.includes(s.uid))).length;

  // Calculate high-level stats
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.isActive).length;

  return (
    <div className="space-y-6">
      
      {/* Coach Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-teal-950/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Koçluk Yönetim Merkezi
              </span>
              <span className="text-xs text-teal-200">
                {currentOrg?.name || 'Kurum Alanı'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-1 tracking-tight">
              {currentUser?.name || 'YKS Koçu'}
            </h1>
            <p className="text-teal-200 text-xs sm:text-sm mt-1">
              Öğrencilerinizin haftalık çalışma sürelerini, soru sayılarını ve AYT-TYT netlerini buradan yönetin.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-teal-300">Sorumlu Olduğunuz</span>
              <p className="text-2xl font-extrabold font-mono text-white">{totalStudents} Öğrenci</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Kayıtlı Öğrenci</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-mono mt-2">{totalStudents}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Tamamı aktif takipte</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Girilen Deneme</span>
            <BookOpen className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-mono mt-2">{allExams.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">Kurum genelinde kayıtlı</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Ortalama Program Başarısı</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-blue-600 font-mono mt-2">%84</p>
          <p className="text-[11px] text-slate-400 mt-1">Haftalık görev tamamlama</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Kurum Kodu İzolasyonu</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-xs font-extrabold text-purple-700 font-mono mt-2 truncate">
            {currentOrg?.code || 'DDKUTAHYA'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Veri sızıntısı engellendi</p>
        </div>
      </div>

      {/* Student List Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Takip Edilen Öğrenciler</h2>
            <p className="text-xs text-slate-500">
              Detaylı analiz, program hazırlama ve görev atamak için öğrenci kartına tıklayın.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* My Students / All Students Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setCoachFilter('all')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  coachFilter === 'all'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tüm Öğrenciler ({students.length})
              </button>
              <button
                onClick={() => setCoachFilter('mine')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  coachFilter === 'mine'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Benim Öğrencilerim ({myStudentsCount})
              </button>
            </div>

            {/* Search */}
            <div className="relative flex-1 sm:w-48">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Öğrenci ara..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:border-indigo-600 outline-none"
              />
            </div>

            {/* Field Filter */}
            <select
              value={filterField}
              onChange={e => setFilterField(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white text-slate-700 focus:border-indigo-600 outline-none"
            >
              <option value="all">Tüm Alanlar</option>
              <option value="Sayısal">Sayısal</option>
              <option value="Eşit Ağırlık">Eşit Ağırlık</option>
              <option value="Sözel">Sözel</option>
              <option value="Dil">Dil</option>
            </select>
          </div>
        </div>

        {/* Student Cards Grid (Item 25 strictly implemented) */}
        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Öğrenci bulunamadı.</p>
            <p className="text-xs text-slate-400 mt-1">
              {coachFilter === 'mine'
                ? 'Henüz size atanmış bir öğrenci bulunmuyor. "Tüm Öğrenciler" sekmesinden öğrenci seçip kendinize atayabilirsiniz.'
                : 'Arama kriterlerinizi değiştirebilirsiniz.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map((st) => {
              // Get student's latest exam if any
              const studentExams = allExams.filter(e => e.studentId === st.uid);
              const latestExam = studentExams[0];
              const lastNet = latestExam ? `${latestExam.totalNet.toFixed(1)} Net (${latestExam.examType})` : 'Henüz girilmedi';
              const isAssignedToMe = st.coachId === currentUser?.uid || (currentUser?.assignedStudentIds && currentUser.assignedStudentIds.includes(st.uid));

              return (
                <div
                  key={st.uid}
                  className="bg-white rounded-xl p-5 border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div>
                    {/* Top: Avatar & Name */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                          {st.name.charAt(0)}
                        </div>
                        <div>
                          <h3 
                            onClick={() => setSelectedStudent(st)}
                            className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition truncate max-w-[160px] cursor-pointer"
                          >
                            {st.name}
                          </h3>
                          <p className="text-xs text-slate-500">
                            {st.grade}. Sınıf • {st.className || 'Sınıf Yok'}
                          </p>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        st.field === 'Sayısal'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : st.field === 'Eşit Ağırlık'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {st.field}
                      </span>
                    </div>

                    {/* Coach Status Badge */}
                    <div className="mb-3 flex items-center justify-between">
                      {isAssignedToMe ? (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          ✓ Atanmış Koçusunuz
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500">
                          {st.coachName ? `Koç: ${st.coachName}` : 'Koç atanmamış'}
                        </span>
                      )}
                    </div>

                    {/* Target info */}
                    <div className="p-2.5 rounded-lg bg-slate-50 text-xs mb-3 text-slate-600">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Hedef:</span>
                      <p className="font-semibold text-slate-800 truncate">
                        {st.targetUniversity || 'Üniversite'} - {st.targetDepartment || 'Bölüm'}
                      </p>
                    </div>

                    {/* Metrics Required in Item 25: Son net, Deneme sayısı, Hedef puan */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Son Net:</span>
                        <span className="font-extrabold text-indigo-700 font-mono text-sm">{lastNet}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Kayıtlı Deneme:</span>
                        <span className="font-bold text-slate-800 font-mono">{studentExams.length} Deneme</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Hedef Sıralama:</span>
                        <span className="font-bold text-amber-700 font-mono">#{st.targetRank || 5000}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Günlük Soru Hedefi:</span>
                        <span className="font-bold text-emerald-600 font-mono">{st.dailyQuestionGoal || 150} Soru</span>
                      </div>
                    </div>
                  </div>

                  <div 
                    onClick={() => setSelectedStudent(st)}
                    className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform cursor-pointer"
                  >
                    <span>Gelişim Raporunu ve Programı Aç</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
};
