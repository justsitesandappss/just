import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.justagency-inc.com"
  const now = new Date()

  return [
    // 🥇 Pages principales
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/just`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/just-agency`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/just-impact`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },

    // 🧩 Sections
    { url: `${baseUrl}/nos-talents`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/media`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/podcast`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/nosponsors`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },

    // 👤 Talents 
    { url: `${baseUrl}/nos-talents/karim-lipton`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/nos-talents/riles-freestyle`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/nos-talents/moumlame`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/nos-talents/romain-benn`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/nos-talents/kimo-djz`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/nos-talents/ines-hmz`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/nos-talents/naoil-kohlanta`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/nos-talents/d-chinois-93`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/nos-talents/just-mini`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },

    // 📩 Conversion
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },

    // ⚖️ Légal
    { url: `${baseUrl}/mentions-legales`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ]
}