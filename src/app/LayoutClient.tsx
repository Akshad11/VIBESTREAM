"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Player from "./components/Player";
import { MusicProvider } from "./context/MusicContext";
import AddToPlaylistModal from "./components/AddToPlaylistModal";

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
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
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-b from-secondary/5 to-transparent">
            <Header />
            <main className="flex-1 overflow-y-auto px-8 pb-8 pt-4 relative custom-scrollbar">
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
