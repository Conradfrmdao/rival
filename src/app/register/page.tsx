'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Phone } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { sendOTP, verifyOTP } from '@/actions/auth';
import { useAuthStore } from '@/store/authStore';
import { formatPhoneNumber, validatePhoneNumber } from '@/lib/utils';

const phoneSchema = z.object({
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

type PhoneFormData = z.infer<typeof phoneSchema>;
type OTPFormData = z.infer<typeof otpSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const { login } = useAuthStore();

  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
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

  const handleSendOTP = async (data: PhoneFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const formattedPhone = formatPhoneNumber(data.phone);
      setPhoneNumber(formattedPhone);

      const result = await sendOTP(formattedPhone);

      if (result.success) {
        setOtpSent(true);
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
    setStep('phone');
    setOtpSent(false);
    setTimeLeft(0);
    setError(null);
    otpForm.reset();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Rival
          </h1>
          <h2 className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            P2P Gaming Platform
          </h2>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
              {step === 'phone' ? 'Enter Your Phone Number' : 'Enter Verification Code'}
            </h3>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                {error}
              </div>
            )}

            {step === 'phone' ? (
              <form onSubmit={phoneForm.handleSubmit(handleSendOTP)} className="space-y-6">
                <Input
                  {...phoneForm.register('phone')}
                  label="Phone Number"
                  type="tel"
                  placeholder="0781234567"
                  icon={<Phone className="w-5 h-5" />}
                  error={phoneForm.formState.errors.phone?.message}
                  helperText="Enter your Uganda mobile number"
                />

                <Button
                  type="submit"
                  fullWidth
                  loading={isLoading}
                  disabled={!phoneForm.formState.isValid || isLoading}
                >
                  Send OTP
                </Button>
              </form>
            ) : (
              <form onSubmit={otpForm.handleSubmit(handleVerifyOTP)} className="space-y-6">
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    We sent a 6-digit code to
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
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
                    loading={isLoading}
                    disabled={!otpForm.formState.isValid || isLoading}
                    className="flex-1"
                  >
                    Verify
                  </Button>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={timeLeft > 0 || isLoading}
                    className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    {timeLeft > 0
                      ? `Resend code in ${formatTime(timeLeft)}`
                      : 'Resend code'}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>By continuing, you agree to our Terms of Service and Privacy Policy.</p>
          </div>
        </div>
      </div>
    </div>
  );
}