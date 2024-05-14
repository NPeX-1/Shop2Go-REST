var OffersModel = require('../models/OffersModel.js');
const NodeGeocoder = require('node-geocoder');
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

    /**
     * OffersController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        OffersModel.findOne({ _id: id }, function (err, Offers) {
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
            const userCoordinates = {
                type: "Point",
                coordinates: [res2[0].latitude, res2[0].longitude],
            };

            var Offers = new OffersModel({
                name: req.body.name,
                description: req.body.description,
                price: req.body.price,
                postDate: req.body.postDate,
                available: req.body.available,
                pictures: req.body.pictures,
                originSite: req.body.originSite,
                location: req.body.location,
                geodata: userCoordinates
            });

            Offers.save(function (err, Offers) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when creating Offers',
                        error: err
                    });
                }

                return res.status(201).json(Offers);
            });
        });
    },

    createAutomatic: function (req, res) {
        geocoder.geocode(req.body.location, function (err, res2) {
            const userCoordinates = {
                type: "Point",
                coordinates: [res2[0].latitude, res2[0].longitude],
            };
            var Offers = new OffersModel({
                name: req.body.name,
                description: req.body.description,
                price: req.body.price,
                postDate: req.body.postDate,
                scrapeDate: req.body.scrapeDate,
                linkToOriginal: req.body.linkToOriginal,
                available: req.body.available,
                pictures: req.body.pictures,
                originSite: req.body.originSite,
                location: req.body.location,
                geodata: userCoordinates
            });

            Offers.save(function (err, Offers) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when creating Offers',
                        error: err
                    });
                }

                return res.status(201).json(Offers);
            });
        });
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
    }
};
