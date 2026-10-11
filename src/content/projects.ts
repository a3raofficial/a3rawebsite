/**
 * Portfolio entries. Intentionally empty until real, approved work can be
 * published. Never add fabricated clients, screenshots or results.
 */
export type ProjectStatus = "client" | "in-progress" | "independent" | "concept";

export type Project = {
  id: string;
  title: string;
  status: ProjectStatus;
  category: string;
  context: string;
  problem: string;
  diagnosis: string;
  solution: string;
  technology: string[];
  /** Verified results, or a transparent description of deliverables. */
  outcome: string;
  image?: string;
};

export const projectStatusLabel: Record<ProjectStatus, string> = {
  client: "Client work",
  "in-progress": "Work in progress",
  independent: "Independent project",
  concept: "Conceptual example",
};

/** The structure every published case study follows (a framework, not a list of projects). */
export const caseStudyStructure = [
  {
    title: "Client & Context",
    description:
      "Who the business serves, its operating environment, and the context behind the engagement. Share the client name only when disclosure is approved.",
  },
  {
    title: "Business Challenge",
    description: "The problem, who it affected, why it mattered, and what needed to change.",
  },
  {
    title: "Diagnosis & Approach",
    description:
      "How we investigated the problem, evaluated possible approaches, and identified the right priorities.",
  },
  {
    title: "Solution Delivered",
    description:
      "What we designed, developed, automated, or integrated—and how it addressed the original challenge.",
  },
  {
    title: "Technology & Integration",
    description:
      "The relevant tools, architecture, data sources, and integrations, explained in the context of the business need.",
  },
  {
    title: "Results & Outcomes",
    description:
      "The impact of the work, supported by verified metrics, documented observations, or a transparent account of what was delivered.",
  },
];

export const projects: Project[] = [];
