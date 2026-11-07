// Login check for routes that need a logged-in user. req.oidc comes from
// the Auth0 middleware in server.js. A request without a login gets a 401
// instead of being sent to the Auth0 login page, so API callers get JSON.
const isAuthenticated = (req, res, next) => {
  if (req.oidc.isAuthenticated()) return next();

  res.status(401).json({
    message:
      'You must be logged in. Log in at /login (or create an account at /signup), then try again.',
  });
};

module.exports = { isAuthenticated };
