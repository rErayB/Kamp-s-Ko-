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
import { NotificationItem } from '../types';

const COLLECTION = 'notifications';

export async function sendNotification(item: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>): Promise<NotificationItem> {
  const ref = doc(collection(db, COLLECTION));
  const newItem: NotificationItem = {
    ...item,
    id: ref.id,
    isRead: false,
    createdAt: new Date().toISOString()
  };

  await setDoc(ref, {
    ...newItem,
    createdAt: serverTimestamp()
  });

  return newItem;
}

export async function getUserNotifications(userId: string): Promise<NotificationItem[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('userId', '==', userId)
    );
    const snap = await getDocs(q);
    const list = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate ? d.data().createdAt.toDate().toISOString() : (d.data().createdAt || new Date().toISOString())
    } as NotificationItem));

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
}

export async function markNotificationAsRead(id: string): Promise<void> {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, { isRead: true });
}
