export type ProcessStage = {
  number: string;
  title: string;
  description: string;
  /** What the client receives at the end of the stage. */
  deliverable: string;
};

/**
 * The six stages of an engagement. Support (stage 06) is agreed per project —
 * it is offered, not automatically included.
 */
export const processStages: ProcessStage[] = [
  {
    number: "01",
    title: "Discover the challenge",
    description:
      "Understand the business, users, existing workflows, and bottlenecks. Agree on what needs to improve and how success will be assessed.",
    deliverable: "Problem statement and success criteria.",
  },
  {
    number: "02",
    title: "Define the solution",
    description:
      "Compare possible approaches, identify constraints, and establish a realistic scope, priorities, milestones, and estimates.",
    deliverable: "Proposed solution and project roadmap.",
  },
  {
    number: "03",
    title: "Design and validate",
    description:
      "Map out user journeys, workflows, and interfaces. Test important assumptions before committing to the full build.",
    deliverable: "Validated concept, prototype, or solution design.",
  },
  {
    number: "04",
    title: "Build and integrate",
    description:
      "Develop the agreed solution, connect relevant systems and data sources, and review progress against the defined scope.",
    deliverable: "Working software, analytics, or automation.",
  },
  {
    number: "05",
    title: "Test and launch",
    description:
      "Validate functionality, address issues, deploy the solution, and help relevant users adopt it.",
    deliverable: "Tested release and agreed handover documentation.",
  },
  {
    number: "06",
    title: "Support and improve",
    description:
      "Review performance, gather feedback, resolve issues, and identify opportunities for further improvement.",
    deliverable: "Ongoing support or an agreed improvement plan.",
  },
];

export type Faq = { question: string; answer: string };

export const faqs: Faq[] = [
  {
    question: "Do we have to commit to the full process?",
    answer:
      "No. Some clients only need a strategy or assessment; others come to us with a clear build in mind. We agree the scope of each stage before it starts, and you can stop after any of them.",
  },
  {
    question: "How long does a project take?",
    answer:
      "It depends on the problem and the scope, so we don't quote timelines before we understand both. Once we've scoped the work, we'll give you a realistic schedule and tell you early if anything changes it.",
  },
  {
    question: "How is pricing decided?",
    answer:
      "Every engagement is priced through a custom proposal after the discovery stage. We aim to recommend the solution that fits your needs, budget and scale — not the largest one we could build.",
  },
  {
    question: "Will our information be kept confidential?",
    answer:
      "Yes. We treat everything you share as confidential, and we can sign an NDA if your project requires one. Please don't send sensitive documents through the enquiry form; we'll set up a secure way to exchange them once we're working together.",
  },
  {
    question: "Do you provide support after launch?",
    answer:
      "Yes, if you want it. Ongoing support, maintenance and improvements are agreed separately so you only pay for what you need.",
  },
];
