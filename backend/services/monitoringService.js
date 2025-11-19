// services/monitoringService.js
const axios = require('axios');
const natural = require('natural');
const Mention = require('../models/Mention');
const Alert = require('../models/Alert');

// Real API Services
const { fetchTwitterMentions } = require('./twitterService');
const { fetchRedditMentions } = require('./redditService');
const { fetchNewsMentions } = require('./newsService');

// Initialize sentiment analyzer
const Analyzer = natural.SentimentAnalyzer;
const stemmer = natural.PorterStemmer;
const analyzer = new Analyzer('English', stemmer, 'afinn');

// Topic keywords for classification
const topicKeywords = {
  'Product': ['product', 'feature', 'quality', 'performance', 'design', 'innovative'],
  'Customer Service': ['support', 'service', 'help', 'representative', 'response', 'assistance'],
  'Pricing': ['price', 'cost', 'expensive', 'cheap', 'value', 'discount', 'affordable'],
  'Innovation': ['innovative', 'technology', 'advanced', 'breakthrough', 'revolutionary'],
  'Competition': ['competitor', 'versus', 'alternative', 'better than', 'compared to']
};

// Analyze sentiment of text
function analyzeSentiment(text) {
  const tokens = new natural.WordTokenizer().tokenize(text.toLowerCase());
  const score = analyzer.getSentiment(tokens);
  
  let sentiment;
  if (score > 0.2) sentiment = 'positive';
  else if (score < -0.2) sentiment = 'negative';
  else sentiment = 'neutral';
  
  return { sentiment, score };
}

// Classify topic based on keywords
function classifyTopic(text) {
  const lowerText = text.toLowerCase();
  let maxScore = 0;
  let detectedTopic = 'General';
  
  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    const score = keywords.reduce((acc, keyword) => {
      return acc + (lowerText.includes(keyword) ? 1 : 0);
    }, 0);
    
    if (score > maxScore) {
      maxScore = score;
      detectedTopic = topic;
    }
  }
  
  return detectedTopic;
}

// Extract keywords from text
function extractKeywords(text) {
  const tokens = new natural.WordTokenizer().tokenize(text.toLowerCase());
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'is', 'are', 'was', 'were', 'be', 'been', 'being']);
  
  return tokens
    .filter(token => token.length > 3 && !stopWords.has(token))
    .slice(0, 10);
}



// Check for spikes in mentions
async function detectSpikes(brand) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  
  const currentHourCount = await Mention.countDocuments({
    brand: new RegExp(brand, 'i'),
    timestamp: { $gte: oneHourAgo }
  });
  
  const previousHourCount = await Mention.countDocuments({
    brand: new RegExp(brand, 'i'),
    timestamp: { $gte: twoHoursAgo, $lt: oneHourAgo }
  });
  
  // Spike if current hour has 2x or more mentions than previous hour
  return currentHourCount >= previousHourCount * 2 && currentHourCount > 10;
}

// Main monitoring function
async function monitorBrand(brand, io) {
  try {
    console.log(`🔍 Monitoring brand: ${brand}`);
    
    // Fetch from real APIs in parallel
    const [twitterData, redditData, newsData] = await Promise.all([
      fetchTwitterMentions(brand),
      fetchRedditMentions(brand),
      fetchNewsMentions(brand)
    ]);
    
    // Process all mentions
    const allMentions = [
      ...twitterData.map(t => ({ ...t, source: 'Twitter' })),
      ...redditData.map(r => ({ ...r, source: 'Reddit' })),
      ...newsData.map(n => ({ ...n, source: 'News' }))
    ];
    
    for (const mentionData of allMentions) {
      // Analyze sentiment
      const { sentiment, score } = analyzeSentiment(mentionData.text);
      
      // Classify topic
      const topic = classifyTopic(mentionData.text);
      
      // Extract keywords
      const keywords = extractKeywords(mentionData.text);
      
      // Check if mention already exists
      const existingMention = await Mention.findOne({ 
        text: mentionData.text,
        author: mentionData.author 
      });
      
      if (!existingMention) {
        // Create new mention
        const mention = new Mention({
          brand,
          source: mentionData.source,
          text: mentionData.text,
          sentiment,
          sentimentScore: score,
          topic,
          author: mentionData.author,
          authorHandle: mentionData.authorHandle,
          url: mentionData.url || `https://example.com/${brand}/${Date.now()}`,
          timestamp: mentionData.timestamp,
          engagement: {
            likes: mentionData.likes || 0,
            shares: mentionData.shares || 0,
            comments: mentionData.comments || 0
          },
          reach: mentionData.reach || 0,
          keywords
        });
        
        await mention.save();
        
        // Emit real-time update via Socket.io
        if (io) {
          io.to(`brand_${brand}`).emit('new_mention', mention);
        }
        
        console.log(`✅ Saved new mention for ${brand}`);
      }
    }
    
    // Detect spikes
    const hasSpike = await detectSpikes(brand);
    if (hasSpike && io) {
      io.to(`brand_${brand}`).emit('spike_detected', { 
        brand, 
        message: 'Unusual spike in mentions detected!' 
      });
    }
    
  } catch (error) {
    console.error(`Error monitoring ${brand}:`, error);
  }
}

// Start monitoring for all active brands
async function startMonitoring(io) {
  try {
    // In production, get brands from active users
    const brands = ['Tesla', 'Apple', 'Google', 'Amazon', 'Microsoft'];
    
    for (const brand of brands) {
      await monitorBrand(brand, io);
    }
    
    console.log('✅ Monitoring cycle completed');
  } catch (error) {
    console.error('Monitoring error:', error);
  }
}

module.exports = {
  startMonitoring,
  monitorBrand,
  analyzeSentiment,
  classifyTopic,
  extractKeywords
};