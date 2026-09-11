'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Settings, User, Bell, Shield, Palette, Globe, Database, Download, Save, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface UserSettings {
  profile: {
    name: string;
    email: string;
    role: string;
    company?: string;
    location?: string;
  };
  notifications: {
    email: boolean;
    push: boolean;
    productUpdates: boolean;
    priceAlerts: boolean;
    systemUpdates: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
    dateFormat: string;
  };
  data: {
    exportFormat: 'csv' | 'excel' | 'json';
    autoSync: boolean;
    syncFrequency: string;
    retentionPeriod: string;
  };
  security: {
    twoFactorEnabled: boolean;
    lastPasswordChange: string;
    activeSessions: number;
    apiKeys: number;
  };
}

const defaultSettings: UserSettings = {
  profile: {
    name: 'Enphase Administrator',
    email: 'enphase@demo.com',
    role: 'ADMIN',
    company: 'Enphase Energy',
    location: 'Fremont, CA'
  },
  notifications: {
    email: true,
    push: true,
    productUpdates: true,
    priceAlerts: false,
    systemUpdates: true
  },
  appearance: {
    theme: 'system',
    language: 'en',
    timezone: 'America/Los_Angeles',
    dateFormat: 'MM/DD/YYYY'
  },
  data: {
    exportFormat: 'csv',
    autoSync: true,
    syncFrequency: 'daily',
    retentionPeriod: '90'
  },
  security: {
    twoFactorEnabled: false,
    lastPasswordChange: '2024-01-01',
    activeSessions: 2,
    apiKeys: 1
  }
};

export default function SettingsPage() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Load user settings from API or localStorage
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSave = async () => {
    setLoading(true);
    // Simulate API call to save settings
    setTimeout(() => {
      localStorage.setItem('userSettings', JSON.stringify(settings));
      setHasChanges(false);
      setLoading(false);
    }, 1000);
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setHasChanges(true);
  };

  const updateSettings = (category: keyof UserSettings, updates: Partial<UserSettings[keyof UserSettings]>) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        ...updates
      }
    }));
    setHasChanges(true);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'data', label: 'Data & Privacy', icon: Database },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-8 border-t-4 border-t-enphase-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-enphase-500 tracking-wider mb-3">ACCOUNT & PREFERENCES</p>
            <h1 className="text-[32px] font-semibold text-gray-900 tracking-tight">Settings</h1>
            <p className="text-[13px] text-gray-500 mt-1">Manage your account preferences and settings</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!hasChanges || loading}
              className="bg-enphase-500 hover:bg-enphase-600 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>

      <div className="px-8 py-8 flex gap-6">
        {/* Sidebar */}
        <div className="bg-white rounded-xl border border-gray-300 w-64 h-fit border-l-4 border-l-enphase-500">
          <div className="p-6">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl border border-gray-300 border-l-4 border-l-blue-500">
              <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-gray-500" />
                  Profile Settings
                </h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <input
                      type="text"
                      value={settings.profile.name}
                      onChange={(e) => updateSettings('profile', { name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-enphase-100 focus:border-enphase-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={settings.profile.email}
                      onChange={(e) => updateSettings('profile', { email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-enphase-100 focus:border-enphase-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Role</label>
                    <input
                      type="text"
                      value={settings.profile.role}
                      disabled
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Company</label>
                    <input
                      type="text"
                      value={settings.profile.company || ''}
                      onChange={(e) => updateSettings('profile', { company: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-enphase-100 focus:border-enphase-300"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <input
                    type="text"
                    value={settings.profile.location || ''}
                    onChange={(e) => updateSettings('profile', { location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-enphase-100 focus:border-enphase-300"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-xl border border-gray-300 border-l-4 border-l-amber-500">
              <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-gray-500" />
                  Notification Preferences
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {Object.entries(settings.notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h4 className="font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {key === 'email' && 'Receive email notifications'}
                        {key === 'push' && 'Receive browser push notifications'}
                        {key === 'productUpdates' && 'Get notified about new products'}
                        {key === 'priceAlerts' && 'Receive price change alerts'}
                        {key === 'systemUpdates' && 'System maintenance and updates'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => updateSettings('notifications', { [key]: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <div className="bg-white rounded-xl border border-gray-300 border-l-4 border-l-purple-500">
              <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-gray-500" />
                  Appearance & Display
                </h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-2">Theme</label>
                    <select
                      value={settings.appearance.theme}
                      onChange={(e) => updateSettings('appearance', { theme: e.target.value as 'light' | 'dark' | 'system' })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-enphase-100 focus:border-enphase-300"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Language</label>
                    <select
                      value={settings.appearance.language}
                      onChange={(e) => updateSettings('appearance', { language: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-enphase-100 focus:border-enphase-300"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Timezone</label>
                    <select
                      value={settings.appearance.timezone}
                      onChange={(e) => updateSettings('appearance', { timezone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-enphase-100 focus:border-enphase-300"
                    >
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="Europe/London">London</option>
                      <option value="Asia/Tokyo">Tokyo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Date Format</label>
                    <select
                      value={settings.appearance.dateFormat}
                      onChange={(e) => updateSettings('appearance', { dateFormat: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-enphase-100 focus:border-enphase-300"
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Data Settings */}
          {activeTab === 'data' && (
            <div className="bg-white rounded-xl border border-gray-300 border-l-4 border-l-emerald-500">
              <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-gray-500" />
                  Data & Privacy
                </h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-2">Default Export Format</label>
                    <select
                      value={settings.data.exportFormat}
                      onChange={(e) => updateSettings('data', { exportFormat: e.target.value as 'csv' | 'excel' | 'json' })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-enphase-100 focus:border-enphase-300"
                    >
                      <option value="csv">CSV</option>
                      <option value="excel">Excel</option>
                      <option value="json">JSON</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Sync Frequency</label>
                    <select
                      value={settings.data.syncFrequency}
                      onChange={(e) => updateSettings('data', { syncFrequency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-enphase-100 focus:border-enphase-300"
                    >
                      <option value="realtime">Real-time</option>
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h4 className="font-medium">Auto Sync Data</h4>
                      <p className="text-sm text-muted-foreground">Automatically sync data from external sources</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.data.autoSync}
                        onChange={(e) => updateSettings('data', { autoSync: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Data Retention Period (days)</label>
                    <input
                      type="number"
                      value={settings.data.retentionPeriod}
                      onChange={(e) => updateSettings('data', { retentionPeriod: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-enphase-100 focus:border-enphase-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-xl border border-gray-300 border-l-4 border-l-red-500">
              <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-gray-500" />
                  Security Settings
                </h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Two-Factor Authentication</h4>
                      <Badge className={settings.security.twoFactorEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {settings.security.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      {settings.security.twoFactorEnabled ? 'Configure' : 'Enable'}
                    </Button>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h4 className="font-medium mb-2">Active Sessions</h4>
                    <p className="text-2xl font-bold">{settings.security.activeSessions}</p>
                    <p className="text-sm text-muted-foreground">Currently active devices</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Manage Sessions
                    </Button>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h4 className="font-medium mb-2">API Keys</h4>
                    <p className="text-2xl font-bold">{settings.security.apiKeys}</p>
                    <p className="text-sm text-muted-foreground">Generated API keys</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Manage Keys
                    </Button>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h4 className="font-medium mb-2">Last Password Change</h4>
                    <p className="text-sm text-muted-foreground">{new Date(settings.security.lastPasswordChange).toLocaleDateString()}</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Change Password
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
