import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { ClassItem, FieldType } from '../types';

const COLLECTION = 'classes';

export async function addClass(orgId: string, name: string, field: FieldType): Promise<ClassItem> {
  const ref = doc(collection(db, COLLECTION));
  const newClass: ClassItem = {
    id: ref.id,
    organizationId: orgId,
    name: name.trim(),
    field,
    studentCount: 0,
    createdAt: new Date().toISOString()
  };

  await setDoc(ref, {
    ...newClass,
    createdAt: serverTimestamp()
  });

  return newClass;
}

export async function getOrgClasses(orgId: string): Promise<ClassItem[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('organizationId', '==', orgId)
    );
    const snap = await getDocs(q);
    const list = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate ? d.data().createdAt.toDate().toISOString() : (d.data().createdAt || new Date().toISOString())
    } as ClassItem));

    list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  } catch (error) {
    console.error('Error getting org classes:', error);
    return [];
  }
}

export async function deleteClass(classId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, classId));
}
