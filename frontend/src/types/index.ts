export type UserRole = 'STUDENT' | 'FACULTY' | 'ADMIN';

export type ODReason = 'PRE_WORK' | 'EVENT' | 'POST_WORK';

export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'PENDING_FACULTY'
  | 'PENDING_ADMIN'
  | 'APPROVED'
  | 'REJECTED'
  | 'RETURNED_FOR_CORRECTION'
  | 'CANCELLED';

export type ReviewDecision =
  | 'FORWARDED_TO_ADMIN'
  | 'APPROVED'
  | 'REJECTED'
  | 'RETURNED_FOR_CORRECTION';

export interface Department {
  id: string;
  code: string;
  name: string;
  _count?: {
    students: number;
    faculty: number;
  };
}

export interface StudentProfile {
  id: string;
  userId: string;
  registerNumber: string;
  departmentId: string;
  year: number;
  section: string;
  rollNumber?: string;
  department: Department;
  user?: User;
}

export interface FacultyProfile {
  id: string;
  userId: string;
  employeeId: string;
  departmentId: string;
  designation: string;
  department: Department;
  user?: User;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  studentProfile?: StudentProfile;
  facultyProfile?: FacultyProfile;
  createdAt?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  organizer: string;
  venue: string;
  startDate: string;
  endDate: string;
  deadline: string;
  requiresDocument: boolean;
  isActive: boolean;
  _count?: {
    applications: number;
  };
}

export interface ODPeriod {
  id: string;
  applicationDateId: string;
  periodNumber: number;
}

export interface ODDate {
  id: string;
  applicationId: string;
  date: string;
  isFullDay: boolean;
  periods: ODPeriod[];
}

export interface UploadedDocument {
  id: string;
  applicationId: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  filePath: string;
  createdAt: string;
}

export interface ApprovalReview {
  id: string;
  applicationId: string;
  reviewerId: string;
  role: UserRole;
  decision: ReviewDecision;
  remarks?: string;
  createdAt: string;
  reviewer?: {
    id: string;
    fullName: string;
    email: string;
    role: UserRole;
    facultyProfile?: FacultyProfile;
  };
}

export interface ODApplication {
  id: string;
  applicationNumber: string;
  studentProfileId: string;
  eventId?: string;
  customEventTitle?: string;
  customVenue?: string;
  customOrganizer?: string;
  reason: ODReason;
  status: ApplicationStatus;
  verificationCode: string;
  declarationAccepted: boolean;
  createdAt: string;
  updatedAt: string;
  studentProfile: StudentProfile;
  event?: Event;
  dates: ODDate[];
  documents: UploadedDocument[];
  reviews: ApprovalReview[];
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}
