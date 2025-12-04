import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Scale, AlertTriangle, FileText, CheckCircle } from 'lucide-react';

const Terms: React.FC = () => {
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
            TERMS OF SERVICE
          </h1>
          <p className="text-white/40 uppercase tracking-widest text-sm">Last Updated: [Insert Date]</p>
        </div>

        <div className="space-y-12">
          
          <section>
            <h2 className="font-display text-2xl text-white mb-4 flex items-center gap-3">
              <CheckCircle className="text-green-400" size={24} />
              1. Acceptance of Terms
            </h2>
            <p className="leading-relaxed">
              By creating an account, accessing, or using Gaya3 ("the Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Platform.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-white mb-4">2. Description of Service</h2>
            <p className="leading-relaxed">
              Gaya3 is a next-generation travel platform that connects users ("Travelers") with unique accommodations ("Properties") and provides AI-assisted travel planning via the Gaya Concierge.
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
            <h2 className="font-display text-xl text-white mb-6">3. User Accounts</h2>
            <ul className="space-y-4 text-white/70">
              <li className="flex gap-4">
                <span className="text-white font-bold uppercase text-xs tracking-widest mt-1">Registration</span>
                <p>You must provide accurate and complete information during the registration process.</p>
              </li>
              <li className="flex gap-4">
                <span className="text-white font-bold uppercase text-xs tracking-widest mt-1">Security</span>
                <p>You are responsible for safeguarding your password. You agree not to disclose your password to any third party.</p>
              </li>
              <li className="flex gap-4">
                <span className="text-white font-bold uppercase text-xs tracking-widest mt-1">Role</span>
                <p>Users may register as standard Travelers or Admins. Unauthorized access to Admin dashboards is strictly prohibited.</p>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-white mb-4 flex items-center gap-3">
              <FileText className="text-white/50" size={20} />
              4. Bookings and Financial Terms
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-white/70">
              <li><strong>Reservations:</strong> A booking is a limited license to enter, occupy, and use the Property.</li>
              <li><strong>Fees:</strong> You agree to pay all charges ("Total Price") outlined during checkout, including Base Price and Add-ons.</li>
              <li><strong>Currency:</strong> All transactions are processed in the currency displayed at checkout (e.g., INR ₹).</li>
              <li><strong>Cancellations:</strong> Policies vary by property. Review specific policies before booking.</li>
            </ul>
          </section>

          <section className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-white/10 rounded-3xl p-8">
            <h2 className="font-display text-xl text-white mb-4 flex items-center gap-3">
              <AlertTriangle className="text-amber-400" size={20} />
              5. AI Concierge Disclaimer
            </h2>
            <p className="leading-relaxed mb-4">
              The "Gaya" AI Chat feature provides recommendations based on artificial intelligence.
            </p>
            <div className="space-y-3">
              <p><strong className="text-white">Accuracy:</strong> While we strive for accuracy, AI responses regarding travel logistics may occasionally be incorrect. Verify critical info independently.</p>
              <p><strong className="text-white">No Liability:</strong> Gaya3 is not liable for any loss or inconvenience caused by reliance on advice provided by the AI Concierge.</p>
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl text-white mb-4">6. Prohibited Activities</h2>
            <p className="mb-2">You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1 text-white/70">
              <li>Use the Platform for any illegal purpose.</li>
              <li>Attempt to reverse engineer the application code.</li>
              <li>Harass or discriminate against Hosts or other users.</li>
              <li>Use the AI chat to generate harmful, offensive, or illegal content.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-white mb-4">7. Intellectual Property</h2>
            <p className="leading-relaxed">
              The Platform, including the "Fluid Background" visuals, "Tilt Card" designs, logos, and code, is the property of Gaya3 and is protected by copyright and intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-white mb-4 flex items-center gap-3">
              <Scale className="text-white/50" size={20} />
              8. Limitation of Liability
            </h2>
            <p className="text-xs md:text-sm uppercase tracking-wider leading-relaxed text-white/60 bg-white/5 p-6 rounded-xl border border-white/10">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, GAYA3 SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM (A) YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICE; (B) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICE.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-white mb-4">9. Governing Law</h2>
            <p className="leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of [Insert Jurisdiction], without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-white mb-4">10. Changes to Terms</h2>
            <p className="leading-relaxed">
              We reserve the right to modify these Terms at any time. We will provide notice of such changes by updating the "Last Updated" date at the top of these Terms.
            </p>
          </section>

        </div>
      </motion.div>
    </div>
  );
};

export default Terms;