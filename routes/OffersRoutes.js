var express = require('express');
var router = express.Router();
var OffersController = require('../controllers/OffersController.js');


function requiresLogin(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    } else {
        var err = new Error("You must be logged in to view this page");
        err.status = 401;
        return next(err);
    }
}
/*
 * GET
 */
router.get('/', OffersController.list);
router.get('/search', OffersController.search);

/*
 * GET
 */
router.get('/:id', OffersController.show);

/*
 * POST
 */
router.post('/', requiresLogin, OffersController.createManual);
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
