import type { MetadataRoute } from "next";
import { site } from "@/content/site";

const routes = ["", "/services", "/process", "/projects", "/about", "/contact", "/contact/book", "/privacy"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((path) => ({
    url: `${site.url}${path}`,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : path === "/privacy" ? 0.3 : 0.7,
  }));
}
