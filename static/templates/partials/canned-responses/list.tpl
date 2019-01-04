<!-- IF responses.length -->
<div class="list-group canned-responses-list">
	<!-- BEGIN responses -->
	<div class="list-group-item" data-response-id="{responses.id}">
		<!-- IF !hideControls -->
		<div class="btn-group pull-right">
			<button type="button" class="btn btn-default btn-xs" data-action="edit"><i class="fa fa-edit"></i> Edit</button>
			<button type="button" class="btn btn-danger btn-xs" data-action="delete"><i class="fa fa-times"></i> Delete</button>
		</div>
		<!-- ENDIF !hideControls -->
		<input type="hidden" value="{responses.text}" />
		<h4 class="list-group-item-heading">{responses.title}</h4>
		<p class="list-group-item-text">{responses.html}</p>
	</div>
	<!-- END responses -->
</div>
<!-- ELSE -->
<div class="alert alert-info">
	You have no canned responses at the moment.
</div>
<!-- ENDIF responses.length -->