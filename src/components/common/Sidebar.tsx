import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import {
  Home,
  Calendar,
  Clock,
  FileSpreadsheet,
  BarChart3,
  Target,
  AlertTriangle,
  Sparkles,
  Users,
  GraduationCap,
  Layers,
  Megaphone,
  Building2,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { currentUser } = useAuth();
  const role: UserRole = currentUser?.role || 'student';

  const getNavItems = () => {
    if (role === 'super_admin') {
      return [
        { id: 'dashboard', label: 'Tüm Kurumlar', icon: Building2 },
        { id: 'analytics', label: 'Platform İstatistikleri', icon: BarChart3 }
      ];
    }

    if (role === 'org_admin') {
      return [
        { id: 'dashboard', label: 'Kurum Özeti', icon: Home },
        { id: 'students', label: 'Öğrenci Yönetimi', icon: GraduationCap },
        { id: 'coaches', label: 'Koç ve Öğretmenler', icon: Users },
        { id: 'classes', label: 'Sınıflar & Şubeler', icon: Layers },
        { id: 'reports', label: 'Kurum Raporları', icon: BarChart3 },
        { id: 'announcements', label: 'Duyurular', icon: Megaphone }
      ];
    }

    if (role === 'coach') {
      return [
        { id: 'dashboard', label: 'Koç Dashboard', icon: Home },
        { id: 'students', label: 'Öğrencilerim', icon: GraduationCap },
        { id: 'programs', label: 'Haftalık Programlar', icon: Calendar },
        { id: 'exams', label: 'Deneme Takibi', icon: FileSpreadsheet },
        { id: 'announcements', label: 'Duyurular', icon: Megaphone }
      ];
    }

    // Default: Student
    return [
      { id: 'dashboard', label: 'Ana Sayfa', icon: Home },
      { id: 'programs', label: 'Programım', icon: Calendar },
      { id: 'studies', label: 'Çalışmalarım', icon: Clock },
      { id: 'exams', label: 'Denemelerim & Netler', icon: FileSpreadsheet },
      { id: 'goals', label: 'Hedeflerim', icon: Target },
      { id: 'missing-topics', label: 'Eksik Konular', icon: AlertTriangle },
      { id: 'ai-advisor', label: 'AI Koç Analizi', icon: Sparkles }
    ];
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 p-4 flex flex-col justify-between shrink-0 min-h-[calc(100vh-61px)]">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
          Menü
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom Info Widget */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
        <div className="flex items-center gap-2 text-indigo-700 font-bold mb-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span className="text-[11px]">Kampüs Koç Bulut</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-tight">
          Veriler anlık olarak Firestore bulut veritabanında saklanır.
        </p>
      </div>
    </aside>
  );
};
