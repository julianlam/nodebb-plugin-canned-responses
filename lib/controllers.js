'use strict';

var async = require('async');

var responses = require('./responses');

var hostControllerHelpers = require.main.require('./src/controllers/helpers'),
	categories = require.main.require('./src/categories'),
	db = require.main.require('./src/database');

var Controllers = {};

Controllers.renderAdminPage = function (req, res, next) {
	async.parallel({
		categories: function(next) {
			async.waterfall([
				function (next) {
					db.getSortedSetRange('categories:cid', 0, -1, next);
				},
				function (cids, next) {
					categories.getCategoriesData(cids, next);
				}
			], next);
		},
		responses: async.apply(responses.list, 0, { parse: true })
	}, function(err, data) {
		res.render('admin/plugins/canned-responses', {
			responses: data.responses,
			categories: data.categories
		});
	});
};

Controllers.get = function(req, res) {
	if (!req.params.responseId) {
		responses.list(req.user.uid, {
			parse: true
		}, function(err, responses) {
			res.render('account/canned-responses', {
				responses: responses
			});
		});
	} else {
		if (!res.locals.isAPI) {
			return hostControllerHelpers.notFound(req, res);
		}

		responses.get(req.params.responseId, function(err, responseData) {
			res.render('partials/canned-responses/update', responseData);
		});
	}
};

Controllers.getAll = function(req, res) {
	responses.list(req.user.uid, {
		parse: true,
		all: true
	}, function(err, responses) {
		res.json({
			responses: responses
		});
	});
};

Controllers.getDefaults = function(req, res) {
	responses.getDefaultMapping(function(err, mapping) {
		res.status(err ? 500 : 200).json(mapping);
	});
};

Controllers.add = function(req, res, next) {
	responses.add(req.user.uid, function(err, responseId) {
		if (err) {
			return next(err);
		}

		responses.update(responseId, req.body, function(err) {
			if (err) {
				return next(err);
			}

			res.sendStatus(200);
		});
	});
};

Controllers.addGlobal = function(req, res, next) {
	responses.add(0, function(err, responseId) {
		if (err) {
			return next(err);
		}

		responses.update(responseId, req.body, function(err) {
			if (err) {
				return next(err);
			}

			res.sendStatus(200);
		});
	});
};

Controllers.update = function(req, res, next) {
	if (req.params.responseId) {
		responses.update(req.params.responseId, req.body, function(err) {
			if (err) {
				return next(err);
			}

			res.sendStatus(200);
		});
	} else {
		res.sendStatus(404);
	}
};

Controllers.delete = function(req, res, next) {
	if (req.params.responseId) {
		responses.delete(req.params.responseId, req.user.uid, function(err) {
			if (err) {
				return next(err);
			}

			res.sendStatus(200);
		});
	} else {
		res.sendStatus(404);
	}
};

module.exports = Controllers;