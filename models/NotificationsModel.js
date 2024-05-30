var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var NotificationsSchema = new Schema({
	'action' : {
	 	type: Schema.Types.ObjectId,
	 	ref: 'Offers'
	},
	'update' : Boolean,
	'seen' : Boolean
});

module.exports = mongoose.model('Notifications', NotificationsSchema);
