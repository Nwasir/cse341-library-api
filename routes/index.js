const express = require('express');
const router = express.Router();

const controller = require('../controllers');

// "#swagger.ignore = true" leaves a route out of swagger.json,
// so the API docs only list the /books and /authors routes.
router.get('/', /* #swagger.ignore = true */ controller.home);
router.use('/books', require('./books'));
router.use('/authors', require('./authors'));
router.use('/api-docs', require('./swagger'));

module.exports = router;
