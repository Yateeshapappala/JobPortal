export interface User {
  username: string;
  password?: string;
  fullName: string;
  email: string;
  profilePic?: string | null;

  // basics
  mobile?: string;
  dob?: string;
  gender?: string;
  city?: string;
  state?: string;
  country?: string;
  address?: string;

  // summary
  summary?: string;

  // arrays
  experience?: Array<{
    title: string;
    company: string;
    startDate?: string;
    endDate?: string;
    current?: boolean;
    description?: string;
    tech?: string;
  }>;
  education?: Array<{
    degree: string;
    institute: string;
    startDate?: string;
    endDate?: string;
    score?: string;
  }>;
  skills?: string[];
  projects?: Array<{
    title: string;
    description?: string;
    tech?: string;
    url?: string;
  }>;
  social?: {
    linkedin?: string;
    github?: string;
    website?: string;
  };
  additional?: {
    languages?: string[];
    certifications?: string[];
    achievements?: string[];
  };
}
