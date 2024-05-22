var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LogsSchema = new Schema({
	'APIKey': String,
	'log': String,
	'logDate': Date
});

module.exports = mongoose.model('Logs', LogsSchema);
