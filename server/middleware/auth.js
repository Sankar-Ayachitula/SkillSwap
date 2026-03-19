// Passport session-based authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res
    .status(401)
    .json({ error: "Not authenticated. Please log in." });
};

export default isAuthenticated;
