import React from 'react';
import { Carpark, UserAccount } from '../types/carpark';
import { 
  Navigation, 
  X, 
  MapPin, 
  Clock, 
  Compass, 
  ExternalLink, 
  Star, 
  Bell, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle, 
  Car, 
  CheckCircle2,
  Lock,
  Zap,
  ArrowRight
} from 'lucide-react';
import { formatDistance, getNavigationLinks } from '../services/parkingService';

interface NavigationDrawerProps {
  carpark: Carpark;
  destinationName?: string;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (carpark: Carpark) => void;
  onOpenAlert: (carpark: Carpark) => void;
  onRecordUsage?: (carparkId: string) => void;
  currentUser?: UserAccount | null;
  hasNavAccess?: boolean;
  onOpenPayment?: (plan?: 'basic' | 'pro') => void;
  onOpenAuth?: () => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  carpark,
  destinationName,
  onClose,
  isSaved,
  onToggleSave,
  onOpenAlert,
  onRecordUsage,
  currentUser,
  hasNavAccess = true,
  onOpenPayment,
  onOpenAuth,
}) => {
  const navLinks = getNavigationLinks(carpark, destinationName);

  const handleLaunchNav = (url: string) => {
    if (!hasNavAccess) {
      if (!currentUser) {
        onOpenAuth?.();
      } else {
        onOpenPayment?.('basic');
      }
      return;
    }

    if (onRecordUsage) {
      onRecordUsage(carpark.id);
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      id="navigation-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-150 flex flex-col">
        {/* Navigation Banner Header */}
        <div className="p-6 bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-sky-500/20 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-sky-500 text-slate-950">
                  <Navigation className="w-3.5 h-3.5 fill-slate-950" />
                  NAVIGATION READY
                </span>
                <span className="text-xs text-sky-200 font-mono">#{carpark.code}</span>
              </div>
              <span className="text-xs text-slate-300 font-medium block">You're heading to:</span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5 leading-snug">
                {carpark.name}
              </h2>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Journey Summary Cards */}
        <div className="p-5 sm:p-6 space-y-5 text-sm text-slate-700">
          {/* Destination & Route Summary */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] uppercase font-bold text-slate-400 block">Carpark Address</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{carpark.address}</p>
                {destinationName && (
                  <p className="text-xs text-slate-500 mt-1">
                    Serving destination: <strong className="text-slate-700">{destinationName}</strong>
                  </p>
                )}
              </div>
            </div>

            {/* Travel metrics */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/80 text-center">
              <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Est. Drive</span>
                <span className="text-base font-black text-slate-900 block mt-0.5">
                  {carpark.drivingMinutes ?? 6} mins
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Distance</span>
                <span className="text-base font-black text-slate-900 block mt-0.5">
                  {carpark.distanceMeters ? formatDistance(carpark.distanceMeters) : '1.2 km'}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Lots</span>
                <span className="text-base font-black text-emerald-600 block mt-0.5">
                  {carpark.availableLots} free
                </span>
              </div>
            </div>
          </div>

          {/* Smart Parking Advice */}
          <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-2xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <div className="text-xs text-sky-950 space-y-1">
              <p className="font-bold">Arrival Advice &amp; Grace Period:</p>
              <p className="leading-relaxed text-sky-900">
                Includes <strong>{carpark.rates.gracePeriodMinutes} mins grace period</strong>.
                {carpark.features.evCharging ? ' EV Fast Chargers are situated on Basement 2.' : ''}
                Payment accepted via {carpark.paymentMethods.slice(0, 2).join(' and ')}.
              </p>
            </div>
          </div>

          {/* Primary App Launch CTA */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wide text-slate-500 block">
                Launch Turn-by-Turn Navigation:
              </label>
              {!hasNavAccess && (
                <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full font-black flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-700" />
                  Paid Plan Required
                </span>
              )}
            </div>

            {!hasNavAccess && (
              <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-700 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-400 text-slate-950 shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">GPS Navigation is Locked</h4>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                      Turn-by-turn navigation via Google Maps, Apple Maps, Waze &amp; Citymapper requires an active <strong>Basic ($2.99/mo)</strong> or <strong>Pro ($5.99/mo)</strong> subscription.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {!currentUser ? (
                    <button
                      onClick={() => onOpenAuth?.()}
                      className="flex-1 py-2.5 px-4 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                    >
                      <span>Log In / Sign Up to Unlock</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => onOpenPayment?.('basic')}
                      className="flex-1 py-2.5 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Upgrade Plan ($2.99/mo)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2.5 ${!hasNavAccess ? 'opacity-50 pointer-events-none' : ''}`}>
              {/* Google Maps */}
              <button
                id="nav-btn-google-maps"
                onClick={() => handleLaunchNav(navLinks.googleMaps)}
                className="p-3.5 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white rounded-2xl shadow-md transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 text-left">
                  <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white font-black text-xs">
                    G
                  </div>
                  <div>
                    <span className="font-bold text-xs block">Google Maps</span>
                    <span className="text-[10px] text-slate-400">Direct Navigation Route</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
              </button>

              {/* Apple Maps */}
              <button
                id="nav-btn-apple-maps"
                onClick={() => handleLaunchNav(navLinks.appleMaps)}
                className="p-3.5 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white rounded-2xl shadow-md transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 text-left">
                  <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-white font-black text-xs">
                    🍎
                  </div>
                  <div>
                    <span className="font-bold text-xs block">Apple Maps</span>
                    <span className="text-[10px] text-slate-400">iOS Directions</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
              </button>

              {/* Waze */}
              <button
                id="nav-btn-waze"
                onClick={() => handleLaunchNav(navLinks.waze)}
                className="p-3.5 bg-white hover:bg-slate-50 active:scale-98 text-slate-900 border-2 border-slate-200 hover:border-slate-300 rounded-2xl shadow-xs transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 text-left">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500 text-white flex items-center justify-center font-black text-xs">
                    W
                  </div>
                  <div>
                    <span className="font-bold text-xs block">Waze</span>
                    <span className="text-[10px] text-slate-500">Live Traffic &amp; Hazards</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-slate-800 transition-colors" />
              </button>

              {/* Citymapper / OneMap */}
              <button
                id="nav-btn-citymapper"
                onClick={() => handleLaunchNav(navLinks.citymapper)}
                className="p-3.5 bg-white hover:bg-slate-50 active:scale-98 text-slate-900 border-2 border-slate-200 hover:border-slate-300 rounded-2xl shadow-xs transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 text-left">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs">
                    C
                  </div>
                  <div>
                    <span className="font-bold text-xs block">Citymapper</span>
                    <span className="text-[10px] text-slate-500">Singapore Smart Transit</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-slate-800 transition-colors" />
              </button>
            </div>
          </div>
        </div>

        {/* Drawer Bottom Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              id="nav-drawer-btn-save"
              onClick={() => onToggleSave(carpark)}
              className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                isSaved
                  ? 'bg-amber-50 text-amber-700 border-amber-300 shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              <Star className={`w-4 h-4 ${isSaved ? 'fill-amber-400 text-amber-500' : 'text-slate-500'}`} />
              <span>{isSaved ? 'Favorited' : 'Favorite Carpark'}</span>
            </button>

            <button
              id="nav-drawer-btn-alert"
              onClick={() => onOpenAlert(carpark)}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Bell className="w-4 h-4 text-sky-600" />
              <span>Enable Occupancy Alert</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
