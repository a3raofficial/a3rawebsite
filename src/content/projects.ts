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

export const projectCategories = [
  {
    title: "Digital product development",
    description: "Websites, web applications and MVPs built from a clear problem definition.",
  },
  {
    title: "AI and data systems",
    description: "Practical AI features, agents and data workflows where they create real value.",
  },
  {
    title: "Business process optimization",
    description: "Automation and system improvements that remove recurring manual work.",
  },
];

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
