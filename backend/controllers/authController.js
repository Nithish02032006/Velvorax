const { User, Company } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/* ================= REGISTER ================= */
exports.registerStandard = async (req, res) => {
  try {
    const { leadId, name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: 'Email already exists' });

    const company = await Company.findOne({ leadCode: leadId });
    if (!company) return res.status(404).json({ msg: 'Invalid Lead ID' });

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashed,
      companyId: company._id,
      role: 'staff'
    });

    await user.save();

    res.json({ success: true, message: 'Registered successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};


/* ================= LOGIN (ADD HERE) ================= */
exports.loginStandard = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, role: 'staff' });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // 🚨 BLOCK IF ALREADY LOGGED IN
    if (user.isLoggedIn && user.activeToken) {
      return res.status(403).json({
        msg: 'User already logged in on another device'
      });
    }

    // create token
    const token = jwt.sign(
      {
        user: {
          id: user._id,
          role: user.role,
          companyId: user.companyId
        }
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // save session in DB
    user.isLoggedIn = true;
    user.activeToken = token;

    await user.save();

    res.json({
      token,
      user
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};