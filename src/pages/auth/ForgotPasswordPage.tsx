import { useState } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { apiClient } from '@/lib/services/api-client';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await apiClient.auth.forgotPassword(email.trim());
    setIsLoading(false);

    if (error) {
      toast.error(typeof error === 'string' ? error : 'Unable to send reset link right now. Please try again later.');
      return;
    }

    setEmailSent(true);
    toast.success('Password reset link sent!');
  };

  const handleResend = async () => {
    const { error } = await apiClient.auth.forgotPassword(email.trim());
    if (error) {
      toast.error(typeof error === 'string' ? error : 'Unable to resend reset link right now.');
      return;
    }
    toast.success('Email resent successfully!');
  };

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
      <button
        onClick={() => navigate('/')}
        className="fixed top-6 left-6 z-10 inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-[var(--border-glass)] hover:border-[var(--primary-500)]/30 hover:bg-[var(--surface-glass-hover)] transition-smooth text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Back to Events</span>
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Back to Login */}
        <Link
          to="/auth/login"
          className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-smooth mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

        {!emailSent ? (
          <>
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
                Forgot Password?
              </h1>
              <p className="text-[var(--text-secondary)]">
                No worries, we&rsquo;ll send you reset instructions
              </p>
            </div>

            {/* Form */}
            <div className="glass rounded-3xl border border-[var(--border-glass)] p-8 shadow-2xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div>
                  <Label htmlFor="email" className="mb-2">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="glass-input pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-[var(--primary-500)] to-[var(--accent-500)] hover:opacity-90 transition-all duration-300 text-white shadow-xl shadow-[var(--primary-500)]/20 rounded-full h-12"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send Reset Link
                    </>
                  )}
                </Button>
              </form>
            </div>
          </>
        ) : (
          <>
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
                Check Your Email
              </h1>
              <p className="text-[var(--text-secondary)]">
                We&rsquo;ve sent password reset instructions to
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
                      <span>Click the reset password link we sent you</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[var(--primary-500)]">3.</span>
                      <span>Create a new password for your account</span>
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
                    className="glass-hover rounded-full"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Resend Email
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Back to Login Link */}
        {emailSent && (
          <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
            <Link
              to="/auth/login"
              className="text-[var(--primary-500)] hover:text-[var(--primary-400)] transition-smooth"
              style={{ fontWeight: 'var(--font-weight-medium)' }}
            >
              ← Back to login
            </Link>
          </p>
        )}
      </motion.div>
    </div>
  );
}
