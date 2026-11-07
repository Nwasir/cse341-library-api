const express = require('express');
const router = express.Router();

const controller = require('../controllers/books');
const validate = require('../middleware/validate');
const { isAuthenticated } = require('../middleware/auth');

// Anyone can read books. Creating, updating and deleting a book needs a
// login, so isAuthenticated runs first and sends a 401 to anyone who
// isn't logged in, before the id or body is checked.
router.get('/', controller.getAll);
router.get('/:id', validate.id, controller.getSingle);
router.post('/', isAuthenticated, validate.book, controller.createBook);
router.put('/:id', isAuthenticated, validate.id, validate.book, controller.updateBook);
router.delete('/:id', isAuthenticated, validate.id, controller.deleteBook);

module.exports = router;
