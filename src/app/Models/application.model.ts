export interface Application {
  id: string;
  jobTitle: string;
  company: string;
  status: 'IN-REVIEW' | 'SELECTED' | 'REJECTED' | 'REVIEWED'; 
  dateApplied: Date;
  logoUrl?: string; // Optional: Makes the UI pop
  userEmail?: string;
}