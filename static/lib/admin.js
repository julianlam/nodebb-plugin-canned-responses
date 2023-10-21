'use strict';

define('admin/plugins/canned-responses', ['settings', 'canned-responses', 'alerts'], function (Settings, cannedResponses, alerts) {
	var ACP = {};

	ACP.init = function () {
		cannedResponses.init();

		Settings.load('canned-responses:defaults', $('.canned-responses-defaults'));

		$('#save').on('click', function () {
			Settings.save('canned-responses:defaults', $('.canned-responses-defaults'), function () {
				alerts.alert({
					type: 'success',
					alert_id: 'canned-responses-saved',
					title: 'Settings Saved',
					message: 'Please reload your NodeBB to apply these settings',
					clickfn: function () {
						socket.emit('admin.reload');
					},
				});
			});
		});
	};

	return ACP;
});
