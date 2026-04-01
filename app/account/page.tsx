"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Crown, CreditCard, Calendar, Settings, LogOut, Check, AlertCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useProfile } from '@/contexts/ProfileContext';

interface Subscription {
  _id: string;
  plan: string;
  status: string;
  startDate: string;
  endDate?: string;
  autoRenew: boolean;
}

export default function AccountPage() {
  const router = useRouter();
  const { currentProfile, profiles, switchProfile } = useProfile();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/access/check');
      const data = await response.json();
      
      if (data.success && data.access.hasAccess) {
        setSubscription(data.access);
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: subscription._id })
      });

      if (response.ok) {
        setSubscription(null);
      }
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-500';
      case 'CANCELLED':
        return 'text-red-500';
      case 'EXPIRED':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Check className="w-5 h-5" />;
      case 'CANCELLED':
        return <AlertCircle className="w-5 h-5" />;
      case 'EXPIRED':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent animate-spin rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Loading account information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">My Account</h1>
            <Button
              onClick={() => router.push('/settings')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </div>

          {/* Current Profile Section */}
          {currentProfile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900 rounded-2xl p-6 mb-8 border border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${
                    currentProfile.isKids ? 'border-green-500' : 'border-blue-500'
                  }`}>
                    <img
                      src={currentProfile.avatar === 'default.png' ? '/default-avatar.png' : currentProfile.avatar}
                      alt={currentProfile.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-400" />
                      {currentProfile.name}
                    </h2>
                    <p className="text-gray-400">
                      {currentProfile.isKids ? 'Kids Profile' : 'Regular Profile'} • 
                      Maturity: {currentProfile.maturityLevel}
                    </p>
                  </div>
                </div>
                
                {profiles.length > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => router.push('/select-profile')}
                    className="flex items-center gap-2"
                  >
                    Switch Profile
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {subscription ? (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-2xl p-8 mb-8 border border-blue-500/30"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                    <Crown className="w-6 h-6 text-yellow-500" />
                    {subscription.plan} Plan
                  </h2>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(subscription.status)}
                    <span className={`ml-2 ${getStatusColor(subscription.status)}`}>
                      {subscription.status}
                    </span>
                  </div>
                </div>
                
                <Button
                  onClick={handleCancelSubscription}
                  variant="outline"
                  className="text-red-500 hover:text-red-400 border-red-500 hover:bg-red-500/10"
                >
                  Cancel Subscription
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-400 mb-1">Start Date</p>
                  <p className="text-lg font-semibold">
                    {new Date(subscription.startDate).toLocaleDateString()}
                  </p>
                </div>
                
                {subscription.endDate && (
                  <div>
                    <p className="text-gray-400 mb-1">End Date</p>
                    <p className="text-lg font-semibold">
                      {new Date(subscription.endDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <p className="text-gray-400 mb-1">Auto-Renewal</p>
                <p className="text-lg font-semibold">
                  {subscription.autoRenew ? 'Enabled' : 'Disabled'}
                </p>
              </div>

            <div className="mt-6 pt-6 border-t border-gray-700">
              <p className="text-sm text-gray-400">
                {subscription.autoRenew 
                  ? 'Your subscription will automatically renew at the end of the billing period.'
                  : 'Your subscription will expire at the end of the billing period. You can renew anytime from the pricing page.'
                }
              </p>
            </div>
          </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-900 rounded-2xl p-8 mb-8 border border-gray-700 text-center"
            >
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-gray-500" />
              </div>
              
              <h3 className="text-xl font-bold mb-4">No Active Subscription</h3>
              <p className="text-gray-400 mb-6">
                You don&apos;t have an active subscription. Upgrade to Premium to unlock all features.
              </p>
              
              <Button
                onClick={() => router.push('/pricing')}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Premium
              </Button>
            </motion.div>
          )}

          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-gray-900 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <Link href="/my-list" className="block">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold">📚</span>
                  </div>
                  <h3 className="font-semibold mb-1">My List</h3>
                  <p className="text-sm text-gray-400">View your watchlist</p>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gray-900 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <Link href="/watch-party" className="block">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold">🎉</span>
                  </div>
                  <h3 className="font-semibold mb-1">Watch Party</h3>
                  <p className="text-sm text-gray-400">Host movie nights</p>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-gray-900 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <Link href="/taste-dna" className="block">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold">🧬</span>
                  </div>
                  <h3 className="font-semibold mb-1">Taste DNA</h3>
                  <p className="text-sm text-gray-400">AI recommendations</p>
                </div>
              </Link>
            </motion.div>
          </div>

          {subscription && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-gray-900 rounded-2xl p-8 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Billing History</h3>
                <Button variant="outline" className="text-sm">
                  <CreditCard className="w-4 h-4 mr-2" />
                  View All
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-semibold">Premium Plan</p>
                    <p className="text-sm text-gray-400">Monthly subscription</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">₹499</p>
                    <p className="text-sm text-green-500">Active</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-semibold">Next Billing Date</p>
                    <p className="text-sm text-gray-400">Auto-renewal</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-center"
          >
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="text-red-500 hover:text-red-400 border-red-500 hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
