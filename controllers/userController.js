const AppConfig = require('../models/AppConfig');
const { v4: uuidv4 } = require('uuid');

// GET /api/user/profile — return config as "profile"
const getProfile = async (req, res) => {
  try {
    let config = await AppConfig.findOne({ userId: 'admin' });
    if (!config) {
      // Seed preset habits
      const PRESET_HABITS = [
        { id: 'cold-shower', label: 'Cold Shower', emoji: '🚿', isPreset: true, order: 0 },
        { id: 'no-junk-food', label: 'No Junk Food', emoji: '🥗', isPreset: true, order: 1 },
        { id: 'journaling', label: 'Journaling', emoji: '📓', isPreset: true, order: 2 },
        { id: 'gratitude', label: 'Gratitude Practice', emoji: '🙏', isPreset: true, order: 3 },
        { id: 'supplements', label: 'Supplements', emoji: '💊', isPreset: true, order: 4 },
        { id: 'sunlight', label: 'Sunlight / Outdoor', emoji: '☀️', isPreset: true, order: 5 },
        { id: 'no-social-media', label: 'No Social Media', emoji: '📵', isPreset: true, order: 6 },
      ];
      config = new AppConfig({ userId: 'admin', habits: PRESET_HABITS, customHealthTags: [] });
      await config.save();
    }
    res.json(config);
  } catch (error) {
    console.error('Error in getProfile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/user/tags — add a custom health tag
const addTag = async (req, res) => {
  try {
    const { tag } = req.body;
    if (!tag || !tag.trim()) return res.status(400).json({ message: 'Tag is required' });

    const config = await AppConfig.findOneAndUpdate(
      { userId: 'admin' },
      { $addToSet: { customHealthTags: tag.trim() } },
      { new: true, upsert: true }
    );
    res.json(config);
  } catch (error) {
    console.error('Error in addTag:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/user/tags/:tag — remove a custom health tag
const removeTag = async (req, res) => {
  try {
    const { tag } = req.params;
    const config = await AppConfig.findOneAndUpdate(
      { userId: 'admin' },
      { $pull: { customHealthTags: decodeURIComponent(tag) } },
      { new: true }
    );
    if (!config) return res.status(404).json({ message: 'Config not found' });
    res.json(config);
  } catch (error) {
    console.error('Error in removeTag:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/user/habits — add a new custom habit
const addHabit = async (req, res) => {
  try {
    const { label, emoji } = req.body;
    if (!label || !label.trim()) return res.status(400).json({ message: 'Label is required' });

    const config = await AppConfig.findOne({ userId: 'admin' });
    if (!config) return res.status(404).json({ message: 'Config not found' });

    const maxOrder = config.habits.length > 0
      ? Math.max(...config.habits.map(h => h.order)) + 1
      : 0;

    const newHabit = {
      id: uuidv4(),
      label: label.trim(),
      emoji: emoji || '✨',
      isPreset: false,
      order: maxOrder
    };

    config.habits.push(newHabit);
    await config.save();
    res.status(201).json(config);
  } catch (error) {
    console.error('Error in addHabit:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/user/habits/reorder — reorder habits
const reorderHabits = async (req, res) => {
  try {
    const { habits } = req.body; // Expect full habits array with updated order values
    if (!Array.isArray(habits)) return res.status(400).json({ message: 'Habits array is required' });

    const config = await AppConfig.findOneAndUpdate(
      { userId: 'admin' },
      { $set: { habits } },
      { new: true }
    );
    res.json(config);
  } catch (error) {
    console.error('Error in reorderHabits:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/user/habits/:id — remove a habit
const removeHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const config = await AppConfig.findOneAndUpdate(
      { userId: 'admin' },
      { $pull: { habits: { id } } },
      { new: true }
    );
    if (!config) return res.status(404).json({ message: 'Config not found' });
    res.json(config);
  } catch (error) {
    console.error('Error in removeHabit:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getProfile,
  addTag,
  removeTag,
  addHabit,
  reorderHabits,
  removeHabit
};
