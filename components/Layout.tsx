import React, { useState } from 'react';
import { Menu, Home, Heart, UserSearch, Users, X, Settings, Globe, LogIn, LogOut, User } from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, language, setLanguage } = useLanguage();
  const { user, loginWithGoogle, logout, isAdmin } = useAuth();

  const navItems = [
    { id: 'dashboard', label: t.dashboard, icon: <Home size={20} /> },
    { id: 'donations', label: t.donations, icon: <Heart size={20} /> },
    { id: 'finder', label: t.personFinder, icon: <UserSearch size={20} /> },
    { id: 'volunteers', label: t.volunteers, icon: <Users size={20} /> },
    ...(isAdmin ? [{ id: 'admin', label: t.admin, icon: <Settings size={20} /> }] : []),
  ];

  const handleNav = (page: string) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'si' : 'en');
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col fixed inset-y-0 z-20">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/LankaRelief.png" alt="LankaRelief" className="w-10 h-10 object-contain" />
            <span className="text-xl font-bold text-gray-900">{t.appTitle}</span>
          </div>
        </div>

        <div className="px-4 pt-4">
          <button
            onClick={toggleLanguage}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors text-gray-700"
          >
            <Globe size={16} />
            {language === 'en' ? 'සිංහලට මාරු කරන්න' : 'Switch to English'}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${currentPage === item.id
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-4">
          {user ? (
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-3 mb-3">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <User size={16} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.displayName}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg text-xs font-medium transition-colors text-gray-700"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={loginWithGoogle}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <LogIn size={16} />
              Sign in with Google
            </button>
          )}

          <div className="bg-red-50 rounded-xl p-4">
            <p className="text-xs text-red-600 font-semibold mb-1">{t.emergency}</p>
            <p className="text-sm text-gray-600 mb-2">{t.callDMC}</p>
            <a href="tel:117" className="block w-full py-2 bg-red-600 text-white text-center rounded-lg text-sm font-bold hover:bg-red-700">117</a>
          </div>


        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 inset-x-0 h-16 bg-white border-b border-gray-200 z-20 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/LankaRelief.png" alt="LankaRelief" className="w-10 h-10 object-contain" />
          <span className="text-xl font-bold text-gray-900">{t.appTitle}</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleLanguage} className="p-2 text-gray-600 font-bold text-sm">
            {language === 'en' ? 'SI' : 'EN'}
          </button>
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-gray-600">
            <Menu />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-gray-900/50 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-white p-4 shadow-xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
              <span className="font-bold text-lg">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)}><X /></button>
            </div>

            <nav className="space-y-2 flex-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${currentPage === item.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="pt-4 border-t border-gray-100 space-y-4">
              {user ? (
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-3 mb-3">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <User size={16} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{user.displayName}</p>
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg text-xs font-medium transition-colors text-gray-700"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={loginWithGoogle}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <LogIn size={16} />
                  Sign in with Google
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-20 lg:pt-8 px-4 lg:px-8 pb-12 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>


    </div>
  );
};