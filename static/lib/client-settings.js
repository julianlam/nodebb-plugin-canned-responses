'use strict';

define('forum/account/canned-responses', ['canned-responses'], function (cannedResponses) {
	const settings = {};

	settings.init = cannedResponses.init;
	return settings;
});
