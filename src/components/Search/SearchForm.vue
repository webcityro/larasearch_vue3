<template>
	<form>
		<ul class="nav nav-tabs">
			<li class="nav-item">
				<a :class="['nav-link', {active: showForm}]" href="#" @click.prevent="showForm = !showForm"
					>Filter</a
				>
			</li>
		</ul>
		<div v-if="showForm" class="card card-body">
			<slot v-bind="slotParams">
				<!-- Dinamic fields -->
				<div
					class="form-group row position-relative"
					v-for="(input, field) in inputs"
					:key="field"
				>
					<label :for="field" class="col-sm-2 col-form-label">{{
						input.label
					}}</label>
					<div class="col-sm-10">
						<select
							v-if="input.type == 'select'"
							:id="field"
							class="form-control"
							v-model="fields.search[field]"
							@input="update(field)"
						>
							<option
								v-for="(l, v) in input.options"
								:key="field + '_' + v"
								:value="v"
								:selected="fields.search[field] == v"
							>
								{{ l }}
							</option>
						</select>
						<div
							v-else-if="input.type == 'radio'"
							v-for="(l, v) in input.options"
							:key="field + '_' + v"
							class="form-check"
						>
							<input
								class="form-check-input"
								type="radio"
								:name="field"
								:id="field + '_' + v"
								:value="v"
								:checked="fields.search[field] == v"
								@input="update(field)"
							/>
							<label class="form-check-label" :for="field + '_' + v">
								{{ l }}
							</label>
						</div>
						<div v-else-if="input.type == 'checkbox'" class="form-check">
							<checkbox
								class="form-check-input"
								:id="field"
								:unchecked-value="input.uncheckedValue"
								:checked="fields.search[field] != input.uncheckedValue"
								v-model="fields.search[field]"
								@change="update(field)"
							/>
							<label class="form-check-label" :for="field">
								{{ input.checkboxLabel || input.label }}
							</label>
						</div>
						<input
							v-else
							:type="input.type"
							:id="field"
							class="form-control"
							v-model="fields.search[field]"
							@input="update(field)"
						/>
						<i
							v-if="fields.search[field] && processing != field"
							class="far fa-times-circle field-icon"
							@click="clear({
								search: {
									...fields.search,
									[field]: ''
								}
							}, field)"
						></i>
						<i
							v-if="processing == field"
							class="fas fa-spinner fa-spin field-icon"
						></i>
					</div>
				</div>
				<!-- Dinamic fields -->

				<!-- Order and Per page -->
				<div class="form-row">
					<slot name="order-and-per-page" v-bind="slotParams">
						<!-- Order -->
						<div class="col">
							<label for="order_by">Order by:</label>
							<select
								id="order_by"
								class="form-control"
								v-model="fields.order_by"
								@input="update('order_by')"
							>
								<!-- eslint-disable-next-line -->
								<template v-for="(label, value) in orderBy" :key="value">
									<option :value="value+':asc'">{{ value }} Asc</option>
									<option :value="value+':desc'">{{ value }} Desc</option>
								</template>
							</select>
							<i
								v-if="fields.order_by != initialFields.order_by && processing != 'order_by'"
								class="far fa-times-circle opp-field-icon"
								@click="clear({
									...fields,
									order_by: initialFields.order_by
								}, 'order_by')"
							></i>
							<i
								v-if="processing == 'order_by'"
								class="fas fa-spinner fa-spin opp-field-icon"
							></i>
						</div>
						<!-- / Order -->

						<!-- Per page -->
						<div class="col">
							<label for="per_page">Per page:</label>
							<select
								id="per_page"
								class="form-control"
								v-model="fields.per_page"
								@input="update('per_page')"
							>
								<option
									v-for="value in $larasearch.perPage"
									:key="value"
									:value="value"
									:selected="fields.per_page == value"
								>{{ value }}</option>
							</select>
							<i
								v-if="fields.per_page != initialFields.per_page && processing != 'per_page'"
								class="far fa-times-circle opp-field-icon"
								@click="clear({
									...fields,
									per_page: initialFields.per_page
								}, 'per_page')"
							></i>
							<i
								v-if="processing == 'per_page'"
								class="fas fa-spinner fa-spin opp-field-icon"
							></i>
						</div>
						<!-- / Per page -->
					</slot>
				</div>
				<!-- / Order and Per page -->
			</slot>
			<!-- form reset -->
			<div v-if="showFormReset" class="row mt-2">
				<div class="col-12">
					<button
						type="button"
						class="btn btn-dark"
						@click="clear(initialFields, 'reset')"
						:disabled="processing"
					>
						Reset filter
						<i v-if="processing == 'reset'" class="fas fa-spinner fa-spin"></i>
						<i v-else class="far fa-times-circle"></i>
					</button>
				</div>
			</div>
			<!-- /form reset -->
		</div>
	</form>
</template>
<script>
import { debounce, isEqual } from "lodash";
import { mapGetters, mapActions } from "vuex";

export default {
	props: {
		group: { type: String, required: true },
		url: { type: String, required: true },
		method: { type: String, required: false, default: 'get' },
		params: { type: Object, required: true, default() { return {}; } },
		inputs: { type: Object, required: true },
		orderBy: { type: Object, required: true },
		dontSave: { type: Boolean, required: false, default: false },
	},

	data() {
		return {
			initialFields: {
				search: '',
				per_page: this.$larasearch.defaultPerPage,
				page: 1,
				order_by: 'id:desc',
				...this.params
			},
			fields: {},
			processing: false,
			showForm: false
		};
	},

	created() {
		this.fields = { ...this.initialFields };
		this.init({
			apiHeaders: this.$larasearch.apiHeaders,
			group: this.group,
			url: this.url,
			method: this.method,
			params: this.fields,
			orderByFields: this.orderBy,
			dontSave: this.dontSave
		}).then(params => {
			this.fields = params;
		});
	},

	methods: {
		...mapActions('larasearch', ['init', 'store', 'reset']),

		update: debounce(function (field) {
			this.change(field);
		}, 1000),

		change(field) {
			this.processing = field;
			this.store({
				group: this.group,
				params: this.fields
			}).then(() => (this.processing = false));
		},

		clear(fields, field) {
			this.processing = field;
			this.reset({
				group: this.group,
				params: { ...this.fields, ...fields }
			}).then(value => {
				this.fields = value;
				this.processing = false;
			});
		}
	},

	computed: {
		slotParams() {
			return {
				params: this.params,
				update: this.update,
				change: this.change,
				clear: this.clear,
				processing: this.processing
			};
		},

		showFormReset() {
			return !isEqual(this.fields, this.initialFields);
		}
	}
}
</script>

<style scoped>
	.field-icon, .opp-field-icon {
		position: absolute;
		display: block;
		top: calc((1.6em + 0.75rem + 2px) / 2 - 7.5px);
		right: calc((1.6em + 0.75rem + 2px) / 2 + 0.75rem);
		width: 15px;
		height: 15px;
	}

	.field-icon.fa-times-circle,
	.opp-field-icon.fa-times-circle {
		cursor: pointer;
		transition: color 350ms ease-in-out;
	}

	.field-icon.fa-times-circle:hover,
	.opp-field-icon.fa-times-circle:hover {
		color: var(--red);
	}

	.opp-field-icon {
		top: auto;
		bottom: calc((1.6em + 0.75rem + 2px) / 2 - 7.5px);
	}
</style>
