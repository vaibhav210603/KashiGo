import { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { RIDE_PAGES } from "@/lib/ridePages";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://kashigo.in";

  const blogPosts = getAllPosts().map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date("2026-10-14"),
      changeFrequency: "weekly" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/guide`,
      lastModified: new Date("2026-05-20"),
      changeFrequency: "monthly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date("2026-10-07"),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/book`,
      lastModified: new Date("2026-10-14"),
      changeFrequency: "weekly" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/scam-cheat-sheet`,
      lastModified: new Date("2026-10-21"),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ebooks`,
      lastModified: new Date("2026-10-14"),
      changeFrequency: "weekly" as const,
      priority: 0.85,
    },
    {
      url: `${baseUrl}/audiobooks`,
      lastModified: new Date("2026-10-14"),
      changeFrequency: "weekly" as const,
      priority: 0.85,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date("2026-06-01"),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date("2026-10-14"),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/india-guide`,
      lastModified: new Date("2026-10-14"),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/india-tour`,
      lastModified: new Date("2026-10-14"),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    ...RIDE_PAGES.map((p) => ({
      url: `${baseUrl}/boat-rides/${p.slug}`,
      lastModified: new Date("2026-10-17"),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...blogPosts,
  ];
}
