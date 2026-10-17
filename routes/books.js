const express = require('express');
const router = express.Router();

const controller = require('../controllers/books');
const validate = require('../middleware/validate');

router.get('/', controller.getAll);
router.get('/:id', validate.id, controller.getSingle);
router.post('/', validate.book, controller.createBook);
router.put('/:id', validate.id, validate.book, controller.updateBook);
router.delete('/:id', validate.id, controller.deleteBook);

module.exports = router;
