const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { SocialPost } = require('../models');

// @route   POST api/social/enhance
router.post('/enhance', auth, async (req, res) => {
  const { content, tone } = req.body;
  // Mock AI Enhancement
  const enhancedContent = `[AI ENHANCED - ${tone.toUpperCase()}] ${content}\n\nCheck this out! #Velvorax #CRM #Automation`;
  res.json({ enhancedContent });
});

// @route   GET api/social/posts
router.get('/posts', auth, async (req, res) => {
  try {
    const posts = await SocialPost.find().sort({ scheduledDate: 1 });
    res.json(posts);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   POST api/social/posts
router.post('/posts', auth, async (req, res) => {
  try {
    const newPost = new SocialPost(req.body);
    const post = await newPost.save();
    res.json(post);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
