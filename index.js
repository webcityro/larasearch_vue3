import SearchForm from "./src/components/Search/SearchForm.vue";
import SearchResults from "./src/components/Search/SearchResults.vue";
import SearchPagination from "./src/components/Search/SearchPagination.vue";
import StoreModule from "./src/store/Larasearch";

const LarasearchVue = {
	install(vue, options) {
		if (!options.store) {
			throw new Error(
				"You need to pass the vuex store to the larasearch plugin as { store: MyStore }"
			);
		}

		const config = {
			apiConfig: {},
			...(window.Larasearch || {}),
			...(options || {
				mixin: async () => (await import(/* @vite-ignore */"./src/mixins/SearchMixin.vue")).default,
			}),
		};
		delete config.store;

		options.store.registerModule("larasearch", StoreModule);

		vue.mixin(config.mixin);
		vue.config.globalProperties.$larasearch = config;
		vue.component("LarasearchForm", SearchForm);
		vue.component("LarasearchResults", SearchResults);
		vue.component("LarasearchPagination", SearchPagination);
	},
};

export default LarasearchVue;
