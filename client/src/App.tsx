import { useEffect, useState } from "react";
import Toolbar from "./components/Toolbar";
import FormEditor from "./components/FormEditor";
import LatexEditor from "./components/LatexEditor";
import PreviewPane from "./components/PreviewPane";
import { useResumeStore } from "./store/useResumeStore";
import { fetchResumes, fetchResume, createResume } from "./api/client";

export default function App() {
  const resume = useResumeStore((s) => s.resume);
  const loadResume = useResumeStore((s) => s.loadResume);
  const editorMode = useResumeStore((s) => s.editorMode);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const list = await fetchResumes();
        const first = list[0] ?? (await createResume("My First Resume", "classic"));
        const full = "latex" in first ? (first as any) : await fetchResume(first.id);
        loadResume(full);
      } catch (err: any) {
        setLoadError("Couldn't reach the API server. Is the Express backend running on port 4000?");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loadError) {
    return (
      <div className="app-error">
        <h2>⚠️ {loadError}</h2>
        <p>Run <code>npm run dev</code> inside <code>/server</code>, then reload this page.</p>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="app-loading">
        <div className="spinner" />
        <span>Loading your resume…</span>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Toolbar />
      <main className="app-main">
        <div className="editor-pane">{editorMode === "form" ? <FormEditor /> : <LatexEditor />}</div>
        <PreviewPane />
      </main>
    </div>
  );
}
