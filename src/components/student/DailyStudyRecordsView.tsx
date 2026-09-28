import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StudyRecord } from '../../types';
import { getStudentStudyRecords, deleteStudyRecord } from '../../services/studyRecordService';
import { AddStudyRecordModal } from './AddStudyRecordModal';
import { Clock, BookOpen, Plus, Trash2, Calendar } from 'lucide-react';

export const DailyStudyRecordsView: React.FC = () => {
  const { currentUser } = useAuth();
  const [records, setRecords] = useState<StudyRecord[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const list = await getStudentStudyRecords(currentUser.uid);
      setRecords(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser?.uid]);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await deleteStudyRecord(id);
      setDeletingId(null);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const totalQuestions = records.reduce((acc, r) => acc + (r.solvedQuestions || 0), 0);
  const totalCorrect = records.reduce((acc, r) => acc + (r.correct || 0), 0);
  const totalWrong = records.reduce((acc, r) => acc + (r.wrong || 0), 0);
  const totalMinutes = records.reduce((acc, r) => acc + (r.durationMinutes || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Günlük Çalışma Kayıtlarım</h2>
          <p className="text-xs text-slate-500">Çözdüğünüz soruları, doğru/yanlış oranlarınızı ve çalışma sürelerinizi takip edin.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Yeni Çalışma Ekle</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500">Toplam Soru</span>
          <p className="text-2xl font-extrabold text-slate-900 font-mono mt-1">{totalQuestions}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-emerald-600">Toplam Doğru</span>
          <p className="text-2xl font-extrabold text-emerald-600 font-mono mt-1">{totalCorrect}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-rose-600">Toplam Yanlış</span>
          <p className="text-2xl font-extrabold text-rose-600 font-mono mt-1">{totalWrong}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-blue-600">Toplam Süre</span>
          <p className="text-2xl font-extrabold text-blue-600 font-mono mt-1">
            {Math.floor(totalMinutes / 60)}s {totalMinutes % 60}dk
          </p>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 font-bold text-sm text-slate-800">
          Çalışma Geçmişi ({records.length})
        </div>

        {records.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            Henüz çalışma kaydı bulunmuyor.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Tarih</th>
                  <th className="py-3 px-4">Ders & Konu</th>
                  <th className="py-3 px-3 text-center">Çözülen Soru</th>
                  <th className="py-3 px-3 text-center text-emerald-700">Doğru</th>
                  <th className="py-3 px-3 text-center text-rose-700">Yanlış</th>
                  <th className="py-3 px-3 text-center">Süre</th>
                  <th className="py-3 px-3 text-center">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">{r.date}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900">{r.subject}</span>
                      <span className="text-slate-400 ml-1.5">• {r.topic}</span>
                      {r.notes && <div className="text-[11px] text-slate-500 mt-0.5">{r.notes}</div>}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-800">{r.solvedQuestions}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-emerald-700">{r.correct}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-rose-700">{r.wrong}</td>
                    <td className="py-3 px-3 text-center font-mono text-slate-600">{r.durationMinutes} dk</td>
                    <td className="py-3 px-3 text-center">
                      {deletingId === r.id ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleDelete(r.id)}
                            className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold hover:bg-rose-700"
                          >
                            Sil
                          </button>
                          <button
                            onClick={() => setDeletingId(null)}
                            className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px] hover:bg-slate-300"
                          >
                            İptal
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeletingId(r.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="Kaydı Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddStudyRecordModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onRecordAdded={loadData}
      />

    </div>
  );
};
