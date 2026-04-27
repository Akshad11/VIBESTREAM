"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Library, PlusSquare, ListMusic, Heart, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

const mainLinks = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Compass, label: "Browse", href: "/browse" },
  { icon: Library, label: "My Library", href: "/library" },
];

const secondaryLinks = [
  { icon: PlusSquare, label: "Upload Songs", href: "/upload" },
  { icon: ListMusic, label: "Playlists", href: "/playlists" },
  { icon: Heart, label: "Favorites", href: "/favorites" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 flex-shrink-0 flex flex-col bg-black/40 border-r border-white/5">
      <div className="p-6 mb-4">
        <Link href="/" className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 flex-shrink-0 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-xl flex items-center justify-center p-1.5 overflow-hidden border border-white/10">
            <img src="/logo.png" className="w-full h-full object-contain" alt="VibeStream Logo" />
          </div>
          <span className="text-xl font-bold tracking-tighter text-white">VIBESTREAM</span>
        </Link>
      </div>

      <nav className="flex-1 px-6 space-y-6 overflow-y-auto">
        <div>
          <h2 className="text-[10px] uppercase tracking-widest text-white/30 mb-4">
            Menu
          </h2>
          <div className="space-y-1">
            {mainLinks.map((link, idx) => (
              <SidebarLink key={link.href || String(idx)} icon={link.icon} label={link.label} href={link.href} />
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-[10px] uppercase tracking-widest text-white/30 mb-4">
            Library
          </h2>
          <div className="space-y-1">
            {secondaryLinks.map((link, idx) => (
              <SidebarLink key={link.href || String(idx)} icon={link.icon} label={link.label} href={link.href} />
            ))}
          </div>
        </div>
      </nav>

      <div className="p-6 mt-auto">
        {/* Pro Plan space - hidden for now */}
        <div className="h-4" />
        <SidebarLink icon={Settings} label="Settings" href="/settings" />
      </div>
    </aside>
  );
}

const SidebarLink: React.FC<{ icon: any; label: string; href: string }> = ({ icon: Icon, label, href }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 py-1.5 rounded-lg text-sm transition-colors group relative overflow-hidden",
        isActive
          ? "text-primary font-medium"
          : "text-white/60 hover:text-white font-medium"
      )}
    >
      <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={cn("transition-colors", isActive ? "text-primary" : "")} />
      <span className="relative z-10">{label}</span>
    </Link>
  );
}

