var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');


var UsersSchema = new Schema({
	'username': String,
	'password': String,
	'email': String,
	'pfppath': String,
	'signupdate': Date,
	'lastrefresh': Date,
	'bookmarks': [{
		type: Schema.Types.ObjectId,
		ref: 'Offers'
	}],
	'interested': [String],
	'interestedReplies': [{
		'action': {
			type: Schema.Types.ObjectId,
			ref: 'Offers'
		},
		'update': Boolean
	}],
	'history': [{
		'offerId': {
			type: Schema.Types.ObjectId,
			ref: 'Offers'
		},
		'action': String,
		'actionTime': Date
	}],
	'admin': Boolean
});


UsersSchema.pre('save', function (next) {
	var user = this;

	bcrypt.hash(user.password, 10, function (err, hash) {
		if (err) {
			return next(err);
		}
		user.password = hash;
		next();
	})
});

UsersSchema.statics.authenticate = function (username, password, callback) {
	Users.findOne({ username: username })
		.exec(function (err, user) {
			if (err) {
				return callback(err);
			} else if (!user) {
				var err = new Error("User not found.");
				err.status = 401;
				return callback(err);
			}
			bcrypt.compare(password, user.password, function (err, result) {
				if (result === true) {
					return callback(null, user);
				} else {
					return callback();
				}
			});

		});
}

var Users = mongoose.model('users', UsersSchema);
module.exports = mongoose.model('Users', UsersSchema);
