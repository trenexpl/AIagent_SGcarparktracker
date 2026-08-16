import React, { useState } from 'react';
import { 
  Car, 
  Map, 
  Star, 
  Bell, 
  HelpCircle, 
  Database, 
  Navigation,
  Sparkles,
  User,
  LogOut,
  CreditCard,
  ChevronDown
} from 'lucide-react';
import { AppTabType } from './AppBottomNav';
import { UserAccount } from '../types/carpark';

interface HeaderProps {
  activeTab: AppTabType | 'how-it-works' | 'data-transparency';
  onSelectTab: (tab: AppTabType | 'how-it-works' | 'data-transparency') => void;
  savedCount: number;
  alertsCount: number;
  commentsCount?: number;
  currentUser: UserAccount | null;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onOpenPayment: (plan?: 'basic' | 'pro') => void;
  onLogOut: () => void;
  onQuickLocate?: () => void;
  onNewSearch?: () => void;
  onGoHome?: () => void;
  isMapResultsActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  savedCount,
  alertsCount,
  commentsCount = 0,
  currentUser,
  onOpenAuth,
  onOpenPayment,
  onLogOut,
  onQuickLocate,
  onNewSearch,
  onGoHome,
  isMapResultsActive = false,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleBrandClick = () => {
    if (onGoHome) {
      onGoHome();
    } else if (onNewSearch) {
      onNewSearch();
    } else {
      onSelectTab('search');
    }
  };

  const currentPlan = currentUser?.plan || 'free';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15 sm:h-16">
          {/* Logo & Brand: Native App Bar Style */}
          <div
            id="brand-logo-btn"
            onClick={handleBrandClick}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
            title="What The Park - Singapore Carpark App"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-sky-600 via-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-sky-600/20 group-hover:scale-105 transition-transform shrink-0">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg sm:text-xl tracking-tight text-slate-950">
                  What <span className="text-sky-600">The Park</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1 animate-pulse"></span>
                  LIVE SG
                </span>
              </div>
            </div>
          </div>

          {/* Desktop App Navigation Bar */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              id="nav-btn-map"
              onClick={() => onSelectTab('map')}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'map'
                  ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Map className="w-4 h-4" />
              <span>Live Map</span>
            </button>

            <button
              id="nav-btn-saved"
              onClick={() => onSelectTab('saved')}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 relative cursor-pointer ${
                activeTab === 'saved'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Star className={`w-4 h-4 ${activeTab === 'saved' ? 'fill-amber-400 text-amber-500' : 'text-amber-500'}`} />
              <span>Favorites</span>
              {savedCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-black bg-amber-500 text-slate-950 rounded-full">
                  {savedCount}
                </span>
              )}
            </button>

            <button
              id="nav-btn-alerts"
              onClick={() => onSelectTab('alerts')}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 relative cursor-pointer ${
                activeTab === 'alerts'
                  ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Alerts</span>
              {alertsCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-black bg-amber-500 text-slate-950 rounded-full">
                  {alertsCount}
                </span>
              )}
            </button>

            <div className="h-4 w-px bg-slate-200 mx-1" />

            <button
              id="nav-btn-how-it-works"
              onClick={() => onSelectTab('how-it-works')}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all flex items-center gap-1 cursor-pointer"
              title="App Guide"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Guide</span>
            </button>

            <button
              id="nav-btn-data-sources"
              onClick={() => onSelectTab('data-transparency')}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all flex items-center gap-1 cursor-pointer"
              title="LTA Live Telemetry"
            >
              <Database className="w-3.5 h-3.5 text-teal-600" />
              <span>LTA</span>
            </button>
          </nav>

          {/* Right Header Controls: User Account / Sign In / Subscription */}
          <div className="flex items-center gap-2">
            {!currentUser ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenAuth('login')}
                  id="btn-header-login"
                  className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-slate-600" />
                  <span>Log In</span>
                </button>
                <button
                  onClick={() => onOpenAuth('signup')}
                  id="btn-header-signup"
                  className="py-1.5 px-3 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>Sign Up</span>
                </button>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  id="btn-header-user-profile"
                  className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl border border-slate-200 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-lg bg-sky-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-extrabold leading-tight truncate max-w-[100px]">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium leading-none">
                      {currentPlan === 'pro' ? '★ Pro Unlimited' : currentPlan === 'basic' ? 'Basic ($2.99)' : 'Free Plan'}
                    </div>
                  </div>

                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsUserMenuOpen(false)} 
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in-50 zoom-in-95 duration-100">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <div className="text-xs font-black text-slate-900">{currentUser.name}</div>
                        <div className="text-[11px] text-slate-500 truncate">{currentUser.email}</div>
                        <div className="mt-1.5">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            currentPlan === 'pro'
                              ? 'bg-amber-100 text-amber-900'
                              : currentPlan === 'basic'
                              ? 'bg-sky-100 text-sky-900'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            Plan: {currentPlan === 'pro' ? 'Pro ($5.99/mo)' : currentPlan === 'basic' ? 'Basic ($2.99/mo)' : 'Free'}
                          </span>
                        </div>
                      </div>

                      <div className="p-1 space-y-0.5 text-xs font-bold text-slate-700">
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onSelectTab('saved');
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Star className="w-4 h-4 text-amber-500" />
                          <span>My Favorites ({savedCount})</span>
                        </button>

                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onOpenPayment(currentPlan === 'free' ? 'basic' : 'pro');
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-amber-50 text-amber-900 flex items-center gap-2 cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4 text-amber-600" />
                          <span>
                            {currentPlan === 'free' ? 'Purchase Plan ($2.99+)' : currentPlan === 'basic' ? 'Upgrade to Pro ($5.99)' : 'Manage Subscription'}
                          </span>
                        </button>

                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onLogOut();
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Mobile Header Buttons */}
            <div className="flex items-center gap-1 md:hidden">
              <button
                onClick={() => onSelectTab('how-it-works')}
                className="p-1.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                title="Guide"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => onSelectTab('data-transparency')}
                className="p-1.5 rounded-xl text-teal-600 hover:bg-slate-100 transition-colors"
                title="LTA Data"
              >
                <Database className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
