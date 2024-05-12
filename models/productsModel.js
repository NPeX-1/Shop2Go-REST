var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var productsSchema = new Schema({
	'price' : Number,
	'name' : String,
	'description' : String,
	'category' : String,
	'image' : String,
	'reviews' : Array,
	'creationDate' : Date
});

module.exports = mongoose.model('products', productsSchema);
