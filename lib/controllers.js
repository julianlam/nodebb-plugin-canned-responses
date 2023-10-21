'use strict';

const async = require('async');
const validator = require('validator');

const responses = require('./responses');

const hostControllerHelpers = require.main.require('./src/controllers/helpers');
const accountHelpers = require.main.require('./src/controllers/accounts/helpers');
const categories = require.main.require('./src/categories');
const db = require.main.require('./src/database');

const Controllers = {};

Controllers.renderAdminPage = function (req, res, next) {
	async.parallel({
		categories: function (next) {
			async.waterfall([
				function (next) {
					db.getSortedSetRange('categories:cid', 0, -1, next);
				},
				function (cids, next) {
					categories.getCategoriesData(cids, next);
				},
			], next);
		},
		responses: async.apply(responses.list, 0, { parse: true }),
	}, (err, data) => {
		if (err) {
			return next(err);
		}
		res.render('admin/plugins/canned-responses', {
			title: 'Canned Responses',
			responses: data.responses,
			categories: data.categories,
		});
	});
};

Controllers.get = async function (req, res, next) {
	const userData = await accountHelpers.getUserDataByUserSlug(req.params.userslug, req.uid, req.query);
	if (!userData) {
		return next();
	}
	if (!req.params.responseId) {
		responses.list(req.user.uid, {
			parse: true,
		}, (err, responses) => {
			if (err) {
				return next(err);
			}
			userData.responses = responses;
			res.render('account/canned-responses', userData);
		});
	} else {
		if (!res.locals.isAPI) {
			return hostControllerHelpers.notFound(req, res);
		}

		responses.get(req.params.responseId, (err, responseData) => {
			if (err) {
				return next(err);
			}
			responseData.title = validator.escape(responseData.title);
			responseData.text = validator.escape(responseData.text);
			res.render('partials/canned-responses/update', responseData);
		});
	}
};

Controllers.getAll = function (req, res) {
	responses.list(req.user.uid, {
		parse: true,
		all: true,
	// eslint-disable-next-line handle-callback-err
	}, (err, responses) => {
		res.json({
			responses: responses,
		});
	});
};

Controllers.getDefaults = function (req, res) {
	responses.getDefaultMapping((err, mapping) => {
		res.status(err ? 500 : 200).json(mapping || {});
	});
};

Controllers.add = function (req, res, next) {
	responses.add(req.user.uid, (err, responseId) => {
		if (err) {
			return next(err);
		}

		responses.update(responseId, req.body, (err) => {
			if (err) {
				return next(err);
			}

			res.sendStatus(200);
		});
	});
};

Controllers.addGlobal = function (req, res, next) {
	responses.add(0, (err, responseId) => {
		if (err) {
			return next(err);
		}

		responses.update(responseId, req.body, (err) => {
			if (err) {
				return next(err);
			}

			res.sendStatus(200);
		});
	});
};

Controllers.update = function (req, res, next) {
	if (req.params.responseId) {
		responses.update(req.params.responseId, req.body, (err) => {
			if (err) {
				return next(err);
			}

			res.sendStatus(200);
		});
	} else {
		res.sendStatus(404);
	}
};

Controllers.delete = function (req, res, next) {
	if (req.params.responseId) {
		responses.delete(req.params.responseId, req.user.uid, (err) => {
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
