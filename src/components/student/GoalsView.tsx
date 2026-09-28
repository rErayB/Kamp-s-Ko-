import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateUserProfile } from '../../services/authService';
import { Target, Award, Sparkles, Check, ArrowRight } from 'lucide-react';

export const GoalsView: React.FC = () => {
  const { currentUser, refreshProfile } = useAuth();

  const [targetUniversity, setTargetUniversity] = useState(currentUser?.targetUniversity || 'Boğaziçi Üniversitesi');
  const [targetDepartment, setTargetDepartment] = useState(currentUser?.targetDepartment || 'Bilgisayar Mühendisliği');
  const [targetScore, setTargetScore] = useState(currentUser?.targetScore || 490);
  const [targetRank, setTargetRank] = useState(currentUser?.targetRank || 3500);
  const [dailyQuestionGoal, setDailyQuestionGoal] = useState(currentUser?.dailyQuestionGoal || 150);
  const [weeklyStudyGoalHours, setWeeklyStudyGoalHours] = useState(currentUser?.weeklyStudyGoalHours || 35);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSaving(true);
    setSuccess(false);

    try {
      await updateUserProfile(currentUser.uid, {
        targetUniversity,
        targetDepartment,
        targetScore: Number(targetScore),
        targetRank: Number(targetRank),
        dailyQuestionGoal: Number(dailyQuestionGoal),
        weeklyStudyGoalHours: Number(weeklyStudyGoalHours)
      });
      await refreshProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">YKS Hedef ve Planlama Merkezi</h2>
            <p className="text-xs text-slate-500">Hayalinizdeki üniversite ve bölüme göre hedeflerinizi belirleyin.</p>
          </div>
        </div>

        {success && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2 border border-emerald-200">
            <Check className="w-4 h-4" />
            <span>Hedefleriniz başarıyla güncellendi!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Hedef Üniversite *</label>
              <input
                type="text"
                required
                value={targetUniversity}
                onChange={e => setTargetUniversity(e.target.value)}
                className="w-full p-2.5 border rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Hedef Bölüm *</label>
              <input
                type="text"
                required
                value={targetDepartment}
                onChange={e => setTargetDepartment(e.target.value)}
                className="w-full p-2.5 border rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Hedef Sıralama (#)</label>
              <input
                type="number"
                value={targetRank}
                onChange={e => setTargetRank(Number(e.target.value))}
                className="w-full p-2.5 border rounded-xl text-sm font-mono"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Hedef YKS Puanı</label>
              <input
                type="number"
                value={targetScore}
                onChange={e => setTargetScore(Number(e.target.value))}
                className="w-full p-2.5 border rounded-xl text-sm font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Günlük Soru Hedefi</label>
              <input
                type="number"
                value={dailyQuestionGoal}
                onChange={e => setDailyQuestionGoal(Number(e.target.value))}
                className="w-full p-2.5 border rounded-xl text-sm font-mono bg-white"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Dashboard ilerleme çubuğunda kullanılır.</span>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Haftalık Çalışma Saati Hedefi</label>
              <input
                type="number"
                value={weeklyStudyGoalHours}
                onChange={e => setWeeklyStudyGoalHours(Number(e.target.value))}
                className="w-full p-2.5 border rounded-xl text-sm font-mono bg-white"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Koçunuz haftalık takibinizi buna göre yapar.</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-60"
            >
              {saving ? 'Kaydediliyor...' : 'Hedefleri Güncelle'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
