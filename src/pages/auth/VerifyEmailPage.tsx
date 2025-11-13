import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { Mail, CheckCircle2, Send, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import { apiClient } from '@/lib/services/api-client';

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const email = location.state?.email || 'your email';
  const [isVerifying, setIsVerifying] = useState(!!token);
  const [isVerified, setIsVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let isActive = true;

    const verify = async () => {
      if (!token) {
        setIsVerifying(false);
        return;
      }

      setIsVerifying(true);
      const { error } = await apiClient.auth.verifyEmail(token);
      if (!isActive) return;

      if (error) {
        setIsVerifying(false);
        toast.error(typeof error === 'string' ? error : 'Verification link is invalid or has expired.');
        return;
      }

      setIsVerifying(false);
      setIsVerified(true);
      toast.success('Email verified successfully!');
    };

    verify();

    return () => {
      isActive = false;
    };
  }, [token]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResend = () => {
    setResendCooldown(60);
    toast.info('Verification email resend is not available yet. Please check your inbox again in a moment.');
  };

  const handleContinue = () => {
    navigate('/auth/login');
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 relative">
        {/* Back Button */}
        <Link
          to="/"
          className="fixed top-6 left-6 z-10 inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-[var(--border-glass)] hover:border-[var(--primary-500)]/30 hover:bg-[var(--surface-glass-hover)] transition-smooth text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Events</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary-500)] to-[var(--accent-500)] mb-4 shadow-xl shadow-[var(--primary-500)]/20">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <h1 className="text-2xl mb-2" style={{ fontWeight: 'var(--font-weight-medium)' }}>
            Verifying Your Email
          </h1>
          <p className="text-[var(--text-secondary)]">
            Please wait while we verify your email address...
          </p>
        </motion.div>
      </div>
    );
  }

  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 -z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.15, scale: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute top-0 left-0 w-[500px] h-[500px] bg-[var(--primary-500)] rounded-full blur-[128px]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.15, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2, ease: 'easeOut' }}
            className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[var(--accent-500)] rounded-full blur-[128px]"
          />
        </div>

        {/* Back Button */}
        <Link
          to="/"
          className="fixed top-6 left-6 z-10 inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-[var(--border-glass)] hover:border-[var(--primary-500)]/30 hover:bg-[var(--surface-glass-hover)] transition-smooth text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Events</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Success State */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--success)] to-green-600 mb-4 shadow-xl shadow-green-500/20"
            >
              <CheckCircle2 className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl sm:text-4xl mb-2" style={{ fontWeight: 'var(--font-weight-medium)' }}>
              Email Verified!
            </h1>
            <p className="text-[var(--text-secondary)]">
              Your email has been successfully verified
            </p>
          </div>

          <div className="glass rounded-3xl border border-[var(--border-glass)] p-8 shadow-2xl">
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-[var(--success-bg)] border border-[var(--success-border)] text-center">
                <p className="text-sm text-[var(--text-secondary)]">
                  Your account is now active and ready to use!
                </p>
              </div>

              <Button
                onClick={handleContinue}
                className="w-full bg-gradient-to-r from-[var(--primary-500)] to-[var(--accent-500)] hover:opacity-90 transition-all duration-300 text-white shadow-xl shadow-[var(--primary-500)]/20 rounded-full h-12"
              >
                Continue to Login
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.15, scale: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute top-0 left-0 w-[500px] h-[500px] bg-[var(--primary-500)] rounded-full blur-[128px]"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.15, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.2, ease: 'easeOut' }}
          className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[var(--accent-500)] rounded-full blur-[128px]"
        />
      </div>

      {/* Back Button */}
      <Link
        to="/"
        className="fixed top-6 left-6 z-10 inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-[var(--border-glass)] hover:border-[var(--primary-500)]/30 hover:bg-[var(--surface-glass-hover)] transition-smooth text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Back to Events</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary-500)] to-[var(--accent-500)] mb-4 shadow-xl shadow-[var(--primary-500)]/20"
          >
            <Mail className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl sm:text-4xl mb-2" style={{ fontWeight: 'var(--font-weight-medium)' }}>
            Verify Your Email
          </h1>
          <p className="text-[var(--text-secondary)]">
            We&rsquo;ve sent a verification link to
          </p>
          <p className="text-[var(--text-primary)] mt-1" style={{ fontWeight: 'var(--font-weight-medium)' }}>
            {email}
          </p>
        </div>

        <div className="glass rounded-3xl border border-[var(--border-glass)] p-8 shadow-2xl">
          <div className="space-y-6">
            {/* Instructions */}
            <div className="p-4 rounded-2xl bg-[var(--surface-glass)] border border-[var(--border-default)]">
              <h3 className="text-sm mb-3" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                What&rsquo;s next?
              </h3>
              <ol className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li className="flex gap-2">
                  <span className="text-[var(--primary-500)]">1.</span>
                  <span>Check your email inbox and spam folder</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--primary-500)]">2.</span>
                  <span>Click the verification link in the email</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--primary-500)]">3.</span>
                  <span>You&rsquo;ll be redirected back to complete setup</span>
                </li>
              </ol>
            </div>

            {/* Resend */}
            <div className="text-center">
              <p className="text-sm text-[var(--text-secondary)] mb-3">
                Didn&rsquo;t receive the email?
              </p>
              <Button
                variant="outline"
                onClick={handleResend}
                disabled={resendCooldown > 0}
                className="glass-hover rounded-full"
              >
                <Send className="w-4 h-4 mr-2" />
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Email'}
              </Button>
            </div>

            {/* Change Email */}
            <div className="pt-4 border-t border-[var(--border-default)] text-center">
              <p className="text-sm text-[var(--text-secondary)]">
                Wrong email address?{' '}
                <button
                  onClick={() => navigate('/auth/signup')}
                  className="text-[var(--primary-500)] hover:text-[var(--primary-400)] transition-smooth"
                  style={{ fontWeight: 'var(--font-weight-medium)' }}
                >
                  Sign up again
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Back to Login */}
        <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
          <button
            onClick={() => navigate('/auth/login')}
            className="text-[var(--primary-500)] hover:text-[var(--primary-400)] transition-smooth"
            style={{ fontWeight: 'var(--font-weight-medium)' }}
          >
            ← Back to login
          </button>
        </p>
      </motion.div>
    </div>
  );
}
