import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Server } from 'lucide-react';

const Privacy: React.FC = () => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-4xl mx-auto font-body text-white/80">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Header */}
        <div className="mb-16 border-b border-white/10 pb-8">
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50">
            PRIVACY POLICY
          </h1>
          <p className="text-white/40 uppercase tracking-widest text-sm">Last Updated: [Insert Date]</p>
        </div>

        {/* Content Container */}
        <div className="space-y-12">
          
          <section>
            <h2 className="font-display text-2xl text-white mb-4">Introduction</h2>
            <p className="leading-relaxed">
              Welcome to Gaya3 ("we," "our," or "us"). We are committed to protecting your privacy and ensuring you have a positive experience on our experiential booking platform and AI concierge service. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our mobile application.
              <br /><br />
              By accessing Gaya3, you consent to the data practices described in this policy.
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
            <h2 className="font-display text-xl text-white mb-6 flex items-center gap-3">
              <Eye className="text-white/50" size={20} />
              1. Information We Collect
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-white mb-2">A. Personal Information Provided by You</h3>
                <ul className="list-disc pl-5 space-y-2 text-white/70">
                  <li><strong className="text-white">Identity Data:</strong> Name, profile picture (avatar), and member status.</li>
                  <li><strong className="text-white">Contact Data:</strong> Email address and phone number.</li>
                  <li><strong className="text-white">Financial Data:</strong> Payment card details (processed via secure third-party payment gateways).</li>
                  <li><strong className="text-white">Transaction Data:</strong> Details about properties you have booked.</li>
                  <li><strong className="text-white">AI Interaction Data:</strong> Conversations with the "Gaya" AI Concierge.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-white mb-2">B. Information Collected Automatically</h3>
                <ul className="list-disc pl-5 space-y-2 text-white/70">
                  <li><strong className="text-white">Geolocation Data:</strong> Collected if you grant permission for "Maps" mode.</li>
                  <li><strong className="text-white">Device Data:</strong> Information about your device, browser, and OS.</li>
                  <li><strong className="text-white">Usage Data:</strong> Interactions with UI elements and dwell time.</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl text-white mb-4">2. How We Use Your Information</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Service Delivery & Booking Management",
                "AI Concierge Personalization",
                "Vibe-Based Search Customization",
                "Transaction Communications",
                "Fraud Prevention & Security"
              ].map((item, i) => (
                <li key={i} className="bg-white/5 rounded-xl p-4 border border-white/5 text-sm flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-white/10 rounded-3xl p-8">
            <h2 className="font-display text-xl text-white mb-4 flex items-center gap-3">
              <Server className="text-purple-400" size={20} />
              3. AI and Voice Processing
            </h2>
            <p className="leading-relaxed mb-4">
              Gaya3 utilizes advanced Large Language Models (LLMs) and third-party AI providers (such as Groq or Google Gemini) to power our chat services.
            </p>
            <ul className="space-y-3 text-white/70">
              <li><strong className="text-white">Data Sharing:</strong> Chat history and context are transmitted to providers to generate responses.</li>
              <li><strong className="text-white">Voice Data:</strong> Audio is processed for speech-to-text but not permanently stored as raw audio.</li>
              <li className="text-red-300 italic">Disclaimer: Please do not share sensitive personal information (SSN, passwords) within the AI chat.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-white mb-4">4. Disclosure of Your Information</h2>
            <p className="leading-relaxed mb-4">We may share information with:</p>
            <ul className="list-disc pl-5 space-y-2 text-white/70">
              <li><strong>Service Providers:</strong> Hosting, payment, and AI API providers.</li>
              <li><strong>Property Hosts:</strong> Your name and booking details.</li>
              <li><strong>Legal Requirements:</strong> Responses to valid public authority requests.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-white mb-4 flex items-center gap-3">
              <Lock className="text-white/50" size={20} />
              5. Data Security
            </h2>
            <p className="leading-relaxed">
              We implement industry-standard security measures (including encryption and secure socket layer technology) to protect your personal information. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-white mb-4">6. Your Rights</h2>
            <p className="leading-relaxed mb-4">Depending on your location, you may have the right to:</p>
            <ul className="list-disc pl-5 space-y-2 text-white/70">
              <li>Access the personal data we hold about you.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your account and data.</li>
              <li>Withdraw consent for geolocation or microphone access.</li>
            </ul>
          </section>

          <section className="bg-white text-black rounded-3xl p-8">
            <h2 className="font-display text-xl font-bold mb-4">7. Contact Us</h2>
            <p className="mb-4">If you have questions or comments about this policy, you may contact us at:</p>
            <div className="font-mono text-sm">
              <p>Email: privacy@gaya3.com</p>
              <p>Address: [Insert Physical Address]</p>
            </div>
          </section>

        </div>
      </motion.div>
    </div>
  );
};

export default Privacy;