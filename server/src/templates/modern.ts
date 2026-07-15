import { ResumeData } from "../types";
import { escapeLatex } from "./classic";

export function generateModernLatex(data: ResumeData): string {
  const { contact } = data;

  const contactLine = [
    contact.location && escapeLatex(contact.location),
    contact.email && `\\href{mailto:${contact.email}}{${escapeLatex(contact.email)}}`,
    contact.phone && escapeLatex(contact.phone),
    contact.website && `\\href{${contact.website}}{${escapeLatex(contact.website.replace(/^https?:\/\//, ""))}}`,
    contact.linkedin && `\\href{${contact.linkedin}}{LinkedIn}`,
    contact.github && `\\href{${contact.github}}{GitHub}`,
  ]
    .filter(Boolean)
    .join(" \\quad $\\vert$ \\quad ");

  const section = (title: string, body: string) =>
    body.trim()
      ? `{\\color{accent}\\Large\\bfseries ${title}}\\\\[-4pt]\n{\\color{accent}\\rule{\\linewidth}{1.2pt}}\\\\[6pt]\n${body}\n\\vspace{8pt}\n`
      : "";

  const education = data.education
    .map(
      (e) => `\\textbf{${escapeLatex(e.school)}} \\hfill ${escapeLatex(e.startDate)} -- ${escapeLatex(e.endDate)}\\\\
\\textit{${escapeLatex(e.degree)}} \\hfill ${escapeLatex(e.location ?? "")}\\\\[4pt]`
    )
    .join("\n");

  const experience = data.experience
    .map((e) => {
      const bullets = e.bullets.filter(Boolean).map((b) => `  \\item ${escapeLatex(b)}`).join("\n");
      return `\\textbf{${escapeLatex(e.role)}}, ${escapeLatex(e.company)} \\hfill ${escapeLatex(e.startDate)} -- ${escapeLatex(e.endDate)}\\\\
${e.location ? `\\textit{${escapeLatex(e.location)}}\\\\[2pt]` : ""}
${bullets ? `\\begin{itemize}[topsep=2pt,itemsep=1pt,leftmargin=16pt]\n${bullets}\n\\end{itemize}` : ""}
\\vspace{4pt}`;
    })
    .join("\n");

  const projects = data.projects
    .map((p) => {
      const bullets = p.bullets.filter(Boolean).map((b) => `  \\item ${escapeLatex(b)}`).join("\n");
      return `\\textbf{${escapeLatex(p.name)}}${p.tech ? ` \\textit{(${escapeLatex(p.tech)})}` : ""}${p.link ? ` \\hfill \\href{${p.link}}{link}` : ""}\\\\
${bullets ? `\\begin{itemize}[topsep=2pt,itemsep=1pt,leftmargin=16pt]\n${bullets}\n\\end{itemize}` : ""}
\\vspace{4pt}`;
    })
    .join("\n");

  const skills = data.skills
    .map((s) => `\\textbf{${escapeLatex(s.category)}:} ${s.items.map(escapeLatex).join(", ")}\\\\[2pt]`)
    .join("\n");

  return `%% Auto-generated resume - Modern template
\\documentclass[10.5pt,letterpaper]{article}
\\usepackage[margin=0.75in]{geometry}
\\usepackage{xcolor}
\\usepackage[hidelinks]{hyperref}
\\usepackage{enumitem}
\\usepackage{parskip}
\\usepackage{helvet}
\\renewcommand{\\familydefault}{\\sfdefault}
\\definecolor{accent}{HTML}{2454B0}
\\setlength{\\parindent}{0pt}
\\pagestyle{empty}

\\begin{document}

{\\color{accent}\\fontsize{28}{28}\\selectfont\\bfseries ${escapeLatex(contact.fullName)}}\\\\[2pt]
${contact.title ? `{\\large ${escapeLatex(contact.title)}}\\\\[4pt]` : ""}
\\small ${contactLine}
\\vspace{10pt}

${data.summary ? `\\normalsize ${escapeLatex(data.summary)}\\vspace{10pt}\n\n` : ""}
${section("Experience", experience)}
${section("Projects", projects)}
${section("Education", education)}
${section("Skills", skills)}

\\end{document}
`;
}
