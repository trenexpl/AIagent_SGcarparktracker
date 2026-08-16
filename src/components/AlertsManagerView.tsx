import React, { useState } from 'react';
import { AlertSetting, Carpark } from '../types/carpark';
import { 
  Bell, 
  Trash2, 
  ShieldAlert, 
  Plus, 
  Navigation, 
  Search, 
  MapPin, 
  X, 
  Map, 
  Loader2, 
  Compass, 
  Zap, 
  Sparkles,
  CheckCircle2 
} from 'lucide-react';
import { SINGAPORE_CARPARKS } from '../data/singaporeCarparks';
import { geocodeSingaporeAddress } from '../services/geocodingService';
import { getCarparksNearDestination, formatDistance } from '../services/parkingService';

interface AlertsManagerViewProps {
  alerts: AlertSetting[];
  allCarparks?: Carpark[];
  onRemoveAlert: (carparkId: string) => void;
  onOpenCreateAlert: (carpark: Carpark) => void;
  onNavigateToCarpark?: (carpark: Carpark) => void;
  onViewOnMap?: (carpark: Carpark) => void;
  onOpenSearch?: () => void;
}

export const AlertsManagerView: React.FC<AlertsManagerViewProps> = ({
  alerts = [],
  allCarparks = SINGAPORE_CARPARKS,
  onRemoveAlert,
  onOpenCreateAlert,
  onNavigateToCarpark,
  onViewOnMap,
  onOpenSearch,
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [searchedLocationName, setSearchedLocationName] = useState<string | null>(null);
  const [nearbyCarparks1km, setNearbyCarparks1km] = useState<Carpark[] | null>(null);

  const getLiveCarpark = (id: string): Carpark | undefined => {
    return (
      (allCarparks && allCarparks.find((cp) => cp.id === id)) ||
      SINGAPORE_CARPARKS.find((cp) => cp.id === id)
    );
  };

  // Perform geocoding + strict 1km radius proximity search
  const handleSearchAddress = async (queryText: string) => {
    if (!queryText.trim()) {
      setSearchedLocationName(null);
      setNearbyCarparks1km(null);
      return;
    }

    setIsSearchingLocation(true);
    try {
      const geoResult = await geocodeSingaporeAddress(queryText.trim());
      const carparksIn1km = getCarparksNearDestination(
        geoResult.latitude,
        geoResult.longitude,
        allCarparks || SINGAPORE_CARPARKS,
        1000, // strictly 1km radius
        geoResult.name,
        10 // max 10 results
      );

      // Strict enforcement: ensure distanceMeters is <= 1000m
      const strictlyWithin1km = carparksIn1km.filter(
        (cp) => cp.distanceMeters !== undefined && cp.distanceMeters <= 1000
      );

      setSearchedLocationName(geoResult.name);
      setNearbyCarparks1km(strictlyWithin1km);
    } catch (err) {
      setSearchedLocationName(queryText.trim());
      setNearbyCarparks1km([]);
    } finally {
      setIsSearchingLocation(false);
    }
  };

  // Debounced auto-search when typing an address (>= 3 chars)
  React.useEffect(() => {
    if (!isPickerOpen) return;
    if (!searchQuery.trim()) {
      setSearchedLocationName(null);
      setNearbyCarparks1km(null);
      return;
    }

    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 3) {
        handleSearchAddress(searchQuery);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [searchQuery, isPickerOpen]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleSearchAddress(searchQuery);
    }
  };

  const handleResetSearch = () => {
    setSearchQuery('');
    setSearchedLocationName(null);
    setNearbyCarparks1km(null);
  };

  // Strict results filter:
  // When an address has been inputted or searched, ONLY show carparks within 1km (distanceMeters <= 1000)
  const displayedCarparks: Carpark[] = React.useMemo(() => {
    if (nearbyCarparks1km !== null) {
      return nearbyCarparks1km.filter((cp) => cp.distanceMeters !== undefined && cp.distanceMeters <= 1000);
    }
    
    // When no address is inputted yet, show empty or default prompt
    if (searchQuery.trim().length > 0) {
      return [];
    }

    return (allCarparks || SINGAPORE_CARPARKS).slice(0, 8);
  }, [nearbyCarparks1km, searchQuery, allCarparks]);

  const popularHotspots = [
    'Jurong East',
    'Orchard Central',
    'Tampines Mall',
    'Marina Bay Sands',
    'Bugis Junction',
    'VivoCity',
    'Woodlands Civic',
    'Jewel Changi',
  ];

  return (
    <div id="alerts-manager-container" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
              <Bell className="w-4 h-4 fill-amber-300" />
            </div>
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Real-Time Occupancy Monitor
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Active Parking Alerts</h1>
          <p className="text-sm text-slate-300 mt-1 max-w-md">
            Get notified when your preferred carparks reach high occupancy or when free spaces drop.
          </p>
        </div>

        <button
          id="btn-add-carpark-alert-main"
          onClick={() => setIsPickerOpen(true)}
          className="py-3 px-5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Carpark Alert</span>
        </button>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const liveCarpark = getLiveCarpark(alert.carparkId);
              const occupancy = liveCarpark?.occupancyRate ?? 65;
              const isTriggered =
                alert.triggerWhen === 'above_occupancy'
                  ? occupancy >= alert.thresholdPercent
                  : (liveCarpark?.availableLots ?? 99) <= (alert.thresholdLots || 20);

              return (
                <div
                  key={alert.id}
                  id={`alert-item-${alert.carparkId}`}
                  className={`bg-white rounded-2xl p-5 border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs ${
                    isTriggered
                      ? 'border-amber-500 bg-amber-50/30 ring-2 ring-amber-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {liveCarpark?.agency || 'SG'}
                      </span>
                      {isTriggered ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 animate-pulse">
                          <ShieldAlert className="w-3 h-3 text-rose-600" />
                          THRESHOLD REACHED ({occupancy}% Occupied)
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Monitoring Active ({occupancy}% Occupied)
                        </span>
                      )}
                    </div>

                    <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                      {alert.carparkName}
                    </h3>

                    <p className="text-xs text-slate-600">
                      Condition:{' '}
                      <strong className="text-slate-800">
                        {alert.triggerWhen === 'above_occupancy'
                          ? `Alert when occupancy reaches ${alert.thresholdPercent}%`
                          : `Alert when free lots drop below ${alert.thresholdLots} lots`}
                      </strong>{' '}
                      • Sound:{' '}
                      <span className="font-semibold text-sky-700">
                        {alert.soundEnabled ? 'Enabled (Chime)' : 'Off'}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {onViewOnMap && liveCarpark && (
                      <button
                        onClick={() => onViewOnMap(liveCarpark)}
                        className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Map className="w-3.5 h-3.5 text-slate-600" />
                        <span>Map</span>
                      </button>
                    )}

                    {onNavigateToCarpark && liveCarpark && (
                      <button
                        onClick={() => onNavigateToCarpark(liveCarpark)}
                        className="py-2 px-3.5 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Navigate</span>
                      </button>
                    )}

                    <button
                      onClick={() => onRemoveAlert(alert.carparkId)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Disable alert"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-10 text-center bg-white rounded-3xl border border-dashed border-slate-300 text-slate-500 space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-500 flex items-center justify-center mx-auto">
              <Bell className="w-7 h-7 text-amber-500" />
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-slate-900 text-lg">No active occupancy alerts</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Heading to busy destinations in Singapore? Set an alert for any carpark to receive real-time notifications as lots fill up.
              </p>
            </div>
            <button
              onClick={() => setIsPickerOpen(true)}
              id="btn-empty-add-alert"
              className="mt-2 py-3 px-6 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Carpark Alert</span>
            </button>
          </div>
        )}
      </div>

      {/* Select Carpark to Alert Modal */}
      {isPickerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 to-sky-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                  <Bell className="w-5 h-5 fill-amber-300" />
                </div>
                <div>
                  <h3 className="text-lg font-black">Choose Carpark for Alert</h3>
                  <p className="text-xs text-slate-300">Select any carpark to set live lot thresholds</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsPickerOpen(false);
                  setSearchQuery('');
                }}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input & Search Button */}
            <div className="p-4 border-b border-slate-100 bg-slate-50 space-y-2.5">
              <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    id="input-alert-address-search"
                    placeholder="Enter Singapore address, postal code, or mall..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full pl-10 pr-8 py-2.5 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500 shadow-2xs"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={handleResetSearch}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  id="btn-alert-search-address"
                  disabled={isSearchingLocation || !searchQuery.trim()}
                  className="py-2.5 px-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {isSearchingLocation ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span className="hidden sm:inline">Searching...</span>
                      <span className="sm:hidden">...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 text-slate-950" />
                      <span>Search 1km</span>
                    </>
                  )}
                </button>
              </form>

              {/* Searched Location & 1km Radius Filter Indicator */}
              {searchedLocationName && (
                <div className="flex items-center justify-between bg-amber-50 border border-amber-200/80 rounded-xl px-3 py-1.5 text-xs text-amber-950 animate-in fade-in-50">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="font-bold truncate">Within 1km of: {searchedLocationName}</span>
                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-amber-200/60 font-black text-amber-900 shrink-0">
                      {displayedCarparks.length} found
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetSearch}
                    className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline shrink-0 ml-2"
                  >
                    Reset
                  </button>
                </div>
              )}

              {/* Quick Hotspot Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 no-scrollbar">
                <span className="text-[10px] font-black uppercase text-slate-400 shrink-0">Quick Area (1km):</span>
                {popularHotspots.map((hotspot) => (
                  <button
                    key={hotspot}
                    type="button"
                    onClick={() => {
                      setSearchQuery(hotspot);
                      handleSearchAddress(hotspot);
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-900 border border-slate-200 hover:border-amber-300 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer shadow-2xs"
                  >
                    {hotspot}
                  </button>
                ))}
              </div>
            </div>

            {/* Carpark Results List */}
            <div className="p-4 overflow-y-auto space-y-2.5 flex-1 max-h-96">
              {displayedCarparks.length > 0 ? (
                displayedCarparks.map((cp) => {
                  const hasDistance = cp.distanceMeters !== undefined;
                  return (
                    <div
                      key={cp.id}
                      onClick={() => {
                        setIsPickerOpen(false);
                        handleResetSearch();
                        onOpenCreateAlert(cp);
                      }}
                      className="p-3.5 rounded-2xl border border-slate-200 hover:border-amber-400 bg-white hover:bg-amber-50/40 cursor-pointer transition-all flex items-center justify-between gap-3 group shadow-2xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                            {cp.agency || 'SG'}
                          </span>
                          <span className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded">
                            {cp.availableLots} lots free
                          </span>
                          {hasDistance && (
                            <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">
                              📍 {formatDistance(cp.distanceMeters || 0)}
                              {cp.walkingMinutes ? ` • ${cp.walkingMinutes} min walk` : ''}
                            </span>
                          )}
                        </div>

                        <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-amber-900 truncate">
                          {cp.name}
                        </h4>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{cp.address}</p>

                        <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1 font-medium">
                          <span>${cp.rates.estimatedHourlyRate.toFixed(2)}/hr</span>
                          <span>•</span>
                          <span>{cp.occupancyRate}% Occupied</span>
                          {cp.features.evCharging && (
                            <>
                              <span>•</span>
                              <span className="text-teal-700 font-bold">⚡ EV</span>
                            </>
                          )}
                          {cp.features.covered && (
                            <>
                              <span>•</span>
                              <span className="text-slate-600">☂️ Sheltered</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="py-2 px-3.5 bg-amber-500 group-hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-1">
                          <Bell className="w-3.5 h-3.5" />
                          <span>Set Alert</span>
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 px-4 text-slate-500 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Search className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">No carparks found within 1km</p>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Try searching another Singapore street, building name, or postal code (e.g. 520123, Jurong East, Tampines).
                  </p>
                  <button
                    type="button"
                    onClick={handleResetSearch}
                    className="mt-2 text-xs font-black text-amber-600 hover:text-amber-700 underline"
                  >
                    View all Singapore carparks
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
