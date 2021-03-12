<template>
	<div>
		<div v-if="isLoading" class="text-center">
			<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto; background: none; display: block; shape-rendering: auto;" width="397px" height="397px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
				<circle cx="50" cy="50" r="32" stroke-width="8" stroke="#93dbe9" stroke-dasharray="50.26548245743669 50.26548245743669" fill="none" stroke-linecap="round">
					<animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" keyTimes="0;1" values="0 50 50;360 50 50"></animateTransform>
				</circle>
			</svg>
		</div>
		<h3 v-else-if="currentTotal == 0" class="text-center">
			No {{ groupLabel || 'record' }}s found.
		</h3>
		<slot
			v-else
			:params="currentParams"
			:total="currentTotal"
			:records="currentRecords"
			:edit="edit"
			:destroy="destroy"
		></slot>

		<modal
			title="Warning!"
			:show="deleteRecord != null"
			:url="deleteRecord ? deleteRecord.destroyURL : ''"
			method="DELETE"
			@save="deleteRecord = null, fetch(group)"
			@cancel="deleteRecord = null"
			okButtonLabel="Delete"
			okButtonClass="btn btn-danger"
			okButtonIcon="fas fa-trash-alt"
			cancelButtonLabel="Cancel"
			cancelButtonClass="btn btn-primary"
			cancelButtonIcon="fas fa-times"
		>
			<p>{{ deleteMsg }}</p>
		</modal>
	</div>
</template>

<script>
import { mapState, mapGetters, mapActions } from "vuex";

export default {
	props: {
		group: { type: String, required: true },
		groupLabel: { type: String, required: false }
	},

	data() {
		return {
			deleteRecord: null
		};
	},

	methods: {
		...mapActions('larasearch', ['fetch']),

		edit(record) {
			EventBus.emit('editForm_'+this.group, record);
		},

		destroy(record) {
			this.deleteRecord = record;
		}
	},

	computed: {
		...mapState('larasearch', ['params', 'records']),
		...mapGetters('larasearch', ['total', 'loading']),

		currentParams() {
			return this.params[this.group];
		},

		currentRecords() {
			return this.records[this.group] || [];
		},

		currentTotal() {
			return this.total(this.group);
		},

		isLoading() {
			return this.loading(this.group);
		},

		deleteMsg() {
			return this.deleteRecord ? 'Are you sure theat you wanna delete the '+(this.groupLabel || 'item')+' "'+this.deleteRecord.name+'"?' : '';
		}
	}
}
</script>
