import mongoose from 'mongoose';

const WeeklyPlanSchema = new mongoose.Schema({
  weekStart: { type: Date, required: true },
  weekEnd: { type: Date, required: true },
  weekLabel: { type: String },
  goals: [{
    title: { type: String, required: true },
    category: { type: String, enum: ['development', 'dsa', 'fitness', 'spiritual', 'learning', 'personal', 'freelance', 'branding'], required: true },
    priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
    completed: { type: Boolean, default: false },
    dayAssigned: { type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'unassigned'], default: 'unassigned' },
    notes: { type: String },
    xpReward: { type: Number, default: 50 },
    xpAwarded: { type: Boolean, default: false },
    completedAt: { type: Date },
  }],
  completionPercentage: { type: Number, default: 0 },
  totalXPEarned: { type: Number, default: 0 },
  reviewed: { type: Boolean, default: false },
}, { timestamps: true });

WeeklyPlanSchema.index({ weekStart: 1 }, { unique: true });

export default mongoose.models.WeeklyPlan || mongoose.model('WeeklyPlan', WeeklyPlanSchema);
