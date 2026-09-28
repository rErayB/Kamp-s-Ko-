import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../config/firebase';
import {
  UserProfile,
  Organization,
  UserRole,
  FieldType
} from '../types';
import {
  getUserProfile,
  signInUser,
  signOutUser,
  signUpStudent,
  StudentSignUpParams,
  updateUserProfile
} from '../services/authService';
import {
  getOrgByCode,
  getOrgById,
  seedInitialOrgsIfEmpty,
  normalizeOrgCode
} from '../services/orgService';

interface AuthContextType {
  currentUser: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  currentOrg: Organization | null;
  verifiedOrg: Organization | null;
  loading: boolean;
  verifyOrgCode: (code: string) => Promise<Organization>;
  clearVerifiedOrg: () => void;
  login: (email: string, pass: string) => Promise<UserProfile>;
  registerStudent: (params: StudentSignUpParams) => Promise<UserProfile>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setDemoUser: (role: UserRole, orgCode?: string, studentField?: FieldType) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_VERIFIED_ORG_KEY = 'kampus_koc_verified_org_id';
const STORAGE_DEMO_USER_KEY = 'kampus_koc_demo_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [verifiedOrg, setVerifiedOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize demo data and check saved state
  useEffect(() => {
    async function init() {
      try {
        await seedInitialOrgsIfEmpty();

        // Check if verified org was stored
        const savedOrgId = localStorage.getItem(STORAGE_VERIFIED_ORG_KEY);
        if (savedOrgId) {
          const org = await getOrgById(savedOrgId);
          if (org) {
            setVerifiedOrg(org);
          }
        }

        // Check if a demo session was active
        const savedDemo = localStorage.getItem(STORAGE_DEMO_USER_KEY);
        if (savedDemo) {
          const parsed = JSON.parse(savedDemo) as UserProfile;
          setCurrentUser(parsed);
          if (parsed.organizationId) {
            const org = await getOrgById(parsed.organizationId);
            setCurrentOrg(org);
          }
        }
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const profile = await getUserProfile(fbUser.uid);
          if (profile) {
            setCurrentUser(profile);
            localStorage.removeItem(STORAGE_DEMO_USER_KEY);
            if (profile.organizationId) {
              const org = await getOrgById(profile.organizationId);
              setCurrentOrg(org);
            } else {
              setCurrentOrg(null);
            }
          }
        } catch (e) {
          console.error('Error fetching user profile:', e);
        }
      } else {
        // If not in demo mode, clear user
        if (!localStorage.getItem(STORAGE_DEMO_USER_KEY)) {
          setCurrentUser(null);
          setCurrentOrg(null);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Verify Organization Code
  const verifyOrgCode = async (code: string): Promise<Organization> => {
    const normalized = normalizeOrgCode(code);
    if (!normalized) {
      throw new Error('Lütfen kurum kodunuzu girin.');
    }

    // Seed check first in case first user
    await seedInitialOrgsIfEmpty();

    const org = await getOrgByCode(normalized);
    if (!org) {
      throw new Error('Kurum bulunamadı. Lütfen kurum kodunuzu kontrol edin.');
    }

    if (!org.isActive) {
      throw new Error('Bu kurumun aboneliği veya erişimi şu an pasif durumdadır.');
    }

    setVerifiedOrg(org);
    localStorage.setItem(STORAGE_VERIFIED_ORG_KEY, org.id);
    return org;
  };

  const clearVerifiedOrg = () => {
    setVerifiedOrg(null);
    localStorage.removeItem(STORAGE_VERIFIED_ORG_KEY);
  };

  const login = async (email: string, pass: string): Promise<UserProfile> => {
    const profile = await signInUser(email, pass);
    setCurrentUser(profile);
    localStorage.removeItem(STORAGE_DEMO_USER_KEY);

    if (profile.organizationId) {
      const org = await getOrgById(profile.organizationId);
      setCurrentOrg(org);
      if (org) {
        setVerifiedOrg(org);
        localStorage.setItem(STORAGE_VERIFIED_ORG_KEY, org.id);
      }
    }
    return profile;
  };

  const registerStudent = async (params: StudentSignUpParams): Promise<UserProfile> => {
    const profile = await signUpStudent(params);
    setCurrentUser(profile);
    localStorage.removeItem(STORAGE_DEMO_USER_KEY);

    if (profile.organizationId) {
      const org = await getOrgById(profile.organizationId);
      setCurrentOrg(org);
    }
    return profile;
  };

  const logout = async () => {
    localStorage.removeItem(STORAGE_DEMO_USER_KEY);
    setCurrentUser(null);
    setCurrentOrg(null);
    try {
      await signOutUser();
    } catch (e) {
      console.warn('Signout warning:', e);
    }
  };

  const refreshProfile = async () => {
    if (currentUser?.uid) {
      const p = await getUserProfile(currentUser.uid);
      if (p) {
        setCurrentUser(p);
        if (p.organizationId) {
          const org = await getOrgById(p.organizationId);
          setCurrentOrg(org);
        }
      }
    }
  };

  /**
   * Fast Demo Profile Switcher
   * Allows instant testing of Senaryo 1-10 across all 4 roles and multiple organizations
   */
  const setDemoUser = async (role: UserRole, orgCode = 'DDKUTAHYA', studentField: FieldType = 'Sayısal') => {
    await seedInitialOrgsIfEmpty();
    let org = await getOrgByCode(orgCode);
    if (!org) {
      org = await getOrgByCode('DDKUTAHYA');
    }

    let mockProfile: UserProfile;
    if (role === 'super_admin') {
      mockProfile = {
        uid: 'demo_super_admin',
        email: 'superadmin@kampuskoc.com',
        name: 'Sistem Yöneticisi (Super Admin)',
        role: 'super_admin',
        organizationId: null,
        phone: '0 (555) 000 00 01',
        isActive: true,
        createdAt: new Date().toISOString()
      };
      setCurrentOrg(null);
    } else if (role === 'org_admin') {
      mockProfile = {
        uid: `demo_org_admin_${org?.id || 'dd'}`,
        email: org?.managerEmail || 'yonetici@kurum.com',
        name: org ? `${org.managerName || 'Kurum Müdürü'}` : 'Mehmet Dinç (Kurum Yöneticisi)',
        role: 'org_admin',
        organizationId: org?.id || 'dd_org',
        phone: org?.phone || '0 (274) 224 00 11',
        isActive: true,
        createdAt: new Date().toISOString()
      };
      setCurrentOrg(org);
      setVerifiedOrg(org);
    } else if (role === 'coach') {
      mockProfile = {
        uid: `demo_coach_${org?.id || 'dd'}`,
        email: 'ali.yilmaz@kampuskoc.com',
        name: 'Ali Yılmaz (YKS Koçu)',
        role: 'coach',
        organizationId: org?.id || 'dd_org',
        phone: '0 (532) 111 22 33',
        title: 'Matematik & Geometri Zümre Başkanı / YKS Baş Koçu',
        assignedStudentIds: ['demo_student_sayisal', 'demo_student_ea'],
        isActive: true,
        createdAt: new Date().toISOString()
      };
      setCurrentOrg(org);
      setVerifiedOrg(org);
    } else {
      // Student
      mockProfile = {
        uid: `demo_student_${studentField.toLowerCase().replace(/\s+/g, '_')}`,
        email: 'ahmet.demir@ogrenci.com',
        name: 'Ahmet Demir',
        role: 'student',
        organizationId: org?.id || 'dd_org',
        phone: '0 (544) 333 44 55',
        isActive: true,
        grade: '12',
        field: studentField,
        targetUniversity: studentField === 'Sayısal' ? 'ODTÜ' : studentField === 'Eşit Ağırlık' ? 'Boğaziçi Üniversitesi' : studentField === 'Sözel' ? 'İstanbul Üniversitesi' : 'Bilkent Üniversitesi',
        targetDepartment: studentField === 'Sayısal' ? 'Bilgisayar Mühendisliği' : studentField === 'Eşit Ağırlık' ? 'Hukuk Fakültesi' : studentField === 'Sözel' ? 'Halkla İlişkiler ve Tanıtım' : 'İngiliz Dili ve Edebiyatı',
        targetScore: 492,
        targetRank: 3200,
        dailyQuestionGoal: 180,
        weeklyStudyGoalHours: 42,
        coachId: `demo_coach_${org?.id || 'dd'}`,
        coachName: 'Ali Yılmaz (YKS Koçu)',
        classId: 'class_12a',
        className: studentField === 'Sayısal' ? '12-A Sayısal' : studentField === 'Eşit Ağırlık' ? '12-C Eşit Ağırlık' : '12-D Sözel',
        createdAt: new Date().toISOString()
      };
      setCurrentOrg(org);
      setVerifiedOrg(org);
    }

    setCurrentUser(mockProfile);
    localStorage.setItem(STORAGE_DEMO_USER_KEY, JSON.stringify(mockProfile));
    if (org) {
      localStorage.setItem(STORAGE_VERIFIED_ORG_KEY, org.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        currentOrg,
        verifiedOrg,
        loading,
        verifyOrgCode,
        clearVerifiedOrg,
        login,
        registerStudent,
        logout,
        refreshProfile,
        setDemoUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
