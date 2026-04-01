import mongoose from "mongoose";

const DeviceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  deviceId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  deviceName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  deviceType: {
    type: String,
    required: true,
    enum: ["mobile", "tablet", "web", "tv", "desktop"],
    default: "web"
  },
  deviceInfo: {
    userAgent: String,
    platform: String,
    browser: String,
    os: String,
    screenResolution: String,
    language: String,
    timezone: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActiveAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  lastSeenAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  location: {
    country: String,
    city: String,
    region: String,
    ip: String
  },
  capabilities: {
    supports4K: {
      type: Boolean,
      default: false
    },
    supportsHDR: {
      type: Boolean,
      default: false
    },
    maxBitrate: {
      type: String,
      enum: ["auto", "360p", "480p", "720p", "1080p", "4k"],
      default: "auto"
    }
  },
  preferences: {
    autoplay: {
      type: Boolean,
      default: true
    },
    subtitles: {
      type: Boolean,
      default: false
    },
    language: {
      type: String,
      default: "en"
    },
    quality: {
      type: String,
      enum: ["auto", "low", "medium", "high", "ultra"],
      default: "auto"
    }
  },
  sessionInfo: {
    socketId: String,
    lastPing: {
      type: Date,
      default: Date.now()
    },
    connectionCount: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
DeviceSchema.index({ userId: 1, isActive: 1 });
DeviceSchema.index({ userId: 1, lastActiveAt: -1 });
DeviceSchema.index({ deviceId: 1, userId: 1 });

// Static methods
DeviceSchema.statics.registerDevice = async function(userId, deviceInfo) {
  const { deviceId, deviceName, deviceType, deviceDetails } = deviceInfo;
  
  // Check if device already exists for this user
  const existingDevice = await this.findOne({ 
    userId, 
    deviceId,
    isActive: true 
  });
  
  if (existingDevice) {
    // Update existing device
    existingDevice.lastActiveAt = new Date();
    existingDevice.lastSeenAt = new Date();
    existingDevice.deviceName = deviceName;
    existingDevice.deviceInfo = {
      ...existingDevice.deviceInfo,
      ...deviceDetails
    };
    existingDevice.isActive = true;
    
    return await existingDevice.save();
  } else {
    // Create new device
    return await this.create({
      userId,
      deviceId,
      deviceName,
      deviceType,
      deviceInfo: deviceDetails,
      isActive: true,
      lastActiveAt: new Date(),
      lastSeenAt: new Date(),
      createdAt: new Date()
    });
  }
};

DeviceSchema.statics.getUserDevices = function(userId, includeInactive = false) {
  const query: any = { userId };
  if (!includeInactive) {
    query.isActive = true;
  }
  
  return this.find(query)
    .sort({ lastActiveAt: -1 })
    .limit(10); // Limit to 10 devices per user
};

DeviceSchema.statics.deactivateDevice = function(userId, deviceId) {
  return this.findOneAndUpdate(
    { userId, deviceId, isActive: true },
    { 
      isActive: false,
      lastSeenAt: new Date()
    },
    { new: true }
  );
};

DeviceSchema.statics.updateLastSeen = function(deviceId) {
  return this.updateOne(
    { deviceId },
    { 
      lastSeenAt: new Date(),
      lastActiveAt: new Date()
    }
  );
};

DeviceSchema.statics.updateSessionInfo = function(deviceId, sessionInfo) {
  return this.updateOne(
    { deviceId },
    { 
      sessionInfo: {
        ...sessionInfo,
        lastPing: new Date()
      },
      lastSeenAt: new Date()
    }
  );
};

DeviceSchema.methods.isOnline = function() {
  const lastPing = this.sessionInfo?.lastPing;
  if (!lastPing) return false;
  
  // Consider online if last ping was within 2 minutes
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
  return lastPing > twoMinutesAgo;
};

DeviceSchema.methods.toJSON = function() {
  const device = this.toObject();
  
  // Remove sensitive information
  delete device.sessionInfo.socketId;
  
  return device;
};

export default mongoose.models.Device || mongoose.model("Device", DeviceSchema);
