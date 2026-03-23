export type User = {
  id: string;
  email: string;
  createdAt: string;
};

export type ApplicationStatus =
  | "SAVED"
  | "APPLIED"
  | "INTERVIEW"
  | "OFFER"
  | "REJECTED";

export type JobApplication = {
  id: string;
  userId: string;
  company: string;
  roleTitle: string;
  location: string | null;
  url: string | null;
  salaryRange: string | null;
  status: ApplicationStatus;
  appliedDate: string | null;
  notes: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateApplicationInput = {
  company: string;
  roleTitle: string;
  location?: string;
  url?: string;
  salaryRange?: string;
  status: ApplicationStatus;
  appliedDate?: string;
  notes?: string;
};

export type UpdateApplicationInput = Partial<{
  company: string;
  roleTitle: string;
  location: string;
  url: string;
  salaryRange: string;
  status: ApplicationStatus;
  appliedDate: string;
  notes: string;
  position: number;
}>;