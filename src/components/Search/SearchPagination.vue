 <template>
	<nav v-if="show" :class="navCssClasses">
		<ul class="pagination">
			<!-- First Page Link -->
			<template v-if="showFirstAndLast">
				<li v-if="onFirstPage" class="page-item disabled" aria-disabled="true" aria-label="First page">
					<span class="page-link" aria-hidden="true">
						<i v-if="loading == 'first'" class="fas fa-spinner fa-spin"></i>
						<template v-else>&laquo;</template>
					</span>
				</li>
				<li v-else class="page-item">
					<a class="page-link" @click.prevent="goToFirst" rel="first" aria-label="First page">
						<i v-if="loading == 'first'" class="fas fa-spinner fa-spin"></i>
						<template v-else>&laquo;</template>
					</a>
				</li>
			</template>

			<!-- Previous Page Link -->
			<li v-if="onFirstPage" class="page-item disabled" aria-disabled="true" aria-label="Prev page">
				<span class="page-link" aria-hidden="true">
					<i v-if="loading == 'prev'" class="fas fa-spinner fa-spin"></i>
					<template v-else>&lsaquo;</template>
				</span>
			</li>
			<li v-else class="page-item">
				<a class="page-link" @click.prevent="goToPrev" rel="prev" aria-label="Prev page">
					<i v-if="loading == 'prev'" class="fas fa-spinner fa-spin"></i>
					<template v-else>&lsaquo;</template>
				</a>
			</li>

			<!-- Pagination Elements -->
			<li
				v-for="(page, i) in pagination"
				:key="i"
				:class="[
					'page-item',
					{
						active: page.type === 'current',
						disabled: page.type === 'elipse'
					}
				]"
			>
				<span v-if="page.type === 'elipse'"	class="page-link">...</span>
				<span
					v-else-if="page.type === 'current'"
					class="page-link"
				>
					<i v-if="loading == page.number" class="fas fa-spinner fa-spin"></i>
					<template v-else>{{ page.number }}</template>
				</span>
				<a
					v-else-if="page.type === 'page'"
					class="page-link"
					@click.prevent="goTo(page.number)"
				>{{ page.number }}</a>
			</li>

			<!-- Next Page Link -->
			<li v-if="hasNextPage" class="page-item">
				<a class="page-link" @click.prevent="goToNext" rel="next" aria-label="Next page">
					<i v-if="loading == 'next'" class="fas fa-spinner fa-spin"></i>
					<template v-else>&rsaquo;</template>
				</a>
			</li>
			<li v-else class="page-item disabled" aria-disabled="true" aria-label="Next page">
				<span class="page-link" aria-hidden="true">
					<i v-if="loading == 'next'" class="fas fa-spinner fa-spin"></i>
					<template v-else>&rsaquo;</template>
				</span>
			</li>

			<!-- Last Page Link -->
			<template v-if="showFirstAndLast">
				<li v-if="hasNextPage" class="page-item">
					<a class="page-link" @click.prevent="goToLast" rel="last" aria-label="Last page">
						<i v-if="loading == 'last'" class="fas fa-spinner fa-spin"></i>
						<template v-else>&raquo;</template>
					</a>
				</li>
				<li v-else class="page-item disabled" aria-disabled="true" aria-label="Last page">
					<span class="page-link" aria-hidden="true">
						<i v-if="loading == 'last'" class="fas fa-spinner fa-spin"></i>
						<template v-else>&raquo;</template>
					</span>
				</li>
			</template>
		</ul>
	</nav>
</template>

<script>
import { mapState, mapGetters, mapActions } from "vuex";

export default {
	props: {
		group: { type: String, required: true },
		align: { type: String, required: false, default: 'left' },
		alwaysShow: { type: Boolean, required: false, default: false },
		showFirstAndLast: { type: Boolean, required: false, default: false },
		maxPagesShowing: { type: Number, required: false, default: 10 },
		range: { type: Number, required: false, default: 3 }
	},

	data() {
		return {
			loading: 0
		};
	},

	methods: {
		...mapActions('larasearch', ['store']),

		goTo(page = null, pageName = false) {
			if (!page || page === this.current || this.loading !== 0) {
				return;
			}

			this.loading = pageName || page;

			this.store({
				group: this.group,
				params: {
					...this.params[this.group],
					page
				}
			}).then(() => this.loading = 0);
		},

		goToFirst() {
			this.goTo(1, 'first');
		},

		goToPrev() {
			this.goTo(this.prev, 'prev');
		},

		goToNext() {
			this.goTo(this.next, 'next');
		},

		goToLast() {
			this.goTo(this.totalPages, 'last');
		},

		change(event) {
			this.goTo(event.target.value);
		}
	},

	computed: {
		...mapState('larasearch', ['params']),
		...mapGetters('larasearch', [
			'currentPage',
			'prevPage',
			'nextPage',
			'lastPage'
		]),

		onFirstPage() {
			return this.current === 1;
		},

		hasNextPage() {
			return this.current < this.totalPages;
		},

		current() {
			return this.currentPage(this.group);
		},

		prev() {
			return this.prevPage(this.group);
		},

		next() {
			return this.nextPage(this.group);
		},

		totalPages() {
			return this.lastPage(this.group);
		},

		hasPages() {
			return this.totalPages > 1;
		},

		startPage() {
			const startPage = this.current <= this.range ? 1 : this.current - this.range;
			const startLimit = this.totalPages - this.maxPagesShowing + 1;

			return this.isFullPagination ? (
				startPage <= startLimit ? startPage : startLimit
			) : 1;
		},

		endPage() {
			return this.isFullPagination ? (
				Number(this.startPage) + Number(this.maxPagesShowing) - 1
			) : this.totalPages;
		},

		isFullPagination() {
			return this.maxPagesShowing <= this.totalPages;
		},

		pagination() {
			const pages = [];

			if (this.startPage > this.range) {
				pages.push({
					number: '',
					type: 'elipse'
				});
			}

			for (let i = this.startPage; i <= this.endPage; i++) {
				pages.push({
					number: i,
					type: this.current !== i ? 'page' : 'current'
				});
			}

			if (this.endPage < this.totalPages) {
				pages.push({
					number: '',
					type: 'elipse'
				});
			}

			return pages;
		},

		show() {
			return this.hasPages || this.alwaysShow;
		},

		navCssClasses() {
			return [
				'd-flex',
				{
					'justify-content-start': this.align == 'left',
					'justify-content-center': this.align == 'center',
					'justify-content-end': this.align == 'right',
				}
			];
		}
	},

	watch: {}
};
 </script>

 <style>
</style>
