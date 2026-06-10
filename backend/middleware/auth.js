const jwt = require('jsonwebtoken');

module.exports = async function(req, res, next) {

  // Get token from header
  const token =
    req.header('x-auth-token') ||
    req.header('Authorization')?.replace('Bearer ', '');

  // Check token
  if (!token) {
    return res.status(401).json({
      msg: 'No token, authorization denied'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const userType = decoded.user.type || 'User';
    const Model = userType === 'StandardUser'
      ? require('../models/StandardUser')
      : require('../models/User');

    const storedUser = await Model.findById(decoded.user.id).select('isLoggedIn activeToken');
    if (!storedUser) {
      console.warn(`AUTH: User ${decoded.user.id} not found in model ${userType}`);
      return res.status(401).json({ msg: 'User no longer exists. Please login again.' });
    }

    if (!storedUser.isLoggedIn) {
      console.warn(`AUTH: User ${decoded.user.id} is marked as logged out`);
      return res.status(401).json({ msg: 'Session expired (logged out). Please login again.' });
    }

    if (storedUser.activeToken !== token) {
      console.warn(`AUTH: Token mismatch for user ${decoded.user.id}`);
      return res.status(401).json({ msg: 'Session invalid (multiple logins). Please login again.' });
    }

    req.user = decoded.user;

    next();

  } catch (err) {
    console.error('AUTH ERROR:', err && err.message ? err.message : err);
    res.status(401).json({
      msg: 'Token is not valid'
    });
  }
};