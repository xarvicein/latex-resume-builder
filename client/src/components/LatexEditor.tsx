import Editor from "@monaco-editor/react";
import { useResumeStore } from "../store/useResumeStore";

export default function LatexEditor() {
  const resume = useResumeStore((s) => s.resume);
  const setLatexSource = useResumeStore((s) => s.setLatexSource);
  const regenerateLatexFromData = useResumeStore(
    (s) => s.regenerateLatexFromData,
  );

  if (!resume) return null;

  return (
    <div className="latex-editor">
      {resume.isCustomLatex && (
        <div className="latex-banner">
          You've hand-edited the LaTeX, so it's no longer synced with the form.{" "}
          <button
            className="link-btn"
            onClick={() => regenerateLatexFromData()}
          >
            Regenerate from form
          </button>
        </div>
      )}
      {/* Monaco has no built-in LaTeX grammar; "plaintext" avoids a console warning
          while still giving line numbers, search, and multi-cursor editing. */}
      <Editor
        height="100%"
        defaultLanguage="plaintext"
        language="plaintext"
        theme="vs-dark"
        value={resume.latex}
        onChange={(value) => setLatexSource(value ?? "")}
        options={{
          fontSize: 13,
          minimap: { enabled: false },
          wordWrap: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
}
