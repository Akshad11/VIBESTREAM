"use client";

import { Bell, Search, User, LogOut, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Header() {
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
    <header className="flex items-center justify-between px-8 py-6 z-10 bg-transparent">
      <div className="flex-1 max-w-md">
        <div className="flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-2 w-96 transition-all group focus-within:border-white/20">
          <Search className="text-white/40 w-4 h-4 mr-3 group-focus-within:text-white/80 transition-colors" />
          <input
            type="text"
            placeholder="Artists, songs, or podcasts"
            value={searchValue}
            onChange={handleSearch}
            className="w-full bg-transparent outline-none text-sm placeholder:text-white/20 text-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 ml-4">
        <button className="relative p-2 text-white/40 hover:text-white transition-colors cursor-pointer">
          <Bell className="w-6 h-6" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-background"></span>
        </button>
        
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin text-white/20" />
        ) : user ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="w-10 h-10 rounded-full border-2 border-primary/50 p-0.5 group-hover:border-primary transition-colors">
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
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
             <Link href="/login" className="text-sm font-bold text-white/60 hover:text-white transition-colors">Sign In</Link>
             <Link href="/register" className="bg-primary text-black px-5 py-2 rounded-full text-sm font-bold hover:scale-105 transition-transform">Get Started</Link>
          </div>
        )}
      </div>
    </header>
  );
}
