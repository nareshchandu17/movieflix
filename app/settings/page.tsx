"use client";

import { useState, useEffect } from "react";
import { User, Bell, Shield, Palette, Globe, CreditCard, HelpCircle, LogOut, Save, X } from "lucide-react";
import { toast } from "sonner";

interface UserSettings {
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatar: string;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    marketingEmails: boolean;
    newReleases: boolean;
    recommendations: boolean;
  };
  privacy: {
    profileVisibility: "public" | "private" | "friends";
    watchHistoryVisibility: boolean;
    dataCollection: boolean;
    twoFactorAuth: boolean;
  };
  appearance: {
    theme: "dark" | "light" | "auto";
    language: string;
    subtitles: boolean;
    autoplay: boolean;
    quality: "auto" | "low" | "medium" | "high" | "ultra";
  };
  billing: {
    plan: "free" | "basic" | "premium" | "ultra";
    autoRenew: boolean;
    paymentMethod: string;
  };
}

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const [settings, setSettings] = useState<UserSettings>({
    profile: {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "+1 234 567 8900",
      avatar: ""
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      marketingEmails: false,
      newReleases: true,
      recommendations: true
    },
    privacy: {
      profileVisibility: "public",
      watchHistoryVisibility: true,
      dataCollection: true,
      twoFactorAuth: false
    },
    appearance: {
      theme: "dark",
      language: "en",
      subtitles: true,
      autoplay: true,
      quality: "high"
    },
    billing: {
      plan: "premium",
      autoRenew: true,
      paymentMethod: "•••• 4242"
    }
  });

  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy & Security", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "help", label: "Help & Support", icon: HelpCircle }
  ];

  const handleSettingChange = (category: keyof UserSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      const data = await response.json();
      setHasChanges(false);
      toast.success("Settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetSettings = async () => {
    try {
      const response = await fetch('/api/settings', {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to reset settings');
      }

      const data = await response.json();
      setSettings(data.settings);
      setHasChanges(true);
      toast.info("Settings reset to defaults");
    } catch (error) {
      toast.error("Failed to reset settings. Please try again.");
    }
  };

  useEffect(() => {
    // Load settings from API on mount
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data.settings);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    loadSettings();
  }, []);

  const renderProfileSettings = () => (
    <div className="space-y-8">
      <div className="flex items-center space-x-6">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-500/25">
          <span className="text-white text-3xl font-bold">
            {settings.profile.firstName[0]}{settings.profile.lastName[0]}
          </span>
        </div>
        <div>
          <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 mb-2">
            Change Avatar
          </button>
          <p className="text-gray-400 text-sm">JPG, PNG or GIF. Max size 2MB</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-3">First Name</label>
          <input
            type="text"
            value={settings.profile.firstName}
            onChange={(e) => handleSettingChange('profile', 'firstName', e.target.value)}
            className="w-full px-4 py-3 bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:border-blue-500 focus:outline-none focus:bg-slate-800/70 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-3">Last Name</label>
          <input
            type="text"
            value={settings.profile.lastName}
            onChange={(e) => handleSettingChange('profile', 'lastName', e.target.value)}
            className="w-full px-4 py-3 bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:border-blue-500 focus:outline-none focus:bg-slate-800/70 transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-3">Email Address</label>
        <input
          type="email"
          value={settings.profile.email}
          onChange={(e) => handleSettingChange('profile', 'email', e.target.value)}
          className="w-full px-4 py-3 bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:border-blue-500 focus:outline-none focus:bg-slate-800/70 transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-3">Phone Number</label>
        <input
          type="tel"
          value={settings.profile.phone}
          onChange={(e) => handleSettingChange('profile', 'phone', e.target.value)}
          className="w-full px-4 py-3 bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:border-blue-500 focus:outline-none focus:bg-slate-800/70 transition-all"
        />
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      {[
        { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive email updates about your account' },
        { key: 'pushNotifications', label: 'Push Notifications', desc: 'Get push notifications on your devices' },
        { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Receive emails about new features and offers' },
        { key: 'newReleases', label: 'New Releases', desc: 'Get notified when new content is available' },
        { key: 'recommendations', label: 'Personalized Recommendations', desc: 'Receive content suggestions based on your preferences' }
      ].map(({ key, label, desc }) => (
        <div key={key} className="flex items-center justify-between p-4 bg-slate-800/30 backdrop-blur-sm border border-white/10 rounded-xl">
          <div>
            <h3 className="text-white font-medium">{label}</h3>
            <p className="text-gray-400 text-sm">{desc}</p>
          </div>
          <button
            onClick={() => handleSettingChange('notifications', key, !settings.notifications[key as keyof typeof settings.notifications])}
            className={`relative w-14 h-8 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25 transform hover:scale-105 ${
              settings.notifications[key as keyof typeof settings.notifications] 
                ? 'bg-gradient-to-r from-red-600 via-red-500 to-orange-600 shadow-lg shadow-red-500/25' 
                : 'bg-gray-600'
            }`}
          >
            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 ${
              settings.notifications[key as keyof typeof settings.notifications] 
                ? 'translate-x-7' 
                : 'translate-x-1'
            }`} />
          </button>
        </div>
      ))}
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-3">Profile Visibility</label>
        <select
          value={settings.privacy.profileVisibility}
          onChange={(e) => handleSettingChange('privacy', 'profileVisibility', e.target.value)}
          className="w-full px-4 py-3 bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:border-blue-500 focus:outline-none focus:bg-slate-800/70 transition-all"
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
          <option value="friends">Friends Only</option>
        </select>
      </div>

      {[
        { key: 'watchHistoryVisibility', label: 'Watch History Visibility', desc: 'Allow others to see your watch history' },
        { key: 'dataCollection', label: 'Data Collection', desc: 'Allow us to collect usage data for better recommendations' },
        { key: 'twoFactorAuth', label: 'Two-Factor Authentication', desc: 'Add an extra layer of security to your account' }
      ].map(({ key, label, desc }) => (
        <div key={key} className="flex items-center justify-between p-4 bg-slate-800/30 backdrop-blur-sm border border-white/10 rounded-xl">
          <div>
            <h3 className="text-white font-medium">{label}</h3>
            <p className="text-gray-400 text-sm">{desc}</p>
          </div>
          <button
            onClick={() => handleSettingChange('privacy', key, !settings.privacy[key as keyof typeof settings.privacy])}
            className={`relative w-14 h-8 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25 transform hover:scale-105 ${
              settings.privacy[key as keyof typeof settings.privacy] 
                ? 'bg-gradient-to-r from-red-600 via-red-500 to-orange-600 shadow-lg shadow-red-500/25' 
                : 'bg-gray-600'
            }`}
          >
            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 ${
              settings.privacy[key as keyof typeof settings.privacy] 
                ? 'translate-x-7' 
                : 'translate-x-1'
            }`} />
          </button>
        </div>
      ))}
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-3">Theme</label>
        <select
          value={settings.appearance.theme}
          onChange={(e) => handleSettingChange('appearance', 'theme', e.target.value)}
          className="w-full px-4 py-3 bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:border-blue-500 focus:outline-none focus:bg-slate-800/70 transition-all"
        >
          <option value="dark">Dark</option>
          <option value="light">Light</option>
          <option value="auto">Auto</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-3">Language</label>
        <select
          value={settings.appearance.language}
          onChange={(e) => handleSettingChange('appearance', 'language', e.target.value)}
          className="w-full px-4 py-3 bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:border-blue-500 focus:outline-none focus:bg-slate-800/70 transition-all"
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-3">Video Quality</label>
        <select
          value={settings.appearance.quality}
          onChange={(e) => handleSettingChange('appearance', 'quality', e.target.value)}
          className="w-full px-4 py-3 bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:border-blue-500 focus:outline-none focus:bg-slate-800/70 transition-all"
        >
          <option value="auto">Auto</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="ultra">Ultra</option>
        </select>
      </div>

      {[
        { key: 'subtitles', label: 'Subtitles', desc: 'Show subtitles by default' },
        { key: 'autoplay', label: 'Autoplay', desc: 'Automatically play next episode' }
      ].map(({ key, label, desc }) => (
        <div key={key} className="flex items-center justify-between p-4 bg-slate-800/30 backdrop-blur-sm border border-white/10 rounded-xl">
          <div>
            <h3 className="text-white font-medium">{label}</h3>
            <p className="text-gray-400 text-sm">{desc}</p>
          </div>
          <button
            onClick={() => handleSettingChange('appearance', key, !settings.appearance[key as keyof typeof settings.appearance])}
            className={`relative w-14 h-8 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25 transform hover:scale-105 ${
              settings.appearance[key as keyof typeof settings.appearance] 
                ? 'bg-gradient-to-r from-red-600 via-red-500 to-orange-600 shadow-lg shadow-red-500/25' 
                : 'bg-gray-600'
            }`}
          >
            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 ${
              settings.appearance[key as keyof typeof settings.appearance] 
                ? 'translate-x-7' 
                : 'translate-x-1'
            }`} />
          </button>
        </div>
      ))}
    </div>
  );

  const renderBillingSettings = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-bold text-xl capitalize">{settings.billing.plan} Plan</h3>
            <p className="text-gray-400">Current subscription</p>
          </div>
          <div className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold">
            Active
          </div>
        </div>
        
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Monthly Price</span>
            <span className="text-white font-semibold">
              {settings.billing.plan === 'free' ? '$0' : 
               settings.billing.plan === 'basic' ? '$9.99' :
               settings.billing.plan === 'premium' ? '$15.99' : '$29.99'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Payment Method</span>
            <span className="text-white">{settings.billing.paymentMethod}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Next Billing</span>
            <span className="text-white">Feb 15, 2024</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-800/30 backdrop-blur-sm border border-white/10 rounded-xl">
          <div>
            <h3 className="text-white font-medium">Auto-Renew</h3>
            <p className="text-gray-400 text-sm">Automatically renew subscription</p>
          </div>
          <button
            onClick={() => handleSettingChange('billing', 'autoRenew', !settings.billing.autoRenew)}
            className={`relative w-14 h-8 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25 transform hover:scale-105 ${
              settings.billing.autoRenew 
                ? 'bg-gradient-to-r from-red-600 via-red-500 to-orange-600 shadow-lg shadow-red-500/25' 
                : 'bg-gray-600'
            }`}
          >
            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 ${
              settings.billing.autoRenew 
                ? 'translate-x-7' 
                : 'translate-x-1'
            }`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25">
          Upgrade Plan
        </button>
        <button className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-medium hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-gray-500/25">
          Change Payment
        </button>
      </div>
    </div>
  );

  const renderHelpSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button className="px-6 py-4 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-xl font-medium hover:from-slate-600 hover:to-slate-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-slate-500/25 flex items-center justify-center gap-3">
          <HelpCircle className="w-5 h-5" />
          Help Center
        </button>
        <button className="px-6 py-4 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-xl font-medium hover:from-slate-600 hover:to-slate-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-slate-500/25 flex items-center justify-center gap-3">
          <User className="w-5 h-5" />
          Contact Support
        </button>
        <button className="px-6 py-4 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-xl font-medium hover:from-slate-600 hover:to-slate-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-slate-500/25 flex items-center justify-center gap-3">
          <Shield className="w-5 h-5" />
          Privacy Policy
        </button>
        <button className="px-6 py-4 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-xl font-medium hover:from-slate-600 hover:to-slate-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-slate-500/25 flex items-center justify-center gap-3">
          <Globe className="w-5 h-5" />
          Terms of Service
        </button>
      </div>

      <div className="bg-gradient-to-br from-red-900/30 to-red-800/30 backdrop-blur-xl border border-red-500/20 rounded-2xl p-6">
        <h4 className="text-white font-bold text-xl mb-4">Delete Account</h4>
        <p className="text-gray-300 mb-6">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <button className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-medium hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-500/25">
          Delete Account
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return renderProfileSettings();
      case "notifications":
        return renderNotificationSettings();
      case "privacy":
        return renderPrivacySettings();
      case "appearance":
        return renderAppearanceSettings();
      case "billing":
        return renderBillingSettings();
      case "help":
        return renderHelpSettings();
      default:
        return renderProfileSettings();
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Enhanced Background */}
      <div className="fixed inset-0 -z-10 bg-black">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gray-900/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gray-900/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gray-800/3 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        {/* Enhanced Header with proper spacing */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-600 via-red-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/25">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white via-red-500 to-orange-500 bg-clip-text text-transparent pt-5s">Settings</h1>
              <p className="text-gray-400 text-lg">Manage your account settings and preferences</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Enhanced Sidebar */}
          <div className="lg:w-64">
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl">
              {mounted && (
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                          activeTab === tab.id
                            ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/25"
                            : "text-gray-300 hover:bg-white/10 hover:text-white hover:shadow-lg"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              )}

              <div className="mt-8 pt-8 border-t border-white/10">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 transform hover:scale-105">
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Main Content */}
          <div className="flex-1">
            <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-6 shadow-2xl">
              <div className="flex items-center gap-6 mb-8">
                <div className={`w-12 h-12 bg-gradient-to-br rounded-2xl flex items-center justify-center shadow-lg ${
                  activeTab === 'profile' ? 'from-blue-500 to-cyan-600' :
                  activeTab === 'notifications' ? 'from-green-500 to-emerald-600' :
                  activeTab === 'privacy' ? 'from-purple-500 to-pink-600' :
                  activeTab === 'appearance' ? 'from-orange-500 to-red-600' :
                  activeTab === 'billing' ? 'from-yellow-500 to-orange-600' :
                  'from-gray-500 to-gray-600'
                }`}>
                  {(() => {
                    const Icon = tabs.find(tab => tab.id === activeTab)?.icon || Shield;
                    return <Icon className="w-6 h-6 text-white" />;
                  })()}
                </div>
                <h2 className="text-2xl font-bold text-white capitalize">
                  {tabs.find(tab => tab.id === activeTab)?.label}
                </h2>
              </div>
              
              {mounted && renderContent()}
            </div>

            {/* Enhanced Action Buttons */}
            <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <button
                  onClick={resetSettings}
                  className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-medium hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-gray-500/25"
                >
                  Reset to Defaults
                </button>
                
                <div className="flex items-center gap-4">
                  {hasChanges && (
                    <span className="text-gray-400 text-sm animate-pulse">You have unsaved changes</span>
                  )}
                  <button
                    onClick={saveSettings}
                    disabled={!hasChanges || loading}
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-medium hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-500/25 disabled:hover:scale-100"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
