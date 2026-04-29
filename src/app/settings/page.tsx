"use client";

import { motion } from "motion/react";
import { User, Bell, Shield, LogOut, Check, Settings as SettingsIcon, Info, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function Settings() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (!user) {
         setActiveTab('general');
      }
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setActiveTab((prev) => ['profile', 'security', 'notifications'].includes(prev) ? 'general' : prev);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full pt-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderContent = () => {
    if (activeTab === 'general') {
      return (
        <div className="bg-card p-8 rounded-2xl border border-border space-y-6">
          <h2 className="text-xl font-semibold border-b border-white/5 pb-4">General Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Theme</p>
                <p className="text-sm text-white/40">Choose your preferred appearance.</p>
              </div>
              <select className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm outline-none focus:border-primary text-white cursor-pointer">
                <option value="dark" className="bg-background text-white">Dark</option>
                <option value="light" className="bg-background text-white">Light</option>
                <option value="system" className="bg-background text-white">System</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Data Saver</p>
                <p className="text-sm text-white/40">Stream lower quality audio to save data.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'about') {
      return (
        <div className="bg-card p-8 rounded-2xl border border-border space-y-6">
          <h2 className="text-xl font-semibold border-b border-white/5 pb-4">About</h2>
          <div className="space-y-4">
            <p className="text-white/60 font-medium">Vibestream v1.0.0</p>
            <p className="text-sm text-white/40">
              The ultimate music streaming experience. Made for music lovers.
            </p>
            <div className="pt-4 flex gap-4">
               <Link href="/terms" className="text-sm text-primary hover:underline">Terms of Service</Link>
               <Link href="/privacy" className="text-sm text-primary hover:underline">Privacy Policy</Link>
            </div>
          </div>
        </div>
      );
    }

    if (!user) {
       return (
         <div className="bg-card p-8 rounded-2xl border border-border flex flex-col items-center justify-center py-16 text-center space-y-4">
            <User className="w-12 h-12 text-white/20" />
            <div>
              <h2 className="text-xl font-bold">Sign in required</h2>
              <p className="text-white/40 text-sm mt-1">Please sign in to view your account settings.</p>
            </div>
            <Link href="/login" className="bg-primary text-black px-6 py-2 rounded-full font-bold mt-4 hover:scale-105 transition-transform">
              Sign In
            </Link>
         </div>
       );
    }

    if (activeTab === 'profile') {
      return (
        <>
          <div className="bg-card p-8 rounded-2xl border border-border space-y-6">
            <h2 className="text-xl font-semibold border-b border-white/5 pb-4">Public Profile</h2>
            
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-secondary to-primary p-[2px]">
                  <div className="w-full h-full rounded-full overflow-hidden bg-accent">
                    <img src={user?.user_metadata?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200"} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform shadow-lg cursor-pointer">
                  <User className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 space-y-2">
                <button className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer">Change Picture</button>
                <button className="text-sm text-red-500 hover:text-red-400 font-medium px-4 py-2 ml-2 transition-colors cursor-pointer">Remove</button>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/40">Display Name</label>
                <input type="text" defaultValue={user?.user_metadata?.full_name || ""} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary transition-all text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/40">Email</label>
                <input type="email" defaultValue={user?.email || ""} readOnly className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none opacity-50 cursor-not-allowed text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/40">Bio</label>
                <textarea rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary transition-all resize-none text-white" defaultValue="Music enthusiast & producer. Living in the synthwave world. 🎹✨"></textarea>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button className="bg-primary hover:bg-primary/90 text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-primary/10">
                <Check className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </div>

          <div className="bg-red-500/5 p-8 rounded-2xl border border-red-500/20 space-y-6">
             <h2 className="text-xl font-semibold text-red-400">Danger Zone</h2>
             <p className="text-sm text-white/40">Once you delete your account, there is no going back. Please be certain.</p>
             <button className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer">
                <LogOut className="w-4 h-4" /> Delete Account
             </button>
          </div>
        </>
      );
    }
    
    if (activeTab === 'security') {
       return (
         <div className="bg-card p-8 rounded-2xl border border-border space-y-6">
            <h2 className="text-xl font-semibold border-b border-white/5 pb-4">Security</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/40">Current Password</label>
                <input type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary transition-all text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/40">New Password</label>
                <input type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary transition-all text-white" />
              </div>
              <div className="flex justify-end pt-4">
                <button className="bg-primary hover:bg-primary/90 text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-primary/10">
                  <Check className="w-4 h-4" /> Update Password
                </button>
              </div>
            </div>
         </div>
       );
    }

    if (activeTab === 'notifications') {
       return (
         <div className="bg-card p-8 rounded-2xl border border-border space-y-6">
            <h2 className="text-xl font-semibold border-b border-white/5 pb-4">Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-white/40">Receive emails about new releases and updates.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
         </div>
       );
    }

    return null;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl pb-10">
      <h1 className="text-4xl font-bold mb-8 tracking-tighter">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="space-y-1 md:col-span-1">
          <button 
            onClick={() => setActiveTab('general')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'general' ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
          >
            <SettingsIcon className="w-4 h-4" /> General
          </button>
          
          {user && (
            <>
              <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
              >
                <User className="w-4 h-4" /> Profile
              </button>
              <button 
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'security' ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
              >
                <Shield className="w-4 h-4" /> Security
              </button>
              <button 
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'notifications' ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
              >
                <Bell className="w-4 h-4" /> Notifications
              </button>
            </>
          )}

          <button 
            onClick={() => setActiveTab('about')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'about' ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
          >
            <Info className="w-4 h-4" /> About
          </button>
        </div>

        {/* Content Area */}
        <div className="md:col-span-3 space-y-8">
          {renderContent()}
        </div>
      </div>
    </motion.div>
  );
}
