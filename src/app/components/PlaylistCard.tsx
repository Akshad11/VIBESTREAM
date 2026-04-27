"use client";

import { motion } from "motion/react";
import { ListMusic, Play } from "lucide-react";

interface PlaylistCardProps {
  title: string;
  songCount: number;
  image: string;
}

export default function PlaylistCard({ title, songCount, image }: PlaylistCardProps) {
  return (
    <div className="bg-white/5 border border-white/10 p-3 rounded-2xl group hover:bg-white/10 transition-colors flex items-center cursor-pointer">
      <div className="relative w-16 h-16 rounded-xl overflow-hidden mr-4 flex-shrink-0">
        <img src={image} alt={title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <Play className="w-6 h-6 text-primary fill-current" />
        </div>
      </div>
      <div className="flex flex-col flex-1 truncate">
        <h3 className="font-bold text-sm truncate">{title}</h3>
        <span className="text-xs text-white/40 flex items-center gap-1.5 mt-1">
          <ListMusic className="w-3.5 h-3.5" />
          {songCount} songs
        </span>
      </div>
    </div>
  );
}
