export type Role = 'APPLICANT' | 'GOVERNMENT_OFFICIAL' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  role: Role;
  createdAt: string;
  profile?: any;
}

export interface ApplicantProfile {
  id: string;
  userId: string;
  applicantId: string;
  fullName: string;
  dob?: string;
  gender?: string;
  mobile?: string;
  alternateMobile?: string;
  location?: string;
  currentAddress?: string;
  permanentAddress?: string;
  maskedAadhaar?: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'NOT_AVAILABLE';
  biometricVerified: boolean;
  profileCompletion: number;
  education?: Education[];
  applicantSkills?: ApplicantSkill[];
  enrollments?: Enrollment[];
  applications?: Application[];
  verifications?: Verification[];
}

export interface GovernmentOfficial {
  id: string;
  officialId: string;
  fullName: string;
  designation: string;
  department?: string;
  governmentId: string;
  epfoStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'NOT_AVAILABLE';
  taxGstStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'NOT_AVAILABLE';
  mobile?: string;
}

export interface Education {
  id: string;
  qualification: string;
  institution: string;
  course: string;
  specialization?: string;
  graduationYear?: number;
}

export interface Skill {
  id: string;
  name: string;
  category?: string;
  description?: string;
}

export interface ApplicantSkill {
  id: string;
  skillId: string;
  skill: Skill;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
}

export interface Course {
  id: string;
  name: string;
  description?: string;
  duration?: string;
  level?: string;
  availableSeats: number;
  enrolledCount: number;
  isActive: boolean;
  instructor?: string;
  courseSkills?: { skill: Skill }[];
}

export interface Enrollment {
  id: string;
  courseId: string;
  course: Course;
  status: 'ENROLLED' | 'IN_PROGRESS' | 'COMPLETED' | 'DROPPED';
  progress: number;
  enrolledAt: string;
}

export interface Application {
  id: string;
  applicationId: string;
  applicationType: string;
  program?: string;
  status: 'SUBMITTED' | 'DOCUMENTS_VERIFIED' | 'ELIGIBILITY_CHECKED' | 'COURSE_ASSIGNED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  remarks?: string;
  submittedAt: string;
  updatedAt: string;
  statusHistory?: ApplicationStatusHistory[];
}

export interface ApplicationStatusHistory {
  id: string;
  status: string;
  remarks?: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface Verification {
  id: string;
  type: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'NOT_AVAILABLE';
  verifiedAt?: string;
  remarks?: string;
}

export interface Tracker {
  id: string;
  applicantId: string;
  applicant?: ApplicantProfile;
  designation?: string;
  governmentId?: string;
  epfoStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'NOT_AVAILABLE';
  taxGstStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'NOT_AVAILABLE';
  credentialStatus?: string;
  lastUpdated: string;
  notes?: string;
}

export interface GapAnalysis {
  id: string;
  targetRole: string;
  matchPercentage: number;
  summary?: string;
  isDemo: boolean;
  createdAt: string;
  skillGaps?: SkillGap[];
  learningPath?: LearningPath[];
  recommendations?: { course?: Course; reason?: string }[];
}

export interface SkillGap {
  id: string;
  skillName: string;
  currentLevel: string;
  requiredLevel: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface LearningPath {
  id: string;
  stage: number;
  topic: string;
  duration?: string;
  description?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface DashboardStats {
  profileCompletion?: number;
  applicationStatus?: string;
  courseEnrolled?: string;
  verificationStatus?: string;
  gapAnalysisCount?: number;
  notificationCount?: number;
}

export interface OfficialDashboardStats {
  totalApplicants: number;
  activeApplications: number;
  pendingVerification: number;
  completedApplications: number;
  enrolledApplicants: number;
  skillGapsDetected: number;
}

export interface GapAnalysisInput {
  currentSkills: string[];
  targetRole: string;
  education?: string;
  experience?: string;
  certifications?: string[];
}

export interface GapAnalysisResult {
  matchPercentage: number;
  existingSkills: string[];
  skillGaps: {
    skillName: string;
    currentLevel: string;
    requiredLevel: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }[];
  learningPath: {
    stage: number;
    topic: string;
    duration: string;
    description: string;
  }[];
  recommendedCourses: { id: string; name: string; description?: string }[];
  summary: string;
  weeklyPlan: { week: string; topic: string }[];
}
