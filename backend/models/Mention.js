// models/Mention.js
const mongoose = require('mongoose');

const mentionSchema = new mongoose.Schema({
  brand: {
    type: String,
    required: true,
    index: true
  },
  source: {
    type: String,
    required: true,
    enum: ['Twitter', 'Reddit', 'News', 'Blogs', 'Forums', 'YouTube', 'Instagram']
  },
  text: {
    type: String,
    required: true
  },
  sentiment: {
    type: String,
    required: true,
    enum: ['positive', 'negative', 'neutral']
  },
  sentimentScore: {
    type: Number,
    default: 0
  },
  topic: {
    type: String,
    default: 'General'
  },
  author: {
    type: String,
    required: true
  },
  authorHandle: String,
  url: {
    type: String,
    required: true,
    unique: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  engagement: {
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    comments: { type: Number, default: 0 }
  },
  reach: {
    type: Number,
    default: 0
  },
  isSpike: {
    type: Boolean,
    default: false
  },
  keywords: [String],
  language: {
    type: String,
    default: 'en'
  },
  location: String,
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
mentionSchema.index({ brand: 1, timestamp: -1 });
mentionSchema.index({ brand: 1, sentiment: 1 });
mentionSchema.index({ brand: 1, source: 1 });

module.exports = mongoose.model('Mention', mentionSchema);

