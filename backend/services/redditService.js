//path: backend/services/redditService.js
// Free Reddit API Integration (No authentication needed!)

const axios = require('axios');

async function fetchRedditMentions(brand) {
  try {
    console.log(`🔗 Fetching Reddit mentions for: ${brand}`);

    const response = await axios.get('https://www.reddit.com/r/all/search.json', {
      params: {
        q: brand,
        limit: 50,
        sort: 'new',
        t: 'week'
      },
      headers: {
        'User-Agent': 'BrandTracker/1.0 (+https://brandtracker.com)'
      },
      timeout: 10000
    });

    const posts = response.data?.data?.children || [];

    if (posts.length === 0) {
      console.log(`ℹ️  No Reddit posts found for ${brand}`);
      return [];
    }

    const formattedPosts = posts.map(post => {
      const data = post.data;
      const text = (data.title || '') + ' ' + (data.selftext || '');
      return {
        text: text.substring(0, 500),
        author: data.author || 'deleted',
        authorHandle: `u/${data.author}` || 'u/deleted',
        timestamp: new Date(data.created_utc * 1000),
        likes: data.ups || 0,
        comments: data.num_comments || 0,
        shares: Math.floor((data.ups || 0) / 10),
        reach: (data.ups || 0) + (data.num_comments || 0),
        url: `https://reddit.com${data.permalink}`
      };
    });

    console.log(`✅ Fetched ${formattedPosts.length} Reddit posts for ${brand}`);
    return formattedPosts;

  } catch (error) {
    console.error('❌ Reddit API Error:', error.message);
    return [];
  }
}

module.exports = { fetchRedditMentions };
