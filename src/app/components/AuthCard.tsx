import { motion } from "motion/react";
import Link from "next/link";
import { ListMusic } from "lucide-react";

export default function AuthCard({ children, title, subtitle, bottomText, bottomLinkText, bottomLinkHref }: any) {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] -z-10" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
             <span className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground shadow-[0_0_20px_rgba(0,255,102,0.6)]">
              <ListMusic size={22} />
            </span>
            <span className="text-3xl font-display font-bold track">VibeStream</span>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-2xl shadow-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent rounded-2xl pointer-events-none" />
          
          <div className="mb-8 text-center relative z-10">
            <h1 className="text-2xl font-semibold mb-2">{title}</h1>
            <p className="text-muted-foreground text-sm">{subtitle}</p>
          </div>

          <div className="relative z-10">
            {children}
          </div>

          <div className="mt-8 text-center text-sm text-muted-foreground relative z-10">
            {bottomText}{" "}
            <Link href={bottomLinkHref} className="text-primary hover:underline font-medium">
              {bottomLinkText}
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
