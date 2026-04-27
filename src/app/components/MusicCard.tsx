"use client";

import { motion } from "motion/react";
import { Play, Pause } from "lucide-react";
import { useMusic } from "../context/MusicContext";

interface MusicCardProps {
  id: string;
  title: string;
  artist: string;
  image: string;
  song_path: string;
  queue?: any[];
}

export default function MusicCard({ id, title, artist, image, song_path, queue }: MusicCardProps) {
  const { activeSong, isPlaying, playSong, togglePlay } = useMusic();
  
  const isCurrent = activeSong?.id === id;

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      playSong({ id, title, artist, image_path: image, song_path }, queue);
    }
  };

  return (
    <div 
      onClick={handlePlay}
      className="bg-white/5 border border-white/10 p-4 rounded-2xl group hover:bg-white/10 transition-colors cursor-pointer"
    >
      <div className="relative aspect-square mb-4 overflow-hidden rounded-xl bg-white/5">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <motion.div 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-black shadow-xl"
          >
            {isCurrent && isPlaying ? (
                <Pause className="w-6 h-6 fill-current" />
            ) : (
                <Play className="w-6 h-6 fill-current ml-0.5" />
            )}
          </motion.div>
        </div>
      </div>
      <h3 className="font-bold text-sm truncate group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-xs text-white/40 truncate">{artist}</p>
    </div>
  );
}
