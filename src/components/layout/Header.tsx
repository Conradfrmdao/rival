import React, { useState } from 'react';
import Link from 'next/link';
import { User, LogOut, Wallet, Menu, X, Zap, TrendingUp, Bell } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useWalletStore } from '@/store/walletStore';
import { formatCurrency } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  onLogout: () => void;
  currentPage?: string;
}

const Header: React.FC<HeaderProps> = ({ onLogout, currentPage }) => {
  const { user } = useAuthStore();
  const { balance } = useWalletStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Wallet },
    { name: 'Games', href: '/dashboard/games', icon: Zap },
    { name: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard' && currentPage === 'dashboard') return true;
    return currentPage?.includes(href.split('/')[1]);
  };

  return (
    <>
      <header className="relative bg-gradient-to-r from-gray-900 via-purple-900/20 to-gray-900 backdrop-blur-xl border-b border-purple-500/20 shadow-2xl">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 animate-pulse" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-600 blur-xl rounded-full opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-2">
                  <Zap className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  Rival
                </h1>
                <span className="text-xs text-gray-400 uppercase tracking-wider">P2P Gaming</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    isActive(item.href)
                      ? 'text-white bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.name}
                  {isActive(item.href) && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg -z-10"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* Right side items */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative text-gray-300 hover:text-white">
                <Bell className="w-5 h-5" />
                <Badge
                  variant="error"
                  size="sm"
                  className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center"
                >
                  3
                </Badge>
              </Button>

              {/* Wallet Balance */}
              <div className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 px-4 py-2 rounded-xl backdrop-blur-sm">
                <Wallet className="w-4 h-4 text-green-400" />
                <span className="text-sm font-bold text-green-400">
                  {formatCurrency(balance)}
                </span>
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex items-center space-x-2">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-md opacity-50" />
                    <div className="relative w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-2 border-white/20">
                      {user?.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.username}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>
                  <div className="hidden lg:block">
                    <div className="text-sm font-medium text-white">{user?.username || 'Player'}</div>
                    <div className="text-xs text-gray-400">Level 1</div>
                  </div>
                </div>

                {/* Mobile menu button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden text-gray-300 hover:text-white"
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-gray-900/95 backdrop-blur-xl border-b border-purple-500/20"
          >
            <div className="px-4 py-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-all ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/30'
                      : 'text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
              <div className="border-t border-gray-700 pt-3 mt-3">
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-gray-400 text-sm">Balance</span>
                  <span className="text-green-400 font-bold">{formatCurrency(balance)}</span>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => {
                    onLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;