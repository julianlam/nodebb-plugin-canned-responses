var middleware = {},
	helpers = require.main.require('./src/controllers/helpers');

middleware.restrictToProfileOwner = function(req, res, next) {
	if (!req.user || parseInt(req.user.uid, 10) !== parseInt(res.locals.uid, 10)) {
		helpers.notAllowed(req, res);
	} else {
		next();
	}
};

module.exports = middleware;