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

/** The structure every published case study follows. */
export const caseStudyStructure = [
  { title: "Context", description: "Who the client is, where disclosure is approved." },
  { title: "Problem", description: "What needed to improve or be built." },
  { title: "Diagnosis", description: "How we approached and understood the problem." },
  { title: "Solution", description: "What was designed and implemented." },
  { title: "Technology", description: "The tools used, where relevant." },
  { title: "Outcome", description: "Verified results, or a transparent account of what was delivered." },
];

export const projects: Project[] = [];
