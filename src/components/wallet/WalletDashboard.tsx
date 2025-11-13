'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useWalletStore } from '@/store/walletStore';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/ui/Button';
import DepositModal from './DepositModal';
import WithdrawModal from './WithdrawModal';

interface WalletDashboardProps {
  onDeposit: (amount: number, phone: string) => Promise<void>;
  onWithdraw: (amount: number, phone: string) => Promise<void>;
}

export default function WalletDashboard({ onDeposit, onWithdraw }: WalletDashboardProps) {
  const { balance, pendingDeposits, pendingWithdrawals, transactions } = useWalletStore();
  const { user } = useAuthStore();

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const totalPending = pendingDeposits + pendingWithdrawals;
  const availableBalance = balance - totalPending;

  const handleDeposit = async (amount: number, phone: string) => {
    setIsLoading(true);
    try {
      await onDeposit(amount, phone);
      setShowDepositModal(false);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Deposit failed:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async (amount: number, phone: string) => {
    setIsLoading(true);
    try {
      await onWithdraw(amount, phone);
      setShowWithdrawModal(false);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Withdrawal failed:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'failed':
      case 'cancelled':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'deposit': return 'Deposit';
      case 'withdrawal': return 'Withdrawal';
      case 'game_win': return 'Game Win';
      case 'game_loss': return 'Game Loss';
      case 'fee': return 'Platform Fee';
      default: return type;
    }
  };

  const getTransactionColor = (type: string, amount: number) => {
    if (type === 'deposit' || type === 'game_win') {
      return 'text-green-600 dark:text-green-400';
    } else if (type === 'withdrawal' || type === 'game_loss' || type === 'fee') {
      return 'text-red-600 dark:text-red-400';
    }
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Balance */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Current Balance</h3>
          <div className="text-3xl font-bold mb-4">{formatCurrency(balance)}</div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowDepositModal(true)}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              disabled={isLoading}
            >
              <ArrowDownLeft className="w-4 h-4 mr-2" />
              Deposit
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowWithdrawModal(true)}
              className="bg-transparent hover:bg-white/10 text-white border-white/30"
              disabled={isLoading || balance === 0}
            >
              <ArrowUpRight className="w-4 h-4 mr-2" />
              Withdraw
            </Button>
          </div>
        </div>

        {/* Available Balance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Available Balance
          </h3>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {formatCurrency(availableBalance)}
          </div>
          {totalPending > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {formatCurrency(totalPending)} pending
            </p>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Stats
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Pending Deposits</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(pendingDeposits)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Pending Withdrawals</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(pendingWithdrawals)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Total Transactions</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {transactions.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Transaction History
          </h3>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {transactions.length > 0 ? (
            transactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Status Icon */}
                    <div className={`p-2 rounded-lg ${getStatusColor(transaction.status)}`}>
                      {getStatusIcon(transaction.status)}
                    </div>

                    {/* Transaction Details */}
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {getTransactionTypeLabel(transaction.type)}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {new Date(transaction.created_at).toLocaleDateString()} •
                        {new Date(transaction.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`font-semibold ${getTransactionColor(transaction.type, transaction.amount)}`}>
                      {transaction.type === 'deposit' || transaction.type === 'game_win' ? '+' : '-'}
                      {formatCurrency(Math.abs(transaction.amount))}
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full inline-flex items-center gap-1 mt-1 ${getStatusColor(transaction.status)}`}>
                      {getStatusIcon(transaction.status)}
                      {transaction.status}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="p-12 text-center">
              <div className="text-gray-400 dark:text-gray-600 mb-4">
                <Clock className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No transactions yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Your transaction history will appear here
              </p>
              <Button onClick={() => setShowDepositModal(true)}>
                Make Your First Deposit
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showDepositModal && (
        <DepositModal
          onClose={() => setShowDepositModal(false)}
          onDeposit={handleDeposit}
          userPhone={user?.phone || ''}
          maxAmount={100000} // Max deposit limit
        />
      )}

      {showWithdrawModal && (
        <WithdrawModal
          onClose={() => setShowWithdrawModal(false)}
          onWithdraw={handleWithdraw}
          userPhone={user?.phone || ''}
          availableBalance={availableBalance}
          minAmount={1000} // Min withdrawal
        />
      )}
    </div>
  );
}