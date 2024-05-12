var ProductsModel = require('../models/productsModel.js');

/**
 * productsController.js
 *
 * @description :: Server-side logic for managing productss.
 */
module.exports = {

    /**
     * productsController.list()
     */
    list: function (req, res) {
        ProductsModel.find(function (err, productss) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting products.',
                    error: err
                });
            }

            return res.json(productss);
        });
    },

    /**
     * productsController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        ProductsModel.findOne({_id: id}, function (err, products) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting products.',
                    error: err
                });
            }

            if (!products) {
                return res.status(404).json({
                    message: 'No such products'
                });
            }

            return res.json(products);
        });
    },

    /**
     * productsController.create()
     */
    create: function (req, res) {
        var products = new ProductsModel({
			price : req.body.price,
			name : req.body.name,
			description : req.body.description,
			category : req.body.category,
			image : req.body.image,
			reviews : req.body.reviews,
			creationDate : req.body.creationDate
        });

        products.save(function (err, products) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating products',
                    error: err
                });
            }

            return res.status(201).json(products);
        });
    },

    /**
     * productsController.update()
     */
    update: function (req, res) {
        var id = req.params.id;

        ProductsModel.findOne({_id: id}, function (err, products) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting products',
                    error: err
                });
            }

            if (!products) {
                return res.status(404).json({
                    message: 'No such products'
                });
            }

            products.price = req.body.price ? req.body.price : products.price;
			products.name = req.body.name ? req.body.name : products.name;
			products.description = req.body.description ? req.body.description : products.description;
			products.category = req.body.category ? req.body.category : products.category;
			products.image = req.body.image ? req.body.image : products.image;
			products.reviews = req.body.reviews ? req.body.reviews : products.reviews;
			products.creationDate = req.body.creationDate ? req.body.creationDate : products.creationDate;
			
            products.save(function (err, products) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating products.',
                        error: err
                    });
                }

                return res.json(products);
            });
        });
    },

    /**
     * productsController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;

        ProductsModel.findByIdAndRemove(id, function (err, products) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the products.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    }
};
