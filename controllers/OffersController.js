var OffersModel = require('../models/OffersModel.js');
const NodeGeocoder = require('node-geocoder');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

const options = {
    provider: 'openstreetmap'
};
const geocoder = NodeGeocoder(options);

const puppeteer = require('puppeteer');
const cron = require('node-cron');

let scraperStatus = {
    lastRun: null,
    isRunning: false,
    error: null
};

async function scrapeData() {
    scraperStatus.isRunning = true;
    scraperStatus.lastRun = new Date();

    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto('https://www.ceneje.si/', { waitUntil: 'networkidle2' });

        const data = await page.evaluate(() => {
            let results = [];
            let items = document.querySelectorAll('.product');

            items.forEach((item) => {
                results.push({
                    name: item.querySelector('.product-title')?.innerText,
                    price: item.querySelector('.product-price')?.innerText,
                    link: item.querySelector('a')?.href
                });
            });
            return results;
        });

        console.log(data);

        await browser.close();
        scraperStatus.error = null;
    } catch (error) {
        scraperStatus.error = error.message;
    }

    scraperStatus.isRunning = false;
}

cron.schedule('*/5 * * * *', () => {
    scrapeData();
});

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
        var query = req.body.query.split(" ");
        var regex = ".*";
        for (var i = 0; i < query.length; i++) {
            regex += "(?=.*" + query[i] + "\\b).*"
        }
        regex += ".*";
        console.log(regex);
        OffersModel.find({ geodata: { $geoWithin: { $centerSphere: [[req.body.x, req.body.y], req.body.distance / 3963.2] } }, "name": { $regex: regex, $options: "i" } }, function (err, Offerss) {
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

            var image = "";
            req.file == undefined ? image = "" : "/images/" + req.file.filename;
            var Offers = new OffersModel({
                name: req.body.name,
                description: req.body.description,
                price: req.body.price,
                postDate: new Date(Date.now()).toISOString(),
                available: req.body.available,
                pictures: image,
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
                scrapeDate: new Date(Date.now()).toISOString(),
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
