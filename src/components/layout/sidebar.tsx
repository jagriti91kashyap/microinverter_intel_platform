'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Settings, 
  BarChart3,
  AlertTriangle,
  Bot,
  Scale,
  Building2
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3, category: 'main' },
  { name: 'Product Library', href: '/search', icon: Search, category: 'main' },
  { name: 'Product Compare', href: '/compare', icon: Scale, category: 'main' },
  { name: 'Latest News', href: '/changes', icon: AlertTriangle, category: 'main' },
  { name: 'Manufacturers', href: '/manufacturers', icon: Building2, category: 'main' },
  { name: 'AI Pipeline', href: '/pipeline', icon: Bot, category: 'secondary' },
  { name: 'Settings', href: '/settings', icon: Settings, category: 'secondary' },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  const mainNavigation = navigation.filter(item => item.category === 'main');
  const secondaryNavigation = navigation.filter(item => item.category === 'secondary');

  return (
    <div className={cn("w-[240px] h-full bg-white border-r border-gray-200 flex-shrink-0", className)}>
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="px-5 py-4 border-b border-gray-200">
          <span className="text-base font-bold tracking-wide text-gray-900">ENPHASE</span>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {/* Main Navigation */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
              Main
            </p>
            <div className="space-y-0.5">
              {mainNavigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium transition-colors duration-150",
                      isActive
                        ? "bg-enphase-50 text-enphase-600 border border-enphase-200"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent"
                    )}
                  >
                    <item.icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-enphase-500" : "text-gray-400")} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Secondary Navigation */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
              Tools
            </p>
            <div className="space-y-0.5">
              {secondaryNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium transition-colors duration-150",
                      isActive
                        ? "bg-enphase-50 text-enphase-600 border border-enphase-200"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent"
                    )}
                  >
                    <item.icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-enphase-500" : "text-gray-400")} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
