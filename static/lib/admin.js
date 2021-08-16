'use strict';

define('admin/plugins/canned-responses', ['settings', 'canned-responses'], function (Settings, cannedResponses) {
	var ACP = {};

	ACP.init = function () {
		cannedResponses.init();

		// $('#save').on('click', function() {
		// 	var payload = {};

		// 	$('.category-defaults select').each(function(idx, value) {
		// 		payload[this.getAttribute('data-cid')] = $(value).val() || '';
		// 	});

		// 	socket.emit('admin.settings.set', {
		// 		hash: 'canned-responses:defaults',
		// 		values: payload
		// 	}, function (err) {
		// 		app.alert({
		// 			title: 'Settings Saved',
		// 			type: 'success',
		// 			timeout: 2500
		// 		});
		// 	});
		// });
		Settings.load('canned-responses:defaults', $('.canned-responses-defaults'));

		$('#save').on('click', function () {
			Settings.save('canned-responses:defaults', $('.canned-responses-defaults'), function () {
				app.alert({
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
