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
import { CoachNoteItem } from '../types';

const COLLECTION = 'coachNotes';

export async function addCoachNote(note: Omit<CoachNoteItem, 'id' | 'createdAt'>): Promise<CoachNoteItem> {
  const ref = doc(collection(db, COLLECTION));
  const newNote: CoachNoteItem = {
    ...note,
    id: ref.id,
    createdAt: new Date().toISOString()
  };

  await setDoc(ref, {
    ...newNote,
    createdAt: serverTimestamp()
  });

  return newNote;
}

export async function getStudentCoachNotes(studentId: string, isCoachOrAdmin: boolean): Promise<CoachNoteItem[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('studentId', '==', studentId)
    );
    const snap = await getDocs(q);
    let list = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate ? d.data().createdAt.toDate().toISOString() : (d.data().createdAt || new Date().toISOString())
    } as CoachNoteItem));

    if (!isCoachOrAdmin) {
      list = list.filter(n => !n.isPrivate);
    }

    list.sort((a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime());
    return list;
  } catch (error) {
    console.error('Error getting coach notes:', error);
    return [];
  }
}

export async function deleteCoachNote(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
