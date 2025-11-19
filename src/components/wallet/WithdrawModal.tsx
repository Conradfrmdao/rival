'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle, Percent } from 'lucide-react';
import { formatCurrency, formatPhoneNumber } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface WithdrawModalProps {
  onClose: () => void;
  onWithdraw: (amount: number, phone: string) => Promise<void>;
  userPhone: string;
  availableBalance: number;
  minAmount: number;
}

export default function WithdrawModal({
  onClose,
  onWithdraw,
  userPhone,
  availableBalance,
  minAmount,
}: WithdrawModalProps) {
  const [amount, setAmount] = useState(minAmount.toString());
  const [phone, setPhone] = useState(userPhone);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');

  const withdrawalFee = 0.1; // 10% fee
  const withdrawalAmount = parseInt(amount) || 0;
  const feeAmount = Math.round(withdrawalAmount * withdrawalFee);
  const totalAmount = withdrawalAmount + feeAmount;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate amount
    if (withdrawalAmount < minAmount) {
      setError(`Minimum withdrawal amount is ${formatCurrency(minAmount)}`);
      return;
    }

    if (withdrawalAmount > availableBalance) {
      setError('Insufficient balance for withdrawal');
      return;
    }

    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setStep('processing');
    setIsProcessing(true);

    try {
      await onWithdraw(withdrawalAmount, formatPhoneNumber(phone));
      setStep('success');

      // Auto close after success
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Withdrawal failed. Please try again.');
      setStep('form');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAmountChange = (value: string) => {
    const num = parseInt(value) || 0;
    if (num <= availableBalance) {
      setAmount(value);
    }
  };

  const quickAmounts = [
    minAmount,
    Math.min(5000, availableBalance),
    Math.min(10000, availableBalance),
    Math.min(20000, availableBalance),
    availableBalance
  ].filter((amount, index, arr) => amount >= minAmount && arr.indexOf(amount) === index);

  if (step === 'processing') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Processing Withdrawal
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Sending {formatCurrency(withdrawalAmount)} to your Mobile Money account
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You will receive the funds shortly
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
            Withdrawal Successful!
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {formatCurrency(withdrawalAmount)} sent to your Mobile Money account
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
              Withdraw Funds
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
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 mb-6">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-orange-800 dark:text-orange-200">
                <p className="font-medium mb-1">Withdrawal Information</p>
                <p>10% platform fee applies to all withdrawals. Funds will be sent to your Mobile Money account.</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleWithdraw} className="space-y-6">
            {/* Amount Input */}
            <div>
              <Input
                type="number"
                label="Withdrawal Amount (UGX)"
                value={amount}
                onChange={(e) => handleAmountChange((e.target as HTMLInputElement).value)}
                min={minAmount}
                max={availableBalance}
                step="500"
                required
                helperText={`Min: ${formatCurrency(minAmount)}, Max: ${formatCurrency(availableBalance)}`}
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
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0781234567"
              required
              helperText="The phone number registered with your Mobile Money account"
            />

            {/* Fee Information */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Withdrawal Amount:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(withdrawalAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Platform Fee (10%):</span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    -{formatCurrency(feeAmount)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                  <span className="font-medium text-gray-900 dark:text-white">You'll Receive:</span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(withdrawalAmount - feeAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Deducted:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(totalAmount)}
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
                disabled={!amount || !phone || withdrawalAmount < minAmount || withdrawalAmount > availableBalance}
                className="flex-1"
              >
                Withdraw {formatCurrency(withdrawalAmount)}
              </Button>
            </div>
          </form>

          {/* Security Note */}
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center space-y-1">
            <p>Withdrawals are processed instantly during business hours.</p>
            <p>Standard Mobile Money transaction limits apply.</p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}