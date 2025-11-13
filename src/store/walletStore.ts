import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'game_win' | 'game_loss' | 'fee';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  reference?: string;
  description: string;
  created_at: string;
  completed_at?: string;
}

interface WalletState {
  balance: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
}

interface WalletActions {
  setBalance: (balance: number) => void;
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  setPendingDeposits: (amount: number) => void;
  setPendingWithdrawals: (amount: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useWalletStore = create<WalletState & WalletActions>()(
  persist(
    (set, get) => ({
      // Initial state
      balance: 0,
      pendingDeposits: 0,
      pendingWithdrawals: 0,
      transactions: [],
      isLoading: false,
      error: null,

      // Actions
      setBalance: (balance) => {
        set({ balance });
      },

      setTransactions: (transactions) => {
        set({ transactions });
      },

      addTransaction: (transaction) => {
        const currentTransactions = get().transactions;
        set({
          transactions: [transaction, ...currentTransactions]
        });
      },

      updateTransaction: (id, updates) => {
        const currentTransactions = get().transactions;
        const updatedTransactions = currentTransactions.map(tx =>
          tx.id === id ? { ...tx, ...updates } : tx
        );
        set({ transactions: updatedTransactions });
      },

      setPendingDeposits: (pendingDeposits) => {
        set({ pendingDeposits });
      },

      setPendingWithdrawals: (pendingWithdrawals) => {
        set({ pendingWithdrawals });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      setError: (error) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'wallet-storage',
      partialize: (state) => ({
        balance: state.balance,
        pendingDeposits: state.pendingDeposits,
        pendingWithdrawals: state.pendingWithdrawals,
        transactions: state.transactions.slice(0, 50) // Keep only last 50 transactions
      })
    }
  )
);