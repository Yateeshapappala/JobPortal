export interface Application {
  id: string;
  jobTitle: string;
  company: string;
  status: 'IN-REVIEW' | 'SELECTED' | 'REJECTED' | 'REVIEWED';
  dateApplied: Date;
  logoUrl?: string;
  userEmail?: string;

  // Additional optional fields (from your form)
  fullName?: string;
  email?: string;
  contact?: string;
  currentCity?: string;
  availableFrom?: string;
  linkedin?: string;
  qualifications?: string;
  passedOutYear?: string;
  experience?: string;
  expectedSalary?: number;
  source?: string;
  previousCompany?: string;
  previousRole?: string;
  experienceYears?: number;
  resume?: string; // filename or URL
  jobId?: string | number;
  [key: string]: any;
}
