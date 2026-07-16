import { ResumeData } from "../types";

// Escape characters that are special in LaTeX so user-entered text is always safe to compile.
export function escapeLatex(input: string | undefined | null): string {
  if (!input) return "";
  return input
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

function joinContactLine(data: ResumeData): string {
  const parts: string[] = [];
  const c = data.contact;
  if (c.location) parts.push(escapeLatex(c.location));
  if (c.email) parts.push(`\\href{mailto:${c.email}}{${escapeLatex(c.email)}}`);
  if (c.phone) parts.push(escapeLatex(c.phone));
  if (c.website)
    parts.push(
      `\\href{${c.website}}{${escapeLatex(c.website.replace(/^https?:\/\//, ""))}}`,
    );
  if (c.linkedin) parts.push(`\\href{${c.linkedin}}{LinkedIn}`);
  if (c.github) parts.push(`\\href{${c.github}}{GitHub}`);
  return parts.join(" \\;|\\; ");
}

export function generateClassicLatex(data: ResumeData): string {
  const { contact } = data;

  const educationBlock = data.education
    .map((e) => {
      const details = (e.details ?? [])
        .filter(Boolean)
        .map((d) => `    \\item ${escapeLatex(d)}`)
        .join("\n");
      return `\\resumeSubheading
  {${escapeLatex(e.school)}}{${escapeLatex(e.location ?? "")}}
  {${escapeLatex(e.degree)}}{${escapeLatex(e.startDate)} -- ${escapeLatex(e.endDate)}}
${details ? `  \\resumeItemListStart\n${details}\n  \\resumeItemListEnd` : ""}`;
    })
    .join("\n");

  const experienceBlock = data.experience
    .map((e) => {
      const bullets = e.bullets
        .filter(Boolean)
        .map((b) => `    \\item ${escapeLatex(b)}`)
        .join("\n");
      return `\\resumeSubheading
  {${escapeLatex(e.role)}}{${escapeLatex(e.startDate)} -- ${escapeLatex(e.endDate)}}
  {${escapeLatex(e.company)}}{${escapeLatex(e.location ?? "")}}
${bullets ? `  \\resumeItemListStart\n${bullets}\n  \\resumeItemListEnd` : ""}`;
    })
    .join("\n");

  const projectsBlock = data.projects
    .map((p) => {
      const bullets = p.bullets
        .filter(Boolean)
        .map((b) => `    \\item ${escapeLatex(b)}`)
        .join("\n");
      const header = p.tech
        ? `${escapeLatex(p.name)} $|$ \\emph{${escapeLatex(p.tech)}}`
        : escapeLatex(p.name);
      return `\\resumeProjectHeading
  {\\textbf{${header}}}{${p.link ? `\\href{${p.link}}{link}` : ""}}
${bullets ? `  \\resumeItemListStart\n${bullets}\n  \\resumeItemListEnd` : ""}`;
    })
    .join("\n");

  const skillsBlock = data.skills
    .map(
      (s) =>
        `  \\textbf{${escapeLatex(s.category)}}{: ${s.items.map(escapeLatex).join(", ")}}`,
    )
    .join(" \\\\\n");

  const customSectionsBlock = (data.customSections ?? [])
    .filter((sec) => sec.title.trim())
    .map((sec) => {
      const bullets = sec.bullets
        .filter(Boolean)
        .map((b) => `  \\item ${escapeLatex(b)}`)
        .join("\n");
      return `\\section{${escapeLatex(sec.title)}}
${bullets ? `\\resumeItemListStart\n${bullets}\n\\resumeItemListEnd` : ""}`;
    })
    .join("\n\n");

  return `%% Auto-generated resume - Classic template
%% You can edit this LaTeX directly; it will stop auto-syncing with the form.
\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage{iftex}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\usepackage{ragged2e}
\\usepackage{microtype}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-0.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\ifPDFTeX
\\input{glyphtounicode}
\\pdfgentounicode=1
\\fi

\\titleformat{\\section}{\\vspace{-4pt}\\scshape\\raggedright\\large}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

\\newcommand{\\resumeItem}[1]{\\item\\small{#1 \\vspace{-2pt}}}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubSubheading}[2]{
    \\item
    \\begin{tabular*}{\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textit{\\small#1} & \\textit{\\small #2} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & #2 \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}

\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}[leftmargin=0.15in, itemsep=0pt, parsep=0pt, topsep=0pt, partopsep=0pt]}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

\\begin{document}

\\begin{center}
  \\textbf{\\Huge \\scshape ${escapeLatex(contact.fullName)}} \\\\ \\vspace{2pt}
  ${contact.title ? `\\textbf{\\large ${escapeLatex(contact.title)}} \\\\ \\vspace{2pt}` : ""}
  \\small ${joinContactLine(data)}
\\end{center}

${data.summary ? `\\section*{Summary}\n\\justifying\\small{${escapeLatex(data.summary)}}\n\\raggedright\n\\vspace{-6pt}` : ""}

${
  data.skills.length
    ? `\\section{Technical Skills}
 \\begin{itemize}[leftmargin=0in, label={}, itemsep=0pt, parsep=0pt, topsep=0pt, partopsep=0pt]
  \\small{\\item{
${skillsBlock}
  }}
 \\end{itemize}
  \\vspace{-6pt}`
    : ""
}

${
  data.experience.length
    ? `\\section{Experience}
\\resumeSubHeadingListStart
${experienceBlock}
\\resumeSubHeadingListEnd
\\vspace{-6pt}`
    : ""
}

${
  data.projects.length
    ? `\\section{Projects}
\\resumeSubHeadingListStart
${projectsBlock}
\\resumeSubHeadingListEnd
\\vspace{-6pt}`
    : ""
}

${
  data.education.length
    ? `\\section{Education}
\\resumeSubHeadingListStart
${educationBlock}
\\resumeSubHeadingListEnd
\\vspace{-6pt}`
    : ""
}

${customSectionsBlock ? `${customSectionsBlock}\n\\vspace{-6pt}` : ""}

\\end{document}
`;
}
