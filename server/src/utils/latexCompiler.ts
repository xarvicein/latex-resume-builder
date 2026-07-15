import { spawn } from "child_process";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { CompileErrorDetail } from "../types";

export interface CompileResult {
  success: boolean;
  pdf?: Buffer;
  log: string;
  errors: CompileErrorDetail[];
}

/**
 * Which LaTeX engine to shell out to. Set LATEX_ENGINE env var to override.
 * "tectonic" is recommended (single self-contained binary, auto-fetches packages).
 * "pdflatex" requires a full TeX Live install.
 */
const ENGINE = process.env.LATEX_ENGINE || "tectonic";

function runCommand(cmd: string, args: string[], cwd: string, timeoutMs = 25000): Promise<{ code: number | null; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, timeout: timeoutMs });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => (stdout += d.toString()));
    child.stderr.on("data", (d) => (stderr += d.toString()));
    child.on("error", (err) => reject(err));
    child.on("close", (code) => resolve({ code, stdout, stderr }));
  });
}

/** Very small heuristic parser for pdflatex/tectonic log output -> line-numbered errors */
function parseErrors(log: string): CompileErrorDetail[] {
  const errors: CompileErrorDetail[] = [];
  const lineRegex = /^! (.+)$/m;
  const lines = log.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^!\s*(.+)/);
    if (m) {
      // Look ahead a few lines for "l.<num>"
      let lineNum: number | undefined;
      for (let j = i; j < Math.min(i + 5, lines.length); j++) {
        const lm = lines[j].match(/l\.(\d+)/);
        if (lm) {
          lineNum = parseInt(lm[1], 10);
          break;
        }
      }
      errors.push({ message: m[1], line: lineNum });
    }
  }
  return errors;
}

export async function compileLatex(source: string): Promise<CompileResult> {
  const workDir = await fs.mkdtemp(path.join(os.tmpdir(), "resume-"));
  const texPath = path.join(workDir, "main.tex");
  await fs.writeFile(texPath, source, "utf-8");

  try {
    let result: { code: number | null; stdout: string; stderr: string };

    if (ENGINE === "tectonic") {
      result = await runCommand("tectonic", ["-X", "compile", "main.tex", "--outdir", workDir], workDir);
    } else {
      // pdflatex, run twice for refs/toc stability, non-interactive
      const args = ["-interaction=nonstopmode", "-halt-on-error", "main.tex"];
      await runCommand("pdflatex", args, workDir).catch(() => null);
      result = await runCommand("pdflatex", args, workDir);
    }

    const log = `${result.stdout}\n${result.stderr}`;
    const pdfPath = path.join(workDir, "main.pdf");

    try {
      const pdf = await fs.readFile(pdfPath);
      return { success: true, pdf, log, errors: [] };
    } catch {
      return { success: false, log, errors: parseErrors(log) };
    }
  } catch (err: any) {
    if (err?.code === "ENOENT") {
      return {
        success: false,
        log: `LaTeX engine "${ENGINE}" was not found on this machine. Install Tectonic (recommended, https://tectonic-typesetting.github.io) or TeX Live and set LATEX_ENGINE accordingly.`,
        errors: [{ message: `LaTeX engine "${ENGINE}" not found.` }],
      };
    }
    return { success: false, log: String(err), errors: [{ message: String(err) }] };
  } finally {
    fs.rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}
