"use client";

import { motion } from "motion/react";
import { Search, Flame, Sparkles, Disc3, Radio, Headphones, Mic2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const genres = [
  { name: "Pop", color: "from-pink-500 to-rose-500", icon: Sparkles },
  { name: "Hip-Hop", color: "from-orange-500 to-red-500", icon: Flame },
  { name: "Electronic", color: "from-blue-500 to-cyan-500", icon: Radio },
  { name: "Rock", color: "from-slate-700 to-slate-900", icon: Disc3 },
  { name: "R&B", color: "from-purple-500 to-indigo-500", icon: Mic2 },
  { name: "Jazz", color: "from-amber-600 to-orange-700", icon: Headphones },
  { name: "Classical", color: "from-stone-500 to-stone-700", icon: Disc3 },
  { name: "Indie", color: "from-emerald-500 to-teal-500", icon: Sparkles },
];

export default function Browse() {
  const router = useRouter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("query");
    if (query) {
      router.push(`/?search=${query}`);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-10">
      <h1 className="text-4xl font-bold mb-8 tracking-tighter uppercase">Browse</h1>


      <section className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-6">Explore Genres</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {genres.map((genre, idx) => (
            <motion.div
              key={genre.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => router.push(`/?search=${genre.name}`)}
              className={`relative overflow-hidden rounded-2xl aspect-video cursor-pointer group bg-gradient-to-br ${genre.color}`}
            >
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
              <div className="absolute top-4 left-4">
                <h3 className="text-xl font-bold text-white tracking-tight">{genre.name}</h3>
              </div>
              <genre.icon className="absolute -bottom-4 -right-4 w-24 h-24 text-white/20 transform group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500" />
            </motion.div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold tracking-tight mb-6">Trending Moods</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors cursor-pointer group">
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-2 group-hover:text-primary transition-colors">Chill Vibes</h3>
            <p className="text-white/40 text-sm">Relax and unwind with smooth tracks.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors cursor-pointer group">
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-2 group-hover:text-primary transition-colors">Workout</h3>
            <p className="text-white/40 text-sm">High energy beats to keep you moving.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors cursor-pointer group">
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-2 group-hover:text-primary transition-colors">Focus</h3>
            <p className="text-white/40 text-sm">Deep concentration and ambient sounds.</p>
          </div>
        </div>
      </section>

    </motion.div>
  );
}
