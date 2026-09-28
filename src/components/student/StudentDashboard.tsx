import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ExamResult, StudyProgramItem, StudyRecord, TaskItem, MissingTopicItem } from '../../types';
import { getStudentExams } from '../../services/examService';
import { getStudentPrograms, updateProgramStatus, addStudyProgram } from '../../services/programService';
import { getStudentStudyRecords } from '../../services/studyRecordService';
import { getStudentTasks, updateTaskStatus } from '../../services/taskService';
import { getStudentMissingTopics } from '../../services/missingTopicService';
import { AddExamModal } from './AddExamModal';
import { AddStudyRecordModal } from './AddStudyRecordModal';
import { SimpleLineChart, HorizontalBarChart } from '../common/SvgCharts';
import {
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  Target,
  Award,
  BookOpen,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Layers,
  ChevronRight,
  FileSpreadsheet
} from 'lucide-react';

interface StudentDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigateTab }) => {
  const { currentUser, currentOrg } = useAuth();

  const [exams, setExams] = useState<ExamResult[]>([]);
  const [programs, setPrograms] = useState<StudyProgramItem[]>([]);
  const [studyRecords, setStudyRecords] = useState<StudyRecord[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [missingTopics, setMissingTopics] = useState<MissingTopicItem[]>([]);
  
  const [showAddExamModal, setShowAddExamModal] = useState(false);
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const todayStr = new Date().toISOString().split('T')[0];

  const loadData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const [fetchedExams, fetchedPrograms, fetchedRecords, fetchedTasks, fetchedTopics] = await Promise.all([
        getStudentExams(currentUser.uid),
        getStudentPrograms(currentUser.uid),
        getStudentStudyRecords(currentUser.uid),
        getStudentTasks(currentUser.uid),
        getStudentMissingTopics(currentUser.uid)
      ]);

      // Seed initial sample study program and mock exams if completely blank so the dashboard has rich realistic data
      if (fetchedPrograms.length === 0 && currentUser.organizationId) {
        const sampleProgram1 = await addStudyProgram({
          organizationId: currentUser.organizationId,
          studentId: currentUser.uid,
          studentName: currentUser.name,
          coachName: currentUser.coachName || 'Ali Yılmaz (YKS Koçu)',
          date: todayStr,
          startTime: '09:00',
          endTime: '10:30',
          subject: currentUser.field === 'Sayısal' ? 'Matematik' : 'Türkçe',
          topic: currentUser.field === 'Sayısal' ? 'Problemler' : 'Paragrafta Anlam',
          targetQuestions: 80,
          estimatedMinutes: 90,
          description: 'Hız ve konsantrasyon çalışması.'
        });

        const sampleProgram2 = await addStudyProgram({
          organizationId: currentUser.organizationId,
          studentId: currentUser.uid,
          studentName: currentUser.name,
          coachName: currentUser.coachName || 'Ali Yılmaz (YKS Koçu)',
          date: todayStr,
          startTime: '11:00',
          endTime: '12:00',
          subject: currentUser.field === 'Sayısal' ? 'Fizik' : 'Edebiyat',
          topic: currentUser.field === 'Sayısal' ? 'Kuvvet ve Hareket' : 'Divan Edebiyatı',
          targetQuestions: 50,
          estimatedMinutes: 60,
          description: 'Çıkmış YKS sorularını analiz et.'
        });

        setPrograms([sampleProgram1, sampleProgram2]);
      } else {
        setPrograms(fetchedPrograms);
      }

      setExams(fetchedExams);
      setStudyRecords(fetchedRecords);
      setTasks(fetchedTasks);
      setMissingTopics(fetchedTopics);
    } catch (e) {
      console.error('Error loading student dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser?.uid]);

  // Compute today's metrics
  const todayRecords = studyRecords.filter(r => r.date === todayStr);
  const todayMinutes = todayRecords.reduce((acc, r) => acc + (r.durationMinutes || 0), 0);
  const todaySolved = todayRecords.reduce((acc, r) => acc + (r.solvedQuestions || 0), 0);
  const completedTasks = tasks.filter(t => t.status === 'completed').length;

  const dailyGoal = currentUser?.dailyQuestionGoal || 150;
  const goalProgress = Math.min(100, Math.round((todaySolved / dailyGoal) * 100));

  // Toggle program completion
  const handleToggleProgram = async (item: StudyProgramItem) => {
    const nextStatus = item.status === 'completed' ? 'pending' : 'completed';
    try {
      await updateProgramStatus(item.id, nextStatus);
      setPrograms(prev => prev.map(p => p.id === item.id ? { ...p, status: nextStatus } : p));
    } catch (e) {
      console.error('Error updating program:', e);
    }
  };

  // Exam chart data
  const examChartData = exams.slice(0, 7).reverse().map(ex => ({
    label: ex.examName.length > 10 ? ex.examName.substring(0, 8) + '..' : ex.examName,
    value: ex.totalNet
  }));

  const firstName = currentUser?.name?.split(' ')[0] || 'Öğrenci';

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-indigo-900/10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Merhaba {firstName} 👋
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/15 text-indigo-100 border border-white/20">
              {currentUser?.field} Alanı • {currentUser?.grade}. Sınıf
            </span>
          </div>
          <p className="text-indigo-200 text-xs sm:text-sm mt-1 max-w-xl">
            {currentUser?.targetUniversity} - {currentUser?.targetDepartment} hedefine adım adım ilerliyorsun.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowAddRecordModal(true)}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Clock className="w-4 h-4" />
            <span>Çalışma Ekle</span>
          </button>

          <button
            onClick={() => setShowAddExamModal(true)}
            className="px-4 py-2 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 text-xs font-bold transition shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Deneme Ekle</span>
          </button>
        </div>
      </div>

      {/* Bugünkü Durum (Strictly as requested in item 11) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Bugünkü Durum
          </h2>
          <span className="text-xs text-slate-400">
            {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Stat 1: Study Duration */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Bugünkü Çalışma</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                {Math.floor(todayMinutes / 60)}s {todayMinutes % 60}dk
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Bugün kaydedilen toplam süre</p>
          </div>

          {/* Stat 2: Solved Questions */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Çözülen Soru</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                {todaySolved}
              </span>
              <span className="text-xs text-slate-400 font-medium">/ {dailyGoal}</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${goalProgress}%` }}
              />
            </div>
          </div>

          {/* Stat 3: Completed Tasks */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Tamamlanan Görev</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                {completedTasks}
              </span>
              <span className="text-xs text-slate-400 font-medium">/ {tasks.length || 0}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Koç görevleri tamamlama</p>
          </div>

          {/* Stat 4: Daily Goal */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Günlük Hedef</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                %{goalProgress}
              </span>
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">
              {todaySolved >= dailyGoal ? '🎉 Tebrikler, hedefe ulaşıldı!' : `${dailyGoal - todaySolved} soru kaldı`}
            </p>
          </div>

        </div>
      </div>

      {/* Grid: Bugünkü Program & Son Denemeler */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Bugünkü Program */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Bugünkü Çalışma Programı</h3>
              </div>
              <button
                onClick={() => onNavigateTab('programs')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>Haftalık Program →</span>
              </button>
            </div>

            {programs.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-slate-500 text-xs">Bugün için planlanmış çalışma bulunmuyor.</p>
                <button
                  onClick={() => setShowAddRecordModal(true)}
                  className="mt-2 text-xs font-bold text-indigo-600 hover:underline"
                >
                  + Kendin bir çalışma kaydet
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {programs.map((item) => {
                  const isDone = item.status === 'completed';
                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                        isDone
                          ? 'bg-slate-50/80 border-slate-200 text-slate-400'
                          : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => handleToggleProgram(item)}
                          className="mt-0.5 text-slate-400 hover:text-emerald-600 transition"
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-300 hover:text-indigo-600" />
                          )}
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-500">
                              {item.startTime} – {item.endTime}
                            </span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${isDone ? 'bg-slate-200 text-slate-600' : 'bg-indigo-50 text-indigo-700'}`}>
                              {item.subject}
                            </span>
                          </div>
                          <p className={`font-semibold text-sm mt-0.5 ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                            {item.topic}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Hedef: <span className="font-bold text-slate-700">{item.targetQuestions} soru</span>
                            {item.estimatedMinutes ? ` • ~${item.estimatedMinutes} dk` : ''}
                            {item.coachName ? ` • Koç: ${item.coachName}` : ''}
                          </p>
                        </div>
                      </div>

                      <div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                          isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isDone ? 'Tamamlandı' : 'Bekliyor'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Deneme Net Grafiği (Son Denemeler Trendi) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">YKS Net Gelişim Grafiği</h3>
                <p className="text-xs text-slate-500">Son denemelerinizdeki toplam net değişiminiz</p>
              </div>
              <button
                onClick={() => onNavigateTab('exams')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Tüm Denemeler ({exams.length}) →
              </button>
            </div>

            {exams.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <FileSpreadsheet className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-medium">Henüz deneme kaydı girilmemiş.</p>
                <button
                  onClick={() => setShowAddExamModal(true)}
                  className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-sm"
                >
                  + İlk Denemeni Ekle
                </button>
              </div>
            ) : (
              <SimpleLineChart data={examChartData} color="#4f46e5" unit="Net" height={170} />
            )}
          </div>

        </div>

        {/* Right Column (1 Col): Goals & Coach & Missing Topics */}
        <div className="space-y-6">
          
          {/* Target Goal Card */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-md">
            <div className="flex items-center justify-between text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
              <div className="flex items-center gap-1.5">
                <Target className="w-4 h-4 text-indigo-400" />
                <span>YKS Hedefim</span>
              </div>
              <button
                onClick={() => onNavigateTab('goals')}
                className="text-[11px] text-white/80 hover:text-white underline"
              >
                Düzenle
              </button>
            </div>

            <h4 className="text-lg font-extrabold text-white">
              {currentUser?.targetUniversity || 'Üniversite Belirlenmedi'}
            </h4>
            <p className="text-xs text-indigo-200 font-medium mt-0.5">
              {currentUser?.targetDepartment || 'Bölüm Hedefi'}
            </p>

            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/10 text-xs">
              <div>
                <span className="text-slate-400 text-[11px]">Hedef Sıralama</span>
                <p className="font-extrabold text-amber-400 font-mono text-sm mt-0.5">
                  #{currentUser?.targetRank?.toLocaleString('tr-TR') || '5.000'}
                </p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Hedef Puan</span>
                <p className="font-extrabold text-emerald-400 font-mono text-sm mt-0.5">
                  {currentUser?.targetScore || '480'} Puan
                </p>
              </div>
            </div>
          </div>

          {/* Assigned Coach Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Atanmış YKS Koçum
              </span>
              <Award className="w-4 h-4 text-indigo-600" />
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                {(currentUser?.coachName || 'Ali Yılmaz').charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  {currentUser?.coachName || 'Ali Yılmaz'}
                </h4>
                <p className="text-xs text-slate-500">Kıdemli YKS Baş Danışmanı</p>
              </div>
            </div>
          </div>

          {/* Missing Topics (🔴 🟠 🟡) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Eksik Konularım
                </span>
              </div>
              <button
                onClick={() => onNavigateTab('missing-topics')}
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                Tümü →
              </button>
            </div>

            {missingTopics.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                Henüz eksik konu kaydedilmedi.
              </p>
            ) : (
              <div className="space-y-2">
                {missingTopics.slice(0, 4).map((top) => (
                  <div key={top.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {top.urgency === 'high' ? '🔴' : top.urgency === 'medium' ? '🟠' : '🟡'}
                      </span>
                      <div>
                        <p className="font-bold text-slate-800">{top.topic}</p>
                        <p className="text-[10px] text-slate-400">{top.subject}</p>
                      </div>
                    </div>
                    {top.isResolved && (
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                        Çözüldü
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Modals */}
      <AddExamModal
        isOpen={showAddExamModal}
        onClose={() => setShowAddExamModal(false)}
        onExamAdded={loadData}
      />

      <AddStudyRecordModal
        isOpen={showAddRecordModal}
        onClose={() => setShowAddRecordModal(false)}
        onRecordAdded={loadData}
      />

    </div>
  );
};
