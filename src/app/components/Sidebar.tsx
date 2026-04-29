"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Library, PlusSquare, ListMusic, Heart, Settings, X } from "lucide-react";
import { cn } from "@/lib/utils";

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

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  return (
    <aside className="w-64 h-full flex-shrink-0 flex flex-col bg-black lg:bg-black/40 border-r border-white/5 relative">
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/40 hover:text-white lg:hidden"
        >
          <X className="w-6 h-6" />
        </button>
      )}
      
      <div className="p-6 mb-4">
        <Link href="/" className="flex items-center gap-3 mb-10" onClick={onClose}>
          <div className="w-[60px] h-[60px] flex-shrink-0 flex items-center justify-center overflow-hidden">
            <img src="/logo.png" className="w-full h-full object-contain" alt="VibeStream Logo" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white">VIBESTREAM</span>
        </Link>
      </div>

      <nav className="flex-1 px-6 space-y-6 overflow-y-auto">
        <div>
          <h2 className="text-[10px] uppercase tracking-widest text-white/30 mb-4">
            Menu
          </h2>
          <div className="space-y-1">
            {mainLinks.map((link, idx) => (
              <SidebarLink key={link.href || String(idx)} icon={link.icon} label={link.label} href={link.href} onClick={onClose} />
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-[10px] uppercase tracking-widest text-white/30 mb-4">
            Library
          </h2>
          <div className="space-y-1">
            {secondaryLinks.map((link, idx) => (
              <SidebarLink key={link.href || String(idx)} icon={link.icon} label={link.label} href={link.href} onClick={onClose} />
            ))}
          </div>
        </div>
      </nav>

      <div className="p-6 mt-auto">
        <div className="h-4" />
        <SidebarLink icon={Settings} label="Settings" href="/settings" onClick={onClose} />
      </div>
    </aside>
  );
}

const SidebarLink: React.FC<{ icon: any; label: string; href: string; onClick?: () => void }> = ({ icon: Icon, label, href, onClick }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
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

