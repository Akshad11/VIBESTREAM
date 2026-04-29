"use client";

import { motion } from "motion/react";
import { Play, Clock, Trash2, ArrowLeft, Loader2, ListMusic } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useMusic } from "../../context/MusicContext";
import { cn, formatDuration } from "@/lib/utils";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function PlaylistView() {
  const { id } = useParams();
  const router = useRouter();
  const { activeSong, isPlaying, playSong, togglePlay } = useMusic();
  const [playlist, setPlaylist] = useState<any>(null);
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    const fetchPlaylistAndSongs = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        // Fetch playlist details
        const { data: playlistData, error: playlistError } = await supabase
          .from("playlists")
          .select("*")
          .eq("id", id)
          .single();

        if (playlistError) throw playlistError;
        setPlaylist(playlistData);

        // Fetch songs in playlist
        const { data: songsData, error: songsError } = await supabase
          .from("playlist_songs")
          .select("*, song:songs(*)")
          .eq("playlist_id", id)
          .order("created_at", { ascending: true });

        if (songsError) throw songsError;
        setSongs((songsData || []).map((item: any) => ({ ...item.song, playlist_song_id: item.id })).filter(Boolean));
      } catch (error) {
        console.error("Error fetching playlist:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylistAndSongs();
  }, [id]);

  const handleRemoveSong = async (playlistSongId: string) => {
    try {
      const { error } = await supabase
        .from("playlist_songs")
        .delete()
        .eq("id", playlistSongId);
        
      if (error) throw error;
      setSongs(songs.filter(s => s.playlist_song_id !== playlistSongId));
    } catch (error) {
      console.error("Error removing song:", error);
      alert("Failed to remove song.");
    }
  };

  const handleDeletePlaylist = async () => {
    if (!confirm("Are you sure you want to delete this playlist?")) return;
    try {
      const { error } = await supabase.from("playlists").delete().eq("id", id);
      if (error) throw error;
      router.push("/playlists");
    } catch (error) {
      console.error("Error deleting playlist:", error);
      alert("Failed to delete playlist.");
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center">
        <p className="text-xl font-bold mb-4">Playlist not found</p>
        <Link href="/playlists" className="text-primary hover:underline">Return to Playlists</Link>
      </div>
    );
  }

  const isOwner = user?.id === playlist.user_id;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-10">
      <Link href="/playlists" className="inline-flex items-center text-sm text-white/40 hover:text-white transition-colors mb-8">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Playlists
      </Link>

      <div className="flex flex-col md:flex-row gap-8 items-end mb-10">
        <div className="w-48 h-48 rounded-2xl bg-white/5 border border-white/10 flex-shrink-0 overflow-hidden shadow-2xl flex items-center justify-center">
           {playlist.image_url ? (
             <img src={playlist.image_url} alt={playlist.title} className="w-full h-full object-cover" />
           ) : (
             <ListMusic className="w-16 h-16 text-white/20" />
           )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold uppercase tracking-widest text-primary mb-2">Playlist</p>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 text-white uppercase">{playlist.title}</h1>
          <div className="flex items-center gap-4 text-white/40 text-sm">
             <span>{songs.length} songs</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-8">
        {songs.length > 0 && (
          <button 
            onClick={() => playSong(songs[0], songs)}
            className="bg-primary text-black px-10 py-4 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer shadow-lg shadow-primary/20 text-lg"
          >
            <Play className="w-5 h-5 fill-current" /> Play
          </button>
        )}
        
        {isOwner && (
          <button 
            onClick={handleDeletePlaylist}
            className="p-4 rounded-full bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors border border-transparent hover:border-red-500/30"
            title="Delete Playlist"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="w-full">
        {songs.length > 0 ? (
          <>
            <div className="grid grid-cols-[auto_1fr_auto_auto] md:grid-cols-[auto_1fr_1fr_auto_auto] gap-2 md:gap-4 py-3 px-2 md:px-4 border-b border-white/5 text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2">
              <div className="w-6 md:w-8 text-center">#</div>
              <div>Title</div>
              <div className="hidden md:block">Artist</div>
              <div className="w-12 md:w-16 flex justify-end pr-2 md:pr-4"><Clock className="w-4 h-4" /></div>
              <div className="w-8 md:w-12"></div>
            </div>

            <div className="space-y-1">
              {songs.map((song, idx) => (
                <motion.div 
                  key={song.playlist_song_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => {
                    if (activeSong?.id === song.id) togglePlay();
                    else playSong(song, songs);
                  }}
                  className={cn(
                    "group grid grid-cols-[auto_1fr_auto_auto] md:grid-cols-[auto_1fr_1fr_auto_auto] gap-2 md:gap-4 py-3 px-2 md:px-4 rounded-xl items-center cursor-pointer transition-all hover:bg-white/5 border border-transparent hover:border-white/5",
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
                    {song.duration ? formatDuration(song.duration) : "--:--"}
                  </div>

                  <div className="w-12 flex items-center justify-end">
                    {isOwner && (
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          className="text-white/40 hover:text-red-400 transition-colors p-1 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveSong(song.playlist_song_id);
                          }}
                          title="Remove from playlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20 text-white/20 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <ListMusic className="w-12 h-12 mx-auto mb-4 text-white/10" />
            <p className="text-lg font-bold mb-1">This playlist is empty</p>
            <p className="text-sm">Explore music to add tracks here.</p>
            <Link href="/browse" className="mt-6 inline-block bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-full font-bold transition-colors">
               Explore Music
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}
