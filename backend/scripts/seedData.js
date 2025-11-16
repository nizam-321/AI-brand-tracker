// scripts/seedData.js
require('dotenv').config();
const mongoose = require('mongoose');
const Mention = require('../models/Mention');
const User = require('../models/User');

const brands = ['Tesla', 'Apple', 'Google', 'Amazon', 'Microsoft'];
const sources = ['Twitter', 'Reddit', 'News', 'Blogs', 'Forums'];
const sentiments = ['positive', 'negative', 'neutral'];
const topics = ['Product', 'Customer Service', 'Pricing', 'Innovation', 'Competition'];

const sampleTexts = {
  positive: [
    'Absolutely love this product! Best purchase ever!',
    'Amazing customer service, they really care!',
    'The quality is outstanding, highly recommend!',
    'Innovation at its finest. Truly impressed!',
    'Great value for money, exceeded expectations!'
  ],
  negative: [
    'Very disappointed with the quality.',
    'Customer service was terrible, no help at all.',
    'Way too expensive for what you get.',
    'Product broke after just one week.',
    'Would not recommend, complete waste of money.'
  ],
  neutral: [
    'Product arrived on time as expected.',
    'Standard features, nothing special.',
    'It works as described in the specifications.',
    'Average experience, neither good nor bad.',
    'Comparable to other similar products.'
  ]
};

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/brand-tracker');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Mention.deleteMany({});
    await User.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create demo user
    const demoUser = new User({
      name: 'Demo User',
      email: 'demo@brandtracker.com',
      password: 'demo123',
      company: 'Demo Company',
      brands: brands
    });
    await demoUser.save();
    console.log('👤 Created demo user (email: demo@brandtracker.com, password: demo123)');

    // Generate mentions for the last 7 days
    const mentions = [];
    const now = Date.now();
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);

    for (let i = 0; i < 500; i++) {
      const brand = brands[Math.floor(Math.random() * brands.length)];
      const source = sources[Math.floor(Math.random() * sources.length)];
      const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
      const topic = topics[Math.floor(Math.random() * topics.length)];
      
      const texts = sampleTexts[sentiment];
      const text = `${brand} - ${texts[Math.floor(Math.random() * texts.length)]}`;
      
      const timestamp = new Date(sevenDaysAgo + Math.random() * (now - sevenDaysAgo));
      
      const mention = {
        brand,
        source,
        text,
        sentiment,
        sentimentScore: sentiment === 'positive' ? Math.random() * 0.8 + 0.2 :
                       sentiment === 'negative' ? -(Math.random() * 0.8 + 0.2) :
                       (Math.random() - 0.5) * 0.4,
        topic,
        author: `user${Math.floor(Math.random() * 1000)}`,
        authorHandle: `@user${Math.floor(Math.random() * 1000)}`,
        url: `https://example.com/${brand.toLowerCase()}/${i}`,
        timestamp,
        engagement: {
          likes: Math.floor(Math.random() * 1000),
          shares: Math.floor(Math.random() * 200),
          comments: Math.floor(Math.random() * 100)
        },
        reach: Math.floor(Math.random() * 10000),
        isSpike: Math.random() > 0.9, // 10% chance of being a spike
        keywords: text.toLowerCase().split(' ').filter(w => w.length > 4).slice(0, 5),
        language: 'en'
      };
      
      mentions.push(mention);
    }

    // Insert all mentions
    await Mention.insertMany(mentions);
    console.log(`✅ Created ${mentions.length} sample mentions`);

    // Print statistics
    const stats = {
      total: mentions.length,
      byBrand: {},
      bySentiment: {},
      bySource: {}
    };

    mentions.forEach(m => {
      stats.byBrand[m.brand] = (stats.byBrand[m.brand] || 0) + 1;
      stats.bySentiment[m.sentiment] = (stats.bySentiment[m.sentiment] || 0) + 1;
      stats.bySource[m.source] = (stats.bySource[m.source] || 0) + 1;
    });

    console.log('\n📊 Database Statistics:');
    console.log('Total Mentions:', stats.total);
    console.log('\nBy Brand:', stats.byBrand);
    console.log('\nBy Sentiment:', stats.bySentiment);
    console.log('\nBy Source:', stats.bySource);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n🔐 Login credentials:');
    console.log('Email: demo@brandtracker.com');
    console.log('Password: demo123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();