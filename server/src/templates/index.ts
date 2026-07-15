import { ResumeData, TemplateId } from "../types";
import { generateClassicLatex } from "./classic";
import { generateModernLatex } from "./modern";
import { generateCompactLatex } from "./compact";

export const generators: Record<TemplateId, (data: ResumeData) => string> = {
  classic: generateClassicLatex,
  modern: generateModernLatex,
  compact: generateCompactLatex,
};

export const templateMeta: { id: TemplateId; name: string; description: string }[] = [
  { id: "classic", name: "Classic", description: "Timeless serif layout, the most common ATS-friendly resume style." },
  { id: "modern", name: "Modern", description: "Sans-serif with a color accent, good for design/product roles." },
  { id: "compact", name: "Compact", description: "Dense single-column layout to fit more on one page." },
];

export const sampleResumeData: ResumeData = {
  contact: {
    fullName: "Jordan Rivera",
    title: "Software Engineer",
    email: "jordan.rivera@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    website: "https://jordanrivera.dev",
    linkedin: "https://linkedin.com/in/jordanrivera",
    github: "https://github.com/jordanrivera",
  },
  summary:
    "Full-stack engineer with 5+ years building web applications used by millions of users. Passionate about clean architecture and developer tooling.",
  education: [
    {
      id: "edu1",
      school: "University of California, Berkeley",
      degree: "B.S. in Computer Science",
      location: "Berkeley, CA",
      startDate: "Aug 2016",
      endDate: "May 2020",
      details: ["GPA: 3.8/4.0", "Relevant coursework: Algorithms, Distributed Systems, Databases"],
    },
  ],
  experience: [
    {
      id: "exp1",
      company: "Acme Corp",
      role: "Senior Software Engineer",
      location: "San Francisco, CA",
      startDate: "Jun 2022",
      endDate: "Present",
      bullets: [
        "Led migration of monolith to microservices, reducing deploy time by 60%",
        "Built internal design system used across 12 product teams",
        "Mentored 4 junior engineers through structured 1:1 program",
      ],
    },
    {
      id: "exp2",
      company: "Startup Inc",
      role: "Software Engineer",
      location: "Remote",
      startDate: "Jul 2020",
      endDate: "May 2022",
      bullets: [
        "Shipped core checkout flow handling $2M+ in monthly transactions",
        "Reduced API latency p95 from 800ms to 220ms via caching layer",
      ],
    },
  ],
  projects: [
    {
      id: "proj1",
      name: "OpenTasks",
      tech: "React, Node.js, PostgreSQL",
      link: "https://github.com/jordanrivera/opentasks",
      bullets: ["Open-source task manager with 1.2k GitHub stars", "Implemented real-time sync via WebSockets"],
    },
  ],
  skills: [
    { id: "skill1", category: "Languages", items: ["TypeScript", "Python", "Go"] },
    { id: "skill2", category: "Frameworks", items: ["React", "Express", "Django"] },
    { id: "skill3", category: "Tools", items: ["Docker", "PostgreSQL", "AWS"] },
  ],
};
