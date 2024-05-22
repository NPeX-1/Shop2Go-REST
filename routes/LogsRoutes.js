var express = require('express');
var router = express.Router();
var LogsController = require('../controllers/LogsController.js');
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

router.get('/', LogsController.show);

router.post('/', LogsController.create);

router.put('/', APIKeyValidate, LogsController.update);

router.delete('/:id', LogsController.remove);

module.exports = router;
