"use client";

import { Bell, Search, User, LogOut, Loader2, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Header({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();
    
    // Sync search value from URL
    const params = new URLSearchParams(window.location.search);
    setSearchValue(params.get("search") || "");

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);
    
    // Update URL query param
    const params = new URLSearchParams(window.location.search);
    if (val) params.set("search", val);
    else params.delete("search");
    
    router.push(`/?${params.toString()}`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="flex items-center justify-between px-4 md:px-8 py-4 md:py-6 z-10 bg-transparent gap-4">
      <div className="flex items-center gap-4 flex-1">
        <button className="lg:hidden p-2 -ml-2 text-white/60 hover:text-white" onClick={onMenuToggle}>
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex-1 max-w-md">
          <div className="flex items-center bg-white/5 border border-white/10 rounded-full px-3 md:px-4 py-2 w-full transition-all group focus-within:border-white/20">
            <Search className="text-white/40 w-4 h-4 mr-2 md:mr-3 group-focus-within:text-white/80 transition-colors" />
            <input
              type="text"
              placeholder="Search..."
              value={searchValue}
              onChange={handleSearch}
              className="w-full bg-transparent outline-none text-xs md:text-sm placeholder:text-white/20 text-white"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
        <button className="relative p-2 text-white/40 hover:text-white transition-colors cursor-pointer hidden sm:block">
          <Bell className="w-5 h-5 md:w-6 md:h-6" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background"></span>
        </button>
        
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin text-white/20" />
        ) : user ? (
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-primary/50 p-0.5 group-hover:border-primary transition-colors">
                <img 
                  src={user.user_metadata?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"} 
                  className="w-full h-full rounded-full object-cover" 
                  alt="Profile" 
                />
              </div>
              <div className="hidden lg:block">
                <p className="font-bold text-xs text-white truncate max-w-[100px]">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-white/40 hover:text-red-400 transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 md:gap-3">
             <Link href="/login" className="text-xs md:text-sm font-bold text-white/60 hover:text-white transition-colors">Sign In</Link>
             <Link href="/register" className="bg-primary text-black px-3 py-1.5 md:px-5 md:py-2 rounded-full text-xs md:text-sm font-bold hover:scale-105 transition-transform whitespace-nowrap">Get Started</Link>
          </div>
        )}
      </div>
    </header>
  );
}
