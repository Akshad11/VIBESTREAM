"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface Song {
  id: string;
  title: string;
  artist: string;
  song_path: string;
  image_path?: string;
}

interface MusicContextType {
  activeSong: Song | null;
  queue: Song[];
  isPlaying: boolean;
  isShuffle: boolean;
  isRepeat: 'none' | 'one' | 'all';
  playSong: (song: Song, newQueue?: Song[]) => void;
  pauseSong: () => void;
  resumeSong: () => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

const STORAGE_KEY = 'vibestream_playback_state';

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [activeSong, setActiveSong] = useState<Song | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState<'none' | 'one' | 'all'>('none');
  const [isInitialized, setIsInitialized] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const { activeSong, queue, isShuffle, isRepeat } = JSON.parse(savedState);
        setActiveSong(activeSong);
        setQueue(queue);
        setIsShuffle(isShuffle);
        setIsRepeat(isRepeat);
      } catch (err) {
        console.error("Failed to restore playback state:", err);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      const stateToSave = { activeSong, queue, isShuffle, isRepeat };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    }
  }, [activeSong, queue, isShuffle, isRepeat, isInitialized]);

  const playSong = (song: Song, newQueue?: Song[]) => {
    setActiveSong(song);
    if (newQueue) {
      setQueue(newQueue);
    } else if (!queue.find(s => s.id === song.id)) {
      setQueue(prev => [...prev, song]);
    }
    setIsPlaying(true);
  };

  const pauseSong = () => {
    setIsPlaying(false);
    audioRef.current?.pause();
  };

  const resumeSong = () => {
    if (!activeSong && queue.length > 0) {
      setActiveSong(queue[0]);
    }
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (isPlaying) pauseSong();
    else resumeSong();
  };

  const playNext = () => {
    if (queue.length === 0) return;
    
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * queue.length);
      setActiveSong(queue[randomIndex]);
      return;
    }

    const currentIndex = queue.findIndex(s => s.id === activeSong?.id);
    if (currentIndex === -1 || currentIndex === queue.length - 1) {
      if (isRepeat === 'all') setActiveSong(queue[0]);
      else setIsPlaying(false);
    } else {
      setActiveSong(queue[currentIndex + 1]);
    }
  };

  const playPrevious = () => {
    if (queue.length === 0) return;
    
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    const currentIndex = queue.findIndex(s => s.id === activeSong?.id);
    if (currentIndex <= 0) {
      if (isRepeat === 'all') setActiveSong(queue[queue.length - 1]);
      else audioRef.current ? audioRef.current.currentTime = 0 : null;
    } else {
      setActiveSong(queue[currentIndex - 1]);
    }
  };

  const toggleShuffle = () => setIsShuffle(!isShuffle);
  
  const toggleRepeat = () => {
    const modes: ('none' | 'one' | 'all')[] = ['none', 'all', 'one'];
    const nextMode = modes[(modes.indexOf(isRepeat) + 1) % modes.length];
    setIsRepeat(nextMode);
  };

  useEffect(() => {
    if (activeSong && isInitialized) {
        let url = activeSong.song_path;
        if (!url.startsWith('http')) {
            url = supabase.storage.from('music').getPublicUrl(activeSong.song_path).data.publicUrl;
        }
        
        if (audioRef.current && audioRef.current.src !== url) {
            audioRef.current.src = url;
            if (isPlaying) {
                audioRef.current.play().catch(err => console.error("Playback failed:", err));
            }
        }

        // Log recently played
        const logRecentlyPlayed = async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase
              .from('recently_played')
              .upsert({ 
                user_id: user.id, 
                song_id: activeSong.id,
                created_at: new Date().toISOString() 
              }, { onConflict: 'user_id,song_id' });
          }
        };
        logRecentlyPlayed();
    }
  }, [activeSong]);

  useEffect(() => {
    if (audioRef.current && isInitialized) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, isInitialized]);

  const handleEnded = () => {
    if (isRepeat === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      playNext();
    }
  };

  return (
    <MusicContext.Provider value={{ 
      activeSong, queue, isPlaying, isShuffle, isRepeat,
      playSong, pauseSong, resumeSong, togglePlay, 
      playNext, playPrevious, toggleShuffle, toggleRepeat,
      audioRef 
    }}>
      {children}
      <audio ref={audioRef} onEnded={handleEnded} />
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error("useMusic must be used within a MusicProvider");
  }
  return context;
}
