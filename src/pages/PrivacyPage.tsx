import { motion } from 'motion/react';
import { Shield, Lock, Eye, UserCheck, Database, Mail } from 'lucide-react';

export function PrivacyPage() {
  const lastUpdated = 'November 4, 2025';

  const highlights = [
    {
      icon: Lock,
      title: 'Data Encryption',
      description: 'All personal data is encrypted in transit and at rest',
    },
    {
      icon: Eye,
      title: 'Transparency',
      description: 'Clear information about how we use your data',
    },
    {
      icon: UserCheck,
      title: 'Your Control',
      description: 'You can access, update, or delete your data anytime',
    },
    {
      icon: Shield,
      title: 'Security First',
      description: 'Industry-standard security measures to protect your information',
    },
  ];

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
            <Shield className="w-8 h-8 text-[var(--primary-400)]" />
          </div>
          <h1 className="mb-4">Privacy Policy</h1>
          <p className="text-[var(--text-secondary)]">Last updated: {lastUpdated}</p>
        </motion.div>

        {/* Key Highlights */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12"
        >
          {highlights.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="relative rounded-2xl overflow-hidden group hover:shadow-lg hover:shadow-[var(--primary-500)]/10 transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface-glass)]/80 to-[var(--surface-glass)]/40 backdrop-blur-xl border border-[var(--border-glass)] group-hover:border-[var(--primary-500)]/30 transition-colors" />
                <div className="relative p-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary-500)]/20 to-[var(--primary-600)]/20 border border-[var(--primary-500)]/30 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-[var(--primary-400)]" />
                  </div>
                  <h3 className="mb-2">{item.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">{item.description}</p>
                </div>
              </div>
            );
          })}
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
              <h2 className="mb-4">Introduction</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                At Eventix, we take your privacy seriously. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you use our ticketing platform.
              </p>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                By using Eventix, you consent to the data practices described in this policy. If you do not
                agree with our policies and practices, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="mb-4">Information We Collect</h2>
              <h3 className="mb-3">Personal Information</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                We collect personal information that you provide directly to us when you:
              </p>
              <ul className="list-disc list-inside space-y-2 text-[var(--text-secondary)] ml-4 mb-4">
                <li>Create an account (name, email address, phone number)</li>
                <li>Purchase tickets (billing information, payment details)</li>
                <li>Contact customer support (correspondence and support tickets)</li>
                <li>Update your profile (preferences, demographics)</li>
              </ul>

              <h3 className="mb-3">Automatically Collected Information</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                When you use our services, we automatically collect certain information about your device and
                usage patterns:
              </p>
              <ul className="list-disc list-inside space-y-2 text-[var(--text-secondary)] ml-4">
                <li>Device information (IP address, browser type, operating system)</li>
                <li>Usage data (pages visited, time spent, click patterns)</li>
                <li>Location data (approximate location based on IP address)</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4">How We Use Your Information</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-[var(--text-secondary)] ml-4">
                <li>Process your ticket purchases and deliver digital tickets</li>
                <li>Manage your account and provide customer support</li>
                <li>Send you order confirmations, updates, and event reminders</li>
                <li>Improve and personalize your experience on our platform</li>
                <li>Prevent fraud and enhance security</li>
                <li>Analyze usage patterns and optimize our services</li>
                <li>Send marketing communications (with your consent)</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4">Information Sharing and Disclosure</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                We may share your information with:
              </p>

              <h3 className="mb-3">Event Organizers</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                When you purchase tickets, we share necessary information with event organizers to facilitate
                entry and communication about the event.
              </p>

              <h3 className="mb-3">Service Providers</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                We work with third-party service providers who perform services on our behalf, such as payment
                processing, email delivery, and analytics. These providers have access to your information only
                to perform specific tasks.
              </p>

              <h3 className="mb-3">Legal Requirements</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                We may disclose your information if required by law or in response to valid requests by public
                authorities (e.g., court orders, government agencies).
              </p>

              <h3 className="mb-3">Business Transfers</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                In the event of a merger, acquisition, or sale of assets, your information may be transferred
                to the acquiring entity.
              </p>
            </section>

            <section>
              <h2 className="mb-4">Data Security</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                We implement industry-standard security measures to protect your personal information,
                including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-[var(--text-secondary)] ml-4 mb-4">
                <li>SSL/TLS encryption for data transmission</li>
                <li>Encryption of sensitive data at rest</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Secure payment processing through PCI-compliant providers</li>
                <li>Access controls and authentication measures</li>
              </ul>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                However, no method of transmission over the internet or electronic storage is 100% secure. While
                we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="mb-4">Your Rights and Choices</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside space-y-2 text-[var(--text-secondary)] ml-4 mb-4">
                <li>
                  <strong>Access:</strong> Request a copy of the personal information we hold about you
                </li>
                <li>
                  <strong>Correction:</strong> Update or correct inaccurate information
                </li>
                <li>
                  <strong>Deletion:</strong> Request deletion of your personal information (subject to legal
                  obligations)
                </li>
                <li>
                  <strong>Opt-out:</strong> Unsubscribe from marketing communications
                </li>
                <li>
                  <strong>Data Portability:</strong> Request your data in a portable format
                </li>
              </ul>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                To exercise these rights, please contact us at privacy@eventix.com.
              </p>
            </section>

            <section>
              <h2 className="mb-4">Cookies and Tracking Technologies</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                We use cookies and similar technologies to enhance your experience, analyze usage, and deliver
                personalized content. You can control cookie settings through your browser preferences.
              </p>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Types of cookies we use include essential cookies (required for basic functionality), analytics
                cookies (to understand usage patterns), and marketing cookies (to deliver relevant
                advertisements).
              </p>
            </section>

            <section>
              <h2 className="mb-4">Children&rsquo;s Privacy</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Our services are not directed to children under 13 years of age. We do not knowingly collect
                personal information from children under 13. If you believe we have collected information from a
                child under 13, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="mb-4">International Data Transfers</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Your information may be transferred to and processed in countries other than your country of
                residence. These countries may have different data protection laws. We ensure appropriate
                safeguards are in place to protect your information.
              </p>
            </section>

            <section>
              <h2 className="mb-4">Changes to This Policy</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of significant changes
                by posting the new policy on this page and updating the &ldquo;Last Updated&rdquo; date. Your continued use
                of our services after changes are posted constitutes your acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="mb-4">Contact Us</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                If you have questions or concerns about this Privacy Policy or our data practices, please
                contact us:
              </p>
              <div className="p-6 rounded-2xl bg-[var(--surface-glass)]/30 border border-[var(--border-default)]">
                <div className="flex items-center gap-3 mb-3">
                  <Mail className="w-5 h-5 text-[var(--primary-400)]" />
                  <p style={{ fontWeight: 'var(--font-weight-medium)' }}>Email</p>
                </div>
                <p className="text-[var(--text-secondary)]">privacy@eventix.com</p>
                <div className="flex items-center gap-3 mt-4 mb-3">
                  <Database className="w-5 h-5 text-[var(--primary-400)]" />
                  <p style={{ fontWeight: 'var(--font-weight-medium)' }}>Data Protection Officer</p>
                </div>
                <p className="text-[var(--text-secondary)]">dpo@eventix.com</p>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
