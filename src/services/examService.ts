import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { ExamResult, ExamType, FieldType, LanguageChoice, SubjectScore } from '../types';
import { calculateNet } from '../config/yksData';

const EXAMS_COLLECTION = 'examResults';

export interface CreateExamInput {
  organizationId: string;
  studentId: string;
  studentName: string;
  studentField: FieldType;
  examName: string;
  examType: ExamType;
  examDate: string;
  languageChoice?: LanguageChoice;
  scores: Record<string, SubjectScore>;
  notes?: string;
}

export async function addExamResult(input: CreateExamInput): Promise<ExamResult> {
  const docRef = doc(collection(db, EXAMS_COLLECTION));
  
  let totalTytNet = 0;
  let totalAytNet = 0;
  let totalYdtNet = 0;

  Object.values(input.scores).forEach(score => {
    // Recalculate net to ensure integrity
    score.net = calculateNet(score.correct, score.wrong);
    score.empty = Math.max(0, score.maxQuestions - (score.correct + score.wrong));
    
    // Categorize
    if (score.name.startsWith('TYT') || ['Türkçe', 'Temel Matematik', 'Fizik (Fen)', 'Kimya (Fen)', 'Biyoloji (Fen)', 'Tarih (Sosyal)', 'Coğrafya (Sosyal)', 'Felsefe (Sosyal)', 'Din Kültürü (Sosyal)'].includes(score.name)) {
      totalTytNet += score.net;
    } else if (score.name.startsWith('YDT')) {
      totalYdtNet += score.net;
    } else {
      totalAytNet += score.net;
    }
  });

  totalTytNet = Math.round(totalTytNet * 100) / 100;
  totalAytNet = Math.round(totalAytNet * 100) / 100;
  totalYdtNet = Math.round(totalYdtNet * 100) / 100;

  let totalNet = 0;
  if (input.examType === 'TYT') totalNet = totalTytNet;
  else if (input.examType === 'AYT') totalNet = totalAytNet;
  else if (input.examType === 'YDT') totalNet = totalYdtNet;
  else if (input.examType === 'TYT_AYT') totalNet = Math.round((totalTytNet + totalAytNet) * 100) / 100;

  const result: ExamResult = {
    id: docRef.id,
    organizationId: input.organizationId,
    studentId: input.studentId,
    studentName: input.studentName,
    studentField: input.studentField,
    examName: input.examName.trim(),
    examType: input.examType,
    examDate: input.examDate,
    languageChoice: input.languageChoice,
    scores: input.scores,
    totalTytNet,
    totalAytNet,
    totalYdtNet,
    totalNet,
    notes: input.notes || '',
    createdAt: new Date().toISOString()
  };

  await setDoc(docRef, {
    ...result,
    createdAt: serverTimestamp()
  });

  return result;
}

export async function getStudentExams(studentId: string, limitCount?: number): Promise<ExamResult[]> {
  try {
    let q;
    if (limitCount) {
      q = query(
        collection(db, EXAMS_COLLECTION),
        where('studentId', '==', studentId),
        orderBy('examDate', 'desc'),
        limit(limitCount)
      );
    } else {
      q = query(
        collection(db, EXAMS_COLLECTION),
        where('studentId', '==', studentId),
        orderBy('examDate', 'desc')
      );
    }
    const snap = await getDocs(q);
    return snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString())
      } as ExamResult;
    });
  } catch (error) {
    console.error('Error getting student exams:', error);
    // Fallback without orderBy in case index is pending
    try {
      const simpleQ = query(
        collection(db, EXAMS_COLLECTION),
        where('studentId', '==', studentId)
      );
      const snap = await getDocs(simpleQ);
      const res = snap.docs.map(d => ({ id: d.id, ...d.data() } as ExamResult));
      res.sort((a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime());
      return limitCount ? res.slice(0, limitCount) : res;
    } catch (e) {
      return [];
    }
  }
}

export async function getOrgExams(organizationId: string): Promise<ExamResult[]> {
  try {
    const q = query(
      collection(db, EXAMS_COLLECTION),
      where('organizationId', '==', organizationId)
    );
    const snap = await getDocs(q);
    const res = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString())
      } as ExamResult;
    });
    res.sort((a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime());
    return res;
  } catch (error) {
    console.error('Error getting org exams:', error);
    return [];
  }
}

export async function deleteExam(examId: string): Promise<void> {
  await deleteDoc(doc(db, EXAMS_COLLECTION, examId));
}
