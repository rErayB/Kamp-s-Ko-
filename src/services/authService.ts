import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  User as FirebaseUser
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { UserProfile, UserRole, FieldType, GradeType } from '../types';

const USERS_COLLECTION = 'users';

export interface StudentSignUpParams {
  email: string;
  password: string;
  name: string;
  phone?: string;
  organizationId: string;
  grade: GradeType;
  field: FieldType;
  targetUniversity?: string;
  targetDepartment?: string;
  targetScore?: number;
  targetRank?: number;
  dailyQuestionGoal?: number;
  weeklyStudyGoalHours?: number;
}

/**
 * Register a new student into a specific organization
 */
export async function signUpStudent(params: StudentSignUpParams): Promise<UserProfile> {
  const credential = await createUserWithEmailAndPassword(auth, params.email, params.password);
  const uid = credential.user.uid;

  const userProfile: UserProfile = {
    uid,
    email: params.email.toLowerCase().trim(),
    name: params.name.trim(),
    role: 'student',
    organizationId: params.organizationId,
    phone: params.phone || '',
    isActive: true,
    grade: params.grade,
    field: params.field,
    targetUniversity: params.targetUniversity || 'Boğaziçi Üniversitesi',
    targetDepartment: params.targetDepartment || 'Bilgisayar Mühendisliği',
    targetScore: params.targetScore || 480,
    targetRank: params.targetRank || 5000,
    dailyQuestionGoal: params.dailyQuestionGoal || 150,
    weeklyStudyGoalHours: params.weeklyStudyGoalHours || 35,
    createdAt: new Date().toISOString()
  };

  await setDoc(doc(db, USERS_COLLECTION, uid), {
    ...userProfile,
    createdAt: serverTimestamp()
  });

  return userProfile;
}

/**
 * Sign in existing user
 */
export async function signInUser(email: string, pass: string): Promise<UserProfile> {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
  const profile = await getUserProfile(cred.user.uid);
  if (!profile) {
    throw new Error('Kullanıcı profili bulunamadı.');
  }
  if (!profile.isActive) {
    await firebaseSignOut(auth);
    throw new Error('Hesabınız dondurulmuş veya pasif durumdadır. Lütfen kurum yöneticiniz ile iletişime geçin.');
  }
  return profile;
}

/**
 * Sign out
 */
export async function signOutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Fetch profile doc
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const snap = await getDoc(doc(db, USERS_COLLECTION, uid));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      uid: snap.id,
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString())
    } as UserProfile;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
  const ref = doc(db, USERS_COLLECTION, uid);
  await updateDoc(ref, updates as any);
}

/**
 * Create a coach within an organization (by Org Admin or Super Admin)
 */
export async function createCoachUser(data: {
  email: string;
  name: string;
  organizationId: string;
  phone?: string;
  title?: string;
}): Promise<UserProfile> {
  // Use a pseudo-uid or create doc
  const docRef = doc(collection(db, USERS_COLLECTION));
  const newCoach: UserProfile = {
    uid: docRef.id,
    email: data.email.toLowerCase().trim(),
    name: data.name.trim(),
    role: 'coach',
    organizationId: data.organizationId,
    phone: data.phone || '',
    title: data.title || 'YKS Danışmanı / Koç',
    isActive: true,
    assignedStudentIds: [],
    createdAt: new Date().toISOString()
  };

  await setDoc(docRef, {
    ...newCoach,
    createdAt: serverTimestamp()
  });

  return newCoach;
}

/**
 * Get users of an organization filtered by role
 */
export async function getUsersByOrg(organizationId: string, role?: UserRole): Promise<UserProfile[]> {
  try {
    let q;
    if (role) {
      q = query(
        collection(db, USERS_COLLECTION),
        where('organizationId', '==', organizationId),
        where('role', '==', role)
      );
    } else {
      q = query(
        collection(db, USERS_COLLECTION),
        where('organizationId', '==', organizationId)
      );
    }
    const snap = await getDocs(q);
    return snap.docs.map(d => {
      const data = d.data();
      return {
        uid: d.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString())
      } as UserProfile;
    });
  } catch (error) {
    console.error('Error fetching users by org:', error);
    return [];
  }
}

/**
 * Assign coach to student
 */
export async function assignCoachToStudent(studentId: string, coachId: string | null, coachName: string | null): Promise<void> {
  const ref = doc(db, USERS_COLLECTION, studentId);
  await updateDoc(ref, {
    coachId: coachId || null,
    coachName: coachName || null
  });
}

/**
 * Assign class to student
 */
export async function assignClassToStudent(studentId: string, classId: string | null, className: string | null): Promise<void> {
  const ref = doc(db, USERS_COLLECTION, studentId);
  await updateDoc(ref, {
    classId: classId || null,
    className: className || null
  });
}
