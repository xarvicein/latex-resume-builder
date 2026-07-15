import { ResumeData } from "../types";
import { escapeLatex } from "./classic";

export function generateCompactLatex(data: ResumeData): string {
  const { contact } = data;
  const contactLine = [
    contact.email && `\\href{mailto:${contact.email}}{${escapeLatex(contact.email)}}`,
    contact.phone && escapeLatex(contact.phone),
    contact.location && escapeLatex(contact.location),
    contact.website && `\\href{${contact.website}}{${escapeLatex(contact.website.replace(/^https?:\/\//, ""))}}`,
    contact.linkedin && `\\href{${contact.linkedin}}{LinkedIn}`,
    contact.github && `\\href{${contact.github}}{GitHub}`,
  ]
    .filter(Boolean)
    .join(" $\\cdot$ ");

  const line = (label: string, body: string) => `\\textbf{${label}} -- ${body}`;

  const education = data.education
    .map((e) => `\\item ${line(escapeLatex(e.school), `${escapeLatex(e.degree)}, ${escapeLatex(e.startDate)}--${escapeLatex(e.endDate)}`)}`)
    .join("\n");

  const experience = data.experience
    .map((e) => {
      const bullets = e.bullets.filter(Boolean).map((b) => escapeLatex(b)).join("; ");
      return `\\item \\textbf{${escapeLatex(e.role)}}, ${escapeLatex(e.company)} (${escapeLatex(e.startDate)}--${escapeLatex(e.endDate)}). ${bullets}`;
    })
    .join("\n");

  const projects = data.projects
    .map((p) => {
      const bullets = p.bullets.filter(Boolean).map((b) => escapeLatex(b)).join("; ");
      return `\\item \\textbf{${escapeLatex(p.name)}}${p.tech ? ` (${escapeLatex(p.tech)})` : ""}. ${bullets}`;
    })
    .join("\n");

  const skills = data.skills
    .map((s) => `\\textbf{${escapeLatex(s.category)}:} ${s.items.map(escapeLatex).join(", ")}`)
    .join(" \\quad ");

  const customSections = (data.customSections ?? [])
    .filter((sec) => sec.title.trim())
    .map((sec) => {
      const bullets = sec.bullets.filter(Boolean).map((b) => `\\item ${escapeLatex(b)}`).join("\n");
      return `\\section{${escapeLatex(sec.title)}}\n\\begin{itemize}\n${bullets}\n\\end{itemize}`;
    })
    .join("\n");

  return `%% Auto-generated resume - Compact template
\\documentclass[9.5pt,letterpaper]{article}
\\usepackage[margin=0.5in]{geometry}
\\usepackage[hidelinks]{hyperref}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\titlespacing*{\\section}{0pt}{6pt}{2pt}
\\titleformat{\\section}{\\normalsize\\bfseries\\scshape}{}{0em}{}
\\setlist[itemize]{topsep=1pt,itemsep=0pt,leftmargin=12pt}
\\pagestyle{empty}

\\begin{document}
\\begin{center}
{\\Large\\bfseries ${escapeLatex(contact.fullName)}}\\\\[1pt]
\\footnotesize ${contactLine}
\\end{center}
\\vspace{2pt}

${data.summary ? `\\footnotesize ${escapeLatex(data.summary)}\\vspace{4pt}\n\n` : ""}
${data.experience.length ? `\\section{Experience}\n\\begin{itemize}\n${experience}\n\\end{itemize}` : ""}
${data.projects.length ? `\\section{Projects}\n\\begin{itemize}\n${projects}\n\\end{itemize}` : ""}
${data.education.length ? `\\section{Education}\n\\begin{itemize}\n${education}\n\\end{itemize}` : ""}
${data.skills.length ? `\\section{Skills}\n\\footnotesize ${skills}` : ""}

${customSections}

\\end{document}
`;
}
