'use strict';

var responses = require('./responses'),
	hostControllerHelpers = require.main.require('./src/controllers/helpers'),

	Controllers = {};

// Controllers.renderAdminPage = function (req, res, next) {
// 	res.render('admin/plugins/quickstart', {});
// };

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