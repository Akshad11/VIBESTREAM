import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials missing in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const TEST_DATA_DIR = './test data';
const SONGS_BUCKET = 'music';

async function seed() {
  console.log('🚀 Starting Seeder...');

  if (!fs.existsSync(TEST_DATA_DIR)) {
    console.error('❌ Test data directory not found');
    return;
  }

  const files = fs.readdirSync(TEST_DATA_DIR).filter(file => file.endsWith('.mp3'));

  for (const file of files) {
    const filePath = path.join(TEST_DATA_DIR, file);
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = file.replace('.mp3', '');
    const storagePath = `seed-${Date.now()}-${file}`;

    console.log(`📦 Uploading ${file}...`);

    // 1. Upload to Storage
    const { error: uploadError } = await supabase.storage
      .from(SONGS_BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType: 'audio/mpeg',
        upsert: true
      });

    if (uploadError) {
      console.error(`❌ Error uploading ${file}:`, uploadError.message);
      continue;
    }

    // 2. Insert into Database
    console.log(`📝 Inserting record for ${fileName}...`);
    const { error: dbError } = await supabase
      .from('songs')
      .insert({
        title: fileName,
        artist: 'Various Artists',
        song_path: storagePath,
        image_path: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=300'
      });

    if (dbError) {
      console.error(`❌ Error inserting ${file}:`, dbError.message);
    } else {
      console.log(`✅ Successfully seeded ${file}`);
    }
  }

  console.log('🎉 Seeding completed!');
}

seed();
