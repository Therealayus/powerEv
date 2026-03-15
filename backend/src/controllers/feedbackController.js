const Feedback = require('../models/Feedback');

/**
 * POST /api/feedback - submit feedback (protected)
 * Body: { message, rating? (1-5) }
 */
exports.submitFeedback = async (req, res) => {
  try {
    const { message, rating } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ message: 'Feedback message is required' });
    }
    const doc = await Feedback.create({
      user: req.user._id,
      message: message.trim(),
      rating: rating >= 1 && rating <= 5 ? rating : null,
    });
    res.status(201).json({ _id: doc._id, message: 'Thank you for your feedback!' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to submit feedback' });
  }
};
