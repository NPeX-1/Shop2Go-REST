var OffersModel = require('../models/OffersModel.js');
var UsersModel = require('../models/UsersModel.js');
var HistoryModel = require('../models/historyModel.js');
const NodeGeocoder = require('node-geocoder');
var ObjectId = require('mongoose').Types.ObjectId;
const multer = require('multer');
const path = require('path');

const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8000 });
wss.on('connection', (ws) => {
    console.log('A new client connected');

    // Handle incoming messages
    ws.on('message', (message) => {
        console.log(`Received message: ${message}`);
    });

    // Handle client disconnection
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

const minutes = 30;
const interval = minutes * 60 * 1000;

setInterval(() => {
    console.log("Refreshing");
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send("NewPost");
        }
    });
}, interval);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { files: 10 }
});

const options = {
    provider: 'openstreetmap'
};
const geocoder = NodeGeocoder(options);


/**
 * OffersController.js
 *
 * @description :: Server-side logic for managing Offerss.
 */
module.exports = {

    /**
     * OffersController.list()
     */
    list: function (req, res) {
        var query = req.query.query;

        var searchQuery = {};

        if (query) {
            searchQuery.$text = { $search: query };
        }
        OffersModel.find(searchQuery, function (err, Offerss) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Offers.',
                    error: err
                });
            }

            return res.json(Offerss);
        });
    },

    search: function (req, res) {
        var radius = parseFloat(req.query.radius) * 0.000621371192
        var latitude = parseFloat(req.query.latitude)
        var longitude = parseFloat(req.query.longitude)

        if (req.query.query.includes(" ")) {
            var query = req.query.query.split(" ");
            var regex = ".*";
            for (var i = 0; i < query.length; i++) {
                regex += "(?=.*" + query[i] + "\\b).*"
            }
            regex += ".*";
        } else if (req.query.query == "") {
            var regex = ".*"
        }
        else {
            var query = req.query.query
            var regex = ".*";
            regex += "(?=.*" + query + "\\b).*"
            regex += ".*";
        }

        OffersModel.find({ geodata: { $geoWithin: { $centerSphere: [[latitude, longitude], radius / 3963.2] } }, "name": { $regex: regex, $options: "i" }, "originSite": req.query.store, "validated": true }).populate("postedBy").exec(function (err, Offerss) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Offers.',
                    error: err
                });
            }

            var objHistory = new HistoryModel({
                searchQuery: req.body.query,
                action: 'search',
                actionTime: new Date(Date.now()).toISOString(),
            });
            objHistory.save(function (err, HistoryEntry) {

                var userId = req.session.userId;
                if (userId) {
                    UsersModel.findByIdAndUpdate(userId, {
                        $push: {
                            history: ObjectId(HistoryEntry._id)
                        }
                    }, function (err, user) {
                        if (err) {
                            console.error('Error when updating user history:', err);
                        }
                    });
                }
            });

            return res.json(Offerss);
        });
    },

    /**
     * OffersController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        OffersModel.findOne({ _id: id }).populate("postedBy").exec(function (err, Offers) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Offers.',
                    error: err
                });
            }

            if (!Offers) {
                return res.status(404).json({
                    message: 'No such Offers'
                });
            }

            return res.json(Offers);
        });
    },

    /**
     * OffersController.create()
     */

    createManual: function (req, res) {
        geocoder.geocode(req.body.location, function (err, res2) {
            var userCoordinates = {
                type: "Point",
                coordinates: [0, 0],
            };

            if (res2.length != 0) {
                userCoordinates = {
                    type: "Point",
                    coordinates: [res2[0].latitude, res2[0].longitude],
                };
            }

            var images = [];
            if (req.files != undefined) {
                for (var i = 0; i < req.files.length; i++) {
                    images.push("/images/" + req.files[i].filename)
                }
            }
            else {
                images.push("")
            }

            const regex = /(?<=\d)\.(?=\d{3})/g;
            var Offers = new OffersModel({
                name: req.body.name,
                description: req.body.description,
                price: req.body.price.replace(regex, ''),
                postDate: new Date(Date.now()).toISOString(),
                available: true,
                postedBy: req.session.userId,
                pictures: images,
                originSite: "INTERNAL",
                location: req.body.location,
                geodata: userCoordinates,
                validated: true
            });

            Offers.save(function (err, Offer) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when creating Offers',
                        error: err
                    });
                }

                var userId = req.session.userId;
                if (userId) {
                    var objHistory = new HistoryModel({
                        offerId: ObjectId(Offer._id),
                        action: 'create',
                        actionTime: new Date(Date.now()).toISOString(),
                    });
                    objHistory.save(function (err, HistoryEntry) {

                        UsersModel.findOneAndUpdate({ _id: userId }, {
                            $push: {
                                history: ObjectId(HistoryEntry._id)
                            }
                        }, function (err, history) {
                            if (err) {
                                console.error('Error when updating user history:', err);
                            }
                        });
                    });
                }

                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send("NewPost");
                    }
                });
                return res.status(201).json(Offer);
            });
        });
    },

    createAutomatic: function (req, res) {
        geocoder.geocode(req.body.location, function (err, res2) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating Offers',
                    error: err
                });
            }

            if (res2.length == 0) {
                var secondTry = req.body.location.split(",")
                geocoder.geocode(secondTry[0], function (err, res3) {
                    if (err) {
                        return res.status(500).json({
                            message: 'Error when creating Offers',
                            error: err
                        });
                    }
                    res2 = res3
                }
                )
            }

            OffersModel.findOne({ linkToOriginal: req.body.linkToOriginal }, function (err, res4) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when creating Offers',
                        error: err
                    });
                }

                if (res4) {
                    return res.status(302).json({
                        message: 'Already Exists'
                    });
                }


                var userCoordinates = {
                    type: "Point",
                    coordinates: [0, 0],
                };

                if (res2.length != 0) {
                    userCoordinates = {
                        type: "Point",
                        coordinates: [res2[0].latitude, res2[0].longitude],
                    };
                }

                const regex = /(?<=\d)\.(?=\d{3})/g;
                var Offers = new OffersModel({
                    name: req.body.name,
                    description: req.body.description,
                    price: req.body.price.replace(regex, ''),
                    postDate: req.body.postDate,
                    scrapeDate: new Date(Date.now()).toISOString(),
                    linkToOriginal: req.body.linkToOriginal,
                    available: req.body.available,
                    pictures: req.body.pictures,
                    originSite: req.body.originSite,
                    location: req.body.location,
                    geodata: userCoordinates,
                    validated: (res2.length == 0) ? false : true
                });

                Offers.save(function (err, Offers) {
                    if (err) {
                        console.log(err)
                        return res.status(500).json({
                            message: 'Error when creating Offers',
                            error: err
                        });
                    }
                    wss.clients.forEach((client) => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send("NewPost");
                        }
                    });
                    return res.status(201).json(Offers);
                });
            })
        });
    },

    timeToNextScrape: async function (req, res) {
        try {
            const latestOffer = await OffersModel.findOne({ originSite: "AVTONET" }).sort({ scrapeDate: -1 }).exec();
            if (!latestOffer) {
                return res.status(404).json({
                    message: 'No offers found.'
                });
            }

            const latestScrapeDate = Math.floor(new Date(latestOffer.scrapeDate).getTime() / 1000);
            const currentTime = Math.floor(new Date().getTime() / 1000);
            const timeDifference = currentTime - latestScrapeDate;
            const tenMinutes = 10 * 60;
            const timeToNextScrape = timeDifference % tenMinutes;

            return res.json({
                timeToNextScrape: timeToNextScrape > 0 ? timeToNextScrape : 0
            });

        } catch (err) {
            console.log(err)
            return res.status(500).json({
                message: 'Error when calculating time to next scrape.',
                error: err
            });
        }
    },

    timeToNextScrapeBolha: async function (req, res) {
        try {
            const latestOffer = await OffersModel.findOne({ originSite: "BOLHA" }).sort({ scrapeDate: -1 }).exec();
            if (!latestOffer) {
                return res.status(404).json({
                    message: 'No offers found.'
                });
            }

            const latestScrapeDate = Math.floor(new Date(latestOffer.scrapeDate).getTime() / 1000);
            const currentTime = Math.floor(new Date().getTime() / 1000);
            const timeDifference = currentTime - latestScrapeDate;
            const tenMinutes = 120 * 60;
            const timeToNextScrape = timeDifference % tenMinutes;

            return res.json({
                timeToNextScrape: timeToNextScrape > 0 ? timeToNextScrape : 0
            });

        } catch (err) {
            return res.status(500).json({
                message: 'Error when calculating time to next scrape.',
                error: err
            });
        }
    },

    /**
     * OffersController.update()
     */
    update: function (req, res) {
        var id = req.params.id;

        OffersModel.findOne({ _id: id }, function (err, Offers) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Offers',
                    error: err
                });
            }

            if (!Offers) {
                return res.status(404).json({
                    message: 'No such Offers'
                });
            }

            Offers.name = req.body.name ? req.body.name : Offers.name;
            Offers.description = req.body.description ? req.body.description : Offers.description;
            Offers.price = req.body.price ? req.body.price : Offers.price;
            Offers.postDate = req.body.postDate ? req.body.postDate : Offers.postDate;
            Offers.scrapeDate = req.body.scrapeDate ? req.body.scrapeDate : Offers.scrapeDate;
            Offers.linkToOriginal = req.body.linkToOriginal ? req.body.linkToOriginal : Offers.linkToOriginal;
            Offers.available = req.body.available ? req.body.available : Offers.available;
            Offers.pictures = req.body.pictures ? req.body.pictures : Offers.pictures;
            Offers.originSite = req.body.originSite ? req.body.originSite : Offers.originSite;
            Offers.location = req.body.location ? req.body.location : Offers.location;
            Offers.latitude = req.body.latitude ? req.body.latitude : Offers.latitude;
            Offers.longitude = req.body.longitude ? req.body.longitude : Offers.longitude;

            Offers.save(function (err, Offers) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating Offers.',
                        error: err
                    });
                }

                return res.json(Offers);
            });
        });
    },

    /**
     * OffersController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;

        OffersModel.findByIdAndRemove(id, function (err, Offers) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the Offers.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    },


    unlist: function (req, res) {
        var id = req.params.id
        OffersModel.findOne({
            _id: id
        }).exec(function (err, Bookmark) {
            if (!Bookmark) {
                return res.status(500)
            }

            if (Bookmark.available) {
                OffersModel.findByIdAndUpdate(id, { $set: { available: false } }, { new: true }, function (err, Offers) {
                    if (err) {
                        return res.status(500).json({
                            message: 'Error when deleting the Offers.',
                            error: err
                        });
                    }
                    return res.status(204).json();
                });
            } else {
                OffersModel.findByIdAndUpdate(id, { $set: { available: true } }, { new: true }, function (err, Offers) {
                    if (err) {
                        return res.status(500).json({
                            message: 'Error when deleting the Offers.',
                            error: err
                        });
                    }
                    return res.status(204).json();
                });
            }
        });
    },

    toValidate: function (req, res) {
        OffersModel.find({ validated: false }, function (err, Offers) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when finding offers to validate.',
                    error: err
                });
            }

            return res.json(Offers);
        });
    },

    validate: function (req, res) {
        const userCoordinates = {
            type: "Point",
            coordinates: [req.body.lat, req.body.lon],
        };
        OffersModel.findOneAndUpdate(
            { _id: req.params.id },
            { $set: { validated: true, geodata: userCoordinates, location: req.body.location } },
            { new: true },
            function (err, updatedOffer) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when finding and updating offer.',
                        error: err
                    });
                }
                if (!updatedOffer) {
                    return res.status(404).json({
                        message: 'Offer not found or already validated.'
                    });
                }
                return res.json(updatedOffer);
            }
        );
    },

    tryValidate: function (req, res) {
        geocoder.geocode(req.body.location, function (err, Geocoded) {
            if (err) {
                return res.status(500).message(err);
            }
            return res.json(Geocoded);
        });
    },
};
