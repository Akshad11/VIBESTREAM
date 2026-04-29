"use client";

import { motion } from "motion/react";
import { Plus, ListMusic, Loader2, Lock, X } from "lucide-react";
import PlaylistCard from "../components/PlaylistCard";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Playlists() {
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setUser(user);

      const { data, error } = await supabase
        .from("playlists")
        .select("*, playlist_songs(count)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Playlists table might not exist yet:", error);
      } else {
        setPlaylists(data || []);
      }
    } catch (error) {
      console.error("Error fetching playlists:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !user) return;

    try {
      const { data, error } = await supabase
        .from("playlists")
        .insert([{ user_id: user.id, title: newTitle.trim() }])
        .select();

      if (error) throw error;

      if (data) {
        setPlaylists([{ ...data[0], playlist_songs: [{ count: 0 }] }, ...playlists]);
      }
      setIsCreating(false);
      setNewTitle("");
    } catch (error) {
      console.error("Error creating playlist:", error);
      alert("Failed to create playlist. Make sure the table exists.");
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
        <h2 className="text-3xl font-black mb-4 tracking-tighter uppercase">Your Playlists</h2>
        <p className="text-white/40 max-w-md mb-8">
          Sign in to create custom playlists and save your favorite tracks.
        </p>
        <Link href="/login" className="bg-primary text-black px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-10 relative">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter mb-2">Playlists</h1>
          <p className="text-white/40">Your personal collections and curated mixes.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-primary text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer shadow-lg shadow-primary/10"
        >
          <Plus className="w-5 h-5" /> Create New
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {playlists.map((playlist, i) => (
           <motion.div
             key={playlist.id}
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: i * 0.05 }}
             onClick={() => router.push(`/playlists/${playlist.id}`)}
           >
             <PlaylistCard 
                title={playlist.title} 
                songCount={playlist.playlist_songs?.[0]?.count || 0} 
                image={playlist.image_url || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300"} 
             />
           </motion.div>
        ))}

        <button 
          onClick={() => setIsCreating(true)}
          className="aspect-video rounded-3xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-3 hover:border-primary/20 hover:bg-primary/5 transition-all group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <Plus className="w-6 h-6 text-white/20 group-hover:text-primary transition-colors" />
          </div>
          <span className="text-sm font-bold text-white/20 group-hover:text-primary transition-colors">New Playlist</span>
        </button>
      </div>

      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card border border-border p-8 rounded-3xl w-full max-w-md relative"
          >
            <button 
              onClick={() => setIsCreating(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors p-2"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold mb-6">Create Playlist</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-white/60 mb-2 block">Playlist Name</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="My Awesome Mix" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-primary transition-all"
                  autoFocus
                />
              </div>
              <button 
                type="submit" 
                disabled={!newTitle.trim()}
                className="w-full bg-primary text-black py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] transition-transform cursor-pointer"
              >
                Create
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
