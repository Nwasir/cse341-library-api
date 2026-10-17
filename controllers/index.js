// Controller functions for each route.

const home = (req, res) => {
  res.send(
    '<h1>Library API</h1><p>Manage the library\'s <a href="/books">books</a> and <a href="/authors">authors</a>. Try every route in the <a href="/api-docs">API documentation</a>.</p>'
  );
};

module.exports = { home };
