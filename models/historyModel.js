var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var historySchema = new Schema({
	'searchQuery': String,
	'offerId' : {
	 	type: Schema.Types.ObjectId,
	 	ref: 'Offers'
	},
	'action' : String,
	'actionTime' : Date
});

module.exports = mongoose.model('history', historySchema);
