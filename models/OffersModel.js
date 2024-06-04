var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var OffersSchema = new Schema({
	'name': String,
	'description': String,
	'price': Number,
	'postDate': Date,
	'scrapeDate': Date,
	'linkToOriginal': String,
	'available': Boolean,
	'pictures': [String],
	'validated': Boolean,
	'postedBy': {
		type: Schema.Types.ObjectId,
		ref: 'users'
	},
	'originSite': String,
	'location': String,
	'geodata': {
		'type': {
			type: String,
			default: 'Point',
		},
		coordinates: {
			type: [Number],
			default: undefined,
			required: true
		}
	}
});

module.exports = mongoose.model('Offers', OffersSchema);
