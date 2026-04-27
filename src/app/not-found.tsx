import Link from 'next/link';
import { Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 bg-card rounded-3xl border border-border mt-10">
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <Search className="w-10 h-10 text-primary" />
      </div>
      <h2 className="text-3xl font-black mb-4 tracking-tighter">Page Not Found</h2>
      <p className="text-white/40 max-w-md mb-8">
        The track or page you are looking for doesn't exist or has been moved to a different playlist.
      </p>
      <Link
        href="/"
        className="bg-primary text-black px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
