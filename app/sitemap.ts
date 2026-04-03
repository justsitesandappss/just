import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://justagency-inc.com"
  const now = new Date()

  const create = (
    path: string,
    priority: number,
    changeFrequency: "daily" | "weekly" | "monthly" | "yearly"
  ) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  })

  return [
    // 🥇 Pages principales
    create("", 1, "weekly"),
    create("/just-agency", 0.9, "weekly"),
    create("/just-impact", 0.9, "weekly"),

    // 🧩 Sections
    create("/nos-talents", 0.9, "weekly"),
    create("/media", 0.8, "weekly"),
    create("/podcast", 0.8, "weekly"),
    create("/nos-sponsors", 0.7, "monthly"),

    // 👤 Talents
    create("/nos-talents/karim-lipton", 0.8, "weekly"),
    create("/nos-talents/riles-freestyle", 0.8, "weekly"),
    create("/nos-talents/moumlame", 0.8, "weekly"),
    create("/nos-talents/romain-benn", 0.8, "weekly"),
    create("/nos-talents/kimo-djz", 0.8, "weekly"),
    create("/nos-talents/ines-hmz", 0.8, "weekly"),
    create("/nos-talents/naoil-kohlanta", 0.8, "weekly"),
    create("/nos-talents/d-chinois-93", 0.8, "weekly"),
    create("/nos-talents/just-mini", 0.8, "weekly"),

    // 📩 Conversion
    create("/contact", 0.7, "monthly"),

    // ⚖️ Légal
    create("/mentions-legales", 0.3, "yearly"),
  ]
}