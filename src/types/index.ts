export type UserRole = 'super_admin' | 'org_admin' | 'coach' | 'student';

export type FieldType = 'Sayısal' | 'Eşit Ağırlık' | 'Sözel' | 'Dil';

export type GradeType = '11' | '12' | 'Mezun';

export type ExamType = 'TYT' | 'AYT' | 'YDT' | 'TYT_AYT';

export type ProgramStatus = 'pending' | 'in_progress' | 'completed';

export type TaskStatus = 'pending' | 'completed';

export type UrgencyLevel = 'high' | 'medium' | 'low';

export type LanguageChoice = 'İngilizce' | 'Almanca' | 'Fransızca' | 'Arapça' | 'Rusça';

export interface Organization {
  id: string;
  code: string; // e.g. "DDKUTAHYA"
  name: string; // e.g. "D&D Kütahya Eğitim Kurumu"
  city: string;
  phone: string;
  email: string;
  address: string;
  managerName?: string;
  managerEmail?: string;
  isActive: boolean;
  studentCount?: number;
  coachCount?: number;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId: string | null;
  phone?: string;
  isActive: boolean;
  createdAt: string;

  // Student specific
  grade?: GradeType;
  field?: FieldType;
  targetUniversity?: string;
  targetDepartment?: string;
  targetScore?: number;
  targetRank?: number;
  dailyQuestionGoal?: number;
  weeklyStudyGoalHours?: number;
  coachId?: string | null;
  coachName?: string | null;
  classId?: string | null;
  className?: string | null;

  // Coach specific
  title?: string;
  assignedStudentIds?: string[];
}

export interface ClassItem {
  id: string;
  organizationId: string;
  name: string; // e.g. "12-A Sayısal"
  field: FieldType;
  studentCount?: number;
  createdAt: string;
}

export interface SubjectScore {
  name: string;
  maxQuestions: number;
  correct: number;
  wrong: number;
  empty: number;
  net: number;
}

export interface ExamResult {
  id: string;
  organizationId: string;
  studentId: string;
  studentName: string;
  studentField: FieldType;
  examName: string;
  examType: ExamType;
  examDate: string; // YYYY-MM-DD
  languageChoice?: LanguageChoice;
  scores: Record<string, SubjectScore>;
  totalTytNet?: number;
  totalAytNet?: number;
  totalYdtNet?: number;
  totalNet: number;
  notes?: string;
  createdAt: string;
}

export interface StudyProgramItem {
  id: string;
  organizationId: string;
  studentId: string;
  studentName?: string;
  coachId?: string;
  coachName?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  subject: string;
  topic: string;
  targetQuestions: number;
  estimatedMinutes: number;
  description?: string;
  status: ProgramStatus;
  completedAt?: string;
  createdAt: string;
}

export interface StudyRecord {
  id: string;
  organizationId: string;
  studentId: string;
  studentName?: string;
  date: string; // YYYY-MM-DD
  subject: string;
  topic: string;
  solvedQuestions: number;
  correct: number;
  wrong: number;
  durationMinutes: number;
  notes?: string;
  createdAt: string;
}

export interface TaskItem {
  id: string;
  organizationId: string;
  studentId: string;
  studentName?: string;
  coachId?: string;
  coachName?: string;
  title: string;
  description: string;
  subject: string;
  topic: string;
  targetQuestions: number;
  dueDate: string; // YYYY-MM-DD
  status: TaskStatus;
  completedAt?: string;
  createdAt: string;
}

export interface MissingTopicItem {
  id: string;
  organizationId: string;
  studentId: string;
  subject: string;
  topic: string;
  urgency: UrgencyLevel; // 'high' = 🔴, 'medium' = 🟠, 'low' = 🟡
  notes?: string;
  isResolved: boolean;
  addedBy: 'coach' | 'student';
  createdAt: string;
}

export interface CoachNoteItem {
  id: string;
  organizationId: string;
  studentId: string;
  coachId: string;
  coachName: string;
  note: string;
  isPrivate: boolean; // if true, visible only to coaches/admins
  date: string;
  createdAt: string;
}

export interface AnnouncementItem {
  id: string;
  organizationId: string;
  title: string;
  content: string;
  targetType: 'all' | 'class' | 'coaches' | 'student';
  targetId?: string;
  targetName?: string;
  authorName: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  organizationId: string;
  userId: string;
  title: string;
  message: string;
  type: 'program' | 'task' | 'exam' | 'announcement' | 'system';
  isRead: boolean;
  link?: string;
  createdAt: string;
}
