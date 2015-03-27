<form role="form">
	<fieldset>
		<div class="form-group">
			<label for="title">Response Title</label>
			<input class="form-control" type="text" id="title" name="title" value="{title}" />
			<p class="help-block">
				A short title that will be used to refer to this canned response. The title will not be
				shown in the post.
			</p>
		</div>
		<div class="form-group">
			<label for="text">Response Text</label>
			<textarea class="form-control" type="text" id="text" name="text" rows="15">{text}</textarea>
		</div>
	</fieldset>
</form>