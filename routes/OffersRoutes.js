var express = require('express');
var router = express.Router();
var OffersController = require('../controllers/OffersController.js');
var multer = require('multer');
var upload = multer({ dest: 'public/images/' });
var LogsModel = require('../models/LogsModel.js');

function APIKeyValidate(req, res, next) {
    LogsModel.findOne().sort({ logDate: -1 }).exec(function (err, Logs) {
        if (err) {
            return res.status(500).json({
                message: 'Error when getting Logs.',
                error: err
            });
        }

        if (!Logs) {
            return res.status(404).json({
                message: 'No such Logs'
            });
        }

        if (req.body.APIKey == Logs.APIKey) {
            return next();
        } else {
            var err = new Error("APIKey Invalid");
            err.status = 401;
            return next(err);
        }
    });
}

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
router.get('/next-scrape-time', OffersController.timeToNextScrape);
/*
 * GET
 */
router.get('/:id', OffersController.show);

/*
 * POST
 */
router.post('/', requiresLogin, upload.single('image'), OffersController.createManual);
router.post('/scrape', APIKeyValidate, OffersController.createAutomatic);

/*
 * PUT
 */
router.put('/:id', OffersController.update);

/*
 * DELETE
 */
router.delete('/:id', OffersController.remove);

module.exports = router;
