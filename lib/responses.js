'use strict';

const db = require.main.require('./src/database');
const utils = require.main.require('./public/src/utils');
const plugins = require.main.require('./src/plugins');
const meta = require.main.require('./src/meta');

const async = require('async');
const validator = require('validator');

const responses = {};

responses.list = function (uid, options, callback) {
	let responseIds;
	async.waterfall([
		function (next) {
			if (options.all === true) {
				db.getSortedSetUnion({ sets: [`canned-responses:index:${uid}`, 'canned-responses:index:0'], start: 0, stop: -1 }, next);
			} else {
				db.getSortedSetRange(`canned-responses:index:${uid}`, 0, -1, next);
			}
		},
		function (_responseIds, next) {
			responseIds = _responseIds;
			const keys = responseIds.map(responseId => `canned-responses:${responseId}`);
			db.getObjects(keys, next);
		},
		function (responses, next) {
			responses.forEach((response) => {
				response.text = validator.escape(response.text);
				response.title = validator.escape(response.title);
			});

			if (options.parse) {
				async.map(responses, (response, next) => {
					plugins.hooks.fire('filter:parse.raw', response.text, (err, html) => {
						response.html = !err ? html : '<span>Could not parse response HTML</span>';
						next(null, response);
					});
				}, next);
			} else {
				next(null, responses);
			}
		},
	], (err, responses) => {
		if (err) {
			return callback(err);
		}

		callback(null, responses.map((response, idx) => {
			response.id = responseIds[idx];
			return response;
		}));
	});
};

responses.get = function (responseId, callback) {
	db.getObject(`canned-responses:${responseId}`, callback);
};

responses.getDefaultMapping = function (callback) {
	async.parallel({
		list: async.apply(responses.list, 0, {}),
		defaults: async.apply(db.getObject, 'settings:canned-responses:defaults'),
	}, (err, data) => {
		if (err) {
			return callback(err);
		}

		data.list = data.list.reduce((memo, current) => {
			memo[current.id] = current.text;
			return memo;
		}, {});

		// eslint-disable-next-line no-restricted-syntax
		for (const cid in data.defaults) {
			if (data.defaults.hasOwnProperty(cid) && data.defaults[cid]) {
				data.defaults[cid] = data.list[data.defaults[cid]];
			}
		}

		callback(null, data.defaults);
	});
};

responses.add = function (uid, callback) {
	const responseId = utils.generateUUID();

	async.waterfall([
		async.apply(db.sortedSetCard, `canned-responses:index:${uid}`),
		function (count, next) {
			db.sortedSetAdd(`canned-responses:index:${uid}`, count + 1, responseId, next);
		},
	], (err) => {
		callback(err, responseId);
	});
};

responses.update = function (responseId, payload, callback) {
	const accepted = ['title', 'text'];
	const maxLen = parseInt(meta.config.maximumPostLength, 10);

	// Sanitise payload
	// eslint-disable-next-line no-restricted-syntax
	for (const prop in payload) {
		if (accepted.indexOf(prop) === -1) {
			delete payload[prop];
		}
	}

	// Reject if text is longer than site configured maximum
	if (payload.text.length > maxLen) {
		return callback(new Error('[[error:invalid-data]]'));
	}

	db.setObject(`canned-responses:${responseId}`, payload, callback);
};

responses.delete = function (responseId, uid, callback) {
	async.parallel([
		async.apply(db.delete, `canned-responses:${responseId}`),
		async.apply(db.sortedSetRemove, `canned-responses:index:${uid}`, responseId),
		async.apply(db.sortedSetRemove, 'canned-responses:index:0', responseId),
	], callback);
};

module.exports = responses;
