const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Settings, Tag } = require('../models');

// @route   GET api/settings
// @desc    Get system settings
router.get('/', auth, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({
        identity: 'Velvorax Enterprise',
        currency: 'USD',
        timezone: 'UTC'
      });
      await settings.save();
    }
    res.json(settings);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   POST api/settings/general
// @desc    Update general and workflow settings
router.post('/general', auth, async (req, res) => {
  try {
    const {
      currency,
      timezone,
      locale,
      identity,
      logo,
      emailNotifications,
      leadAutoConversion
    } = req.body;

    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();

    if (currency) settings.currency = currency;
    if (timezone) settings.timezone = timezone;
    if (locale) settings.locale = locale;
    if (identity) settings.identity = identity;
    if (logo) settings.logo = logo;

    // Checkboxes/Toggles
    if (typeof emailNotifications !== 'undefined') settings.emailNotifications = emailNotifications;
    if (typeof leadAutoConversion !== 'undefined') settings.leadAutoConversion = leadAutoConversion;

    await settings.save();
    res.json({ message: 'Settings updated successfully', settings });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/settings/salesforce/connect
router.post('/salesforce/connect', auth, async (req, res) => {
  try {
    const { domain, clientId, clientSecret } = req.body;
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();
    
    settings.salesforceConnected = true;
    settings.salesforceCredentials = { domain, clientId, clientSecret };
    await settings.save();
    
    res.json({ message: 'Salesforce connected successfully', settings });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   GET api/settings/tags
router.get('/tags', auth, async (req, res) => {
  try {
    const tags = await Tag.find().sort({ name: 1 });
    res.json(tags);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   POST api/settings/tags
router.post('/tags', auth, async (req, res) => {
  try {
    const newTag = new Tag(req.body);
    const tag = await newTag.save();
    res.json(tag);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/settings/tags/:id
router.delete('/tags/:id', auth, async (req, res) => {
  try {
    await Tag.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Tag removed' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
