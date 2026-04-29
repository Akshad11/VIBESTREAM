"use client";

import { motion, AnimatePresence } from "motion/react";
import { X, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AddToPlaylistModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [songId, setSongId] = useState<string | null>(null);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleOpen = (e: any) => {
      setSongId(e.detail.songId);
      setIsOpen(true);
      fetchPlaylists();
    };

    window.addEventListener("open-playlist-modal", handleOpen);
    return () => window.removeEventListener("open-playlist-modal", handleOpen);
  }, []);

  const fetchPlaylists = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("playlists")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setPlaylists(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addToPlaylist = async (playlistId: string) => {
    if (!songId) return;
    try {
      const { error } = await supabase
        .from("playlist_songs")
        .insert([{ playlist_id: playlistId, song_id: songId }]);
      
      if (error) {
        if (error.code === '23505') {
            alert("Song is already in this playlist.");
        } else {
            throw error;
        }
      } else {
        alert("Added to playlist!");
        setIsOpen(false);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to add to playlist.");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-card border border-border p-6 rounded-3xl w-full max-w-sm relative"
        >
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors p-2"
          >
            <X className="w-5 h-5" />
          </button>
          
          <h2 className="text-xl font-bold mb-6">Add to Playlist</h2>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : playlists.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
              {playlists.map(p => (
                <button
                  key={p.id}
                  onClick={() => addToPlaylist(p.id)}
                  className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors font-medium truncate"
                >
                  {p.title}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-white/40">
              <p className="mb-4">You don't have any playlists yet.</p>
              <button 
                 onClick={() => { setIsOpen(false); router.push("/playlists"); }} 
                 className="text-primary hover:underline text-sm font-bold"
              >
                 Create one here
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
