import mongoose from 'mongoose';

const DeepWorkSessionSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  durationMinutes: { type: Number, default: 0 },
  task: { type: String },
  category: { type: String },
  completed: { type: Boolean, default: false },
  focusScore: { type: Number, min: 1, max: 10 },
  xpEarned: { type: Number, default: 0 },
  xpAwarded: { type: Boolean, default: false },
  notes: { type: String },
}, { timestamps: true });

export default mongoose.models.DeepWorkSession || mongoose.model('DeepWorkSession', DeepWorkSessionSchema);
