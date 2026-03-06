import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/audit/"],
      },
    ],
    sitemap: "https://greenbowtie.com/sitemap.xml",
    host: "https://greenbowtie.com",
  };
}
