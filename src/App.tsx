import React, { useState, useEffect, useMemo } from 'react';
import { 
  Carpark, 
  SearchDestination, 
  SavedCarparkItem, 
  RecentSearchItem, 
  AlertSetting, 
  FilterOptions,
  CommunityComment,
  UserAccount,
  SubscriptionPlan
} from './types/carpark';
import { SINGAPORE_DESTINATIONS } from './data/singaporeDestinations';
import { SINGAPORE_CARPARKS } from './data/singaporeCarparks';
import { 
  getCarparksNearDestination, 
  filterAndSortCarparks, 
  formatDistance,
  fetchLiveLtaCarparks 
} from './services/parkingService';
import { storageService, SUBSCRIPTION_PLANS } from './services/storageService';
import { geocodeSingaporeAddress } from './services/geocodingService';

// Subcomponents
import { Header } from './components/Header';
import { AppBottomNav, AppTabType } from './components/AppBottomNav';
import { HeroSearch } from './components/HeroSearch';
import { InteractiveMap } from './components/InteractiveMap';
import { CarparkCard } from './components/CarparkCard';
import { RecommendedBanner } from './components/RecommendedBanner';
import { CarparkComparison } from './components/CarparkComparison';
import { CarparkDetailsModal } from './components/CarparkDetailsModal';
import { AvailabilityAlertModal } from './components/AvailabilityAlertModal';
import { NavigationDrawer } from './components/NavigationDrawer';
import { SavedCarparksView } from './components/SavedCarparksView';
import { AlertsManagerView } from './components/AlertsManagerView';
import { HowItWorksModal } from './components/HowItWorksModal';
import { DataTransparencyModal } from './components/DataTransparencyModal';
import { FiltersBar } from './components/FiltersBar';
import { DisqusComments } from './components/DisqusComments';
import { AuthModal } from './components/AuthModal';
import { PaymentModal } from './components/PaymentModal';

// Icons
import { 
  Map, 
  List, 
  GitCompare, 
  Sparkles, 
  Navigation, 
  RefreshCw, 
  AlertCircle, 
  Check, 
  Layers, 
  ShieldAlert, 
  Info,
  Car,
  Search,
  ArrowLeft,
  DollarSign,
  MapPin,
  Compass,
  SlidersHorizontal,
  ChevronDown,
  Loader2
} from 'lucide-react';

const INITIAL_FILTERS: FilterOptions = {
  agency: 'all',
  maxPricePerHour: 10,
  maxDistanceMeters: 1000,
  minAvailableLots: 0,
  availabilityStatus: 'all',
  coveredOnly: false,
  evChargingOnly: false,
  handicapOnly: false,
  twentyFourHoursOnly: false,
  vehicleType: 'Car',
  sortBy: 'recommended',
};

export default function App() {
  // Native App Tab Navigation: 'search' | 'map' | 'saved' | 'alerts' | 'community' | 'how-it-works' | 'data-transparency'
  const [activeTab, setActiveTab] = useState<AppTabType | 'how-it-works' | 'data-transparency'>('search');

  // Search destination state (defaults to ION Orchard Singapore)
  const [activeDestination, setActiveDestination] = useState<{
    name: string;
    latitude: number;
    longitude: number;
    address: string;
  }>(SINGAPORE_DESTINATIONS[0]);

  // Carpark data pool with live simulated fluctuations
  const [carparkPool, setCarparkPool] = useState<Carpark[]>(SINGAPORE_CARPARKS);
  const [lastRefreshedTime, setLastRefreshedTime] = useState<string>('Just now');
  const [isRefreshingData, setIsRefreshingData] = useState<boolean>(false);

  // Selected carpark for map pan / focus
  const [selectedCarpark, setSelectedCarpark] = useState<Carpark | null>(null);

  // Modals & Drawers state
  const [detailsCarpark, setDetailsCarpark] = useState<Carpark | null>(null);
  const [alertCarpark, setAlertCarpark] = useState<Carpark | null>(null);
  const [navigatingCarpark, setNavigatingCarpark] = useState<Carpark | null>(null);
  const [comparedCarparks, setComparedCarparks] = useState<Carpark[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);

  // User Account & Subscription Modals
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => storageService.getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [authPromptReason, setAuthPromptReason] = useState<string | undefined>(undefined);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [paymentInitialPlan, setPaymentInitialPlan] = useState<'basic' | 'pro'>('basic');

  // Driver storage state
  const [savedCarparks, setSavedCarparks] = useState<SavedCarparkItem[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>([]);
  const [alerts, setAlerts] = useState<AlertSetting[]>([]);
  const [commentsCount, setCommentsCount] = useState<number>(0);

  // Filters & Sorting state
  const [filters, setFilters] = useState<FilterOptions>(INITIAL_FILTERS);

  // View Mode in Map Page: 'map' (default) or 'list'
  const [mapPageViewMode, setMapPageViewMode] = useState<'map' | 'list'>('map');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [alertNotificationBanner, setAlertNotificationBanner] = useState<string | null>(null);
  const [mapHeaderSearchQuery, setMapHeaderSearchQuery] = useState<string>('');
  const [isMapHeaderSearching, setIsMapHeaderSearching] = useState<boolean>(false);

  // Load initial persistent storage & fetch live LTA backend carparks
  useEffect(() => {
    const user = storageService.getCurrentUser();
    setCurrentUser(user);
    setSavedCarparks(storageService.getSavedCarparks());
    setRecentSearches(storageService.getRecentSearches());
    setAlerts(storageService.getAlerts());
    setCommentsCount(storageService.getCommunityComments().length);

    // Fetch initial live carparks from backend
    loadLiveLtaData();
  }, []);

  const loadLiveLtaData = async (force = false) => {
    setIsRefreshingData(true);
    try {
      const result = await fetchLiveLtaCarparks({ force });
      if (result && result.carparks.length > 0) {
        setCarparkPool(result.carparks);
        setLastRefreshedTime(result.lastUpdated || 'Just now');
      }
    } catch (err) {
      console.warn('Backend live fetch warning, using existing pool:', err);
    } finally {
      setIsRefreshingData(false);
    }
  };

  // Compute carparks near destination (strictly within 1km and max 10 recommendations)
  const nearbyCarparks = useMemo(() => {
    return getCarparksNearDestination(
      activeDestination.latitude,
      activeDestination.longitude,
      carparkPool,
      1000,
      activeDestination.name
    );
  }, [activeDestination, carparkPool]);

  // Apply driver filters & sort
  const filteredCarparks = useMemo(() => {
    return filterAndSortCarparks(nearbyCarparks, filters);
  }, [nearbyCarparks, filters]);

  // Identify algorithm recommended carpark
  const recommendedCarpark = useMemo(() => {
    return (
      filteredCarparks.find((cp) => cp.recommendationBadge === 'best_overall') ||
      filteredCarparks[0] ||
      null
    );
  }, [filteredCarparks]);

  // Periodic live occupancy sync from backend (every 30s)
  useEffect(() => {
    const interval = setInterval(() => {
      loadLiveLtaData(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [alerts]);

  // Manual refresh trigger
  const handleManualRefresh = () => {
    loadLiveLtaData(true);
  };

  // Handle Search Destination inside Map Page
  const handleMapHeaderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapHeaderSearchQuery.trim()) return;

    setIsMapHeaderSearching(true);
    try {
      const result = await geocodeSingaporeAddress(mapHeaderSearchQuery.trim());
      handleSelectDestination({
        name: result.name,
        address: result.address,
        latitude: result.latitude,
        longitude: result.longitude,
      });
      setMapHeaderSearchQuery('');
    } catch (err) {
      handleSelectDestination({
        name: mapHeaderSearchQuery.trim(),
        address: `${mapHeaderSearchQuery.trim()}, Singapore`,
        latitude: 1.3040,
        longitude: 103.8318,
      });
    } finally {
      setIsMapHeaderSearching(false);
    }
  };

  // Search Destination handler -> Automatically transitions to Map Tab
  const handleSelectDestination = (
    dest: SearchDestination | { name: string; latitude: number; longitude: number; address: string }
  ) => {
    setActiveDestination({
      name: dest.name,
      address: dest.address,
      latitude: dest.latitude,
      longitude: dest.longitude,
    });
    setSelectedCarpark(null);
    setActiveTab('map'); // Switch to Live Map app view!

    storageService.addRecentSearch(
      dest.name,
      dest.name,
      dest.address,
      dest.latitude,
      dest.longitude
    );
    setRecentSearches(storageService.getRecentSearches());
  };

  // Use Current Geolocation
  const handleUseCurrentLocation = () => {
    setIsLoadingLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setIsLoadingLocation(false);
          handleSelectDestination({
            name: 'Current Location',
            address: 'Singapore (GPS Location)',
            latitude: lat,
            longitude: lng,
          });
        },
        (error) => {
          console.warn('Geolocation error:', error);
          setIsLoadingLocation(false);
          // Fallback to Orchard
          handleSelectDestination(SINGAPORE_DESTINATIONS[0]);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setIsLoadingLocation(false);
      handleSelectDestination(SINGAPORE_DESTINATIONS[0]);
    }
  };

  // Open Auth Modal helper
  const handleOpenAuth = (mode: 'login' | 'signup' = 'login', reason?: string) => {
    setAuthModalMode(mode);
    setAuthPromptReason(reason);
    setIsAuthModalOpen(true);
  };

  // Open Payment Modal helper
  const handleOpenPayment = (plan: 'basic' | 'pro' = 'basic') => {
    if (!currentUser) {
      handleOpenAuth('login', 'Please sign in first to choose a subscription plan.');
      return;
    }
    setPaymentInitialPlan(plan);
    setIsPaymentModalOpen(true);
  };

  // Auth Success Handler
  const handleAuthSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    setSavedCarparks(user.savedCarparks || []);
    setIsAuthModalOpen(false);
    setAlertNotificationBanner(`👋 Welcome ${user.name}! Logged in successfully.`);
    setTimeout(() => setAlertNotificationBanner(null), 4000);
  };

  // Log Out Handler
  const handleLogOut = () => {
    storageService.logOut();
    setCurrentUser(null);
    setSavedCarparks([]);
    setAlertNotificationBanner('Logged out of driver account.');
    setTimeout(() => setAlertNotificationBanner(null), 3000);
  };

  // Payment Success Handler
  const handlePaymentSuccess = (updatedUser: UserAccount) => {
    setCurrentUser(updatedUser);
    setSavedCarparks(updatedUser.savedCarparks || []);
    setAlertNotificationBanner(`✨ ${updatedUser.plan.toUpperCase()} Plan activated! You can now save favorites.`);
    setTimeout(() => setAlertNotificationBanner(null), 5000);
  };

  // Toggle Carpark Favorite with Authentication & Subscription enforcement
  const handleToggleSave = (cp: Carpark) => {
    const result = storageService.toggleSaveCarpark(cp);

    if (result.action === 'auth_required') {
      handleOpenAuth('login', 'Under Favorites, you must sign up or log in to save carparks to your driver account.');
      setAlertNotificationBanner('🔒 Sign in or create an account to save favorites.');
      setTimeout(() => setAlertNotificationBanner(null), 4000);
      return;
    }

    if (result.action === 'plan_upgrade_required') {
      handleOpenPayment('basic');
      setAlertNotificationBanner('⭐ Monthly subscription required to save favorites (Basic $2.99/mo or Pro $5.99/mo).');
      setTimeout(() => setAlertNotificationBanner(null), 5000);
      return;
    }

    if (result.action === 'plan_limit_reached') {
      handleOpenPayment('pro');
      setAlertNotificationBanner('⚠️ Basic Plan limit reached (5/5 favorites). Upgrade to Pro Plan for unlimited!');
      setTimeout(() => setAlertNotificationBanner(null), 5000);
      return;
    }

    // Success (added or removed)
    setSavedCarparks(result.savedList);
    setAlertNotificationBanner(result.message);
    setTimeout(() => setAlertNotificationBanner(null), 4000);
  };

  // Check if carpark is saved
  const isCarparkSaved = (carparkId: string) => {
    return savedCarparks.some((s) => s.carparkId === carparkId);
  };

  // Toggle Carpark Comparison
  const handleToggleCompare = (cp: Carpark) => {
    const exists = comparedCarparks.some((c) => c.id === cp.id);
    if (exists) {
      setComparedCarparks((prev) => prev.filter((c) => c.id !== cp.id));
    } else {
      if (comparedCarparks.length >= 3) {
        alert('You can compare a maximum of 3 carparks at once.');
        return;
      }
      setComparedCarparks((prev) => [...prev, cp]);
      setIsCompareModalOpen(true);
    }
  };

  // Set Availability Alert
  const handleSaveAlert = (alertSetting: AlertSetting) => {
    storageService.saveAlert(alertSetting);
    setAlerts(storageService.getAlerts());
    setAlertCarpark(null);
    setAlertNotificationBanner(
      `🔔 Active Alert set for ${alertSetting.carparkName} (${alertSetting.thresholdPercent}% occupancy threshold)`
    );
    setTimeout(() => setAlertNotificationBanner(null), 5000);
  };

  // Remove Alert
  const handleRemoveAlert = (carparkId: string) => {
    storageService.removeAlert(carparkId);
    setAlerts(storageService.getAlerts());
  };

  // Check if current user has active paid plan or admin access for navigation & favorites
  const isPaidUser = !!currentUser && (currentUser.isAdmin || currentUser.role === 'admin' || currentUser.plan === 'basic' || currentUser.plan === 'pro');

  // Navigation launch - strictly gated by login & paid subscription / admin access
  const handleNavigate = (cp: Carpark) => {
    if (!currentUser) {
      handleOpenAuth(
        'login',
        'Turn-by-turn navigation is a paid feature. Please log in or create a driver account.'
      );
      setAlertNotificationBanner('🔒 Navigation is locked. Sign in to an account with a paid plan to use GPS directions.');
      setTimeout(() => setAlertNotificationBanner(null), 5000);
      return;
    }

    if (!currentUser.isAdmin && currentUser.role !== 'admin' && currentUser.plan === 'free') {
      handleOpenPayment('basic');
      setAlertNotificationBanner(
        '⭐ Turn-by-turn GPS navigation requires an active Basic ($2.99/mo) or Pro ($5.99/mo) plan. Please upgrade to unlock.'
      );
      setTimeout(() => setAlertNotificationBanner(null), 5000);
      return;
    }

    storageService.recordNavigationUsage(cp.id);
    setNavigatingCarpark(cp);
  };

  return (
    <div id="what-the-park-app" className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-sky-500 selection:text-white pb-16 md:pb-0">
      {/* App Top Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
        }}
        savedCount={savedCarparks.length}
        alertsCount={alerts.length}
        commentsCount={commentsCount}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onOpenPayment={handleOpenPayment}
        onLogOut={handleLogOut}
        onQuickLocate={handleUseCurrentLocation}
        onNewSearch={() => setActiveTab('search')}
        onGoHome={() => setActiveTab('search')}
        isMapResultsActive={activeTab === 'map'}
      />

      {/* Alert Notification Toast Banner if triggered */}
      {alertNotificationBanner && (
        <div className="bg-amber-500 text-slate-950 px-4 py-3 shadow-md flex items-center justify-between text-xs sm:text-sm font-black z-30 animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2 max-w-5xl mx-auto w-full">
            <ShieldAlert className="w-5 h-5 text-slate-950 shrink-0" />
            <span>{alertNotificationBanner}</span>
            <button
              onClick={() => setAlertNotificationBanner(null)}
              className="ml-auto p-1.5 text-slate-950 hover:bg-amber-600/30 rounded-lg text-xs font-black cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main App Screens */}
      <main className="flex-1 flex flex-col">
        {/* 1. APP TAB: SEARCH HUB */}
        {activeTab === 'search' && (
          <div className="flex-1 flex flex-col justify-start">
            <HeroSearch
              onSearch={handleSelectDestination}
              onUseCurrentLocation={handleUseCurrentLocation}
              savedCarparks={savedCarparks}
              recentSearches={recentSearches}
              onSelectSavedCarpark={(cpId) => {
                const found = carparkPool.find((c) => c.id === cpId);
                if (found) {
                  setSelectedCarpark(found);
                  setDetailsCarpark(found);
                  setActiveTab('map');
                }
              }}
              isLoadingLocation={isLoadingLocation}
            />

            {/* Quick Live Status Card */}
            <div className="max-w-4xl mx-auto px-4 py-6 text-center">
              <div className="inline-flex items-center gap-3 bg-white p-3 px-5 rounded-2xl shadow-xs border border-slate-200 text-xs sm:text-sm font-bold text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Real-time monitoring across <strong>{SINGAPORE_CARPARKS.length}+ Singapore Carparks</strong> with live rates &amp; availability</span>
              </div>
            </div>
          </div>
        )}

        {/* 2. APP TAB: LIVE MAP & CARPARK DISCOVERY */}
        {activeTab === 'map' && (
          <div id="map-results-page" className="flex-1 flex flex-col bg-slate-100">
            {/* Driver Top Control Header Bar */}
            <div className="bg-white border-b border-slate-200 px-3 sm:px-6 py-2.5 shadow-2xs">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Left: Destination Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => setActiveTab('search')}
                    id="btn-back-to-search"
                    className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Search</span>
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase text-slate-400">Within 1km:</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-black">
                        {filteredCarparks.length} / 10 Carparks
                      </span>
                    </div>
                    <h2 className="text-sm sm:text-base font-black text-slate-950 truncate mt-0.5 max-w-[180px] sm:max-w-xs md:max-w-sm" title={activeDestination.address}>
                      {activeDestination.name}
                    </h2>
                  </div>
                </div>

                {/* Middle: Quick Address Search in Map View */}
                <form onSubmit={handleMapHeaderSubmit} className="flex-1 max-w-md mx-2 relative">
                  <div className="relative flex items-center">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                    <input
                      type="text"
                      value={mapHeaderSearchQuery}
                      onChange={(e) => setMapHeaderSearchQuery(e.target.value)}
                      placeholder="Search another destination or postal code..."
                      className="w-full pl-9 pr-18 py-1.5 bg-slate-100 focus:bg-white text-xs sm:text-sm font-bold text-slate-900 rounded-xl border border-slate-200 focus:border-sky-500 focus:outline-hidden transition-all placeholder:text-slate-400"
                    />
                    <button
                      type="submit"
                      disabled={isMapHeaderSearching || !mapHeaderSearchQuery.trim()}
                      className="absolute right-1 px-2.5 py-1 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-lg text-xs font-black transition-all flex items-center gap-1 cursor-pointer"
                    >
                      {isMapHeaderSearching ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <span>Go</span>
                      )}
                    </button>
                  </div>
                </form>

                {/* Right: Driver Action Controls & View Switcher */}
                <div className="flex items-center gap-2 self-start md:self-center flex-wrap">
                  {/* Live refresh trigger */}
                  <button
                    onClick={handleManualRefresh}
                    title="Refresh live carpark availability"
                    className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingData ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">{lastRefreshedTime}</span>
                    <span className="sm:hidden">Refresh</span>
                  </button>

                  {/* Compare modal trigger */}
                  {comparedCarparks.length > 0 && (
                    <button
                      onClick={() => setIsCompareModalOpen(true)}
                      className="py-1.5 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <GitCompare className="w-4 h-4" />
                      <span>Compare ({comparedCarparks.length})</span>
                    </button>
                  )}

                  {/* Map / List View Toggle */}
                  <div className="inline-flex p-1 bg-slate-200 rounded-xl text-xs font-extrabold">
                    <button
                      onClick={() => setMapPageViewMode('map')}
                      className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                        mapPageViewMode === 'map'
                          ? 'bg-white text-slate-950 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Map className="w-4 h-4" />
                      <span>Map</span>
                    </button>
                    <button
                      onClick={() => setMapPageViewMode('list')}
                      className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                        mapPageViewMode === 'list'
                          ? 'bg-white text-slate-950 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <List className="w-4 h-4" />
                      <span>List</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Driver Quick Filter Pills Bar */}
              <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
                <span className="text-slate-400 font-black text-[10px] uppercase shrink-0">Filter:</span>
                
                {/* All */}
                <button
                  onClick={() => setFilters(INITIAL_FILTERS)}
                  className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap border transition-all cursor-pointer ${
                    filters.sortBy === 'recommended' && filters.maxPricePerHour === 10 && !filters.coveredOnly
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ★ Best Value
                </button>

                {/* Cheapest */}
                <button
                  onClick={() => setFilters({ ...filters, sortBy: 'price', maxPricePerHour: 10 })}
                  className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap border transition-all cursor-pointer ${
                    filters.sortBy === 'price'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  💰 Lowest Rate
                </button>

                {/* Nearest */}
                <button
                  onClick={() => setFilters({ ...filters, sortBy: 'distance' })}
                  className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap border transition-all cursor-pointer ${
                    filters.sortBy === 'distance'
                      ? 'bg-sky-600 text-white border-sky-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  📍 Nearest
                </button>

                {/* Most Lots */}
                <button
                  onClick={() => setFilters({ ...filters, sortBy: 'lots', minAvailableLots: 20 })}
                  className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap border transition-all cursor-pointer ${
                    filters.sortBy === 'lots'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  🅿️ Most Free Lots
                </button>

                {/* Covered */}
                <button
                  onClick={() => setFilters({ ...filters, coveredOnly: !filters.coveredOnly })}
                  className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap border transition-all cursor-pointer ${
                    filters.coveredOnly
                      ? 'bg-amber-500 text-slate-950 border-amber-500'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ☂️ Sheltered
                </button>

                {/* EV Charging */}
                <button
                  onClick={() => setFilters({ ...filters, evChargingOnly: !filters.evChargingOnly })}
                  className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap border transition-all cursor-pointer ${
                    filters.evChargingOnly
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ⚡ EV Fast Charge
                </button>
              </div>
            </div>

            {/* Map Format Container */}
            <div className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4 flex flex-col">
              {mapPageViewMode === 'map' ? (
                <div className="flex-1 w-full min-h-[520px] flex flex-col">
                  <InteractiveMap
                    carparks={filteredCarparks}
                    selectedCarpark={selectedCarpark}
                    onSelectCarpark={(cp) => {
                      setSelectedCarpark(cp);
                    }}
                    destination={activeDestination}
                    onNavigate={handleNavigate}
                    onCompareToggle={handleToggleCompare}
                    comparedCarparkIds={comparedCarparks.map((c) => c.id)}
                    onOpenDetails={(cp) => setDetailsCarpark(cp)}
                    onToggleSave={handleToggleSave}
                    savedCarparkIds={savedCarparks.map((s) => s.carparkId)}
                    hasNavAccess={isPaidUser}
                    currentUser={currentUser}
                  />
                </div>
              ) : (
                /* High-Density Carpark List View */
                <div className="space-y-4 max-w-3xl mx-auto w-full py-2">
                  {filteredCarparks.length > 0 && (
                    <RecommendedBanner
                      carpark={filteredCarparks[0]}
                      destinationName={activeDestination.name}
                      onNavigate={() => handleNavigate(filteredCarparks[0])}
                      onViewDetails={() => setDetailsCarpark(filteredCarparks[0])}
                      hasNavAccess={isPaidUser}
                    />
                  )}

                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
                    <span>{filteredCarparks.length} Carparks Sorted by {filters.sortBy}</span>
                    <button
                      onClick={() => setMapPageViewMode('map')}
                      className="text-sky-600 font-extrabold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Map className="w-3.5 h-3.5" />
                      <span>Switch to Map Format</span>
                    </button>
                  </div>

                  {filteredCarparks.map((cp) => (
                    <CarparkCard
                      key={cp.id}
                      carpark={cp}
                      isSelected={selectedCarpark?.id === cp.id}
                      isSaved={savedCarparks.some((s) => s.carparkId === cp.id)}
                      isCompared={comparedCarparks.some((c) => c.id === cp.id)}
                      hasAlert={alerts.some((a) => a.carparkId === cp.id)}
                      hasNavAccess={isPaidUser}
                      onSelect={() => {
                        setSelectedCarpark(cp);
                        setMapPageViewMode('map');
                      }}
                      onNavigate={() => handleNavigate(cp)}
                      onToggleSave={() => handleToggleSave(cp)}
                      onToggleCompare={() => handleToggleCompare(cp)}
                      onOpenAlert={() => setAlertCarpark(cp)}
                      onOpenDetails={() => setDetailsCarpark(cp)}
                      isCompareDisabled={
                        comparedCarparks.length >= 3 &&
                        !comparedCarparks.some((c) => c.id === cp.id)
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. APP TAB: FAVORITE CARPARKS */}
        {activeTab === 'saved' && (
          <SavedCarparksView
            savedCarparks={savedCarparks}
            allCarparks={carparkPool}
            recentSearches={recentSearches}
            currentUser={currentUser}
            onOpenAuth={handleOpenAuth}
            onOpenPayment={handleOpenPayment}
            onLogOut={handleLogOut}
            onRemoveSaved={(carparkId) => {
              const cp = carparkPool.find((c) => c.id === carparkId);
              if (cp) {
                handleToggleSave(cp);
              } else {
                storageService.removeSavedCarpark(carparkId);
                setSavedCarparks(storageService.getSavedCarparks());
              }
            }}
            onClearRecentSearches={() => {
              storageService.clearRecentSearches();
              setRecentSearches([]);
            }}
            onNavigateToCarpark={handleNavigate}
            onViewCarparkOnMap={(cp) => {
              setSelectedCarpark(cp);
              setActiveTab('map');
            }}
            onSearchDestination={(dest) => {
              handleSelectDestination(dest);
            }}
            onOpenSearchTab={() => {
              setActiveTab('search');
            }}
          />
        )}

        {/* 4. APP TAB: OCCUPANCY ALERTS */}
        {activeTab === 'alerts' && (
          <AlertsManagerView
            alerts={alerts}
            allCarparks={carparkPool}
            onRemoveAlert={handleRemoveAlert}
            onOpenCreateAlert={(cp) => setAlertCarpark(cp)}
            onNavigateToCarpark={handleNavigate}
            onViewOnMap={(cp) => {
              setSelectedCarpark(cp);
              setActiveTab('map');
            }}
            onOpenSearch={() => setActiveTab('search')}
          />
        )}

        {/* 5. APP TAB: DRIVER COMMUNITY TIPS & COMMENTS */}
        {activeTab === 'community' && (
          <div className="flex-1 flex flex-col">
            <DisqusComments />
          </div>
        )}

        {/* MODAL 1: HOW IT WORKS / GUIDE */}
        {activeTab === 'how-it-works' && (
          <HowItWorksModal
            isOpen={true}
            onClose={() => setActiveTab('search')}
            onStartSearch={() => {
              setActiveTab('search');
            }}
          />
        )}

        {/* MODAL 2: DATA TRANSPARENCY & LTA TELEMETRY */}
        {activeTab === 'data-transparency' && (
          <DataTransparencyModal
            isOpen={true}
            onClose={() => setActiveTab('search')}
            lastRefreshed={lastRefreshedTime}
          />
        )}
      </main>

      {/* NATIVE APP BOTTOM NAVIGATION BAR (Mobile & Quick-Switch) */}
      <AppBottomNav
        activeTab={
          ['search', 'map', 'saved', 'alerts', 'community'].includes(activeTab)
            ? (activeTab as AppTabType)
            : 'search'
        }
        onSelectTab={(tab) => {
          setActiveTab(tab);
        }}
        savedCount={savedCarparks.length}
        alertsCount={alerts.length}
        commentsCount={commentsCount}
      />

      {/* ACTION DRAWERS & MODALS */}
      {/* 1. Turn-by-Turn Navigation Launch Drawer */}
      {navigatingCarpark && (
        <NavigationDrawer
          carpark={navigatingCarpark}
          destinationName={activeDestination.name}
          onClose={() => setNavigatingCarpark(null)}
          isSaved={savedCarparks.some((s) => s.carparkId === navigatingCarpark.id)}
          onToggleSave={handleToggleSave}
          onOpenAlert={(cp) => {
            setNavigatingCarpark(null);
            setAlertCarpark(cp);
          }}
          onRecordUsage={(id) => storageService.recordNavigationUsage(id)}
          currentUser={currentUser}
          hasNavAccess={isPaidUser}
          onOpenPayment={(plan) => {
            setNavigatingCarpark(null);
            handleOpenPayment(plan);
          }}
          onOpenAuth={() => {
            setNavigatingCarpark(null);
            handleOpenAuth('login', 'Turn-by-turn navigation requires logging in with a paid plan.');
          }}
        />
      )}

      {/* 2. Detailed Rates & Rules Modal */}
      {detailsCarpark && (
        <CarparkDetailsModal
          carpark={detailsCarpark}
          onClose={() => setDetailsCarpark(null)}
          onNavigate={(cp) => {
            setDetailsCarpark(null);
            handleNavigate(cp);
          }}
          isSaved={savedCarparks.some((s) => s.carparkId === detailsCarpark.id)}
          onToggleSave={handleToggleSave}
          onOpenAlert={(cp) => {
            setDetailsCarpark(null);
            setAlertCarpark(cp);
          }}
          isCompared={comparedCarparks.some((c) => c.id === detailsCarpark.id)}
          onToggleCompare={handleToggleCompare}
          hasNavAccess={isPaidUser}
          currentUser={currentUser}
          onOpenAuth={(mode, msg) => {
            setDetailsCarpark(null);
            handleOpenAuth(mode, msg);
          }}
          onOpenPayment={(plan) => {
            setDetailsCarpark(null);
            handleOpenPayment(plan);
          }}
          onAlertSaved={(newAlert) => {
            handleSaveAlert(newAlert);
          }}
        />
      )}

      {/* 3. Availability Alert Setting Modal */}
      {alertCarpark && (
        <AvailabilityAlertModal
          carpark={alertCarpark}
          onClose={() => setAlertCarpark(null)}
          onSaveAlert={handleSaveAlert}
          existingAlert={alerts.find((a) => a.carparkId === alertCarpark.id)}
        />
      )}

      {/* 4. Side-by-Side Carpark Comparison Modal */}
      {isCompareModalOpen && (
        <CarparkComparison
          carparks={comparedCarparks}
          onClose={() => setIsCompareModalOpen(false)}
          onRemove={(cpId) =>
            setComparedCarparks((prev) => prev.filter((c) => c.id !== cpId))
          }
          onClearAll={() => setComparedCarparks([])}
          onChooseAndNavigate={(cp) => {
            setIsCompareModalOpen(false);
            handleNavigate(cp);
          }}
          hasNavAccess={isPaidUser}
        />
      )}

      {/* 5. Driver Authentication Modal (Sign up / Login / Logout) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        promptReason={authPromptReason}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* 6. Subscription & Payment Checkout Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        initialPlan={paymentInitialPlan}
        currentUser={currentUser}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
        onRequireAuth={() => {
          setIsPaymentModalOpen(false);
          handleOpenAuth('signup', 'Create an account to complete your subscription purchase.');
        }}
      />
    </div>
  );
}
