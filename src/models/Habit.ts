import mongoose from 'mongoose';

const HabitSchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String, default: '✅' },
  category: { type: String },
  active: { type: Boolean, default: true },
  xpPerCompletion: { type: Number, default: 20 },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  totalCompletions: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const HabitLogSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  habits: [{
    habitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Habit' },
    name: { type: String },
    completed: { type: Boolean, default: false },
    xpEarned: { type: Number, default: 0 },
    xpAwarded: { type: Boolean, default: false },
  }],
  completionRate: { type: Number, default: 0 },
}, { timestamps: true });

HabitLogSchema.index({ date: 1 }, { unique: true });

export const Habit = mongoose.models.Habit || mongoose.model('Habit', HabitSchema);
export const HabitLog = mongoose.models.HabitLog || mongoose.model('HabitLog', HabitLogSchema);
