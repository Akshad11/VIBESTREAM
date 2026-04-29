"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl pb-20 pt-10">
      <Link href="/settings" className="inline-flex items-center text-sm text-white/40 hover:text-white transition-colors mb-8">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Settings
      </Link>
      <h1 className="text-4xl font-bold mb-4 tracking-tighter">Terms of Service</h1>
      <p className="text-white/60 mb-8">Last Updated: April 2026</p>

      <div className="space-y-8 text-white/80 leading-relaxed">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Vibestream, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service. We reserve the right to modify these terms at any time, and such modifications shall be effective immediately upon posting.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">2. User Accounts</h2>
          <p>
            To use certain features of Vibestream, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">3. Content and Intellectual Property</h2>
          <p>
            All music, artwork, and other content available on Vibestream is protected by copyright and other intellectual property laws. You may not reproduce, distribute, or create derivative works from this content without explicit permission from the rights holders. 
          </p>
          <p>
            If you upload content to Vibestream, you retain your rights to it, but you grant us a worldwide, non-exclusive license to host, play, and distribute your content within the platform.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">4. Acceptable Use</h2>
          <p>
            You agree not to use Vibestream for any unlawful purpose or in any way that interrupts, damages, or impairs the service. Prohibited activities include, but are not limited to, scraping content, attempting to breach security measures, or harassing other users.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">5. Termination</h2>
          <p>
            We may suspend or terminate your account and access to the service at our sole discretion, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason.
          </p>
        </section>
      </div>
    </motion.div>
  );
}
