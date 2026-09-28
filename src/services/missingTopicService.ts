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
import { MissingTopicItem } from '../types';

const COLLECTION = 'missingTopics';

export async function addMissingTopic(topic: Omit<MissingTopicItem, 'id' | 'createdAt' | 'isResolved'>): Promise<MissingTopicItem> {
  const ref = doc(collection(db, COLLECTION));
  const newTopic: MissingTopicItem = {
    ...topic,
    id: ref.id,
    isResolved: false,
    createdAt: new Date().toISOString()
  };

  await setDoc(ref, {
    ...newTopic,
    createdAt: serverTimestamp()
  });

  return newTopic;
}

export async function getStudentMissingTopics(studentId: string): Promise<MissingTopicItem[]> {
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
    } as MissingTopicItem));

    // Sort unresolved first, then by urgency (high > medium > low)
    const order = { high: 1, medium: 2, low: 3 };
    list.sort((a, b) => {
      if (a.isResolved !== b.isResolved) return a.isResolved ? 1 : -1;
      return order[a.urgency] - order[b.urgency];
    });

    return list;
  } catch (error) {
    console.error('Error getting missing topics:', error);
    return [];
  }
}

export async function toggleMissingTopicResolved(id: string, isResolved: boolean): Promise<void> {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, { isResolved });
}

export async function deleteMissingTopic(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
