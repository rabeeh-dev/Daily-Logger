import mongoose from 'mongoose';

if (typeof window !== 'undefined') {
  console.warn('SystemConfig model imported on client side.');
}

const SystemConfigSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  brutalistInterface: { type: Boolean, default: true },
  smartNotifications: { type: Boolean, default: true },
  autoSyncLatency: { type: Number, default: 600 },
  bioSyncProtocol: { type: String, default: 'STABLE' },
  osVersion: { type: String, default: 'v2.1.0' },
  nodeEnv: { type: String, default: 'PRODUCTION' }
}, { timestamps: true });

const SystemConfig = mongoose.models.SystemConfig || mongoose.model('SystemConfig', SystemConfigSchema);
export default SystemConfig;
