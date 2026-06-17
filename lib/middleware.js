'use strict';

const middleware = module.exports;
const helpers = nodebb.require('./src/controllers/helpers');

middleware.restrictToProfileOwner = function (req, res, next) {
	if (!req.user || parseInt(req.user.uid, 10) !== parseInt(res.locals.uid, 10)) {
		helpers.notAllowed(req, res);
	} else {
		next();
	}
};
