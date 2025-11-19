'use client';

import React, { useState } from 'react';
import { Menu, X, Zap, Wallet, User, TrendingUp, Trophy, Settings, HelpCircle, Bell, Search } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useWalletStore } from '@/store/walletStore';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface StakeLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

const StakeLayout: React.FC<StakeLayoutProps> = ({ children, showSidebar = true }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuthStore();
  const { balance } = useWalletStore();
  const pathname = usePathname();

  // Navigation items for sidebar
  const navigation = [
    { name: 'Home', href: '/', icon: Zap },
    { name: 'Dashboard', href: '/dashboard', icon: TrendingUp },
    { name: 'Games', href: '/dashboard/games', icon: Trophy },
    { name: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
    { name: 'Support', href: '/dashboard/support', icon: HelpCircle },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/' && pathname === '/') return true;
    if (href === '/dashboard' && pathname === '/dashboard') return true;
    return pathname.startsWith(href) && href !== '/';
  };

  const handleLogout = () => {
    // Implement logout logic
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Sidebar */}
      {showSidebar && (
        <>
          {/* Mobile backdrop */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <div
            className={cn(
              'fixed left-0 top-0 z-50 w-64 h-full bg-[#0f1014] border-r border-gray-800 transition-transform duration-300 ease-in-out lg:translate-x-0',
              sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            )}
          >
            <div className="flex flex-col h-full">
              {/* Logo */}
              <div className="p-6 border-b border-gray-800">
                <Link href="/" className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-lg rounded-full opacity-60" />
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
              </div>

              {/* Navigation Menu */}
              <nav className="flex-1 p-4 overflow-y-auto">
                <ul className="space-y-2">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                          isActive(item.href)
                            ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-400 border border-blue-500/30'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        )}
                      >
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* User Section */}
              <div className="p-4 border-t border-gray-800">
                <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Balance</span>
                    <span className="text-green-400 font-bold">{formatCurrency(balance)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
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
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">
                        {user?.username || 'Player'}
                      </div>
                      <div className="text-xs text-gray-400">Level 1</div>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full justify-start text-gray-400 hover:text-white border-gray-700"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Content Area */}
      <div className={cn(
        'transition-all duration-300 ease-in-out',
        showSidebar ? 'lg:ml-64' : 'lg:ml-0'
      )}>
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-30 h-16 bg-[#1a1c2e] backdrop-blur-xl border-b border-gray-800">
          <div className="flex items-center justify-between h-full px-4 lg:px-6">
            {/* Left side - Menu button and logo */}
            <div className="flex items-center space-x-4">
              {showSidebar && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden text-gray-400 hover:text-white"
                >
                  {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              )}
              {!showSidebar && (
                <Link href="/" className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-lg rounded-full opacity-60" />
                    <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-2">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                    Rival
                  </h1>
                </Link>
              )}
            </div>

            {/* Center - Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search games, players..."
                  className="w-full bg-[#0f1014] border border-gray-700 rounded-lg px-10 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Right side - User controls */}
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative text-gray-400 hover:text-white">
                <Bell className="w-5 h-5" />
                <Badge
                  variant="error"
                  size="sm"
                  className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center"
                >
                  3
                </Badge>
              </Button>

              {/* Wallet Balance (desktop) */}
              <div className="hidden sm:flex items-center space-x-2 bg-[#0f1014] border border-gray-700 px-3 py-2 rounded-lg">
                <Wallet className="w-4 h-4 text-green-400" />
                <span className="text-sm font-bold text-green-400">
                  {formatCurrency(balance)}
                </span>
              </div>

              {/* User Avatar */}
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
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="pt-16 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

export default StakeLayout;