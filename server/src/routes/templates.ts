import { Router } from "express";
import { generators, templateMeta, sampleResumeData } from "../templates";
import { ResumeData, TemplateId } from "../types";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ templates: templateMeta });
});

router.get("/sample-data", (_req, res) => {
  res.json({ data: sampleResumeData });
});

// Generate LaTeX source from structured resume data + a template id, without persisting anything.
router.post("/:templateId/generate", (req, res) => {
  const templateId = req.params.templateId as TemplateId;
  const data = req.body as ResumeData;

  const generator = generators[templateId];
  if (!generator) {
    return res.status(400).json({ error: `Unknown template "${templateId}".` });
  }
  if (!data || !data.contact) {
    return res.status(400).json({ error: "Missing resume data." });
  }

  try {
    const latex = generator(data);
    res.json({ latex });
  } catch (err: any) {
    res.status(500).json({ error: `Failed to generate LaTeX: ${err.message}` });
  }
});

export default router;
