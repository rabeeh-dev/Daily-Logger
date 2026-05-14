import mongoose from 'mongoose';

// Guard against accidental client-side imports
if (typeof window !== 'undefined') {
  console.warn('DeveloperProgress model imported on client side. This is forbidden.');
}

const ProjectSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  progress: { type: Number, default: 0 },
  status: { type: String },
  stack: [{ type: String }]
});

const JourneySchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  status: { type: String },
  progress: { type: Number, default: 0 },
  category: { type: String }
});

const DeveloperProgressSchema = new mongoose.Schema({
  // Legacy fields
  mernProgress: { type: Number, default: 0 },
  reactLevel: { type: String, default: 'Beginner' },
  dsaSolved: { type: Number, default: 0 },
  dsaTarget: { type: Number, default: 300 },
  
  // Current UI fields
  projects: [ProjectSchema],
  journeys: [JourneySchema],

  milestones: [{
    title: { type: String },
    completed: { type: Boolean, default: false },
    category: { type: String },
  }]
}, { timestamps: true });

const DeveloperProgress = mongoose.models.DeveloperProgress || mongoose.model('DeveloperProgress', DeveloperProgressSchema);
export default DeveloperProgress;
