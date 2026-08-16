import React from 'react';
import { 
  Search, 
  Map, 
  Star, 
  Bell, 
  MessageSquare,
  Sparkles
} from 'lucide-react';

export type AppTabType = 'search' | 'map' | 'saved' | 'alerts' | 'community';

interface AppBottomNavProps {
  activeTab: AppTabType;
  onSelectTab: (tab: AppTabType) => void;
  savedCount: number;
  alertsCount: number;
  commentsCount?: number;
}

export const AppBottomNav: React.FC<AppBottomNavProps> = ({
  activeTab,
  onSelectTab,
  savedCount,
  alertsCount,
  commentsCount = 0,
}) => {
  const navItems: {
    id: AppTabType;
    label: string;
    icon: React.ElementType;
    badge?: number;
  }[] = [
    {
      id: 'search',
      label: 'Search',
      icon: Search,
    },
    {
      id: 'map',
      label: 'Live Map',
      icon: Map,
    },
    {
      id: 'saved',
      label: 'Favorites',
      icon: Star,
      badge: savedCount,
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: Bell,
      badge: alertsCount,
    },
    {
      id: 'community',
      label: 'Driver Tips',
      icon: MessageSquare,
      badge: commentsCount > 0 ? commentsCount : undefined,
    },
  ];

  return (
    <div
      id="mobile-app-bottom-navbar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-2xl safe-area-bottom select-none"
    >
      <div className="max-w-lg mx-auto px-2 py-1.5 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`tab-btn-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={`flex-1 py-1.5 px-1 flex flex-col items-center justify-center rounded-2xl transition-all duration-200 cursor-pointer relative ${
                isActive
                  ? 'text-sky-600 font-extrabold scale-102'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div className="relative">
                <div
                  className={`p-1.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-sky-50 text-sky-600 shadow-2xs'
                      : 'text-slate-500'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive && item.id === 'saved' ? 'fill-amber-400 text-amber-500' : ''}`} />
                </div>

                {/* Badge if greater than 0 */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 px-1.5 py-0.2 min-w-[18px] text-[10px] font-black bg-amber-500 text-slate-950 rounded-full text-center border-2 border-white shadow-2xs">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>

              <span className={`text-[10px] tracking-tight mt-0.5 leading-tight ${isActive ? 'font-black text-sky-700' : 'text-slate-500'}`}>
                {item.label}
              </span>

              {/* Active indicator dot */}
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-sky-600 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
