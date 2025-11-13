import { motion } from 'motion/react';
import { FileText, Shield, AlertCircle } from 'lucide-react';

export function TermsPage() {
  const lastUpdated = 'November 4, 2025';

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary-500)]/20 to-[var(--primary-600)]/20 border border-[var(--primary-500)]/30 mb-6">
            <FileText className="w-8 h-8 text-[var(--primary-400)]" />
          </div>
          <h1 className="mb-4">Terms & Conditions</h1>
          <p className="text-[var(--text-secondary)]">Last updated: {lastUpdated}</p>
        </motion.div>

        {/* Important Notice */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="relative rounded-2xl overflow-hidden mb-8"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20" />
          <div className="relative p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <p style={{ fontWeight: 'var(--font-weight-medium)' }} className="mb-1">
                Please Read Carefully
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                By using Eventix, you agree to these terms and conditions. Please read them carefully before
                making any purchases.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative rounded-3xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface-glass)]/80 to-[var(--surface-glass)]/40 backdrop-blur-xl border border-[var(--border-glass)]" />
          <div className="relative p-8 lg:p-12 space-y-8">
            <section>
              <h2 className="mb-4">1. Acceptance of Terms</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                Welcome to Eventix. By accessing or using our website and services, you agree to be bound by
                these Terms and Conditions and our Privacy Policy. If you do not agree to these terms, please
                do not use our services.
              </p>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                We reserve the right to modify these terms at any time. Changes will be effective immediately
                upon posting to the website. Your continued use of the service after changes are posted
                constitutes your acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="mb-4">2. Ticket Purchases</h2>
              <h3 className="mb-3">2.1 Purchase Process</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                When you purchase tickets through Eventix, you are entering into a contract with the event
                organizer. Eventix acts as an agent for the event organizer and is responsible for processing
                your transaction.
              </p>
              <h3 className="mb-3">2.2 Pricing and Fees</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                All prices are displayed in Indonesian Rupiah (IDR) unless otherwise stated. Prices include
                applicable service fees and taxes. We reserve the right to change prices at any time, but
                changes will not affect orders already placed.
              </p>
              <h3 className="mb-3">2.3 Payment</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Payment must be completed at the time of purchase. We accept various payment methods as
                displayed during checkout. All transactions are processed securely through our payment
                partners.
              </p>
            </section>

            <section>
              <h2 className="mb-4">3. Ticket Delivery and Access</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                Digital tickets will be delivered to the email address provided during purchase and will be
                available in your account under &ldquo;My Tickets&rdquo;. It is your responsibility to ensure the email
                address provided is correct.
              </p>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                You must present valid tickets (digital or printed) for entry to events. Screenshots of
                tickets are not accepted. Each ticket contains a unique QR code that can only be scanned once.
              </p>
            </section>

            <section>
              <h2 className="mb-4">4. Refunds and Cancellations</h2>
              <h3 className="mb-3">4.1 Event Cancellation</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                If an event is cancelled by the organizer, you will receive a full refund including all fees.
                Refunds will be processed to your original payment method within 5-10 business days.
              </p>
              <h3 className="mb-3">4.2 Customer Cancellation</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                Tickets are generally non-refundable unless the event is cancelled or rescheduled. Specific
                refund policies are set by event organizers and will be displayed on the event page before
                purchase.
              </p>
              <h3 className="mb-3">4.3 Rescheduled Events</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                If an event is rescheduled, your tickets will remain valid for the new date. If you cannot
                attend the rescheduled event, you may be eligible for a refund according to the event
                organizer&rsquo;s policy.
              </p>
            </section>

            <section>
              <h2 className="mb-4">5. Ticket Transfer and Resale</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                You may transfer tickets to another person through our official ticket transfer system. Tickets
                obtained through unauthorized resale may be invalid and denied entry.
              </p>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Reselling tickets at a price higher than face value is prohibited unless explicitly permitted
                by the event organizer. Eventix reserves the right to cancel tickets that violate this policy.
              </p>
            </section>

            <section>
              <h2 className="mb-4">6. User Accounts</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                You must create an account to purchase tickets. You are responsible for maintaining the
                confidentiality of your account credentials and for all activities that occur under your
                account.
              </p>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                You agree to provide accurate, current, and complete information during registration and to
                update such information to keep it accurate, current, and complete.
              </p>
            </section>

            <section>
              <h2 className="mb-4">7. Prohibited Conduct</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                You agree not to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-[var(--text-secondary)] ml-4">
                <li>Use automated systems or bots to purchase tickets</li>
                <li>Purchase tickets for resale without authorization</li>
                <li>Share account credentials with others</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Interfere with or disrupt the service</li>
                <li>Attempt to gain unauthorized access to any part of the service</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4">8. Limitation of Liability</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                Eventix acts as an intermediary between customers and event organizers. We are not responsible
                for the quality, safety, or legality of events listed on our platform.
              </p>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                To the maximum extent permitted by law, Eventix shall not be liable for any indirect,
                incidental, special, consequential, or punitive damages arising out of or related to your use
                of the service.
              </p>
            </section>

            <section>
              <h2 className="mb-4">9. Privacy and Data Protection</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Your use of Eventix is also governed by our Privacy Policy. Please review our Privacy Policy to
                understand how we collect, use, and protect your personal information.
              </p>
            </section>

            <section>
              <h2 className="mb-4">10. Contact Information</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                If you have any questions about these Terms and Conditions, please contact us at:
                <br />
                <br />
                Email: legal@eventix.com
                <br />
                Address: Jakarta, Indonesia
              </p>
            </section>
          </div>
        </motion.div>

        {/* Footer Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-2 text-[var(--text-tertiary)] text-sm">
            <Shield className="w-4 h-4" />
            <span>Your use of Eventix is protected by these terms and our Privacy Policy</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
