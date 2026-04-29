"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Player from "./components/Player";
import { MusicProvider } from "./context/MusicContext";
import AddToPlaylistModal from "./components/AddToPlaylistModal";

import { useState } from "react";
import { cn } from "@/lib/utils";

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Define routes where sidebar and player should be hidden
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage) {
    return (
      <MusicProvider>
        <main className="h-full overflow-y-auto">
          {children}
        </main>
      </MusicProvider>
    );
  }

  return (
    <MusicProvider>
      <div className="h-full flex flex-col bg-background text-foreground overflow-hidden font-sans">
        <div className="flex flex-1 min-h-0 overflow-hidden relative">
          {/* Mobile Overlay */}
          <div 
            className={cn("fixed inset-0 bg-black/80 z-40 lg:hidden", isMobileMenuOpen ? "block" : "hidden")} 
            onClick={() => setIsMobileMenuOpen(false)} 
          />
          
          {/* Sidebar Container */}
          <div className={cn(
            "absolute lg:static inset-y-0 left-0 z-50 transform lg:transform-none transition-transform duration-300 w-64 h-full", 
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}>
            <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
          </div>

          <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-b from-secondary/5 to-transparent w-full">
            <Header onMenuToggle={() => setIsMobileMenuOpen(true)} />
            <main className="flex-1 overflow-y-auto px-4 md:px-8 pb-20 md:pb-8 pt-4 relative custom-scrollbar">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </main>
          </div>
        </div>
        <Player />
        <AddToPlaylistModal />
      </div>
    </MusicProvider>
  );
}
