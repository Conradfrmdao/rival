'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Navigation from '@/components/layout/Navigation';
import WalletDashboard from '@/components/wallet/WalletDashboard';
import { useAuthStore } from '@/store/authStore';
import { useWalletStore } from '@/store/walletStore';

export default function WalletPage() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { setBalance, addTransaction } = useWalletStore();

  const handleDeposit = async (amount: number, phone: string) => {
    // Simulate deposit processing
    console.log('Processing deposit:', amount, phone);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Update wallet state (in real app, this would be updated by backend/websocket)
    const currentBalance = useWalletStore.getState().balance;
    setBalance(currentBalance + amount);
    addTransaction({
      id: `deposit_${Date.now()}`,
      type: 'deposit',
      amount,
      status: 'pending',
      description: `Mobile Money deposit from ${phone}`,
      created_at: new Date().toISOString()
    });
  };

  const handleWithdraw = async (amount: number, phone: string) => {
    // Simulate withdrawal processing
    console.log('Processing withdrawal:', amount, phone);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Update wallet state (in real app, this would be updated by backend/websocket)
    setBalance((prev: number) => prev - amount);
    addTransaction({
      id: `withdraw_${Date.now()}`,
      type: 'withdrawal',
      amount,
      status: 'completed',
      description: `Mobile Money withdrawal to ${phone}`,
      created_at: new Date().toISOString(),
      completed_at: new Date().toISOString()
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header onLogout={handleLogout} />
      <div className="flex">
        <Navigation />
        <main className="flex-1">
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Wallet
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your deposits, withdrawals, and transaction history
              </p>
            </div>
            <WalletDashboard
              onDeposit={handleDeposit}
              onWithdraw={handleWithdraw}
            />
          </div>
        </main>
      </div>
    </div>
  );
}