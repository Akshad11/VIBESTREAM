"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UploadCloud, FileMusic, CheckCircle2, X, Music2, Image as ImageIcon, Loader2, AlertCircle, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import * as mm from "music-metadata";

interface QueuedFile {
  id: string;
  file: File;
  title: string;
  artist: string;
  status: 'idle' | 'uploading' | 'success' | 'error';
  errorMessage?: string;
  coverArt?: File;
  duration?: number;
}

export default function UploadBox() {
  const [isDragging, setIsDragging] = useState(false);
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [globalArtist, setGlobalArtist] = useState("");
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragging(true);
    else if (e.type === "dragleave") setIsDragging(false);
  };

  const addFilesToQueue = async (files: FileList | null) => {
    if (!files) return;
    
    const newFiles: QueuedFile[] = [];
    
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("audio/")) continue;

      let title = file.name.replace(/\.[^/.]+$/, "");
      let artist = globalArtist || "Unknown Artist";
      let coverArt: File | undefined = undefined;
      let duration: number | undefined = undefined;
      
      try {
        const metadata = await mm.parseBlob(file);
        if (metadata.common.title) title = metadata.common.title;
        if (metadata.common.artist) artist = metadata.common.artist;
        if (metadata.format.duration) duration = Math.floor(metadata.format.duration);
        
        if (metadata.common.picture && metadata.common.picture.length > 0) {
           const pic = metadata.common.picture[0];
           const blob = new Blob([pic.data as any], { type: pic.format });
           coverArt = new File([blob], `cover-${Math.random().toString(36).substr(2, 5)}.jpg`, { type: pic.format });
           
           if (!imageFile) {
             setImageFile(coverArt);
           }
        }
      } catch (err) {
        console.warn("Failed to parse metadata for", file.name, err);
      }

      newFiles.push({
        id: Math.random().toString(36).substr(2, 9),
        file,
        title,
        artist,
        status: 'idle',
        coverArt,
        duration
      });
    }
    
    setQueue(prev => [...prev, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    addFilesToQueue(e.dataTransfer.files);
  };

  const handleAudioInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFilesToQueue(e.target.files);
  };

  const handleImageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  const removeFromQueue = (id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  };

  const updateQueueItem = (id: string, updates: Partial<QueuedFile>) => {
    setQueue(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const handleUpload = async () => {
    if (queue.length === 0) {
        setError("Please add at least one audio file.");
        return;
    }
    
    setError(null);
    setUploading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      for (const item of queue) {
        if (item.status === 'success') continue;

        updateQueueItem(item.id, { status: 'uploading' });

        try {
          let isPublic = true;

          const { data: existing } = await supabase
            .from("songs")
            .select("id, is_public")
            .eq("user_id", user?.id)
            .ilike("title", item.title)
            .ilike("artist", item.artist)
            .eq("is_public", true)
            .limit(1);

          if (existing && existing.length > 0) {
             const skip = window.confirm(`"${item.title}" by ${item.artist} is already published in your library.\n\nClick OK to SKIP this file.\nClick Cancel to upload it as a PRIVATE track instead.`);
             if (skip) {
                updateQueueItem(item.id, { status: 'success' });
                continue;
             } else {
                isPublic = false;
             }
          }

          const timestamp = Date.now();
          const audioPath = `song-${timestamp}-${item.file.name}`;
          let imagePath = "";

          const { error: audioError } = await supabase.storage
            .from("music")
            .upload(audioPath, item.file);

          if (audioError) throw audioError;

          const activeCover = item.coverArt || imageFile;
          if (activeCover) {
            imagePath = `image-${timestamp}-${activeCover.name}`;
            const { error: imageError } = await supabase.storage
              .from("music")
              .upload(imagePath, activeCover);
            
            if (imageError && imageError.message !== "The resource already exists") throw imageError;
          }

          const { error: dbError } = await supabase
            .from("songs")
            .insert({
              title: item.title,
              artist: item.artist,
              song_path: audioPath,
              image_path: imagePath ? supabase.storage.from("music").getPublicUrl(imagePath).data.publicUrl : null,
              user_id: user?.id,
              is_public: isPublic,
              duration: item.duration
            });

          if (dbError) throw dbError;

          updateQueueItem(item.id, { status: 'success' });
        } catch (err: any) {
          console.error(`Failed to upload ${item.file.name}:`, err);
          updateQueueItem(item.id, { status: 'error', errorMessage: err.message });
        }
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setQueue([]);
        setImageFile(null);
        router.push("/");
        router.refresh();
      }, 3000);

    } catch (err: any) {
      console.error("Batch upload failed:", err);
      setError(err.message || "An unexpected error occurred during upload.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-4 space-y-8">
      {/* Step 1: Dropzone */}
      <div 
        className={`relative border-2 border-dashed rounded-3xl p-12 transition-all duration-300 flex flex-col items-center justify-center text-center group ${
          isDragging ? "border-primary bg-primary/5 neon-glow-primary" : "border-white/10 bg-card/50 hover:border-white/20"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          multiple
          accept=".mp3,.wav,.flac" 
          onChange={handleAudioInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
        />
        
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 pointer-events-none group-hover:scale-110 transition-transform">
          <UploadCloud className={`w-10 h-10 transition-colors duration-300 ${isDragging || queue.length > 0 ? "text-primary" : "text-white/20"}`} />
        </div>
        
        <h3 className="text-xl font-bold mb-2 pointer-events-none">Select multiple tracks</h3>
        <p className="text-sm text-white/40 pointer-events-none max-w-xs">Drag and drop your MP3, WAV or FLAC files here. You can edit titles before publishing.</p>
      </div>

      {/* Step 2: Queue & Details */}
      <AnimatePresence>
        {queue.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* List of Files */}
            <div className="lg:col-span-2 space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-widest text-white/40 flex items-center justify-between">
                Upload Queue ({queue.length})
                <button onClick={() => setQueue([])} className="text-red-400 hover:underline text-[10px] cursor-pointer">Clear All</button>
              </h4>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {queue.map((item) => (
                  <motion.div 
                    key={item.id}
                    layout
                    className={`bg-white/5 border rounded-2xl p-4 flex items-center gap-4 group transition-all ${
                        item.status === 'error' ? 'border-red-500/20 bg-red-500/5' : 
                        item.status === 'success' ? 'border-primary/20 bg-primary/5' : 'border-white/10'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 overflow-hidden border border-white/10 relative">
                      {item.coverArt ? (
                         <img src={URL.createObjectURL(item.coverArt)} className="w-full h-full object-cover opacity-60" alt="Cover" />
                      ) : (
                         <Music2 className="w-5 h-5 text-white/20" />
                      )}
                      
                      {item.status === 'uploading' && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        </div>
                      )}
                      {item.status === 'success' && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <input 
                        type="text" 
                        value={item.title}
                        onChange={(e) => updateQueueItem(item.id, { title: e.target.value })}
                        disabled={uploading || item.status === 'success'}
                        className="w-full bg-transparent border-none outline-none text-sm font-bold text-white placeholder:text-white/20"
                        placeholder="Song title"
                      />
                      <input 
                        type="text" 
                        value={item.artist}
                        onChange={(e) => updateQueueItem(item.id, { artist: e.target.value })}
                        disabled={uploading || item.status === 'success'}
                        className="w-full bg-transparent border-none outline-none text-[10px] text-white/40 font-medium"
                        placeholder="Artist name"
                      />
                    </div>
                    <button 
                        onClick={() => removeFromQueue(item.id)}
                        disabled={uploading || item.status === 'success'}
                        className="p-2 text-white/10 hover:text-red-400 transition-colors cursor-pointer disabled:opacity-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Global Options */}
            <div className="space-y-6">
              <div className="bg-card p-6 rounded-3xl border border-white/10 space-y-6 sticky top-8">
                <h4 className="text-sm font-bold uppercase tracking-widest text-white/40">Global Settings</h4>
                
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/30 mb-2">Default Artist</label>
                  <input 
                    type="text" 
                    value={globalArtist}
                    onChange={(e) => {
                        setGlobalArtist(e.target.value);
                        setQueue(q => q.map(item => ({ ...item, artist: e.target.value })));
                    }}
                    placeholder="e.g. M83"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/30 mb-2">Cover Art (All Tracks)</label>
                  <div className="relative group cursor-pointer">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageInput}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="bg-white/5 border border-dashed border-white/10 rounded-xl p-4 flex items-center gap-4 group-hover:bg-white/10 transition-all">
                         <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center overflow-hidden">
                           {imageFile ? <img src={URL.createObjectURL(imageFile)} className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 text-white/20" />}
                         </div>
                         <div className="flex-1">
                           <p className="text-[10px] font-bold truncate">{imageFile ? imageFile.name : "Single cover art"}</p>
                           <p className="text-[8px] text-white/40 uppercase">Optional</p>
                         </div>
                      </div>
                  </div>
                </div>

                <button
                  onClick={handleUpload}
                  disabled={uploading || queue.length === 0}
                  className="w-full bg-primary hover:bg-primary/90 text-black py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg shadow-primary/20 mt-4"
                >
                  {uploading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Publishing...</>
                  ) : (
                    <><Music2 className="w-5 h-5 group-hover:scale-110 transition-transform" /> Publish All</>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-sm flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold mb-1">Upload Error</p>
              <p className="text-xs opacity-80">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-32 right-8 bg-primary text-black px-8 py-5 rounded-3xl shadow-2xl flex items-center gap-4 z-50 font-black text-lg"
          >
            <CheckCircle2 className="w-8 h-8" />
            Successfully Published!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
