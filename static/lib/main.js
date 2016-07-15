"use strict";

$(document).ready(function() {
	$(window).on('action:composer.enhanced', function() {
		require(['composer/formatting', 'composer/controls'], function(formatting, controls) {
			formatting.addButtonDispatch('canned-responses', function(textarea, selectionStart, selectionEnd) {
				$.get(RELATIVE_PATH + '/api/user/' + app.user.userslug + '/canned-responses').success(function(data) {
					data.hideControls = true;
	
					templates.parse('partials/canned-responses/list', data, function(html) {
						var insertIntoComposer = function(ev) {
								var responseText = submitEl.data('text');
								controls.insertIntoTextarea(textarea, responseText);
								controls.updateTextareaSelection(textarea, selectionStart, selectionStart + responseText.length);
							},
							modal = bootbox.dialog({
								title: 'Insert Canned Response',
								message: html,
								buttons: {
									insert: {
										label: 'Insert',
										className: 'btn-primary',
										callback: insertIntoComposer
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
	
						// Go back to focusing on the textarea after modal closes (since that action steals focus)
						modal.on('hidden.bs.modal', function() {
							$(textarea).focus();
						});
					});
				});
			});
		});
	});
});
