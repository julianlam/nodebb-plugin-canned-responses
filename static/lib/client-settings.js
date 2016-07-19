define('forum/account/canned-responses', ['canned-responses'], function(cannedResponses) {
	var settings = {};

	settings.init = function() {
		cannedResponses.init();
	};

	return settings;
});