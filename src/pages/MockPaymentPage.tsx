import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { CreditCard, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function MockPaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = useMemo(() => searchParams.get('orderId') || '', [searchParams]);
  const amount = useMemo(() => Number(searchParams.get('amount') || '0'), [searchParams]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!orderId) {
      toast.error('Missing order reference');
      navigate('/');
    }
  }, [orderId, navigate]);

  async function handlePay() {
    if (!orderId) return;
    try {
      setProcessing(true);
      // Simulate gateway latency
      await new Promise((r) => setTimeout(r, 1200));
      toast.success('Payment successful');
      navigate(`/order-confirmation?orderId=${encodeURIComponent(orderId)}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Payment failed';
      toast.error(msg);
      setProcessing(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md glass rounded-3xl border border-[var(--border-glass)] p-8 text-center"
      >
        <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary-500)]/20 to-[var(--accent-500)]/20 border border-[var(--primary-500)]/30 flex items-center justify-center">
          <CreditCard className="w-8 h-8 text-[var(--primary-400)]" />
        </div>
        <h1 className="mb-2">Mock Payment</h1>
        <p className="text-[var(--text-secondary)] mb-6">This simulates a payment gateway for local testing.</p>

        <div className="mb-6 p-4 rounded-2xl bg-[var(--surface-glass)] border border-[var(--border-default)] text-left">
          <div className="flex items-center justify-between">
            <span>Total to pay</span>
            <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>
              Rp {Number.isFinite(amount) ? amount.toLocaleString('id-ID') : 0}
            </span>
          </div>
          <div className="mt-2 text-xs text-[var(--text-tertiary)]">Order ID: {orderId}</div>
        </div>

        <Button
          onClick={handlePay}
          disabled={processing || !orderId}
          className="w-full h-12 bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] text-white"
        >
          {processing ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Processing...
            </>
          ) : (
            <>
              <ShieldCheck className="w-5 h-5 mr-2" />
              Pay Now
            </>
          )}
        </Button>

        <div className="mt-4 text-xs text-[var(--text-tertiary)] flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
          Secure mock flow — no real charge
        </div>
      </motion.div>
    </div>
  );
}
