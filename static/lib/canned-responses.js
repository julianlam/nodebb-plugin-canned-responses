'use strict';

define(['benchpress', 'bootbox', 'alerts'], (Benchpress, bootbox, alerts) => {
	const settings = {};

	settings.init = function () {
		$('button[data-action="create"]').on('click', () => {
			Benchpress.render('partials/canned-responses/update', {}).then((html) => {
				const modal = bootbox.dialog({
					title: 'Create New Response',
					message: html,
					buttons: {
						create: {
							label: 'Save Response',
							callback: settings.create,
						},
					},
				});

				modal.on('shown.bs.modal', () => {
					modal.find('form').on('submit', () => false);
				});
			});
		});

		$('button[data-action="edit"]').on('click', function () {
			const responseId = $(this).parents('.list-group-item').attr('data-response-id');

			$.get(`${config.relative_path}/api/user/${app.user.userslug}/canned-responses/${responseId}`).done((data) => {
				Benchpress.render('partials/canned-responses/update', data).then((html) => {
					const modal = bootbox.dialog({
						title: 'Edit Response',
						message: html,
						buttons: {
							create: {
								label: 'Save Response',
								callback: settings.edit,
							},
						},
					});

					modal.data('responseId', responseId);
				});
			});
		});

		$('button[data-action="delete"]').on('click', settings.delete);
	};

	settings.create = function (e) {
		const modal = $(e.target).parents('.modal');
		const formEl = modal.find('form');
		const payload = formEl.serializeObject();

		const payloadLen = formEl.find('[name="text"]').val().length;
		if (payloadLen > config.maximumPostLength) {
			alerts.error(`[[canned-responses:response-too-long, ${config.maximumPostLength}]]`);
			return false;
		}

		$.ajax({
			type: 'POST',
			url: window.location.href,
			data: payload,
			headers: {
				'x-csrf-token': config.csrf_token,
			},
		}).done(() => {
			ajaxify.refresh();
			modal.modal('hide');
		}).fail(() => {
			alerts.error('Could not save new response');
		});

		return false; // I normally use stopPropagation, but for bootbox that doesn't work...
	};

	settings.edit = function (e) {
		const modal = $(e.target).parents('.modal');
		const formEl = modal.find('form');
		const payload = formEl.serializeObject();
		const responseId = modal.data('responseId');

		const payloadLen = formEl.find('[name="text"]').val().length;
		if (payloadLen > config.maximumPostLength) {
			alerts.error(`[[canned-responses:response-too-long, ${config.maximumPostLength}]]`);
			return false;
		}

		$.ajax({
			type: 'PUT',
			url: `${window.location.pathname}/${responseId}`,
			data: payload,
			headers: {
				'x-csrf-token': config.csrf_token,
			},
		}).done(() => {
			ajaxify.refresh();
			modal.modal('hide');
		}).fail(() => {
			alerts.error('Could not update response');
		});
	};

	settings.delete = function () {
		const responseId = $(this).parents('.list-group-item').attr('data-response-id');
		bootbox.confirm('Are you sure you want to delete this response?', (confirm) => {
			if (confirm) {
				$.ajax({
					type: 'DELETE',
					url: `${window.location.href}/${responseId}`,
					headers: {
						'x-csrf-token': config.csrf_token,
					},
				}).done(() => {
					ajaxify.refresh();
				}).fail(() => {
					alerts.error('Could not delete response');
				});
			}
		});

		return false; // I normally use stopPropagation, but for bootbox that doesn't work...
	};

	return settings;
});
