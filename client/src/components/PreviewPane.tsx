import { useResumeStore } from "../store/useResumeStore";

export default function PreviewPane() {
  const pdfUrl = useResumeStore((s) => s.pdfUrl);
  const isCompiling = useResumeStore((s) => s.isCompiling);
  const compileErrors = useResumeStore((s) => s.compileErrors);
  const compileLog = useResumeStore((s) => s.compileLog);

  return (
    <div className="preview-pane">
      {isCompiling && (
        <div className="preview-overlay">
          <div className="spinner" />
          <span>Compiling LaTeX…</span>
        </div>
      )}

      {!isCompiling && compileErrors.length > 0 && (
        <div className="compile-errors">
          <h4>Compilation failed</h4>
          <ul>
            {compileErrors.map((err, i) => (
              <li key={i}>
                {err.line ? <span className="err-line">Line {err.line}:</span> : null} {err.message}
              </li>
            ))}
          </ul>
          {compileLog && (
            <details>
              <summary>Full log</summary>
              <pre>{compileLog}</pre>
            </details>
          )}
        </div>
      )}

      {!isCompiling && compileErrors.length === 0 && pdfUrl && (
        <iframe title="Resume PDF preview" src={pdfUrl} className="pdf-frame" />
      )}

      {!isCompiling && compileErrors.length === 0 && !pdfUrl && (
        <div className="preview-empty">
          <p>Hit <strong>Compile ▶</strong> to render your resume as a PDF.</p>
        </div>
      )}
    </div>
  );
}
