define('forum/account/canned-responses', ['csrf', 'vendor/jquery/serializeObject/jquery.ba-serializeobject.min'], function(csrf) {
	var settings = {};

	settings.init = function() {
		$('button[data-action="create"]').on('click', function() {
			templates.parse('partials/canned-responses/create', {}, function(html) {
				bootbox.dialog({
					title: 'Create New Response',
					message: html,
					buttons: {
						create: {
							label: 'Save Response',
							callback: settings.create
						}
					}
				});
			});
		});

		$('button[data-action="delete"]').on('click', settings.delete);
	};

	settings.create = function(e) {
		var modal = $(e.target).parents('.modal'),
			formEl = modal.find('form'),
			payload = formEl.serializeObject();

		$.ajax({
			type: 'POST',
			url: window.location.href,
			data: payload,
			headers: {
				'x-csrf-token': csrf.get()
			}
		}).success(function() {
			ajaxify.refresh();
			modal.modal('hide');
		}).error(function(e) {
			app.alertError('Could not save new response');
		});

		return false;	// I normally use stopPropagation, but for bootbox that doesn't work...
	};

	settings.delete = function() {
		$.ajax({
			type: 'DELETE',
			url: window.location.href + '/' + $(this).attr('data-response-id'),
			headers: {
				'x-csrf-token': csrf.get()
			}
		}).success(function() {
			ajaxify.refresh();
			modal.modal('hide');
		}).error(function(e) {
			app.alertError('Could not delete response');
		});

		return false;	// I normally use stopPropagation, but for bootbox that doesn't work...
	};

	return settings;
});