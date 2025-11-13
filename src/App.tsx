import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ScrollToTop } from './components/ScrollToTop';
import { HomePage } from './pages/HomePage';
import { DiscoverPage } from './pages/DiscoverPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { MyTicketsPage } from './pages/MyTicketsPage';
import { ProfilePage } from './components/profile/ProfilePage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignUpPage } from './pages/auth/SignUpPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { FAQPage } from './pages/FAQPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { ContactPage } from './pages/ContactPage';
import { QueuePage } from './pages/QueuePage';
import { Toaster } from './components/ui/sonner';
import { AuthProvider } from '@/context/AuthContext';
import MockPaymentPage from './pages/MockPaymentPage';
import { azureMonitoring } from '@/lib/services';

// Animation variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const pageTransition = {
  duration: 0.3,
  // Use cubic-bezier easing to satisfy motion type requirements
  ease: [0.42, 0, 0.58, 1] as [number, number, number, number],
};

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <HomePage />
          </motion.div>
        } />
        <Route path="/discover" element={
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <DiscoverPage />
          </motion.div>
        } />
        <Route path="/event/:eventId" element={
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <EventDetailPage />
          </motion.div>
        } />
        <Route path="/event/:eventId/checkout" element={
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <CheckoutPage />
          </motion.div>
        } />
        <Route path="/queue" element={
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <QueuePage />
          </motion.div>
        } />
        <Route path="/my-tickets" element={
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <MyTicketsPage />
          </motion.div>
        } />
        <Route path="/profile" element={
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <ProfilePage />
          </motion.div>
        } />
        
        {/* Authentication Routes */}
        <Route path="/auth/login" element={
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <LoginPage />
          </motion.div>
        } />
        <Route path="/auth/signup" element={
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <SignUpPage />
          </motion.div>
        } />
        <Route path="/auth/forgot-password" element={
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <ForgotPasswordPage />
          </motion.div>
        } />
        <Route path="/auth/reset-password" element={
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <ResetPasswordPage />
          </motion.div>
        } />
        <Route path="/auth/verify-email" element={
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <VerifyEmailPage />
          </motion.div>
        } />
        
        {/* Order Confirmation */}
        <Route path="/order-confirmation" element={
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <OrderConfirmationPage />
          </motion.div>
        } />
        <Route path="/payment/mock" element={
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <MockPaymentPage />
          </motion.div>
        } />
        
        {/* Info Pages */}
        <Route path="/faq" element={
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <FAQPage />
          </motion.div>
        } />
        <Route path="/terms" element={
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <TermsPage />
          </motion.div>
        } />
        <Route path="/privacy" element={
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <PrivacyPage />
          </motion.div>
        } />
        <Route path="/contact" element={
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <ContactPage />
          </motion.div>
        } />
        
        {/* 404 Catch-all route */}
        <Route path="*" element={
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <NotFoundPage />
          </motion.div>
        } />
      </Routes>
    </AnimatePresence>
  );
}

function AppContent() {
  const location = useLocation();
  const isAuthPage = location.pathname.startsWith('/auth');

  useEffect(() => {
    azureMonitoring.trackPageView(document.title, window.location.href, undefined, undefined, false);
    azureMonitoring.trackEvent('page_view', { path: location.pathname });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Scroll to top on route change */}
      <ScrollToTop />
      
      {/* Accessibility: Skip to main content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--primary-500)] focus:text-white focus:rounded-lg"
      >
        Skip to main content
      </a>

      {!isAuthPage && <Header />}

      <main id="main-content" className="flex-1" role="main">
        <AnimatedRoutes />
      </main>

      {!isAuthPage && <Footer />}
      
      {/* Toast notifications */}
      <Toaster position="top-right" />

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Eventix',
            description: 'Premier online ticketing platform for concerts, festivals, theater, and live entertainment',
            url: 'https://eventix.example.com',
            logo: 'https://eventix.example.com/logo.png',
            sameAs: [
              'https://facebook.com/eventix',
              'https://twitter.com/eventix',
              'https://instagram.com/eventix',
            ],
          }),
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
