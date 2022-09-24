<template>
	<div>
		<input type="checkbox" v-bind="$attrs" @change="update">
	</div>
</template>

<script>
export default {
	model: {
		prop: 'value',
		event: 'change'
	},

	props: {
		value: { required: false, default: '' },
		uncheckedValue: { type: [String, Number, Boolean, Array, Object], required: false }
	},

	methods: {
		update(e) {
			this.$emit('change', e.target.checked ? this.value : this.uncheckedValue);
		}
	}
}
</script>

<style>

</style>
