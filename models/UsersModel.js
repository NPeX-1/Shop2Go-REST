var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

var UsersSchema = new Schema({
	'username': String,
	'password': String,
	'pfppath': String,
	'signupdate': Date,
	'bookmarks': Array,
	'interested': Array,
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

module.exports = mongoose.model('Users', UsersSchema);
