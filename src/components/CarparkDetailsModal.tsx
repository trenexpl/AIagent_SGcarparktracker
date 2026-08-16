import React, { useState, useEffect } from 'react';
import { Carpark, UserAccount, AlertSetting } from '../types/carpark';
import { 
  X, 
  Navigation, 
  Star,
  Bell, 
  Clock, 
  Footprints, 
  Car,
  Zap, 
  CreditCard, 
  Calendar, 
  Layers,
  MapPin,
  Sparkles,
  CheckCircle2,
  Lock,
  ExternalLink,
  Save,
  Cloud,
  Check,
  TrendingUp,
  Activity,
  Smartphone,
  Compass,
  AlertCircle
} from 'lucide-react';
import { formatDistance, getNavigationLinks, calculateDrivingMinutes, calculateWalkingMinutes } from '../services/parkingService';
import { storageService } from '../services/storageService';

interface CarparkDetailsModalProps {
  carpark: Carpark | null;
  onClose: () => void;
  onNavigate: (carpark: Carpark) => void;
  isSaved: boolean;
  onToggleSave: (carpark: Carpark) => void;
  onOpenAlert: (carpark: Carpark) => void;
  isCompared?: boolean;
  onToggleCompare?: (carpark: Carpark) => void;
  hasNavAccess?: boolean;
  currentUser?: UserAccount | null;
  onOpenAuth?: (mode: 'login' | 'signup', msg?: string) => void;
  onOpenPayment?: (plan: 'basic' | 'pro') => void;
  onAlertSaved?: (alert: AlertSetting) => void;
}

export const CarparkDetailsModal: React.FC<CarparkDetailsModalProps> = ({
  carpark,
  onClose,
  onNavigate,
  isSaved,
  onToggleSave,
  onOpenAlert,
  isCompared = false,
  onToggleCompare,
  hasNavAccess = true,
  currentUser,
  onOpenAuth,
  onOpenPayment,
  onAlertSaved,
}) => {
  if (!carpark) return null;

  const isAdmin = currentUser?.isAdmin || currentUser?.role === 'admin';
  const isPaidOrAdmin = isAdmin || currentUser?.plan === 'basic' || currentUser?.plan === 'pro';

  // Saved note state
  const savedItem = storageService.getSavedCarparkItem(carpark.id);
  const [driverNotes, setDriverNotes] = useState<string>(savedItem?.notes || '');
  const [isSavingNotes, setIsSavingNotes] = useState<boolean>(false);
  const [noteSavedFeedback, setNoteSavedFeedback] = useState<boolean>(false);

  // Active Alert state
  const existingAlert = storageService.getAlertForCarpark(carpark.id);
  const [activeAlert, setActiveAlert] = useState<AlertSetting | undefined>(existingAlert);
  const [quickAlertThreshold, setQuickAlertThreshold] = useState<number>(20);
  const [alertSaveSuccess, setAlertSaveSuccess] = useState<boolean>(false);

  // Keep state updated when carpark changes
  useEffect(() => {
    const item = storageService.getSavedCarparkItem(carpark.id);
    setDriverNotes(item?.notes || '');
    setActiveAlert(storageService.getAlertForCarpark(carpark.id));
  }, [carpark.id]);

  const freePercentage =
    carpark.totalLots > 0
      ? Math.round((carpark.availableLots / carpark.totalLots) * 100)
      : 0;

  const navLinks = getNavigationLinks(carpark);
  const distanceMeters = carpark.distanceMeters || 450;
  const driveMinutes = calculateDrivingMinutes(distanceMeters);
  const walkMinutes = calculateWalkingMinutes(distanceMeters);

  // Save notes to cloud / local storage
  const handleSaveNotes = () => {
    if (!isSaved) {
      onToggleSave(carpark);
    }
    setIsSavingNotes(true);
    setTimeout(() => {
      storageService.updateSavedCarparkNotes(carpark.id, driverNotes);
      setIsSavingNotes(false);
      setNoteSavedFeedback(true);
      setTimeout(() => setNoteSavedFeedback(false), 2500);
    }, 200);
  };

  // Quick setup live lot alert directly inside details modal
  const handleQuickSaveAlert = (thresholdLots: number) => {
    const saved = storageService.saveAlert({
      carparkId: carpark.id,
      carparkName: carpark.name,
      thresholdPercent: 85,
      triggerWhen: 'below_lots',
      thresholdLots,
      active: true,
      soundEnabled: true,
    });
    setActiveAlert(saved);
    if (onAlertSaved) {
      onAlertSaved(saved);
    }
    setAlertSaveSuccess(true);
    setTimeout(() => setAlertSaveSuccess(false), 2500);
  };

  const handleRemoveQuickAlert = () => {
    storageService.removeAlert(carpark.id);
    setActiveAlert(undefined);
  };

  return (
    <div
      id="carpark-details-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 md:p-6 overflow-y-auto"
    >
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header with Title, Badges and Close Button */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white flex items-start justify-between gap-4 border-b border-slate-800 shrink-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-sky-500/20 text-sky-300 border border-sky-400/30">
                {carpark.agency} Carpark
              </span>
              <span className="text-xs text-slate-400 font-mono">Code: {carpark.code}</span>
              
              {carpark.recommendationBadge && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-400 text-slate-950 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 fill-slate-950" />
                  {carpark.recommendationBadge === 'best_overall' ? 'Best Overall' : carpark.recommendationBadge === 'cheapest' ? 'Cheapest Rate' : 'Nearest'}
                </span>
              )}

              {isAdmin ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 flex items-center gap-1 shadow-xs">
                  👑 Admin Full Access Unlocked
                </span>
              ) : isPaidOrAdmin ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  ★ Paid Plan Active
                </span>
              ) : null}
            </div>

            <h2 className="text-xl sm:text-2xl font-black leading-tight text-white truncate" title={carpark.name}>
              {carpark.name}
            </h2>

            <div className="flex items-center gap-3 text-xs text-slate-300 mt-1.5 flex-wrap">
              <span className="flex items-center gap-1 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="truncate max-w-md">{carpark.address}</span>
              </span>
              <span className="text-slate-500">•</span>
              <span className="font-semibold text-sky-300">~{driveMinutes} mins drive ({formatDistance(distanceMeters)})</span>
            </div>
          </div>

          <button
            id="btn-details-close"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          
          {/* ========================================================================= */}
          {/* FEATURE 1: TURN-BY-TURN GPS NAVIGATION WITH ZERO RESTRICTIONS             */}
          {/* ========================================================================= */}
          <div id="details-section-navigation" className="bg-gradient-to-br from-sky-50/70 via-white to-sky-50/40 p-4 sm:p-5 rounded-2xl border-2 border-sky-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-md">
                  <Navigation className="w-4 h-4 fill-white" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
                    <span>1. Turn-by-Turn GPS Navigation</span>
                    {isPaidOrAdmin && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold border border-emerald-300">
                        Zero Restrictions Active
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Full direct integration with Google Maps, Apple Maps, Waze, and Citymapper
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-sky-200">
                <span>📍 Driving: <strong className="text-sky-700">{driveMinutes} min</strong></span>
                <span className="text-slate-300">|</span>
                <span>🚶 Walking: <strong className="text-slate-800">{walkMinutes} min</strong></span>
              </div>
            </div>

            {/* 4 Multi-GPS App Launcher Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              {/* Google Maps */}
              <a
                id="link-nav-google-maps"
                href={navLinks.googleMaps}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => storageService.recordNavigationUsage(carpark.id)}
                className="p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-sky-400 rounded-xl transition-all shadow-2xs hover:shadow-md flex flex-col justify-between group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs">
                    G
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                </div>
                <div className="mt-2">
                  <div className="text-xs font-black text-slate-900 group-hover:text-blue-600">Google Maps</div>
                  <div className="text-[10px] text-slate-500 font-medium">Live traffic routing</div>
                </div>
              </a>

              {/* Apple Maps */}
              <a
                id="link-nav-apple-maps"
                href={navLinks.appleMaps}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => storageService.recordNavigationUsage(carpark.id)}
                className="p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-400 rounded-xl transition-all shadow-2xs hover:shadow-md flex flex-col justify-between group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-900 flex items-center justify-center font-black text-xs">
                    
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900" />
                </div>
                <div className="mt-2">
                  <div className="text-xs font-black text-slate-900 group-hover:text-slate-950">Apple Maps</div>
                  <div className="text-[10px] text-slate-500 font-medium">iOS & CarPlay direct</div>
                </div>
              </a>

              {/* Waze */}
              <a
                id="link-nav-waze"
                href={navLinks.waze}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => storageService.recordNavigationUsage(carpark.id)}
                className="p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-cyan-400 rounded-xl transition-all shadow-2xs hover:shadow-md flex flex-col justify-between group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="w-6 h-6 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center font-black text-xs">
                    W
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-700" />
                </div>
                <div className="mt-2">
                  <div className="text-xs font-black text-slate-900 group-hover:text-cyan-700">Waze</div>
                  <div className="text-[10px] text-slate-500 font-medium">Police & ERP alerts</div>
                </div>
              </a>

              {/* Citymapper */}
              <a
                id="link-nav-citymapper"
                href={navLinks.citymapper}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => storageService.recordNavigationUsage(carpark.id)}
                className="p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-emerald-400 rounded-xl transition-all shadow-2xs hover:shadow-md flex flex-col justify-between group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-xs">
                    C
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700" />
                </div>
                <div className="mt-2">
                  <div className="text-xs font-black text-slate-900 group-hover:text-emerald-700">Citymapper</div>
                  <div className="text-[10px] text-slate-500 font-medium">SG multimodal routes</div>
                </div>
              </a>
            </div>

            {/* Launch In-App Turn-by-Turn GPS Drawer */}
            <button
              id="btn-details-launch-inapp-nav"
              onClick={() => onNavigate(carpark)}
              className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer"
            >
              <Navigation className="w-4 h-4 fill-white" />
              <span>Launch Turn-by-Turn Routing & Directions Drawer</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* FEATURE 2: FAVORITES & CLOUD SYNCING + CUSTOM DRIVER NOTES               */}
          {/* ========================================================================= */}
          <div id="details-section-favorites-cloud" className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md">
                  <Star className="w-4 h-4 fill-slate-950" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
                    <span>2. Favorites & Cloud Syncing</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300 flex items-center gap-1">
                      <Cloud className="w-2.5 h-2.5" />
                      Cloud Sync Ready
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Store custom parking tips, pillar locations, and synchronize across all devices
                  </p>
                </div>
              </div>

              {/* Star Toggle Button */}
              <button
                id="btn-details-toggle-favorite-sync"
                onClick={() => onToggleSave(carpark)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSaved
                    ? 'bg-amber-100 text-amber-900 border-amber-400 shadow-xs'
                    : 'bg-white hover:bg-amber-50 text-slate-700 border-slate-300'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-500 text-amber-600' : 'text-slate-400'}`} />
                <span>{isSaved ? '★ Saved to Favorites' : '+ Add to Favorites'}</span>
              </button>
            </div>

            {/* Custom Driver Notes Field with instant auto-save */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="driver-custom-notes" className="font-extrabold text-slate-800 flex items-center gap-1">
                  <span>Custom Driver Notes & Bay Instructions:</span>
                </label>
                {noteSavedFeedback && (
                  <span className="text-emerald-700 font-bold flex items-center gap-1 animate-in fade-in">
                    <Check className="w-3.5 h-3.5" /> Saved & Synced!
                  </span>
                )}
              </div>
              
              <div className="relative">
                <textarea
                  id="driver-custom-notes"
                  value={driverNotes}
                  onChange={(e) => setDriverNotes(e.target.value)}
                  placeholder="e.g. Pillar 3B near East Lift Lobby, EV fast chargers located at B2..."
                  rows={2}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-800 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  id="btn-save-driver-notes"
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes}
                  className="absolute bottom-2.5 right-2.5 px-2.5 py-1 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black rounded-lg text-[11px] flex items-center gap-1 shadow-xs cursor-pointer transition-all disabled:opacity-50"
                >
                  <Save className="w-3 h-3" />
                  <span>{isSavingNotes ? 'Saving...' : 'Save Note'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                <span>Notes auto-sync to your account profile</span>
                {savedItem?.frequencyCount ? (
                  <span className="font-semibold text-slate-600">Navigated here {savedItem.frequencyCount} times</span>
                ) : (
                  <span>0 prior trips logged</span>
                )}
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* FEATURE 3: LIVE LOT ALERTS & TELEMETRY (LTA OCCUPANCY THRESHOLDS)        */}
          {/* ========================================================================= */}
          <div id="details-section-alerts-telemetry" className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
                    <span>3. Live Lot Alerts & Telemetry</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold border border-emerald-300">
                      Real-Time LTA Feed
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Direct telemetry from LTA DataMall, URA, and HDB Smart Gantry sensors
                  </p>
                </div>
              </div>

              <span className="text-xs text-slate-500 font-medium">
                Last Telemetry Ping: <strong>{carpark.lastUpdated}</strong>
              </span>
            </div>

            {/* Live Lot Availability Gauge */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-black text-slate-950">{carpark.availableLots}</span>
                  <span className="text-xs text-slate-500 font-semibold"> / {carpark.totalLots} total capacity</span>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${
                    carpark.availabilityLevel === 'HIGH'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : carpark.availabilityLevel === 'MODERATE'
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-rose-100 text-rose-800 border-rose-300'
                  }`}
                >
                  {carpark.availabilityLevel === 'HIGH'
                    ? '● High Availability'
                    : carpark.availabilityLevel === 'MODERATE'
                    ? '● Moderate / Filling Up'
                    : '● Limited / Nearly Full'}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    carpark.availabilityLevel === 'HIGH'
                      ? 'bg-emerald-500'
                      : carpark.availabilityLevel === 'MODERATE'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(5, freePercentage))}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 text-slate-600">
                  <TrendingUp className="w-3.5 h-3.5 text-sky-600" />
                  <span>Occupancy rate: <strong>{carpark.occupancyRate}%</strong></span>
                </span>
                <span className="font-bold text-emerald-700">{freePercentage}% lots vacant</span>
              </div>
            </div>

            {/* In-Modal Instant Lot Alert Configuration */}
            <div className="bg-sky-50/60 p-3.5 rounded-xl border border-sky-100 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-sky-600" />
                  <span>Configure Push Notification Threshold:</span>
                </span>
                {alertSaveSuccess && (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Alert Armed!
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-600 font-medium">Alert me when lots drop below:</span>
                {[10, 20, 30, 50].map((num) => (
                  <button
                    key={num}
                    id={`btn-quick-alert-thresh-${num}`}
                    type="button"
                    onClick={() => {
                      setQuickAlertThreshold(num);
                      handleQuickSaveAlert(num);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeAlert?.thresholdLots === num
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:border-sky-300'
                    }`}
                  >
                    &lt; {num} lots
                  </button>
                ))}

                {activeAlert && (
                  <button
                    id="btn-remove-active-alert"
                    type="button"
                    onClick={handleRemoveQuickAlert}
                    className="ml-auto text-[11px] text-rose-600 hover:text-rose-700 font-bold hover:underline cursor-pointer"
                  >
                    Cancel Alert
                  </button>
                )}
              </div>

              {activeAlert && (
                <div className="text-[11px] text-sky-800 bg-sky-100/70 px-2.5 py-1 rounded-lg flex items-center justify-between">
                  <span>🔔 Active Alert: Push notification armed when available lots &lt; {activeAlert.thresholdLots}</span>
                  <span className="font-bold text-sky-950">Monitoring Active</span>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RATES BREAKDOWN & FACILITY DETAILS                                        */}
          {/* ========================================================================= */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-600" />
              <span>Full Parking Rates Breakdown</span>
            </h3>

            <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-200">
              <div className="p-3 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-bold text-xs text-slate-700">Weekday Day / Peak:</span>
                <span className="font-medium text-xs text-slate-900">{carpark.rates.weekdayPeak}</span>
              </div>

              <div className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-bold text-xs text-slate-700">Weekday Evening / Off-Peak:</span>
                <span className="font-medium text-xs text-slate-900">{carpark.rates.weekdayOffPeak}</span>
              </div>

              <div className="p-3 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-bold text-xs text-slate-700">Saturday:</span>
                <span className="font-medium text-xs text-slate-900">{carpark.rates.saturday}</span>
              </div>

              <div className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-bold text-xs text-slate-700">Sunday &amp; Public Holidays:</span>
                <span className="font-medium text-xs text-slate-900">{carpark.rates.sundayPublicHoliday}</span>
              </div>

              {carpark.rates.freeParkingInfo && (
                <div className="p-3 bg-emerald-50 text-emerald-900 flex items-start gap-2 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{carpark.rates.freeParkingInfo}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100 p-2.5 rounded-xl border border-slate-200">
              <Clock className="w-4 h-4 text-slate-600 shrink-0" />
              <span>
                <strong>Grace Period:</strong> {carpark.rates.gracePeriodMinutes} minutes free entry.
              </span>
            </div>
          </div>

          {/* Operating Info, Gantry & Amenities */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-600" />
              <span>Operating System &amp; Facilities</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block uppercase font-semibold">System</span>
                <span className="font-bold text-xs text-slate-800 mt-0.5 block">{carpark.parkingSystem}</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block uppercase font-semibold">Height Limit</span>
                <span className="font-bold text-xs text-slate-800 mt-0.5 block">
                  {carpark.heightLimitMeters ? `${carpark.heightLimitMeters} meters` : 'Standard clearance'}
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block uppercase font-semibold">Payment</span>
                <span className="font-bold text-xs text-slate-800 mt-0.5 block truncate">
                  {carpark.paymentMethods.join(', ')}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1 text-xs">
              <span className={`px-2.5 py-1 rounded-lg border font-medium ${carpark.features.covered ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-50 text-slate-400 border-slate-200 line-through'}`}>
                {carpark.features.covered ? '✓ Covered Multi-Storey' : 'Open-Air / Surface'}
              </span>

              {carpark.features.evCharging && (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                  EV Fast Charging Available
                </span>
              )}

              {carpark.features.handicapLots && (
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                  Accessible / Handicap Lots
                </span>
              )}

              {carpark.features.twentyFourHours && (
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                  24/7 Gantry Access
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {/* Compare Button */}
            {onToggleCompare && (
              <button
                id="details-btn-compare"
                onClick={() => onToggleCompare(carpark)}
                className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isCompared
                    ? 'bg-teal-50 text-teal-800 border-teal-300'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                <span>{isCompared ? '✓ Compared' : '+ Compare'}</span>
              </button>
            )}

            {/* Custom Alert Modal Trigger */}
            <button
              id="details-btn-alert-full"
              onClick={() => onOpenAlert(carpark)}
              className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 text-sky-600" />
              <span>Detailed Alert Manager</span>
            </button>
          </div>

          {/* Primary CTA Navigate */}
          <button
            id="details-btn-navigate-primary"
            onClick={() => onNavigate(carpark)}
            className={`py-2.5 px-5 font-black text-xs sm:text-sm rounded-xl shadow-lg active:scale-98 transition-all flex items-center gap-2 ml-auto cursor-pointer ${
              hasNavAccess
                ? 'bg-sky-600 hover:bg-sky-700 text-white'
                : 'bg-slate-900 hover:bg-slate-800 text-white border border-slate-700'
            }`}
          >
            {hasNavAccess ? (
              <>
                <Navigation className="w-4 h-4 fill-white" />
                <span>Start Turn-by-Turn GPS Navigation</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Navigate (Paid Plan Required)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
