/**
 * Restrict route to users with role 'partner'
 * Use after protect() so req.user is set
 */
const partnerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'partner') return next();
  return res.status(403).json({ message: 'Partner access required' });
};

module.exports = { partnerOnly };
