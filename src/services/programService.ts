import {
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { StudyProgramItem, ProgramStatus } from '../types';

const COLLECTION = 'studyPrograms';

export async function addStudyProgram(item: Omit<StudyProgramItem, 'id' | 'createdAt' | 'status'>): Promise<StudyProgramItem> {
  const ref = doc(collection(db, COLLECTION));
  const newProgram: StudyProgramItem = {
    ...item,
    id: ref.id,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  await setDoc(ref, {
    ...newProgram,
    createdAt: serverTimestamp()
  });

  return newProgram;
}

export async function getStudentPrograms(studentId: string, date?: string): Promise<StudyProgramItem[]> {
  try {
    let q;
    if (date) {
      q = query(
        collection(db, COLLECTION),
        where('studentId', '==', studentId),
        where('date', '==', date)
      );
    } else {
      q = query(
        collection(db, COLLECTION),
        where('studentId', '==', studentId)
      );
    }
    const snap = await getDocs(q);
    const items = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate ? d.data().createdAt.toDate().toISOString() : (d.data().createdAt || new Date().toISOString())
    } as StudyProgramItem));
    
    // Sort by startTime
    items.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
    return items;
  } catch (error) {
    console.error('Error fetching student programs:', error);
    return [];
  }
}

export async function updateProgramStatus(id: string, status: ProgramStatus): Promise<void> {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, {
    status,
    completedAt: status === 'completed' ? new Date().toISOString() : null
  });
}

export async function deleteProgram(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
