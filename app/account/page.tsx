"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  User, 
  Bell, 
  Shield, 
  Monitor, 
  CreditCard, 
  HelpCircle, 
  Play, 
  Settings,
  ChevronRight,
  X,
  Save,
  LogOut,
  Check
} from "lucide-react";
import { toast } from "sonner";

interface AccountSettings {
  _id: string;
  userId: any;
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatar: string;
    displayName: string;
  };
  parentalControls: {
    enabled: boolean;
    maturityRating: string;
    pin: string;
  };
  language: {
    display: string;
    subtitle: string;
    subtitleAutoDetect: boolean;
  };
  playback: {
    autoplayNextEpisode: boolean;
    autoplayPreviews: boolean;
    skipIntros: boolean;
    smartDownloads: boolean;
    videoQuality: string;
    downloadQuality: string;
  };
  subtitles: {
    fontSize: string;
    fontStyle: string;
    textColor: string;
    backgroundOpacity: number;
  };
  notifications: {
    email: {
      newReleases: boolean;
      continueWatching: boolean;
      billingAlerts: boolean;
      promotions: boolean;
    };
    push: {
      newEpisode: boolean;
      watchlistUpdates: boolean;
      friendActivity: boolean;
      downloadComplete: boolean;
    };
  };
  security: {
    twoFactorEnabled: boolean;
    lastPasswordChange: string;
    loginAlerts: boolean;
  };
}

interface Device {
  _id: string;
  name: string;
  type: string;
  platform: string;
  browser: string;
  location: string;
  isActive: boolean;
  isCurrent: boolean;
  lastActive: string;
  downloadSlots: number;
  maxDownloadSlots: number;
}

interface LoginActivity {
  _id: string;
  location: string;
  platform: string;
  browser: string;
  deviceType: string;
  isActive: boolean;
  loginTime: string;
  logoutTime?: string;
}

const getDefaultSettings = (session: any): AccountSettings => ({
  _id: '',
  userId: session?.user?.id || '',
  profile: {
    firstName: session?.user?.name?.split(' ')[0] || 'User',
    lastName: session?.user?.name?.split(' ').slice(1).join(' ') || '',
    email: session?.user?.email || '',
    phone: '',
    avatar: session?.user?.image || '',
    displayName: session?.user?.name || 'User',
  },
  parentalControls: {
    enabled: false,
    maturityRating: 'ALL',
    pin: '',
  },
  language: {
    display: 'English',
    subtitle: 'English',
    subtitleAutoDetect: true,
  },
  playback: {
    autoplayNextEpisode: true,
    autoplayPreviews: false,
    skipIntros: true,
    smartDownloads: true,
    videoQuality: 'Auto',
    downloadQuality: 'High',
  },
  subtitles: {
    fontSize: 'Medium',
    fontStyle: 'Default',
    textColor: 'White',
    backgroundOpacity: 60,
  },
  notifications: {
    email: {
      newReleases: true,
      continueWatching: true,
      billingAlerts: true,
      promotions: false,
    },
    push: {
      newEpisode: true,
      watchlistUpdates: true,
      friendActivity: true,
      downloadComplete: true,
    },
  },
  security: {
    twoFactorEnabled: false,
    lastPasswordChange: '',
    loginAlerts: true,
  },
});

const AccountPage = () => {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("profile");
  const [settings, setSettings] = useState<AccountSettings | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loginActivity, setLoginActivity] = useState<LoginActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (status === 'loading') return; // Wait for session to resolve

    if (session?.user) {
      fetchAccountData();
    } else {
      // No session — use defaults so the UI renders
      setSettings(getDefaultSettings(null));
      setLoading(false);
    }
  }, [session, status]);

  const fetchAccountData = async () => {
    try {
      setLoading(true);
      
      // Fetch settings
      const settingsRes = await fetch('/api/account/settings');
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        if (settingsData.settings) {
          setSettings(settingsData.settings);
        } else {
          // API returned ok but no settings object — use defaults
          setSettings(getDefaultSettings(session));
        }
      } else {
        // API error — still render UI with defaults
        setSettings(getDefaultSettings(session));
      }

      // Fetch devices (non-critical — failures are silent)
      try {
        const devicesRes = await fetch('/api/account/devices');
        if (devicesRes.ok) {
          const devicesData = await devicesRes.json();
          setDevices(devicesData?.data?.devices || []);
          setLoginActivity(devicesData?.data?.loginActivity || []);
        }
      } catch {
        // Devices fetch failed — not critical, leave defaults
      }
    } catch (error) {
      console.error('Error fetching account data:', error);
      // Fall back to defaults so the UI still renders
      setSettings(getDefaultSettings(session));
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<AccountSettings>) => {
    try {
      setSaving(true);
      const res = await fetch('/api/account/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (res.ok) {
        setSettings(prev => prev ? { ...prev, ...updates } : null);
        setHasChanges(false);
        toast.success('Settings saved successfully');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const res = await fetch('/api/account/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      if (res.ok) {
        toast.success('Password updated successfully');
      } else {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update password');
    }
  };

  const removeDevice = async (deviceId: string) => {
    try {
      const res = await fetch('/api/account/devices', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId })
      });

      if (res.ok) {
        setDevices(prev => prev.filter(d => d._id !== deviceId));
        toast.success('Device removed successfully');
      } else {
        throw new Error('Failed to remove device');
      }
    } catch (error) {
      console.error('Error removing device:', error);
      toast.error('Failed to remove device');
    }
  };

  const signOutAllDevices = async () => {
    try {
      const res = await fetch('/api/account/signout-all', {
        method: 'DELETE'
      });

      if (res.ok) {
        setLoginActivity(prev => prev.map(activity => ({ 
          ...activity, 
          isActive: false,
          logoutTime: new Date().toISOString()
        })));
        toast.success('Signed out from all devices successfully');
      } else {
        throw new Error('Failed to sign out from all devices');
      }
    } catch (error) {
      console.error('Error signing out from all devices:', error);
      toast.error('Failed to sign out from all devices');
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#E50914] border-t-transparent rounded-full animate-spin" />
          <div className="text-[#B3B3B3] text-sm">Loading your settings...</div>
        </div>
      </div>
    );
  }

  if (!settings) {
    // This should rarely happen now since we always fall back to defaults
    setSettings(getDefaultSettings(session));
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#E50914] border-t-transparent rounded-full animate-spin" />
          <div className="text-[#B3B3B3] text-sm">Loading your settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white font-['DM_Sans']">
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-[210px] min-w-[210px] bg-[#0a0a0a] border-r border-[#2A2A2A] flex flex-col overflow-y-auto">
          <div className="py-6 pb-2">
            <div className="text-[10px] font-semibold tracking-[2px] text-[#6B6B6B] px-[18px] pb-2 uppercase">
              Account
            </div>
            
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-[11px] px-[18px] py-[10px] relative transition-colors text-[13px] ${
                activeTab === "profile" 
                  ? "text-white font-medium bg-[rgba(229,9,20,0.06)]" 
                  : "text-[#B3B3B3] hover:bg-[#1F1F1F] hover:text-white"
              }`}
            >
              <User className="w-4 h-4 opacity-50" />
              Profile
              {activeTab === "profile" && (
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#E50914] rounded-r-[2px]" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("playback")}
              className={`w-full flex items-center gap-[11px] px-[18px] py-[10px] relative transition-colors text-[13px] ${
                activeTab === "playback" 
                  ? "text-white font-medium bg-[rgba(229,9,20,0.06)]" 
                  : "text-[#B3B3B3] hover:bg-[#1F1F1F] hover:text-white"
              }`}
            >
              <Play className="w-4 h-4 opacity-50" />
              Playback
              {activeTab === "playback" && (
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#E50914] rounded-r-[2px]" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("notifications")}
              className={`w-full flex items-center gap-[11px] px-[18px] py-[10px] relative transition-colors text-[13px] ${
                activeTab === "notifications" 
                  ? "text-white font-medium bg-[rgba(229,9,20,0.06)]" 
                  : "text-[#B3B3B3] hover:bg-[#1F1F1F] hover:text-white"
              }`}
            >
              <Bell className="w-4 h-4 opacity-50" />
              Notifications
              {activeTab === "notifications" && (
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#E50914] rounded-r-[2px]" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center gap-[11px] px-[18px] py-[10px] relative transition-colors text-[13px] ${
                activeTab === "security" 
                  ? "text-white font-medium bg-[rgba(229,9,20,0.06)]" 
                  : "text-[#B3B3B3] hover:bg-[#1F1F1F] hover:text-white"
              }`}
            >
              <Shield className="w-4 h-4 opacity-50" />
              Security
              {activeTab === "security" && (
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#E50914] rounded-r-[2px]" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("devices")}
              className={`w-full flex items-center gap-[11px] px-[18px] py-[10px] relative transition-colors text-[13px] ${
                activeTab === "devices" 
                  ? "text-white font-medium bg-[rgba(229,9,20,0.06)]" 
                  : "text-[#B3B3B3] hover:bg-[#1F1F1F] hover:text-white"
              }`}
            >
              <Monitor className="w-4 h-4 opacity-50" />
              Devices
              {activeTab === "devices" && (
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#E50914] rounded-r-[2px]" />
              )}
            </button>

            <div className="border-t border-[#2A2A2A] my-[10px]" />
            <div className="text-[10px] font-semibold tracking-[2px] text-[#6B6B6B] px-[18px] pb-2 uppercase">
              Subscription
            </div>

            <button
              onClick={() => setActiveTab("billing")}
              className={`w-full flex items-center gap-[11px] px-[18px] py-[10px] relative transition-colors text-[13px] ${
                activeTab === "billing" 
                  ? "text-white font-medium bg-[rgba(229,9,20,0.06)]" 
                  : "text-[#B3B3B3] hover:bg-[#1F1F1F] hover:text-white"
              }`}
            >
              <CreditCard className="w-4 h-4 opacity-50" />
              Billing
              {activeTab === "billing" && (
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#E50914] rounded-r-[2px]" />
              )}
            </button>

            <div className="border-t border-[#2A2A2A] my-[10px]" />
            <div className="text-[10px] font-semibold tracking-[2px] text-[#6B6B6B] px-[18px] pb-2 uppercase">
              Support
            </div>

            <button
              onClick={() => setActiveTab("help")}
              className={`w-full flex items-center gap-[11px] px-[18px] py-[10px] relative transition-colors text-[13px] ${
                activeTab === "help" 
                  ? "text-white font-medium bg-[rgba(229,9,20,0.06)]" 
                  : "text-[#B3B3B3] hover:bg-[#1F1F1F] hover:text-white"
              }`}
            >
              <HelpCircle className="w-4 h-4 opacity-50" />
              Help Center
              {activeTab === "help" && (
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#E50914] rounded-r-[2px]" />
              )}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 overflow-y-auto bg-[#141414] p-9 pb-[60px]">
          {activeTab === "profile" && <ProfileSection settings={settings} updateSettings={updateSettings} />}
          {activeTab === "playback" && <PlaybackSection settings={settings} updateSettings={updateSettings} />}
          {activeTab === "notifications" && <NotificationsSection settings={settings} updateSettings={updateSettings} />}
          {activeTab === "security" && <SecuritySection settings={settings} updatePassword={updatePassword} loginActivity={loginActivity} signOutAllDevices={signOutAllDevices} />}
          {activeTab === "devices" && <DevicesSection devices={devices} removeDevice={removeDevice} />}
          {activeTab === "billing" && <BillingSection />}
          {activeTab === "help" && <HelpSection />}
        </main>
      </div>
    </div>
  );
};

// Profile Section Component
const ProfileSection = ({ settings, updateSettings }: { settings: AccountSettings; updateSettings: any }) => {
  const [formData, setFormData] = useState(settings.profile);

  const handleSave = () => {
    updateSettings({ profile: formData });
  };

  return (
    <div>
      <h1 className="text-[24px] font-semibold tracking-[-0.3px] mb-1">Profile & Account</h1>
      <p className="text-[13px] text-[#B3B3B3] mb-8">Manage your MovieFlix identity and viewing preferences</p>

      {/* Profile Hero */}
      <div className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-[6px] p-5 mb-[14px] flex items-center gap-[18px]">
        <div className="w-[66px] h-[66px] rounded-[8px] bg-[#E50914] flex items-center justify-center text-[26px] font-bold cursor-pointer relative overflow-hidden">
          {formData.firstName?.[0]?.toUpperCase() || 'U'}
          <div className="absolute inset-0 bg-[rgba(0,0,0,0.55)] flex items-center justify-center text-[11px] opacity-0 hover:opacity-100 transition-opacity">
            Edit
          </div>
        </div>
        <div>
          <div className="text-[19px] font-semibold">{formData.firstName} {formData.lastName}</div>
          <div className="text-[13px] text-[#B3B3B3] mt-[3px]">{formData.email}</div>
          <div className="inline-flex items-center gap-[5px] bg-[rgba(229,9,20,0.12)] border border-[rgba(229,9,20,0.28)] text-[#ff5555] text-[10.5px] px-[9px] py-[3px] rounded-[20px] mt-[7px] font-semibold">
            <Check className="w-[10px] h-[10px]" />
            Premium Member
          </div>
        </div>
        <div className="ml-auto flex gap-2 items-center">
          <button className="px-[14px] py-[6px] bg-transparent text-white border border-[#3a3a3a] text-[12px] font-medium hover:bg-[#252525] hover:border-[#555] transition-all">
            Watch History
          </button>
          <button className="px-[14px] py-[6px] bg-transparent text-white border border-[#3a3a3a] text-[12px] font-medium hover:bg-[#252525] hover:border-[#555] transition-all">
            My Ratings
          </button>
        </div>
      </div>

      {/* Personal Info and Right Column */}
      <div className="grid grid-cols-2 gap-[14px] mb-[14px]">
        {/* Personal Info Card */}
        <div className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-[6px] p-[22px]">
          <div className="text-[15px] font-medium mb-[3px]">Personal Information</div>
          <div className="text-[12px] text-[#B3B3B3] mb-[18px]">Update your name and contact details</div>
          
          <div className="grid grid-cols-2 gap-[16px] mb-0">
            <div className="mb-[16px]">
              <label className="text-[10px] font-semibold tracking-[1.5px] text-[#6B6B6B] uppercase mb-[7px] block">
                First Name
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full bg-[#0d0d0d] border border-[#2A2A2A] rounded-[4px] text-white font-['DM_Sans'] text-[13px] p-[10px] outline-none transition-colors focus:border-[#555]"
              />
            </div>
            <div className="mb-[16px]">
              <label className="text-[10px] font-semibold tracking-[1.5px] text-[#6B6B6B] uppercase mb-[7px] block">
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full bg-[#0d0d0d] border border-[#2A2A2A] rounded-[4px] text-white font-['DM_Sans'] text-[13px] p-[10px] outline-none transition-colors focus:border-[#555]"
              />
            </div>
          </div>
          
          <div className="mb-[16px]">
            <label className="text-[10px] font-semibold tracking-[1.5px] text-[#6B6B6B] uppercase mb-[7px] block">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full bg-[#0d0d0d] border border-[#2A2A2A] rounded-[4px] text-white font-['DM_Sans'] text-[13px] p-[10px] outline-none transition-colors focus:border-[#555]"
            />
          </div>
          
          <div className="mb-[16px]">
            <label className="text-[10px] font-semibold tracking-[1.5px] text-[#6B6B6B] uppercase mb-[7px] block">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+91 00000 00000"
              className="w-full bg-[#0d0d0d] border border-[#2A2A2A] rounded-[4px] text-white font-['DM_Sans'] text-[13px] p-[10px] outline-none transition-colors focus:border-[#555]"
            />
          </div>
          
          <div className="flex gap-[10px] mt-[18px] flex-wrap">
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-[7px] px-[18px] py-[9px] rounded-[4px] bg-[#E50914] text-white font-['DM_Sans'] text-[12.5px] font-medium cursor-pointer transition-all hover:bg-[#f40612] border-none leading-none"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
            <button className="px-[18px] py-[9px] bg-transparent text-white border border-[#3a3a3a] text-[12.5px] font-medium hover:bg-[#252525] hover:border-[#555] transition-all">
              Cancel
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-[14px]">
          {/* Parental Controls */}
          <div className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-[6px] p-[22px]">
            <div className="text-[15px] font-medium mb-[3px]">Parental Controls</div>
            <div className="text-[12px] text-[#B3B3B3] mb-[18px]">Set viewing restrictions with a PIN</div>
            
            <div className="mb-[16px]">
              <label className="text-[10px] font-semibold tracking-[1.5px] text-[#6B6B6B] uppercase mb-[7px] block">
                Maturity Rating
              </label>
              <select 
                value={settings.parentalControls.maturityRating}
                onChange={(e) => updateSettings({ 
                  parentalControls: { 
                    ...settings.parentalControls, 
                    maturityRating: e.target.value 
                  } 
                })}
                className="w-full bg-[#0d0d0d] border border-[#2A2A2A] rounded-[4px] text-white font-['DM_Sans'] text-[13px] p-[10px] outline-none cursor-pointer transition-colors focus:border-[#555] appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http://www.w3.org/2000/svg%22%20width%3D%2210%22%20height%3D%226%22%20viewBox%3D%220%200%2010%206%22%3E%3Cpath%20d%3D%22M1%201l4%204%204-4%22%20stroke%3D%22%23555%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22/%3E%3C/svg%3E')] bg-no-repeat bg-[right_12px_center]"
              >
                <option value="ALL">All Ratings</option>
                <option value="PG">PG</option>
                <option value="PG-13">PG-13</option>
                <option value="R">R</option>
                <option value="TV-MA">TV-MA</option>
              </select>
            </div>
            
            <button className="px-[14px] py-[6px] bg-transparent text-white border border-[#3a3a3a] text-[12px] font-medium hover:bg-[#252525] hover:border-[#555] transition-all">
              Change PIN
            </button>
          </div>

          {/* Profile Language */}
          <div className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-[6px] p-[22px]">
            <div className="text-[15px] font-medium mb-[3px]">Profile Language</div>
            <div className="text-[12px] text-[#B3B3B3] mb-[18px]">Language and subtitle defaults</div>
            
            <div className="mb-[16px]">
              <label className="text-[10px] font-semibold tracking-[1.5px] text-[#6B6B6B] uppercase mb-[7px] block">
                Display Language
              </label>
              <select 
                value={settings.language.display}
                onChange={(e) => updateSettings({ 
                  language: { 
                    ...settings.language, 
                    display: e.target.value 
                  } 
                })}
                className="w-full bg-[#0d0d0d] border border-[#2A2A2A] rounded-[4px] text-white font-['DM_Sans'] text-[13px] p-[10px] outline-none cursor-pointer transition-colors focus:border-[#555] appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http://www.w3.org/2000/svg%22%20width%3D%2210%22%20height%3D%226%22%20viewBox%3D%220%200%2010%206%22%3E%3Cpath%20d%3D%22M1%201l4%204%204-4%22%20stroke%3D%22%23555%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22/%3E%3C/svg%3E')] bg-no-repeat bg-[right_12px_center]"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Tamil">Tamil</option>
                <option value="Telugu">Telugu</option>
                <option value="Spanish">Spanish</option>
              </select>
            </div>
            
            <div className="mb-[16px]">
              <label className="text-[10px] font-semibold tracking-[1.5px] text-[#6B6B6B] uppercase mb-[7px] block">
                Subtitle Language
              </label>
              <select 
                value={settings.language.subtitle}
                onChange={(e) => updateSettings({ 
                  language: { 
                    ...settings.language, 
                    subtitle: e.target.value 
                  } 
                })}
                className="w-full bg-[#0d0d0d] border border-[#2A2A2A] rounded-[4px] text-white font-['DM_Sans'] text-[13px] p-[10px] outline-none cursor-pointer transition-colors focus:border-[#555] appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http://www.w3.org/2000/svg%22%20width%3D%2210%22%20height%3D%226%22%20viewBox%3D%220%200%2010%206%22%3E%3Cpath%20d%3D%22M1%201l4%204%204-4%22%20stroke%3D%22%23555%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22/%3E%3C/svg%3E')] bg-no-repeat bg-[right_12px_center]"
              >
                <option value="Off">Off</option>
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Auto-detect">Auto-detect</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Autoplay & Viewing */}
      <div className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-[6px] p-[22px] mb-[14px]">
        <div className="text-[14px] font-semibold pb-[14px] border-b border-[#2A2A2A] mb-[18px] tracking-[0.2px]">
          Autoplay & Viewing
        </div>
        
        <div className="flex items-center justify-between py-[13px] border-b border-[#2A2A2A]">
          <div>
            <div className="text-[13.5px] text-white">Autoplay Next Episode</div>
            <div className="text-[12px] text-[#B3B3B3] mt-[3px]">Automatically play next episode in a series</div>
          </div>
          <button
            onClick={() => updateSettings({ 
              playback: { 
                ...settings.playback, 
                autoplayNextEpisode: !settings.playback.autoplayNextEpisode 
              } 
            })}
            className={`w-[40px] h-[22px] rounded-[11px] relative cursor-pointer transition-colors flex-shrink-0 ${
              settings.playback.autoplayNextEpisode ? 'bg-[#E50914]' : 'bg-[#333]'
            }`}
          >
            <div className={`absolute top-[3px] left-[3px] w-[16px] h-[16px] rounded-full bg-white transition-transform ${
              settings.playback.autoplayNextEpisode ? 'translate-x-[18px]' : ''
            }`} />
          </button>
        </div>

        <div className="flex items-center justify-between py-[13px] border-b border-[#2A2A2A]">
          <div>
            <div className="text-[13.5px] text-white">Autoplay Previews</div>
            <div className="text-[12px] text-[#B3B3B3] mt-[3px]">Play previews while browsing MovieFlix</div>
          </div>
          <button
            onClick={() => updateSettings({ 
              playback: { 
                ...settings.playback, 
                autoplayPreviews: !settings.playback.autoplayPreviews 
              } 
            })}
            className={`w-[40px] h-[22px] rounded-[11px] relative cursor-pointer transition-colors flex-shrink-0 ${
              settings.playback.autoplayPreviews ? 'bg-[#E50914]' : 'bg-[#333]'
            }`}
          >
            <div className={`absolute top-[3px] left-[3px] w-[16px] h-[16px] rounded-full bg-white transition-transform ${
              settings.playback.autoplayPreviews ? 'translate-x-[18px]' : ''
            }`} />
          </button>
        </div>

        <div className="flex items-center justify-between py-[13px]">
          <div>
            <div className="text-[13.5px] text-white">Skip Intros Automatically</div>
            <div className="text-[12px] text-[#B3B3B3] mt-[3px]">Skip show opening sequences when detected</div>
          </div>
          <button
            onClick={() => updateSettings({ 
              playback: { 
                ...settings.playback, 
                skipIntros: !settings.playback.skipIntros 
              } 
            })}
            className={`w-[40px] h-[22px] rounded-[11px] relative cursor-pointer transition-colors flex-shrink-0 ${
              settings.playback.skipIntros ? 'bg-[#E50914]' : 'bg-[#333]'
            }`}
          >
            <div className={`absolute top-[3px] left-[3px] w-[16px] h-[16px] rounded-full bg-white transition-transform ${
              settings.playback.skipIntros ? 'translate-x-[18px]' : ''
            }`} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Playback Section Component
const PlaybackSection = ({ settings, updateSettings }: { settings: AccountSettings; updateSettings: any }) => {
  return (
    <div>
      <h1 className="text-[24px] font-semibold tracking-[-0.3px] mb-1">Playback Settings</h1>
      <p className="text-[13px] text-[#B3B3B3] mb-8">Control video quality, behavior, and subtitle appearance across all devices</p>

      <div className="grid grid-cols-2 gap-[14px] mb-[14px]">
        {/* Streaming Quality */}
        <div className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-[6px] p-[22px]">
          <div className="text-[14px] font-semibold pb-[14px] border-b border-[#2A2A2A] mb-[18px]">
            Streaming Quality
          </div>
          
          <div className="mb-[10px]">
            <label className="text-[10px] font-semibold tracking-[1.5px] text-[#6B6B6B] uppercase mb-[10px] block">
              Video Quality
            </label>
            <div className="flex gap-2 flex-wrap mb-[16px]">
              {['Auto', 'Low', 'Medium', 'High', 'Ultra HD 4K'].map((quality) => (
                <button
                  key={quality}
                  onClick={() => updateSettings({ 
                    playback: { 
                      ...settings.playback, 
                      videoQuality: quality 
                    } 
                  })}
                  className={`px-4 py-2 rounded-[4px] text-[12.5px] font-['DM_Sans'] cursor-pointer transition-all ${
                    settings.playback.videoQuality === quality
                      ? 'bg-[#E50914] border-[#E50914] text-white'
                      : 'bg-[#252525] border-[#2A2A2A] text-[#B3B3B3] hover:border-[#555] hover:text-white'
                  }`}
                >
                  {quality}
                </button>
              ))}
            </div>
            <div className="text-[11.5px] text-[#6B6B6B] mb-[20px]">
              Ultra HD requires Premium plan and a compatible display
            </div>
          </div>

          <div className="mb-[10px]">
            <label className="text-[10px] font-semibold tracking-[1.5px] text-[#6B6B6B] uppercase mb-[10px] block">
              Download Quality
            </label>
            <div className="flex gap-2 flex-wrap">
              {['Standard', 'High'].map((quality) => (
                <button
                  key={quality}
                  onClick={() => updateSettings({ 
                    playback: { 
                      ...settings.playback, 
                      downloadQuality: quality 
                    } 
                  })}
                  className={`px-4 py-2 rounded-[4px] text-[12.5px] font-['DM_Sans'] cursor-pointer transition-all ${
                    settings.playback.downloadQuality === quality
                      ? 'bg-[#E50914] border-[#E50914] text-white'
                      : 'bg-[#252525] border-[#2A2A2A] text-[#B3B3B3] hover:border-[#555] hover:text-white'
                  }`}
                >
                  {quality}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Playback Behavior */}
        <div className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-[6px] p-[22px]">
          <div className="text-[14px] font-semibold pb-[14px] border-b border-[#2A2A2A] mb-[18px]">
            Playback Behavior
          </div>
          
          <div className="flex items-center justify-between py-[13px] border-b border-[#2A2A2A]">
            <div>
              <div className="text-[13.5px] text-white">Autoplay Next Episode</div>
              <div className="text-[12px] text-[#B3B3B3] mt-[3px]">Jump automatically after credits roll</div>
            </div>
            <button
              onClick={() => updateSettings({ 
                playback: { 
                  ...settings.playback, 
                  autoplayNextEpisode: !settings.playback.autoplayNextEpisode 
                } 
              })}
              className={`w-[40px] h-[22px] rounded-[11px] relative cursor-pointer transition-colors flex-shrink-0 ${
                settings.playback.autoplayNextEpisode ? 'bg-[#E50914]' : 'bg-[#333]'
              }`}
            >
              <div className={`absolute top-[3px] left-[3px] w-[16px] h-[16px] rounded-full bg-white transition-transform ${
                settings.playback.autoplayNextEpisode ? 'translate-x-[18px]' : ''
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-[13px] border-b border-[#2A2A2A]">
            <div>
              <div className="text-[13.5px] text-white">Autoplay Trailers</div>
              <div className="text-[12px] text-[#B3B3B3] mt-[3px]">Play previews while browsing titles</div>
            </div>
            <button
              onClick={() => updateSettings({ 
                playback: { 
                  ...settings.playback, 
                  autoplayPreviews: !settings.playback.autoplayPreviews 
                } 
              })}
              className={`w-[40px] h-[22px] rounded-[11px] relative cursor-pointer transition-colors flex-shrink-0 ${
                settings.playback.autoplayPreviews ? 'bg-[#E50914]' : 'bg-[#333]'
              }`}
            >
              <div className={`absolute top-[3px] left-[3px] w-[16px] h-[16px] rounded-full bg-white transition-transform ${
                settings.playback.autoplayPreviews ? 'translate-x-[18px]' : ''
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-[13px] border-b border-[#2A2A2A]">
            <div>
              <div className="text-[13.5px] text-white">Skip Intros</div>
              <div className="text-[12px] text-[#B3B3B3] mt-[3px]">Auto-skip detected opening sequences</div>
            </div>
            <button
              onClick={() => updateSettings({ 
                playback: { 
                  ...settings.playback, 
                  skipIntros: !settings.playback.skipIntros 
                } 
              })}
              className={`w-[40px] h-[22px] rounded-[11px] relative cursor-pointer transition-colors flex-shrink-0 ${
                settings.playback.skipIntros ? 'bg-[#E50914]' : 'bg-[#333]'
              }`}
            >
              <div className={`absolute top-[3px] left-[3px] w-[16px] h-[16px] rounded-full bg-white transition-transform ${
                settings.playback.skipIntros ? 'translate-x-[18px]' : ''
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-[13px]">
            <div>
              <div className="text-[13.5px] text-white">Smart Downloads</div>
              <div className="text-[12px] text-[#B3B3B3] mt-[3px]">Auto-download next episode on Wi-Fi</div>
            </div>
            <button
              onClick={() => updateSettings({ 
                playback: { 
                  ...settings.playback, 
                  smartDownloads: !settings.playback.smartDownloads 
                } 
              })}
              className={`w-[40px] h-[22px] rounded-[11px] relative cursor-pointer transition-colors flex-shrink-0 ${
                settings.playback.smartDownloads ? 'bg-[#E50914]' : 'bg-[#333]'
              }`}
            >
              <div className={`absolute top-[3px] left-[3px] w-[16px] h-[16px] rounded-full bg-white transition-transform ${
                settings.playback.smartDownloads ? 'translate-x-[18px]' : ''
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Subtitle Appearance */}
      <div className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-[6px] p-[22px]">
        <div className="text-[14px] font-semibold pb-[14px] border-b border-[#2A2A2A] mb-[18px]">
          Subtitle Appearance
        </div>
        
        <div className="grid grid-cols-3 gap-[16px] mb-[14px]">
          <div className="mb-0">
            <label className="text-[10px] font-semibold tracking-[1.5px] text-[#6B6B6B] uppercase mb-[7px] block">
              Font Size
            </label>
            <select 
              value={settings.subtitles.fontSize}
              onChange={(e) => updateSettings({ 
                subtitles: { 
                  ...settings.subtitles, 
                  fontSize: e.target.value 
                } 
              })}
              className="w-full bg-[#0d0d0d] border border-[#2A2A2A] rounded-[4px] text-white font-['DM_Sans'] text-[13px] p-[10px] outline-none cursor-pointer transition-colors focus:border-[#555] appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http://www.w3.org/2000/svg%22%20width%3D%2210%22%20height%3D%226%22%20viewBox%3D%220%200%2010%206%22%3E%3Cpath%20d%3D%22M1%201l4%204%204-4%22%20stroke%3D%22%23555%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22/%3E%3C/svg%3E')] bg-no-repeat bg-[right_12px_center]"
            >
              <option value="Small">Small</option>
              <option value="Medium">Medium</option>
              <option value="Large">Large</option>
              <option value="Extra Large">Extra Large</option>
            </select>
          </div>
          
          <div className="mb-0">
            <label className="text-[10px] font-semibold tracking-[1.5px] text-[#6B6B6B] uppercase mb-[7px] block">
              Font Style
            </label>
            <select 
              value={settings.subtitles.fontStyle}
              onChange={(e) => updateSettings({ 
                subtitles: { 
                  ...settings.subtitles, 
                  fontStyle: e.target.value 
                } 
              })}
              className="w-full bg-[#0d0d0d] border border-[#2A2A2A] rounded-[4px] text-white font-['DM_Sans'] text-[13px] p-[10px] outline-none cursor-pointer transition-colors focus:border-[#555] appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http://www.w3.org/2000/svg%22%20width%3D%2210%22%20height%3D%226%22%20viewBox%3D%220%200%2010%206%22%3E%3Cpath%20d%3D%22M1%201l4%204%204-4%22%20stroke%3D%22%23555%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22/%3E%3C/svg%3E')] bg-no-repeat bg-[right_12px_center]"
            >
              <option value="Default">Default</option>
              <option value="Bold">Bold</option>
              <option value="Italic">Italic</option>
              <option value="Outlined">Outlined</option>
            </select>
          </div>
          
          <div className="mb-0">
            <label className="text-[10px] font-semibold tracking-[1.5px] text-[#6B6B6B] uppercase mb-[7px] block">
              Text Color
            </label>
            <select 
              value={settings.subtitles.textColor}
              onChange={(e) => updateSettings({ 
                subtitles: { 
                  ...settings.subtitles, 
                  textColor: e.target.value 
                } 
              })}
              className="w-full bg-[#0d0d0d] border border-[#2A2A2A] rounded-[4px] text-white font-['DM_Sans'] text-[13px] p-[10px] outline-none cursor-pointer transition-colors focus:border-[#555] appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http://www.w3.org/2000/svg%22%20width%3D%2210%22%20height%3D%226%22%20viewBox%3D%220%200%2010%206%22%3E%3Cpath%20d%3D%22M1%201l4%204%204-4%22%20stroke%3D%22%23555%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22/%3E%3C/svg%3E')] bg-no-repeat bg-[right_12px_center]"
            >
              <option value="White">White</option>
              <option value="Yellow">Yellow</option>
              <option value="Green">Green</option>
              <option value="Cyan">Cyan</option>
            </select>
          </div>
        </div>
        
        <div className="mb-[16px]">
          <label className="text-[10px] font-semibold tracking-[1.5px] text-[#6B6B6B] uppercase mb-[7px] block">
            Background Opacity
          </label>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={settings.subtitles.backgroundOpacity}
            onChange={(e) => updateSettings({ 
              subtitles: { 
                ...settings.subtitles, 
                backgroundOpacity: parseInt(e.target.value) 
              } 
            })}
            className="w-full accent-[#E50914] mt-[6px]"
          />
        </div>
        
        <button className="px-[18px] py-[9px] rounded-[4px] bg-[#E50914] text-white font-['DM_Sans'] text-[12.5px] font-medium cursor-pointer transition-all hover:bg-[#f40612] border-none leading-none">
          Save Subtitle Preferences
        </button>
      </div>
    </div>
  );
};

// Notifications Section Component
const NotificationsSection = ({ settings, updateSettings }: { settings: AccountSettings; updateSettings: any }) => {
  return (
    <div>
      <h1 className="text-[24px] font-semibold tracking-[-0.3px] mb-1">Notifications</h1>
      <p className="text-[13px] text-[#B3B3B3] mb-8">Choose how and when MovieFlix contacts you</p>

      <div className="grid grid-cols-2 gap-[14px]">
        {/* Email Notifications */}
        <div className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-[6px] p-[22px]">
          <div className="text-[14px] font-semibold pb-[14px] border-b border-[#2A2A2A] mb-[18px]">
            Email Notifications
          </div>
          
          <div className="flex items-center justify-between py-[13px] border-b border-[#2A2A2A]">
            <div>
              <div className="text-[13.5px] text-white">New Releases & Picks</div>
              <div className="text-[12px] text-[#B3B3B3] mt-[3px]">Titles we think you'll love, personalised weekly</div>
            </div>
            <button
              onClick={() => updateSettings({ 
                notifications: { 
                  ...settings.notifications, 
                  email: { 
                    ...settings.notifications.email, 
                    newReleases: !settings.notifications.email.newReleases 
                  } 
                } 
              })}
              className={`w-[40px] h-[22px] rounded-[11px] relative cursor-pointer transition-colors flex-shrink-0 ${
                settings.notifications.email.newReleases ? 'bg-[#E50914]' : 'bg-[#333]'
              }`}
            >
              <div className={`absolute top-[3px] left-[3px] w-[16px] h-[16px] rounded-full bg-white transition-transform ${
                settings.notifications.email.newReleases ? 'translate-x-[18px]' : ''
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-[13px] border-b border-[#2A2A2A]">
            <div>
              <div className="text-[13.5px] text-white">Continue Watching</div>
              <div className="text-[12px] text-[#B3B3B3] mt-[3px]">Reminders for shows you haven't finished</div>
            </div>
            <button
              onClick={() => updateSettings({ 
                notifications: { 
                  ...settings.notifications, 
                  email: { 
                    ...settings.notifications.email, 
                    continueWatching: !settings.notifications.email.continueWatching 
                  } 
                } 
              })}
              className={`w-[40px] h-[22px] rounded-[11px] relative cursor-pointer transition-colors flex-shrink-0 ${
                settings.notifications.email.continueWatching ? 'bg-[#E50914]' : 'bg-[#333]'
              }`}
            >
              <div className={`absolute top-[3px] left-[3px] w-[16px] h-[16px] rounded-full bg-white transition-transform ${
                settings.notifications.email.continueWatching ? 'translate-x-[18px]' : ''
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-[13px] border-b border-[#2A2A2A]">
            <div>
              <div className="text-[13.5px] text-white">Billing & Account Alerts</div>
              <div className="text-[12px] text-[#B3B3B3] mt-[3px]">Payment confirmations and security notices</div>
            </div>
            <button
              onClick={() => updateSettings({ 
                notifications: { 
                  ...settings.notifications, 
                  email: { 
                    ...settings.notifications.email, 
                    billingAlerts: !settings.notifications.email.billingAlerts 
                  } 
                } 
              })}
              className={`w-[40px] h-[22px] rounded-[11px] relative cursor-pointer transition-colors flex-shrink-0 ${
                settings.notifications.email.billingAlerts ? 'bg-[#E50914]' : 'bg-[#333]'
              }`}
            >
              <div className={`absolute top-[3px] left-[3px] w-[16px] h-[16px] rounded-full bg-white transition-transform ${
                settings.notifications.email.billingAlerts ? 'translate-x-[18px]' : ''
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-[13px]">
            <div>
              <div className="text-[13.5px] text-white">Promotions & Offers</div>
              <div className="text-[12px] text-[#B3B3B3] mt-[3px]">Special deals and MovieFlix news</div>
            </div>
            <button
              onClick={() => updateSettings({ 
                notifications: { 
                  ...settings.notifications, 
                  email: { 
                    ...settings.notifications.email, 
                    promotions: !settings.notifications.email.promotions 
                  } 
                } 
              })}
              className={`w-[40px] h-[22px] rounded-[11px] relative cursor-pointer transition-colors flex-shrink-0 ${
                settings.notifications.email.promotions ? 'bg-[#E50914]' : 'bg-[#333]'
              }`}
            >
              <div className={`absolute top-[3px] left-[3px] w-[16px] h-[16px] rounded-full bg-white transition-transform ${
                settings.notifications.email.promotions ? 'translate-x-[18px]' : ''
              }`} />
            </button>
          </div>
        </div>

        {/* Push Notifications */}
        <div className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-[6px] p-[22px]">
          <div className="text-[14px] font-semibold pb-[14px] border-b border-[#2A2A2A] mb-[18px]">
            Push Notifications
          </div>
          
          <div className="flex items-center justify-between py-[13px] border-b border-[#2A2A2A]">
            <div>
              <div className="text-[13.5px] text-white">New Episode Available</div>
              <div className="text-[12px] text-[#B3B3B3] mt-[3px]">When a followed show drops a new episode</div>
            </div>
            <button
              onClick={() => updateSettings({ 
                notifications: { 
                  ...settings.notifications, 
                  push: { 
                    ...settings.notifications.push, 
                    newEpisode: !settings.notifications.push.newEpisode 
                  } 
                } 
              })}
              className={`w-[40px] h-[22px] rounded-[11px] relative cursor-pointer transition-colors flex-shrink-0 ${
                settings.notifications.push.newEpisode ? 'bg-[#E50914]' : 'bg-[#333]'
              }`}
            >
              <div className={`absolute top-[3px] left-[3px] w-[16px] h-[16px] rounded-full bg-white transition-transform ${
                settings.notifications.push.newEpisode ? 'translate-x-[18px]' : ''
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-[13px] border-b border-[#2A2A2A]">
            <div>
              <div className="text-[13.5px] text-white">Watchlist Updates</div>
              <div className="text-[12px] text-[#B3B3B3] mt-[3px]">Changes to items saved in your watchlist</div>
            </div>
            <button
              onClick={() => updateSettings({ 
                notifications: { 
                  ...settings.notifications, 
                  push: { 
                    ...settings.notifications.push, 
                    watchlistUpdates: !settings.notifications.push.watchlistUpdates 
                  } 
                } 
              })}
              className={`w-[40px] h-[22px] rounded-[11px] relative cursor-pointer transition-colors flex-shrink-0 ${
                settings.notifications.push.watchlistUpdates ? 'bg-[#E50914]' : 'bg-[#333]'
              }`}
            >
              <div className={`absolute top-[3px] left-[3px] w-[16px] h-[16px] rounded-full bg-white transition-transform ${
                settings.notifications.push.watchlistUpdates ? 'translate-x-[18px]' : ''
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-[13px] border-b border-[#2A2A2A]">
            <div>
              <div className="text-[13.5px] text-white">Friend Activity</div>
              <div className="text-[12px] text-[#B3B3B3] mt-[3px]">See what your friends are watching</div>
            </div>
            <button
              onClick={() => updateSettings({ 
                notifications: { 
                  ...settings.notifications, 
                  push: { 
                    ...settings.notifications.push, 
                    friendActivity: !settings.notifications.push.friendActivity 
                  } 
                } 
              })}
              className={`w-[40px] h-[22px] rounded-[11px] relative cursor-pointer transition-colors flex-shrink-0 ${
                settings.notifications.push.friendActivity ? 'bg-[#E50914]' : 'bg-[#333]'
              }`}
            >
              <div className={`absolute top-[3px] left-[3px] w-[16px] h-[16px] rounded-full bg-white transition-transform ${
                settings.notifications.push.friendActivity ? 'translate-x-[18px]' : ''
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-[13px]">
            <div>
              <div className="text-[13.5px] text-white">Download Complete</div>
              <div className="text-[12px] text-[#B3B3B3] mt-[3px]">Notify when an offline download finishes</div>
            </div>
            <button
              onClick={() => updateSettings({ 
                notifications: { 
                  ...settings.notifications, 
                  push: { 
                    ...settings.notifications.push, 
                    downloadComplete: !settings.notifications.push.downloadComplete 
                  } 
                } 
              })}
              className={`w-[40px] h-[22px] rounded-[11px] relative cursor-pointer transition-colors flex-shrink-0 ${
                settings.notifications.push.downloadComplete ? 'bg-[#E50914]' : 'bg-[#333]'
              }`}
            >
              <div className={`absolute top-[3px] left-[3px] w-[16px] h-[16px] rounded-full bg-white transition-transform ${
                settings.notifications.push.downloadComplete ? 'translate-x-[18px]' : ''
              }`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Security Section Component
const SecuritySection = ({ settings, updatePassword, loginActivity, signOutAllDevices }: { 
  settings: AccountSettings; 
  updatePassword: (current: string, newPassword: string) => void; 
  loginActivity: LoginActivity[];
  signOutAllDevices: () => void;
}) => {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordUpdate = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    updatePassword(passwordForm.currentPassword, passwordForm.newPassword);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div>
      <h1 className="text-[24px] font-semibold tracking-[-0.3px] mb-1">Security</h1>
      <p className="text-[13px] text-[#B3B3B3] mb-8">Manage your password, two-factor authentication, and active sessions</p>

      <div className="grid grid-cols-2 gap-[14px] mb-[14px]">
        {/* Change Password */}
        <div className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-[6px] p-[22px]">
          <div className="text-[14px] font-semibold pb-[14px] border-b border-[#2A2A2A] mb-[18px]">
            Change Password
          </div>
          
          <div className="mb-[16px]">
            <label className="text-[10px] font-semibold tracking-[1.5px] text-[#6B6B6B] uppercase mb-[7px] block">
              Current Password
            </label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
              placeholder="•••••••••••"
              className="w-full bg-[#0d0d0d] border border-[#2A2A2A] rounded-[4px] text-white font-['DM_Sans'] text-[13px] p-[10px] outline-none transition-colors focus:border-[#555]"
            />
          </div>
          
          <div className="mb-[16px]">
            <label className="text-[10px] font-semibold tracking-[1.5px] text-[#6B6B6B] uppercase mb-[7px] block">
              New Password
            </label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
              placeholder="Min 8 characters"
              className="w-full bg-[#0d0d0d] border border-[#2A2A2A] rounded-[4px] text-white font-['DM_Sans'] text-[13px] p-[10px] outline-none transition-colors focus:border-[#555]"
            />
          </div>
          
          <div className="mb-[16px]">
            <label className="text-[10px] font-semibold tracking-[1.5px] text-[#6B6B6B] uppercase mb-[7px] block">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
              placeholder="Repeat new password"
              className="w-full bg-[#0d0d0d] border border-[#2A2A2A] rounded-[4px] text-white font-['DM_Sans'] text-[13px] p-[10px] outline-none transition-colors focus:border-[#555]"
            />
          </div>
          
          <button
            onClick={handlePasswordUpdate}
            className="px-[18px] py-[9px] rounded-[4px] bg-[#E50914] text-white font-['DM_Sans'] text-[12.5px] font-medium cursor-pointer transition-all hover:bg-[#f40612] border-none leading-none"
          >
            Update Password
          </button>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-[14px]">
          {/* Two-Factor Authentication */}
          <div className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-[6px] p-[22px]">
            <div className="text-[14px] font-semibold pb-[14px] border-b border-[#2A2A2A] mb-[18px]">
              Two-Factor Authentication
            </div>
            
            <div className="flex items-center justify-between py-[13px] border-b border-[#2A2A2A]">
              <div>
                <div className="text-[13.5px] text-white">Enable 2FA</div>
                <div className="text-[12px] text-[#B3B3B3] mt-[3px]">SMS or authenticator app verification</div>
              </div>
              <button
                className={`w-[40px] h-[22px] rounded-[11px] relative cursor-pointer transition-colors flex-shrink-0 ${
                  settings.security.twoFactorEnabled ? 'bg-[#E50914]' : 'bg-[#333]'
                }`}
              >
                <div className={`absolute top-[3px] left-[3px] w-[16px] h-[16px] rounded-full bg-white transition-transform ${
                  settings.security.twoFactorEnabled ? 'translate-x-[18px]' : ''
                }`} />
              </button>
            </div>
            
            <div className="text-[11.5px] text-[#6B6B6B] mt-[12px] leading-[1.6]">
              Adds a second verification step when signing in from a new device.
            </div>
            
            <button className="px-[14px] py-[6px] bg-transparent text-white border border-[#3a3a3a] text-[12px] font-medium hover:bg-[#252525] hover:border-[#555] transition-all mt-[14px]">
              Setup Authenticator
            </button>
          </div>

          {/* Sign Out Everywhere */}
          <div className="bg-[rgba(229,9,20,0.05)] border border-[rgba(229,9,20,0.2)] rounded-[6px] p-[22px]">
            <div className="text-[13px] font-medium mb-[6px]">Sign Out Everywhere</div>
            <div className="text-[12px] text-[#B3B3B3] mb-[14px] leading-[1.6]">
              Immediately revokes access on all devices except this one.
            </div>
            <button
              onClick={signOutAllDevices}
              className="px-[14px] py-[6px] bg-transparent text-[#ff5555] border border-[rgba(255,85,85,0.25)] text-[12px] font-medium hover:bg-[rgba(255,85,85,0.07)] transition-all"
            >
              Sign Out of All Devices
            </button>
          </div>
        </div>
      </div>

      {/* Recent Login Activity */}
      <div className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-[6px] p-[22px]">
        <div className="text-[14px] font-semibold pb-[14px] border-b border-[#2A2A2A] mb-[18px]">
          Recent Login Activity
        </div>
        
        {loginActivity.map((activity, index) => (
          <div key={activity._id} className="flex items-center justify-between py-[12px] border-b border-[#2A2A2A] last:border-b-0">
            <div>
              <div className="text-[13.5px] font-medium">
                {activity.isActive && <span className="w-[7px] h-[7px] rounded-full bg-[#22c55e] inline-block mr-[7px]" />}
                {activity.location}
              </div>
              <div className="text-[12px] text-[#B3B3B3] mt-[3px]">
                {activity.browser} · {activity.platform} · {activity.isActive ? 'Active now' : `${new Date(activity.loginTime).toLocaleDateString()}`}
              </div>
            </div>
            {activity.isActive ? (
              <div className="bg-[rgba(34,197,94,0.1)] text-[#22c55e] px-[10px] py-[3px] rounded-[20px] text-[11px] font-semibold">
                Current
              </div>
            ) : (
              <button className="px-[14px] py-[6px] bg-transparent text-white border border-[#3a3a3a] text-[12px] font-medium hover:bg-[#252525] hover:border-[#555] transition-all">
                Sign Out
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Devices Section Component
const DevicesSection = ({ devices, removeDevice }: { devices: Device[]; removeDevice: (id: string) => void }) => {
  const activeDevices = devices.filter(d => d.isActive).length;
  const deviceLimit = 5;
  const totalDownloadSlots = devices.reduce((sum, device) => sum + device.downloadSlots, 0);
  const maxDownloadSlots = devices.reduce((sum, device) => sum + device.maxDownloadSlots, 0);

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'Desktop': return <Monitor className="w-4 h-4" />;
      case 'Mobile': return <Monitor className="w-4 h-4" />;
      case 'Tablet': return <Monitor className="w-4 h-4" />;
      case 'TV': return <Monitor className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  return (
    <div>
      <h1 className="text-[24px] font-semibold tracking-[-0.3px] mb-1">Devices</h1>
      <p className="text-[13px] text-[#B3B3B3] mb-8">Manage all devices currently signed into your MovieFlix account</p>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-[12px] mb-[14px]">
        <div className="bg-[#0d0d0d] border border-[#2A2A2A] rounded-[6px] p-4">
          <div className="text-[10px] font-semibold tracking-[1.5px] text-[#6B6B6B] uppercase mb-[6px]">
            Active Devices
          </div>
          <div className="text-[20px] font-semibold">{activeDevices}</div>
        </div>
        <div className="bg-[#0d0d0d] border border-[#2A2A2A] rounded-[6px] p-4">
          <div className="text-[10px] font-semibold tracking-[1.5px] text-[#6B6B6B] uppercase mb-[6px]">
            Device Limit
          </div>
          <div className="text-[20px] font-semibold">{deviceLimit}</div>
        </div>
        <div className="bg-[#0d0d0d] border border-[#2A2A2A] rounded-[6px] p-4">
          <div className="text-[10px] font-semibold tracking-[1.5px] text-[#6B6B6B] uppercase mb-[6px]">
            Download Slots
          </div>
          <div className="text-[20px] font-semibold">{totalDownloadSlots} / {maxDownloadSlots}</div>
        </div>
      </div>

      {/* Active Devices */}
      <div className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-[6px] p-[22px]">
        <div className="text-[14px] font-semibold pb-[14px] border-b border-[#2A2A2A] mb-[18px]">
          Active Devices
        </div>

        {devices.map((device) => (
          <div key={device._id} className="flex items-center justify-between py-[14px] border-b border-[#2A2A2A] last:border-b-0">
            <div className="flex items-center gap-[14px]">
              <div className="w-[36px] h-[36px] bg-[#252525] border border-[#2A2A2A] rounded-[5px] flex items-center justify-center flex-shrink-0">
                {getDeviceIcon(device.type)}
              </div>
              <div>
                <div className="text-[13.5px] font-medium">
                  {device.name}
                  {device.isCurrent && <span className="bg-[rgba(229,9,20,0.12)] text-[#ff5555] px-[7px] py-[2px] rounded-[10px] text-[9.5px] font-semibold ml-[7px] tracking-[0.5px]">CURRENT</span>}
                </div>
                <div className="text-[11.5px] text-[#B3B3B3] mt-[3px]">
                  {device.platform} · {device.browser} · {device.location}
                </div>
                {device.isActive && (
                  <div className="text-[11.5px] text-[#22c55e] mt-[2px]">Active now</div>
                )}
              </div>
            </div>
            <button
              onClick={() => !device.isCurrent && removeDevice(device._id)}
              disabled={device.isCurrent}
              className={`px-[14px] py-[6px] text-[12px] font-medium transition-all ${
                device.isCurrent 
                  ? 'opacity-35 cursor-not-allowed bg-transparent text-white border border-[#3a3a3a]' 
                  : 'bg-transparent text-white border border-[#3a3a3a] hover:bg-[#252525] hover:border-[#555]'
              }`}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Billing Section Component
const BillingSection = () => {
  return (
    <div>
      <h1 className="text-[24px] font-semibold tracking-[-0.3px] mb-1">Billing</h1>
      <p className="text-[13px] text-[#B3B3B3] mb-8">Manage your subscription and payment methods</p>

      <div className="bg-[#0d0d0d] border border-[#2A2A2A] rounded-[6px] p-5 relative overflow-hidden mb-[14px]">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#E50914]" />
        <div className="text-[11px] font-bold tracking-[1.5px] text-[#E50914] uppercase mb-[5px]">
          Premium Plan
        </div>
        <div className="text-[30px] font-bold">
          $9.99 <em className="text-[14px] font-normal text-[#B3B3B3] not-italic">/month</em>
        </div>
      </div>

      <div className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-[6px] p-[22px]">
        <div className="text-[14px] font-semibold pb-[14px] border-b border-[#2A2A2A] mb-[18px]">
          Billing History
        </div>
        
        <div className="flex justify-between items-center py-[10px] border-b border-[#2A2A2A] text-[13px]">
          <span>Premium Subscription</span>
          <span>$9.99</span>
        </div>
        <div className="flex justify-between items-center py-[10px] border-b border-[#2A2A2A] text-[13px]">
          <span>Next Billing Date</span>
          <span>Dec 15, 2024</span>
        </div>
        <div className="flex justify-between items-center py-[10px] text-[13px]">
          <span>Payment Method</span>
          <span>••••• 4242</span>
        </div>
      </div>
    </div>
  );
};

// Help Section Component
const HelpSection = () => {
  const helpLinks = [
    { title: 'Getting Started', description: 'Learn the basics of MovieFlix' },
    { title: 'Account & Billing', description: 'Manage your subscription and account' },
    { title: 'Troubleshooting', description: 'Fix common playback and app issues' },
    { title: 'Safety & Privacy', description: 'Understand your privacy and security' },
    { title: 'Contact Support', description: 'Get help from our support team' }
  ];

  return (
    <div>
      <h1 className="text-[24px] font-semibold tracking-[-0.3px] mb-1">Help Center</h1>
      <p className="text-[13px] text-[#B3B3B3] mb-8">Find answers to common questions and get support</p>

      <div className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-[6px]">
        {helpLinks.map((link, index) => (
          <div key={index} className="flex items-center justify-between py-[13px] border-b border-[#2A2A2A] last:border-b-0 cursor-pointer transition-colors text-[13.5px] text-[#B3B3B3] hover:text-white">
            <span>{link.title}</span>
            <ChevronRight className="w-[14px] h-[14px] opacity-45 flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccountPage;
