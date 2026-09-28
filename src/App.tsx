import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { LandingPage } from './components/landing/LandingPage';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { StudentDashboard } from './components/student/StudentDashboard';
import { StudyProgramsView } from './components/student/StudyProgramsView';
import { DailyStudyRecordsView } from './components/student/DailyStudyRecordsView';
import { ExamAnalysisView } from './components/student/ExamAnalysisView';
import { GoalsView } from './components/student/GoalsView';
import { MissingTopicsView } from './components/student/MissingTopicsView';
import { AIStudyAdvisor } from './components/ai/AIStudyAdvisor';
import { CoachDashboard } from './components/coach/CoachDashboard';
import { OrgAdminDashboard } from './components/admin/OrgAdminDashboard';
import { SuperAdminDashboard } from './components/superadmin/SuperAdminDashboard';
import { ShieldAlert, Sparkles, Building2, CheckCircle2, ChevronRight, X, LayoutDashboard, Calendar, FileSpreadsheet, Clock, Target } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentUser, loading, currentOrg, verifiedOrg, setDemoUser } = useAuth();
  
  // Navigation & Page State
  const [authView, setAuthView] = useState<'none' | 'login' | 'register'>('none');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [showScenarioDrawer, setShowScenarioDrawer] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
        <h2 className="text-base font-bold text-slate-800">Kampüs Koç Yükleniyor...</h2>
        <p className="text-xs text-slate-500 mt-1">Multi-tenant veritabanı senkronize ediliyor</p>
      </div>
    );
  }

  // Not logged in: Show Landing / Login / Register
  if (!currentUser) {
    if (authView === 'login') {
      return (
        <LoginForm
          onBackToLanding={() => setAuthView('none')}
          onSwitchToRegister={() => setAuthView('register')}
        />
      );
    }

    if (authView === 'register') {
      return (
        <RegisterForm
          onBackToLanding={() => setAuthView('none')}
          onSwitchToLogin={() => setAuthView('login')}
        />
      );
    }

    return (
      <LandingPage
        onProceedToAuth={(mode) => setAuthView(mode)}
        onOpenSuperAdminModal={() => setDemoUser('super_admin')}
      />
    );
  }

  // Logged In: Render Role Specific Dashboards
  const role = currentUser.role;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      
      {/* Top Application Header */}
      <Header />

      {/* Main Workspace with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar currentTab={currentTab} onSelectTab={(tab) => setCurrentTab(tab)} />
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-24 md:pb-8">
          
          {/* Quick Scenario Helper Banner (Senaryo 1-10 testing reminder) */}
          <div className="mb-6 p-3 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200/80 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded">
                Senaryo Test Aracı
              </span>
              <span className="text-slate-600 hidden sm:inline">
                Aktif Rol: <strong className="text-slate-900">{role.toUpperCase()}</strong> •
                Kurum: <strong className="text-slate-900">{currentOrg?.name || 'Tüm Kurumlar'}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowScenarioDrawer(!showScenarioDrawer)}
                className="px-2.5 py-1 bg-white hover:bg-slate-50 text-indigo-700 font-bold rounded-lg border border-indigo-200 shadow-xs transition"
              >
                10 Senaryoyu Gör {showScenarioDrawer ? '▲' : '▼'}
              </button>
            </div>
          </div>

          {/* Scenario Helper Drawer */}
          {showScenarioDrawer && (
            <div className="mb-6 p-4 bg-white rounded-2xl border border-slate-200 shadow-md text-xs space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-800">Senaryo Kontrol Listesi (Senaryo 1 - 10)</span>
                <button onClick={() => setShowScenarioDrawer(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-600">
                <div className="p-2 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span><strong>Senaryo 1-2:</strong> Super Admin yeni kurum & DDKUTAHYA kodu</span>
                  <button onClick={() => setDemoUser('super_admin')} className="font-bold text-purple-600 hover:underline">Test Et →</button>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span><strong>Senaryo 3-5:</strong> DDKUTAHYA ile öğrenci kuruma bağlanır</span>
                  <button onClick={() => setDemoUser('student', 'DDKUTAHYA', 'Sayısal')} className="font-bold text-indigo-600 hover:underline">Test Et →</button>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span><strong>Senaryo 6-7:</strong> Sayısal AYT denemesi (Mat, Fiz, Kim, Biyo)</span>
                  <button onClick={() => { setDemoUser('student', 'DDKUTAHYA', 'Sayısal'); setCurrentTab('exams'); }} className="font-bold text-indigo-600 hover:underline">Test Et →</button>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span><strong>Senaryo 8:</strong> Koç girişi (Sadece kendi öğrencileri)</span>
                  <button onClick={() => setDemoUser('coach', 'DDKUTAHYA')} className="font-bold text-emerald-600 hover:underline">Test Et →</button>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span><strong>Senaryo 9:</strong> Kurum yöneticisi (Sadece kendi kurumu)</span>
                  <button onClick={() => setDemoUser('org_admin', 'DDKUTAHYA')} className="font-bold text-blue-600 hover:underline">Test Et →</button>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span><strong>Senaryo 10:</strong> Kurum izolasyonu (ABC Ankara alanı)</span>
                  <button onClick={() => setDemoUser('org_admin', 'ABCANKARA')} className="font-bold text-rose-600 hover:underline">İzolasyon Testi →</button>
                </div>
              </div>
            </div>
          )}

          {/* Role-Specific View Router */}
          {role === 'super_admin' && (
            <SuperAdminDashboard />
          )}

          {role === 'org_admin' && (
            <OrgAdminDashboard />
          )}

          {role === 'coach' && (
            <CoachDashboard />
          )}

          {role === 'student' && (
            <div>
              {currentTab === 'dashboard' && (
                <StudentDashboard onNavigateTab={(tab) => setCurrentTab(tab)} />
              )}
              {currentTab === 'programs' && (
                <StudyProgramsView />
              )}
              {currentTab === 'studies' && (
                <DailyStudyRecordsView />
              )}
              {currentTab === 'exams' && (
                <ExamAnalysisView />
              )}
              {currentTab === 'goals' && (
                <GoalsView />
              )}
              {currentTab === 'missing-topics' && (
                <MissingTopicsView />
              )}
              {currentTab === 'ai-advisor' && (
                <AIStudyAdvisor />
              )}
            </div>
          )}

        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 py-1.5 px-2 flex justify-around items-center z-40 shadow-lg">
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
            currentTab === 'dashboard' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Ana Sayfa</span>
        </button>

        {role === 'student' && (
          <>
            <button
              onClick={() => setCurrentTab('programs')}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
                currentTab === 'programs' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Calendar className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Program</span>
            </button>
            <button
              onClick={() => setCurrentTab('exams')}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
                currentTab === 'exams' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Denemeler</span>
            </button>
            <button
              onClick={() => setCurrentTab('studies')}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
                currentTab === 'studies' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Clock className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Çalışmalar</span>
            </button>
            <button
              onClick={() => setCurrentTab('goals')}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
                currentTab === 'goals' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Target className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Hedefler</span>
            </button>
          </>
        )}
      </div>

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
