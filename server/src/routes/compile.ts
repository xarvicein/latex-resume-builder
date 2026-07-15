import { Router } from "express";
import { compileLatex } from "../utils/latexCompiler";
import { CompileRequestBody } from "../types";

const router = Router();

router.post("/", async (req, res) => {
  const { latex } = req.body as CompileRequestBody;

  if (!latex || typeof latex !== "string" || !latex.trim()) {
    return res
      .status(400)
      .json({
        success: false,
        errors: [{ message: "No LaTeX source provided." }],
      });
  }
  if (latex.length > 200_000) {
    return res
      .status(400)
      .json({
        success: false,
        errors: [{ message: "LaTeX source too large." }],
      });
  }

  const result = await compileLatex(latex);

  if (!result.success) {
    return res
      .status(200)
      .json({ success: false, log: result.log, errors: result.errors });
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "inline; filename=resume.pdf");
  return res.send(result.pdf);
});

export default router;
