const express = require('express');
const router = express.Router();

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');

// Interactive API documentation (Swagger UI) built from swagger.json.
router.use('/', swaggerUi.serve);
router.get('/', /* #swagger.ignore = true */ swaggerUi.setup(swaggerDocument));

module.exports = router;
