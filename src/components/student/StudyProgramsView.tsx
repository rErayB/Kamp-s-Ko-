import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StudyProgramItem } from '../../types';
import { getStudentPrograms, updateProgramStatus } from '../../services/programService';
import { Calendar, Clock, CheckCircle2, Circle, AlertCircle } from 'lucide-react';

export const StudyProgramsView: React.FC = () => {
  const { currentUser } = useAuth();
  const [programs, setPrograms] = useState<StudyProgramItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const list = await getStudentPrograms(currentUser.uid);
      setPrograms(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser?.uid]);

  const handleToggle = async (p: StudyProgramItem) => {
    const nextStatus = p.status === 'completed' ? 'pending' : 'completed';
    try {
      await updateProgramStatus(p.id, nextStatus);
      setPrograms(prev => prev.map(item => item.id === p.id ? { ...item, status: nextStatus } : item));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Haftalık Çalışma Programım</h2>
          <p className="text-xs text-slate-500">Koçunuz tarafından belirlenen veya kendi planladığınız etütler</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span>{programs.length} Planlı Etüt</span>
        </div>
      </div>

      {programs.length === 0 ? (
        <div className="p-12 text-center text-slate-400">
          Henüz programlanmış çalışma bulunmuyor.
        </div>
      ) : (
        <div className="space-y-3">
          {programs.map((p) => {
            const isDone = p.status === 'completed';
            return (
              <div
                key={p.id}
                className={`p-4 rounded-xl border transition flex items-center justify-between gap-4 ${
                  isDone ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-200 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button onClick={() => handleToggle(p)} className="mt-0.5 text-slate-400 hover:text-emerald-600">
                    {isDone ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <Circle className="w-5 h-5 text-slate-300" />}
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-500">{p.date} • {p.startTime} - {p.endTime}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">{p.subject}</span>
                    </div>
                    <p className={`font-semibold text-sm mt-0.5 ${isDone ? 'line-through text-slate-500' : 'text-slate-900'}`}>{p.topic}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Hedef: {p.targetQuestions} soru • Koç: {p.coachName || 'Atanmadı'}</p>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {isDone ? 'Tamamlandı' : 'Bekliyor'}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
