var express = require('express');
var router = express.Router();
var ContactController = require('../controllers/ContactController.js');

/*
 * GET
 */
router.get('/', ContactController.list);

/*
 * GET
 */
router.get('/:id', ContactController.show);

/*
 * POST
 */
router.post('/', ContactController.create);

/*
 * PUT
 */
router.put('/:id', ContactController.update);

/*
 * DELETE
 */
router.delete('/:id', ContactController.remove);

module.exports = router;
