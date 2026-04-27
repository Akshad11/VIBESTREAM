'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 bg-card rounded-3xl border border-border mt-10">
      <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="w-10 h-10 text-red-500" />
      </div>
      <h2 className="text-3xl font-black mb-4 tracking-tighter">Something went wrong!</h2>
      <p className="text-white/40 max-w-md mb-8">
        We encountered an unexpected error. This might be due to a connection issue or a missing configuration.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="bg-primary text-black px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer"
        >
          <RefreshCcw className="w-4 h-4" /> Try Again
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="bg-white/5 text-white border border-white/10 px-8 py-3 rounded-xl font-bold transition-all hover:bg-white/10 cursor-pointer"
        >
          Go Home
        </button>
      </div>
      
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-12 p-4 bg-black/40 rounded-xl text-left max-w-2xl overflow-auto border border-white/5">
            <p className="text-xs font-mono text-red-400">{error.message}</p>
        </div>
      )}
    </div>
  );
}
