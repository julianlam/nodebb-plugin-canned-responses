<!-- IF responses.length -->
<div class="list-group">
	<!-- BEGIN responses -->
	<a href="#" class="list-group-item">
		<!-- IF !hideControls -->
		<div class="btn-group pull-right">
			<button type="button" class="btn btn-danger btn-xs" data-action="delete" data-response-id="{responses.id}"><i class="fa fa-times"></i> Delete</button>
		</div>
		<!-- ENDIF !hideControls -->
		<h4 class="list-group-item-heading">{responses.title}</h4>
		<p class="list-group-item-text"><pre>{responses.text}</pre></p>
	</a>
	<!-- END responses -->
</div>
<!-- ELSE -->
<div class="alert alert-info">
	You have no canned responses at the moment.
</div>
<!-- ENDIF responses.length -->