const express = require('express');
const router = express.Router();

const controller = require('../controllers/authors');
const validate = require('../middleware/validate');
const { isAuthenticated } = require('../middleware/auth');

// Anyone can read authors. Creating, updating and deleting an author needs
// a login, so isAuthenticated runs first and sends a 401 to anyone who
// isn't logged in, before the id or body is checked.
router.get('/', controller.getAll);
router.get('/:id', validate.id, controller.getSingle);
router.post('/', isAuthenticated, validate.author, controller.createAuthor);
router.put('/:id', isAuthenticated, validate.id, validate.author, controller.updateAuthor);
router.delete('/:id', isAuthenticated, validate.id, controller.deleteAuthor);

module.exports = router;
