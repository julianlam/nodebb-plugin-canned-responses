"use strict";
/* globals bootbox, config */

$(document).ready(function() {
	var defaults;

	$.get(config.relative_path + '/canned-responses/defaults', function(data) {
		defaults = data;
	});

	$(window).on('action:composer.loaded', function(e, data) {
		require(['composer/controls'], function(controls) {
			var cid = parseInt(data.composerData.cid, 10);
			var textarea = $('.composer[data-uuid="' + data.post_uuid + '"] textarea');
			if (defaults[cid]) {
				controls.insertIntoTextarea(textarea, defaults[cid]);
			}
		});
	});

	$(window).on('action:composer.changeCategory', function(e, data) {
		require(['composer/controls', 'alerts'], function(controls, alerts) {
			var cid = parseInt(data.cid, 10);
			var uuid = data.postContainer.get(0).getAttribute('data-uuid');
			var textarea = $('.composer[data-uuid="' + uuid + '"] textarea').get(0);
			var okToClobber = textarea.value === '' || Object.values(defaults).some(function (text) {
				return text === textarea.value;
			});

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
							controls.insertIntoTextarea(textarea, '\n\n' + defaults[cid]);
						}
					});
				}
			}
		});
	});

	require(['composer/formatting', 'composer/controls'], function(formatting, controls) {
		$(window).on('action:composer.enhanced', function() {
			formatting.addButtonDispatch('canned-responses', function(textarea, selectionStart, selectionEnd) {
				// Context for Quill, etc.
				var context = this;

				openModal(function () {
					var submitEl = this.find('.btn-primary').attr('disabled', 'disabled');
					var responseText = submitEl.data('text');
					controls.insertIntoTextarea.bind(context)(textarea, responseText);
					controls.updateTextareaSelection.bind(context)(textarea, selectionStart, selectionStart + responseText.length);

					// Go back to focusing on the textarea after modal closes (since that action steals focus)
					this.one('hidden.bs.modal', function() {
						$(textarea).focus();
					});
				})
			});
		});
	});

	$(window).on('action:composer.loaded', function (ev, data) {
        if ($.Redactor && $.Redactor.opts.plugins.indexOf('canned-responses') === -1) {
            $.Redactor.opts.plugins.push('canned-responses');
        }
    });

	$(window).on('action:redactor.load', function () {
        $.Redactor.prototype['canned-responses'] = function () {
            return {
                init: function () {
                    var button = this.button.add('canned-responses', 'Add Canned Response');
                    this.button.setIcon(button, '<i class="fa fa-bullhorn"></i>');
                    this.button.addCallback(button, this['canned-responses'].onClick);
                },
                onClick: function () {
					var redactor = this;
					openModal(function () {
						var submitEl = this.find('.btn-primary').attr('disabled', 'disabled');
						var responseText = submitEl.data('text');

						redactor.insert.html('<p>' + responseText + '</p>');
					});
                }
            };
        };
    });

	function openModal (callback) {
		$.get(RELATIVE_PATH + '/canned-responses').done(function(data) {
			data.hideControls = true;

			templates.parse('partials/canned-responses/list', data, function(html) {
				var modal = bootbox.dialog({
						title: 'Insert Canned Response',
						message: html,
						buttons: {
							insert: {
								label: 'Insert',
								className: 'btn-primary',
								callback: function () {
									callback.call(this)
								}
							}
						}
					}),
					submitEl = modal.find('.btn-primary').attr('disabled', 'disabled');

				modal.find('.list-group').on('click', '.list-group-item', function() {
					var responseEl = $(this);
					responseEl.siblings().removeClass('active');
					responseEl.addClass('active');

					submitEl.data('text', ($(this).find('input[type="hidden"]').val()));
					submitEl.removeAttr('disabled');
				});
			});
		});
	};
});
