'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, Zap, BarChart3, Globe, Scale, Settings, User, LogOut, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

interface CommandItem {
  id: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  category: 'navigation' | 'actions' | 'search';
  shortcut?: string;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const { data: session } = useSession();
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = [
    // Navigation
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'View platform overview and analytics',
      icon: <BarChart3 className="w-4 h-4" />,
      action: () => router.push('/dashboard'),
      category: 'navigation',
      shortcut: '⌘D'
    },
    {
      id: 'search',
      title: 'Product Library',
      description: 'Browse all microinverter products',
      icon: <Search className="w-4 h-4" />,
      action: () => router.push('/search'),
      category: 'navigation',
      shortcut: '⌘S'
    },
    {
      id: 'compare',
      title: 'Compare Products',
      description: 'Side-by-side product comparison',
      icon: <Scale className="w-4 h-4" />,
      action: () => router.push('/compare'),
      category: 'navigation',
      shortcut: '⌘C'
    },
    {
      id: 'markets',
      title: 'Market Research',
      description: 'Country-based market analysis',
      icon: <Globe className="w-4 h-4" />,
      action: () => router.push('/search?tab=region'),
      category: 'navigation',
      shortcut: '⌘M'
    },
    // Actions
    {
      id: 'settings',
      title: 'Settings',
      description: 'Platform settings and preferences',
      icon: <Settings className="w-4 h-4" />,
      action: () => router.push('/settings'),
      category: 'actions',
      shortcut: '⌘,'
    },
    {
      id: 'profile',
      title: 'Profile',
      description: 'User profile and account settings',
      icon: <User className="w-4 h-4" />,
      action: () => router.push('/profile'),
      category: 'actions'
    },
    {
      id: 'logout',
      title: 'Logout',
      description: 'Sign out of your account',
      icon: <LogOut className="w-4 h-4" />,
      action: () => signOut({ callbackUrl: '/auth/signin' }),
      category: 'actions'
    }
  ];

  const filteredCommands = commands.filter(command =>
    command.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    command.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open command palette with ⌘K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }

      // Close with Escape
      if (e.key === 'Escape') {
        setIsOpen(false);
      }

      // Navigation when open
      if (isOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
            setIsOpen(false);
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const handleCommandSelect = (command: CommandItem) => {
    command.action();
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <>
      {/* Command Palette Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 glass-card p-4 rounded-full shadow-apple-lg hover:shadow-apple-xl transition-all duration-300 group button-glow"
      >
        <Command className="w-5 h-5 text-foreground group-hover:scale-110 transition-transform" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse" />
      </button>

      {/* Command Palette Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-32 px-4"
            onClick={() => setIsOpen(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

            {/* Command Palette */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="relative w-full max-w-2xl glass-card rounded-2xl shadow-apple-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center gap-3 p-4 border-b border-border/50">
                <Command className="w-5 h-5 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Type a command or search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-foreground placeholder-muted-foreground"
                />
                <kbd className="px-2 py-1 text-xs bg-muted rounded border border-border/50">ESC</kbd>
              </div>

              {/* Commands List */}
              <div className="max-h-96 overflow-y-auto">
                {filteredCommands.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                        <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No commands found</p>
                        <p className="text-sm mt-2">Try a different search term</p>
                      </div>
                ) : (
                  <div className="py-2">
                    {filteredCommands.map((command, index) => (
                      <motion.button
                        key={command.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors ${
                          index === selectedIndex ? 'bg-muted/50' : ''
                        }`}
                        onClick={() => handleCommandSelect(command)}
                        onMouseEnter={() => setSelectedIndex(index)}
                      >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          {command.icon}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium text-foreground">{command.title}</div>
                          {command.description && (
                            <div className="text-sm text-muted-foreground">{command.description}</div>
                          )}
                        </div>
                        {command.shortcut && (
                          <kbd className="px-2 py-1 text-xs bg-muted rounded border border-border/50">
                            {command.shortcut}
                          </kbd>
                        )}
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-3 border-t border-border/50 bg-muted/30">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Zap className="w-3 h-3" />
                  <span>Microinverter Intelligence Platform</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <kbd className="px-1 py-0.5 bg-background rounded border border-border/50">↑↓</kbd>
                  <span>Navigate</span>
                  <kbd className="px-1 py-0.5 bg-background rounded border border-border/50">↵</kbd>
                  <span>Select</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
