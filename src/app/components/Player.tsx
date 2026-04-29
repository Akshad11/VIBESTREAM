"use client";

import { motion, AnimatePresence } from "motion/react";
import { 
  Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Repeat1,
  Volume2, Maximize2, ListMusic, Heart, MoreHorizontal
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useMusic } from "../context/MusicContext";

const Equalizer = ({ isPlaying }: { isPlaying: boolean }) => {
  return (
    <div className="flex items-end gap-[2px] h-3 w-3">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="w-[3px] bg-primary rounded-full origin-bottom"
          initial={{ height: "4px" }}
          animate={{ 
            height: isPlaying ? ["4px", "12px", "4px", "8px", "4px"] : "4px" 
          }}
          transition={{
            repeat: Infinity,
            duration: 0.8,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default function Player() {
  const { 
    activeSong, isPlaying, isShuffle, isRepeat,
    togglePlay, playNext, playPrevious, toggleShuffle, toggleRepeat,
    audioRef 
  } = useMusic();
  
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => setProgress(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", updateDuration);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", updateDuration);
    };
  }, [audioRef, activeSong]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume, audioRef]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progressPercentage = (progress / (duration || 1)) * 100;

  if (!activeSong) return null;

  return (
    <footer className="h-24 w-full bg-black/80 backdrop-blur-2xl border-t border-white/5 px-4 md:px-8 flex items-center justify-between z-20 flex-shrink-0">
      {/* Current Song Info */}
      <div className="flex items-center gap-2 md:gap-4 w-1/3 md:w-1/4 min-w-[120px] md:min-w-[180px]">
        <div className="relative group w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
          <img 
            src={activeSong.image_path || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100&h=100&fit=crop"} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
            alt="Album Art" 
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
             <Maximize2 className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="flex flex-col truncate min-w-0 flex-1">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className={cn(activeSong.title.length > 20 ? "marquee-container" : "truncate")}>
              <h4 className={cn(
                "text-xs md:text-sm font-bold text-foreground hover:underline cursor-pointer",
                activeSong.title.length > 20 ? "animate-marquee" : "truncate"
              )}>
                {activeSong.title.length > 20 ? (
                  <>{activeSong.title} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {activeSong.title}</>
                ) : (
                  activeSong.title
                )}
              </h4>
            </div>
            <div className="hidden sm:block flex-shrink-0 ml-2">
              <Equalizer isPlaying={isPlaying} />
            </div>
          </div>
          <p className="text-[10px] md:text-xs text-white/40 hover:underline cursor-pointer truncate">{activeSong.artist}</p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <button className="text-primary hover:scale-110 transition-transform">
            <Heart className="w-4 h-4 md:w-5 md:h-5 fill-current" />
          </button>
        </div>
      </div>

      {/* Player Controls */}
      <div className="flex flex-col items-center gap-1 md:gap-2 flex-1 max-w-2xl px-2 md:px-4">
        <div className="flex items-center gap-3 sm:gap-6 md:gap-8">
          <button 
            onClick={toggleShuffle}
            className={cn("transition-colors hidden sm:block", isShuffle ? "text-primary" : "text-white/40 hover:text-white")}
          >
            <Shuffle className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button 
            onClick={playPrevious}
            className="text-white hover:text-primary transition-colors"
          >
            <SkipBack className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 fill-current" />
          </button>
          <button 
            onClick={togglePlay}
            className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_20px_rgba(74,222,128,0.4)] relative"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 md:w-6 md:h-6 fill-current" />
            ) : (
              <Play className="w-4 h-4 md:w-6 md:h-6 fill-current ml-0.5" />
            )}
            {isPlaying && (
               <motion.div 
                 className="absolute inset-0 rounded-full border border-primary"
                 animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                 transition={{ duration: 1.5, repeat: Infinity }}
               />
            )}
          </button>
          <button 
            onClick={playNext}
            className="text-white hover:text-primary transition-colors"
          >
            <SkipForward className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 fill-current" />
          </button>
          <button 
            onClick={toggleRepeat}
            className={cn("transition-colors hidden sm:block", isRepeat !== 'none' ? "text-primary" : "text-white/40 hover:text-white")}
          >
            {isRepeat === 'one' ? <Repeat1 className="w-4 h-4 md:w-5 md:h-5" /> : <Repeat className="w-4 h-4 md:w-5 md:h-5" />}
          </button>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3 w-full group">
          <span className="text-[8px] md:text-[10px] text-white/40 font-mono w-6 md:w-8 text-right tracking-tighter">{formatTime(progress)}</span>
          <div 
            className="flex-1 h-1 md:h-1.5 lg:h-2 bg-white/10 rounded-full relative overflow-hidden cursor-pointer flex items-center"
            onClick={(e) => {
              if (!audioRef.current) return;
              const bounds = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - bounds.left;
              const newPercentage = (x / bounds.width);
              audioRef.current.currentTime = newPercentage * duration;
            }}
          >
            <motion.div 
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-secondary rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="text-[8px] md:text-[10px] text-white/40 font-mono w-6 md:w-8 tracking-tighter">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume & Extras */}
      <div className="flex items-center justify-end gap-2 md:gap-6 w-auto md:w-1/4 md:min-w-[150px]">
        <div className="items-center gap-2 group cursor-pointer hidden sm:flex w-16 md:w-24">
          <button onClick={() => setVolume(volume === 0 ? 70 : 0)}>
            <Volume2 className={cn("w-3 h-3 md:w-4 md:h-4 transition-colors", volume > 0 ? "text-white/60 group-hover:text-white" : "text-primary")} />
          </button>
          <div 
            className="flex-1 h-1 md:h-1.5 bg-white/10 rounded-full relative overflow-hidden"
            onClick={(e) => {
              const bounds = e.currentTarget.getBoundingClientRect();
              const x = Math.max(0, Math.min(e.clientX - bounds.left, bounds.width));
              setVolume((x / bounds.width) * 100);
            }}
          >
            <div 
              className="absolute left-0 top-0 h-full bg-white/60 group-hover:bg-primary rounded-full transition-colors"
              style={{ width: `${volume}%` }}
            />
          </div>
        </div>
        <button className="text-white/40 hover:text-white transition-colors hidden lg:block" title="Queue">
          <ListMusic className="w-5 h-5" />
        </button>
      </div>
    </footer>
  );
}
