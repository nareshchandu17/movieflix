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
  ArrowRight,
  X,
  Save,
  LogOut,
  Check,
  CheckCircle,
  Plus,
  Lock,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Globe,
  Loader2,
  QrCode,
  Copy,
  Smartphone,
  RefreshCw,
  Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useProfileContext } from "@/contexts/ProfileContext";
import { AVATARS, AVATAR_MAP } from "@/lib/avatars";
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

// --- SECTION COMPONENTS ---

// Profiles Section Component
const ProfilesSection = ({ profiles, editProfile }: { profiles: any[]; editProfile: any }) => {
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [localProfileData, setLocalProfileData] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const handleEditClick = (profile: any) => {
    setEditingProfileId(profile.profileId);
    setLocalProfileData({ ...profile });
  };

  const handleSave = async () => {
    if (!editingProfileId || !localProfileData) return;
    setSaving(true);
    try {
      await editProfile(editingProfileId, localProfileData);
      toast.success('Profile updated');
      setEditingProfileId(null);
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-[28px] font-bold tracking-tight mb-2">Profiles & Parental Controls</h1>
      <p className="text-[14px] text-[#B3B3B3] mb-8">Manage viewing restrictions, profile settings and avatars for everyone.</p>

      <div className="space-y-4">
        {profiles.map((profile) => (
          <div 
            key={profile.profileId} 
            className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-lg overflow-hidden transition-all duration-300"
          >
            <div 
              className="p-5 flex items-center gap-5 cursor-pointer hover:bg-[#252525] transition-colors"
              onClick={() => editingProfileId === profile.profileId ? setEditingProfileId(null) : handleEditClick(profile)}
            >
              <div 
                className={`w-[60px] h-[60px] rounded-md bg-gradient-to-br ${AVATAR_MAP[profile.avatarId]?.gradient || 'from-gray-700 to-gray-800'} flex items-center justify-center text-3xl shadow-lg`}
              >
                {AVATAR_MAP[profile.avatarId]?.emoji || '👤'}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold">{profile.name}</h3>
                  {profile.isKids && (
                    <span className="px-2 py-0.5 bg-[#E50914] text-[10px] font-bold uppercase rounded">Kids</span>
                  )}
                </div>
                <div className="text-sm text-[#808080] mt-1 flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3" /> {profile.maturityRating || 'All Ratings'}
                  </span>
                  {profile.pinEnabled && (
                    <span className="flex items-center gap-1">
                      <Lock className="w-3 h-3" /> PIN Protected
                    </span>
                  )}
                </div>
              </div>

              <div className="text-[#808080]">
                {editingProfileId === profile.profileId ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </div>

            <AnimatePresence>
              {editingProfileId === profile.profileId && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-[#2A2A2A] bg-[#181818]"
                >
                  <div className="p-8 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-10">
                    {/* Left side: Avatar and Basic Info */}
                    <div className="flex flex-col items-center gap-6">
                      <div className={`w-32 h-32 rounded-lg bg-gradient-to-br ${AVATAR_MAP[localProfileData.avatarId]?.gradient} flex items-center justify-center text-6xl shadow-2xl relative group`}>
                        {AVATAR_MAP[localProfileData.avatarId]?.emoji}
                        <button className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center flex-col gap-1 rounded-lg">
                          <Plus className="w-6 h-6" />
                          <span className="text-[10px] font-bold uppercase">Change</span>
                        </button>
                      </div>
                      
                      <div className="w-full space-y-4">
                        <div>
                          <label className="text-[11px] font-bold text-[#6B6B6B] uppercase tracking-wider mb-2 block">Name</label>
                          <input 
                            type="text" 
                            value={localProfileData.name}
                            onChange={(e) => setLocalProfileData({...localProfileData, name: e.target.value})}
                            className="w-full bg-[#0d0d0d] border border-[#2A2A2A] rounded p-2 text-sm outline-none focus:border-[#E50914] transition-colors"
                          />
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={localProfileData.isKids}
                            onChange={(e) => setLocalProfileData({...localProfileData, isKids: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 bg-[#333] rounded-full relative transition-colors peer-checked:bg-[#E50914] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:w-4 after:h-4 after:rounded-full after:transition-transform peer-checked:after:translate-x-5"></div>
                          <span className="text-sm font-medium group-hover:text-white text-[#B3B3B3]">Kids Profile?</span>
                        </label>
                      </div>
                    </div>

                    {/* Right side: Controls */}
                    <div className="space-y-8">
                      {/* Maturity Rating */}
                      <div className="bg-[#242424] p-5 rounded-lg border border-[#2A2A2A]">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="text-sm font-bold flex items-center gap-2">
                              <Shield className="w-4 h-4 text-[#E50914]" /> Maturity Rating
                            </h4>
                            <p className="text-[12px] text-[#808080] mt-1">Show titles of all maturity ratings for this profile.</p>
                          </div>
                          <span className="px-2 py-1 bg-white/10 rounded text-[10px] font-bold">{localProfileData.maturityRating || 'ALL'}</span>
                        </div>
                        
                        <div className="grid grid-cols-5 gap-2">
                          {['G', 'PG', 'PG-13', 'R', 'TV-MA'].map((rating) => (
                            <button
                              key={rating}
                              onClick={() => setLocalProfileData({...localProfileData, maturityRating: rating})}
                              className={`py-2 rounded text-[11px] font-bold transition-all ${
                                localProfileData.maturityRating === rating 
                                  ? 'bg-[#E50914] text-white shadow-lg scale-105' 
                                  : 'bg-black/40 text-[#555] hover:text-white'
                              }`}
                            >
                              {rating}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Profile PIN */}
                      <div className="bg-[#242424] p-5 rounded-lg border border-[#2A2A2A]">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="text-sm font-bold flex items-center gap-2">
                              <Lock className="w-4 h-4 text-[#E50914]" /> Profile PIN
                            </h4>
                            <p className="text-[12px] text-[#808080] mt-1">Require a 4-digit PIN to access this profile.</p>
                          </div>
                          <button 
                            onClick={() => setLocalProfileData({...localProfileData, pin: localProfileData.pin ? '' : '0000'})}
                            className={`text-[10px] font-bold uppercase tracking-widest ${localProfileData.pin ? 'text-[#ff4444]' : 'text-[#44ffbb]'}`}
                          >
                            {localProfileData.pin ? 'Remove' : 'Add'}
                          </button>
                        </div>
                        
                        {localProfileData.pin !== undefined && localProfileData.pin !== '' && (
                          <div className="flex gap-3">
                            {[0, 1, 2, 3].map((i) => (
                              <input 
                                key={i}
                                type="text"
                                maxLength={1}
                                value={localProfileData.pin[i] || ''}
                                onChange={(e) => {
                                  const newPin = localProfileData.pin.split('');
                                  newPin[i] = e.target.value.replace(/[^0-9]/g, '');
                                  setLocalProfileData({...localProfileData, pin: newPin.join('')});
                                  if (e.target.value && i < 3) {
                                    (e.target.nextSibling as HTMLInputElement)?.focus();
                                  }
                                }}
                                className="w-10 h-12 bg-black text-center text-xl font-bold border border-[#2A2A2A] rounded focus:border-[#E50914] outline-none"
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Language */}
                      <div className="bg-[#242424] p-5 rounded-lg border border-[#2A2A2A]">
                        <h4 className="text-sm font-bold flex items-center gap-2 mb-4">
                          <Globe className="w-4 h-4 text-[#E50914]" /> Display Language
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { name: 'English', code: 'en-US' },
                            { name: 'हिन्दी (Hindi)', code: 'hi-IN' },
                            { name: 'தமிழ் (Tamil)', code: 'ta-IN' },
                            { name: 'తెలుగు (Telugu)', code: 'te-IN' },
                            { name: 'Español', code: 'es-ES' },
                            { name: 'Français', code: 'fr-FR' }
                          ].map((lang) => (
                            <button
                              key={lang.code}
                              onClick={() => setLocalProfileData({...localProfileData, language: lang.code})}
                              className={`py-2 px-4 rounded text-xs font-medium text-left transition-all ${
                                (localProfileData.language || 'en-US') === lang.code 
                                  ? 'bg-[#E50914]/10 border border-[#E50914]/30 text-white' 
                                  : 'bg-black/40 border border-[#2A2A2A] text-[#808080] hover:text-[#ccc]'
                              }`}
                            >
                              {lang.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-4">
                        <button 
                          onClick={() => setEditingProfileId(null)}
                          className="px-6 py-2 rounded text-sm font-bold border border-[#444] hover:border-white transition-all"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={handleSave}
                          disabled={saving}
                          className="px-8 py-2 rounded text-sm font-bold bg-[#E50914] text-white hover:bg-[#f40612] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          Save Profile
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        <button 
          className="w-full py-4 bg-[#1F1F1F] border border-dashed border-[#444] rounded-lg text-[#808080] hover:text-white hover:border-white hover:bg-[#252525] transition-all flex items-center justify-center gap-2 font-bold text-sm"
        >
          <Plus className="w-5 h-5" />
          Add New Profile
        </button>
      </div>
    </div>
  );
};

const AccountPage = () => {
  const { data: session, status } = useSession();
  const { profiles, editProfile, deleteProfile, createProfile } = useProfileContext();
  const [activeTab, setActiveTab] = useState("profiles");
  const [settings, setSettings] = useState<AccountSettings | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loginActivity, setLoginActivity] = useState<LoginActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (session?.user) {
      fetchAccountData();
    } else {
      setSettings(getDefaultSettings(null));
      setLoading(false);
    }
  }, [session, status]);

  const fetchAccountData = async () => {
    try {
      setLoading(true);
      const settingsRes = await fetch('/api/account/settings');
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        if (settingsData.settings) {
          setSettings(settingsData.settings);
        } else {
          setSettings(getDefaultSettings(session));
        }
      } else {
        setSettings(getDefaultSettings(session));
      }

      try {
        const devicesRes = await fetch('/api/account/devices');
        if (devicesRes.ok) {
          const devicesData = await devicesRes.json();
          setDevices(devicesData?.data?.devices || []);
          setLoginActivity(devicesData?.data?.loginActivity || []);
        }
      } catch {}
    } catch (error) {
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

  if (!settings) return null;

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
              onClick={() => setActiveTab("profiles")}
              className={`w-full flex items-center gap-[11px] px-[18px] py-[10px] relative transition-colors text-[13px] ${
                activeTab === "profiles" 
                  ? "text-white font-medium bg-[rgba(229,9,20,0.06)]" 
                  : "text-[#B3B3B3] hover:bg-[#1F1F1F] hover:text-white"
              }`}
            >
              <User className="w-4 h-4 opacity-50" />
              Profiles & Controls
              {activeTab === "profiles" && (
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
          {activeTab === "profiles" && <ProfilesSection profiles={profiles} editProfile={editProfile} />}
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

  const [show2FAModal, setShow2FAModal] = useState(false);
  const [setupStep, setSetupStep] = useState(1);
  const [setupData, setSetupData] = useState<{ secret: string; qrCode: string } | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [loadingSetup, setLoadingSetup] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

  // Start 2FA Setup
  useEffect(() => {
    if (show2FAModal && setupStep === 1 && !setupData) {
      handleStartSetup();
    }
  }, [show2FAModal, setupStep]);

  const handleStartSetup = async () => {
    setLoadingSetup(true);
    try {
      const res = await fetch('/api/account/2fa/setup', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSetupData(data.data);
      } else {
        toast.error('Failed to initiate setup');
        setShow2FAModal(false);
      }
    } catch (err) {
      toast.error('Connection error');
      setShow2FAModal(false);
    } finally {
      setLoadingSetup(false);
    }
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) return;
    setVerifying(true);
    try {
      const res = await fetch('/api/account/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationCode, secret: setupData?.secret })
      });
      const data = await res.json();
      if (data.success) {
        setRecoveryCodes(data.data.recoveryCodes);
        setSetupStep(3);
        toast.success('2FA verified successfully');
      } else {
        toast.error(data.error || 'Invalid code');
      }
    } catch (err) {
      toast.error('Verification failed');
    } finally {
      setVerifying(false);
    }
  };

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
                <div className="text-[13.5px] text-white">2FA Status</div>
                <div className="text-[12px] text-[#B3B3B3] mt-[3px]">
                  {settings.security.twoFactorEnabled ? 'Securely enabled' : 'Disabled'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${settings.security.twoFactorEnabled ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#666]">
                  {settings.security.twoFactorEnabled ? 'On' : 'Off'}
                </span>
              </div>
            </div>
            
            <div className="text-[11.5px] text-[#6B6B6B] mt-[12px] leading-[1.6]">
              Adds a second verification step when signing in from a new device. We recommend using an authenticator app.
            </div>
            
            <div className="flex gap-2 mt-[14px]">
              {settings.security.twoFactorEnabled ? (
                <button 
                  onClick={async () => {
                    if (confirm('Are you sure you want to disable 2FA? Your account will be less secure.')) {
                      try {
                        const res = await fetch('/api/account/2fa/disable', { method: 'POST' });
                        if (res.ok) {
                          toast.success('2FA disabled');
                          // Refresh settings locally
                          window.location.reload(); 
                        }
                      } catch (err) {
                        toast.error('Failed to disable 2FA');
                      }
                    }
                  }}
                  className="px-[14px] py-[6px] bg-transparent text-[#ff5555] border border-[rgba(255,85,85,0.25)] text-[12px] font-medium hover:bg-[rgba(255,85,85,0.07)] transition-all"
                >
                  Disable 2FA
                </button>
              ) : (
                <button 
                  onClick={() => setShow2FAModal(true)}
                  className="px-[14px] py-[6px] bg-[#E50914] text-white text-[12px] font-medium hover:bg-[#f40612] transition-all rounded-[4px] flex items-center gap-2"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Setup Authenticator
                </button>
              )}
            </div>
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

      {/* 2FA Setup Modal */}
      <AnimatePresence>
        {show2FAModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-[#181818] border border-[#2A2A2A] rounded-xl overflow-hidden shadow-2xl"
            >
              {/* Header */}
              <div className="p-6 border-b border-[#2A2A2A] flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold font-['DM_Sans']">2FA Authenticator</h2>
                  <div className="flex gap-1.5 mt-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className={`h-1 rounded-full transition-all duration-300 ${setupStep >= i ? 'w-6 bg-[#E50914]' : 'w-3 bg-[#333]'}`} />
                    ))}
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setShow2FAModal(false);
                    setSetupStep(1);
                    setSetupData(null);
                    setVerificationCode('');
                    if (setupStep === 3) window.location.reload();
                  }}
                  className="p-2 hover:bg-[#252525] rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-8">
                {setupStep === 1 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-[#212121] rounded-lg border border-[#333]">
                      <div className="w-10 h-10 bg-[#E50914]/10 rounded-full flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-[#E50914]" />
                      </div>
                      <p className="text-sm text-[#B3B3B3]">Scan the QR code with your authenticator app (Authy, Google Authenticator, etc.)</p>
                    </div>

                    <div className="flex justify-center flex-col items-center gap-4">
                      {loadingSetup ? (
                        <div className="aspect-square w-48 bg-[#252525] rounded-lg flex items-center justify-center animate-pulse">
                          <Loader2 className="w-8 h-8 animate-spin text-[#E50914]" />
                        </div>
                      ) : (
                        <div className="p-3 bg-white rounded-xl shadow-inner group relative">
                          <img 
                            src={setupData?.qrCode} 
                            alt="QR Code" 
                            className="w-44 h-44 rounded-lg"
                          />
                          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        </div>
                      )}
                      
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-widest mb-2">Can't scan?</p>
                        <button 
                          onClick={() => {
                            if (setupData?.secret) navigator.clipboard.writeText(setupData.secret);
                            toast.success('Secret copied to clipboard');
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 bg-[#252525] border border-[#333] rounded text-[12px] font-medium text-[#B3B3B3] hover:text-white hover:border-[#555] transition-all"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          {setupData?.secret || '••••••••'}
                        </button>
                      </div>
                    </div>

                    <button 
                      onClick={() => setSetupStep(2)}
                      disabled={!setupData}
                      className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-[#e6e6e6] transition-all flex items-center justify-center gap-2 group"
                    >
                      Next Step
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                )}

                {setupStep === 2 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-6 h-6 text-blue-500" />
                      </div>
                      <h3 className="text-lg font-bold mb-2">Verify Connection</h3>
                      <p className="text-sm text-[#B3B3B3]">Enter the 6-digit code from your app to complete setup.</p>
                    </div>

                    <div className="flex justify-center gap-3">
                      <input 
                        type="text"
                        maxLength={6}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="000000"
                        className="w-full h-14 bg-black border-2 border-[#333] rounded-xl text-center text-3xl font-bold tracking-[0.5em] outline-none focus:border-[#E50914] transition-all"
                      />
                    </div>

                    <div className="flex items-center gap-2 px-4 py-3 bg-red-900/10 border border-red-900/20 rounded-lg">
                      <HelpCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <p className="text-[11px] text-[#ff6666]">Don't leave this page until you've verified the code.</p>
                    </div>

                    <div className="flex gap-3">
                      <button 
                        onClick={() => setSetupStep(1)}
                        className="flex-1 py-3 border border-[#333] font-bold rounded-lg hover:bg-[#252525] transition-all"
                      >
                        Back
                      </button>
                      <button 
                        onClick={handleVerify}
                        disabled={verificationCode.length !== 6 || verifying}
                        className="flex-[2] py-3 bg-[#E50914] text-white font-bold rounded-lg hover:bg-[#f40612] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                      >
                        {verifying ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                        Verify & Enable
                      </button>
                    </div>
                  </div>
                )}

                {setupStep === 3 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Setup Complete!</h3>
                      <p className="text-sm text-[#B3B3B3]">Two-factor authentication is now active.</p>
                    </div>

                    <div className="bg-[#1a1a1a] border border-[#2A2A2A] rounded-xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[11px] font-bold text-[#6B6B6B] uppercase tracking-wider">Recovery Codes</h4>
                        <button className="text-[10px] font-bold text-blue-400 flex items-center gap-1">
                          <Download className="w-3 h-3" /> Save JSON
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {recoveryCodes.map((code, idx) => (
                          <div key={idx} className="bg-black/50 border border-[#333] rounded px-3 py-2 text-[13px] font-mono text-center select-all">
                            {code}
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-[#6B6B6B] leading-relaxed">
                        Store these safely! You can use them to access your account if you lose your phone.
                      </p>
                    </div>

                    <button 
                      onClick={() => {
                        setShow2FAModal(false);
                        window.location.reload();
                      }}
                      className="w-full py-4 bg-white text-black font-bold rounded-lg hover:bg-[#e6e6e6] transition-all"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
  const [helpMode, setHelpMode] = useState<'faq' | 'contact' | 'history'>('faq');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  
  const [ticketForm, setTicketForm] = useState({ topic: 'Playback Issues', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);

  const fetchTickets = async () => {
    setIsLoadingTickets(true);
    try {
      const res = await fetch('/api/support/tickets');
      const data = await res.json();
      if (data.success) setTickets(data.tickets);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  useEffect(() => {
    if (helpMode === 'history') {
      fetchTickets();
    }
  }, [helpMode]);

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketForm.subject.trim() || !ticketForm.message.trim()) {
      toast.error('Please enter a subject and message');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketForm)
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Ticket submitted successfully');
        setTicketForm({ topic: 'Playback Issues', subject: '', message: '' });
        setHelpMode('history');
      } else {
        toast.error(data.error || 'Failed to submit ticket');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = [
    { title: 'Getting Started', description: 'Learn the basics of MovieFlix', content: 'Welcome to MovieFlix! To start watching, simply browse our catalog on the home page or try our Search feature. You can create different profiles for your family members and customize subtitle preferences in the video player.' },
    { title: 'Account & Billing', description: 'Manage your subscription and account', content: 'You can update your payment methods and view your billing history using the Billing tab in your Account settings. MovieFlix automatically charges your card on the same date each month.' },
    { title: 'Troubleshooting', description: 'Fix common playback and app issues', content: 'If a video is buffering excessively, try checking your network connection. Most smart TVs and devices run smoother if you restart the MovieFlix app and clear the cache.' },
    { title: 'Safety & Privacy', description: 'Understand your privacy and security', content: 'We securely hash all passwords and utilize standard encryption for payment. If you notice unusual activity, head to the Security tab and tap "Sign Out Everywhere" immediately.' }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[24px] font-semibold tracking-[-0.3px] mb-1">Help Center</h1>
          <p className="text-[13px] text-[#B3B3B3]">Find answers to common questions and get support</p>
        </div>
        
        <div className="flex bg-[#1F1F1F] rounded-[24px] p-1 border border-[#2A2A2A]">
          <button 
            onClick={() => setHelpMode('faq')}
            className={`px-[16px] py-[6px] rounded-[20px] text-[12px] font-medium transition-colors ${helpMode === 'faq' ? 'bg-[#333] text-white' : 'text-[#888] hover:text-white'}`}
          >
            FAQs
          </button>
          <button 
            onClick={() => setHelpMode('contact')}
            className={`px-[16px] py-[6px] rounded-[20px] text-[12px] font-medium transition-colors ${helpMode === 'contact' ? 'bg-[#333] text-white' : 'text-[#888] hover:text-white'}`}
          >
            Contact
          </button>
          <button 
            onClick={() => setHelpMode('history')}
            className={`px-[16px] py-[6px] rounded-[20px] text-[12px] font-medium transition-colors ${helpMode === 'history' ? 'bg-[#333] text-white' : 'text-[#888] hover:text-white'}`}
          >
            My Tickets
          </button>
        </div>
      </div>

      {helpMode === 'faq' && (
        <div className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-[6px]">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-[#2A2A2A] last:border-b-0">
              <div 
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                className="flex items-center justify-between px-[22px] py-[16px] cursor-pointer hover:bg-[#252525] transition-colors"
              >
                <div>
                  <div className="text-[14px] text-white font-medium mb-[2px]">{faq.title}</div>
                  <div className="text-[12px] text-[#888]">{faq.description}</div>
                </div>
                <ChevronRight className={`w-[16px] h-[16px] text-[#888] transition-transform ${expandedFaq === index ? 'rotate-90' : ''}`} />
              </div>
              
              {expandedFaq === index && (
                <div className="px-[22px] pb-[18px] text-[13px] text-[#ccc] leading-[1.6]">
                  {faq.content}
                </div>
              )}
            </div>
          ))}
          
          <div 
            onClick={() => setHelpMode('contact')}
            className="flex items-center justify-between px-[22px] py-[18px] bg-[rgba(229,9,20,0.05)] cursor-pointer hover:bg-[rgba(229,9,20,0.08)] transition-colors rounded-b-[6px]"
          >
            <div>
              <div className="text-[14px] text-[#E50914] font-medium mb-[2px]">Still need help?</div>
              <div className="text-[12px] text-[#B3B3B3]">Contact our support team directly.</div>
            </div>
            <ArrowRight className="w-[16px] h-[16px] text-[#E50914]" />
          </div>
        </div>
      )}

      {helpMode === 'contact' && (
        <div className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-[6px] p-[24px]">
          <h2 className="text-[16px] font-semibold mb-[20px]">Submit a Ticket</h2>
          <form onSubmit={handleTicketSubmit}>
            <div className="mb-[16px]">
              <label className="text-[10px] font-semibold tracking-[1.5px] text-[#6B6B6B] uppercase mb-[7px] block">Topic</label>
              <select 
                value={ticketForm.topic}
                onChange={e => setTicketForm({...ticketForm, topic: e.target.value})}
                className="w-full bg-[#0d0d0d] border border-[#2A2A2A] rounded-[4px] text-white font-['DM_Sans'] text-[13px] p-[10px] outline-none transition-colors focus:border-[#555]"
              >
                <option>Playback Issues</option>
                <option>Account & Billing</option>
                <option>Feature Request</option>
                <option>Privacy & Security</option>
                <option>Other</option>
              </select>
            </div>
            <div className="mb-[16px]">
              <label className="text-[10px] font-semibold tracking-[1.5px] text-[#6B6B6B] uppercase mb-[7px] block">Subject</label>
              <input 
                value={ticketForm.subject}
                onChange={e => setTicketForm({...ticketForm, subject: e.target.value})}
                type="text" 
                placeholder="Brief summary of your issue"
                className="w-full bg-[#0d0d0d] border border-[#2A2A2A] rounded-[4px] text-white font-['DM_Sans'] text-[13px] p-[10px] outline-none transition-colors focus:border-[#555]"
              />
            </div>
            <div className="mb-[24px]">
              <label className="text-[10px] font-semibold tracking-[1.5px] text-[#6B6B6B] uppercase mb-[7px] block">Message</label>
              <textarea 
                value={ticketForm.message}
                onChange={e => setTicketForm({...ticketForm, message: e.target.value})}
                placeholder="Please provide details..."
                rows={5}
                className="w-full bg-[#0d0d0d] border border-[#2A2A2A] rounded-[4px] text-white font-['DM_Sans'] text-[13px] p-[10px] outline-none transition-colors focus:border-[#555] resize-y"
              />
            </div>
            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-[24px] py-[10px] bg-[#E50914] text-white font-medium text-[13px] rounded-[4px] hover:bg-[#f40612] transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </div>
          </form>
        </div>
      )}

      {helpMode === 'history' && (
        <div className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-[6px] p-[24px]">
          <h2 className="text-[16px] font-semibold mb-[20px]">My Tickets</h2>
          
          {isLoadingTickets ? (
            <div className="text-center py-8 text-[#888] text-[13px]">Loading tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-[40px]">
              <div className="w-[48px] h-[48px] rounded-full bg-[#2A2A2A] flex items-center justify-center mx-auto mb-[16px]">
                <Settings className="w-[20px] h-[20px] text-[#888]" />
              </div>
              <div className="text-[14px] text-white font-medium mb-[4px]">No tickets found</div>
              <div className="text-[12px] text-[#888] mb-[20px]">You haven't submitted any support requests yet.</div>
              <button 
                onClick={() => setHelpMode('contact')}
                className="px-[16px] py-[8px] bg-transparent border border-[#3A3A3A] text-white text-[12px] font-medium rounded-[4px] hover:bg-[#252525] transition-colors"
              >
                Open a Ticket
              </button>
            </div>
          ) : (
            <div className="space-y-[12px]">
              {tickets.map((ticket) => (
                <div key={ticket._id} className="p-[16px] bg-[#0d0d0d] border border-[#2A2A2A] rounded-[6px]">
                  <div className="flex items-start justify-between mb-[8px]">
                    <div>
                      <div className="text-[14px] text-white font-medium">{ticket.subject}</div>
                      <div className="text-[11px] text-[#6B6B6B] mt-[2px] uppercase tracking-[0.5px]">ID: {ticket._id.slice(-6)} • {new Date(ticket.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className={`px-[8px] py-[3px] rounded-[4px] text-[10px] font-bold uppercase tracking-[1px] ${
                      ticket.status === 'Open' ? 'bg-[rgba(229,9,20,0.15)] text-[#E50914]' : 
                      ticket.status === 'Resolved' ? 'bg-[rgba(34,197,94,0.15)] text-[#22c55e]' : 
                      'bg-[#2A2A2A] text-[#B3B3B3]'
                    }`}>
                      {ticket.status}
                    </div>
                  </div>
                  <div className="text-[12.5px] text-[#ccc] line-clamp-2 leading-[1.5]">
                    {ticket.message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};


export default AccountPage;
