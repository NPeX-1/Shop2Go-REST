var UsersModel = require('../models/UsersModel.js');

/**
 * UsersController.js
 *
 * @description :: Server-side logic for managing Userss.
 */
module.exports = {

    /**
     * UsersController.list()
     */
    list: function (req, res) {
        UsersModel.find(function (err, Userss) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Users.',
                    error: err
                });
            }

            return res.json(Userss);
        });
    },

    /**
     * UsersController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        UsersModel.findOne({ _id: id }, function (err, Users) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Users.',
                    error: err
                });
            }

            if (!Users) {
                return res.status(404).json({
                    message: 'No such Users'
                });
            }

            return res.json(Users);
        });
    },

    /**
     * UsersController.create()
     */
    create: function (req, res) {
        var Users = new UsersModel({
            username: req.query.username,
            password: req.query.password,
            pfppath: req.query.pfppath,
            signupdate: new Date(Date.now()).toISOString(),
            bookmarks: Array[null],
            interested: Array[null],
            admin: req.query.admin
        });
        console.log(Users);
        Users.save(function (err, Users) {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    message: 'Error when creating Users',
                    error: err
                });
            }

            return res.status(201).json(Users);
        });
    },

    /**
     * UsersController.update()
     */
    update: function (req, res) {
        var id = req.params.id;

        UsersModel.findOne({ _id: id }, function (err, Users) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Users',
                    error: err
                });
            }

            if (!Users) {
                return res.status(404).json({
                    message: 'No such Users'
                });
            }

            Users.username = req.body.username ? req.body.username : Users.username;
            Users.password = req.body.password ? req.body.password : Users.password;
            Users.pfppath = req.body.pfppath ? req.body.pfppath : Users.pfppath;
            Users.signupdate = req.body.signupdate ? req.body.signupdate : Users.signupdate;
            Users.bookmarks = req.body.bookmarks ? req.body.bookmarks : Users.bookmarks;
            Users.interested = req.body.interested ? req.body.interested : Users.interested;
            Users.admin = req.body.admin ? req.body.admin : Users.admin;

            Users.save(function (err, Users) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating Users.',
                        error: err
                    });
                }

                return res.json(Users);
            });
        });
    },

    /**
     * UsersController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;

        UsersModel.findByIdAndRemove(id, function (err, Users) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the Users.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    }
};
