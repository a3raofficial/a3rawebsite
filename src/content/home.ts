/**
 * Homepage copy. The threads carry the story; these lines carry the business
 * case. Detail lives on Services, Process and Case studies — link, don't repeat.
 */
export const hero = {
  eyebrow: "Strategy × Technology × Execution",
  title: "Big problems deserve better solutions.",
  body: "A strategy-led technology consultancy for startups and growing businesses. We find the problem, build the solution, and make it work.",
};

/** The autoplay intro, in three steps the visitor can follow. */
export const introSteps = ["The tangle", "Untangled", "Woven into A3RA"];

export const disciplinesSection = {
  eyebrow: "01 — What we bring",
  title: "Three disciplines. One team. Real business progress.",
  body: "A3RA brings business strategy, data and AI, and software engineering together to solve operational challenges, improve decision-making, and build digital products that deliver value.",
  closingLine: "Less manual work. Better decisions. Software that moves your business forward.",
  cta: { label: "Explore our capabilities", href: "/services" },
};

/**
 * Colours match the three thread bundles: gold (strategy), white (data & AI),
 * blue (engineering). Hovering a row lights its bundle.
 */
export const disciplines = [
  {
    name: "Strategy",
    tagline: "Decide what is worth building.",
    description:
      "Identify business bottlenecks, evaluate opportunities, and turn complex challenges into clear priorities and actionable roadmaps.",
    href: "/services#strategy",
    accent: "gold",
  },
  {
    name: "Data & AI",
    tagline: "Turn information into better decisions.",
    description:
      "Transform business data into useful insights, predictive models, intelligent automation, and AI-powered workflows.",
    href: "/services#data-ai",
    accent: "ink",
  },
  {
    name: "Engineering",
    tagline: "Build solutions your business can rely on.",
    description:
      "Design, develop, integrate, and maintain software that fits your workflows and supports your business as it grows.",
    href: "/services#engineering",
    accent: "blue",
  },
] as const;

export const approachSection = {
  eyebrow: "02 — How we work",
  title: "From the first question to a solution that works.",
  body: [
    "Every engagement starts with understanding the business problem—not assuming the technology comes first.",
    "We work through discovery, planning, design, development, and launch with clear priorities, agreed deliverables, and regular communication.",
  ],
  reassurance: ["Clear scope", "Defined milestones", "Regular updates", "Transparent handover"],
  cta: { label: "See how we work", href: "/process" },
};

export const closing = {
  title: "Have a business problem worth solving?",
  body: [
    "Something slowing your team down? Too much manual work? Data that isn't helping you make decisions? A product idea that needs to become reality?",
    "Tell us what you're trying to solve. We'll help you explore the problem, identify practical next steps, and determine whether A3RA is the right partner.",
  ],
  primaryCta: "Discuss your project",
  note: "You don't need a technical specification to get the conversation started.",
};
