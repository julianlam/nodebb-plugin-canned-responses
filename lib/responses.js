'use strict';

var db = require.main.require('./src/database');
var utils = require.main.require('./public/src/utils');
var plugins = require.main.require('./src/plugins');
var meta = require.main.require('./src/meta');

var async = require.main.require('async');
var S = require('string');

var responses = {};

responses.list = function(uid, options, callback) {
	var responseIds;
	async.waterfall([
		function(next) {
			if (options.all === true) {
				db.getSortedSetUnion({sets: ['canned-responses:index:' + uid, 'canned-responses:index:0'], start: 0, stop: -1}, next);	
			} else {
				db.getSortedSetRange('canned-responses:index:' + uid, 0, -1, next);
			}
		},
		function(_responseIds, next) {
			responseIds = _responseIds;
			var keys = responseIds.map(function(responseId) {
				return 'canned-responses:' + responseId;
			});
			db.getObjects(keys, next);
		},
		function(responses, next) {
			// Escape raw text for inclusion in HTML
			responses.forEach(function (response) {
				response.text_escaped = S(response.text).escapeHTML().s;
			});

			if (options.parse) {
				async.map(responses, function(response, next) {
					plugins.fireHook('filter:parse.raw', response.text, function(err, html) {
						response.html = !err ? html : '<span>Could not parse response HTML</span>';
						next(null, response);
					});
				}, next);
			} else {
				next(null, responses);
			}
		}
	], function(err, responses) {
		if (err) {
			return callback(err);
		}

		callback(null, responses.map(function(response, idx) {
			response.id = responseIds[idx];
			return response;
		}));
	});
};

responses.get = function(responseId, callback) {
	db.getObject('canned-responses:' + responseId, callback);
};

responses.getDefaultMapping = function(callback) {
	async.parallel({
		list: async.apply(responses.list, 0, {}),
		defaults: async.apply(db.getObject, 'settings:canned-responses:defaults')
	}, function(err, data) {
		if (err) {
			return callback(err);
		}

		data.list = data.list.reduce(function(memo, current) {
			memo[current.id] = current.text;
			return memo;
		}, {});

		for(var cid in data.defaults) {
			if (data.defaults.hasOwnProperty(cid) && data.defaults[cid]) {
				data.defaults[cid] = data.list[data.defaults[cid]];
			}
		}

		callback(null, data.defaults);
	});
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
	var accepted = ['title', 'text'];
	var maxLen = parseInt(meta.config.maximumPostLength, 10);

	// Sanitise payload
	for(var prop in payload) {
		if (accepted.indexOf(prop) === -1) {
			delete payload[prop];
		}
	}

	// Reject if text is longer than site configured maximum
	if (payload.text.length > maxLen) {
		return callback(new Error('[[error:invalid-data]]'));
	}

	db.setObject('canned-responses:' + responseId, payload, callback);
};

responses.delete = function(responseId, uid, callback) {
	async.parallel([
		async.apply(db.delete, 'canned-responses:' + responseId),
		async.apply(db.sortedSetRemove, 'canned-responses:index:' + uid, responseId),
		async.apply(db.sortedSetRemove, 'canned-responses:index:0', responseId)
	], callback);
};

module.exports = responses;
