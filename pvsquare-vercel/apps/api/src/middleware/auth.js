// apps/api/src/middleware/auth.js
const jwt = require('jsonwebtoken');

exports.authenticateToken = (req) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return { valid: false, error: 'No token provided' };
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    return { valid: true, user };
  } catch (error) {
    return { valid: false, error: 'Invalid token' };
  }
};
