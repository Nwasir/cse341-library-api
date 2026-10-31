const express = require('express');
const router = express.Router();

const controller = require('../controllers');
const { isAuthenticated } = require('../middleware/auth');

// "#swagger.ignore = true" leaves a route out of swagger.json,
// so the API docs only list the /books, /authors and /profile routes.
// The /login, /logout and /callback routes come from Auth0 (server.js).
router.get('/', /* #swagger.ignore = true */ controller.home);
router.use('/books', require('./books'));
router.use('/authors', require('./authors'));
router.get('/profile', isAuthenticated, controller.profile);
router.use('/api-docs', require('./swagger'));

module.exports = router;
