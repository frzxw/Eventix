import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, Shield, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    return strength;
  };

  const handlePasswordChange = (password: string) => {
    setFormData({ ...formData, password });
    setPasswordStrength(calculatePasswordStrength(password));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordStrength < 3) {
      toast.error('Please use a stronger password');
      return;
    }

    if (!token) {
      toast.error('Invalid reset token');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setPasswordReset(true);
      toast.success('Password reset successfully!');
    }, 1500);
  };

  const handleBackToLogin = () => {
    navigate('/auth/login');
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="text-center">
          <h1 className="text-2xl mb-4" style={{ fontWeight: 'var(--font-weight-medium)' }}>
            Invalid Reset Link
          </h1>
          <p className="text-[var(--text-secondary)] mb-6">
            This password reset link is invalid or has expired.
          </p>
          <Button
            onClick={() => navigate('/auth/forgot-password')}
            className="bg-gradient-to-r from-[var(--primary-500)] to-[var(--accent-500)] rounded-full"
          >
            Request New Link
          </Button>
        </div>
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
        {!passwordReset ? (
          <>
            {/* Title */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary-500)] to-[var(--accent-500)] mb-4 shadow-xl shadow-[var(--primary-500)]/20"
              >
                <Shield className="w-8 h-8 text-white" />
              </motion.div>
              <h1 className="text-3xl sm:text-4xl mb-2" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                Reset Password
              </h1>
              <p className="text-[var(--text-secondary)]">
                Enter your new password below
              </p>
            </div>

            {/* Form */}
            <div className="glass rounded-3xl border border-[var(--border-glass)] p-8 shadow-2xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* New Password */}
                <div>
                  <Label htmlFor="password" className="mb-2">
                    New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      placeholder="••••••••"
                      className="glass-input pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-smooth"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-2">
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              i < passwordStrength
                                ? passwordStrength === 1
                                  ? 'bg-red-500'
                                  : passwordStrength === 2
                                  ? 'bg-orange-500'
                                  : passwordStrength === 3
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                                : 'bg-[var(--surface-glass)]'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-[var(--text-tertiary)]">
                        {passwordStrength === 1 && 'Weak password'}
                        {passwordStrength === 2 && 'Fair password'}
                        {passwordStrength === 3 && 'Good password'}
                        {passwordStrength === 4 && 'Strong password'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <Label htmlFor="confirmPassword" className="mb-2">
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      className="glass-input pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-smooth"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-xs text-[var(--error)] mt-1">Passwords do not match</p>
                  )}
                </div>

                {/* Password Requirements */}
                <div className="p-4 rounded-2xl bg-[var(--surface-glass)] border border-[var(--border-default)]">
                  <p className="text-xs text-[var(--text-tertiary)] mb-2">
                    Password must contain:
                  </p>
                  <ul className="space-y-1 text-xs text-[var(--text-secondary)]">
                    <li className="flex items-center gap-2">
                      <div className={`w-1 h-1 rounded-full ${formData.password.length >= 8 ? 'bg-green-500' : 'bg-[var(--text-tertiary)]'}`} />
                      At least 8 characters
                    </li>
                    <li className="flex items-center gap-2">
                      <div className={`w-1 h-1 rounded-full ${formData.password.match(/[a-z]/) && formData.password.match(/[A-Z]/) ? 'bg-green-500' : 'bg-[var(--text-tertiary)]'}`} />
                      Both uppercase and lowercase letters
                    </li>
                    <li className="flex items-center gap-2">
                      <div className={`w-1 h-1 rounded-full ${formData.password.match(/[0-9]/) ? 'bg-green-500' : 'bg-[var(--text-tertiary)]'}`} />
                      At least one number
                    </li>
                    <li className="flex items-center gap-2">
                      <div className={`w-1 h-1 rounded-full ${formData.password.match(/[^a-zA-Z0-9]/) ? 'bg-green-500' : 'bg-[var(--text-tertiary)]'}`} />
                      At least one special character
                    </li>
                  </ul>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading || passwordStrength < 3}
                  className="w-full bg-gradient-to-r from-[var(--primary-500)] to-[var(--accent-500)] hover:opacity-90 transition-all duration-300 text-white shadow-xl shadow-[var(--primary-500)]/20 rounded-full h-12 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5 mr-2" />
                      Reset Password
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
                Password Reset!
              </h1>
              <p className="text-[var(--text-secondary)]">
                Your password has been successfully reset
              </p>
            </div>

            <div className="glass rounded-3xl border border-[var(--border-glass)] p-8 shadow-2xl">
              <div className="space-y-6">
                <p className="text-center text-[var(--text-secondary)]">
                  You can now sign in with your new password
                </p>

                <Button
                  onClick={handleBackToLogin}
                  className="w-full bg-gradient-to-r from-[var(--primary-500)] to-[var(--accent-500)] hover:opacity-90 transition-all duration-300 text-white shadow-xl shadow-[var(--primary-500)]/20 rounded-full h-12"
                >
                  Continue to Login
                </Button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
