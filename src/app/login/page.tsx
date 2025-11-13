'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Phone, Eye, EyeOff, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { sendOTP, verifyOTP } from '@/actions/auth';
import { useAuthStore } from '@/store/authStore';
import { formatPhoneNumber, validatePhoneNumber } from '@/lib/utils';
import Link from 'next/link';

const loginSchema = z.object({
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must be at most 15 digits')
    .refine((phone) => validatePhoneNumber(phone), {
      message: 'Please enter a valid Uganda phone number',
    }),
});

const otpSchema = z.object({
  otp: z
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d+$/, 'OTP must contain only numbers'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type OTPFormData = z.infer<typeof otpSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'login' | 'otp'>('login');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  const { login } = useAuthStore();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const otpForm = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    mode: 'onChange',
  });

  React.useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendOTP = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const formattedPhone = formatPhoneNumber(data.phone);
      setPhoneNumber(formattedPhone);

      const result = await sendOTP(formattedPhone);

      if (result.success) {
        setStep('otp');
        setTimeLeft(300); // 5 minutes
      } else {
        setError(result.error || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (data: OTPFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await verifyOTP(phoneNumber, data.otp);

      if (result.success && result.data) {
        // Login the user
        login(result.data.user, result.data.token);

        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        setError(result.error || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (timeLeft > 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await sendOTP(phoneNumber);

      if (result.success) {
        setTimeLeft(300); // Reset timer
        otpForm.reset();
      } else {
        setError(result.error || 'Failed to resend OTP. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStep('login');
    setTimeLeft(0);
    setError(null);
    otpForm.reset();
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card variant="glass" className="p-8 backdrop-blur-xl">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-400">
                Sign in to your Rival account
              </p>
            </div>

            <h3 className="text-xl font-semibold text-white mb-6 text-center">
              {step === 'login' ? 'Enter Your Phone Number' : 'Verify Your Phone'}
            </h3>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 backdrop-blur-sm">
                {error}
              </div>
            )}

            {step === 'login' ? (
              <form onSubmit={loginForm.handleSubmit(handleSendOTP)} className="space-y-6">
                <Input
                  {...loginForm.register('phone')}
                  label="Phone Number"
                  type="tel"
                  placeholder="0781234567"
                  icon={<Phone className="w-4 h-4" />}
                  error={loginForm.formState.errors.phone?.message}
                  helperText="Enter your Uganda mobile number"
                />

                <Button
                  type="submit"
                  variant="gradient"
                  fullWidth
                  loading={isLoading}
                  disabled={!loginForm.formState.isValid || isLoading}
                  size="lg"
                >
                  Send OTP
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <div className="text-center">
                  <p className="text-gray-400 text-sm">
                    Don't have an account?{' '}
                    <Link href="/register" className="text-purple-400 hover:text-purple-300 font-medium">
                      Sign up
                    </Link>
                  </p>
                </div>
              </form>
            ) : (
              <form onSubmit={otpForm.handleSubmit(handleVerifyOTP)} className="space-y-6">
                <div className="text-center mb-6">
                  <p className="text-gray-400 mb-2">
                    We sent a 6-digit code to
                  </p>
                  <p className="font-semibold text-white text-lg">
                    {phoneNumber}
                  </p>
                </div>

                <Input
                  {...otpForm.register('otp')}
                  label="Verification Code"
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  error={otpForm.formState.errors.otp?.message}
                  helperText="Enter the 6-digit code sent to your phone"
                />

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Back
                  </Button>

                  <Button
                    type="submit"
                    variant="gradient"
                    loading={isLoading}
                    disabled={!otpForm.formState.isValid || isLoading}
                    className="flex-1"
                  >
                    Sign In
                  </Button>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={timeLeft > 0 || isLoading}
                    className="text-sm text-purple-400 hover:text-purple-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                  >
                    {timeLeft > 0
                      ? `Resend code in ${formatTime(timeLeft)}`
                      : 'Resend code'}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-xs text-gray-500">
                © 2025 Naughty Code Systems. All rights reserved.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}