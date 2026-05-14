import mongoose from 'mongoose';

const WeeklyReviewSchema = new mongoose.Schema({
  weekStart: { type: Date, required: true },
  weekEnd: { type: Date, required: true },
  whatImproved: { type: String },
  whatWastedTime: { type: String },
  whatCausedBurnout: { type: String },
  whatGaveEnergy: { type: String },
  biggestAchievement: { type: String },
  focusForNextWeek: { type: String },
  overallRating: { type: Number, min: 1, max: 10 },
  completionRate: { type: Number, default: 0 },
  totalXPEarned: { type: Number, default: 0 },
  deepWorkHours: { type: Number, default: 0 },
  habitsCompletionRate: { type: Number, default: 0 },
  notes: { type: String },
}, { timestamps: true });

WeeklyReviewSchema.index({ weekStart: 1 }, { unique: true });

export default mongoose.models.WeeklyReview || mongoose.model('WeeklyReview', WeeklyReviewSchema);
