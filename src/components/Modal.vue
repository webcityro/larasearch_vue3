<template>
	<div v-if="display">
		<div class="modal fade show" tabindex="-1">
			<div :class="dialogCssClasses">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title">
							<slot name="title">
								<template v-if="icon">
									<i :class="icon"></i>&nbsp;&nbsp;
								</template>
								{{ title }}
							</slot>
						</h5>
						<button
							type="button"
							class="close"
							@click.prevent="cancel"
						>
							<span>&times;</span>
						</button>
					</div>
					<div class="modal-body">
						<slot></slot>
					</div>
					<div class="modal-footer">
						<slot name="buttons">
							<button
								type="button"
								:class="okButtonClass"
								@click.prevent="save"
							>
								<template v-if="showOkIcon">
									<i :class="okButtonIcon"></i>&nbsp;&nbsp;
								</template>
								<i
									v-else-if="showOkLoader"
									class="fas fa-spinner fa-spin"
								></i>
								{{ okButtonLabel }}
							</button>
							<button
								v-if="!noCancelButton"
								type="button"
								:class="cancelButtonClass"
								@click.prevent="cancel"
							>
								<template v-if="showCancelIcon">
									<i :class="cancelButtonIcon"></i>&nbsp;&nbsp;
								</template>
								<i
									v-else-if="showCancelLoader"
									class="fas fa-spinner fa-spin"
								></i>
								{{ cancelButtonLabel }}
							</button>
						</slot>
					</div>
				</div>
			</div>
		</div>
		<div class="modal-backdrop fade show"></div>
	</div>
</template>

<script>
import Helper from "../core/Helper";
import ApiCaller from "../core/ApiCaller";

export default {
	props: {
		show: { type: Boolean, required: false, default: false },
		processing: { required: false, default: false },
		closeOnSave: { type: Boolean, required: false, default: false },
		center: { type: Boolean, required: false, default: false },
		scrollable: { type: Boolean, required: false, default: false },
		size: { type: String, required: false, default: '' },
		title: { type: String, required: false, default: '' },
		icon: { type: String, required: false, default: '' },
		okButtonLabel: { type: String, required: false, default: 'Ok' },
		okButtonIcon: { type: String, required: false, default: '' },
		okButtonClass: { type: String, required: false, default: 'btn btn-primary' },
		cancelButtonLabel: { type: String, required: false, default: 'Cancel' },
		cancelButtonIcon: { type: String, required: false, default: '' },
		cancelButtonClass: { type: String, required: false, default: 'btn btn-secondary' },
		noCancelButton: { type: Boolean, required: false, default: false },
		url: { type: String, required: false },
		method: { type: String, required: false, default: 'GET' },
		fields: { type: Object, required: false, default: () => { return {}; } },
	},

	data() {
		return {
			display: this.show,
			loading: this.processing
		};
	},

	methods: {
		save() {
			if (Helper.isEmpty(this.url)) {
				return this.done();
			}

			this.loading = true;
			ApiCaller.request(this.url, this.method, this.fields)
				.then(({ data }) => {
					this.done(data, 'success');
				}).catch(({ error }) => {
					this.done(error, 'danger');
				});
		},

		done(data = '', type = '') {
			this.loading = false;

			if (data.message) {
				EventBus.emit('topAlert', {
					id: 'request-'+type,
					message: data.message,
					style: type
				});
			}

			this.$emit('save', data);
			this.$emit('ok', data);

			if (this.closeOnSave) {
				this.display = false;
			}
		},

		cancel() {
			this.$emit('cancel');
			this.display = false;
		}
	},

	computed: {
		dialogCssClasses() {
			return ['modal-dialog', {
				'modal-dialog-centered': this.center,
				'modal-dialog-scrollable': this.scrollable,
				'modal-sm': this.size == 'sm',
				'modal-lg': this.size == 'lg',
				'modal-xl': this.size == 'xl',
			}];
		},

		showOkIcon() {
			return this.okButtonIcon && !this.showOkLoader;
		},

		showOkLoader() {
			return this.loading === true || this.loading == 'save' || this.loading == 'saving' || this.loading == 'ok';
		},

		showCancelIcon() {
			return this.cancelButtonIcon && this.showCancelLoader;
		},

		showCancelLoader() {
			return this.loading == 'no' || this.loading == 'cancel' || this.loading == 'close';
		}
	},

	watch: {
		show(show) {
			this.display = show;
		},

		processing(processing) {
			this.loading = processing;
		}
	}
}
</script>

<style scoped>
	.show {
		display: block;
	}
</style>
