/**
 * Restrict route to users with role 'admin'
 * Use after protect() so req.user is set
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ message: 'Admin access required' });
};

module.exports = { adminOnly };
