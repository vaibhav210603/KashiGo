import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/_next/",
          "/api/payment/",
          "/api/webhook/",
        ],
      },
    ],
    sitemap: "https://kashigo.in/sitemap.xml",
  };
}
