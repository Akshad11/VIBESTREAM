"use client";

import { motion } from "motion/react";
import { Play, Clock, Trash2, AlertTriangle, Lock, Loader2, Globe } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useMusic } from "../context/MusicContext";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function Library() {
  const { activeSong, isPlaying, playSong, togglePlay } = useMusic();
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const isSupabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }
        setUser(user);

        const { data, error } = await supabase
          .from("songs")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setSongs(data || []);
      } catch (error) {
        console.error("Error fetching library:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLibrary();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("songs").delete().eq("id", id);
      if (error) throw error;
      setSongs(songs.filter(s => s.id !== id));
    } catch (error) {
      console.error("Error deleting song:", error);
      alert("Failed to delete song.");
    }
  };

  const togglePublish = async (e: React.MouseEvent, id: string, currentStatus: boolean) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from("songs")
        .update({ is_public: !currentStatus })
        .eq("id", id);
      if (error) throw error;
      setSongs(songs.map(s => s.id === id ? { ...s, is_public: !currentStatus } : s));
    } catch (error) {
      console.error("Error updating publish status:", error);
      alert("Failed to update status. Make sure the is_public column exists in your database.");
    }
  };

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
        <h2 className="text-3xl font-black mb-4 tracking-tighter uppercase">Your Music Library</h2>
        <p className="text-white/40 max-w-md mb-8">
          Sign in to access your personal collection, uploaded tracks, and favorite playlists.
        </p>
        <div className="flex gap-4">
          <Link href="/login" className="bg-primary text-black px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform">
            Sign In
          </Link>
          <Link href="/register" className="bg-white/5 text-white border border-white/10 px-8 py-3 rounded-xl font-bold hover:bg-white/10 transition-all">
            Create Account
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
      {!isSupabaseConfigured && (
        <div className="mb-8 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-4 text-amber-500">
          <AlertTriangle className="w-6 h-6 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold">Supabase Not Configured</p>
            <p className="text-xs opacity-80">Library features require Supabase to be configured in .env.local.</p>
          </div>
        </div>
      )}

      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 tracking-tighter uppercase">My Library</h1>
          <p className="text-white/40">{songs.length} songs uploaded</p>
        </div>
        <button 
          onClick={() => { if(songs.length) playSong(songs[0], songs); }}
          className="bg-primary text-black px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer shadow-lg shadow-primary/10"
        >
          <Play className="w-4 h-4 fill-current" /> Play All
        </button>
      </div>

      <div className="w-full">
        {/* Table Header */}
        <div className="grid grid-cols-[auto_1fr_1fr_auto_auto] gap-4 py-3 px-4 border-b border-white/5 text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2">
          <div className="w-8 text-center">#</div>
          <div>Title</div>
          <div className="hidden md:block">Artist</div>
          <div className="w-16 flex justify-end pr-4"><Clock className="w-4 h-4" /></div>
          <div className="w-20 text-center pr-2">Status</div>
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
                "group grid grid-cols-[auto_1fr_1fr_auto_auto] gap-4 py-3 px-4 rounded-xl items-center cursor-pointer transition-all hover:bg-white/5 border border-transparent hover:border-white/5",
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

              <div className="w-16 text-xs text-white/40 text-right pr-4 font-mono tracking-tighter">
                --:--
              </div>

              <div className="w-20 flex items-center justify-end gap-3">
                <button
                  onClick={(e) => togglePublish(e, song.id, song.is_public ?? true)}
                  className={cn(
                    "p-1.5 rounded-full border transition-all",
                    (song.is_public ?? true) ? "text-green-400 border-green-400/20 hover:bg-green-400/10" : "text-white/40 border-white/10 hover:bg-white/10"
                  )}
                  title={(song.is_public ?? true) ? "Public (Click to make private)" : "Private (Click to make public)"}
                >
                  {(song.is_public ?? true) ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </button>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    className="text-white/40 hover:text-red-400 transition-colors p-1.5 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(song.id);
                    }}
                    title="Delete Song"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          
          {songs.length === 0 && !loading && (
            <div className="text-center py-32 text-white/20 bg-white/5 rounded-3xl border border-dashed border-white/10">
              <p className="text-lg font-bold mb-1">Your library is empty</p>
              <p className="text-sm">Songs you upload will appear here</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
