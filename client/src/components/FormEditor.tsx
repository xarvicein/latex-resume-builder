import { useEffect, useRef } from "react";
import { useResumeStore } from "../store/useResumeStore";

/** Debounce helper: regenerate LaTeX from structured data shortly after the user stops typing. */
function useAutoRegenerate() {
  const resume = useResumeStore((s) => s.resume);
  const regenerateLatexFromData = useResumeStore(
    (s) => s.regenerateLatexFromData,
  );
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!resume || resume.isCustomLatex) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => regenerateLatexFromData(), 400);
    return () => clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resume?.data, resume?.templateId]);
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}

function BulletList({
  bullets,
  onChange,
}: {
  bullets: string[];
  onChange: (bullets: string[]) => void;
}) {
  return (
    <div className="bullet-list">
      {bullets.map((b, i) => (
        <div key={i} className="bullet-row">
          <input
            value={b}
            placeholder="Describe an accomplishment…"
            onChange={(e) => {
              const next = [...bullets];
              next[i] = e.target.value;
              onChange(next);
            }}
          />
          <button
            type="button"
            className="icon-btn"
            title="Remove bullet"
            onClick={() => onChange(bullets.filter((_, idx) => idx !== i))}
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        className="link-btn"
        onClick={() => onChange([...bullets, ""])}
      >
        + Add bullet
      </button>
    </div>
  );
}

export default function FormEditor() {
  useAutoRegenerate();

  const addCustomSection = useResumeStore((s) => s.addCustomSection);
  const updateCustomSection = useResumeStore((s) => s.updateCustomSection);
  const removeCustomSection = useResumeStore((s) => s.removeCustomSection);

  const resume = useResumeStore((s) => s.resume);
  const updateContact = useResumeStore((s) => s.updateContact);
  const updateSummary = useResumeStore((s) => s.updateSummary);

  const addEducation = useResumeStore((s) => s.addEducation);
  const updateEducation = useResumeStore((s) => s.updateEducation);
  const removeEducation = useResumeStore((s) => s.removeEducation);

  const addExperience = useResumeStore((s) => s.addExperience);
  const updateExperience = useResumeStore((s) => s.updateExperience);
  const removeExperience = useResumeStore((s) => s.removeExperience);

  const addProject = useResumeStore((s) => s.addProject);
  const updateProject = useResumeStore((s) => s.updateProject);
  const removeProject = useResumeStore((s) => s.removeProject);

  const addSkillGroup = useResumeStore((s) => s.addSkillGroup);
  const updateSkillGroup = useResumeStore((s) => s.updateSkillGroup);
  const removeSkillGroup = useResumeStore((s) => s.removeSkillGroup);

  if (!resume) return null;
  const { data } = resume;

  return (
    <div className="form-editor">
      <section className="form-section">
        <h3>Contact</h3>
        <div className="field-grid">
          <Field label="Full name">
            <input
              value={data.contact.fullName}
              onChange={(e) => updateContact({ fullName: e.target.value })}
            />
          </Field>
          <Field label="Title / headline">
            <input
              value={data.contact.title ?? ""}
              onChange={(e) => updateContact({ title: e.target.value })}
            />
          </Field>
          <Field label="Email">
            <input
              value={data.contact.email}
              onChange={(e) => updateContact({ email: e.target.value })}
            />
          </Field>
          <Field label="Phone">
            <input
              value={data.contact.phone ?? ""}
              onChange={(e) => updateContact({ phone: e.target.value })}
            />
          </Field>
          <Field label="Location">
            <input
              value={data.contact.location ?? ""}
              onChange={(e) => updateContact({ location: e.target.value })}
            />
          </Field>
          <Field label="Website">
            <input
              value={data.contact.website ?? ""}
              onChange={(e) => updateContact({ website: e.target.value })}
            />
          </Field>
          <Field label="LinkedIn URL">
            <input
              value={data.contact.linkedin ?? ""}
              onChange={(e) => updateContact({ linkedin: e.target.value })}
            />
          </Field>
          <Field label="GitHub URL">
            <input
              value={data.contact.github ?? ""}
              onChange={(e) => updateContact({ github: e.target.value })}
            />
          </Field>
        </div>
      </section>

      <section className="form-section">
        <h3>Summary</h3>
        <textarea
          rows={3}
          value={data.summary ?? ""}
          placeholder="One or two sentences about you…"
          onChange={(e) => updateSummary(e.target.value)}
        />
      </section>

      <section className="form-section">
        <div className="section-header">
          <h3>Skills</h3>
          <button className="link-btn" onClick={addSkillGroup}>
            + Add group
          </button>
        </div>
        {data.skills.map((sk) => (
          <div key={sk.id} className="entry-card">
            <div className="entry-header">
              <div className="field-grid two-col">
                <Field label="Category">
                  <input
                    value={sk.category}
                    onChange={(e) =>
                      updateSkillGroup(sk.id, { category: e.target.value })
                    }
                  />
                </Field>
                <Field label="Items (comma separated)">
                  <input
                    value={sk.items.join(", ")}
                    onChange={(e) =>
                      updateSkillGroup(sk.id, {
                        items: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </Field>
              </div>
              <button
                className="icon-btn"
                title="Remove skill group"
                onClick={() => removeSkillGroup(sk.id)}
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </section>

      <section className="form-section">
        <div className="section-header">
          <h3>Experience</h3>
          <button className="link-btn" onClick={addExperience}>
            + Add
          </button>
        </div>
        {data.experience.map((exp) => (
          <div key={exp.id} className="entry-card">
            <div className="entry-header">
              <div className="field-grid two-col">
                <Field label="Role">
                  <input
                    value={exp.role}
                    onChange={(e) =>
                      updateExperience(exp.id, { role: e.target.value })
                    }
                  />
                </Field>
                <Field label="Company">
                  <input
                    value={exp.company}
                    onChange={(e) =>
                      updateExperience(exp.id, { company: e.target.value })
                    }
                  />
                </Field>
                <Field label="Location">
                  <input
                    value={exp.location ?? ""}
                    onChange={(e) =>
                      updateExperience(exp.id, { location: e.target.value })
                    }
                  />
                </Field>
                <Field label="Start — End">
                  <div className="date-row">
                    <input
                      value={exp.startDate}
                      onChange={(e) =>
                        updateExperience(exp.id, { startDate: e.target.value })
                      }
                      placeholder="Jun 2022"
                    />
                    <input
                      value={exp.endDate}
                      onChange={(e) =>
                        updateExperience(exp.id, { endDate: e.target.value })
                      }
                      placeholder="Present"
                    />
                  </div>
                </Field>
              </div>
              <button
                className="icon-btn"
                title="Remove experience"
                onClick={() => removeExperience(exp.id)}
              >
                ×
              </button>
            </div>
            <BulletList
              bullets={exp.bullets}
              onChange={(bullets) => updateExperience(exp.id, { bullets })}
            />
          </div>
        ))}
      </section>

      <section className="form-section">
        <div className="section-header">
          <h3>Projects</h3>
          <button className="link-btn" onClick={addProject}>
            + Add
          </button>
        </div>
        {data.projects.map((p) => (
          <div key={p.id} className="entry-card">
            <div className="entry-header">
              <div className="field-grid two-col">
                <Field label="Project name">
                  <input
                    value={p.name}
                    onChange={(e) =>
                      updateProject(p.id, { name: e.target.value })
                    }
                  />
                </Field>
                <Field label="Tech stack">
                  <input
                    value={p.tech ?? ""}
                    onChange={(e) =>
                      updateProject(p.id, { tech: e.target.value })
                    }
                  />
                </Field>
                <Field label="Link">
                  <input
                    value={p.link ?? ""}
                    onChange={(e) =>
                      updateProject(p.id, { link: e.target.value })
                    }
                  />
                </Field>
              </div>
              <button
                className="icon-btn"
                title="Remove project"
                onClick={() => removeProject(p.id)}
              >
                ×
              </button>
            </div>
            <BulletList
              bullets={p.bullets}
              onChange={(bullets) => updateProject(p.id, { bullets })}
            />
          </div>
        ))}
      </section>

      <section className="form-section">
        <div className="section-header">
          <h3>Education</h3>
          <button className="link-btn" onClick={addEducation}>
            + Add
          </button>
        </div>
        {data.education.map((edu) => (
          <div key={edu.id} className="entry-card">
            <div className="entry-header">
              <div className="field-grid two-col">
                <Field label="School">
                  <input
                    value={edu.school}
                    onChange={(e) =>
                      updateEducation(edu.id, { school: e.target.value })
                    }
                  />
                </Field>
                <Field label="Degree">
                  <input
                    value={edu.degree}
                    onChange={(e) =>
                      updateEducation(edu.id, { degree: e.target.value })
                    }
                  />
                </Field>
                <Field label="Location">
                  <input
                    value={edu.location ?? ""}
                    onChange={(e) =>
                      updateEducation(edu.id, { location: e.target.value })
                    }
                  />
                </Field>
                <Field label="Start — End">
                  <div className="date-row">
                    <input
                      value={edu.startDate}
                      onChange={(e) =>
                        updateEducation(edu.id, { startDate: e.target.value })
                      }
                      placeholder="Aug 2016"
                    />
                    <input
                      value={edu.endDate}
                      onChange={(e) =>
                        updateEducation(edu.id, { endDate: e.target.value })
                      }
                      placeholder="May 2020"
                    />
                  </div>
                </Field>
              </div>
              <button
                className="icon-btn"
                title="Remove education"
                onClick={() => removeEducation(edu.id)}
              >
                ×
              </button>
            </div>
            <BulletList
              bullets={edu.details ?? []}
              onChange={(details) => updateEducation(edu.id, { details })}
            />
          </div>
        ))}
      </section>

      <section className="form-section">
        <div className="section-header">
          <h3>Additional Sections</h3>
          <button className="link-btn" onClick={addCustomSection}>
            + Add section
          </button>
        </div>
        {data.customSections.map((sec) => (
          <div key={sec.id} className="entry-card">
            <div className="entry-header">
              <div className="field-grid">
                <Field label="Section title (e.g. Achievements, Languages, Certifications, Awards & Recognition)">
                  <input
                    value={sec.title}
                    onChange={(e) =>
                      updateCustomSection(sec.id, { title: e.target.value })
                    }
                  />
                </Field>
              </div>
              <button
                className="icon-btn"
                title="Remove section"
                onClick={() => removeCustomSection(sec.id)}
              >
                ×
              </button>
            </div>
            <BulletList
              bullets={sec.bullets}
              onChange={(bullets) => updateCustomSection(sec.id, { bullets })}
            />
          </div>
        ))}
      </section>
    </div>
  );
}
