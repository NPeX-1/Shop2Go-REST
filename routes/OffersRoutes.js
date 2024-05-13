var express = require('express');
var router = express.Router();
var OffersController = require('../controllers/OffersController.js');

/*
 * GET
 */
router.get('/', OffersController.list);

/*
 * GET
 */
router.get('/:id', OffersController.show);

/*
 * POST
 */
router.post('/', OffersController.createManual);
router.post('/scrape', OffersController.createAutomatic);

/*
 * PUT
 */
router.put('/:id', OffersController.update);

/*
 * DELETE
 */
router.delete('/:id', OffersController.remove);

module.exports = router;
