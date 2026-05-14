import mongoose from 'mongoose';

// Guard against accidental client-side imports
if (typeof window !== 'undefined') {
  console.warn('VisionBoard model imported on client side. This is forbidden.');
}

const VisionItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  category: { type: String },
  type: { type: String, enum: ['TARGET', 'MANIFESTO'] }
});

const VisionBoardSchema = new mongoose.Schema({
  items: [VisionItemSchema],
  quotes: [{
    text: { type: String },
    author: { type: String },
  }]
}, { timestamps: true });

const VisionBoard = mongoose.models.VisionBoard || mongoose.model('VisionBoard', VisionBoardSchema);
export default VisionBoard;
