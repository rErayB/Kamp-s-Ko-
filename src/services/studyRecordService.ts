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
import { StudyRecord } from '../types';

const COLLECTION = 'studyRecords';

export async function addStudyRecord(record: Omit<StudyRecord, 'id' | 'createdAt'>): Promise<StudyRecord> {
  const ref = doc(collection(db, COLLECTION));
  const newRecord: StudyRecord = {
    ...record,
    id: ref.id,
    createdAt: new Date().toISOString()
  };

  await setDoc(ref, {
    ...newRecord,
    createdAt: serverTimestamp()
  });

  return newRecord;
}

export async function getStudentStudyRecords(studentId: string, limitDays?: number): Promise<StudyRecord[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('studentId', '==', studentId)
    );
    const snap = await getDocs(q);
    const list = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate ? d.data().createdAt.toDate().toISOString() : (d.data().createdAt || new Date().toISOString())
    } as StudyRecord));

    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return list;
  } catch (error) {
    console.error('Error getting student study records:', error);
    return [];
  }
}

export async function getOrgStudyRecords(organizationId: string): Promise<StudyRecord[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('organizationId', '==', organizationId)
    );
    const snap = await getDocs(q);
    const list = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate ? d.data().createdAt.toDate().toISOString() : (d.data().createdAt || new Date().toISOString())
    } as StudyRecord));
    return list;
  } catch (error) {
    console.error('Error getting org study records:', error);
    return [];
  }
}

export async function deleteStudyRecord(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
