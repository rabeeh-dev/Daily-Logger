import mongoose from 'mongoose';

const DailyTaskSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  topPriorities: [{
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    xpAwarded: { type: Boolean, default: false },
    category: { type: String },
    xpReward: { type: Number, default: 30 },
  }],
  additionalTasks: [{
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    xpAwarded: { type: Boolean, default: false },
    category: { type: String },
    xpReward: { type: Number, default: 15 },
  }],
  deepWorkMinutes: { type: Number, default: 0 },
  focusSessions: { type: Number, default: 0 },
  mood: { type: Number, min: 1, max: 10 },
  energy: { type: Number, min: 1, max: 10 },
  dailyNotes: { type: String },
  reflection: { type: String },
  totalXPEarned: { type: Number, default: 0 },
}, { timestamps: true });

DailyTaskSchema.index({ date: 1 }, { unique: true });

export default mongoose.models.DailyTask || mongoose.model('DailyTask', DailyTaskSchema);
