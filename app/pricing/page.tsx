"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, X, Crown, Star, Zap, Users, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Plan {
  _id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  description: string;
  duration: string;
  isActive: boolean;
}

export default function PricingPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/plans');
      const data = await response.json();
      if (data.success) {
        setPlans(data.plans);
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    }
  };

  const handleSubscribe = async (planId: string) => {
    setSelectedPlan(planId);
    setLoading(true);
    setPaymentStatus('processing');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId })
      });

      const data = await response.json();
      
      if (data.success) {
        // Simulate payment completion (in real app, this would redirect to payment provider)
        setTimeout(async () => {
          await simulatePaymentSuccess(data.paymentId);
        }, 2000);
      } else {
        setPaymentStatus('error');
      }
    } catch (error) {
      console.error('Subscription failed:', error);
      setPaymentStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const simulatePaymentSuccess = async (paymentId: string) => {
    try {
      const response = await fetch('/api/payment/success', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId })
      });

      const data = await response.json();
      
      if (data.success) {
        setPaymentStatus('success');
        setTimeout(() => {
          router.push('/account');
        }, 2000);
      } else {
        setPaymentStatus('error');
      }
    } catch (error) {
      console.error('Payment success simulation failed:', error);
      setPaymentStatus('error');
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case 'BASIC':
        return <Star className="w-6 h-6" />;
      case 'PREMIUM':
        return <Crown className="w-6 h-6 text-yellow-500" />;
      default:
        return <Shield className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Unlock premium features and enjoy unlimited entertainment
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => (
            <motion.div
              key={plan._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative bg-gray-900 rounded-2xl p-8 border-2 transition-all duration-300 ${
                selectedPlan === plan._id
                  ? 'border-blue-500 shadow-lg shadow-blue-500/20 scale-105'
                  : 'border-gray-700 hover:border-gray-600 hover:scale-102'
              }`}
            >
              {/* Popular Badge */}
              {plan.name === 'PREMIUM' && (
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  POPULAR
                </div>
              )}

              {/* Plan Icon */}
              <div className="flex justify-center mb-6">
                <div className={`p-3 rounded-full ${
                  plan.name === 'PREMIUM' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gray-800'
                }`}>
                  {getPlanIcon(plan.name)}
                </div>
              </div>

              {/* Plan Name */}
              <h3 className="text-2xl font-bold text-center mb-2">
                {plan.name}
              </h3>

              {/* Price */}
              <div className="text-center mb-6">
                <span className="text-4xl font-bold">
                  ₹{plan.price}
                </span>
                <span className="text-gray-400">/{plan.duration}</span>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Subscribe Button */}
              <Button
                onClick={() => handleSubscribe(plan._id)}
                disabled={loading || paymentStatus === 'processing'}
                className={`w-full ${
                  plan.name === 'PREMIUM'
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {loading && selectedPlan === plan._id ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-transparent animate-spin rounded-full" />
                    Processing...
                  </div>
                ) : (
                  <span>Get Started</span>
                )}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Payment Status Modal */}
        {paymentStatus !== 'idle' && (
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
                {paymentStatus === 'processing' && (
                  <>
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent animate-spin rounded-full mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Processing Payment</h3>
                    <p className="text-gray-400">Please wait while we process your subscription...</p>
                  </>
                )}

                {paymentStatus === 'success' && (
                  <>
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-green-500">Payment Successful!</h3>
                    <p className="text-gray-400">Your subscription has been activated.</p>
                  </>
                )}

                {paymentStatus === 'error' && (
                  <>
                    <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <X className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-red-500">Payment Failed</h3>
                    <p className="text-gray-400">Please try again or contact support.</p>
                  </>
                )}

                <Button
                  onClick={() => setPaymentStatus('idle')}
                  className="mt-6 w-full"
                >
                  {paymentStatus === 'success' ? 'Go to Account' : 'Close'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Feature Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gray-900 rounded-2xl p-8 border border-gray-800"
        >
          <h2 className="text-2xl font-bold text-center mb-8">Why Choose Premium?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-6 h-6 text-yellow-500" />
                <h3 className="text-lg font-semibold">Ad-Free Experience</h3>
              </div>
              <p className="text-gray-400">Enjoy uninterrupted streaming without any advertisements</p>
              
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-blue-500" />
                <h3 className="text-lg font-semibold">Watch Party</h3>
              </div>
              <p className="text-gray-400">Host virtual movie nights with friends and family</p>
              
              <div className="flex items-center gap-3 mb-4">
                <Crown className="w-6 h-6 text-purple-500" />
                <h3 className="text-lg font-semibold">AI Recommendations</h3>
              </div>
              <p className="text-gray-400">Get personalized content suggestions powered by AI</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-green-500" />
                <h3 className="text-lg font-semibold">4K Quality</h3>
              </div>
              <p className="text-gray-400">Stream movies and shows in ultra-high definition</p>
              
              <div className="flex items-center gap-3 mb-4">
                <Star className="w-6 h-6 text-orange-500" />
                <h3 className="text-lg font-semibold">Early Access</h3>
              </div>
              <p className="text-gray-400">Watch new releases before anyone else</p>
              
              <div className="flex items-center gap-3 mb-4">
                <Check className="w-6 h-6 text-blue-500" />
                <h3 className="text-lg font-semibold">Priority Support</h3>
              </div>
              <p className="text-gray-400">Get help faster with our premium support team</p>
            </div>
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-500 mb-4">
            Questions? Contact us at <Link href="/support" className="text-blue-400 hover:underline">support@cineworld.com</Link>
          </p>
          <div className="flex justify-center gap-8">
            <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
