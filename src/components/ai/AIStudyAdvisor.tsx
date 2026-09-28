import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Brain, Lightbulb, CheckCircle, ArrowRight, Zap, Target } from 'lucide-react';

export const AIStudyAdvisor: React.FC = () => {
  const { currentUser } = useAuth();
  const [analyzing, setAnalyzing] = useState(false);
  const [completedAnalysis, setCompletedAnalysis] = useState(true);

  const studentField = currentUser?.field || 'Sayısal';

  const handleRunAnalysis = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setCompletedAnalysis(true);
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* AI Header Card */}
      <div className="bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-400/30 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>YKS Yapay Zeka Koçluk Motoru</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">
              Akıllı Gelişim ve Net Artırma Önerileri
            </h2>
            <p className="text-violet-200 text-xs sm:text-sm mt-1 max-w-xl">
              Deneme geçmişiniz, eksik konu analiziniz ve günlük soru çözümleriniz taranarak haftalık kişisel odak haritanız çıkarıldı.
            </p>
          </div>

          <button
            onClick={handleRunAnalysis}
            disabled={analyzing}
            className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition shadow-lg shadow-violet-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {analyzing ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Yeniden Analiz Et</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Recommendations Feed */}
      {completedAnalysis && (
        <div className="space-y-4">
          
          {/* Card 1: Primary Weak Point */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 mt-1">
              <Target className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                  En Kritik Net Kaybı
                </span>
                <span className="text-xs text-slate-400 font-medium">AYT {studentField === 'Sayısal' ? 'Matematik & Fizik' : 'Edebiyat & Tarih'}</span>
              </div>
              <h3 className="font-bold text-base text-slate-900 mt-1">
                {studentField === 'Sayısal'
                  ? 'Türev - İntegral ve Dalga Mekaniğinde Net Dalgalanması'
                  : 'Divan Şiiri ve Cumhuriyet Dönemi Edebiyatında Yanlış Oranı'}
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Son 3 denemenizdeki yanlış analizi, özellikle formül uygulama ve soru kökü dikkat hatalarına işaret ediyor.
                Haftalık soru çözümünüzde bu iki konuya günlük minimum 40 soru eklemeniz, netinizi doğrudan 4-6 puan artırabilir.
              </p>
            </div>
          </div>

          {/* Card 2: Strategic Recommendation */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-1">
              <Brain className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                  Süre Yönetimi Tavsiyesi
                </span>
                <span className="text-xs text-slate-400 font-medium">TYT Genel</span>
              </div>
              <h3 className="font-bold text-base text-slate-900 mt-1">
                Türkçe Paragraf Hızınızı 35 Dakikanın Altına İndirin
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Süre kayıtlarınıza göre TYT Türkçe testinde ortalama 44 dakika harcıyorsunuz.
                Her sabah ilk ders olarak kronometreyle 25 paragraf sorusu çözmek, AYT ve Matematik testine fazladan 10 dakika kazandıracaktır.
              </p>
            </div>
          </div>

          {/* Card 3: Strength */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-1">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Güçlü Alanınız
                </span>
                <span className="text-xs text-slate-400 font-medium">%92 Doğruluk Oranı</span>
              </div>
              <h3 className="font-bold text-base text-slate-900 mt-1">
                {studentField === 'Sayısal' ? 'TYT Kimya ve Biyoloji' : 'TYT Sosyal Bilimler'} İstikrarı Harika
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Bu alandaki doğruluğunuz yüksek seviyede korunuyor. Bilgi unutulmaması için haftada 1 genel tekrar testi çözmeniz yeterlidir.
              </p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
