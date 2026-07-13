import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://www.os.diwakaryadav.com.np/",
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
