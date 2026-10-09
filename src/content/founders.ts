/**
 * Founder profiles. Edit freely — pages render from this file.
 * Only add qualifications, history or links that are true and approved.
 */
export type Founder = {
  id: string;
  name: string;
  role: string;
  focus: string[];
  bio: string;
  photo: string;
  /** Display format, e.g. "+91 98927 65476". */
  phone?: string;
  linkedinUrl?: string;
};

export const founders: Founder[] = [
  {
    id: "aadit",
    name: "Aadit",
    role: "Data, Finance & AI",
    focus: ["Analytics", "Financial thinking", "Intelligent systems"],
    bio: "Focuses on data-driven problem diagnosis, analytical thinking, financial reasoning and identifying where AI can deliver practical value.",
    photo: "/images/founders/aadit.jpeg",
    phone: "+91 88798 22258",
    linkedinUrl: "https://www.linkedin.com/in/aadit-siroya-abab7a2a4/",
  },
  {
    id: "ashmit",
    name: "Ashmit",
    role: "Technology & Engineering",
    focus: ["Software", "Systems architecture", "Deployment"],
    bio: "Leads the technical direction, full-stack development, system architecture and delivery of reliable working solutions.",
    photo: "/images/founders/ashmit.jpeg",
    phone: "+91 98927 65476",
    linkedinUrl: "https://www.linkedin.com/in/ashmit-rawat",
  },
  {
    id: "akshat",
    name: "Akshat",
    role: "Business & Strategy",
    focus: ["Business strategy", "Marketing", "Sales operations"],
    bio: "Focuses on understanding client needs, business strategy, market positioning and turning potential opportunities into client relationships.",
    photo: "/images/founders/akshat.jpeg",
    phone: "+91 84220 45473",
    linkedinUrl: "https://www.linkedin.com/in/akshat-jain-8733762b4/",
  },
];

/** tel: href from a display phone number. */
export function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
