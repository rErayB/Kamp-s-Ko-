import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole, FieldType } from '../../types';
import {
  GraduationCap,
  Building2,
  User,
  LogOut,
  Bell,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface HeaderProps {
  onOpenNotifications?: () => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNotifications, unreadCount = 0 }) => {
  const { currentUser, currentOrg, verifiedOrg, logout, setDemoUser } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getRoleLabel = (role?: UserRole) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'org_admin': return 'Kurum Yöneticisi';
      case 'coach': return 'YKS Koçu / Öğretmen';
      case 'student': return 'Öğrenci';
      default: return 'Misafir';
    }
  };

  const getRoleBadgeStyle = (role?: UserRole) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'org_admin': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'coach': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'student': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const orgName = currentOrg?.name || verifiedOrg?.name;
  const orgCode = currentOrg?.code || verifiedOrg?.code;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200/80 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand & Organization Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                Kampüs<span className="text-indigo-600">Koç</span>
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                YKS v2.4
              </span>
            </div>
            
            {/* Active Institution Badge */}
            {currentUser?.role === 'super_admin' ? (
              <div className="flex items-center gap-1.5 text-xs text-purple-700 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                <span>Super Admin Paneli • Tüm Kurumlar</span>
              </div>
            ) : orgName ? (
              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium truncate max-w-xs sm:max-w-md">
                <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="truncate">{orgName}</span>
                {orgCode && (
                  <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-700 px-1 rounded border border-slate-200">
                    {orgCode}
                  </span>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500">Kurumsal YKS Yönetim Ekosistemi</p>
            )}
          </div>
        </div>

        {/* Right Section Actions & User */}
        <div className="flex items-center gap-3">
          
          {/* Quick Scenario & Role Switcher (Helps easily test Senaryo 1-10) */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 text-slate-800 transition-colors border border-slate-200"
              title="Rol Değiştirici ile tüm senaryoları anında test edin"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Hızlı Rol Değiştir</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 text-left animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">Senaryo & Rol Test Aracı</p>
                  <p className="text-[11px] text-slate-500">Farklı kullanıcı ve kurum rollerini anında deneyin:</p>
                </div>
                
                <div className="py-1 space-y-1">
                  <button
                    onClick={() => { setDemoUser('super_admin'); setShowRoleMenu(false); }}
                    className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-purple-50 text-slate-700 hover:text-purple-900 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold">Super Admin</div>
                      <div className="text-[10px] text-slate-500">Tüm kurumları yönet (Senaryo 1-2)</div>
                    </div>
                    {currentUser?.role === 'super_admin' && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
                  </button>

                  <button
                    onClick={() => { setDemoUser('org_admin', 'DDKUTAHYA'); setShowRoleMenu(false); }}
                    className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-blue-50 text-slate-700 hover:text-blue-900 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold">Kurum Yöneticisi</div>
                      <div className="text-[10px] text-slate-500">D&D Kütahya (Senaryo 9)</div>
                    </div>
                    {currentUser?.role === 'org_admin' && currentOrg?.code === 'DDKUTAHYA' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                  </button>

                  <button
                    onClick={() => { setDemoUser('coach', 'DDKUTAHYA'); setShowRoleMenu(false); }}
                    className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold">YKS Koçu (Ali Yılmaz)</div>
                      <div className="text-[10px] text-slate-500">Sadece atanan öğrencileri gör (Senaryo 8)</div>
                    </div>
                    {currentUser?.role === 'coach' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </button>

                  <button
                    onClick={() => { setDemoUser('student', 'DDKUTAHYA', 'Sayısal'); setShowRoleMenu(false); }}
                    className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-amber-50 text-slate-700 hover:text-amber-900 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold">Öğrenci (Sayısal)</div>
                      <div className="text-[10px] text-slate-500">Ahmet Demir - Sayısal AYT (Senaryo 6-7)</div>
                    </div>
                    {currentUser?.role === 'student' && currentUser.field === 'Sayısal' && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
                  </button>

                  <button
                    onClick={() => { setDemoUser('student', 'DDKUTAHYA', 'Eşit Ağırlık'); setShowRoleMenu(false); }}
                    className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-amber-50 text-slate-700 hover:text-amber-900 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold">Öğrenci (Eşit Ağırlık)</div>
                      <div className="text-[10px] text-slate-500">Dinamik Edebiyat/Tarih AYT</div>
                    </div>
                    {currentUser?.role === 'student' && currentUser.field === 'Eşit Ağırlık' && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
                  </button>

                  <div className="border-t border-slate-100 my-1"></div>

                  <button
                    onClick={() => { setDemoUser('org_admin', 'ABCANKARA'); setShowRoleMenu(false); }}
                    className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-red-50 text-slate-700 hover:text-red-900 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold">Farklı Kurum: ABC Ankara</div>
                      <div className="text-[10px] text-slate-500">İzolasyon Testi (Senaryo 10)</div>
                    </div>
                    {currentOrg?.code === 'ABCANKARA' && <CheckCircle2 className="w-4 h-4 text-red-600" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Menu */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden md:block text-left text-xs">
                  <div className="font-semibold text-slate-800 leading-tight">{currentUser.name}</div>
                  <div className={`inline-block text-[10px] font-medium px-1.5 py-0.2 rounded border ${getRoleBadgeStyle(currentUser.role)}`}>
                    {getRoleLabel(currentUser.role)}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in duration-100">
                  <div className="p-3 border-b border-slate-100">
                    <p className="font-semibold text-sm text-slate-900">{currentUser.name}</p>
                    <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                    {currentUser.field && (
                      <span className="inline-block mt-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        Alan: {currentUser.field} {currentUser.className ? `• ${currentUser.className}` : ''}
                      </span>
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={async () => {
                        setShowUserMenu(false);
                        await logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Çıkış Yap
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDemoUser('student', 'DDKUTAHYA', 'Sayısal')}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm"
              >
                Hızlı Deneme
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};
