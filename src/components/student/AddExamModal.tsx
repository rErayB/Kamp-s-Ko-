import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ExamType, FieldType, LanguageChoice, SubjectScore } from '../../types';
import { getSubjectsForExam, calculateNet, YDT_LANGUAGES } from '../../config/yksData';
import { addExamResult } from '../../services/examService';
import { X, Calculator, CheckCircle2, AlertCircle, Save } from 'lucide-react';

interface AddExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExamAdded?: () => void;
  // If coach or admin is adding for a specific student:
  overrideStudent?: {
    id: string;
    name: string;
    field: FieldType;
    organizationId: string;
  };
}

export const AddExamModal: React.FC<AddExamModalProps> = ({
  isOpen,
  onClose,
  onExamAdded,
  overrideStudent
}) => {
  const { currentUser, currentOrg } = useAuth();

  const studentId = overrideStudent?.id || currentUser?.uid || '';
  const studentName = overrideStudent?.name || currentUser?.name || 'Öğrenci';
  const studentField: FieldType = overrideStudent?.field || currentUser?.field || 'Sayısal';
  const organizationId = overrideStudent?.organizationId || currentUser?.organizationId || currentOrg?.id || '';

  const [examName, setExamName] = useState('3D Simülasyon TYT-1');
  const [examType, setExamType] = useState<ExamType>('TYT');
  const [examDate, setExamDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [languageChoice, setLanguageChoice] = useState<LanguageChoice>('İngilizce');
  const [notes, setNotes] = useState('');
  const [scoresState, setScoresState] = useState<Record<string, { correct: number; wrong: number }>>({});
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Dynamically calculate relevant subjects based on Field and selected Exam Type
  const relevantSubjects = useMemo(() => {
    return getSubjectsForExam(studentField, examType, languageChoice);
  }, [studentField, examType, languageChoice]);

  // Handle correct/wrong changes and prevent invalid counts
  const handleScoreChange = (key: string, field: 'correct' | 'wrong', value: number, maxQuestions: number) => {
    const current = scoresState[key] || { correct: 0, wrong: 0 };
    const parsed = Math.max(0, isNaN(value) ? 0 : value);

    let nextCorrect = field === 'correct' ? parsed : current.correct;
    let nextWrong = field === 'wrong' ? parsed : current.wrong;

    if (nextCorrect + nextWrong > maxQuestions) {
      if (field === 'correct') {
        nextCorrect = maxQuestions - nextWrong;
      } else {
        nextWrong = maxQuestions - nextCorrect;
      }
    }

    setScoresState(prev => ({
      ...prev,
      [key]: { correct: nextCorrect, wrong: nextWrong }
    }));
  };

  // Calculate live summary stats
  const calculatedStats = useMemo(() => {
    let totalCorrect = 0;
    let totalWrong = 0;
    let totalEmpty = 0;
    let totalNet = 0;

    const scoresMap: Record<string, SubjectScore> = {};

    relevantSubjects.forEach(sub => {
      const entry = scoresState[sub.key] || { correct: 0, wrong: 0 };
      const empty = Math.max(0, sub.maxQuestions - (entry.correct + entry.wrong));
      const net = calculateNet(entry.correct, entry.wrong);

      totalCorrect += entry.correct;
      totalWrong += entry.wrong;
      totalEmpty += empty;
      totalNet += net;

      scoresMap[sub.key] = {
        name: sub.name,
        maxQuestions: sub.maxQuestions,
        correct: entry.correct,
        wrong: entry.wrong,
        empty,
        net
      };
    });

    return {
      scoresMap,
      totalCorrect,
      totalWrong,
      totalEmpty,
      totalNet: Math.round(totalNet * 100) / 100
    };
  }, [relevantSubjects, scoresState]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName.trim()) {
      setErrorMsg('Lütfen bir deneme adı girin (Örn: Özdebir TYT-2, MEB AYT-1)');
      return;
    }

    if (!organizationId || !studentId) {
      setErrorMsg('Öğrenci veya kurum kimliği eksik.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      await addExamResult({
        organizationId,
        studentId,
        studentName,
        studentField,
        examName,
        examType,
        examDate,
        languageChoice: studentField === 'Dil' || examType === 'YDT' ? languageChoice : undefined,
        scores: calculatedStats.scoresMap,
        notes
      });

      if (onExamAdded) onExamAdded();
      onClose();
    } catch (err: any) {
      console.error('Error saving exam:', err);
      setErrorMsg(err.message || 'Deneme kaydedilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-slate-900">Yeni Deneme Kaydı Ekle</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                {studentField} Alanı
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Öğrenci: <span className="font-semibold text-slate-700">{studentName}</span> • Netler formüle (Doğru - Yanlış/4) göre otomatik hesaplanır.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Exam Type & Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Deneme Adı / Yayın *</label>
              <input
                type="text"
                required
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                placeholder="Örn: Özdebir TYT-1, 3D AYT"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:border-indigo-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-indigo-700 mb-1">Deneme Türü *</label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value as ExamType)}
                className="w-full px-3 py-2 rounded-lg border-2 border-indigo-400 bg-white text-sm font-semibold text-indigo-900 focus:border-indigo-600 outline-none"
              >
                <option value="TYT">TYT (Temel Yeterlilik Testi)</option>
                <option value="AYT">AYT ({studentField} Alanına Göre Dinamik)</option>
                {studentField === 'Dil' && <option value="YDT">YDT (Yabancı Dil Testi)</option>}
                <option value="TYT_AYT">TYT + AYT Birleşik</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Uygulama Tarihi</label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:border-indigo-600 outline-none"
              />
            </div>
          </div>

          {/* If YDT / Dil is selected, show language selector */}
          {(studentField === 'Dil' || examType === 'YDT') && (
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900">YDT Yabancı Dil Seçimi:</span>
              <div className="flex gap-2">
                {YDT_LANGUAGES.map(lang => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLanguageChoice(lang)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      languageChoice === lang
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dynamic Subject Score Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Ders Bazlı Sonuçlar ({studentField} Müfredatı)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Doğru ve Yanlış sayılarını girin; Boş ve Net değerleri anında hesaplanır.
                </p>
              </div>

              {/* Total Live Net Badge */}
              <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl">
                <span className="text-xs font-bold text-indigo-900">Toplam Net:</span>
                <span className="text-base font-extrabold text-indigo-700 font-mono">
                  {calculatedStats.totalNet}
                </span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Ders</th>
                    <th className="py-2.5 px-2 text-center">Toplam</th>
                    <th className="py-2.5 px-2 text-center text-emerald-700">Doğru</th>
                    <th className="py-2.5 px-2 text-center text-rose-700">Yanlış</th>
                    <th className="py-2.5 px-2 text-center text-slate-500">Boş</th>
                    <th className="py-2.5 px-3 text-right text-indigo-700">Net</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {relevantSubjects.map((sub) => {
                    const current = scoresState[sub.key] || { correct: 0, wrong: 0 };
                    const empty = Math.max(0, sub.maxQuestions - (current.correct + current.wrong));
                    const net = calculateNet(current.correct, current.wrong);

                    return (
                      <tr key={sub.key} className="hover:bg-slate-50/70 transition">
                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                          <span>{sub.name}</span>
                          <span className="ml-1 text-[10px] text-slate-400">({sub.category})</span>
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono text-slate-500 font-medium">
                          {sub.maxQuestions}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <input
                            type="number"
                            min="0"
                            max={sub.maxQuestions}
                            value={current.correct || ''}
                            onChange={(e) => handleScoreChange(sub.key, 'correct', parseInt(e.target.value), sub.maxQuestions)}
                            placeholder="0"
                            className="w-16 px-2 py-1 text-center font-bold text-emerald-700 border border-slate-200 rounded-md focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 outline-none"
                          />
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <input
                            type="number"
                            min="0"
                            max={sub.maxQuestions}
                            value={current.wrong || ''}
                            onChange={(e) => handleScoreChange(sub.key, 'wrong', parseInt(e.target.value), sub.maxQuestions)}
                            placeholder="0"
                            className="w-16 px-2 py-1 text-center font-bold text-rose-700 border border-slate-200 rounded-md focus:border-rose-500 focus:ring-1 focus:ring-rose-200 outline-none"
                          />
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono text-slate-500">
                          {empty}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="font-mono font-extrabold text-indigo-700 bg-indigo-50/70 px-2 py-1 rounded border border-indigo-100">
                            {net.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-bold text-slate-800">
                  <tr>
                    <td className="py-3 px-3">TOPLAM</td>
                    <td className="py-3 px-2 text-center font-mono text-slate-500">
                      {relevantSubjects.reduce((acc, s) => acc + s.maxQuestions, 0)}
                    </td>
                    <td className="py-3 px-2 text-center text-emerald-700 font-mono">
                      {calculatedStats.totalCorrect}
                    </td>
                    <td className="py-3 px-2 text-center text-rose-700 font-mono">
                      {calculatedStats.totalWrong}
                    </td>
                    <td className="py-3 px-2 text-center text-slate-500 font-mono">
                      {calculatedStats.totalEmpty}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-indigo-700 text-sm font-extrabold">
                      {calculatedStats.totalNet}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Notes field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Deneme Notları / Değerlendirme</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Örn: Matematikte süre yetmedi, Türkçe paragrafta odaklanma iyiydi..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:border-indigo-600 outline-none"
            />
          </div>

        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Formül: <span className="font-mono font-semibold text-slate-700">Net = Doğru - (Yanlış / 4)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/80 rounded-xl transition"
            >
              Vazgeç
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-md shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-70"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Denemeyi Kaydet</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
