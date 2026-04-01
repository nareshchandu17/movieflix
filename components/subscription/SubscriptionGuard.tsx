"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Crown, Lock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  feature?: string;
  fallback?: React.ReactNode;
}

const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ 
  children, 
  feature, 
  fallback 
}) => {
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    checkAccess();
  }, [feature]);

  const checkAccess = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/access/check');
      const data = await response.json();
      
      if (data.success) {
        setHasAccess(data.access.hasAccess);
        
        // Check if specific feature is allowed
        if (feature && data.access.allowedFeatures) {
          const featureAllowed = data.access.allowedFeatures.includes(feature);
          setHasAccess(featureAllowed);
        }
      } else {
        setHasAccess(false);
      }
    } catch (error) {
      console.error('Access check failed:', error);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent animate-spin rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Checking access...</p>
        </div>
      </div>
    );
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  // Show upgrade prompt
  const UpgradePrompt = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-900 rounded-2xl p-8 max-w-md mx-4 border border-gray-700"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Crown className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold mb-4">Premium Feature</h2>
          <p className="text-gray-400 mb-6">
            {feature ? `This feature requires a Premium subscription to access ${feature}.` : 'Upgrade to Premium to unlock all features.'}
          </p>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <Lock className="w-4 h-4" />
              <span>Unlimited movies & TV shows</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <Lock className="w-4 h-4" />
              <span>Ad-free streaming</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <Lock className="w-4 h-4" />
              <span>Watch parties with friends</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <Lock className="w-4 h-4" />
              <span>AI-powered recommendations</span>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={() => router.push('/pricing')}
              className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
            >
              Upgrade to Premium
            </Button>
            <Button
              onClick={() => setShowUpgradeModal(false)}
              variant="outline"
              className="flex-1"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <>
      {hasAccess === false ? (
        <>
          {fallback || <UpgradePrompt />}
          {showUpgradeModal && <UpgradePrompt />}
        </>
      ) : (
        <>{children}</>
      )}
    </>
  );
};

export default SubscriptionGuard;
