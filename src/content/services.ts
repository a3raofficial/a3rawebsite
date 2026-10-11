/**
 * The three disciplines. The homepage owns each discipline's one-paragraph
 * description (src/content/home.ts); this file owns the detail shown on
 * /services. Only list work the founders can genuinely deliver.
 */
export type Service = {
  id: "strategy" | "data-ai" | "engineering";
  number: string;
  title: string;
  /** Short positioning line, shared with the homepage as the discipline's label. */
  tagline: string;
  /** Matches the discipline's thread colour: gold, white (ink) or blue. */
  accent: "gold" | "ink" | "blue";
  /** The business problem this discipline addresses. */
  problem: string;
  /** Situations where clients typically bring us in. */
  useCases: string[];
  /** What an engagement can include — scoped per project, not a fixed package. */
  offerings: string[];
};

export const services: Service[] = [
  {
    id: "strategy",
    number: "01",
    title: "Strategy",
    tagline: "Decide what is worth building.",
    accent: "gold",
    problem:
      "You know something needs to change, but not exactly what — or which option is worth the investment. Committing budget to the wrong solution is expensive.",
    useCases: [
      "Working out where time or money is being lost",
      "Choosing between building, buying or changing a process",
      "Planning a new product or system before development",
      "Turning a broad idea into a scoped first release",
    ],
    offerings: [
      "Business process analysis",
      "Product and digital strategy",
      "Requirements gathering",
      "Feasibility analysis",
      "Workflow analysis",
      "Digital transformation roadmaps",
      "Project planning",
    ],
  },
  {
    id: "data-ai",
    number: "02",
    title: "Data & AI",
    tagline: "Turn information into better decisions.",
    accent: "ink",
    problem:
      "Your data sits in spreadsheets, tools and systems, but it isn't helping you decide faster or work smarter. AI looks promising, but it's unclear where it would genuinely help.",
    useCases: [
      "Reports that take hours to assemble by hand",
      "Deciding whether AI fits a specific workflow",
      "Forecasting demand, sales or workload",
      "Repetitive decisions that follow clear rules",
    ],
    offerings: [
      "Business intelligence and analytics",
      "Interactive dashboards",
      "Forecasting and predictive analytics",
      "Machine learning solutions",
      "AI assistants and recommendation systems",
      "Intelligent workflow automation",
      "Data pipeline development",
    ],
  },
  {
    id: "engineering",
    number: "03",
    title: "Engineering",
    tagline: "Build solutions your business can rely on.",
    accent: "blue",
    problem:
      "Your team works around tools that don't fit, or an idea needs to become dependable software that connects to the systems you already use.",
    useCases: [
      "Launching an MVP or an internal tool",
      "Replacing spreadsheets with a purpose-built application",
      "Connecting a CRM, payments or other business systems",
      "Keeping an existing application running and improving",
    ],
    offerings: [
      "Custom web applications",
      "Internal business tools",
      "API and software integrations",
      "CRM and business system integrations",
      "Backend development",
      "Database and application development",
      "Deployment and maintenance",
    ],
  },
];
