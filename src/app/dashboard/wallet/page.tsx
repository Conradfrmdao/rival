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
    try {
      const response = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${useAuthStore.getState().token}`,
        },
        body: JSON.stringify({
          amount,
          phone,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // In a real implementation, you'd refresh wallet data
        // For now, add transaction locally
        addTransaction({
          id: result.data?.transactionId || `deposit_${Date.now()}`,
          type: 'deposit',
          amount,
          status: 'pending',
          description: `Mobile Money deposit to ${phone}`,
          created_at: new Date().toISOString()
        });
      } else {
        throw new Error(result.error || 'Deposit failed');
      }
    } catch (error) {
      console.error('Deposit error:', error);
      throw error;
    }
  };

  const handleWithdraw = async (amount: number, phone: string) => {
    try {
      const response = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${useAuthStore.getState().token}`,
        },
        body: JSON.stringify({
          amount,
          phone,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // In a real implementation, you'd refresh wallet data
        // For now, add transaction locally
        addTransaction({
          id: result.data?.transactionId || `withdraw_${Date.now()}`,
          type: 'withdrawal',
          amount,
          status: 'pending',
          description: `Mobile Money withdrawal to ${phone}`,
          created_at: new Date().toISOString()
        });
      } else {
        throw new Error(result.error || 'Withdrawal failed');
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      throw error;
    }
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