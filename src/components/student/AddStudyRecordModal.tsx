import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { addStudyRecord } from '../../services/studyRecordService';
import { X, CheckCircle, Clock, BookOpen, HelpCircle } from 'lucide-react';

interface AddStudyRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordAdded?: () => void;
}

export const AddStudyRecordModal: React.FC<AddStudyRecordModalProps> = ({
  isOpen,
  onClose,
  onRecordAdded
}) => {
  const { currentUser, currentOrg } = useAuth();

  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [subject, setSubject] = useState('Matematik');
  const [topic, setTopic] = useState('Problemler');
  const [solvedQuestions, setSolvedQuestions] = useState<number>(80);
  const [correct, setCorrect] = useState<number>(65);
  const [wrong, setWrong] = useState<number>(15);
  const [durationMinutes, setDurationMinutes] = useState<number>(90);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !currentUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addStudyRecord({
        organizationId: currentUser.organizationId || currentOrg?.id || '',
        studentId: currentUser.uid,
        studentName: currentUser.name,
        date,
        subject,
        topic,
        solvedQuestions: Number(solvedQuestions),
        correct: Number(correct),
        wrong: Number(wrong),
        durationMinutes: Number(durationMinutes),
        notes
      });

      if (onRecordAdded) onRecordAdded();
      onClose();
    } catch (err) {
      console.error('Error adding study record:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">Günlük Çalışma Kaydı Ekle</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tarih</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-indigo-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ders *</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Örn: Matematik, Fizik..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-indigo-600 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Konu *</label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Örn: Problemler, Paragraf, Trigonometri..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-indigo-600 outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Çözülen Soru</label>
              <input
                type="number"
                min="0"
                value={solvedQuestions}
                onChange={(e) => setSolvedQuestions(parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-center font-bold text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-emerald-700 mb-1">Doğru</label>
              <input
                type="number"
                min="0"
                value={correct}
                onChange={(e) => setCorrect(parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-center font-bold text-emerald-700 text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-rose-700 mb-1">Yanlış</label>
              <input
                type="number"
                min="0"
                value={wrong}
                onChange={(e) => setWrong(parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-center font-bold text-rose-700 text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Çalışma Süresi (Dakika) *</label>
            <div className="relative">
              <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="number"
                min="5"
                step="5"
                required
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
                placeholder="Örn: 90"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-indigo-600 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Açıklama / Notlar</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Örn: Hız problemleri kolaydı, işçi problemlerini tekrar et"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-indigo-600 outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              Kaydet
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
