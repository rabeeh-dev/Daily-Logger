import mongoose from 'mongoose';

const XPProgressSchema = new mongoose.Schema({
  totalXP: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastActiveDate: { type: Date },
  achievements: [{
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    icon: { type: String },
    unlockedAt: { type: Date, default: Date.now },
    xpBonus: { type: Number, default: 0 },
  }],
  xpHistory: [{
    date: { type: Date },
    amount: { type: Number },
    source: { type: String },
    description: { type: String },
  }],
}, { timestamps: true });

export default mongoose.models.XPProgress || mongoose.model('XPProgress', XPProgressSchema);
