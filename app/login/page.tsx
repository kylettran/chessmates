'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mascot } from '@/components/ui/Mascot';
import { Navbar } from '@/components/layout/Navbar';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otp, setOtp] = useState('');

  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPhone(formatPhone(e.target.value));
  }

  function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    // TODO: integrate SMS provider (Twilio, etc.)
    setStep('otp');
  }

  function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    // TODO: verify OTP and create session
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <div className="flex justify-center mb-6">
            <Mascot size="md" emotion="happy" />
          </div>

          <div className="bg-white dark:bg-background-secondary border-2 border-amber-200 dark:border-amber-800/40 rounded-3xl p-8 shadow-lg">
            {step === 'phone' ? (
              <>
                <h1 className="text-2xl font-extrabold text-text-primary text-center mb-1">
                  Welcome to Chessmates!
                </h1>
                <p className="text-text-secondary text-sm text-center mb-8">
                  Enter your phone number to sign in or create an account.
                </p>

                <form onSubmit={handleSendCode} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2">
                      Phone Number
                    </label>
                    <div className="flex gap-2">
                      <span className="flex items-center px-3 py-3 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800/40 text-text-secondary text-sm font-medium select-none">
                        +1
                      </span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        placeholder="(555) 000-0000"
                        value={phone}
                        onChange={handlePhoneChange}
                        required
                        className="flex-1 px-4 py-3 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800/40 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-amber-400 transition-colors text-base"
                      />
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 rounded-2xl font-bold text-white text-base shadow-md"
                    style={{ background: 'linear-gradient(135deg, #F5C842, #E0A020)' }}
                  >
                    Send Verification Code
                  </motion.button>
                </form>

                <p className="text-xs text-text-muted text-center mt-6 leading-relaxed">
                  We&apos;ll send you a one-time SMS code. Standard message rates may apply.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-extrabold text-text-primary text-center mb-1">
                  Check your texts!
                </h1>
                <p className="text-text-secondary text-sm text-center mb-8">
                  We sent a 6-digit code to <span className="font-semibold text-amber-600 dark:text-amber-400">{phone}</span>
                </p>

                <form onSubmit={handleVerify} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="000000"
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      maxLength={6}
                      className="w-full px-4 py-3 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800/40 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-amber-400 transition-colors text-center text-2xl font-bold tracking-[0.5em]"
                    />
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 rounded-2xl font-bold text-white text-base shadow-md"
                    style={{ background: 'linear-gradient(135deg, #F5C842, #E0A020)' }}
                  >
                    Verify & Continue
                  </motion.button>
                </form>

                <button
                  onClick={() => setStep('phone')}
                  className="w-full mt-3 text-sm text-text-muted hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  Use a different number
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
