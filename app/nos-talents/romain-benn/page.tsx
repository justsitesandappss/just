// app/nos-talents/page.tsx
import Link from "next/link"
import Image from "next/image"

const talents = [
  {
    slug: "karim-lipton",
    name: "KARIM LIPTON",
    handle: "@karimlipton94",
    image: "/images/talents/karim.jpg",
    views: "7.4M VUES",
    categories: ["Humour", "Voyage", "Lifestyle"],
    stats: [
      { icon: "snap", value: "1.4M" },
      { icon: "tiktok", value: "650.7K" },
      { icon: "youtube", value: "100K" },
    ],
    description: "Créateur dynamique et authentique, reconnu pour son sens du divertissement.",
  },
  {
    slug: "riles-freestyle",
    name: "RILES FREESTYLE",
    handle: "@rilesfreestyle",
    image: "/images/talents/riles.jpg",
    views: "139.1M VUES",
    categories: ["Foot", "Journalisme", "Lifestyle"],
    stats: [
      { icon: "insta", value: "200.9K" },
      { icon: "tiktok", value: "1.3M" },
      { icon: "youtube", value: "61.9K" },
    ],
    description: "Pro du foot freestyle. Partenaire PSG, Canal+ et SNCF.",
  },
  // ... autres talents
]

export default function NosTalentsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-12">NOS TALENTS</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {talents.map((talent, index) => (
            <Link 
              key={talent.slug} 
              href={`/nos-talents/${talent.slug}`}
              className="group block"
            >
              <div className="relative overflow-hidden rounded-2xl bg-[#0b0b0b] border border-white/10 hover:border-white/20 transition-all">
                {/* Image */}
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={talent.image}
                    alt={talent.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                    🔥 {talent.views}
                  </div>
                  <div className="absolute top-4 left-4 text-white/30 text-6xl font-bold">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-1">{talent.name}</h2>
                  <p className="text-white/50 text-sm mb-3">{talent.handle}</p>
                  
                  <div className="flex gap-2 mb-4">
                    {talent.categories.map(cat => (
                      <span key={cat} className="text-xs text-red-500 font-medium">
                        {cat}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-3 mb-4">
                    {talent.stats.map((stat, i) => (
                      <div key={i} className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded text-xs">
                        <span>{stat.value}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-white/60 text-sm mb-4 line-clamp-2">
                    {talent.description}
                  </p>

                  <span className="text-xs font-medium tracking-wider text-white/40 group-hover:text-white transition-colors">
                    DÉCOUVRIR →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}