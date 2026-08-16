import React, { useState } from 'react';
import { SavedCarparkItem, RecentSearchItem, Carpark, UserAccount, SubscriptionPlan } from '../types/carpark';
import { 
  Star, 
  Trash2, 
  Navigation, 
  History, 
  MapPin, 
  ArrowRight, 
  Clock, 
  Sparkles, 
  Compass, 
  PlusCircle,
  TrendingUp,
  Search,
  Map,
  Zap,
  Info,
  User,
  LogOut,
  ShieldCheck,
  CreditCard,
  Lock,
  Check,
  AlertTriangle
} from 'lucide-react';
import { SINGAPORE_CARPARKS } from '../data/singaporeCarparks';
import { formatDistance } from '../services/parkingService';
import { SUBSCRIPTION_PLANS } from '../services/storageService';

interface SavedCarparksViewProps {
  currentUser: UserAccount | null;
  savedCarparks: SavedCarparkItem[];
  allCarparks?: Carpark[];
  recentSearches: RecentSearchItem[];
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onOpenPayment: (plan?: 'basic' | 'pro') => void;
  onLogOut: () => void;
  onRemoveSaved: (carparkId: string) => void;
  onClearRecentSearches: () => void;
  onNavigateToCarpark: (carpark: Carpark) => void;
  onViewCarparkOnMap?: (carpark: Carpark) => void;
  onSearchDestination: (search: { name: string; latitude: number; longitude: number; address: string }) => void;
  onOpenSearchTab: () => void;
}

export const SavedCarparksView: React.FC<SavedCarparksViewProps> = ({
  currentUser,
  savedCarparks = [],
  allCarparks = SINGAPORE_CARPARKS,
  recentSearches = [],
  onOpenAuth,
  onOpenPayment,
  onLogOut,
  onRemoveSaved,
  onClearRecentSearches,
  onNavigateToCarpark,
  onViewCarparkOnMap,
  onSearchDestination,
  onOpenSearchTab,
}) => {
  const [searchFilter, setSearchFilter] = useState('');

  // Safe list
  const safeSavedList = Array.isArray(savedCarparks) ? savedCarparks : [];
  const safeRecentList = Array.isArray(recentSearches) ? recentSearches : [];

  const currentPlan: SubscriptionPlan = currentUser?.plan || 'free';
  const planInfo = SUBSCRIPTION_PLANS[currentPlan];

  // Match with real carpark objects for live data
  const getLiveCarpark = (id: string): Carpark | undefined => {
    return (
      (allCarparks && allCarparks.find((cp) => cp.id === id)) ||
      SINGAPORE_CARPARKS.find((cp) => cp.id === id)
    );
  };

  const filteredSaved = safeSavedList.filter((item) => {
    if (!item) return false;
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      (item.carparkName && item.carparkName.toLowerCase().includes(q)) ||
      (item.address && item.address.toLowerCase().includes(q)) ||
      (item.notes && item.notes.toLowerCase().includes(q))
    );
  });

  const popularDestinations = [
    { name: 'Orchard Road', address: 'Orchard Road, Singapore', lat: 1.3040, lng: 103.8318 },
    { name: 'Marina Bay Sands', address: '10 Bayfront Avenue, Singapore 018956', lat: 1.2834, lng: 103.8607 },
    { name: 'Bugis Junction', address: '200 Victoria Street, Singapore 188021', lat: 1.3000, lng: 103.8553 },
    { name: 'Suntec City', address: '3 Temasek Boulevard, Singapore 038983', lat: 1.2935, lng: 103.8572 },
  ];

  return (
    <div id="saved-carparks-container" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in-50 duration-200">
      
      {/* 1. TOP HERO / ACCOUNT STATUS BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Favorited Parking</span>
            
            {/* Account & Plan Status Pill */}
            {currentUser ? (
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-black flex items-center gap-1 ${
                currentUser.isAdmin || currentUser.role === 'admin'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 shadow-xs'
                  : currentPlan === 'pro'
                  ? 'bg-amber-400 text-slate-950'
                  : currentPlan === 'basic'
                  ? 'bg-sky-400 text-slate-950'
                  : 'bg-slate-700 text-slate-200'
              }`}>
                {currentUser.isAdmin || currentUser.role === 'admin' ? '👑 Master Admin (Full Access)' : currentPlan === 'pro' ? '★ Pro Unlimited' : currentPlan === 'basic' ? 'Basic (5 Spots)' : 'Free Plan'}
              </span>
            ) : (
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-rose-500/30 text-rose-300 border border-rose-400/30">
                Sign In Required
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Saved Carparks
          </h1>
          
          <p className="text-sm text-slate-300 mt-1 max-w-lg">
            {currentUser 
              ? `Account: ${currentUser.name} (${currentUser.email})`
              : 'Sign in to save and sync your favorite parking spots across Singapore with 1-tap navigation.'}
          </p>
        </div>

        {/* Top Right Action: Login / Signup or Upgrade / Logout */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {!currentUser ? (
            <>
              <button
                onClick={() => onOpenAuth('login')}
                id="btn-saved-login"
                className="py-2.5 px-4 bg-sky-600 hover:bg-sky-500 active:scale-95 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>Log In</span>
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                id="btn-saved-signup"
                className="py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Sign Up</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              {currentPlan === 'free' && (
                <button
                  onClick={() => onOpenPayment('basic')}
                  id="btn-banner-upgrade-plan"
                  className="py-2.5 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-95 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 fill-slate-950" />
                  <span>Choose Monthly Plan</span>
                </button>
              )}

              {currentPlan === 'basic' && (
                <button
                  onClick={() => onOpenPayment('pro')}
                  id="btn-banner-upgrade-pro"
                  className="py-2.5 px-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Upgrade to Pro ($5.99)</span>
                </button>
              )}

              <button
                onClick={onLogOut}
                id="btn-saved-logout"
                className="py-2.5 px-3 bg-white/10 hover:bg-rose-500/20 text-slate-300 hover:text-rose-200 border border-white/10 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                title="Log out of account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. AUTHENTICATION GATE (When user is NOT logged in) */}
      {!currentUser && (
        <div
          id="favorites-auth-gate-card"
          className="p-6 sm:p-10 bg-white rounded-3xl border-2 border-dashed border-sky-200 text-center space-y-6 shadow-sm"
        >
          <div className="w-16 h-16 rounded-3xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <span className="text-xs font-extrabold uppercase text-sky-600 tracking-wider">
              Account Sync &amp; Protection
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Sign In to Save Favorites
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              To favorite carparks across Singapore, track live lots, and get 1-tap navigation, please log in or create a free driver account.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto">
            <button
              onClick={() => onOpenAuth('login')}
              id="btn-auth-gate-login"
              className="w-full sm:w-auto py-3.5 px-6 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-black text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>Sign In to Account</span>
            </button>
            <button
              onClick={() => onOpenAuth('signup')}
              id="btn-auth-gate-signup"
              className="w-full sm:w-auto py-3.5 px-6 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-extrabold text-sm rounded-2xl border border-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Create New Account</span>
            </button>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-100 max-w-2xl mx-auto text-left text-xs text-slate-600">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block font-bold">1-Tap Star Favorites</strong>
                Save go-to carparks from map or search.
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
              <Navigation className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block font-bold">Fast Direct Navigation</strong>
                Launch Google/Apple Maps instantly.
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block font-bold">Synced Driver Profile</strong>
                Saved spots stay with your account.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. SIGNED IN & UNDER FREE PLAN -> SHOW MONTHLY SUBSCRIPTION PLANS TO PURCHASE */}
      {currentUser && currentPlan === 'free' && (
        <div id="free-plan-upgrade-section" className="space-y-6 animate-in fade-in-50 duration-200">
          
          {/* Informative notice banner */}
          <div className="p-5 bg-amber-50 border-2 border-amber-200 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-300 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                <Star className="w-5 h-5 fill-amber-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-slate-900 text-base">
                    Monthly Subscription Required for Favorites
                  </h3>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-200 text-amber-950">
                    Free Plan
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-2xl">
                  You are currently on the Free Driver plan. Select a monthly subscription plan below to unlock favorite carpark storage with live lot telemetry and 1-tap navigation:
                </p>
              </div>
            </div>
          </div>

          {/* Pricing Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* PLAN 1: BASIC PLAN $2.99 */}
            <div
              id="subscription-card-basic"
              className="bg-white rounded-3xl border-2 border-sky-300 p-6 sm:p-7 shadow-md flex flex-col justify-between relative overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-black uppercase text-sky-600 bg-sky-100 px-2.5 py-1 rounded-lg">
                      1. Basic Plan
                    </span>
                    <h3 className="text-2xl font-black text-slate-950 mt-2">Basic Driver</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-slate-900">$2.99</div>
                    <div className="text-xs text-slate-500 font-bold">SGD / month</div>
                  </div>
                </div>

                <div className="p-3.5 bg-sky-50 rounded-2xl border border-sky-200">
                  <div className="text-sm font-black text-sky-950 flex items-center gap-2">
                    <Star className="w-4 h-4 fill-sky-600 text-sky-600" />
                    <span>Able to save 5 locations to favorites</span>
                  </div>
                  <p className="text-xs text-sky-800 mt-1">
                    Perfect for saving your home, office, and regular weekend spots.
                  </p>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-sky-600 shrink-0 font-bold" />
                    <span><strong>Full GPS turn-by-turn navigation</strong> (Google, Apple, Waze, Citymapper)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-sky-600 shrink-0 font-bold" />
                    <span>Save up to 5 favorite locations in your account</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-sky-600 shrink-0 font-bold" />
                    <span>Live lot availability and rate updates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-sky-600 shrink-0 font-bold" />
                    <span>Cancel anytime with no lock-in</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100">
                <button
                  onClick={() => onOpenPayment('basic')}
                  id="btn-purchase-basic-plan"
                  className="w-full py-3.5 px-5 bg-sky-600 hover:bg-sky-700 active:scale-98 text-white font-black text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Purchase Basic · $2.99 / Month</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* PLAN 2: PRO PLAN $5.99 */}
            <div
              id="subscription-card-pro"
              className="bg-white rounded-3xl border-2 border-amber-400 p-6 sm:p-7 shadow-lg flex flex-col justify-between relative overflow-hidden ring-4 ring-amber-400/20"
            >
              {/* Featured Badge */}
              <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-600 text-slate-950 text-[11px] font-black uppercase tracking-wider px-4 py-1 rounded-bl-2xl shadow-sm">
                ★ Best Value
              </div>

              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-black uppercase text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg">
                      2. Pro Plan
                    </span>
                    <h3 className="text-2xl font-black text-slate-950 mt-2">Pro Unlimited</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-slate-900">$5.99</div>
                    <div className="text-xs text-slate-500 font-bold">SGD / month</div>
                  </div>
                </div>

                <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200">
                  <div className="text-sm font-black text-amber-950 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 fill-amber-500 text-amber-600" />
                    <span>Able to save UNLIMITED locations to favorites</span>
                  </div>
                  <p className="text-xs text-amber-900 mt-1">
                    Favorite all your frequent malls, CBD offices, and dining destinations.
                  </p>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-600 shrink-0 font-bold" />
                    <span><strong>Unlimited turn-by-turn GPS navigation</strong> across all apps</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-600 shrink-0 font-bold" />
                    <span><strong>Unlimited favorite locations</strong> with no cap</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-600 shrink-0 font-bold" />
                    <span>Priority live lot occupancy alerts &amp; push notifications</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-600 shrink-0 font-bold" />
                    <span>Cancel anytime with 1 click</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100">
                <button
                  onClick={() => onOpenPayment('pro')}
                  id="btn-purchase-pro-plan"
                  className="w-full py-3.5 px-5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 active:scale-98 text-slate-950 font-black text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 fill-slate-950" />
                  <span>Purchase Pro · $5.99 / Month</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. SIGNED IN & (BASIC OR PRO PLAN ACTIVE) -> SHOW FAVORITED CARPARKS LIST & LIMIT TRACKER */}
      {currentUser && currentPlan !== 'free' && (
        <div className="space-y-6">
          
          {/* Plan Quota & Status Bar */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                currentPlan === 'pro' ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700'
              }`}>
                {currentPlan === 'pro' ? <Sparkles className="w-5 h-5" /> : <Star className="w-5 h-5 fill-sky-600" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-900">
                    {currentPlan === 'pro' ? 'Pro Plan ($5.99/mo)' : 'Basic Plan ($2.99/mo)'}
                  </span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Active Subscription
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {currentPlan === 'pro' ? (
                    <span>Unlimited favorites active · Auto-renews monthly</span>
                  ) : (
                    <span>
                      Favorites Used: <strong>{safeSavedList.length} / 5 locations</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {currentPlan === 'basic' && safeSavedList.length >= 5 && (
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>5/5 Cap Reached</span>
                </span>
              )}

              {currentPlan === 'basic' && (
                <button
                  onClick={() => onOpenPayment('pro')}
                  id="btn-upgrade-basic-to-pro"
                  className="py-2 px-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Upgrade to Pro for Unlimited ($5.99)</span>
                </button>
              )}
            </div>
          </div>

          {/* Favorites Header & Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <h2 className="text-xl font-black text-slate-900">Your Favorited Locations</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold">
                {safeSavedList.length} {currentPlan === 'basic' ? '/ 5' : ''}
              </span>
            </div>

            {safeSavedList.length > 2 && (
              <div className="relative max-w-xs w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter saved spots..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-sky-500"
                />
              </div>
            )}
          </div>

          {/* Empty state when plan is active but 0 carparks saved */}
          {safeSavedList.length === 0 ? (
            <div
              id="empty-saved-locations-state"
              className="p-8 sm:p-12 text-center bg-white rounded-3xl border-2 border-dashed border-slate-300 text-slate-600 space-y-6 shadow-xs"
            >
              <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 text-amber-500 flex items-center justify-center mx-auto shadow-xs">
                <Star className="w-8 h-8 fill-amber-400 text-amber-500" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  No saved locations yet
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Your <strong>{planInfo.name}</strong> is active! Tap the <strong>star icon (★)</strong> on any carpark card, map popup, or details view to save it here for instant 1-tap navigation and live availability tracking.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={onOpenSearchTab}
                  id="btn-empty-state-search"
                  className="w-full sm:w-auto py-3.5 px-6 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-extrabold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Explore Carparks on Map</span>
                </button>
              </div>

              {/* Quick popular destinations to get started */}
              <div className="pt-4 border-t border-slate-100 max-w-lg mx-auto">
                <span className="text-xs uppercase font-extrabold text-slate-400 block mb-2.5">
                  Popular destinations to search &amp; favorite:
                </span>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {popularDestinations.map((dest) => (
                    <button
                      key={dest.name}
                      onClick={() =>
                        onSearchDestination({
                          name: dest.name,
                          address: dest.address,
                          latitude: dest.lat,
                          longitude: dest.lng,
                        })
                      }
                      className="px-3 py-1.5 bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-200 hover:border-sky-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5 text-sky-600" />
                      <span>{dest.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Grid of saved carparks */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSaved.map((item) => {
                const liveData = getLiveCarpark(item.carparkId);
                const total = liveData?.totalLots || 300;
                const avail = liveData?.availableLots ?? 120;
                const freePct = Math.round((avail / (total || 1)) * 100);
                const estimatedRate =
                  liveData?.rates?.estimatedHourlyRate !== undefined &&
                  liveData?.rates?.estimatedHourlyRate !== null
                    ? Number(liveData.rates.estimatedHourlyRate).toFixed(2)
                    : '2.00';

                return (
                  <div
                    key={item.id || item.carparkId}
                    id={`saved-carpark-item-${item.carparkId}`}
                    className="bg-white rounded-2xl border-2 border-slate-200 hover:border-amber-300 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                              {liveData?.agency || 'SG'} Carpark
                            </span>
                            <span className="text-xs text-amber-600 font-extrabold flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                              <Star className="w-3 h-3 fill-amber-500" /> Favorited
                            </span>
                            {(item.frequencyCount || 0) > 1 && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-800">
                                Navigated {item.frequencyCount}x
                              </span>
                            )}
                          </div>

                          <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-snug">
                            {item.carparkName}
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{item.address}</p>
                        </div>

                        {/* Un-favorite Star button */}
                        <button
                          onClick={() => onRemoveSaved(item.carparkId)}
                          className="p-2 rounded-xl text-amber-500 hover:text-rose-600 hover:bg-rose-50 border border-amber-200 hover:border-rose-300 transition-colors cursor-pointer"
                          title="Remove from favorites"
                          aria-label="Remove from favorites"
                        >
                          <Star className="w-4 h-4 fill-amber-400 hover:fill-none" />
                        </button>
                      </div>

                      {/* Live Availability Bar */}
                      <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-slate-500 font-medium">Live Availability</span>
                          <span className="font-bold text-slate-900">
                            {avail} / {total} lots ({freePct}% free)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              freePct > 40 ? 'bg-emerald-500' : freePct > 15 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(8, freePct))}%` }}
                          ></div>
                        </div>
                      </div>

                      {item.notes && (
                        <p className="text-xs text-slate-500 italic mt-2.5">"{item.notes}"</p>
                      )}
                    </div>

                    {/* Bottom Action Row */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                      <div className="text-xs text-slate-700">
                        Rate: <strong>${estimatedRate}</strong>/hr
                      </div>

                      <div className="flex items-center gap-2">
                        {onViewCarparkOnMap && liveData && (
                          <button
                            onClick={() => onViewCarparkOnMap(liveData)}
                            className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Map className="w-3.5 h-3.5 text-slate-600" />
                            <span>View Map</span>
                          </button>
                        )}

                        <button
                          id={`btn-navigate-saved-${item.carparkId}`}
                          onClick={() => {
                            if (liveData) {
                              onNavigateToCarpark(liveData);
                            }
                          }}
                          className="py-2 px-4 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Navigate</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. RECENT DESTINATION SEARCHES */}
      <div className="space-y-4 pt-6 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-black text-slate-900">Recent Searches</h2>
          </div>

          {safeRecentList.length > 0 && (
            <button
              onClick={onClearRecentSearches}
              className="text-xs font-semibold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
            >
              Clear History
            </button>
          )}
        </div>

        {safeRecentList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {safeRecentList.map((rec) => (
              <div
                key={rec.id}
                onClick={() =>
                  onSearchDestination({
                    name: rec.destinationName,
                    address: rec.address,
                    latitude: rec.latitude,
                    longitude: rec.longitude,
                  })
                }
                className="p-3.5 bg-white hover:bg-sky-50/60 rounded-xl border border-slate-200 shadow-2xs hover:border-sky-300 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <MapPin className="w-4 h-4 text-sky-600 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-slate-900 group-hover:text-sky-700 truncate">
                      {rec.destinationName}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 truncate">{rec.address}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-sky-600 transition-colors shrink-0 ml-2" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">Your recent searches will appear here automatically.</p>
        )}
      </div>

    </div>
  );
};
