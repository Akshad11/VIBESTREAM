"use client";

import { motion } from "motion/react";
import MusicCard from "./components/MusicCard";
import { Play, AlertTriangle, Music2, Plus, Clock, Search } from "lucide-react";
import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn, formatDuration } from "@/lib/utils";
import { useMusic } from "./context/MusicContext";

const levenshtein = (a: string, b: string) => {
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

const fuzzyScore = (text: string, query: string): number => {
  if (!text || !query) return Infinity;
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  
  if (t === q) return 0;
  if (t.startsWith(q)) return 1;
  if (t.includes(q)) return 2;
  
  const qWords = q.split(/\s+/).filter(Boolean);
  if (qWords.length === 0) return Infinity;

  let matchCount = 0;
  let totalDistance = 0;
  for (const qw of qWords) {
    let minDistance = Infinity;
    const tWords = t.split(/[\s,.-]+/);
    for (const tw of tWords) {
      if (tw === qw) {
         minDistance = 0;
      } else if (tw.startsWith(qw)) {
         minDistance = 0.5;
      } else if (tw.includes(qw)) {
         minDistance = 1;
      } else {
         minDistance = Math.min(minDistance, levenshtein(tw, qw));
      }
    }
    const threshold = qw.length <= 4 ? 1 : 2;
    if (minDistance <= threshold) {
      matchCount++;
      totalDistance += minDistance;
    }
  }
  
  if (matchCount === qWords.length) {
    return 10 + totalDistance;
  }
  return Infinity;
};

function HomeContent() {
  const [songs, setSongs] = useState<any[]>([]);
  const [recentSongs, setRecentSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const { activeSong, isPlaying, playSong, togglePlay } = useMusic();

  const isSupabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Trending/Search Songs
        let query = supabase
          .from("songs")
          .select("*")
          .eq("is_public", true)
          .order("created_at", { ascending: false });

        if (!searchQuery) {
           query = query.limit(50);
        } else {
           query = query.limit(1000); // Fetch more for client-side fuzzy search
        }

        const { data: songsData, error: songsError } = await query;
        if (songsError) throw songsError;
        
        let finalSongs = songsData || [];
        
        // Deduplicate: only show distinct songs by title and artist
        const seen = new Set();
        finalSongs = finalSongs.filter(song => {
           const key = `${song.title.toLowerCase().trim()}-${song.artist.toLowerCase().trim()}`;
           if (seen.has(key)) return false;
           seen.add(key);
           return true;
        });

        if (searchQuery) {
           const scoredSongs = finalSongs.map(song => {
             const titleScore = fuzzyScore(song.title, searchQuery);
             const artistScore = fuzzyScore(song.artist, searchQuery);
             const score = Math.min(titleScore, artistScore + 0.1); 
             return { song, score };
           }).filter(item => item.score < Infinity);
           
           scoredSongs.sort((a, b) => a.score - b.score);
           finalSongs = scoredSongs.map(item => item.song);
        }
        setSongs(finalSongs);

        // 2. Fetch Recently Played
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: recentData, error: recentError } = await supabase
            .from("recently_played")
            .select(`
              song:songs (*)
            `)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(10);
          
          if (!recentError && recentData) {
            setRecentSongs(recentData.map((item: any) => item.song));
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchQuery]);

  return (
    <div className="pb-8">
      {!isSupabaseConfigured && (
        <div className="mb-8 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-4 text-amber-500">
          <AlertTriangle className="w-6 h-6 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold">Supabase Not Configured</p>
            <p className="text-xs opacity-80">Please add your environment variables to enable live data.</p>
          </div>
        </div>
      )}

      {/* Hero Section (Hidden during search) */}
      {!searchQuery && (
        <section className="mb-10 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-secondary to-primary rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative h-64 bg-card rounded-3xl p-6 md:p-10 flex flex-col justify-center overflow-hidden border border-border">
            <div className="absolute right-0 top-0 w-1/2 h-full opacity-40">
              <div className="w-full h-full bg-gradient-to-l from-secondary/50 to-transparent"></div>
            </div>
            
            <div className="relative z-20">
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-2 block">Featured Album</span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 tracking-tighter text-white leading-tight uppercase">VIBE<br/>COLLECTIVE</h1>
              <div className="flex items-center gap-6">
                <button className="px-8 py-3 bg-white text-black font-bold rounded-full flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer">
                  <Play className="w-5 h-5 fill-current" /> Play Mix
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Recently Played (Horizontal Scroll) */}
      {recentSongs.length > 0 && !searchQuery && (
        <section className="mb-12">
          <h2 className="text-xl font-bold tracking-tight mb-6">Recently Played</h2>
          <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar -mx-2 px-2 scroll-smooth">
            {recentSongs.map((song, i) => (
              <div key={`recent-${song.id}`} className="flex-shrink-0 w-48">
                <MusicCard 
                  id={song.id}
                  title={song.title} 
                  artist={song.artist} 
                  image={song.image_path || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=300&auto=format&fit=crop"} 
                  song_path={song.song_path}
                  queue={recentSongs}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main Content: Songs List */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold tracking-tight">
            {searchQuery ? `Search Results for "${searchQuery}"` : "Trending Now"}
          </h2>
          {!searchQuery && (
            <button className="text-xs text-primary font-bold uppercase tracking-widest hover:text-primary/80 transition-colors cursor-pointer">View All</button>
          )}
        </div>
        
        {songs.length > 0 ? (
          <div className="space-y-1">
            {/* Table Header */}
            <div className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_1fr_auto] gap-4 py-3 px-2 md:px-4 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] border-b border-white/5 mb-2">
              <div className="w-8 text-center">#</div>
              <div>Title</div>
              <div className="hidden md:block">Artist</div>
              <div className="w-12 md:w-16 text-right pr-2 md:pr-4"><Clock className="w-4 h-4 ml-auto" /></div>
            </div>

            {songs.map((song, idx) => (
              <motion.div 
                key={song.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => {
                  if (activeSong?.id === song.id) togglePlay();
                  else playSong(song, songs);
                }}
                className={cn(
                  "group grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_1fr_auto] gap-4 py-3 px-2 md:px-4 rounded-xl items-center cursor-pointer transition-all hover:bg-white/5 border border-transparent hover:border-white/5",
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
                    <p className={cn("font-bold text-sm truncate transition-colors", activeSong?.id === song.id ? "text-primary" : "text-white group-hover:text-primary")}>
                      {song.title}
                    </p>
                  </div>
                </div>

                <div className="hidden md:block text-sm text-white/40 truncate pr-4 group-hover:text-white transition-colors">
                  {song.artist}
                </div>

                <div className="w-16 text-xs text-white/40 text-right pr-4 font-mono tracking-tighter">
                  {song.duration ? formatDuration(song.duration) : "--:--"}
                </div>
              </motion.div>
            ))}
          </div>
        ) : !loading ? (
          <div className="py-20 flex flex-col items-center justify-center bg-white/5 rounded-3xl border border-dashed border-white/10 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-white/20" />
            </div>
            <p className="text-lg font-bold mb-2">{searchQuery ? "No results found" : "No tracks found"}</p>
            <p className="text-sm text-white/40 mb-6 max-w-xs">Try searching for something else or upload your own music.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="h-16 bg-white/5 animate-pulse rounded-xl"></div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="p-10 text-white/20">Loading Dashboard...</div>}>
      <HomeContent />
    </Suspense>
  );
}
