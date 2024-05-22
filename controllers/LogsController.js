var LogsModel = require('../models/LogsModel.js');

/**
 * LogsController.js
 *
 * @description :: Server-side logic for managing Logss.
 */
module.exports = {


    /**
     * LogsController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        LogsModel.findOne({ _id: id }, function (err, Logs) {
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

            return res.json(Logs);
        });
    },

    /**
     * LogsController.create()
     */
    create: function (req, res) {
        var Logs = new LogsModel({
            APIKey: req.body.APIKey,
            log: req.body.log,
            logDate: new Date(Date.now()).toISOString()
        });

        Logs.save(function (err, Logs) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating Logs',
                    error: err
                });
            }

            return res.status(201).json(Logs);
        });
    },

    /**
     * LogsController.update()
     */
    update: function (req, res) {
        LogsModel.findOneAndUpdate([{
            $set: {
                log: {
                    $concat: ["$log", "\n", req.body.entry]
                }
            }
        }]).sort({ logDate: -1 }).exec(function (err, Logs) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Logs',
                    error: err
                });
            }
            return res.json(Logs);

        });
    },

    /**
     * LogsController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;

        LogsModel.findByIdAndRemove(id, function (err, Logs) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the Logs.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    }
};
