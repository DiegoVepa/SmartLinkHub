'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { ThemeToggle } from './theme-toggle';
import { 
  Home, 
  Settings, 
  Menu,
  X,
  Rocket
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Modern Mobile menu button */}
      <button
        type="button"
        className="lg:hidden fixed top-6 left-6 z-50 p-3 rounded-2xl bg-white border border-gray-200 shadow-lg backdrop-blur-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="h-5 w-5 text-gray-700" />
        ) : (
          <Menu className="h-5 w-5 text-gray-700" />
        )}
      </button>

      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Modern Sidebar */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-40 w-72 bg-white/80 backdrop-blur-lg border-r border-gray-200
          transform transition-all duration-300 ease-in-out shadow-xl
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Modern Logo/Brand */}
          <div className="flex items-center h-20 px-8 border-b border-gray-100">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4">
              <Rocket className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">TaskHub</h1>
              <p className="text-xs text-gray-500">Personal Task Manager</p>
            </div>
          </div>

          {/* Modern Navigation */}
          <nav className="flex-1 px-6 py-8 space-y-3">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-semibold rounded-2xl transition-all duration-200 group ${
                    isActive 
                      ? 'text-white bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className={`mr-4 h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Modern Bottom section */}
          <div className="p-6 border-t border-gray-100">
            <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-4">
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10 rounded-xl"
                  }
                }}
              />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 