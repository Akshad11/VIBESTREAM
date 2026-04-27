"use client";

import AuthCard from "../components/AuthCard";
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (authError) throw authError;

      if (data.session) {
        router.push("/");
      } else {
        setError("Please check your email to confirm your account.");
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "An error occurred during registration.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      title="Create account"
      subtitle="Join VibeStream and start your musical journey."
      bottomText="Already have an account?"
      bottomLinkText="Sign in"
      bottomLinkHref="/login"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}
        
        <div className="space-y-2 relative">
           <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
           <input 
             type="text" 
             placeholder="Full Name" 
             required
             value={fullName}
             onChange={(e) => setFullName(e.target.value)}
             className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-sm outline-none focus:border-primary transition-all placeholder:text-white/20"
           />
        </div>
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

        <p className="text-[10px] text-white/40 leading-relaxed px-1">
          By signing up, you agree to our <a href="#" className="text-white hover:underline">Terms of Service</a> and <a href="#" className="text-white hover:underline">Privacy Policy</a>.
        </p>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90 text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-lg shadow-primary/10 disabled:opacity-70 disabled:hover:scale-100 cursor-pointer mt-4"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>Get Started <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </form>
    </AuthCard>
  );
}
