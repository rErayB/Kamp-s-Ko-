import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserProfile, StudyProgramItem, TaskItem, MissingTopicItem, CoachNoteItem, StudyRecord } from '../../types';
import { getStudentPrograms, addStudyProgram, updateProgramStatus } from '../../services/programService';
import { getStudentTasks, addTask, updateTaskStatus } from '../../services/taskService';
import { getStudentMissingTopics, addMissingTopic, toggleMissingTopicResolved } from '../../services/missingTopicService';
import { getStudentCoachNotes, addCoachNote, deleteCoachNote } from '../../services/coachNoteService';
import { getStudentStudyRecords } from '../../services/studyRecordService';
import { ExamAnalysisView } from '../student/ExamAnalysisView';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  BookOpen,
  Target,
  FileText,
  AlertTriangle,
  Send,
  Trash2,
  Lock,
  Globe
} from 'lucide-react';

interface CoachStudentDetailProps {
  student: UserProfile;
  onBack: () => void;
}

export const CoachStudentDetail: React.FC<CoachStudentDetailProps> = ({ student, onBack }) => {
  const { currentUser, currentOrg } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'exams' | 'programs' | 'tasks' | 'notes' | 'topics'>('overview');
  
  // Data states
  const [programs, setPrograms] = useState<StudyProgramItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [notes, setNotes] = useState<CoachNoteItem[]>([]);
  const [topics, setTopics] = useState<MissingTopicItem[]>([]);
  const [records, setRecords] = useState<StudyRecord[]>([]);

  // Modals / forms
  const [showAddProgram, setShowAddProgram] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddTopic, setShowAddTopic] = useState(false);

  // New Program form
  const [pDate, setPDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [pStart, setPStart] = useState('09:00');
  const [pEnd, setPEnd] = useState('10:30');
  const [pSubject, setPSubject] = useState('Matematik');
  const [pTopic, setPTopic] = useState('Problemler');
  const [pTargetQ, setPTargetQ] = useState(80);
  const [pEstMin, setPEstMin] = useState(90);
  const [pDesc, setPDesc] = useState('');

  // New Task form
  const [tTitle, setTTitle] = useState('AYT Matematik Problemlerden 100 soru çöz.');
  const [tDesc, setTDesc] = useState('Soru bankasındaki kalan testleri tamamla.');
  const [tSubject, setTSubject] = useState('Matematik');
  const [tTopic, setTTopic] = useState('Problemler');
  const [tTargetQ, setTTargetQ] = useState(100);
  const [tDueDate, setTDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });

  // New Note form
  const [newNote, setNewNote] = useState('');
  const [isPrivateNote, setIsPrivateNote] = useState(true);

  // New Topic form
  const [topicSubject, setTopicSubject] = useState('Matematik');
  const [topicName, setTopicName] = useState('');
  const [topicUrgency, setTopicUrgency] = useState<'high' | 'medium' | 'low'>('high');

  const loadAll = async () => {
    try {
      const [pList, tList, nList, topList, rList] = await Promise.all([
        getStudentPrograms(student.uid),
        getStudentTasks(student.uid),
        getStudentCoachNotes(student.uid, true),
        getStudentMissingTopics(student.uid),
        getStudentStudyRecords(student.uid)
      ]);
      setPrograms(pList);
      setTasks(tList);
      setNotes(nList);
      setTopics(topList);
      setRecords(rList);
    } catch (e) {
      console.error('Error fetching student details:', e);
    }
  };

  useEffect(() => {
    loadAll();
  }, [student.uid]);

  // Handle Add Program
  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addStudyProgram({
        organizationId: student.organizationId || currentUser?.organizationId || '',
        studentId: student.uid,
        studentName: student.name,
        coachId: currentUser?.uid,
        coachName: currentUser?.name || 'YKS Koçu',
        date: pDate,
        startTime: pStart,
        endTime: pEnd,
        subject: pSubject,
        topic: pTopic,
        targetQuestions: Number(pTargetQ),
        estimatedMinutes: Number(pEstMin),
        description: pDesc
      });
      setShowAddProgram(false);
      loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Add Task
  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addTask({
        organizationId: student.organizationId || currentUser?.organizationId || '',
        studentId: student.uid,
        studentName: student.name,
        coachId: currentUser?.uid,
        coachName: currentUser?.name || 'YKS Koçu',
        title: tTitle,
        description: tDesc,
        subject: tSubject,
        topic: tTopic,
        targetQuestions: Number(tTargetQ),
        dueDate: tDueDate
      });
      setShowAddTask(false);
      loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Add Coach Note
  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      await addCoachNote({
        organizationId: student.organizationId || currentUser?.organizationId || '',
        studentId: student.uid,
        coachId: currentUser?.uid || '',
        coachName: currentUser?.name || 'Koç',
        note: newNote.trim(),
        isPrivate: isPrivateNote,
        date: new Date().toISOString().split('T')[0]
      });
      setNewNote('');
      loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Add Topic
  const handleSaveTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicName.trim()) return;

    try {
      await addMissingTopic({
        organizationId: student.organizationId || currentUser?.organizationId || '',
        studentId: student.uid,
        subject: topicSubject,
        topic: topicName.trim(),
        urgency: topicUrgency,
        addedBy: 'coach'
      });
      setTopicName('');
      setShowAddTopic(false);
      loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  const completedProgramsCount = programs.filter(p => p.status === 'completed').length;
  const programCompletionRate = programs.length > 0 ? Math.round((completedProgramsCount / programs.length) * 100) : 0;
  const totalSolved = records.reduce((acc, r) => acc + (r.solvedQuestions || 0), 0);
  const totalMinutes = records.reduce((acc, r) => acc + (r.durationMinutes || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Back Button & Student Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
            title="Öğrenci Listesine Dön"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md shadow-indigo-600/20">
            {student.name.charAt(0)}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{student.name}</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {student.field}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {student.grade}. Sınıf
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Hedef: <span className="font-semibold text-slate-800">{student.targetUniversity}</span> ({student.targetDepartment}) • #{student.targetRank?.toLocaleString('tr-TR')} Sıralama
            </p>
          </div>
        </div>

        {/* Quick Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddTask(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold text-xs transition border border-indigo-200 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Görev Ver</span>
          </button>
          <button
            onClick={() => setShowAddProgram(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-sm flex items-center gap-1.5"
          >
            <Calendar className="w-4 h-4" />
            <span>Program Hazırla</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-200 bg-white px-4 rounded-2xl shadow-sm gap-2">
        {[
          { id: 'overview', label: 'Genel Bakış' },
          { id: 'exams', label: 'Denemeler & Netler' },
          { id: 'programs', label: `Programlar (${programs.length})` },
          { id: 'tasks', label: `Görevler (${tasks.length})` },
          { id: 'topics', label: `Eksik Konular (${topics.length})` },
          { id: 'notes', label: `Koç Notları (${notes.length})` }
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

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-semibold">Toplam Çözülen Soru</span>
              <p className="text-2xl font-extrabold text-slate-900 font-mono mt-2">{totalSolved}</p>
              <p className="text-[11px] text-slate-400 mt-1">Kayıtlı çalışmalar toplamı</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-semibold">Toplam Çalışma Süresi</span>
              <p className="text-2xl font-extrabold text-slate-900 font-mono mt-2">
                {Math.floor(totalMinutes / 60)}s {totalMinutes % 60}dk
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Verimli çalışma saati</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-semibold">Program Tamamlama</span>
              <p className="text-2xl font-extrabold text-indigo-600 font-mono mt-2">%{programCompletionRate}</p>
              <p className="text-[11px] text-slate-400 mt-1">{completedProgramsCount} / {programs.length} tamamlandı</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-semibold">Aktif Eksik Konu</span>
              <p className="text-2xl font-extrabold text-rose-600 font-mono mt-2">
                {topics.filter(t => !t.isResolved).length}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Öncelikli eksikler</p>
            </div>
          </div>

          {/* Quick Coach Notes on Overview */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 text-base mb-3">Hızlı Koç Notu Bırak</h3>
            <form onSubmit={handleSaveNote} className="space-y-3">
              <textarea
                rows={2}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Örn: Matematikte problem sorularında zorlanıyor, geometri tekrarı önerildi..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-indigo-600 outline-none"
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPrivateNote}
                    onChange={(e) => setIsPrivateNote(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span>Gizli Not (Sadece koç ve kurum yöneticisi görür)</span>
                </label>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Notu Kaydet</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab: Exams & Nets */}
      {activeTab === 'exams' && (
        <ExamAnalysisView
          overrideStudentId={student.uid}
          overrideStudentField={student.field}
          overrideStudentName={student.name}
        />
      )}

      {/* Tab: Programs */}
      {activeTab === 'programs' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Öğrenci Çalışma Programı</h3>
            <button
              onClick={() => setShowAddProgram(true)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
            >
              + Yeni Program Ekle
            </button>
          </div>

          {programs.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">Henüz program eklenmemiş.</p>
          ) : (
            <div className="space-y-2">
              {programs.map((p) => (
                <div key={p.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-500 font-semibold">{p.date} • {p.startTime} - {p.endTime}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">{p.subject}</span>
                    </div>
                    <p className="font-bold text-sm text-slate-900 mt-1">{p.topic}</p>
                    <p className="text-[11px] text-slate-500">Hedef: {p.targetQuestions} soru • {p.description}</p>
                  </div>
                  <div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${p.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {p.status === 'completed' ? 'Tamamlandı' : 'Bekliyor'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Tasks */}
      {activeTab === 'tasks' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Atanmış Görevler</h3>
            <button
              onClick={() => setShowAddTask(true)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
            >
              + Görev Ata
            </button>
          </div>

          {tasks.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">Henüz görev atanmamış.</p>
          ) : (
            <div className="space-y-2">
              {tasks.map((t) => (
                <div key={t.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{t.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{t.description}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                      <span>Ders: {t.subject} - {t.topic}</span>
                      <span>•</span>
                      <span>Hedef: {t.targetQuestions} soru</span>
                      <span>•</span>
                      <span>Son Tarih: {t.dueDate}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${t.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
                    {t.status === 'completed' ? 'Tamamlandı' : 'Devam Ediyor'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Missing Topics */}
      {activeTab === 'topics' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Eksik Konu Takibi</h3>
            <button
              onClick={() => setShowAddTopic(true)}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold"
            >
              + Eksik Konu Ekle
            </button>
          </div>

          {topics.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">Kayıtlı eksik konu yok.</p>
          ) : (
            <div className="space-y-2">
              {topics.map((top) => (
                <div key={top.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">
                      {top.urgency === 'high' ? '🔴' : top.urgency === 'medium' ? '🟠' : '🟡'}
                    </span>
                    <div>
                      <p className="font-bold text-sm text-slate-900">{top.topic}</p>
                      <p className="text-xs text-slate-500">{top.subject} • Ekleyen: {top.addedBy === 'coach' ? 'Koç' : 'Öğrenci'}</p>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      await toggleMissingTopicResolved(top.id, !top.isResolved);
                      loadAll();
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition ${top.isResolved ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}
                  >
                    {top.isResolved ? 'Çözüldü ✓' : 'Bekliyor'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Coach Notes */}
      {activeTab === 'notes' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Özel Koç Notları Geçmişi</h3>
          
          <div className="space-y-3">
            {notes.map((n) => (
              <div key={n.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="font-bold text-slate-700">{n.coachName}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{n.date}</span>
                    {n.isPrivate ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        <Lock className="w-2.5 h-2.5" /> Gizli
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                        <Globe className="w-2.5 h-2.5" /> Öğrenciye Açık
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-slate-800 text-sm leading-relaxed mt-1">{n.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Add Program */}
      {showAddProgram && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-bold text-base text-slate-900 mb-4">Öğrenciye Program Ekle</h3>
            <form onSubmit={handleSaveProgram} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Tarih</label>
                <input type="date" value={pDate} onChange={e => setPDate(e.target.value)} className="w-full p-2 border rounded-lg" required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Başlangıç Saati</label>
                  <input type="time" value={pStart} onChange={e => setPStart(e.target.value)} className="w-full p-2 border rounded-lg" required />
                </div>
                <div>
                  <label className="font-bold block mb-1">Bitiş Saati</label>
                  <input type="time" value={pEnd} onChange={e => setPEnd(e.target.value)} className="w-full p-2 border rounded-lg" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Ders</label>
                  <input type="text" value={pSubject} onChange={e => setPSubject(e.target.value)} className="w-full p-2 border rounded-lg" required />
                </div>
                <div>
                  <label className="font-bold block mb-1">Hedef Soru</label>
                  <input type="number" value={pTargetQ} onChange={e => setPTargetQ(Number(e.target.value))} className="w-full p-2 border rounded-lg" required />
                </div>
              </div>
              <div>
                <label className="font-bold block mb-1">Konu</label>
                <input type="text" value={pTopic} onChange={e => setPTopic(e.target.value)} className="w-full p-2 border rounded-lg" required />
              </div>
              <div>
                <label className="font-bold block mb-1">Açıklama</label>
                <input type="text" value={pDesc} onChange={e => setPDesc(e.target.value)} className="w-full p-2 border rounded-lg" />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowAddProgram(false)} className="px-3 py-1.5 border rounded-lg">İptal</button>
                <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white font-bold rounded-lg">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Task */}
      {showAddTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-bold text-base text-slate-900 mb-4">Öğrenciye Görev Ata</h3>
            <form onSubmit={handleSaveTask} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Görev Başlığı *</label>
                <input type="text" value={tTitle} onChange={e => setTTitle(e.target.value)} className="w-full p-2 border rounded-lg" required />
              </div>
              <div>
                <label className="font-bold block mb-1">Açıklama</label>
                <textarea value={tDesc} onChange={e => setTDesc(e.target.value)} className="w-full p-2 border rounded-lg" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Ders</label>
                  <input type="text" value={tSubject} onChange={e => setTSubject(e.target.value)} className="w-full p-2 border rounded-lg" required />
                </div>
                <div>
                  <label className="font-bold block mb-1">Konu</label>
                  <input type="text" value={tTopic} onChange={e => setTTopic(e.target.value)} className="w-full p-2 border rounded-lg" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Hedef Soru</label>
                  <input type="number" value={tTargetQ} onChange={e => setTTargetQ(Number(e.target.value))} className="w-full p-2 border rounded-lg" />
                </div>
                <div>
                  <label className="font-bold block mb-1">Son Tarih</label>
                  <input type="date" value={tDueDate} onChange={e => setTDueDate(e.target.value)} className="w-full p-2 border rounded-lg" required />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowAddTask(false)} className="px-3 py-1.5 border rounded-lg">İptal</button>
                <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white font-bold rounded-lg">Görevi Ata</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Topic */}
      {showAddTopic && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-bold text-base text-slate-900 mb-4">Eksik Konu Kaydı</h3>
            <form onSubmit={handleSaveTopic} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Ders</label>
                <input type="text" value={topicSubject} onChange={e => setTopicSubject(e.target.value)} className="w-full p-2 border rounded-lg" required />
              </div>
              <div>
                <label className="font-bold block mb-1">Konu Adı</label>
                <input type="text" value={topicName} onChange={e => setTopicName(e.target.value)} placeholder="Örn: Fonksiyonlar, Paragraf" className="w-full p-2 border rounded-lg" required />
              </div>
              <div>
                <label className="font-bold block mb-1">Öncelik Derecesi</label>
                <select value={topicUrgency} onChange={e => setTopicUrgency(e.target.value as any)} className="w-full p-2 border rounded-lg">
                  <option value="high">🔴 Yüksek Öncelik</option>
                  <option value="medium">🟠 Orta Öncelik</option>
                  <option value="low">🟡 Düşük Öncelik</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowAddTopic(false)} className="px-3 py-1.5 border rounded-lg">İptal</button>
                <button type="submit" className="px-4 py-1.5 bg-rose-600 text-white font-bold rounded-lg">Ekle</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
