var NotificationsModel = require('../models/NotificationsModel.js');

/**
 * NotificationsController.js
 *
 * @description :: Server-side logic for managing Notificationss.
 */
module.exports = {

    /**
     * NotificationsController.list()
     */
    list: function (req, res) {
        NotificationsModel.find(function (err, Notificationss) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Notifications.',
                    error: err
                });
            }

            return res.json(Notificationss);
        });
    },

    /**
     * NotificationsController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        NotificationsModel.findOne({ _id: id }, function (err, Notifications) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Notifications.',
                    error: err
                });
            }

            if (!Notifications) {
                return res.status(404).json({
                    message: 'No such Notifications'
                });
            }

            return res.json(Notifications);
        });
    },

    /**
     * NotificationsController.create()
     */
    create: function (req, res) {
        var Notifications = new NotificationsModel({
            action: req.body.action,
            update: req.body.update,
            seen: req.body.seen
        });

        Notifications.save(function (err, Notifications) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating Notifications',
                    error: err
                });
            }

            return res.status(201).json(Notifications);
        });
    },

    /**
     * NotificationsController.update()
     */
    update: function (req, res) {
        var id = req.params.id;

        NotificationsModel.findOne({ _id: id }, function (err, Notifications) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Notifications',
                    error: err
                });
            }

            if (!Notifications) {
                return res.status(404).json({
                    message: 'No such Notifications'
                });
            }

            Notifications.action = req.body.action ? req.body.action : Notifications.action;
            Notifications.update = req.body.update ? req.body.update : Notifications.update;
            Notifications.seen = req.body.seen ? req.body.seen : Notifications.seen;

            Notifications.save(function (err, Notifications) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating Notifications.',
                        error: err
                    });
                }

                return res.json(Notifications);
            });
        });
    },

    /**
     * NotificationsController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;

        NotificationsModel.findByIdAndRemove(id, function (err, Notifications) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the Notifications.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    },

    seen: function (req, res) {
        var id = req.params.id;

        NotificationsModel.findByIdAndUpdate(id, { $set: { seen: true } }, { new: true }, function (err, Notifications) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the Notifications.',
                    error: err
                });
            }
            return res.status(204).json(Notifications);
        });
    }
};
