"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import UploadBox from "../components/UploadBox";
import { Loader2, Lock } from "lucide-react";
import Link from "next/link";

export default function UploadPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // We'll show a "Must Login" state instead of immediate redirect
        // to give a better user experience
        setLoading(false);
      } else {
        setUser(user);
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
          <Lock className="w-10 h-10 text-white/20" />
        </div>
        <h2 className="text-3xl font-black mb-4 tracking-tighter uppercase">Members Only</h2>
        <p className="text-white/40 max-w-md mb-8">
          You need to be logged in to upload songs and share your music with the world.
        </p>
        <div className="flex gap-4">
          <Link href="/login" className="bg-primary text-black px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform">
            Sign In
          </Link>
          <Link href="/register" className="bg-white/5 text-white border border-white/10 px-8 py-3 rounded-xl font-bold hover:bg-white/10 transition-all">
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-black mb-4 tracking-tighter uppercase">Share Your Sound</h1>
        <p className="text-white/40">Upload your tracks and reach listeners worldwide. High-quality audio and stunning cover art make the best impression.</p>
      </div>
      
      <UploadBox />
    </div>
  );
}
