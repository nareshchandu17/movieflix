"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Calendar, Phone } from "lucide-react";

interface StepProfileProps {
  data: {
    username: string;
    dob: string;
    phone: string;
  };
  updateData: (newData: any) => void;
}

export default function StepProfile({ data, updateData }: StepProfileProps) {
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    updateData({ [field]: value });
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-center"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-red-500 via-red-600 to-red-800 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg shadow-red-500/25">
          <User className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome 🎬
        </h1>
        <p className="text-white/60 text-lg">
          Let's personalize your experience
        </p>
      </motion.div>

      {/* Form Fields */}
      <div className="space-y-5">
        {/* Username Field */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <div className="relative">
            <User className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
              focusedField === 'username' ? 'text-red-400' : 'text-white/40'
            }`} />
            <input
              type="text"
              placeholder="Choose a username"
              value={data.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              onFocus={() => setFocusedField('username')}
              onBlur={() => setFocusedField(null)}
              className={`w-full pl-12 pr-4 py-4 bg-white/5 border rounded-xl text-white placeholder-white/40 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500/50 ${
                focusedField === 'username' 
                  ? 'border-red-500/50 bg-white/10' 
                  : 'border-white/10 hover:border-white/20'
              }`}
            />
          </div>
          {data.username && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-green-400 text-sm mt-1"
            >
              ✓ Username available
            </motion.p>
          )}
        </motion.div>

        {/* Date of Birth Field */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          <div className="relative">
            <Calendar className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
              focusedField === 'dob' ? 'text-red-400' : 'text-white/40'
            }`} />
            <input
              type="date"
              placeholder="Date of birth"
              value={data.dob}
              onChange={(e) => handleInputChange('dob', e.target.value)}
              onFocus={() => setFocusedField('dob')}
              onBlur={() => setFocusedField(null)}
              max={today}
              className={`w-full pl-12 pr-4 py-4 bg-white/5 border rounded-xl text-white placeholder-white/40 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500/50 ${
                focusedField === 'dob' 
                  ? 'border-red-500/50 bg-white/10' 
                  : 'border-white/10 hover:border-white/20'
              } [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
            />
          </div>
          {data.dob && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-green-400 text-sm mt-1"
            >
              ✓ Date added
            </motion.p>
          )}
        </motion.div>

        {/* Phone Field (Optional) */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="relative"
        >
          <div className="relative">
            <Phone className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
              focusedField === 'phone' ? 'text-red-400' : 'text-white/40'
            }`} />
            <input
              type="tel"
              placeholder="Phone number (optional)"
              value={data.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              onFocus={() => setFocusedField('phone')}
              onBlur={() => setFocusedField(null)}
              className={`w-full pl-12 pr-4 py-4 bg-white/5 border rounded-xl text-white placeholder-white/40 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500/50 ${
                focusedField === 'phone' 
                  ? 'border-red-500/50 bg-white/10' 
                  : 'border-white/10 hover:border-white/20'
              }`}
            />
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-white/40 text-sm mt-1"
          >
            Help us secure your account
          </motion.p>
        </motion.div>
      </div>

      {/* Requirements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-white/5 rounded-xl p-4 border border-white/10"
      >
        <h3 className="text-white/80 font-semibold mb-2">Requirements</h3>
        <div className="space-y-1">
          <div className={`flex items-center space-x-2 text-sm ${
            data.username ? 'text-green-400' : 'text-white/40'
          }`}>
            <span>{data.username ? '✓' : '○'}</span>
            <span>Username required</span>
          </div>
          <div className={`flex items-center space-x-2 text-sm ${
            data.dob ? 'text-green-400' : 'text-white/40'
          }`}>
            <span>{data.dob ? '✓' : '○'}</span>
            <span>Date of birth required</span>
          </div>
          <div className={`flex items-center space-x-2 text-sm ${
            data.phone ? 'text-green-400' : 'text-white/60'
          }`}>
            <span>{data.phone ? '✓' : '○'}</span>
            <span>Phone optional</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
