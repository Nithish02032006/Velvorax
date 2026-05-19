const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Account = require('../models/Account');

// CREATE ACCOUNT
router.post('/', auth, async (req, res) => {
  try {
    const account = new Account({
      ...req.body,
      createdBy: req.user.id
    });

    await account.save();
    res.json(account);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// GET ALL ACCOUNTS
router.get('/', auth, async (req, res) => {
  let query = {};

  if (req.user.role !== 'super_admin') {
    query.createdBy = req.user.id;
  }

  const accounts = await Account.find(query).sort({ createdAt: -1 });
  res.json(accounts);
});

// UPDATE STATUS
router.patch('/:id/:status', auth, async (req, res) => {
  const { id, status } = req.params;

  const account = await Account.findByIdAndUpdate(
    id,
    { approvalStatus: status },
    { new: true }
  );

  res.json(account);
});

// DELETE ACCOUNT
router.delete('/:id', auth, async (req, res) => {
  await Account.findByIdAndDelete(req.params.id);
  res.json({ msg: 'Deleted' });
});

module.exports = router;