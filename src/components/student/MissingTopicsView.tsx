import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MissingTopicItem } from '../../types';
import { getStudentMissingTopics, addMissingTopic, toggleMissingTopicResolved, deleteMissingTopic } from '../../services/missingTopicService';
import { AlertTriangle, Plus, CheckCircle, Trash2 } from 'lucide-react';

export const MissingTopicsView: React.FC = () => {
  const { currentUser } = useAuth();
  const [topics, setTopics] = useState<MissingTopicItem[]>([]);
  const [subject, setSubject] = useState('Matematik');
  const [topicName, setTopicName] = useState('');
  const [urgency, setUrgency] = useState<'high' | 'medium' | 'low'>('high');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const list = await getStudentMissingTopics(currentUser.uid);
      setTopics(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser?.uid]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !topicName.trim()) return;

    try {
      await addMissingTopic({
        organizationId: currentUser.organizationId || '',
        studentId: currentUser.uid,
        subject,
        topic: topicName.trim(),
        urgency,
        notes,
        addedBy: 'student'
      });
      setTopicName('');
      setNotes('');
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggle = async (t: MissingTopicItem) => {
    await toggleMissingTopicResolved(t.id, !t.isResolved);
    loadData();
  };

  const handleDelete = async (id: string) => {
    await deleteMissingTopic(id);
    loadData();
  };

  return (
    <div className="space-y-6">
      
      {/* Add New Missing Topic Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-base text-slate-900 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <span>Eksik Konu Bildir & Takip Et</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Denemelerde ve soru çözümlerinde takıldığınız konuları ekleyin, koçunuzla birlikte planlayarak tamamlayın.
        </p>

        <form onSubmit={handleAdd} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold block mb-1">Ders *</label>
              <input
                type="text"
                required
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Örn: Fizik, Matematik..."
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">Konu Adı *</label>
              <input
                type="text"
                required
                value={topicName}
                onChange={e => setTopicName(e.target.value)}
                placeholder="Örn: Elektrostatik, Fonksiyonlar"
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">Öncelik Seviyesi</label>
              <select
                value={urgency}
                onChange={e => setUrgency(e.target.value as any)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="high">🔴 Yüksek Öncelik (Acil Tekrar)</option>
                <option value="medium">🟠 Orta Öncelik (Soru Çözümü Lazım)</option>
                <option value="low">🟡 Düşük Öncelik (Pekiştirme)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ek notlar (örn: Formülleri unuttum, çıkmış sorular çözülecek)"
              className="flex-1 p-2 border rounded-lg text-xs"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition"
            >
              + Listeye Ekle
            </button>
          </div>
        </form>
      </div>

      {/* Topics List */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="font-bold text-base text-slate-900 mb-2">Kayıtlı Eksik Konularım ({topics.length})</h3>

        {topics.length === 0 ? (
          <p className="text-xs text-slate-400 py-8 text-center">Henüz eksik konu kaydı bulunmuyor.</p>
        ) : (
          <div className="space-y-2">
            {topics.map(t => (
              <div
                key={t.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 transition ${
                  t.isResolved ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-200 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">
                    {t.urgency === 'high' ? '🔴' : t.urgency === 'medium' ? '🟠' : '🟡'}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{t.topic}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">{t.subject}</span>
                    </div>
                    {t.notes && <p className="text-xs text-slate-500 mt-0.5">{t.notes}</p>}
                    <p className="text-[10px] text-slate-400 mt-0.5">Ekleyen: {t.addedBy === 'coach' ? 'Koç' : 'Ben'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      t.isResolved ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    {t.isResolved ? 'Tamamlandı ✓' : 'Çözüldü Olarak İşaretle'}
                  </button>
                  <button onClick={() => handleDelete(t.id)} className="p-1.5 text-slate-400 hover:text-rose-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
