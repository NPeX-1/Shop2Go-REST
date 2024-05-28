var ContactModel = require('../models/ContactModel.js');

/**
 * ContactController.js
 *
 * @description :: Server-side logic for managing Contacts.
 */
module.exports = {

    /**
     * ContactController.list()
     */
    list: function (req, res) {
        ContactModel.find(function (err, Contacts) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Contact.',
                    error: err
                });
            }

            return res.json(Contacts);
        });
    },

    /**
     * ContactController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        ContactModel.findOne({_id: id}, function (err, Contact) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Contact.',
                    error: err
                });
            }

            if (!Contact) {
                return res.status(404).json({
                    message: 'No such Contact'
                });
            }

            return res.json(Contact);
        });
    },

    /**
     * ContactController.create()
     */
    create: function (req, res) {
        var Contact = new ContactModel({
			name : req.body.name,
			email : req.body.email,
			message : req.body.message
        });

        Contact.save(function (err, Contact) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating Contact',
                    error: err
                });
            }

            return res.status(201).json(Contact);
        });
    },

    /**
     * ContactController.update()
     */
    update: function (req, res) {
        var id = req.params.id;

        ContactModel.findOne({_id: id}, function (err, Contact) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Contact',
                    error: err
                });
            }

            if (!Contact) {
                return res.status(404).json({
                    message: 'No such Contact'
                });
            }

            Contact.name = req.body.name ? req.body.name : Contact.name;
			Contact.email = req.body.email ? req.body.email : Contact.email;
			Contact.message = req.body.message ? req.body.message : Contact.message;
			
            Contact.save(function (err, Contact) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating Contact.',
                        error: err
                    });
                }

                return res.json(Contact);
            });
        });
    },

    /**
     * ContactController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;

        ContactModel.findByIdAndRemove(id, function (err, Contact) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the Contact.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    }
};
