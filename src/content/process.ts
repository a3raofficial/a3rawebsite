export type ProcessStage = {
  number: string;
  /** Short label used on the homepage overview. */
  short: string;
  title: string;
  description: string;
  /** What the client can expect during this stage (Process page). */
  expect: string[];
};

export const processStages: ProcessStage[] = [
  {
    number: "01",
    short: "Discover",
    title: "Discover",
    description:
      "Understand the business, the problem, current workflows, constraints and desired outcomes.",
    expect: [
      "An introductory conversation with the founders",
      "Questions about how things work today, not just what you want built",
      "No obligation to continue",
    ],
  },
  {
    number: "02",
    short: "Strategize",
    title: "Diagnose & strategize",
    description:
      "Identify root causes, evaluate options, prioritize opportunities and agree on a practical direction.",
    expect: [
      "A clear view of the underlying problem",
      "Options compared on value, cost and effort",
      "An agreed scope before any build work starts",
    ],
  },
  {
    number: "03",
    short: "Build",
    title: "Design & build",
    description:
      "Design the user experience and develop the appropriate software, AI system or optimized workflow.",
    expect: [
      "Regular check-ins and working previews",
      "Decisions explained in plain language",
      "Scope changes discussed before they happen",
    ],
  },
  {
    number: "04",
    short: "Deploy",
    title: "Deploy & validate",
    description:
      "Test the solution, deploy it, and validate it against the agreed requirements.",
    expect: [
      "Testing against the requirements we agreed",
      "A managed release into your environment",
      "Handover of access, documentation and ownership",
    ],
  },
  {
    number: "05",
    short: "Evolve",
    title: "Evolve",
    description:
      "Provide agreed support, monitor outcomes and identify further improvements.",
    expect: [
      "Support on terms agreed up front",
      "A look at what is working and what is not",
      "Recommendations for the next improvement, if any",
    ],
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
