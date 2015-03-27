'use strict';

var responses = require('./responses'),

	Controllers = {};

// Controllers.renderAdminPage = function (req, res, next) {
// 	res.render('admin/plugins/quickstart', {});
// };

Controllers.list = function(req, res) {
	responses.list(req.user.uid, function(err, responses) {
		res.render('account/canned-responses', {
			responses: responses
		});
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