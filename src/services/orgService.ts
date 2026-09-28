import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Organization, ClassItem } from '../types';

const ORGS_COLLECTION = 'organizations';
const CLASSES_COLLECTION = 'classes';

/**
 * Normalizes an organization code for case-insensitive and whitespace-free lookup.
 */
export function normalizeOrgCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, '');
}

/**
 * Find organization by code (e.g. DDKUTAHYA)
 */
export async function getOrgByCode(code: string): Promise<Organization | null> {
  const normalized = normalizeOrgCode(code);
  if (!normalized) return null;

  try {
    const q = query(
      collection(db, ORGS_COLLECTION),
      where('code', '==', normalized)
    );
    const snap = await getDocs(q);

    if (snap.empty) {
      return null;
    }

    const docData = snap.docs[0].data();
    return {
      id: snap.docs[0].id,
      ...docData,
      createdAt: docData.createdAt?.toDate ? docData.createdAt.toDate().toISOString() : (docData.createdAt || new Date().toISOString())
    } as Organization;
  } catch (error) {
    console.error('Error fetching organization by code:', error);
    throw error;
  }
}

/**
 * Get organization by ID
 */
export async function getOrgById(id: string): Promise<Organization | null> {
  try {
    const ref = doc(db, ORGS_COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;

    const data = snap.data();
    return {
      id: snap.id,
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString())
    } as Organization;
  } catch (error) {
    console.error('Error fetching organization by id:', error);
    throw error;
  }
}

/**
 * List all organizations (for Super Admin)
 */
export async function getAllOrgs(): Promise<Organization[]> {
  try {
    const ref = collection(db, ORGS_COLLECTION);
    const snap = await getDocs(ref);
    return snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString())
      } as Organization;
    });
  } catch (error) {
    console.error('Error fetching all organizations:', error);
    throw error;
  }
}

/**
 * Create a new organization
 */
export async function createOrg(orgData: Omit<Organization, 'id' | 'createdAt'>): Promise<Organization> {
  const normalizedCode = normalizeOrgCode(orgData.code);
  
  // Check if code already in use
  const existing = await getOrgByCode(normalizedCode);
  if (existing) {
    throw new Error(`Bu kurum kodu ("${normalizedCode}") zaten başka bir kurum tarafından kullanılıyor.`);
  }

  const docRef = doc(collection(db, ORGS_COLLECTION));
  const newOrg: Organization = {
    ...orgData,
    id: docRef.id,
    code: normalizedCode,
    isActive: orgData.isActive ?? true,
    studentCount: 0,
    coachCount: 0,
    createdAt: new Date().toISOString()
  };

  await setDoc(docRef, {
    ...newOrg,
    createdAt: serverTimestamp()
  });

  return newOrg;
}

/**
 * Update an existing organization
 */
export async function updateOrg(id: string, updates: Partial<Organization>): Promise<void> {
  const ref = doc(db, ORGS_COLLECTION, id);
  if (updates.code) {
    updates.code = normalizeOrgCode(updates.code);
  }
  await updateDoc(ref, updates as any);
}

/**
 * Seed initial sample organizations if database is blank
 */
export async function seedInitialOrgsIfEmpty(): Promise<void> {
  try {
    const existing = await getOrgByCode('DDKUTAHYA');
    if (!existing) {
      // Create D&D Kütahya
      const ddRef = doc(collection(db, ORGS_COLLECTION));
      await setDoc(ddRef, {
        id: ddRef.id,
        code: 'DDKUTAHYA',
        name: 'D&D Kütahya Eğitim Kurumu',
        city: 'Kütahya',
        phone: '0 (274) 224 00 11',
        email: 'info@ddkutahya.k12.tr',
        address: 'Ali Paşa Mah. Atatürk Bulvarı No:42/B, Merkez / Kütahya',
        managerName: 'Mehmet Dinç',
        managerEmail: 'yonetim@ddkutahya.com',
        isActive: true,
        studentCount: 120,
        coachCount: 8,
        createdAt: serverTimestamp()
      });

      // Create default classes for D&D Kütahya
      const classNames = [
        { name: '12-A Sayısal', field: 'Sayısal' as const },
        { name: '12-B Sayısal', field: 'Sayısal' as const },
        { name: '12-C Eşit Ağırlık', field: 'Eşit Ağırlık' as const },
        { name: '12-D Sözel', field: 'Sözel' as const },
        { name: '12-E Dil', field: 'Dil' as const },
        { name: 'Mezun-1 Sayısal', field: 'Sayısal' as const }
      ];

      for (const c of classNames) {
        const cRef = doc(collection(db, CLASSES_COLLECTION));
        await setDoc(cRef, {
          id: cRef.id,
          organizationId: ddRef.id,
          name: c.name,
          field: c.field,
          studentCount: 20,
          createdAt: serverTimestamp()
        });
      }

      // Also create ABC Ankara for multi-tenant isolation testing
      const abcRef = doc(collection(db, ORGS_COLLECTION));
      await setDoc(abcRef, {
        id: abcRef.id,
        code: 'ABCANKARA',
        name: 'ABC Ankara Eğitim Kurumları',
        city: 'Ankara',
        phone: '0 (312) 440 20 30',
        email: 'iletisim@abcankara.com',
        address: 'Çankaya Cad. No:88, Çankaya / Ankara',
        managerName: 'Kemal Arslan',
        managerEmail: 'kemal@abcankara.com',
        isActive: true,
        studentCount: 95,
        coachCount: 6,
        createdAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.warn('Seed initial orgs warning:', error);
  }
}
