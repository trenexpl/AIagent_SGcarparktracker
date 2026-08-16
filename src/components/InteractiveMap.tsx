import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Carpark, AvailabilityLevel, UserAccount } from '../types/carpark';
import { Navigation, Layers, Compass, Crosshair, Sparkles, ExternalLink, Check, Car, ChevronLeft, ChevronRight, Zap, Star, X, ChevronDown, ChevronUp, Lock, FileText, Bell, Cloud } from 'lucide-react';

interface InteractiveMapProps {
  carparks: Carpark[];
  selectedCarpark: Carpark | null;
  onSelectCarpark: (carpark: Carpark) => void;
  destination: { name: string; latitude: number; longitude: number; address: string } | null;
  onNavigate: (carpark: Carpark) => void;
  onCompareToggle?: (carpark: Carpark) => void;
  comparedCarparkIds?: string[];
  onOpenDetails?: (carpark: Carpark) => void;
  onToggleSave?: (carpark: Carpark) => void;
  savedCarparkIds?: string[];
  hasNavAccess?: boolean;
  currentUser?: UserAccount | null;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  carparks,
  selectedCarpark,
  onSelectCarpark,
  destination,
  onNavigate,
  onCompareToggle,
  comparedCarparkIds = [],
  onOpenDetails,
  onToggleSave,
  savedCarparkIds = [],
  hasNavAccess = true,
  currentUser,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const destMarkerRef = useRef<L.Marker | null>(null);
  const [mapLayer, setMapLayer] = useState<'streets' | 'light'>('light');
  const [isPopupMinimized, setIsPopupMinimized] = useState<boolean>(false);
  const [isPopupClosed, setIsPopupClosed] = useState<boolean>(false);

  // Re-open popup when user selects a carpark
  useEffect(() => {
    if (selectedCarpark) {
      setIsPopupClosed(false);
    }
  }, [selectedCarpark]);

  // Helper for availability badge color in pins
  const getPinTheme = (level: AvailabilityLevel) => {
    switch (level) {
      case 'HIGH':
        return {
          bg: 'bg-emerald-600',
          border: 'border-emerald-700',
          text: 'text-white',
          dot: 'bg-emerald-300',
          label: 'High Lots',
        };
      case 'MODERATE':
        return {
          bg: 'bg-amber-500',
          border: 'border-amber-600',
          text: 'text-slate-950',
          dot: 'bg-amber-100',
          label: 'Filling Up',
        };
      case 'LIMITED':
      case 'FULL':
        return {
          bg: 'bg-rose-600',
          border: 'border-rose-700',
          text: 'text-white',
          dot: 'bg-rose-200',
          label: 'Almost Full',
        };
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const defaultCenter: [number, number] = destination
        ? [destination.latitude, destination.longitude]
        : [1.3040, 103.8318]; // Orchard Road

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
      });

      const tileUrl =
        mapLayer === 'light'
          ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
          : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

      L.tileLayer(tileUrl, {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      L.control
        .attribution({ position: 'bottomright', prefix: '© OpenStreetMap, LTA/URA SG' })
        .addTo(map);

      markersRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      // Invalidate size shortly after mount to ensure smooth canvas sizing
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 200);
    }

    return () => {
      // clean up on unmount handled
    };
  }, []);

  // Update Tile Layer
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        mapInstanceRef.current?.removeLayer(layer);
      }
    });

    const tileUrl =
      mapLayer === 'light'
        ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(mapInstanceRef.current);
  }, [mapLayer]);

  // Update Markers & Bounds
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersRef.current) return;

    markersRef.current.clearLayers();

    // 1. Destination Marker
    if (destination) {
      if (destMarkerRef.current) {
        map.removeLayer(destMarkerRef.current);
      }

      const destIcon = L.divIcon({
        className: 'custom-dest-pin',
        html: `
          <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-full cursor-pointer hover:scale-105 transition-transform">
            <div class="absolute -top-1 w-7 h-7 bg-sky-500 rounded-full animate-ping opacity-30"></div>
            <div class="relative flex flex-col items-center">
              <div class="px-2 py-0.5 bg-slate-950 text-white text-[11px] font-black rounded-lg shadow-lg border border-sky-400 whitespace-nowrap flex items-center gap-1 mb-0.5">
                <span class="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                <span>${destination.name}</span>
              </div>
              <div class="w-6 h-6 rounded-full bg-sky-600 border-2 border-white shadow-md flex items-center justify-center text-white text-[10px] font-black">
                ★
              </div>
              <div class="w-1 h-1.5 bg-slate-900"></div>
            </div>
          </div>
        `,
        iconSize: [28, 42],
        iconAnchor: [14, 42],
      });

      destMarkerRef.current = L.marker([destination.latitude, destination.longitude], {
        icon: destIcon,
        zIndexOffset: 1000,
      }).addTo(map);

      destMarkerRef.current.bindPopup(
        `
        <div class="p-3 font-sans min-w-[200px] text-slate-900">
          <div class="flex items-center gap-1.5 mb-1 text-[10px] font-black text-sky-600 uppercase tracking-wider">
            <span class="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
            <span>Search Destination</span>
          </div>
          <div class="font-black text-slate-950 text-sm leading-snug">${destination.name}</div>
          <div class="text-xs text-slate-500 mt-1">${destination.address}</div>
          <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
            <span>Scanning 1km radius</span>
            <span class="text-emerald-700 font-extrabold">${carparks.length} Carparks</span>
          </div>
        </div>
        `,
        {
          className: 'custom-leaflet-popup',
          offset: [0, -36],
        }
      );
    }

    // 2. Carpark Pins with prominent Rates & Lots
    const bounds: [number, number][] = [];
    if (destination) {
      bounds.push([destination.latitude, destination.longitude]);
    }

    carparks.forEach((cp) => {
      bounds.push([cp.latitude, cp.longitude]);
      const isSelected = selectedCarpark?.id === cp.id;
      const isSaved = savedCarparkIds.includes(cp.id);
      const theme = getPinTheme(cp.availabilityLevel);

      const rateDisplay = `$${cp.rates.estimatedHourlyRate.toFixed(2)}/h`;
      const lotsDisplay = `${cp.availableLots} lots`;

      const markerHtml = `
        <div class="relative cursor-pointer transition-transform duration-150 ${isSelected ? 'scale-110 z-50' : 'hover:scale-105'}">
          <div class="flex flex-col items-center">
            ${
              cp.recommendationBadge
                ? `<span class="px-1.5 py-0.2 mb-0.5 text-[9px] font-black tracking-tight bg-slate-950 text-amber-300 rounded-full shadow-md border border-amber-400 whitespace-nowrap flex items-center gap-0.5">
                    ★ ${cp.recommendationBadge === 'best_overall' ? 'Best' : cp.recommendationBadge === 'cheapest' ? 'Cheapest' : 'Near'}
                   </span>`
                : ''
            }
            <div class="px-2 py-1 ${theme.bg} ${theme.text} rounded-lg shadow-md border ${
              isSelected ? 'border-sky-300 ring-3 ring-sky-400/60' : 'border-white'
            } flex items-center gap-1 text-[11px] font-black whitespace-nowrap">
              <span class="w-1.5 h-1.5 rounded-full ${theme.dot}"></span>
              <span class="font-black">${lotsDisplay}</span>
              <span class="bg-black/20 px-1 py-0.2 rounded font-mono text-[10px]">${rateDisplay}</span>
            </div>
            <div class="w-2 h-2 ${theme.bg} rotate-45 -mt-1 border-r border-b ${
              isSelected ? 'border-sky-300' : 'border-white'
            }"></div>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-carpark-pin',
        html: markerHtml,
        iconSize: [120, 48],
        iconAnchor: [60, 42],
      });

      const marker = L.marker([cp.latitude, cp.longitude], {
        icon: customIcon,
        zIndexOffset: isSelected ? 900 : cp.recommendationBadge ? 600 : 200,
      });

      // Interactive on-pin Leaflet popup
      const isAdminUser = currentUser?.isAdmin || currentUser?.role === 'admin';
      const isPaid = isAdminUser || currentUser?.plan === 'basic' || currentUser?.plan === 'pro';

      const popupContainer = document.createElement('div');
      popupContainer.className = 'p-3 font-sans min-w-[220px] max-w-[280px] text-slate-900';
      popupContainer.innerHTML = `
        <div class="flex items-center justify-between gap-1 mb-1">
          <div class="flex items-center gap-1">
            <span class="px-1.5 py-0.5 text-[9px] font-black rounded bg-slate-100 text-slate-700 border border-slate-200">
              ${cp.agency}
            </span>
            ${
              isAdminUser
                ? `<span class="px-1.5 py-0.5 text-[9px] font-black rounded bg-amber-400 text-slate-950 shadow-2xs">
                    👑 Admin
                  </span>`
                : isPaid
                ? `<span class="px-1.5 py-0.5 text-[9px] font-black rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                    ★ Unlocked
                  </span>`
                : ''
            }
          </div>
          ${
            cp.recommendationBadge
              ? `<span class="px-1.5 py-0.5 text-[9px] font-black rounded bg-amber-100 text-amber-900 border border-amber-300">
                  ★ ${cp.recommendationBadge === 'best_overall' ? 'Best Value' : cp.recommendationBadge === 'cheapest' ? 'Cheapest' : 'Nearest'}
                </span>`
              : ''
          }
        </div>

        <div id="pin-popup-title-${cp.id}" class="font-black text-slate-950 text-xs sm:text-sm leading-snug truncate hover:text-sky-600 cursor-pointer" title="${cp.name}">
          ${cp.name}
        </div>
        <div class="text-[11px] text-slate-500 truncate mb-2 mt-0.5">${cp.address}</div>
        
        <div class="grid grid-cols-3 gap-1 py-1.5 px-2 bg-slate-50 border border-slate-200/80 rounded-xl text-center text-xs mb-2">
          <div>
            <span class="text-[9px] text-slate-400 block font-bold uppercase">Rate</span>
            <span class="font-black text-slate-900 text-xs">$${cp.rates.estimatedHourlyRate.toFixed(2)}<span class="text-[9px] font-normal text-slate-400">/h</span></span>
          </div>
          <div class="border-x border-slate-200">
            <span class="text-[9px] text-slate-400 block font-bold uppercase">Lots</span>
            <span class="font-black text-xs ${cp.availableLots > 30 ? 'text-emerald-600' : cp.availableLots > 10 ? 'text-amber-600' : 'text-rose-600'}">
              ${cp.availableLots}
            </span>
          </div>
          <div>
            <span class="text-[9px] text-slate-400 block font-bold uppercase">Distance</span>
            <span class="font-bold text-slate-800 text-xs">${cp.distanceMeters ? `${cp.distanceMeters}m` : 'Near'}</span>
          </div>
        </div>

        <div class="text-[10px] text-slate-500 bg-sky-50/70 border border-sky-100 rounded-lg px-2 py-1 mb-2 flex items-center justify-between font-medium">
          <span class="flex items-center gap-1 text-sky-900 font-bold">
            <span>⚡ GPS • Cloud • Alerts</span>
          </span>
          <span class="text-sky-700 font-extrabold text-[9px] underline cursor-pointer" id="pin-popup-link-details-${cp.id}">View Full Info →</span>
        </div>

        <div class="flex items-center gap-1.5">
          <button id="pin-popup-nav-${cp.id}" class="flex-1 py-1.5 px-2 ${
            hasNavAccess ? 'bg-sky-600 hover:bg-sky-700' : 'bg-slate-900 hover:bg-slate-800'
          } active:scale-95 text-white font-black rounded-lg text-xs flex items-center justify-center gap-1 shadow-xs cursor-pointer transition-all">
            <span>${hasNavAccess ? '🚗 GPS Nav' : '🔒 Nav (Paid)'}</span>
          </button>
          ${
            onOpenDetails
              ? `<button id="pin-popup-details-${cp.id}" class="flex-1 py-1.5 px-2 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 active:scale-95 text-white font-bold rounded-lg text-xs border border-slate-700 cursor-pointer transition-all flex items-center justify-center gap-1">
                  <span>🔍 Full Details</span>
                </button>`
              : ''
          }
        </div>
      `;

      // Attach button event listeners safely inside Leaflet popup DOM
      const navBtn = popupContainer.querySelector(`#pin-popup-nav-${cp.id}`);
      if (navBtn) {
        navBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          onNavigate(cp);
        });
      }

      const detailsBtn = popupContainer.querySelector(`#pin-popup-details-${cp.id}`);
      if (detailsBtn && onOpenDetails) {
        detailsBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          onOpenDetails(cp);
        });
      }

      const linkDetails = popupContainer.querySelector(`#pin-popup-link-details-${cp.id}`);
      if (linkDetails && onOpenDetails) {
        linkDetails.addEventListener('click', (e) => {
          e.stopPropagation();
          onOpenDetails(cp);
        });
      }

      const titleElem = popupContainer.querySelector(`#pin-popup-title-${cp.id}`);
      if (titleElem && onOpenDetails) {
        titleElem.addEventListener('click', (e) => {
          e.stopPropagation();
          onOpenDetails(cp);
        });
      }

      marker.bindPopup(popupContainer, {
        className: 'custom-leaflet-popup',
        offset: [0, -32],
        closeButton: true,
      });

      marker.on('click', () => {
        onSelectCarpark(cp);
        setIsPopupClosed(false);
        setIsPopupMinimized(false);
      });

      markersRef.current?.addLayer(marker);
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 16,
      });
    }
  }, [carparks, selectedCarpark, destination, comparedCarparkIds]);

  // Pan to selected carpark when changed
  useEffect(() => {
    if (selectedCarpark && mapInstanceRef.current) {
      mapInstanceRef.current.panTo([selectedCarpark.latitude, selectedCarpark.longitude], {
        animate: true,
        duration: 0.8,
      });
    }
  }, [selectedCarpark]);

  const handleRecenter = () => {
    if (mapInstanceRef.current && destination) {
      mapInstanceRef.current.setView([destination.latitude, destination.longitude], 15, {
        animate: true,
      });
    }
  };

  const handleFitAll = () => {
    if (!mapInstanceRef.current || carparks.length === 0) return;
    const bounds: [number, number][] = carparks.map((cp) => [cp.latitude, cp.longitude]);
    if (destination) bounds.push([destination.latitude, destination.longitude]);
    mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
  };

  // Next / Prev carpark navigation
  const currentIndex = selectedCarpark ? carparks.findIndex((c) => c.id === selectedCarpark.id) : 0;
  const handlePrevCarpark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (carparks.length === 0) return;
    const prevIdx = (currentIndex - 1 + carparks.length) % carparks.length;
    onSelectCarpark(carparks[prevIdx]);
  };
  const handleNextCarpark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (carparks.length === 0) return;
    const nextIdx = (currentIndex + 1) % carparks.length;
    onSelectCarpark(carparks[nextIdx]);
  };

  // Active carpark to show in bottom drawer (selected or first carpark)
  const activeDrawerCarpark = selectedCarpark || carparks[0] || null;

  return (
    <div id="interactive-map-wrapper" className="relative w-full h-full min-h-[480px] sm:min-h-[600px] rounded-3xl overflow-hidden shadow-md border border-slate-200 bg-slate-100 flex flex-col">
      {/* Actual Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[480px] sm:min-h-[600px] z-0" />

      {/* Floating Map Controls (Top Right) */}
      <div className="absolute top-2.5 right-2.5 z-20 flex flex-col gap-1.5">
        <button
          id="map-btn-recenter"
          onClick={handleRecenter}
          title="Center on Destination"
          className="p-2 bg-white/95 backdrop-blur-md text-slate-700 hover:text-sky-600 rounded-xl shadow-md border border-slate-200 hover:bg-white transition-all flex items-center justify-center active:scale-95"
          aria-label="Center map on destination"
        >
          <Crosshair className="w-4 h-4" />
        </button>

        <button
          id="map-btn-fit-all"
          onClick={handleFitAll}
          title="Fit All Nearby Carparks"
          className="p-2 bg-white/95 backdrop-blur-md text-slate-700 hover:text-sky-600 rounded-xl shadow-md border border-slate-200 hover:bg-white transition-all flex items-center justify-center active:scale-95"
          aria-label="View all carparks"
        >
          <Compass className="w-4 h-4" />
        </button>

        <button
          id="map-btn-toggle-layer"
          onClick={() => setMapLayer((prev) => (prev === 'light' ? 'streets' : 'light'))}
          title="Toggle Map Style"
          className="p-2 bg-white/95 backdrop-blur-md text-slate-700 hover:text-sky-600 rounded-xl shadow-md border border-slate-200 hover:bg-white transition-all flex items-center justify-center active:scale-95"
          aria-label="Toggle map layer style"
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>

      {/* Map Legend (Top Left) */}
      <div className="absolute top-2.5 left-2.5 z-20 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg shadow-sm border border-slate-200 text-[10px] flex items-center gap-2">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="font-bold text-slate-700">Lots Free</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          <span className="font-bold text-slate-700">Filling</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-rose-600"></span>
          <span className="font-bold text-slate-700">Full</span>
        </div>
      </div>

      {/* Compact Location Pop-up / Drawer */}
      {activeDrawerCarpark && !isPopupClosed && (
        <div className="absolute bottom-2 left-2 right-2 sm:left-auto sm:right-3 sm:max-w-sm w-auto z-20 bg-white/95 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl shadow-xl border border-sky-200 animate-in fade-in slide-in-from-bottom-2 duration-150">
          {isPopupMinimized ? (
            /* Minimized Super-Slim Bar */
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <span className={`w-2 h-2 rounded-full shrink-0 ${
                  activeDrawerCarpark.availableLots > 30 ? 'bg-emerald-500' : activeDrawerCarpark.availableLots > 10 ? 'bg-amber-500' : 'bg-rose-500'
                }`} />
                <span className="text-xs font-black text-slate-900 truncate">
                  {activeDrawerCarpark.name}
                </span>
                <span className="text-[11px] font-bold text-slate-600 shrink-0">
                  {activeDrawerCarpark.availableLots} lots · ${activeDrawerCarpark.rates.estimatedHourlyRate.toFixed(2)}/h
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setIsPopupMinimized(false)}
                  className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Expand Info"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onNavigate(activeDrawerCarpark)}
                  className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-black flex items-center gap-1 shadow-xs"
                >
                  <Navigation className="w-3 h-3 fill-white" />
                  <span>Go</span>
                </button>
              </div>
            </div>
          ) : (
            /* Compact Expanded Card */
            <div className="space-y-2">
              {/* Header: Title, Tags & Stepper/Controls */}
              <div className="flex items-start justify-between gap-1.5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 flex-wrap mb-0.5">
                    <span className="px-1.5 py-0.2 text-[9px] font-black rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {activeDrawerCarpark.agency}
                    </span>
                    {activeDrawerCarpark.recommendationBadge && (
                      <span className="px-1.5 py-0.2 text-[9px] font-black rounded bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                        {activeDrawerCarpark.recommendationBadge === 'best_overall'
                          ? 'Best'
                          : activeDrawerCarpark.recommendationBadge === 'cheapest'
                          ? 'Cheapest'
                          : 'Near'}
                      </span>
                    )}
                    {activeDrawerCarpark.features.evCharging && (
                      <span className="px-1 py-0.2 text-[9px] font-bold rounded bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-0.5">
                        <Zap className="w-2 h-2 text-emerald-600" /> EV
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-slate-950 text-xs sm:text-sm leading-snug truncate" title={activeDrawerCarpark.name}>
                    {activeDrawerCarpark.name}
                  </h3>
                </div>

                {/* Right controls: Mini Stepper, Minimize, Close */}
                <div className="flex items-center gap-0.5 shrink-0">
                  {carparks.length > 1 && (
                    <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                      <button
                        onClick={handlePrevCarpark}
                        className="p-0.5 text-slate-600 hover:text-slate-950 rounded hover:bg-white transition-colors"
                        title="Prev"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] font-black text-slate-600 px-0.5">
                        {currentIndex + 1}/{carparks.length}
                      </span>
                      <button
                        onClick={handleNextCarpark}
                        className="p-0.5 text-slate-600 hover:text-slate-950 rounded hover:bg-white transition-colors"
                        title="Next"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => setIsPopupMinimized(true)}
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                    title="Minimize"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsPopupClosed(true)}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-md transition-colors"
                    title="Close"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Compact Metrics Bar */}
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1.5 text-center text-xs">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-bold block leading-none mb-0.5">Rate</span>
                  <span className="font-black text-slate-900 text-xs sm:text-sm leading-none">
                    ${activeDrawerCarpark.rates.estimatedHourlyRate.toFixed(2)}<span className="text-[10px] font-normal text-slate-500">/h</span>
                  </span>
                </div>
                <div className="h-4 w-px bg-slate-200" />
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-bold block leading-none mb-0.5">Available</span>
                  <span className={`font-black text-xs sm:text-sm leading-none ${
                    activeDrawerCarpark.availableLots > 30
                      ? 'text-emerald-600'
                      : activeDrawerCarpark.availableLots > 10
                      ? 'text-amber-600'
                      : 'text-rose-600'
                  }`}>
                    {activeDrawerCarpark.availableLots} lots
                  </span>
                </div>
                <div className="h-4 w-px bg-slate-200" />
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-bold block leading-none mb-0.5">Distance</span>
                  <span className="font-bold text-slate-800 text-xs sm:text-sm leading-none">
                    {activeDrawerCarpark.distanceMeters ? `${activeDrawerCarpark.distanceMeters}m` : 'Near'}
                  </span>
                </div>
              </div>

              {/* Compact Action Buttons */}
              <div className="flex items-center gap-1.5 pt-0.5">
                {onToggleSave && (
                  <button
                    id={`map-drawer-star-btn-${activeDrawerCarpark.id}`}
                    onClick={() => onToggleSave(activeDrawerCarpark)}
                    title={savedCarparkIds.includes(activeDrawerCarpark.id) ? 'Favorited' : 'Favorite'}
                    className={`p-2 rounded-xl border transition-all flex items-center justify-center shrink-0 ${
                      savedCarparkIds.includes(activeDrawerCarpark.id)
                        ? 'bg-amber-50 text-amber-600 border-amber-300 shadow-2xs'
                        : 'bg-slate-100 hover:bg-amber-50/60 text-slate-400 hover:text-amber-500 border-slate-200'
                    }`}
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        savedCarparkIds.includes(activeDrawerCarpark.id) ? 'fill-amber-400 text-amber-500' : ''
                      }`}
                    />
                  </button>
                )}

                <button
                  id={`map-drawer-nav-btn-${activeDrawerCarpark.id}`}
                  onClick={() => onNavigate(activeDrawerCarpark)}
                  className={`flex-1 py-1.5 px-3 font-black rounded-xl shadow-md active:scale-98 transition-all flex items-center justify-center gap-1.5 text-xs cursor-pointer ${
                    hasNavAccess
                      ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/20'
                      : 'bg-slate-900 hover:bg-slate-800 text-white border border-slate-700'
                  }`}
                >
                  {hasNavAccess ? (
                    <>
                      <Navigation className="w-3.5 h-3.5 fill-white" />
                      <span>Navigate</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Navigate</span>
                      <span className="text-[9px] bg-amber-400 text-slate-950 px-1 py-0.2 rounded font-black">PAID</span>
                    </>
                  )}
                </button>

                {onOpenDetails && (
                  <button
                    id={`map-drawer-details-btn-${activeDrawerCarpark.id}`}
                    onClick={() => onOpenDetails(activeDrawerCarpark)}
                    className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-black rounded-xl border border-slate-700 transition-all text-xs whitespace-nowrap flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <span>🔍 Full Details</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Re-open Button when user explicitly closed popup */}
      {activeDrawerCarpark && isPopupClosed && (
        <button
          onClick={() => {
            setIsPopupClosed(false);
            setIsPopupMinimized(false);
          }}
          className="absolute bottom-2 right-2 z-20 px-3 py-1.5 bg-white/95 backdrop-blur-md hover:bg-white text-slate-800 text-xs font-black rounded-xl shadow-lg border border-slate-200 flex items-center gap-1.5 cursor-pointer animate-in fade-in"
        >
          <Car className="w-3.5 h-3.5 text-sky-600" />
          <span>Show Carpark Info</span>
        </button>
      )}
    </div>
  );
};

