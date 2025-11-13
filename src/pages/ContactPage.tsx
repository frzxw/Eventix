import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, MapPin, Phone, Send, MessageCircle, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success('Message sent successfully! We\'ll get back to you soon.');

    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitted(false);
    }, 3000);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      details: 'support@eventix.com',
      description: 'Send us an email anytime',
    },
    {
      icon: Phone,
      title: 'Phone',
      details: '+62 21 1234 5678',
      description: 'Mon-Fri from 9am to 6pm',
    },
    {
      icon: MapPin,
      title: 'Office',
      details: 'Jakarta, Indonesia',
      description: 'Visit our headquarters',
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: '9:00 AM - 6:00 PM',
      description: 'Monday to Friday',
    },
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary-500)]/20 to-[var(--primary-600)]/20 border border-[var(--primary-500)]/30 mb-6">
            <MessageCircle className="w-8 h-8 text-[var(--primary-400)]" />
          </div>
          <h1 className="mb-4">Contact Us</h1>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
            Have questions or need assistance? We&rsquo;re here to help! Reach out to our support team and we&rsquo;ll get
            back to you as soon as possible.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="lg:col-span-1 space-y-6"
          >
            {contactInfo.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                  className="relative rounded-2xl overflow-hidden group hover:shadow-lg hover:shadow-[var(--primary-500)]/10 transition-all"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface-glass)]/80 to-[var(--surface-glass)]/40 backdrop-blur-xl border border-[var(--border-glass)] group-hover:border-[var(--primary-500)]/30 transition-colors" />
                  <div className="relative p-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary-500)]/20 to-[var(--primary-600)]/20 border border-[var(--primary-500)]/30 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-[var(--primary-400)]" />
                    </div>
                    <h3 className="mb-1">{item.title}</h3>
                    <p style={{ fontWeight: 'var(--font-weight-medium)' }} className="text-[var(--primary-400)] mb-1">
                      {item.details}
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">{item.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="lg:col-span-2"
          >
            <div className="relative rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface-glass)]/80 to-[var(--surface-glass)]/40 backdrop-blur-xl border border-[var(--border-glass)]" />
              <div className="relative p-8 lg:p-12">
                {isSubmitted ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="mb-3">Message Sent!</h2>
                    <p className="text-[var(--text-secondary)]">
                      Thank you for contacting us. We&rsquo;ll respond to your inquiry within 24 hours.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <h2 className="mb-2">Send us a Message</h2>
                      <p className="text-sm text-[var(--text-secondary)]">
                        Fill out the form below and we&rsquo;ll get back to you as soon as possible
                      </p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm mb-2" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                          Your Name
                        </label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="John Doe"
                          className="h-12 bg-[var(--surface-glass)]/50 border-[var(--border-default)]"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm mb-2" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                          Email Address
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="john@example.com"
                          className="h-12 bg-[var(--surface-glass)]/50 border-[var(--border-default)]"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm mb-2" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                        Subject
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="How can we help you?"
                        className="h-12 bg-[var(--surface-glass)]/50 border-[var(--border-default)]"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm mb-2" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                        Message
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us more about your inquiry..."
                        rows={6}
                        className="bg-[var(--surface-glass)]/50 border-[var(--border-default)] resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] hover:from-[var(--primary-600)] hover:to-[var(--primary-700)] text-white"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* FAQ Link */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-12 relative rounded-2xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20" />
          <div className="relative p-8 text-center">
            <h2 className="mb-3">Looking for Quick Answers?</h2>
            <p className="text-[var(--text-secondary)] mb-6">
              Check out our FAQ page for instant answers to common questions
            </p>
            <Button
              onClick={() => window.location.href = '/faq'}
              variant="outline"
              className="border-[var(--primary-500)]/30 hover:bg-[var(--primary-500)]/10"
            >
              Visit FAQ
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
