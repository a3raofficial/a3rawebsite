import type { Metadata } from "next";
import { Story } from "@/components/home/Story";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return <Story />;
}
