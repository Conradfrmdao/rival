import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Gamepad2, Wallet, User, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const Navigation: React.FC = () => {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Games', href: '/dashboard/games', icon: Gamepad2 },
    { name: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
    { name: 'Support', href: '/dashboard/support', icon: HelpCircle },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700 w-64 min-h-screen">
      <div className="p-4">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href ||
                           (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    'hover:bg-gray-50 dark:hover:bg-gray-700',
                    isActive
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Game Stats Summary */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Quick Stats
          </h3>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Games Played</span>
              <span className="text-gray-900 dark:text-white font-medium">0</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Win Rate</span>
              <span className="text-gray-900 dark:text-white font-medium">0%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Total Won</span>
              <span className="text-green-600 dark:text-green-400 font-medium">UGX 0</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;