'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Phone, User, CreditCard, Calendar, Lock, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { sendOTP, verifyOTP } from '@/actions/auth';
import { useAuthStore } from '@/store/authStore';
import { formatPhoneNumber, validatePhoneNumber } from '@/lib/utils';

const registrationSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  nin: z.string()
    .length(14, 'National ID must be exactly 14 characters')
    .regex(/^[A-Z0-9]+$/, 'National ID must contain only uppercase letters and numbers'),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must be at most 15 digits')
    .refine((phone) => validatePhoneNumber(phone), {
      message: 'Please enter a valid Uganda phone number',
    }),
  dateOfBirth: z.string()
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();

      const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
      return actualAge >= 18;
    }, 'You must be at least 18 years old to register'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine((val) => val === true, 'You must accept the terms and conditions'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const otpSchema = z.object({
  otp: z
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d+$/, 'OTP must contain only numbers'),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;
type OTPFormData = z.infer<typeof otpSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<'registration' | 'otp'>('registration');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [registrationData, setRegistrationData] = useState<RegistrationFormData | null>(null);

  const { login } = useAuthStore();

  const registrationForm = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
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

  const handleRegistration = async (data: RegistrationFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const formattedPhone = formatPhoneNumber(data.phone);
      setPhoneNumber(formattedPhone);
      setRegistrationData(data);

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
    setStep('registration');
    setOtpSent(false);
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
                Rival
              </h1>
              <p className="text-gray-400">
                P2P Gaming Platform
              </p>
            </div>

            <h3 className="text-xl font-semibold text-white mb-6 text-center">
              {step === 'registration' ? 'Create Account' : 'Verify Your Phone'}
            </h3>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 backdrop-blur-sm">
                {error}
              </div>
            )}

            {step === 'registration' ? (
              <form onSubmit={registrationForm.handleSubmit(handleRegistration)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    {...registrationForm.register('firstName')}
                    label="First Name"
                    type="text"
                    placeholder="John"
                    icon={<User className="w-4 h-4" />}
                    error={registrationForm.formState.errors.firstName?.message}
                  />
                  <Input
                    {...registrationForm.register('lastName')}
                    label="Last Name"
                    type="text"
                    placeholder="Doe"
                    icon={<User className="w-4 h-4" />}
                    error={registrationForm.formState.errors.lastName?.message}
                  />
                </div>

                <Input
                  {...registrationForm.register('nin')}
                  label="National ID Number"
                  type="text"
                  placeholder="CM1234567890AB"
                  icon={<CreditCard className="w-4 h-4" />}
                  error={registrationForm.formState.errors.nin?.message}
                  helperText="Enter your 14-character Uganda National ID"
                />

                <Input
                  {...registrationForm.register('dateOfBirth')}
                  label="Date of Birth"
                  type="date"
                  icon={<Calendar className="w-4 h-4" />}
                  error={registrationForm.formState.errors.dateOfBirth?.message}
                  helperText="You must be 18+ to register"
                />

                <Input
                  {...registrationForm.register('phone')}
                  label="Phone Number"
                  type="tel"
                  placeholder="0781234567"
                  icon={<Phone className="w-4 h-4" />}
                  error={registrationForm.formState.errors.phone?.message}
                  helperText="Enter your Uganda mobile number"
                />

                <Input
                  {...registrationForm.register('password')}
                  label="Password"
                  type="password"
                  placeholder="Create a strong password"
                  icon={<Lock className="w-4 h-4" />}
                  error={registrationForm.formState.errors.password?.message}
                  helperText="Must contain uppercase, lowercase, and number"
                />

                <Input
                  {...registrationForm.register('confirmPassword')}
                  label="Confirm Password"
                  type="password"
                  placeholder="Re-enter your password"
                  icon={<Lock className="w-4 h-4" />}
                  error={registrationForm.formState.errors.confirmPassword?.message}
                  helperText="Passwords must match"
                />

                <div className="space-y-4">
                  <label className="flex items-start gap-3 text-sm">
                    <input
                      type="checkbox"
                      {...registrationForm.register('acceptTerms')}
                      className="mt-1 rounded border-purple-500/30 bg-black/40 text-purple-600 focus:ring-purple-500 focus:ring-2"
                    />
                    <span className="text-gray-300">
                      I accept the{' '}
                      <button type="button" className="text-purple-400 hover:text-purple-300 underline">
                        Terms and Conditions
                      </button>
                      {' '}and{' '}
                      <button type="button" className="text-purple-400 hover:text-purple-300 underline">
                        Privacy Policy
                      </button>
                    </span>
                  </label>
                  {registrationForm.formState.errors.acceptTerms && (
                    <p className="text-red-400 text-sm">
                      {registrationForm.formState.errors.acceptTerms.message}
                    </p>
                  )}
                </div>

                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mb-6">
                  <h4 className="font-semibold text-purple-300 mb-2">Uganda Gaming Regulations</h4>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    By registering, you confirm that you are 18 years or older and agree to comply with
                    Uganda's gaming regulations. Gaming involves financial risk and can be addictive.
                    Please play responsibly.
                  </p>
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  fullWidth
                  loading={isLoading}
                  disabled={!registrationForm.formState.isValid || isLoading}
                  size="lg"
                >
                  Create Account & Verify Phone
                </Button>
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
                    Verify & Complete
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