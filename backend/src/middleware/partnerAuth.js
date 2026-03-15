/**
 * Restrict route to users with role 'partner' or 'admin' (admin has full partner access + more).
 * Use after protect() so req.user is set.
 */
const partnerOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'partner' || req.user.role === 'admin')) return next();
  return res.status(403).json({ message: 'Partner access required' });
};

module.exports = { partnerOnly };
