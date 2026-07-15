import { Router } from "express";
import { nanoid } from "nanoid";
import { Resume, TemplateId } from "../types";
import { generators, sampleResumeData } from "../templates";

const router = Router();

// In-memory store. Swap this out for a real database (e.g. Postgres/Mongo) in production -
// the route handlers below are the only place that would need to change.
const resumes = new Map<string, Resume>();

// Seed one example resume so the app isn't empty on first load.
(function seed() {
  const id = nanoid();
  const now = new Date().toISOString();
  const resume: Resume = {
    id,
    name: "My First Resume",
    templateId: "classic",
    data: sampleResumeData,
    latex: generators.classic(sampleResumeData),
    isCustomLatex: false,
    createdAt: now,
    updatedAt: now,
  };
  resumes.set(id, resume);
})();

router.get("/", (_req, res) => {
  res.json({
    resumes: Array.from(resumes.values()).map(({ latex, ...meta }) => meta),
  });
});

router.get("/:id", (req, res) => {
  const resume = resumes.get(req.params.id);
  if (!resume) return res.status(404).json({ error: "Resume not found." });
  res.json({ resume });
});

router.post("/", (req, res) => {
  const { name, templateId } = req.body as {
    name?: string;
    templateId?: TemplateId;
  };
  const id = nanoid();
  const now = new Date().toISOString();
  const tpl: TemplateId =
    templateId && generators[templateId] ? templateId : "classic";
  const data = sampleResumeData;

  const resume: Resume = {
    id,
    name: name?.trim() || "Untitled Resume",
    templateId: tpl,
    data,
    latex: generators[tpl](data),
    isCustomLatex: false,
    createdAt: now,
    updatedAt: now,
  };
  resumes.set(id, resume);
  res.status(201).json({ resume });
});

router.put("/:id", (req, res) => {
  const existing = resumes.get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Resume not found." });

  const body = req.body as Partial<Resume>;
  const updated: Resume = {
    ...existing,
    ...body,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };
  resumes.set(existing.id, updated);
  res.json({ resume: updated });
});

router.delete("/:id", (req, res) => {
  if (!resumes.has(req.params.id))
    return res.status(404).json({ error: "Resume not found." });
  resumes.delete(req.params.id);
  res.status(204).send();
});

export default router;
