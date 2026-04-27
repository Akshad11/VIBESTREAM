"use client";

import AuthCard from "../components/AuthCard";
import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (data.session) {
        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Enter your details to access your music."
      bottomText="Don't have an account?"
      bottomLinkText="Sign up"
      bottomLinkHref="/register"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-2 relative">
           <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
           <input 
             type="email" 
             placeholder="Email address" 
             required
             value={email}
             onChange={(e) => setEmail(e.target.value)}
             className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-sm outline-none focus:border-primary transition-all placeholder:text-white/20"
           />
        </div>
        <div className="space-y-2 relative">
           <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
           <input 
             type="password" 
             placeholder="Password" 
             required
             value={password}
             onChange={(e) => setPassword(e.target.value)}
             className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-sm outline-none focus:border-primary transition-all placeholder:text-white/20"
           />
        </div>

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input type="checkbox" className="rounded bg-white/5 border-white/10 text-primary accent-primary w-4 h-4" />
            <span className="text-white/40 group-hover:text-white transition-colors pt-0.5">Remember me</span>
          </label>
          <a href="#" className="text-primary hover:underline font-bold pt-0.5">Forgot password?</a>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90 text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-lg shadow-primary/10 disabled:opacity-70 disabled:hover:scale-100 cursor-pointer"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>Sign in <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </form>

      <div className="mt-8 flex items-center gap-4 before:flex-1 before:border-t before:border-white/5 after:flex-1 after:border-t after:border-white/5">
        <span className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-bold">Or continue with</span>
      </div>

      <button 
        type="button"
        onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
        className="mt-8 w-full bg-white/5 hover:bg-white/10 border border-white/10 py-3.5 rounded-xl font-bold flex items-center justify-center gap-3 transition-all text-sm cursor-pointer"
      >
        Google
      </button>
    </AuthCard>
  );
}
