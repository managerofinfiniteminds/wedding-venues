import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/audit/", "/data/"],
      },
    ],
    sitemap: "https://greenbowtie.com/sitemap.xml",
    host: "https://greenbowtie.com",
  };
}
