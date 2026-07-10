import type { MetadataRoute } from "next";

const routes = [
  "",
  "/signin",
  "/signup",
  "/dashboard",
  "/jobs",
  "/applications",
  "/interviews",
  "/profile",
  "/saved",
  "/settings",
  "/outcomes"
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://ai-job-search.example.com").replace(/\/$/, "");
  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: route === "" ? "weekly" : "daily",
    priority: route === "" ? 1 : route === "/dashboard" ? 0.9 : 0.7
  }));
}
