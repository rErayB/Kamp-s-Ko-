import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ExamResult, FieldType } from '../../types';
import { getStudentExams, deleteExam } from '../../services/examService';
import { AddExamModal } from './AddExamModal';
import { SimpleLineChart, HorizontalBarChart } from '../common/SvgCharts';
import {
  FileSpreadsheet,
  Plus,
  Trash2,
  Calendar,
  Filter,
  TrendingUp,
  BarChart3,
  Layers,
  Award
} from 'lucide-react';

interface ExamAnalysisViewProps {
  overrideStudentId?: string;
  overrideStudentField?: FieldType;
  overrideStudentName?: string;
}

export const ExamAnalysisView: React.FC<ExamAnalysisViewProps> = ({
  overrideStudentId,
  overrideStudentField,
  overrideStudentName
}) => {
  const { currentUser } = useAuth();

  const studentId = overrideStudentId || currentUser?.uid || '';
  const studentField = overrideStudentField || currentUser?.field || 'Sayısal';
  const studentName = overrideStudentName || currentUser?.name || 'Öğrenci';

  const [exams, setExams] = useState<ExamResult[]>([]);
  const [filterCount, setFilterCount] = useState<'5' | '10' | 'all'>('10');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadExams = async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const count = filterCount === '5' ? 5 : filterCount === '10' ? 10 : undefined;
      const list = await getStudentExams(studentId, count);
      setExams(list);
    } catch (e) {
      console.error('Error fetching exams:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExams();
  }, [studentId, filterCount]);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (examId: string) => {
    try {
      await deleteExam(examId);
      setDeletingId(null);
      loadExams();
    } catch (e) {
      console.error('Error deleting exam:', e);
    }
  };

  // Prepare line chart for total net
  const reversedExams = [...exams].reverse();
  const totalNetChartData = reversedExams.map(ex => ({
    label: ex.examDate ? ex.examDate.substring(5) : 'Deneme',
    value: ex.totalNet
  }));

  // Calculate average nets by subjects
  const subjectAverages: Record<string, { totalNet: number; count: number; max: number }> = {};
  exams.forEach(ex => {
    Object.entries(ex.scores || {}).forEach(([key, s]) => {
      if (!subjectAverages[s.name]) {
        subjectAverages[s.name] = { totalNet: 0, count: 0, max: s.maxQuestions };
      }
      subjectAverages[s.name].totalNet += s.net;
      subjectAverages[s.name].count += 1;
    });
  });

  const subjectBarData = Object.entries(subjectAverages).map(([name, data]) => ({
    label: name,
    value: +(data.totalNet / data.count).toFixed(1),
    max: data.max,
    color: '#4f46e5'
  }));

  return (
    <div className="space-y-6">
      
      {/* Top Bar Actions & Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Deneme Analizi ve Sonuçları
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {studentName} • <span className="font-semibold text-indigo-600">{studentField}</span> Alanı TYT / AYT Gelişimi
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Filter Pills */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600 border border-slate-200">
            <button
              onClick={() => setFilterCount('5')}
              className={`px-3 py-1.5 rounded-lg transition ${filterCount === '5' ? 'bg-white text-indigo-700 shadow-sm' : 'hover:text-slate-900'}`}
            >
              Son 5
            </button>
            <button
              onClick={() => setFilterCount('10')}
              className={`px-3 py-1.5 rounded-lg transition ${filterCount === '10' ? 'bg-white text-indigo-700 shadow-sm' : 'hover:text-slate-900'}`}
            >
              Son 10
            </button>
            <button
              onClick={() => setFilterCount('all')}
              className={`px-3 py-1.5 rounded-lg transition ${filterCount === 'all' ? 'bg-white text-indigo-700 shadow-sm' : 'hover:text-slate-900'}`}
            >
              Tüm Denemeler
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Deneme Ekle</span>
          </button>
        </div>
      </div>

      {/* Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Total Net Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Net İlerleme Grafiği</h3>
              <p className="text-xs text-slate-500">Seçilen denemeler boyunca toplam net eğrisi</p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded bg-indigo-50 text-indigo-700">
              {exams.length} Deneme Kaydı
            </span>
          </div>

          {exams.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <FileSpreadsheet className="w-8 h-8 text-slate-300 mb-1" />
              <p className="text-xs font-medium">Henüz deneme verisi bulunmuyor.</p>
            </div>
          ) : (
            <SimpleLineChart data={totalNetChartData} color="#4f46e5" unit="Net" height={190} />
          )}
        </div>

        {/* Subject Average Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 text-base mb-1">Ders Ortalama Netleri</h3>
          <p className="text-xs text-slate-500 mb-4">{studentField} müfredatına göre başarı</p>

          {subjectBarData.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">Veri bekleniyor...</p>
          ) : (
            <div className="max-h-60 overflow-y-auto pr-1">
              <HorizontalBarChart data={subjectBarData} />
            </div>
          )}
        </div>

      </div>

      {/* Detailed Exams Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">Geçmiş Deneme Listesi</h3>
          <span className="text-xs text-slate-500 font-medium">
            Formül: Net = Doğru - (Yanlış / 4)
          </span>
        </div>

        {exams.length === 0 ? (
          <div className="p-12 text-center">
            <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">Henüz deneme eklenmemiş.</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              TYT veya alanınıza uygun AYT denemenizi ekleyerek gelişiminizi ve net grafiğinizi oluşturun.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              + İlk Denemeni Ekle
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Tarih</th>
                  <th className="py-3 px-4">Deneme Adı</th>
                  <th className="py-3 px-3 text-center">Tür</th>
                  <th className="py-3 px-4">Ders Detayları (Netler)</th>
                  <th className="py-3 px-4 text-right">Toplam Net</th>
                  <th className="py-3 px-3 text-center">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {exams.map((ex) => (
                  <tr key={ex.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {ex.examDate}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div>{ex.examName}</div>
                      {ex.notes && <div className="text-[11px] font-normal text-slate-400 mt-0.5">{ex.notes}</div>}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="font-semibold px-2 py-0.5 rounded-full text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {ex.examType}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1.5 max-w-md">
                        {Object.values(ex.scores || {}).map((s, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium"
                          >
                            <span>{s.name}:</span>
                            <span className="font-mono font-bold text-indigo-700">{s.net.toFixed(1)}</span>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-extrabold text-sm text-indigo-700">
                      {ex.totalNet.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {deletingId === ex.id ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleDelete(ex.id)}
                            className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold hover:bg-rose-700"
                          >
                            Evet, Sil
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
                          onClick={() => setDeletingId(ex.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Denemeyi Sil"
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

      <AddExamModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onExamAdded={loadExams}
        overrideStudent={overrideStudentId ? {
          id: overrideStudentId,
          name: studentName,
          field: studentField,
          organizationId: currentUser?.organizationId || ''
        } : undefined}
      />

    </div>
  );
};
