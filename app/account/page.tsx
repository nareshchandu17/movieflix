"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Loader2,
  Mail,
  Lock,
  Smartphone,
  CreditCard,
  Activity,
  LogOut,
  Calendar,
  Gift,
  ShoppingBag,
  Shield,
  Star as StarIcon,
  Users,
  HelpCircle,
  MessageSquare,
  FileText,
  Lock as PrivacyIcon,
  ChevronRight,
  Check,
  X,
  Video,
  Monitor as ResolutionIcon,
  Monitor,
  Eye,
  EyeOff,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useProfileContext } from "@/contexts/ProfileContext";
import { AVATAR_MAP } from "@/lib/avatars";
import { toast } from "sonner";
import { 
  AccountCard, 
  MembershipRow, 
  PlanTierCard, 
  SecurityActionCard, 
  ProfileDetailTile, 
  AddProfileCard 
} from "@/components/account/AccountCards";
import { PLANS, getPlanById } from "@/types/payment";

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
  security: {
    twoFactorEnabled: boolean;
    lastPasswordChange: string;
    loginAlerts: boolean;
  };
}

interface Subscription {
  planId: string;
  status: string;
  currentPeriodEnd: string;
  billingCycle: string;
}

const AccountPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { profiles, activeProfile } = useProfileContext();
  const [settings, setSettings] = useState<AccountSettings | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [securityData, setSecurityData] = useState<{
    devices: any[];
    loginActivity: any[];
    stats: any;
  } | null>(null);
  const [securityLoading, setSecurityLoading] = useState(false);
  
  // Modal states
  const [modalType, setModalType] = useState<string | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  
  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    phone: "",
    cardNumber: "",
    expiry: "",
    cvv: ""
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (session?.user) {
      fetchAccountData();
    } else {
      setLoading(false);
    }
  }, [session, status]);

  const fetchAccountData = async () => {
    try {
      setLoading(true);
      const settingsRes = await fetch('/api/account/settings');
      if (settingsRes.ok) {
        const data = await settingsRes.json();
        if (data.settings) {
          setSettings(data.settings);
          setSubscription(data.subscription);
          setFormData(prev => ({
            ...prev,
            email: data.settings.profile.email,
            phone: data.settings.profile.phone || ""
          }));
        }
      }
    } catch (error) {
      toast.error("Failed to load account data");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (type: string) => {
    setIsSubmitting(true);
    try {
      let res;
      if (type === 'email') {
        res = await fetch('/api/account/email', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentPassword: formData.currentPassword, newEmail: formData.email })
        });
      } else if (type === 'password') {
        if (formData.newPassword !== formData.confirmPassword) {
           toast.error("Passwords do not match");
           setIsSubmitting(false);
           return;
        }
        res = await fetch('/api/account/password', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentPassword: formData.currentPassword, newPassword: formData.newPassword })
        });
      } else if (type === 'phone') {
        res = await fetch('/api/account/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 'profile.phone': formData.phone })
        });
      } else if (type === 'payment') {
        // Mock success for payment
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success("Payment method updated (Mock)");
        setModalType(null);
        setIsSubmitting(false);
        return;
      }

      const data = await res?.json();
      if (data.success) {
        toast.success(data.message || "Updated successfully");
        setModalType(null);
        fetchAccountData();
      } else {
        toast.error(data.error || "Update failed");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchSecurityData = async () => {
    try {
      setSecurityLoading(true);
      const res = await fetch('/api/account/devices');
      if (res.ok) {
        const data = await res.json();
        setSecurityData(data.data);
      }
    } catch (error) {
      toast.error("Failed to load security data");
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleRemoveDevice = async (deviceId: string) => {
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/account/devices', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId })
      });
      if (res.ok) {
        toast.success("Device removed");
        fetchSecurityData();
      }
    } catch (error) {
      toast.error("Failed to remove device");
    } finally {
      setIsSubmitting(false);
    }
  };

  const signOutAllDevices = async () => {
    if (!confirm("Are you sure you want to sign out of all devices? This will include current session if implemented strictly.")) return;
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/account/signout-all', { method: 'DELETE' });
      if (res.ok) {
        toast.success('Signed out from all devices');
        fetchAccountData();
        setModalType(null);
      }
    } catch (error) {
      toast.error('Action failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProfileModal = (action: string, profileId: string) => {
    setSelectedProfileId(profileId);
    setModalType(action);
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#E50914] animate-spin" />
      </div>
    );
  }

  if (!settings) return null;

  const currentPlan = getPlanById(subscription?.planId as any || "premium");
  const activeProfileInModal = profiles.find(p => p.profileId === selectedProfileId);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e6e6e6] font-['DM_Sans'] pt-[100px] pb-[100px]">
      <div className="max-w-[1400px] mx-auto px-2">
        
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-[42px] font-black text-white tracking-tight">Account</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-[#1a1a1a] rounded-full border border-[#222]">
              <Calendar className="w-4 h-4 text-red-600" />
              <span className="text-[12px] text-[#808080] font-bold uppercase tracking-widest">Member since April 2024</span>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          
          {/* MEMBERSHIP & BILLING */}
          <AccountCard title="Membership & Billing" icon={CreditCard}>
            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-12">
              <div className="space-y-2">
                <MembershipRow 
                  icon={Mail} 
                  label="Email" 
                  value={settings.profile.email} 
                  actionLabel="Change email" 
                  onClick={() => setModalType("change_email")} 
                />
                <MembershipRow 
                  icon={Lock} 
                  label="Password" 
                  value="••••••••••••" 
                  actionLabel="Change password" 
                  onClick={() => setModalType("change_password")} 
                />
                <MembershipRow 
                  icon={Smartphone} 
                  label="Phone" 
                  value={settings.profile.phone || "Not provided"} 
                  actionLabel={settings.profile.phone ? "Change phone" : "Add phone number"} 
                  onClick={() => setModalType("change_phone")} 
                />
                <MembershipRow 
                  icon={CreditCard} 
                  label="Payment method" 
                  value="•••• •••• •••• 4242" 
                  actionLabel="Manage payment info" 
                  onClick={() => setModalType("change_payment")} 
                />
                
                <div className="flex flex-wrap items-center gap-y-4 justify-between pt-6 mt-4 border-t border-[#222]">
                   <div className="flex flex-wrap items-center gap-8">
                      <div className="flex items-center gap-2 text-[13px] text-[#808080]">
                         <Calendar className="w-4 h-4" />
                         <span>Next billing date: {subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : "Dec 15, 2024"}</span>
                      </div>
                      <button className="flex items-center gap-2 text-[13px] text-[#808080] hover:text-white transition-colors">
                         <Gift className="w-4 h-4" />
                         <span>Redeem gift card or promo code</span>
                      </button>
                      <button className="flex items-center gap-2 text-[13px] text-[#808080] hover:text-white transition-colors">
                         <ShoppingBag className="w-4 h-4" />
                         <span>Where to buy gift cards</span>
                      </button>
                   </div>
                </div>
              </div>

              <div className="bg-[#0a0a0a] rounded-2xl p-8 border border-[#222] shadow-inner relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-[80px] group-hover:bg-red-600/10 transition-colors" />
                <div className="relative z-10">
                  <div className="text-[12px] font-black text-red-600 uppercase tracking-[3px] mb-2 font-mono">Membership</div>
                  <div className="text-[32px] font-black text-white mb-6 tracking-tighter">{currentPlan.name}</div>
                  
                  <button className="w-full py-3 border-2 border-red-600/40 text-white font-bold rounded-lg hover:bg-red-600/10 hover:border-red-600 transition-all mb-8 text-[14px]">
                    Cancel Membership
                  </button>

                  <ul className="space-y-4">
                    {[
                      `${currentPlan.features.resolution} (${currentPlan.id === 'premium' ? '4K' : 'HD'})`,
                      `Watch on ${currentPlan.features.simultaneousStreams} devices`,
                      `Download on ${currentPlan.features.downloadDevices} devices`,
                      currentPlan.features.dolbyAtmos ? "Dolby Atmos" : "Standard Audio",
                      currentPlan.features.adFree ? "No ads" : "With Ads"
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-[14px] text-[#808080] font-medium">
                        <Check className="w-5 h-5 text-red-600 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </AccountCard>

          {/* PLAN DETAILS */}
          <AccountCard title="Plan Details" icon={StarIcon}>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 flex gap-4 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
                {PLANS.map((plan) => (
                  <PlanTierCard 
                    key={plan.id}
                    id={plan.id}
                    name={plan.name}
                    resolution={plan.features.resolution}
                    devices={plan.features.simultaneousStreams}
                    isActive={(subscription?.planId || "premium") === plan.id}
                    onClick={() => toast.info(`Switching to ${plan.name} coming soon`)}
                  />
                ))}
              </div>
              <div className="md:w-[320px]">
                 <div className="h-full bg-[#1a1a1a] p-5 rounded-xl border border-[#333] flex items-center justify-between group cursor-pointer hover:border-red-600/50 transition-all">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-lg bg-[#222] flex items-center justify-center text-red-600">
                          <StarIcon className="w-6 h-6" />
                       </div>
                       <div>
                          <div className="text-[15px] font-bold text-white">Change or upgrade your plan</div>
                          <div className="text-[12px] text-[#808080]">Enjoy more features and better quality</div>
                       </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#808080] group-hover:text-white transition-colors" />
                 </div>
              </div>
            </div>
          </AccountCard>

          {/* SECURITY & PRIVACY */}
          <AccountCard title="Security & Privacy" icon={Shield}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SecurityActionCard 
                icon={Monitor} 
                title="Manage devices" 
                desc={`${securityData?.stats?.activeDevices || 0} registered devices`}
                actionLabel="Manage"
                onClick={() => {
                  setModalType("manage_devices");
                  fetchSecurityData();
                }}
              />
              <SecurityActionCard 
                icon={Activity} 
                title="Recent device activity" 
                desc="See where you've signed in" 
                actionLabel="View activity"
                onClick={() => {
                  setModalType("recent_activity");
                  fetchSecurityData();
                }}
              />
              <SecurityActionCard 
                icon={LogOut} 
                title="Sign out of all devices" 
                desc="Sign out from all devices" 
                actionLabel="Sign out"
                onClick={signOutAllDevices}
              />
            </div>
          </AccountCard>

          {/* PROFILES & PARENTAL CONTROLS */}
          <AccountCard title="Profiles & Parental Controls" icon={Users}>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {profiles.map((profile) => (
                  <ProfileDetailTile 
                    key={profile.profileId}
                    profile={profile}
                    avatar={AVATAR_MAP[profile.avatarId] || AVATAR_MAP['1']}
                    isCurrent={activeProfile?.profileId === profile.profileId}
                    onAction={(action) => handleProfileModal(action, profile.profileId)}
                  />
                ))}
                <AddProfileCard onClick={() => router.push("/profiles/create")} />
             </div>
          </AccountCard>

          {/* FOOTER */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 pt-12 border-t border-[#222]">
            <button className="flex items-center gap-3 text-[#808080] hover:text-white transition-colors group">
               <HelpCircle className="w-5 h-5 group-hover:text-red-600" />
               <span className="text-[14px] font-bold">Help Center</span>
            </button>
            <button className="flex items-center gap-3 text-[#808080] hover:text-white transition-colors group">
               <MessageSquare className="w-5 h-5 group-hover:text-red-600" />
               <span className="text-[14px] font-bold">Contact Support</span>
            </button>
            <button className="flex items-center gap-3 text-[#808080] hover:text-white transition-colors group">
               <FileText className="w-5 h-5 group-hover:text-red-600" />
               <span className="text-[14px] font-bold capitalize">Personal info</span>
            </button>
            <button className="flex items-center gap-3 text-[#808080] hover:text-white transition-colors group">
               <PrivacyIcon className="w-5 h-5 group-hover:text-red-600" />
               <span className="text-[14px] font-bold">Privacy Policy</span>
            </button>
            <button className="flex items-center gap-3 text-[#808080] hover:text-white transition-colors group">
               <FileText className="w-5 h-5 group-hover:text-red-600" />
               <span className="text-[14px] font-bold">Terms of Use</span>
            </button>
          </div>

        </div>
      </div>

      {/* MODAL SYSTEM */}
      <AnimatePresence>
        {modalType && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-[#141414] rounded-2xl border border-[#333] shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-[#222] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-[#222] flex items-center justify-center text-xl text-red-600`}>
                    {modalType.includes('email') ? <Mail className="w-5 h-5" /> : 
                     modalType.includes('password') ? <Lock className="w-5 h-5" /> : 
                     modalType.includes('phone') ? <Smartphone className="w-5 h-5" /> : 
                     modalType === 'manage_devices' ? <Monitor className="w-5 h-5" /> :
                     modalType === 'recent_activity' ? <Activity className="w-5 h-5" /> :
                     <CreditCard className="w-5 h-5" />}
                  </div>
                  <h3 className="text-[20px] font-bold text-white capitalize">{modalType.replace('change_', '').replace('_', ' ')}</h3>
                </div>
                <button onClick={() => setModalType(null)} className="p-2 hover:bg-[#222] rounded-full transition-colors text-[#808080] hover:text-white">
                  <X className="w-5 h-5" />
                </button>
                          {modalType === 'change_email' && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                       <div className="space-y-1.5">
                          <label className="text-[12px] font-bold text-[#808080] uppercase tracking-wider">New Email Address</label>
                          <input 
                            type="email" 
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-red-600 outline-none transition-all"
                            placeholder="new@example.com"
                          />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[12px] font-bold text-[#808080] uppercase tracking-wider">Current Password</label>
                          <div className="relative">
                            <input 
                              type={showPassword ? "text" : "password"}
                              value={formData.currentPassword}
                              onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-red-600 outline-none transition-all pr-12"
                              placeholder="Required for security"
                            />
                            <button 
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#808080] hover:text-white"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                       </div>
                    </div>
                    <button 
                      onClick={() => handleAction('email')}
                      disabled={isSubmitting}
                      className="w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Email"}
                    </button>
                  </div>
                )}

                {modalType === 'change_password' && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                       <div className="space-y-1.5">
                          <label className="text-[12px] font-bold text-[#808080] uppercase tracking-wider">Current Password</label>
                          <input 
                            type="password" 
                            value={formData.currentPassword}
                            onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                            className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-red-600 outline-none transition-all"
                          />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[12px] font-bold text-[#808080] uppercase tracking-wider">New Password</label>
                          <input 
                            type="password" 
                            value={formData.newPassword}
                            onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                            className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-red-600 outline-none transition-all"
                          />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[12px] font-bold text-[#808080] uppercase tracking-wider">Confirm New Password</label>
                          <input 
                            type="password" 
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                            className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-red-600 outline-none transition-all"
                          />
                       </div>
                    </div>
                    <button 
                      onClick={() => handleAction('password')}
                      disabled={isSubmitting}
                      className="w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
                    </button>
                  </div>
                )}

                {modalType === 'change_phone' && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                       <div className="space-y-1.5">
                          <label className="text-[12px] font-bold text-[#808080] uppercase tracking-wider">Phone Number</label>
                          <div className="flex gap-2">
                             <div className="flex-[0.3] bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-[#555] font-bold">+91</div>
                             <input 
                               type="tel" 
                               value={formData.phone}
                               onChange={(e) => setFormData({...formData, phone: e.target.value})}
                               className="flex-1 bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-red-600 outline-none transition-all"
                               placeholder="9876543210"
                             />
                          </div>
                       </div>
                    </div>
                    <button 
                      onClick={() => handleAction('phone')}
                      disabled={isSubmitting}
                      className="w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Phone Number"}
                    </button>
                  </div>
                )}

                {modalType === 'change_payment' && (
                  <div className="space-y-6">
                    <div className="p-6 bg-gradient-to-br from-[#222] to-[#111] rounded-xl border border-[#333] relative overflow-hidden">
                       <div className="absolute top-4 right-4 text-white/20 font-black italic text-2xl">VISA</div>
                       <div className="space-y-6 relative z-10">
                          <div className="space-y-1">
                             <label className="text-[10px] text-[#808080] uppercase tracking-widest">Card Number</label>
                             <input 
                               type="text"
                               placeholder="0000 0000 0000 0000"
                               className="w-full bg-transparent border-b border-white/10 py-1 text-white font-mono tracking-widest outline-none focus:border-red-600"
                             />
                          </div>
                          <div className="flex gap-8">
                             <div className="space-y-1">
                                <label className="text-[10px] text-[#808080] uppercase tracking-widest">Expiry</label>
                                <input 
                                  type="text"
                                  placeholder="MM/YY"
                                  className="w-20 bg-transparent border-b border-white/10 py-1 text-white font-mono outline-none focus:border-red-600"
                                />
                             </div>
                             <div className="space-y-1">
                                <label className="text-[10px] text-[#808080] uppercase tracking-widest">CVV</label>
                                <input 
                                  type="password"
                                  placeholder="***"
                                  className="w-12 bg-transparent border-b border-white/10 py-1 text-white font-mono outline-none focus:border-red-600"
                                />
                             </div>
                          </div>
                       </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-[#1a1a1a] rounded-lg border border-[#222]">
                       <Shield className="w-5 h-5 text-green-500 shrink-0" />
                       <div className="text-[12px] text-[#808080]">Your payment information is encrypted and securely stored.</div>
                    </div>
                    <button 
                      onClick={() => handleAction('payment')}
                      disabled={isSubmitting}
                      className="w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Payment Method"}
                    </button>
                  </div>
                )}

                {modalType === 'manage_devices' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-xl border border-[#333]">
                      <div>
                        <div className="text-[14px] font-bold text-white">Device Status</div>
                        <div className="text-[12px] text-[#808080]">{securityData?.stats?.activeDevices || 0} of {securityData?.stats?.deviceLimit || 5} slots used</div>
                      </div>
                      <div className="text-[12px] font-bold text-red-600 bg-red-600/10 px-3 py-1 rounded-full uppercase tracking-wider">
                        {securityData?.stats?.downloadSlots || "0 / 0"} Downloads
                      </div>
                    </div>

                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-none">
                      {securityLoading ? (
                        <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-red-600" /></div>
                      ) : securityData?.devices?.length ? securityData.devices.map((device: any) => (
                        <div key={device._id} className="p-4 rounded-xl border border-[#222] bg-[#0d0d0d] hover:border-[#333] transition-all flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${device.isActive ? 'bg-red-600/10 text-red-600' : 'bg-[#222] text-[#555]'}`}>
                              <Monitor className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[15px]">{device.name}</span>
                                {device.isCurrent && <span className="text-[10px] bg-white/10 text-[#808080] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Current</span>}
                              </div>
                              <div className="text-[12px] text-[#808080] flex items-center gap-3">
                                <span>{device.platform} • {device.browser}</span>
                                <span>{device.lastActive ? new Date(device.lastActive).toLocaleDateString() : 'Active now'}</span>
                              </div>
                            </div>
                          </div>
                          {!device.isCurrent && (
                            <button 
                              disabled={isSubmitting}
                              onClick={() => handleRemoveDevice(device._id)}
                              className="p-2 text-[#555] hover:text-red-600 hover:bg-red-600/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            >
                              <LogOut className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      )) : (
                        <div className="py-12 text-center text-[#555]">No other active devices found.</div>
                      )}
                    </div>
                  </div>
                )}

                {modalType === 'recent_activity' && (
                  <div className="space-y-6">
                    <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 scrollbar-none">
                      {securityLoading ? (
                        <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-red-600" /></div>
                      ) : securityData?.loginActivity?.length ? securityData.loginActivity.map((activity: any) => (
                        <div key={activity._id} className="p-4 rounded-xl border border-[#222] bg-[#0d0d0d] hover:border-[#333] transition-all">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${activity.isActive ? 'bg-green-500' : 'bg-[#555]'}`} />
                              <span className="text-[14px] font-bold">{new Date(activity.loginTime).toLocaleString()}</span>
                            </div>
                            <span className="text-[11px] font-mono text-[#555]">{activity.ipAddress}</span>
                          </div>
                          <div className="flex items-center justify-between text-[12px] text-[#808080]">
                            <div className="flex items-center gap-2">
                              <Smartphone className="w-3.5 h-3.5" />
                              <span>{activity.platform} • {activity.browser}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Shield className="w-3.5 h-3.5" />
                              <span>{activity.location}</span>
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="py-12 text-center text-[#555]">No recent activity found.</div>
                      )}
                    </div>
                    <p className="text-[11px] text-[#555] text-center italic">Activity is tracked for your security. Contact support if you see unrecognized sign-ins.</p>
                  </div>
                )}
              </div>

              <div className="p-6 bg-[#0a0a0a] border-t border-[#222] flex justify-end">
                 <button onClick={() => setModalType(null)} className="px-6 py-2 bg-white text-black font-bold rounded hover:bg-white/90 transition-colors">Done</button>
              </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccountPage;
