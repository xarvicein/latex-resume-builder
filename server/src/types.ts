export interface ResumeContact {
  fullName: string;
  title?: string;
  email: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;
}

export interface ResumeEducation {
  id: string;
  school: string;
  degree: string;
  location?: string;
  startDate: string;
  endDate: string;
  details?: string[];
}

export interface ResumeExperience {
  id: string;
  company: string;
  role: string;
  location?: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface ResumeProject {
  id: string;
  name: string;
  tech?: string;
  link?: string;
  bullets: string[];
}

export interface ResumeSkillGroup {
  id: string;
  category: string;
  items: string[];
}

export interface ResumeData {
  contact: ResumeContact;
  summary?: string;
  education: ResumeEducation[];
  experience: ResumeExperience[];
  projects: ResumeProject[];
  skills: ResumeSkillGroup[];
}

export type TemplateId = "classic" | "modern" | "compact";

export interface Resume {
  id: string;
  name: string;
  templateId: TemplateId;
  data: ResumeData;
  /** Raw LaTeX source, either generated from data or hand-edited by the user */
  latex: string;
  /** true once the user has manually edited the LaTeX away from the generated version */
  isCustomLatex: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CompileRequestBody {
  latex: string;
}

export interface CompileErrorDetail {
  line?: number;
  message: string;
}
