'use strict';
/* globals define, templates, bootbox, RELATIVE_PATH, config, ajaxify, app */

define(['vendor/jquery/serializeObject/jquery.ba-serializeobject.min'], function() {
	var settings = {};

	settings.init = function() {
		$('button[data-action="create"]').on('click', function() {
			templates.parse('partials/canned-responses/update', {}, function(html) {
				var modal = bootbox.dialog({
					title: 'Create New Response',
					message: html,
					buttons: {
						create: {
							label: 'Save Response',
							callback: settings.create
						}
					}
				});

				modal.on('shown.bs.modal', function () {
					modal.find('form').on('submit', function () {
						return false;
					});
				});
			});
		});

		$('button[data-action="edit"]').on('click', function() {
			var responseId = $(this).parents('.list-group-item').attr('data-response-id');

			$.get(config.relative_path + '/api/user/' + app.user.userslug + '/canned-responses/' + responseId).done(function(data) {
				templates.parse('partials/canned-responses/update', data, function(html) {
					var modal = bootbox.dialog({
						title: 'Edit Response',
						message: html,
						buttons: {
							create: {
								label: 'Save Response',
								callback: settings.edit
							}
						}
					});

					modal.data('responseId', responseId);
				});
			});
		});

		$('button[data-action="delete"]').on('click', settings.delete);
	};

	settings.create = function(e) {
		var modal = $(e.target).parents('.modal'),
			formEl = modal.find('form'),
			payload = formEl.serializeObject();

		var payloadLen = formEl.find('[name="text"]').val().length;
		if (payloadLen > config.maximumPostLength) {
			app.alertError('[[canned-responses:response-too-long, ' + config.maximumPostLength + ']]');
			return false;
		}

		$.ajax({
			type: 'POST',
			url: window.location.href,
			data: payload,
			headers: {
				'x-csrf-token': config.csrf_token
			}
		}).done(function() {
			ajaxify.refresh();
			modal.modal('hide');
		}).fail(function() {
			app.alertError('Could not save new response');
		});

		return false;	// I normally use stopPropagation, but for bootbox that doesn't work...
	};

	settings.edit = function(e) {
		var modal = $(e.target).parents('.modal'),
			formEl = modal.find('form'),
			payload = formEl.serializeObject(),
			responseId = modal.data('responseId');

		var payloadLen = formEl.find('[name="text"]').val().length;
		if (payloadLen > config.maximumPostLength) {
			app.alertError('[[canned-responses:response-too-long, ' + config.maximumPostLength + ']]');
			return false;
		}

		$.ajax({
			type: 'PUT',
			url: window.location.href + '/' + responseId,
			data: payload,
			headers: {
				'x-csrf-token': config.csrf_token
			}
		}).done(function() {
			ajaxify.refresh();
			modal.modal('hide');
		}).fail(function() {
			app.alertError('Could not update response');
		});
	};

	settings.delete = function() {
		var responseId = $(this).parents('.list-group-item').attr('data-response-id');
		bootbox.confirm('Are you sure you want to delete this response?', function(confirm) {
			if (confirm) {
				$.ajax({
					type: 'DELETE',
					url: window.location.href + '/' + responseId,
					headers: {
						'x-csrf-token': config.csrf_token
					}
				}).done(function() {
					ajaxify.refresh();
				}).fail(function(e) {
					app.alertError('Could not delete response');
				});
			}
		});

		return false;	// I normally use stopPropagation, but for bootbox that doesn't work...
	};

	return settings;
});
