import { useResumeStore } from "../store/useResumeStore";
import { TemplateId } from "../types";

const TEMPLATE_OPTIONS: { id: TemplateId; label: string }[] = [
  { id: "classic", label: "Classic" },
  { id: "modern", label: "Modern" },
  { id: "compact", label: "Compact" },
];

export default function Toolbar() {
  const resume = useResumeStore((s) => s.resume);
  const editorMode = useResumeStore((s) => s.editorMode);
  const setEditorMode = useResumeStore((s) => s.setEditorMode);
  const setTemplate = useResumeStore((s) => s.setTemplate);
  const regenerateLatexFromData = useResumeStore(
    (s) => s.regenerateLatexFromData,
  );
  const compileCurrentLatex = useResumeStore((s) => s.compileCurrentLatex);
  const isCompiling = useResumeStore((s) => s.isCompiling);
  const pdfUrl = useResumeStore((s) => s.pdfUrl);

  if (!resume) return null;

  const handleTemplateChange = async (id: TemplateId) => {
    setTemplate(id);
    await regenerateLatexFromData();
  };

  return (
    <header className="toolbar">
      <div className="toolbar-left">
        <span className="brand">
          Resume<span className="brand-accent">TeX</span>
        </span>
        <span className="resume-name">{resume.name}</span>
      </div>

      <div className="toolbar-center">
        <div className="segmented">
          <button
            className={editorMode === "form" ? "active" : ""}
            onClick={() => setEditorMode("form")}
          >
            Form
          </button>
          <button
            className={editorMode === "latex" ? "active" : ""}
            onClick={() => setEditorMode("latex")}
          >
            LaTeX
          </button>
        </div>

        <select
          className="template-select"
          value={resume.templateId}
          onChange={(e) => handleTemplateChange(e.target.value as TemplateId)}
        >
          {TEMPLATE_OPTIONS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label} template
            </option>
          ))}
        </select>
      </div>

      <div className="toolbar-right">
        <button
          className="btn btn-primary"
          onClick={() => compileCurrentLatex()}
          disabled={isCompiling}
        >
          {isCompiling ? "Compiling…" : "Compile ▶"}
        </button>
        <a
          className={`btn btn-secondary ${!pdfUrl ? "disabled" : ""}`}
          href={pdfUrl ?? undefined}
          download={`${resume.name.replace(/\s+/g, "_") || "resume"}.pdf`}
          onClick={(e) => !pdfUrl && e.preventDefault()}
        >
          Download PDF
        </a>
      </div>
    </header>
  );
}
