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
import { AnnouncementItem } from '../types';

const COLLECTION = 'announcements';

export async function addAnnouncement(item: Omit<AnnouncementItem, 'id' | 'createdAt'>): Promise<AnnouncementItem> {
  const ref = doc(collection(db, COLLECTION));
  const newItem: AnnouncementItem = {
    ...item,
    id: ref.id,
    createdAt: new Date().toISOString()
  };

  await setDoc(ref, {
    ...newItem,
    createdAt: serverTimestamp()
  });

  return newItem;
}

export async function getOrgAnnouncements(organizationId: string): Promise<AnnouncementItem[]> {
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
    } as AnnouncementItem));

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  } catch (error) {
    console.error('Error getting org announcements:', error);
    return [];
  }
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
