"use client";

import { motion } from "motion/react";
import { Plus, ListMusic } from "lucide-react";
import PlaylistCard from "../components/PlaylistCard";

const mockPlaylists = [
  { id: 1, title: "Daily Mix 1", songCount: 50, image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=300" },
  { id: 2, title: "Discover Weekly", songCount: 30, image: "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f9af?q=80&w=300" },
  { id: 3, title: "Release Radar", songCount: 20, image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=300" },
  { id: 4, title: "Chill Vibes", songCount: 45, image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=300" },
];

export default function Playlists() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-10">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter mb-2">Playlists</h1>
          <p className="text-white/40">Your personal collections and curated mixes.</p>
        </div>
        <button className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer">
          <Plus className="w-5 h-5" /> Create New
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mockPlaylists.map((playlist, i) => (
           <motion.div
             key={playlist.id}
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: i * 0.05 }}
           >
             <PlaylistCard {...playlist} />
           </motion.div>
        ))}

        <button className="aspect-video rounded-3xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-3 hover:border-primary/20 hover:bg-primary/5 transition-all group cursor-pointer">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <ListMusic className="w-6 h-6 text-white/20 group-hover:text-primary transition-colors" />
          </div>
          <span className="text-sm font-bold text-white/20 group-hover:text-primary transition-colors">New Playlist</span>
        </button>
      </div>
    </motion.div>
  );
}
