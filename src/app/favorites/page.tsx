"use client";

import { motion } from "motion/react";
import { Play, Clock, Heart, Lock, Loader2, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useMusic } from "../context/MusicContext";
import { cn, formatDuration } from "@/lib/utils";
import Link from "next/link";

export default function Favorites() {
  const { activeSong, isPlaying, playSong, togglePlay } = useMusic();
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }
        setUser(user);

        // Fetch from favorites table (assuming it exists or will exist)
        const { data, error } = await supabase
          .from("favorites")
          .select("*, song:songs(*)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
           console.warn("Favorites table might not exist yet:", error);
           // Fallback to empty if table doesn't exist
           setSongs([]);
        } else {
           setSongs((data || []).map((item: any) => item.song).filter(Boolean));
        }
      } catch (error) {
        console.error("Error fetching favorites:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
          <Lock className="w-10 h-10 text-white/20" />
        </div>
        <h2 className="text-3xl font-black mb-4 tracking-tighter uppercase">Your Favorites</h2>
        <p className="text-white/40 max-w-md mb-8">
          Sign in to view and play your favorite tracks.
        </p>
        <div className="flex gap-4">
          <Link href="/login" className="bg-primary text-black px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-10"
    >
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 tracking-tighter uppercase flex items-center gap-3">
            <Heart className="w-8 h-8 text-primary fill-primary" /> Favorites
          </h1>
          <p className="text-white/40">{songs.length} liked songs</p>
        </div>
        {songs.length > 0 && (
            <button className="bg-primary text-black px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer shadow-lg shadow-primary/10">
            <Play className="w-4 h-4 fill-current" /> Play All
            </button>
        )}
      </div>

      <div className="w-full">
        {songs.length > 0 ? (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_1fr_auto] gap-2 md:gap-4 py-3 px-2 md:px-4 border-b border-white/5 text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2">
              <div className="w-6 md:w-8 text-center">#</div>
              <div>Title</div>
              <div className="hidden md:block">Artist</div>
              <div className="w-12 md:w-16 flex justify-end pr-2 md:pr-4"><Clock className="w-4 h-4" /></div>
            </div>

            {/* Table Body */}
            <div className="space-y-1">
              {songs.map((song, idx) => (
                <motion.div 
                  key={song.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => {
                    if (activeSong?.id === song.id) {
                        togglePlay();
                    } else {
                        playSong(song, songs);
                    }
                  }}
                  className={cn(
                    "group grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_1fr_auto] gap-2 md:gap-4 py-3 px-2 md:px-4 rounded-xl items-center cursor-pointer transition-all hover:bg-white/5 border border-transparent hover:border-white/5",
                    activeSong?.id === song.id && "bg-white/5 border-white/10"
                  )}
                >
                  <div className="w-8 flex items-center justify-center">
                    {activeSong?.id === song.id && isPlaying ? (
                        <div className="w-4 h-4 flex items-end gap-[2px]">
                            <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 bg-primary rounded-full" />
                            <motion.div animate={{ height: [8, 4, 12] }} transition={{ repeat: Infinity, duration: 0.7 }} className="w-1 bg-primary rounded-full" />
                            <motion.div animate={{ height: [4, 10, 6] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 bg-primary rounded-full" />
                        </div>
                    ) : (
                        <>
                            <span className={cn("text-xs transition-colors", activeSong?.id === song.id ? "text-primary font-bold" : "text-white/40 group-hover:hidden")}>
                                {idx + 1}
                            </span>
                            <Play className="w-4 h-4 text-primary hidden group-hover:block fill-current" />
                        </>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 truncate pr-4">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 flex-shrink-0 border border-white/10">
                      <img src={song.image_path || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100"} alt={song.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-sm text-white truncate group-hover:text-primary transition-colors">{song.title}</p>
                    </div>
                  </div>

                  <div className="hidden md:block text-sm text-white/40 truncate pr-4 group-hover:text-white transition-colors">
                    {song.artist}
                  </div>

                  <div className="w-16 flex items-center justify-end gap-4 pr-4">
                     <Heart className="w-4 h-4 text-primary fill-primary cursor-pointer hover:scale-110 transition-transform" />
                     <span className="text-xs text-white/40 font-mono tracking-tighter">
                       {song.duration ? formatDuration(song.duration) : "--:--"}
                     </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-32 text-white/20 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <Heart className="w-12 h-12 mx-auto mb-4 text-white/10" />
            <p className="text-lg font-bold mb-1">No favorite songs yet</p>
            <p className="text-sm">Songs you like will appear here.</p>
            <Link href="/browse" className="mt-6 inline-block bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-full font-bold transition-colors">
               Explore Music
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}
