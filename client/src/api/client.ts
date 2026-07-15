import axios from "axios";
import { Resume, ResumeData, TemplateId, TemplateMeta } from "../types";

const api = axios.create({ baseURL: "/api" });

export async function fetchTemplates(): Promise<TemplateMeta[]> {
  const { data } = await api.get("/templates");
  return data.templates;
}

export async function fetchSampleData(): Promise<ResumeData> {
  const { data } = await api.get("/templates/sample-data");
  return data.data;
}

export async function generateLatex(templateId: TemplateId, resumeData: ResumeData): Promise<string> {
  const { data } = await api.post(`/templates/${templateId}/generate`, resumeData);
  return data.latex;
}

export async function fetchResumes(): Promise<Omit<Resume, "latex">[]> {
  const { data } = await api.get("/resumes");
  return data.resumes;
}

export async function fetchResume(id: string): Promise<Resume> {
  const { data } = await api.get(`/resumes/${id}`);
  return data.resume;
}

export async function createResume(name: string, templateId: TemplateId): Promise<Resume> {
  const { data } = await api.post("/resumes", { name, templateId });
  return data.resume;
}

export async function updateResume(id: string, patch: Partial<Resume>): Promise<Resume> {
  const { data } = await api.put(`/resumes/${id}`, patch);
  return data.resume;
}

export async function deleteResume(id: string): Promise<void> {
  await api.delete(`/resumes/${id}`);
}

export interface CompileOutcome {
  success: boolean;
  pdfBlobUrl?: string;
  log?: string;
  errors?: { line?: number; message: string }[];
}

/** Compile raw LaTeX to a PDF blob URL, or return structured errors on failure. */
export async function compileLatex(latex: string): Promise<CompileOutcome> {
  try {
    const response = await api.post("/compile", { latex }, { responseType: "arraybuffer", validateStatus: () => true });

    const contentType = String(response.headers["content-type"] ?? "");
    if (contentType.includes("application/pdf")) {
      const blob = new Blob([response.data], { type: "application/pdf" });
      return { success: true, pdfBlobUrl: URL.createObjectURL(blob) };
    }

    // Non-PDF response means a JSON error payload came back as an arraybuffer; decode it.
    const text = new TextDecoder().decode(response.data);
    const parsed = JSON.parse(text);
    return { success: false, log: parsed.log, errors: parsed.errors };
  } catch (err: any) {
    return { success: false, errors: [{ message: err?.message || "Network error while compiling." }] };
  }
}

export default api;
