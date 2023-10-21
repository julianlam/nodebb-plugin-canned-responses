'use strict';

$(document).ready(() => {
	let defaults;

	$.get(`${config.relative_path}/canned-responses/defaults`, (data) => {
		defaults = data;
	});

	$(window).on('action:composer.loaded', (evt, data) => {
		require(['composer/controls'], (controls) => {
			const cid = parseInt(data.composerData.cid, 10);
			const textarea = $(`.composer[data-uuid="${data.post_uuid}"] textarea`);
			if (defaults[cid]) {
				controls.insertIntoTextarea(textarea, defaults[cid]);
			}
		});
	});

	$(window).on('action:composer.changeCategory', (evt, data) => {
		require(['composer/controls', 'alerts'], (controls, alerts) => {
			const cid = parseInt(data.cid, 10);
			const uuid = data.postContainer.get(0).getAttribute('data-uuid');
			const textarea = $(`.composer[data-uuid="${uuid}"] textarea`).get(0);
			const okToClobber = textarea.value === '' || Object.values(defaults).some(text => text === textarea.value);

			if (defaults[cid]) {
				if (okToClobber) {
					textarea.value = '';
					controls.insertIntoTextarea(textarea, defaults[cid]);
				} else {
					alerts.alert({
						alert_id: 'canned_response_clobber_warning',
						title: 'Note',
						message: 'Default text is being suggested, but you already have text here. Click here to append the suggested text.',
						timeout: 5000,
						clickfn: function () {
							controls.insertIntoTextarea(textarea, `\n\n${defaults[cid]}`);
						},
					});
				}
			}
		});
	});

	$(window).on('action:composer.enhanced', () => {
		require(['composer/formatting', 'composer/controls'], (formatting, controls) => {
			formatting.addButtonDispatch('canned-responses', function (textarea, selectionStart) {
				// Context for Quill, etc.
				const context = this;

				openModal(function () {
					const submitEl = this.find('.btn-primary').attr('disabled', 'disabled');
					const responseText = submitEl.data('text');
					controls.insertIntoTextarea.bind(context)(textarea, responseText);
					controls.updateTextareaSelection
						.bind(context)(textarea, selectionStart, selectionStart + responseText.length);

					// Go back to focusing on the textarea after modal closes (since that action steals focus)
					this.one('hidden.bs.modal', () => {
						$(textarea).focus();
					});
				});
			});
		});
	});

	$(window).on('action:composer.loaded', () => {
		if ($.Redactor && $.Redactor.opts.plugins.indexOf('canned-responses') === -1) {
			$.Redactor.opts.plugins.push('canned-responses');
		}
	});

	$(window).on('action:redactor.load', () => {
		$.Redactor.prototype['canned-responses'] = function () {
			return {
				init: function () {
					const button = this.button.add('canned-responses', 'Add Canned Response');
					this.button.setIcon(button, '<i class="fa fa-bullhorn"></i>');
					this.button.addCallback(button, this['canned-responses'].onClick);
				},
				onClick: function () {
					const redactor = this;
					openModal(function () {
						const submitEl = this.find('.btn-primary').attr('disabled', 'disabled');
						const responseText = submitEl.data('text');

						redactor.insert.html(`<p>${responseText}</p>`);
					});
				},
			};
		};
	});

	function openModal(callback) {
		require(['benchpress'], (Benchpress) => {
			$.get(`${config.relative_path}/canned-responses`).done((data) => {
				data.hideControls = true;

				Benchpress.parse('partials/canned-responses/list', data, (html) => {
					const modal = bootbox.dialog({
						title: 'Insert Canned Response',
						size: 'large',
						message: html,
						buttons: {
							insert: {
								label: 'Insert',
								className: 'btn-primary',
								callback: function () {
									callback.call(this);
								},
							},
						},
					});
					const submitEl = modal.find('.btn-primary').attr('disabled', 'disabled');

					modal.find('.list-group').on('click', '.list-group-item', function () {
						const responseEl = $(this);
						responseEl.siblings().removeClass('active');
						responseEl.addClass('active');

						submitEl.data('text', ($(this).find('input[type="hidden"]').val()));
						submitEl.removeAttr('disabled');
					});
				});
			});
		});
	}
});
