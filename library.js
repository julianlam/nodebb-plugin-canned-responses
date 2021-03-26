'use strict';

const controllers = require('./lib/controllers');
const middleware = require('./lib/middleware');

const plugin = {};
const titleMatch = /^user\/.+\/canned-responses$/;

plugin.init = function (params, callback) {
	const { router } = params;
	const hostMiddleware = params.middleware;
	const routeHelpers = require.main.require('./src/routes/helpers');
	const checks = [
		hostMiddleware.authenticateRequest,
		hostMiddleware.ensureLoggedIn,
		hostMiddleware.exposeUid,
		middleware.restrictToProfileOwner,
	];
	const ACPchecks = [hostMiddleware.authenticateRequest, hostMiddleware.ensureLoggedIn, hostMiddleware.isAdmin];

	// ACP Routes
	router.get('/admin/plugins/canned-responses', hostMiddleware.admin.buildHeader, controllers.renderAdminPage);
	router.get('/api/admin/plugins/canned-responses', controllers.renderAdminPage);
	router.route('/admin/plugins/canned-responses/:responseId?')
		.post(ACPchecks, controllers.addGlobal)
		.delete(ACPchecks, controllers.delete)
		.put(ACPchecks, controllers.update);

	// User settings routes
	routeHelpers.setupPageRoute(router, '/user/:userslug/canned-responses/:responseId?', hostMiddleware, checks, controllers.get);
	router.route('/user/:userslug/canned-responses/:responseId?')
		.post(checks, controllers.add)
		.delete(checks, controllers.delete)
		.put(checks, controllers.update);

	// Global routes
	router.get('/canned-responses', controllers.getAll);
	router.get('/canned-responses/defaults', controllers.getDefaults);

	callback();
};

plugin.addProfileItem = function (data, callback) {
	data.links.push({
		id: 'canned-responses',
		route: 'canned-responses',
		icon: 'fa-bullhorn',
		name: '[[canned-responses:title]]',
		visibility: {
			self: true,
			other: false,
			moderator: false,
			globalMod: false,
			admin: false,
		},
	});

	callback(null, data);
};

plugin.addAdminNavigation = function (header, callback) {
	header.plugins.push({
		route: '/plugins/canned-responses',
		icon: 'fa-bullhorn',
		name: '[[canned-responses:title]]',
	});

	callback(null, header);
};

plugin.addComposerButton = function (payload, callback) {
	payload.options.push({ name: 'canned-responses', className: 'fa fa-bullhorn' });
	callback(null, payload);
};

plugin.addTitles = function (data, callback) {
	if (titleMatch.test(data.fragment)) {
		data.parsed = '[[canned-responses:title]]';
	}

	callback(null, data);
};

module.exports = plugin;
