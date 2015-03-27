var db = require.main.require('./src/database'),
	utils = require.main.require('./public/src/utils'),
	async = require.main.require('async'),

	responses = {};

responses.list = function(uid, callback) {
	db.getSortedSetRange('canned-responses:index:' + uid, 0, -1, function(err, responseIds) {
		var keys = responseIds.map(function(responseId) {
				return 'canned-responses:' + responseId;
			});

		db.getObjects(keys, function(err, responses) {
			if (err) {
				return callback(err);
			}

			callback(null, responses.map(function(response, idx) {
				response.id = responseIds[idx];
				return response;
			}));
		});
	});
};

responses.get = function(responseId, callback) {
	db.getObject('canned-responses:' + responseId, callback);
};

responses.add = function(uid, callback) {
	var responseId = utils.generateUUID();

	async.waterfall([
		async.apply(db.sortedSetCard, 'canned-responses:index:' + uid),
		function(count, next) {
			db.sortedSetAdd('canned-responses:index:' + uid, count+1, responseId, next);
		}
	], function(err) {
		callback(err, responseId);
	});
};

responses.update = function(responseId, payload, callback) {
	db.setObject('canned-responses:' + responseId, payload, callback);
};

responses.delete = function(responseId, uid, callback) {
	async.parallel([
		async.apply(db.delete, 'canned-responses:' + responseId),
		async.apply(db.sortedSetRemove, 'canned-responses:index:' + uid, responseId)
	], callback);
};

module.exports = responses;