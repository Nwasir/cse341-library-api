const express = require('express');
const router = express.Router();

const controller = require('../controllers/authors');
const validate = require('../middleware/validate');

router.get('/', controller.getAll);
router.get('/:id', validate.id, controller.getSingle);
router.post('/', validate.author, controller.createAuthor);
router.put('/:id', validate.id, validate.author, controller.updateAuthor);
router.delete('/:id', validate.id, controller.deleteAuthor);

module.exports = router;
