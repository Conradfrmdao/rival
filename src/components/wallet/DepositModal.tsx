'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import { formatCurrency, formatPhoneNumber } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface DepositModalProps {
  onClose: () => void;
  onDeposit: (amount: number, phone: string) => Promise<void>;
  userPhone: string;
  maxAmount: number;
}

export default function DepositModal({
  onClose,
  onDeposit,
  userPhone,
  maxAmount,
}: DepositModalProps) {
  const [amount, setAmount] = useState('1000');
  const [phone, setPhone] = useState(userPhone);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const depositAmount = parseInt(amount);

    // Validate amount
    if (depositAmount < 500) {
      setError('Minimum deposit amount is 500 UGX');
      return;
    }

    if (depositAmount > maxAmount) {
      setError(`Maximum deposit amount is ${formatCurrency(maxAmount)}`);
      return;
    }

    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setStep('processing');
    setIsProcessing(true);

    try {
      await onDeposit(depositAmount, formatPhoneNumber(phone));
      setStep('success');

      // Auto close after success
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deposit failed. Please try again.');
      setStep('form');
    } finally {
      setIsProcessing(false);
    }
  };

  const quickAmounts = [1000, 2000, 5000, 10000, 20000];

  if (step === 'processing') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Processing Deposit
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Initiating Mobile Money payment of {formatCurrency(parseInt(amount))}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You will receive a prompt on your phone to authorize the payment
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Deposit Initiated!
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Payment request sent to your phone
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Complete the payment on your phone to receive funds
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Deposit Funds
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isProcessing}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-6">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">Mobile Money Deposit</p>
                <p>You will receive a USSD prompt on your phone to authorize this payment.</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleDeposit} className="space-y-6">
            {/* Amount Input */}
            <div>
              <Input
                type="number"
                label="Deposit Amount (UGX)"
                value={amount}
                onChange={(e) => setAmount((e.target as HTMLInputElement).value)}
                min="500"
                max={maxAmount}
                step="500"
                required
                helperText={`Min: ${formatCurrency(500)}, Max: ${formatCurrency(maxAmount)}`}
                error={error}
              />

              {/* Quick Amount Buttons */}
              <div className="mt-3 flex flex-wrap gap-2">
                {quickAmounts.map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(quickAmount.toString())}
                    disabled={isProcessing}
                    className="text-xs"
                  >
                    {formatCurrency(quickAmount)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Phone Input */}
            <Input
              type="tel"
              label="Mobile Money Phone Number"
              value={phone}
              onChange={(e) => setPhone((e.target as HTMLInputElement).value)}
              placeholder="0781234567"
              required
              helperText="The phone number registered with your Mobile Money account"
            />

            {/* Fee Information */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Deposit Amount:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(parseInt(amount) || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Processing Fee:</span>
                  <span className="font-medium text-gray-900 dark:text-white">Free</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                  <span className="font-medium text-gray-900 dark:text-white">You'll Receive:</span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(parseInt(amount) || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isProcessing}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={isProcessing}
                disabled={!amount || !phone || parseInt(amount) < 500}
                className="flex-1"
              >
                Deposit {formatCurrency(parseInt(amount) || 0)}
              </Button>
            </div>
          </form>

          {/* Security Note */}
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
            <p>Your payment information is secure and encrypted.</p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}