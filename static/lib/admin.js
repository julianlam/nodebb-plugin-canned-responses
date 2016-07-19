'use strict';
/* globals $, app, socket */

define('admin/plugins/canned-responses', ['settings', 'canned-responses'], function(Settings, cannedResponses) {

	var ACP = {};

	ACP.init = function() {
		cannedResponses.init();
		// Settings.load('canned-responses', $('.canned-responses-settings'));

		// $('#save').on('click', function() {
		// 	Settings.save('canned-responses', $('.canned-responses-settings'), function() {
		// 		app.alert({
		// 			type: 'success',
		// 			alert_id: 'canned-responses-saved',
		// 			title: 'Settings Saved',
		// 			message: 'Please reload your NodeBB to apply these settings',
		// 			clickfn: function() {
		// 				socket.emit('admin.reload');
		// 			}
		// 		});
		// 	});
		// });
	};

	return ACP;
});