-- 1. SONGS TABLE
CREATE TABLE IF NOT EXISTS songs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  song_path TEXT NOT NULL, -- Will store audio path in the 'music' bucket
  image_path TEXT,         -- Will store image URL from the 'music' bucket
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT true NOT NULL
);

-- Note: Run this if the table already exists:
-- ALTER TABLE songs ADD COLUMN is_public BOOLEAN DEFAULT true NOT NULL;

-- 2. ENABLE ROW LEVEL SECURITY
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;

-- 3. CREATE POLICIES
CREATE POLICY "Public songs are viewable by everyone" ON songs FOR SELECT USING (true);
CREATE POLICY "Users can insert their own songs" ON songs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own songs" ON songs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own songs" ON songs FOR DELETE USING (auth.uid() = user_id);

-- First, remove the old policy to avoid conflicts
DROP POLICY IF EXISTS "Users can insert their own songs" ON songs;

-- Create the new, more robust policy
CREATE POLICY "Users can insert their own songs" 
ON songs FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to upload files to the 'music' bucket
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'music');

CREATE TABLE IF NOT EXISTS recently_played (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(user_id, song_id)
);

-- Enable Security
ALTER TABLE recently_played ENABLE ROW LEVEL SECURITY;

-- Security Policies
CREATE POLICY "Users can view their own history" ON recently_played FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own history" ON recently_played FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can edit their own history" ON recently_played FOR UPDATE USING (auth.uid() = user_id);


-- Create the favorites table
CREATE TABLE public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  -- Ensure a user can only favorite a specific song once
  UNIQUE(user_id, song_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own favorites
CREATE POLICY "Users can view their own favorites" 
ON public.favorites FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can insert their own favorites
CREATE POLICY "Users can insert their own favorites" 
ON public.favorites FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own favorites
CREATE POLICY "Users can delete their own favorites" 
ON public.favorites FOR DELETE 
USING (auth.uid() = user_id);



-- Create Playlists table
CREATE TABLE public.playlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Playlist Songs join table
CREATE TABLE public.playlist_songs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE NOT NULL,
  song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(playlist_id, song_id) -- Prevents adding the same song to the same playlist twice
);

-- Enable RLS
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;

-- Policies for Playlists
CREATE POLICY "Users can view their own playlists" ON public.playlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own playlists" ON public.playlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own playlists" ON public.playlists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own playlists" ON public.playlists FOR DELETE USING (auth.uid() = user_id);

-- Policies for Playlist Songs
-- Allow users to view songs in their own playlists
CREATE POLICY "Users can view songs in their playlists" ON public.playlist_songs FOR SELECT
USING (EXISTS (SELECT 1 FROM public.playlists WHERE id = playlist_id AND user_id = auth.uid()));

-- Allow users to add/delete songs in their own playlists
CREATE POLICY "Users can modify songs in their playlists" ON public.playlist_songs FOR ALL
USING (EXISTS (SELECT 1 FROM public.playlists WHERE id = playlist_id AND user_id = auth.uid()));
