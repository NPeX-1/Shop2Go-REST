var UsersModel = require('../models/UsersModel.js');
var OffersModel = require('../models/OffersModel.js')
var ObjectId = require('mongoose').Types.ObjectId;

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
    
        UsersModel.findOne({ _id: id }, 'username pfppath', function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting user information.',
                    error: err
                });
            }
    
            if (!user) {
                return res.status(404).json({
                    message: 'User not found.'
                });
            }
    
            return res.json(user);
        });
    },
    
    

    getPostsByUser: async function (req, res) {
        try {
            const userId = req.params.userId;
            const posts = await OffersModel.find({ userId: userId });
            res.json(posts);
        } catch (err) {
            res.status(500).json({ error: 'Failed to fetch posts' });
        }
    },

    wishlist: function (req, res) {
        var id = req.session.userId;

        UsersModel.findOne({ _id: id }, function (err, Users) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Users.',
                    error: err
                });
            }
            var newPosts = [];
            for (var i = 0; i < Users.interested.length; i++) {
                var query = Users.interested[i].split(" ");
                var regex = ".*";
                for (var i = 0; i < query.length; i++) {
                    regex += "(?=.*" + query[i] + "\\b).*"
                }
                regex += ".*";
                console.log(regex);
                OffersModel.find(
                    {
                        "name": { $regex: regex, $options: "i" },
                        "postTime": { "$gt": Date(Date.now()).toISOString(), }
                    }, function (err, Offers) {
                        if (err) {
                            return res.status(500).json({
                                message: 'Error when getting Wishlist.',
                                error: err
                            });
                        }

                        for (offer in Offers) {
                            var objInterest = {
                                action: ObjectId(offer._id),
                                update: false
                            };
                            newPosts.push(objInterest);
                        }


                    });
            }
            if (!Users) {
                return res.status(404).json({
                    message: 'No such Wishlist Items Yet'
                });
            }

            UsersModel.findOneAndUpdate({ _id: id }, { $push: { interestedReplies: { $each: newPosts } }, lastrefresh: Date(Date.now()).toISOString() }, { new: true }).populate("interestedReplies.action").populate("bookmarks.bookmark").exec(function (err, Users2) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when getting Users.',
                        error: err
                    });
                }

                if (!Users2) {
                    return res.status(404).json({
                        message: 'No such Users'
                    });
                }

                return res.json(Users2);
            });
        });
    },


    bookmarks: function (req, res) {
        var id = req.session.userId;

        UsersModel.findOne({ _id: id }, function (err, Users) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Users.',
                    error: err
                });
            }
            OffersModel.find({
                "$and": [{ "available": false },
                { "postTime": { "$gt": Date(Date.now()).toISOString(), } }]
            }, function (err, Offers) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when getting Bookamrks.',
                        error: err
                    });
                }

                for (offer in Offers) {
                    var objInterest = {
                        action: ObjectId(offer._id),
                        update: true
                    };
                    newPosts.push(objInterest);
                }


            });
            if (!Users) {
                return res.status(404).json({
                    message: 'No such Bookmarked Items Yet'
                });
            }

            UsersModel.findOneAndUpdate({ _id: id }, { $push: { interestedReplies: { $each: newPosts } } }, { new: true }).populate("interestedReplies.action").populate("bookmarks.bookmark").exec(function (err, Users2) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when getting Users.',
                        error: err
                    });
                }

                if (!Users2) {
                    return res.status(404).json({
                        message: 'No such Users'
                    });
                }

                return res.json(Users2);
            });
        });
    },


    /**
     * UsersController.create()
     */
    create: function (req, res) {
        var pfp = "";
        if (req.file != undefined) {
            pfp = "/images/profilepics/" + req.file.filename;
        }
        var Users = new UsersModel({
            username: req.body.username,
            password: req.body.password,
            pfppath: pfp,
            email: req.body.email,
            signupdate: new Date(Date.now()).toISOString(),
            lastrefresh: new Date(Date.now()).toISOString(),
            bookmarks: Array[null],
            interested: Array[null],
            interestedReplies: Array[null],
            history: Array[null],
            admin: false
        });
        console.log(Users)
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

    createBookmark: function (req, res) {
        var id = req.params.id
        UsersModel.findOneAndUpdate({ _id: req.session.userId }, { $push: { bookmarks: ObjectId(id) } }, { new: true }).populate("interestedReplies.action").populate("bookmarks").exec(function (err, Users) {
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

    getHistory: function (req, res) {
        var userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({
                message: 'You need to be logged in to view the history.'
            });
        }

        UsersModel.findById(userId, function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting user history.',
                    error: err
                });
            }

            if (!user) {
                return res.status(404).json({
                    message: 'User not found.'
                });
            }

            return res.json(user.history);
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
            Users.email = req.body.email ? req.body.email : Users.email;
            Users.signupdate = Users.signupdate;
            Users.lastrefresh = new Date(Date.now()).toISOString();
            Users.bookmarks = Users.bookmarks;
            Users.interested = Users.interested;
            Users.interestedReplies = Users.interestedReplies;
            Users.history = Users.history;
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
    },


    addInterest: function (req, res) {
        var id = req.query.id;
        var interest = req.query.interest;
        UsersModel.updateOne({ _id: id }, { $push: { interested: interest } }, function (err, result) {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: "Internal server error" });
            } else {
                return res.status(204).json()
            }
        });
    },

    removeWishlistItem: function (req, res) {
        var id = req.params.id;

        UsersModel.findOneAndUpdate({ _id: id }, { $pull: { interested: req.body.toRemove } }, { new: true }, function (err, Users) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the Users.',
                    error: err
                });
            }

            return res.status(200).json(Users);
        });

    },

    login: function (req, res, next) {
        UsersModel.authenticate(req.body.username, req.body.password, function (err, user) {
            if (err || !user) {
                var err = new Error('Wrong username or paassword');
                err.status = 401;
                return next(err);
            }
            req.session.userId = user._id;
            return res.json(user);
        });
    },

    logout: function (req, res, next) {
        if (req.session) {
            req.session.destroy(function (err) {
                if (err) {
                    return next(err);
                } else {
                    return res.status(200).json({});
                }
            });
        }

    }
};
