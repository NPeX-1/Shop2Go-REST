var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var OffersSchema = new Schema({
	'name' : String,
	'description' : String,
	'price' : Number,
	'postDate' : Date,
	'scrapeDate' : Date,
	'linkToOriginal' : String,
	'available' : Boolean,
	'pictures' : Array,
	'originSite' : String,
	'location' : String,
	'latitude' : Number,
	'longitude' : Number
});

module.exports = mongoose.model('Offers', OffersSchema);
