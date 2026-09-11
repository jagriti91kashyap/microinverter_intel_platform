'use client';

import { useState } from 'react';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { ThemeProvider } from '@/components/providers/theme-provider';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ThemeProvider defaultTheme="system" storageKey="microinverter-ui-theme">
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex">
          {/* Desktop Sidebar */}
          <div className="hidden md:block">
            <Sidebar className="w-64 min-h-screen border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" />
          </div>
          
          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
              <div className="fixed left-0 top-0 h-full w-64 bg-background/95 backdrop-blur slide-up">
                <Sidebar />
              </div>
            </div>
          )}
          
          {/* Main Content */}
          <main className="flex-1 p-6 fade-in">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
