import { create } from "zustand";
import { nanoid } from "./nanoid";
import {
  CompileErrorDetail,
  Resume,
  ResumeData,
  ResumeEducation,
  ResumeExperience,
  ResumeProject,
  ResumeSkillGroup,
  TemplateId,
} from "../types";
import { compileLatex as compileLatexApi, generateLatex } from "../api/client";

type EditorMode = "form" | "latex";

interface ResumeStore {
  resume: Resume | null;
  editorMode: EditorMode;

  // compile state
  isCompiling: boolean;
  pdfUrl: string | null;
  compileErrors: CompileErrorDetail[];
  compileLog: string | null;

  // --- setup ---
  loadResume: (resume: Resume) => void;

  // --- editing modes ---
  setEditorMode: (mode: EditorMode) => void;

  // --- structured data editing (form mode) ---
  updateContact: (patch: Partial<ResumeData["contact"]>) => void;
  updateSummary: (summary: string) => void;
  setTemplate: (templateId: TemplateId) => void;

  addEducation: () => void;
  updateEducation: (id: string, patch: Partial<ResumeEducation>) => void;
  removeEducation: (id: string) => void;

  addExperience: () => void;
  updateExperience: (id: string, patch: Partial<ResumeExperience>) => void;
  removeExperience: (id: string) => void;

  addProject: () => void;
  updateProject: (id: string, patch: Partial<ResumeProject>) => void;
  removeProject: (id: string) => void;

  addSkillGroup: () => void;
  updateSkillGroup: (id: string, patch: Partial<ResumeSkillGroup>) => void;
  removeSkillGroup: (id: string) => void;

  // --- raw LaTeX editing ---
  setLatexSource: (latex: string) => void;
  regenerateLatexFromData: () => Promise<void>;

  // --- compiling ---
  compileCurrentLatex: () => Promise<void>;
}

/** Marks the resume dirty and bumps updatedAt; used by every mutator below. */
function touch<T extends Resume>(resume: T): T {
  return { ...resume, updatedAt: new Date().toISOString() };
}

export const useResumeStore = create<ResumeStore>((set, get) => ({
  resume: null,
  editorMode: "form",
  isCompiling: false,
  pdfUrl: null,
  compileErrors: [],
  compileLog: null,

  loadResume: (resume) => set({ resume, pdfUrl: null, compileErrors: [], compileLog: null }),

  setEditorMode: (mode) => set({ editorMode: mode }),

  updateContact: (patch) =>
    set((s) => {
      if (!s.resume) return s;
      const data = { ...s.resume.data, contact: { ...s.resume.data.contact, ...patch } };
      return { resume: touch({ ...s.resume, data, isCustomLatex: false }) };
    }),

  updateSummary: (summary) =>
    set((s) => {
      if (!s.resume) return s;
      return { resume: touch({ ...s.resume, data: { ...s.resume.data, summary }, isCustomLatex: false }) };
    }),

  setTemplate: (templateId) =>
    set((s) => {
      if (!s.resume) return s;
      return { resume: touch({ ...s.resume, templateId, isCustomLatex: false }) };
    }),

  addEducation: () =>
    set((s) => {
      if (!s.resume) return s;
      const entry: ResumeEducation = { id: nanoid(), school: "", degree: "", startDate: "", endDate: "", details: [] };
      return {
        resume: touch({ ...s.resume, data: { ...s.resume.data, education: [...s.resume.data.education, entry] }, isCustomLatex: false }),
      };
    }),
  updateEducation: (id, patch) =>
    set((s) => {
      if (!s.resume) return s;
      const education = s.resume.data.education.map((e) => (e.id === id ? { ...e, ...patch } : e));
      return { resume: touch({ ...s.resume, data: { ...s.resume.data, education }, isCustomLatex: false }) };
    }),
  removeEducation: (id) =>
    set((s) => {
      if (!s.resume) return s;
      const education = s.resume.data.education.filter((e) => e.id !== id);
      return { resume: touch({ ...s.resume, data: { ...s.resume.data, education }, isCustomLatex: false }) };
    }),

  addExperience: () =>
    set((s) => {
      if (!s.resume) return s;
      const entry: ResumeExperience = { id: nanoid(), company: "", role: "", startDate: "", endDate: "", bullets: [""] };
      return {
        resume: touch({ ...s.resume, data: { ...s.resume.data, experience: [...s.resume.data.experience, entry] }, isCustomLatex: false }),
      };
    }),
  updateExperience: (id, patch) =>
    set((s) => {
      if (!s.resume) return s;
      const experience = s.resume.data.experience.map((e) => (e.id === id ? { ...e, ...patch } : e));
      return { resume: touch({ ...s.resume, data: { ...s.resume.data, experience }, isCustomLatex: false }) };
    }),
  removeExperience: (id) =>
    set((s) => {
      if (!s.resume) return s;
      const experience = s.resume.data.experience.filter((e) => e.id !== id);
      return { resume: touch({ ...s.resume, data: { ...s.resume.data, experience }, isCustomLatex: false }) };
    }),

  addProject: () =>
    set((s) => {
      if (!s.resume) return s;
      const entry: ResumeProject = { id: nanoid(), name: "", bullets: [""] };
      return { resume: touch({ ...s.resume, data: { ...s.resume.data, projects: [...s.resume.data.projects, entry] }, isCustomLatex: false }) };
    }),
  updateProject: (id, patch) =>
    set((s) => {
      if (!s.resume) return s;
      const projects = s.resume.data.projects.map((p) => (p.id === id ? { ...p, ...patch } : p));
      return { resume: touch({ ...s.resume, data: { ...s.resume.data, projects }, isCustomLatex: false }) };
    }),
  removeProject: (id) =>
    set((s) => {
      if (!s.resume) return s;
      const projects = s.resume.data.projects.filter((p) => p.id !== id);
      return { resume: touch({ ...s.resume, data: { ...s.resume.data, projects }, isCustomLatex: false }) };
    }),

  addSkillGroup: () =>
    set((s) => {
      if (!s.resume) return s;
      const entry: ResumeSkillGroup = { id: nanoid(), category: "", items: [] };
      return { resume: touch({ ...s.resume, data: { ...s.resume.data, skills: [...s.resume.data.skills, entry] }, isCustomLatex: false }) };
    }),
  updateSkillGroup: (id, patch) =>
    set((s) => {
      if (!s.resume) return s;
      const skills = s.resume.data.skills.map((sk) => (sk.id === id ? { ...sk, ...patch } : sk));
      return { resume: touch({ ...s.resume, data: { ...s.resume.data, skills }, isCustomLatex: false }) };
    }),
  removeSkillGroup: (id) =>
    set((s) => {
      if (!s.resume) return s;
      const skills = s.resume.data.skills.filter((sk) => sk.id !== id);
      return { resume: touch({ ...s.resume, data: { ...s.resume.data, skills }, isCustomLatex: false }) };
    }),

  setLatexSource: (latex) =>
    set((s) => {
      if (!s.resume) return s;
      return { resume: touch({ ...s.resume, latex, isCustomLatex: true }) };
    }),

  regenerateLatexFromData: async () => {
    const { resume } = get();
    if (!resume) return;
    const latex = await generateLatex(resume.templateId, resume.data);
    set((s) => (s.resume ? { resume: touch({ ...s.resume, latex, isCustomLatex: false }) } : s));
  },

  compileCurrentLatex: async () => {
    const { resume } = get();
    if (!resume) return;
    set({ isCompiling: true, compileErrors: [], compileLog: null });
    const outcome = await compileLatexApi(resume.latex);
    set((s) => ({
      isCompiling: false,
      pdfUrl: outcome.success ? outcome.pdfBlobUrl ?? null : s.pdfUrl,
      compileErrors: outcome.errors ?? [],
      compileLog: outcome.log ?? null,
    }));
  },
}));
