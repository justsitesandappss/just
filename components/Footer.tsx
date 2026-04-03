import Link from "next/link"

const BODY    = "'Outfit', sans-serif"
const DISPLAY = "'Syne', sans-serif"

const white = (o: number) => `rgba(255,255,255,${o})`

const navColumns = [
  [
    { label: "Accueil",           href: "/"            },
    { label: "Media",             href: "/media"       },
    { label: "Nos Sponsors",      href: "/nosponsors"  },
    { label: "Podcast",           href: "/podcast"     },
  ],
  [
    { label: "Just Impact",       href: "/just-impact"  },
    { label: "Qui sommes-nous ?", href: "/just"        },
    { label: "Nos Talents",       href: "/nos-talents"  },
    { label: "Contact",           href: "/contact"     },
  ],
]

const socials = [
  {
    label: "Instagram", href: "https://www.instagram.com/justagency.inc/",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="17.5" cy="6.5" r="1.5" />
      </svg>
    ),
  },
  {
    label: "TikTok", href: "https://www.tiktok.com/@justimpact.world",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78 2.92 2.92 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.07A6.33 6.33 0 0 0 3 15.64 6.33 6.33 0 0 0 9.37 22a6.33 6.33 0 0 0 6.33-6.33V9.19a8.16 8.16 0 0 0 3.89.98V6.69Z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn", href: "https://linkedin.com/company/justgroup",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
]

const legalLinks = [
  { label: "CONDITIONS",      href: "/mentions-legales" },
  { label: "CONFIDENTIALITÉ", href: "/confidentialite"  },
  { label: "COOKIES",         href: "/cookies"          },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Outfit:wght@300;400;500;600&display=swap');
        .footer-link { color: ${white(0.68)}; text-decoration: none; transition: color .2s ease; }
        .footer-link:hover { color: ${white(0.96)}; }
        .footer-social { display:inline-flex; align-items:center; justify-content:center; width:32px; height:32px; border-radius:999px; color:${white(0.68)}; text-decoration:none; transition: color .2s ease, transform .2s ease; }
        .footer-social:hover { color:${white(0.96)}; transform: translateY(-2px); }
        .footer-legal-link { color:${white(0.25)}; text-decoration:none; font-size:11px; font-weight:700; letter-spacing:2.4px; text-transform:uppercase; white-space:nowrap; transition: color .2s ease; }
        .footer-legal-link:hover { color:${white(0.5)}; }
        @media (max-width: 768px) {
          .footer-main  { grid-template-columns: 1fr !important; }
          .footer-nav   { grid-template-columns: 1fr !important; }
          .footer-side  { align-items: flex-start !important; }
          .footer-email { text-align: left !important; }
          .footer-legal { justify-content: flex-start !important; }
        }
      `}</style>

      <footer style={{
        width: "100%", background: "#000", color: white(0.68),
        fontFamily: BODY, borderTop: `1px solid ${white(0.06)}`,
        padding: "48px 72px 0",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="footer-main" style={{
            display: "grid",
            gridTemplateColumns: "minmax(220px,0.9fr) minmax(280px,1.35fr) minmax(180px,0.75fr)",
            gap: 20, alignItems: "start",
          }}>
            <div>
              <Link href="/" className="footer-link" style={{
                display: "inline-block", fontFamily: DISPLAY,
                fontSize: 14, fontWeight: 700, letterSpacing: 4,
                marginBottom: 8, color: white(0.62),
              }}>
                JUST<span style={{ color: white(0.34) }}>.</span>
              </Link>
              <p style={{ margin: 0, fontSize: 12, lineHeight: 1.55, color: white(0.56) }}>
                Paris, France<br />© {year} Just Group
              </p>
              <p style={{ margin: "3px 0 0", fontSize: 12, color: white(0.36) }}>
                Made by the best
              </p>
            </div>

            <nav aria-label="Navigation pied de page">
              <div className="footer-nav" style={{
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: 26,
              }}>
                {navColumns.map((col, ci) => (
                  <ul key={ci} style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 6 }}>
                    {col.map(link => (
                      <li key={link.label}>
                        <Link href={link.href} className="footer-link" style={{ fontSize: 12, fontWeight: 500 }}>
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            </nav>

            <div className="footer-side" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
              <div style={{ display: "flex", gap: 10 }}>
                {socials.map(s => (
                  <Link key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    aria-label={s.label} className="footer-social">
                    {s.icon}
                  </Link>
                ))}
              </div>
              <Link href="mailto:justdemandes@gmail.com" className="footer-link footer-email"
                style={{ fontSize: 12, textAlign: "right" }}>
                justdemandes@gmail.com
              </Link>
            </div>
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${white(0.04)}`, marginTop: 24 }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "14px 0 18px" }}>
          <nav aria-label="Liens légaux">
            <div className="footer-legal" style={{
              display: "flex", flexWrap: "wrap",
              alignItems: "center", justifyContent: "center",
              gap: 18, rowGap: 8,
            }}>
              {legalLinks.map((link, i) => (
                <span key={link.label} style={{ display: "inline-flex", alignItems: "center", gap: 18 }}>
                  <Link href={link.href} className="footer-legal-link">{link.label}</Link>
                  {i < legalLinks.length - 1 && (
                    <span style={{ color: white(0.12), fontSize: 10 }} aria-hidden="true">•</span>
                  )}
                </span>
              ))}
            </div>
          </nav>
        </div>
      </footer>
    </>
  )
}