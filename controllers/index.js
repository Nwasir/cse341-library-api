// Controller functions for each route.

// The user's name comes from their Auth0 profile, so it is escaped
// before it goes into the page.
const escapeHtml = (text) =>
  String(text).replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

const home = (req, res) => {
  const login = req.oidc.isAuthenticated()
    ? `<p>Logged in as ${escapeHtml(req.oidc.user.name)}. <a href="/profile">See your profile</a> or <a href="/logout">log out</a>.</p>`
    : '<p>You are logged out. <a href="/login">Log in</a></p>';

  res.send(
    `<h1>Library API</h1><p>Manage the library's <a href="/books">books</a> and <a href="/authors">authors</a>. Try every route in the <a href="/api-docs">API documentation</a>.</p>${login}`
  );
};

// GET /profile
// Returns the logged-in user's Auth0 profile.
const profile = (req, res) => {
  /*
    #swagger.tags = ['Profile']
    #swagger.summary = 'Get the logged-in user'
    #swagger.description = 'Log in at /login first. The browser then sends your login with every request from this page.'
    #swagger.responses[200] = { description: 'Your Auth0 profile', schema: { $ref: '#/definitions/Profile' } }
    #swagger.responses[401] = { description: 'You are not logged in', schema: { $ref: '#/definitions/Error' } }
  */
  res.status(200).json(req.oidc.user);
};

module.exports = { home, profile };
