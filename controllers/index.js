// Controller functions for each route.

// The user's name comes from their Auth0 profile, so it is escaped
// before it goes into the page.
const escapeHtml = (text) =>
  String(text).replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

const home = (req, res) => {
  const login = req.oidc.isAuthenticated()
    ? `<p>Logged in as ${escapeHtml(req.oidc.user.name)}. You can add, update and delete books and authors. <a href="/profile">See your profile</a> or <a href="/logout">log out</a>.</p>`
    : '<p>You are logged out. <a href="/login">Log in</a> or <a href="/signup">create an account</a> to add, update and delete books and authors.</p>';

  res.send(
    `<h1>Library API</h1><p>Manage the library's <a href="/books">books</a> and <a href="/authors">authors</a>. Try every route in the <a href="/api-docs">API documentation</a>.</p>${login}`
  );
};

// GET /signup
// Like /login, but Auth0 opens on its sign up page so a new user can
// create an account. Afterwards they come back to the home page logged in.
const signup = (req, res) =>
  res.oidc.login({ returnTo: '/', authorizationParams: { screen_hint: 'signup' } });

// GET /profile
// Returns the logged-in user's Auth0 profile.
const profile = (req, res) => {
  /*
    #swagger.tags = ['Profile']
    #swagger.summary = 'Get the logged-in user'
    #swagger.description = 'Needs a login: log in at /login first. The browser then sends your login with every request from this page.'
    #swagger.security = [{ "loginCookie": [] }]
    #swagger.responses[200] = { description: 'Your Auth0 profile', schema: { $ref: '#/definitions/Profile' } }
    #swagger.responses[401] = { description: 'You are not logged in', schema: { $ref: '#/definitions/Error' } }
  */
  res.status(200).json(req.oidc.user);
};

module.exports = { home, signup, profile };
