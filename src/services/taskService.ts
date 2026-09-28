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
import { TaskItem, TaskStatus } from '../types';

const COLLECTION = 'tasks';

export async function addTask(task: Omit<TaskItem, 'id' | 'createdAt' | 'status'>): Promise<TaskItem> {
  const ref = doc(collection(db, COLLECTION));
  const newTask: TaskItem = {
    ...task,
    id: ref.id,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  await setDoc(ref, {
    ...newTask,
    createdAt: serverTimestamp()
  });

  return newTask;
}

export async function getStudentTasks(studentId: string): Promise<TaskItem[]> {
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
    } as TaskItem));

    list.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    return list;
  } catch (error) {
    console.error('Error fetching student tasks:', error);
    return [];
  }
}

export async function getCoachTasks(coachId: string): Promise<TaskItem[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('coachId', '==', coachId)
    );
    const snap = await getDocs(q);
    const list = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate ? d.data().createdAt.toDate().toISOString() : (d.data().createdAt || new Date().toISOString())
    } as TaskItem));

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  } catch (error) {
    console.error('Error fetching coach tasks:', error);
    return [];
  }
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<void> {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, {
    status,
    completedAt: status === 'completed' ? new Date().toISOString() : null
  });
}

export async function deleteTask(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
