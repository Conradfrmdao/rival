'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';
import Navigation from '@/components/layout/Navigation';
import WalletDashboard from '@/components/wallet/WalletDashboard';
import { useAuthStore } from '@/store/authStore';
import { useWalletStore } from '@/store/walletStore';
import Link from 'next/link';

export default function WalletPage() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { setBalance, addTransaction } = useWalletStore();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

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
    const currentBalance = useWalletStore.getState().balance;
    setBalance(currentBalance - amount);
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
    <div className="min-h-screen bg-black">
      <Header onLogout={handleLogout} currentPage="wallet" />
      <div className="flex">
        <Navigation />
        <main className="flex-1">
          <div className="p-6">
            {/* Back Button */}
            <div className="mb-6">
              <Link href="/dashboard" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
            </div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">
                Wallet
              </h1>
              <p className="text-gray-400">
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