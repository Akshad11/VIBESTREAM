"use client";

import { motion } from "motion/react";
import { User, Bell, Shield, LogOut, Check } from "lucide-react";

export default function Settings() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl pb-10">
      <h1 className="text-4xl font-bold mb-8 tracking-tighter">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation Sidebar (internal) */}
        <div className="space-y-1 md:col-span-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-white/10 text-white">
            <User className="w-4 h-4" /> Profile
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/40 hover:bg-white/5 hover:text-white transition-colors">
            <Shield className="w-4 h-4" /> Security
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/40 hover:bg-white/5 hover:text-white transition-colors">
            <Bell className="w-4 h-4" /> Notifications
          </button>
        </div>

        {/* Content Area */}
        <div className="md:col-span-3 space-y-8">
          
          <div className="bg-card p-8 rounded-2xl border border-border space-y-6">
            <h2 className="text-xl font-semibold border-b border-white/5 pb-4">Public Profile</h2>
            
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-secondary to-primary p-[2px]">
                  <div className="w-full h-full rounded-full overflow-hidden bg-accent">
                    <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200" alt="Avatar" className="w-full h-full object-cover" />
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
                <input type="text" defaultValue="Alex Doe" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/40">Username</label>
                <input type="text" defaultValue="@alexdoe" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/40">Bio</label>
                <textarea rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary transition-all resize-none" defaultValue="Music enthusiast & producer. Living in the synthwave world. 🎹✨"></textarea>
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

        </div>
      </div>
    </motion.div>
  );
}
