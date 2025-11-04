import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Search, HelpCircle, Ticket, CreditCard, Shield, Mail } from 'lucide-react';
import { Input } from '../components/ui/input';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    category: 'Tickets',
    question: 'How do I receive my tickets after purchase?',
    answer:
      'After completing your purchase, you will receive an email confirmation with your digital tickets attached as a PDF. You can also access your tickets anytime from the "My Tickets" section in your account.',
  },
  {
    category: 'Tickets',
    question: 'Can I transfer my tickets to someone else?',
    answer:
      'Yes, you can transfer tickets to another person through your account. Go to "My Tickets", select the ticket you want to transfer, and follow the transfer process. The recipient will receive an email with their new ticket.',
  },
  {
    category: 'Tickets',
    question: 'What if I lose my ticket?',
    answer:
      'Don\'t worry! Your tickets are safely stored in your Eventix account. Simply log in and go to "My Tickets" to view and download them again. You can also check your email for the confirmation message containing your tickets.',
  },
  {
    category: 'Payment',
    question: 'What payment methods do you accept?',
    answer:
      'We accept various payment methods including credit cards (Visa, Mastercard, American Express), debit cards, bank transfers, and popular e-wallets. All payment methods available will be shown during checkout.',
  },
  {
    category: 'Payment',
    question: 'Is my payment information secure?',
    answer:
      'Absolutely. We use industry-standard encryption and security measures to protect your payment information. We never store your complete credit card details on our servers. All transactions are processed through secure, PCI-compliant payment gateways.',
  },
  {
    category: 'Payment',
    question: 'Can I get a refund for my tickets?',
    answer:
      'Refund policies vary by event and are set by the event organizer. You can find the specific refund policy on the event detail page before purchasing. Generally, tickets are non-refundable unless the event is cancelled or rescheduled.',
  },
  {
    category: 'Booking',
    question: 'How do I know if my booking was successful?',
    answer:
      'You will receive an immediate on-screen confirmation after completing your purchase, followed by a confirmation email with your order details and tickets. If you don\'t receive the email within 15 minutes, check your spam folder or contact our support team.',
  },
  {
    category: 'Booking',
    question: 'Can I change the ticket category after booking?',
    answer:
      'Once a booking is confirmed, you cannot change the ticket category. However, you may be able to cancel (subject to the event\'s refund policy) and make a new purchase. Please review your selection carefully before completing the purchase.',
  },
  {
    category: 'Booking',
    question: 'Is there a limit to how many tickets I can purchase?',
    answer:
      'Yes, ticket purchase limits are set by event organizers to ensure fair access. The maximum number of tickets you can purchase will be displayed during the booking process. This limit typically ranges from 4 to 10 tickets per order.',
  },
  {
    category: 'Account',
    question: 'Do I need an account to purchase tickets?',
    answer:
      'Yes, you need to create a free Eventix account to purchase tickets. This allows you to manage your tickets, view order history, and receive important updates about your events. Creating an account only takes a minute!',
  },
  {
    category: 'Account',
    question: 'How do I reset my password?',
    answer:
      'Click on "Forgot Password" on the login page, enter your email address, and we\'ll send you a link to reset your password. If you don\'t receive the email, check your spam folder or contact our support team.',
  },
  {
    category: 'Events',
    question: 'What happens if an event is cancelled?',
    answer:
      'If an event is cancelled, you will be notified via email and will receive a full refund to your original payment method within 5-10 business days. You can also check the status of your events in the "My Tickets" section.',
  },
  {
    category: 'Events',
    question: 'Can I access event information without purchasing?',
    answer:
      'Yes! You can browse all events, view detailed information, check seating maps, read descriptions, and see pricing without creating an account or making a purchase. An account is only required when you\'re ready to buy tickets.',
  },
];

const categories = [
  { name: 'All', icon: HelpCircle },
  { name: 'Tickets', icon: Ticket },
  { name: 'Payment', icon: CreditCard },
  { name: 'Booking', icon: Shield },
  { name: 'Account', icon: Mail },
  { name: 'Events', icon: Search },
];

export function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const filteredFAQs = faqData.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
            <HelpCircle className="w-8 h-8 text-[var(--primary-400)]" />
          </div>
          <h1 className="mb-4">Frequently Asked Questions</h1>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
            Find answers to common questions about booking tickets, payments, and using Eventix
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-8"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
            <Input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 bg-[var(--surface-glass)]/50 border-[var(--border-default)] rounded-2xl"
            />
          </div>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8 overflow-x-auto"
        >
          <div className="flex gap-3 pb-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                    selectedCategory === category.name
                      ? 'bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] text-white'
                      : 'bg-[var(--surface-glass)]/30 border border-[var(--border-default)] hover:border-[var(--primary-500)]/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{category.name}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* FAQ List */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="space-y-4"
        >
          {filteredFAQs.length === 0 ? (
            <div className="relative rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface-glass)]/80 to-[var(--surface-glass)]/40 backdrop-blur-xl border border-[var(--border-glass)]" />
              <div className="relative p-12 text-center">
                <p className="text-[var(--text-secondary)]">
                  No questions found matching your search. Try different keywords or browse all categories.
                </p>
              </div>
            </div>
          ) : (
            filteredFAQs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative rounded-2xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface-glass)]/80 to-[var(--surface-glass)]/40 backdrop-blur-xl border border-[var(--border-glass)]" />
                <div className="relative">
                  <button
                    onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                    className="w-full p-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                  >
                    <div className="flex-1 pr-4">
                      <span className="text-xs text-[var(--primary-400)] mb-1 block">
                        {faq.category}
                      </span>
                      <p style={{ fontWeight: 'var(--font-weight-medium)' }}>{faq.question}</p>
                    </div>
                    <motion.div
                      animate={{ rotate: expandedIndex === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="w-5 h-5 text-[var(--text-secondary)]" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {expandedIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 text-[var(--text-secondary)]">
                          <div className="pt-4 border-t border-[var(--border-default)]">{faq.answer}</div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Contact Support */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-12 relative rounded-3xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-500)]/10 to-[var(--primary-600)]/10 border border-[var(--primary-500)]/20" />
          <div className="relative p-8 text-center">
            <h2 className="mb-3">Still Have Questions?</h2>
            <p className="text-[var(--text-secondary)] mb-6">
              Our support team is here to help you with any questions or concerns
            </p>
            <a
              href="mailto:support@eventix.com"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] text-white hover:shadow-lg hover:shadow-[var(--primary-500)]/20 transition-all"
            >
              <Mail className="w-5 h-5" />
              Contact Support
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
