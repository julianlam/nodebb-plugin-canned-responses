<div class="row">
	<div class="col-sm-2 col-xs-12 settings-header">Site-wide Responses</div>
	<div class="col-sm-10 col-xs-12">
		<p class="lead">
			Canned Responses defined here will be available to all users
		</p>
		<!-- IMPORT partials/canned-responses/list.tpl -->
	</div>
</div>

<div class="row">
	<div class="col-sm-2 col-xs-12 settings-header">Category Defaults</div>
	<div class="col-sm-10 col-xs-12">
		<p class="lead">
			Optionally, you may assign a global canned response to be the default text when creating a new post in a category.
		</p>
		<div class="row category-defaults">
			<form role="form" class="canned-responses-defaults">
				<!-- BEGIN categories -->
				<div class="form-group col-sm-4 col-xs-6">
					<label for="{../cid}">{../name}</label>
					<select data-cid="{../cid}" id="{../cid}" name="{../cid}" title="{../name}" class="form-control">
						<option value="">None</option>
						<!-- BEGIN responses -->
						<option value="{../id}">{../title}</option>
						<!-- END responses -->
					</select>
				</div>
				<!-- END categories -->
			</form>
		</div>
	</div>
</div>

<div class="floating-button">
	<button id="add" class="success mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored" data-action="create">
		<i class="material-icons">note_add</i>
	</button>
	<button id="save" class="primary btn-primary mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored">
		<i class="material-icons">save</i>
	</button>
</div>