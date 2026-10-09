export type Service = {
  id: string;
  number: string;
  title: string;
  /** One-line audience framing. */
  forWho: string;
  summary: string;
  /** The business problem this pillar addresses. */
  problem: string;
  useCases: string[];
  deliverables: string[];
};

export const services: Service[] = [
  {
    id: "strategy",
    number: "01",
    title: "Strategy & Intelligence",
    forWho: "For businesses asking what to build or improve.",
    summary:
      "We help you find where technology, data and AI can create real value — and decide what is worth building before anything gets built.",
    problem:
      "You know something needs to change, but not exactly what. Options multiply, AI is everywhere, and committing budget to the wrong solution is expensive.",
    useCases: [
      "Evaluating whether AI fits a specific workflow",
      "Understanding where time or money is being lost",
      "Choosing between building, buying or changing a process",
      "Planning a new product or system before development",
    ],
    deliverables: [
      "AI strategy and opportunity assessment",
      "Data-driven business analysis",
      "Process and cost optimization recommendations",
      "Technical roadmap and solution architecture",
    ],
  },
  {
    id: "engineering",
    number: "02",
    title: "Digital Products & Engineering",
    forWho: "For businesses ready to turn ideas into working products.",
    summary:
      "We design and build the software that solves the problem — websites, web applications, AI-powered tools and the systems behind them.",
    problem:
      "You have a clear idea or a validated need, and you need a team that can take it from first version to a dependable, deployed product.",
    useCases: [
      "Launching an MVP to test a product idea",
      "Building a custom website or web application",
      "Adding AI features or agents to an existing workflow",
      "Connecting systems through APIs and integrations",
    ],
    deliverables: [
      "Custom websites and web applications",
      "AI-powered applications and agents",
      "Product prototypes and MVPs",
      "API integrations, backend systems and deployment",
    ],
  },
  {
    id: "optimization",
    number: "03",
    title: "Optimization & Partnership",
    forWho: "For businesses looking to improve systems that already exist.",
    summary:
      "We find the bottlenecks in how work gets done today, then automate, streamline and keep improving what is already in place.",
    problem:
      "Your systems work, but slowly. Manual steps, disconnected tools and workarounds cost time every week and make growth harder.",
    useCases: [
      "Automating repetitive manual workflows",
      "Identifying and removing operational bottlenecks",
      "Improving an existing application or internal tool",
      "Ongoing technical support after launch",
    ],
    deliverables: [
      "Workflow automation",
      "Operational bottleneck analysis",
      "System and process optimization",
      "Ongoing technical support and product evolution",
    ],
  },
];
