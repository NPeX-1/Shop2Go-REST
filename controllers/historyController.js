var HistoryModel = require('../models/historyModel.js');

/**
 * historyController.js
 *
 * @description :: Server-side logic for managing historys.
 */
module.exports = {

    /**
     * historyController.list()
     */
    list: function (req, res) {
        HistoryModel.find(function (err, historys) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting history.',
                    error: err
                });
            }

            return res.json(historys);
        });
    },

    /**
     * historyController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        HistoryModel.findOne({_id: id}, function (err, history) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting history.',
                    error: err
                });
            }

            if (!history) {
                return res.status(404).json({
                    message: 'No such history'
                });
            }

            return res.json(history);
        });
    },

    /**
     * historyController.create()
     */
    create: function (req, res) {
        var history = new HistoryModel({
			offerId : req.body.offerId,
			action : req.body.action,
			actionTime : req.body.actionTime
        });

        history.save(function (err, history) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating history',
                    error: err
                });
            }

            return res.status(201).json(history);
        });
    },

    /**
     * historyController.update()
     */
    update: function (req, res) {
        var id = req.params.id;

        HistoryModel.findOne({_id: id}, function (err, history) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting history',
                    error: err
                });
            }

            if (!history) {
                return res.status(404).json({
                    message: 'No such history'
                });
            }

            history.offerId = req.body.offerId ? req.body.offerId : history.offerId;
			history.action = req.body.action ? req.body.action : history.action;
			history.actionTime = req.body.actionTime ? req.body.actionTime : history.actionTime;
			
            history.save(function (err, history) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating history.',
                        error: err
                    });
                }

                return res.json(history);
            });
        });
    },

    /**
     * historyController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;

        HistoryModel.findByIdAndRemove(id, function (err, history) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the history.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    }
};
