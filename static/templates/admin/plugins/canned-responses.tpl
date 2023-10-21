<div class="acp-page-container">
	<div component="settings/main/header" class="row border-bottom py-2 m-0 sticky-top acp-page-main-header align-items-center">
		<div class="col-12 col-md-8 px-0 mb-1 mb-md-0">
			<h4 class="fw-bold tracking-tight mb-0">{title}</h4>
		</div>
		<div class="col-12 col-md-4 px-0 px-md-3 text-end">
			<button id="add" class="btn btn-light btn-sm fw-semibold ff-secondary text-center" data-action="create">[[admin/admin:add]]</button>
			<button id="save" class="btn btn-primary btn-sm fw-semibold ff-secondary text-center text-nowrap">[[admin/admin:save-changes]]</button>
		</div>
	</div>

	<div class="row m-0">
		<div id="spy-container" class="col-12 col-md-8 px-0 mb-4" tabindex="0">
			<div id="site-wide-responses" class="mb-4">
				<h5 class="fw-bold tracking-tight settings-header">Site-wide Responses</h5>
				<div class="mb-3">
					<p class="lead">
						Canned Responses defined here will be available to all users
					</p>
					<!-- IMPORT partials/canned-responses/list.tpl -->
				</div>
			</div>

			<hr/>

			<div id="category-defaults" class="mb-4">
				<h5 class="fw-bold tracking-tight settings-header">Category Defaults</h5>
				<div class="mb-3">
					<p class="lead">
						Optionally, you may assign a global canned response to be the default text when creating a new post in a category.
					</p>
					<div class="category-defaults">
						<form role="form" class="canned-responses-defaults row">
							{{{ each categories }}}
							<div class="mb-2 col-6">
								<label class="form-label" for="{./cid}">{./name}</label>
								<select data-cid="{./cid}" id="{./cid}" name="{./cid}" title="{./name}" class="form-select">
									<option value="">None</option>
									{{{ each responses }}}
									<option value="{./id}">{./title}</option>
									{{{ end }}}
								</select>
							</div>
							{{{ end }}}
						</form>
					</div>
				</div>
			</div>
		</div>

		<!-- IMPORT admin/partials/settings/toc.tpl -->
	</div>
</div>
