"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl pb-20 pt-10">
      <Link href="/settings" className="inline-flex items-center text-sm text-white/40 hover:text-white transition-colors mb-8">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Settings
      </Link>
      <h1 className="text-4xl font-bold mb-4 tracking-tighter">Privacy Policy</h1>
      <p className="text-white/60 mb-8">Last Updated: April 2026</p>

      <div className="space-y-8 text-white/80 leading-relaxed">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">1. Information We Collect</h2>
          <p>
            When you use Vibestream, we collect information you provide directly to us, such as when you create an account, update your profile, or contact support. This includes your name, email address, and any profile pictures or bio information you choose to share.
          </p>
          <p>
            We also automatically collect certain information about your device and usage of the service, including your IP address, browser type, listening history, and interaction with the platform.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">2. How We Use Your Information</h2>
          <p>
            We use the information we collect to provide, maintain, and improve our services. This includes personalizing your experience, recommending music based on your listening history, processing transactions, and sending you technical notices or promotional messages (if you've opted in).
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">3. Information Sharing</h2>
          <p>
            We do not sell your personal information. We may share your information with third-party service providers who perform services on our behalf, such as hosting, data analysis, and customer service. These providers are bound by strict confidentiality agreements.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">4. Data Security</h2>
          <p>
            We implement reasonable security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no data transmission over the internet or electronic storage system is completely secure, so we cannot guarantee absolute security.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">5. Your Rights</h2>
          <p>
            You have the right to access, correct, or delete your personal information. You can manage most of this information directly from your account settings. If you need further assistance, please contact our privacy team.
          </p>
        </section>
      </div>
    </motion.div>
  );
}
